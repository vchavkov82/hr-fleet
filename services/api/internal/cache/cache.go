package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache provides Redis-backed caching with stale fallback support.
type Cache struct {
	client *redis.Client
}

// NewCache creates a new Cache connected to the given Redis URL.
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

	return &Cache{client: client}, nil
}

// Get retrieves a cached value by key. Returns an error if the key does not exist.
func (c *Cache) Get(ctx context.Context, key string, dest any) error {
	val, err := c.client.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(val), dest)
}

// GetStale retrieves a stale cached value (stored with a longer TTL under a :stale suffix).
func (c *Cache) GetStale(ctx context.Context, key string, dest any) error {
	return c.Get(ctx, key+":stale", dest)
}

// Set stores a value in cache with the given TTL, and also stores a stale copy with 10x TTL.
func (c *Cache) Set(ctx context.Context, key string, value any, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}

	pipe := c.client.Pipeline()
	pipe.Set(ctx, key, data, ttl)
	pipe.Set(ctx, key+":stale", data, ttl*10)
	_, err = pipe.Exec(ctx)
	return err
}

// DeletePattern deletes all keys matching the given glob pattern.
func (c *Cache) DeletePattern(ctx context.Context, pattern string) error {
	iter := c.client.Scan(ctx, 0, pattern, 100).Iterator()
	var keys []string
	for iter.Next(ctx) {
		keys = append(keys, iter.Val())
	}
	if err := iter.Err(); err != nil {
		return err
	}
	if len(keys) > 0 {
		return c.client.Del(ctx, keys...).Err()
	}
	return nil
}
