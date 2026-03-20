package middleware

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/auth"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/tenant"
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
	if companyID, ok := r.Context().Value(CtxCompanyID).(int64); ok {
		uc.CompanyID = companyID
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
			apiKey := r.Header.Get("X-API-Key")
			if apiKey != "" {
				p, err := authSvc.ValidateAPIKeyPrincipal(r.Context(), apiKey)
				if err != nil {
					http.Error(w, `{"error":{"code":"UNAUTHORIZED","message":"Invalid API key"}}`, http.StatusUnauthorized)
					return
				}
				userIDStr := pgUUIDToString(p.UserID)
				ctx := r.Context()
				ctx = context.WithValue(ctx, CtxUserID, userIDStr)
				ctx = context.WithValue(ctx, CtxRole, p.Role)
				ctx = context.WithValue(ctx, CtxCompanyID, p.OdooCompanyID)
				ctx = tenant.WithOrganizationID(ctx, p.OrganizationID)
				ctx = tenant.WithOdooCompanyID(ctx, p.OdooCompanyID)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

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

				var odooCompany int64
				if cid, ok := claims["company_id"].(float64); ok {
					odooCompany = int64(cid)
					ctx = context.WithValue(ctx, CtxCompanyID, odooCompany)
				}

				var orgUUID pgtype.UUID
				if orgStr, ok := claims["organization_id"].(string); ok && orgStr != "" {
					_ = orgUUID.Scan(orgStr)
				}
				ctx = tenant.WithOrganizationID(ctx, orgUUID)
				ctx = tenant.WithOdooCompanyID(ctx, odooCompany)

				next.ServeHTTP(w, r.WithContext(ctx))
			})).ServeHTTP(w, r)
		})
	}
}

// RequireTenant ensures Odoo company and organization are present (after APIKeyOrJWT).
func RequireTenant() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			orgID, ok := tenant.OrganizationID(r.Context())
			if !ok || !orgID.Valid || tenant.OdooCompanyID(r.Context()) <= 0 {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				_, _ = w.Write([]byte(`{"error":{"code":"TENANT_REQUIRED","message":"Organization context required. Use X-Organization-Id on login if you belong to multiple organizations."}}`))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// CompanyIDFromContext extracts the company_id from the request context.
func CompanyIDFromContext(ctx context.Context) int64 {
	id, _ := ctx.Value(CtxCompanyID).(int64)
	return id
}

func pgUUIDToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	b := u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
