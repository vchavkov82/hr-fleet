package middleware

import (
	"encoding/json"
	"net/http"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
)

// RequireWritableSubscription blocks mutating requests when the tenant subscription is canceled (SaaS enforcement).
func RequireWritableSubscription(queries *db.Queries, enforce bool) func(http.Handler) http.Handler {
	if !enforce {
		return func(next http.Handler) http.Handler { return next }
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet, http.MethodHead, http.MethodOptions:
				next.ServeHTTP(w, r)
				return
			}

			orgID, ok := tenant.OrganizationID(r.Context())
			if !ok || !orgID.Valid {
				next.ServeHTTP(w, r)
				return
			}

			org, err := queries.GetOrganizationByID(r.Context(), orgID)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				_, _ = w.Write([]byte(`{"error":{"code":"INTERNAL_ERROR","message":"Failed to load organization"}}`))
				return
			}

			if org.SubscriptionStatus == "canceled" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusPaymentRequired)
				_ = json.NewEncoder(w).Encode(map[string]any{
					"error": map[string]string{
						"code":    "SUBSCRIPTION_INACTIVE",
						"message": "Subscription canceled. Renew your plan to make changes.",
					},
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
