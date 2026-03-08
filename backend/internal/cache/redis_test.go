package cache

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
)

func setupMiniredis(t *testing.T) (*miniredis.Miniredis, *Cache) {
	t.Helper()
	mr := miniredis.RunT(t)
	c, err := NewCache("redis://" + mr.Addr())
	if err != nil {
		t.Fatalf("NewCache: %v", err)
	}
	return mr, c
}

func TestCache_Get_Hit(t *testing.T) {
	mr, c := setupMiniredis(t)
	ctx := context.Background()

	type testData struct {
		Name string `json:"name"`
		Age  int    `json:"age"`
	}

	err := c.Set(ctx, "test:key", testData{Name: "Alice", Age: 30}, 5*time.Minute)
	if err != nil {
		t.Fatalf("Set: %v", err)
	}

	var got testData
	err = c.Get(ctx, "test:key", &got)
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if got.Name != "Alice" || got.Age != 30 {
		t.Errorf("got %+v, want {Alice 30}", got)
	}
	_ = mr
}

func TestCache_Get_Miss(t *testing.T) {
	_, c := setupMiniredis(t)
	ctx := context.Background()

	var got string
	err := c.Get(ctx, "nonexistent", &got)
	if err != ErrCacheMiss {
		t.Errorf("expected ErrCacheMiss, got %v", err)
	}
}

func TestCache_Set_WithTTL(t *testing.T) {
	mr, c := setupMiniredis(t)
	ctx := context.Background()

	err := c.Set(ctx, "ttl:key", "value", 5*time.Minute)
	if err != nil {
		t.Fatalf("Set: %v", err)
	}

	ttl := mr.TTL("ttl:key")
	if ttl < 4*time.Minute || ttl > 6*time.Minute {
		t.Errorf("TTL = %v, want ~5m", ttl)
	}

	// Check stale copy exists with longer TTL
	staleTTL := mr.TTL("ttl:key:stale")
	if staleTTL < 25*time.Minute || staleTTL > 35*time.Minute {
		t.Errorf("stale TTL = %v, want ~30m", staleTTL)
	}
}

func TestCache_DeletePattern(t *testing.T) {
	_, c := setupMiniredis(t)
	ctx := context.Background()

	_ = c.Set(ctx, "emp:list:1", "a", 5*time.Minute)
	_ = c.Set(ctx, "emp:list:2", "b", 5*time.Minute)
	_ = c.Set(ctx, "emp:detail:1", "c", 5*time.Minute)

	err := c.DeletePattern(ctx, "emp:list:*")
	if err != nil {
		t.Fatalf("DeletePattern: %v", err)
	}

	var got string
	if err := c.Get(ctx, "emp:list:1", &got); err != ErrCacheMiss {
		t.Error("emp:list:1 should be deleted")
	}
	if err := c.Get(ctx, "emp:list:2", &got); err != ErrCacheMiss {
		t.Error("emp:list:2 should be deleted")
	}
	if err := c.Get(ctx, "emp:detail:1", &got); err != nil {
		t.Error("emp:detail:1 should still exist")
	}
}

func TestCache_GetStale_ReturnsFallback(t *testing.T) {
	_, c := setupMiniredis(t)
	ctx := context.Background()

	type testData struct {
		Value string `json:"value"`
	}

	// Set data (creates both primary and stale copy)
	err := c.Set(ctx, "test:stale", testData{Value: "cached"}, 5*time.Minute)
	if err != nil {
		t.Fatalf("Set: %v", err)
	}

	// Delete primary key (simulating expiry)
	c.rdb.Del(ctx, "test:stale")

	// Primary Get should miss
	var got testData
	if err := c.Get(ctx, "test:stale", &got); err != ErrCacheMiss {
		t.Error("primary key should be missing")
	}

	// GetStale should return fallback from stale copy
	err = c.GetStale(ctx, "test:stale", &got)
	if err != nil {
		t.Fatalf("GetStale: %v", err)
	}
	if got.Value != "cached" {
		t.Errorf("got %q, want %q", got.Value, "cached")
	}
}
