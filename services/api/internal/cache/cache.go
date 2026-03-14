package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/dgraph-io/ristretto"
	"github.com/redis/go-redis/v9"
)

// Cache provides two-tier caching: L1 (ristretto in-process) + L2 (Redis).
type Cache struct {
	client *redis.Client
	l1     *ristretto.Cache
	l1TTL  time.Duration
}

// NewCache creates a new Cache connected to the given Redis URL with L1 ristretto.
func NewCache(redisURL string) (*Cache, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("parse redis url: %w", err)
	}
	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping: %w", err)
	}

	l1, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,     // 10M counters for admission
		MaxCost:     1 << 26, // 64MB max
		BufferItems: 64,
	})
	if err != nil {
		return nil, fmt.Errorf("ristretto init: %w", err)
	}

	return &Cache{
		client: client,
		l1:     l1,
		l1TTL:  1 * time.Minute,
	}, nil
}

// Get retrieves a cached value. Checks L1 first, then L2 (Redis).
// On L2 hit, populates L1 for future requests.
func (c *Cache) Get(ctx context.Context, key string, dest any) error {
	// L1 check
	if val, found := c.l1.Get(key); found {
		if data, ok := val.([]byte); ok {
			return json.Unmarshal(data, dest)
		}
	}

	// L2 (Redis) fallback
	val, err := c.client.Get(ctx, key).Result()
	if err != nil {
		return err
	}

	// Populate L1 on L2 hit
	c.l1.SetWithTTL(key, []byte(val), int64(len(val)), c.l1TTL)

	return json.Unmarshal([]byte(val), dest)
}

// GetStale retrieves a stale cached value (stored with a longer TTL under a :stale suffix).
func (c *Cache) GetStale(ctx context.Context, key string, dest any) error {
	return c.Get(ctx, key+":stale", dest)
}

// Set stores a value in both L1 and L2 cache. L2 uses the given TTL, L1 uses 1 minute.
// Also stores a stale copy with 10x TTL for graceful degradation.
func (c *Cache) Set(ctx context.Context, key string, value any, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}

	// L1 set
	c.l1.SetWithTTL(key, data, int64(len(data)), c.l1TTL)
	c.l1.Wait()

	// L2 set with stale copy
	pipe := c.client.Pipeline()
	pipe.Set(ctx, key, data, ttl)
	pipe.Set(ctx, key+":stale", data, ttl*10)
	_, err = pipe.Exec(ctx)
	return err
}

// EvictL1 removes a key from L1 cache only (for testing).
func (c *Cache) EvictL1(key string) {
	c.l1.Del(key)
}

// DeletePattern deletes all keys matching the given glob pattern from both L1 and L2.
func (c *Cache) DeletePattern(ctx context.Context, pattern string) error {
	iter := c.client.Scan(ctx, 0, pattern, 100).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if err := iter.Err(); err != nil {
		return err
	}
	// Clear matching keys from L1
	for _, key := range keys {
		c.l1.Del(key)
	}
	if len(keys) > 0 {
		return c.client.Del(ctx, keys...).Err()
	}
	return nil
}
