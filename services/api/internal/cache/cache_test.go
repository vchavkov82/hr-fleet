package cache

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
)

func TestL1CacheReturnsWithoutRedis(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatal(err)
	}
	defer mr.Close()

	c, err := NewCache("redis://" + mr.Addr())
	if err != nil {
		t.Fatal(err)
	}

	ctx := context.Background()
	key := "test:l1"
	value := map[string]string{"name": "test"}

	// Set value (populates both L1 and L2)
	if err := c.Set(ctx, key, value, 5*time.Minute); err != nil {
		t.Fatal(err)
	}

	// Close Redis to prove L1 serves from memory
	mr.Close()

	var result map[string]string
	err = c.Get(ctx, key, &result)
	if err != nil {
		t.Fatalf("L1 cache should return value without Redis: %v", err)
	}
	if result["name"] != "test" {
		t.Fatalf("expected name=test, got %v", result["name"])
	}
}

func TestL1MissFallsThroughToRedis(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatal(err)
	}
	defer mr.Close()

	c, err := NewCache("redis://" + mr.Addr())
	if err != nil {
		t.Fatal(err)
	}

	ctx := context.Background()
	key := "test:l2fallthrough"
	value := map[string]string{"data": "from-redis"}

	// Set value
	if err := c.Set(ctx, key, value, 5*time.Minute); err != nil {
		t.Fatal(err)
	}

	// Evict from L1 only
	c.EvictL1(key)

	// Get should fall through to Redis and repopulate L1
	var result map[string]string
	if err := c.Get(ctx, key, &result); err != nil {
		t.Fatalf("should fall through to Redis: %v", err)
	}
	if result["data"] != "from-redis" {
		t.Fatalf("expected data=from-redis, got %v", result["data"])
	}

	// Now close Redis - L1 should have been repopulated
	mr.Close()

	var result2 map[string]string
	if err := c.Get(ctx, key, &result2); err != nil {
		t.Fatalf("L1 should be repopulated after L2 hit: %v", err)
	}
	if result2["data"] != "from-redis" {
		t.Fatalf("expected data=from-redis from L1, got %v", result2["data"])
	}
}
