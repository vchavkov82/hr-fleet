package middleware

import (
	"testing"
)

func TestPublicRateLimit_ReturnsNonNil(t *testing.T) {
	handler := PublicRateLimit()
	if handler == nil {
		t.Fatal("PublicRateLimit() returned nil")
	}
}

func TestAuthenticatedRateLimit_ReturnsNonNil(t *testing.T) {
	handler := AuthenticatedRateLimit()
	if handler == nil {
		t.Fatal("AuthenticatedRateLimit() returned nil")
	}
}
