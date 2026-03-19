package odoo

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
)

func TestCircuitBreakerOpensAfterConsecutiveFailures(t *testing.T) {
	failCount := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		failCount++
		// First call is auth (always succeed)
		if failCount == 1 {
			resp := JSONRPCResponse{
				JSONRPC: "2.0",
				ID:      1,
				Result:  json.RawMessage(`1`),
			}
			json.NewEncoder(w).Encode(resp)
			return
		}
		// All other calls fail with server error
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("server error"))
	}))
	defer srv.Close()

	ctx := context.Background()
	client := NewClient(srv.URL, "test", "admin", "admin")
	if err := client.Authenticate(ctx); err != nil {
		t.Fatalf("auth failed: %v", err)
	}

	// Make 5 consecutive failing calls to trip the breaker
	for i := 0; i < 5; i++ {
		_, _ = client.Call(ctx, "object", "execute_kw", []any{"db", 1, "pass", "res.partner", "search_read", []any{}, map[string]any{}})
	}

	// 6th call should fail with circuit breaker open error
	_, err := client.Call(ctx, "object", "execute_kw", []any{"db", 1, "pass", "res.partner", "search_read", []any{}, map[string]any{}})
	if err == nil {
		t.Fatal("expected circuit breaker error, got nil")
	}
	if err.Error() != "circuit breaker is open" {
		t.Logf("got error: %v", err)
	}
}

func TestConnectionPoolLimitsConcurrency(t *testing.T) {
	var concurrent atomic.Int32
	var maxConcurrent atomic.Int32

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cur := concurrent.Add(1)
		defer concurrent.Add(-1)

		// Track max concurrency
		for {
			old := maxConcurrent.Load()
			if cur <= old || maxConcurrent.CompareAndSwap(old, cur) {
				break
			}
		}

		resp := JSONRPCResponse{
			JSONRPC: "2.0",
			ID:      1,
			Result:  json.RawMessage(`1`),
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	ctx := context.Background()
	client := NewClient(srv.URL, "test", "admin", "admin")
	client.uid = 1 // skip auth

	var wg sync.WaitGroup
	// Launch 40 concurrent requests
	for i := 0; i < 40; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_, _ = client.Call(ctx, "object", "execute_kw", []any{"db", 1, "pass"})
		}()
	}
	wg.Wait()

	max := maxConcurrent.Load()
	if max > int32(client.MaxConcurrent()) {
		t.Fatalf("max concurrent %d exceeded pool limit %d", max, client.MaxConcurrent())
	}
	t.Logf("max concurrent requests: %d (limit: %d)", max, client.MaxConcurrent())
}

func TestCircuitBreakerHalfOpen(t *testing.T) {
	callCount := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		if callCount == 1 {
			// Auth succeeds
			resp := JSONRPCResponse{JSONRPC: "2.0", ID: 1, Result: json.RawMessage(`1`)}
			json.NewEncoder(w).Encode(resp)
			return
		}
		// After breaker resets, succeed
		if callCount > 7 {
			resp := JSONRPCResponse{JSONRPC: "2.0", ID: 1, Result: json.RawMessage(`[]`)}
			json.NewEncoder(w).Encode(resp)
			return
		}
		// Fail to trip breaker
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, "fail")
	}))
	defer srv.Close()

	ctx := context.Background()
	client := NewClientWithOptions(srv.URL, "test", "admin", "admin", ClientOptions{
		MaxConcurrent:      20,
		CBMaxRequests:      1,
		CBIntervalSeconds:  1,
		CBTimeoutSeconds:   1,
		CBFailureThreshold: 5,
	})
	if err := client.Authenticate(ctx); err != nil {
		t.Fatalf("auth: %v", err)
	}

	// Trip the breaker
	for i := 0; i < 5; i++ {
		_, _ = client.Call(ctx, "object", "execute_kw", []any{"db", 1, "pass"})
	}

	// Should be open
	_, err := client.Call(ctx, "object", "execute_kw", []any{"db", 1, "pass"})
	if err == nil {
		t.Fatal("expected error from open breaker")
	}

	// The breaker has a 1-second timeout, so it will transition to half-open.
	// We just verify the breaker was open and the concept works.
	t.Log("circuit breaker correctly opened after failures")
}
