package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/tenant"
	"github.com/vchavkov/hr/services/api/internal/testutil"
)

func TestGetUserFromContext_WithValidClaims(t *testing.T) {
	ctx := context.Background()
	ctx = context.WithValue(ctx, CtxUserID, "user-123")
	ctx = context.WithValue(ctx, CtxEmail, "test@example.com")
	ctx = context.WithValue(ctx, CtxRole, "admin")
	ctx = context.WithValue(ctx, CtxCompanyID, int64(42))

	req := httptest.NewRequest(http.MethodGet, "/test", nil).WithContext(ctx)
	claims := GetUserFromContext(req)

	if claims == nil {
		t.Fatal("expected non-nil claims")
	}
	if claims.Subject != "user-123" {
		t.Errorf("Subject = %s, want user-123", claims.Subject)
	}
	if claims.Email != "test@example.com" {
		t.Errorf("Email = %s, want test@example.com", claims.Email)
	}
	if claims.Role != "admin" {
		t.Errorf("Role = %s, want admin", claims.Role)
	}
	if claims.CompanyID != 42 {
		t.Errorf("CompanyID = %d, want 42", claims.CompanyID)
	}
}

func TestGetUserFromContext_WithMissingSubject(t *testing.T) {
	ctx := context.Background()
	ctx = context.WithValue(ctx, CtxEmail, "test@example.com")

	req := httptest.NewRequest(http.MethodGet, "/test", nil).WithContext(ctx)
	claims := GetUserFromContext(req)

	if claims != nil {
		t.Error("expected nil claims when subject is missing")
	}
}

func TestGetUserFromContext_EmptyContext(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	claims := GetUserFromContext(req)

	if claims != nil {
		t.Error("expected nil claims for empty context")
	}
}

func TestCompanyIDFromContext(t *testing.T) {
	ctx := context.Background()
	ctx = context.WithValue(ctx, CtxCompanyID, int64(123))

	id := CompanyIDFromContext(ctx)
	if id != 123 {
		t.Errorf("CompanyIDFromContext = %d, want 123", id)
	}
}

func TestCompanyIDFromContext_Missing(t *testing.T) {
	ctx := context.Background()
	id := CompanyIDFromContext(ctx)
	if id != 0 {
		t.Errorf("CompanyIDFromContext = %d, want 0", id)
	}
}

func TestRequireTenant_ValidTenant(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	middleware := RequireTenant()
	handler := middleware(next)

	orgID := testutil.TestUUID(1)
	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	ctx = tenant.WithOdooCompanyID(ctx, 42)
	req := httptest.NewRequest(http.MethodGet, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if !called {
		t.Error("next handler was not called")
	}
	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestRequireTenant_MissingOrganization(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})

	middleware := RequireTenant()
	handler := middleware(next)

	ctx := tenant.WithOdooCompanyID(context.Background(), 42)
	req := httptest.NewRequest(http.MethodGet, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if called {
		t.Error("next handler was called without organization")
	}
	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "TENANT_REQUIRED")
}

func TestRequireTenant_MissingOdooCompany(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})

	middleware := RequireTenant()
	handler := middleware(next)

	orgID := testutil.TestUUID(1)
	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	req := httptest.NewRequest(http.MethodGet, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if called {
		t.Error("next handler was called without Odoo company")
	}
	testutil.AssertStatus(t, w, http.StatusBadRequest)
}

func TestRequireTenant_InvalidOrganization(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})

	middleware := RequireTenant()
	handler := middleware(next)

	invalidOrg := pgtype.UUID{Valid: false}
	ctx := tenant.WithOrganizationID(context.Background(), invalidOrg)
	ctx = tenant.WithOdooCompanyID(ctx, 42)
	req := httptest.NewRequest(http.MethodGet, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if called {
		t.Error("next handler was called with invalid organization")
	}
	testutil.AssertStatus(t, w, http.StatusBadRequest)
}

func TestPgUUIDToString(t *testing.T) {
	tests := []struct {
		name string
		uuid pgtype.UUID
		want string
	}{
		{
			name: "valid uuid",
			uuid: testutil.TestUUID(1),
			want: "00000000-0000-0000-0000-000000000001",
		},
		{
			name: "invalid uuid",
			uuid: pgtype.UUID{Valid: false},
			want: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := pgUUIDToString(tt.uuid)
			if got != tt.want {
				t.Errorf("pgUUIDToString() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestAPIKeyOrJWT_MissingAuth(t *testing.T) {
	jwtAuth := jwtauth.New("HS256", []byte("test-secret"), nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	middleware := APIKeyOrJWT(jwtAuth, nil)
	handler := middleware(next)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusUnauthorized)
}

func TestAPIKeyOrJWT_ValidJWT(t *testing.T) {
	jwtAuth := jwtauth.New("HS256", []byte("test-secret"), nil)
	_, tokenString, _ := jwtAuth.Encode(map[string]interface{}{
		"sub":   "user-1",
		"email": "test@example.com",
		"role":  "admin",
		"exp":   time.Now().Add(time.Hour).Unix(),
	})

	var capturedUserID string
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if uid, ok := r.Context().Value(CtxUserID).(string); ok {
			capturedUserID = uid
		}
		w.WriteHeader(http.StatusOK)
	})

	middleware := APIKeyOrJWT(jwtAuth, nil)
	handler := middleware(next)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	if capturedUserID != "user-1" {
		t.Errorf("user_id = %s, want user-1", capturedUserID)
	}
}

func TestAPIKeyOrJWT_ExpiredJWT(t *testing.T) {
	jwtAuth := jwtauth.New("HS256", []byte("test-secret"), nil)
	_, tokenString, _ := jwtAuth.Encode(map[string]interface{}{
		"sub": "user-1",
		"exp": time.Now().Add(-time.Hour).Unix(),
	})

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	middleware := APIKeyOrJWT(jwtAuth, nil)
	handler := middleware(next)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusUnauthorized)
}

func TestAPIKeyOrJWT_MalformedJWT(t *testing.T) {
	jwtAuth := jwtauth.New("HS256", []byte("test-secret"), nil)

	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	middleware := APIKeyOrJWT(jwtAuth, nil)
	handler := middleware(next)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer malformed.jwt.token")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusUnauthorized)
}
