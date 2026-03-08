package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/singleflight"
)

// ErrCacheMiss is returned when a key is not found in cache.
var ErrCacheMiss = errors.New("cache: miss")

// staleTTLMultiplier determines the stale copy TTL relative to primary TTL.
const staleTTLMultiplier = 6 // 5min * 6 = 30min stale TTL

// Cache wraps a Redis client with JSON serialization, TTL management,
// stale-copy fallback for graceful degradation, and singleflight dedup.
type Cache struct {
	rdb *redis.Client
	sf  singleflight.Group
}

// NewCache creates a new Cache from a Redis URL (e.g., "redis://localhost:6379").
func NewCache(redisURL string) (*Cache, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("parse redis url: %w", err)
	}

	rdb := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping: %w", err)
	}

	return &Cache{rdb: rdb}, nil
}

// Get retrieves a cached value by key into dest. Returns ErrCacheMiss if not found.
// Uses singleflight to prevent cache stampede on concurrent requests for the same key.
func (c *Cache) Get(ctx context.Context, key string, dest any) error {
	val, err, _ := c.sf.Do(key, func() (any, error) {
		data, err := c.rdb.Get(ctx, key).Bytes()
		if errors.Is(err, redis.Nil) {
			return nil, ErrCacheMiss
		}
		if err != nil {
			return nil, fmt.Errorf("cache get %s: %w", key, err)
		}
		return data, nil
	})
	if err != nil {
		return err
	}

	data, ok := val.([]byte)
	if !ok || data == nil {
		return ErrCacheMiss
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return fmt.Errorf("cache unmarshal %s: %w", key, err)
	}
	return nil
}

// GetStale retrieves the stale fallback copy of a key. Used for graceful degradation
// when the primary cache has expired but a longer-lived stale copy still exists.
func (c *Cache) GetStale(ctx context.Context, key string, dest any) error {
	staleKey := key + ":stale"
	data, err := c.rdb.Get(ctx, staleKey).Bytes()
	if errors.Is(err, redis.Nil) {
		return ErrCacheMiss
	}
	if err != nil {
		return fmt.Errorf("cache get stale %s: %w", staleKey, err)
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return fmt.Errorf("cache unmarshal stale %s: %w", staleKey, err)
	}
	return nil
}

// Set stores a value with the given TTL. Also writes a stale copy with a longer TTL
// (staleTTLMultiplier * ttl) for graceful degradation fallback.
func (c *Cache) Set(ctx context.Context, key string, val any, ttl time.Duration) error {
	data, err := json.Marshal(val)
	if err != nil {
		return fmt.Errorf("cache marshal %s: %w", key, err)
	}

	pipe := c.rdb.Pipeline()
	pipe.Set(ctx, key, data, ttl)
	pipe.Set(ctx, key+":stale", data, ttl*staleTTLMultiplier)

	_, err = pipe.Exec(ctx)
	if err != nil {
		return fmt.Errorf("cache set %s: %w", key, err)
	}
	return nil
}

// DeletePattern removes all keys matching the given glob pattern using SCAN + DEL.
// Also deletes corresponding stale copies.
func (c *Cache) DeletePattern(ctx context.Context, pattern string) error {
	var cursor uint64
	for {
		keys, next, err := c.rdb.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return fmt.Errorf("cache scan %s: %w", pattern, err)
		}

		if len(keys) > 0 {
			// Collect stale keys too
			allKeys := make([]string, 0, len(keys)*2)
			for _, k := range keys {
				allKeys = append(allKeys, k, k+":stale")
			}
			if err := c.rdb.Del(ctx, allKeys...).Err(); err != nil {
				return fmt.Errorf("cache del: %w", err)
			}
		}

		cursor = next
		if cursor == 0 {
			break
		}
	}
	return nil
}
