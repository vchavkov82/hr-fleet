package middleware

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/auth"
	"github.com/vchavkov/hr/services/api/internal/service"
)

type contextKey string

const (
	CtxUserID    contextKey = "user_id"
	CtxEmail     contextKey = "email"
	CtxRole      contextKey = "role"
	CtxCompanyID contextKey = "company_id"
)

// NewJWTAuth creates a JWTAuth instance using RS256 with PEM-encoded RSA keys.
func NewJWTAuth(privateKeyPEM, publicKeyPEM []byte) (*jwtauth.JWTAuth, error) {
	return auth.NewJWTAuth(privateKeyPEM, publicKeyPEM)
}

// UserClaims holds extracted JWT claims for the current request.
type UserClaims struct {
	Subject   string
	Email     string
	Role      string
	CompanyID int64
}

// GetUserFromContext extracts user claims from the request context.
func GetUserFromContext(r *http.Request) *UserClaims {
	uc := &UserClaims{}
	if sub, ok := r.Context().Value(CtxUserID).(string); ok {
		uc.Subject = sub
	}
	if email, ok := r.Context().Value(CtxEmail).(string); ok {
		uc.Email = email
	}
	if role, ok := r.Context().Value(CtxRole).(string); ok {
		uc.Role = role
	}
	if uc.Subject == "" {
		return nil
	}
	return uc
}

// APIKeyOrJWT middleware checks X-API-Key header first, then falls through to JWT.
func APIKeyOrJWT(jwtAuth *jwtauth.JWTAuth, authSvc *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Check API key first
			apiKey := r.Header.Get("X-API-Key")
			if apiKey != "" {
				userID, role, err := authSvc.ValidateAPIKey(r.Context(), apiKey)
				if err != nil {
					http.Error(w, `{"error":{"code":"UNAUTHORIZED","message":"Invalid API key"}}`, http.StatusUnauthorized)
					return
				}
				userIDStr := pgUUIDToString(userID)
				ctx := context.WithValue(r.Context(), CtxUserID, userIDStr)
				ctx = context.WithValue(ctx, CtxRole, role)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			// Fall through to JWT
			jwtauth.Verifier(jwtAuth)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				token, claims, err := jwtauth.FromContext(r.Context())
				if err != nil || token == nil {
					http.Error(w, `{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid token"}}`, http.StatusUnauthorized)
					return
				}

				sub, _ := claims["sub"].(string)
				email, _ := claims["email"].(string)
				role, _ := claims["role"].(string)

				ctx := context.WithValue(r.Context(), CtxUserID, sub)
				ctx = context.WithValue(ctx, CtxEmail, email)
				ctx = context.WithValue(ctx, CtxRole, role)
				next.ServeHTTP(w, r.WithContext(ctx))
			})).ServeHTTP(w, r)
		})
	}
}

func pgUUIDToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	b := u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
