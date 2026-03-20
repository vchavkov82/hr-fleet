package main

import (
	"context"
	"testing"
	"time"
)

func TestWaitForShutdown_ReturnsOnCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		waitForShutdown(ctx)
		close(done)
	}()
	cancel()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("waitForShutdown did not return after context cancel")
	}
}
