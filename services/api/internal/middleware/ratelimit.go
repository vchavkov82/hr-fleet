package middleware

import (
	"net/http"
	"time"

	"github.com/go-chi/httprate"
)

// PublicRateLimit applies a rate limit of 1000 requests per minute keyed by IP address.
// Apply this before authentication middleware for public-facing routes.
func PublicRateLimit() func(http.Handler) http.Handler {
	return httprate.LimitByIP(1000, time.Minute)
}

// AuthenticatedRateLimit applies a rate limit of 10000 requests per minute keyed by
// the authenticated user ID from JWT/API-key context. Falls back to IP-based limiting
// if no user context is found.
func AuthenticatedRateLimit() func(http.Handler) http.Handler {
	return httprate.Limit(
		10000,
		time.Minute,
		httprate.WithKeyFuncs(func(r *http.Request) (string, error) {
			if claims := GetUserFromContext(r); claims != nil {
				return "user:" + claims.Subject, nil
			}
			// Fallback to IP if no user context
			return "ip:" + r.RemoteAddr, nil
		}),
	)
}
