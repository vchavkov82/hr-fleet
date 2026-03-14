package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/jwtauth/v5"
)

func TestHashPassword(t *testing.T) {
	hash, err := HashPassword("secret123")
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}
	if len(hash) == 0 {
		t.Fatal("expected non-empty hash")
	}
}

func TestCheckPassword(t *testing.T) {
	hash, _ := HashPassword("secret123")
	if err := CheckPassword(hash, "secret123"); err != nil {
		t.Errorf("expected nil, got %v", err)
	}
	if err := CheckPassword(hash, "wrong"); err == nil {
		t.Error("expected error for wrong password")
	}
}

func TestGenerateAPIKey(t *testing.T) {
	plain, hash, prefix, err := GenerateAPIKey()
	if err != nil {
		t.Fatalf("GenerateAPIKey: %v", err)
	}
	if len(plain) == 0 || len(hash) == 0 || len(prefix) == 0 {
		t.Fatal("expected non-empty values")
	}
	if len(prefix) != 8 {
		t.Errorf("prefix length = %d, want 8", len(prefix))
	}
}

func TestValidateAPIKey(t *testing.T) {
	plain, hash, _, _ := GenerateAPIKey()
	if !ValidateAPIKey(plain, hash) {
		t.Error("expected valid API key")
	}
	if ValidateAPIKey("wrong-key", hash) {
		t.Error("expected invalid API key")
	}
}

func TestHasPermission(t *testing.T) {
	tests := []struct {
		role Role
		perm Permission
		want bool
	}{
		{SuperAdmin, ManageUsers, true},
		{SuperAdmin, ManagePayroll, true},
		{Viewer, ManageUsers, false},
		{Viewer, ViewReports, true},
		{Employee, ManageUsers, false},
		{HRManager, ManageEmployees, true},
		{HRManager, ManagePayroll, false},
		{Accountant, ManagePayroll, true},
		{Accountant, ApprovePayroll, false},
		{Admin, ApprovePayroll, true},
	}
	for _, tt := range tests {
		got := HasPermission(tt.role, tt.perm)
		if got != tt.want {
			t.Errorf("HasPermission(%s, %s) = %v, want %v", tt.role, tt.perm, got, tt.want)
		}
	}
}

func TestRequireRole(t *testing.T) {
	priv, pub := generateTestKeys(t)
	auth, _ := NewJWTAuth(priv, pub)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Test with valid role
	t.Run("allowed role", func(t *testing.T) {
		claims := map[string]interface{}{
			"sub":  "user-1",
			"role": string(Admin),
		}
		_, tokenStr, _ := auth.Encode(claims)
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Authorization", "Bearer "+tokenStr)
		rr := httptest.NewRecorder()

		chain := jwtauth.Verifier(auth)(jwtauth.Authenticator(auth)(RequireRole(Admin, SuperAdmin)(handler)))
		chain.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Errorf("status = %d, want 200", rr.Code)
		}
	})

	// Test with unauthorized role
	t.Run("denied role", func(t *testing.T) {
		claims := map[string]interface{}{
			"sub":  "user-2",
			"role": string(Employee),
		}
		_, tokenStr, _ := auth.Encode(claims)
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Authorization", "Bearer "+tokenStr)
		rr := httptest.NewRecorder()

		chain := jwtauth.Verifier(auth)(jwtauth.Authenticator(auth)(RequireRole(Admin, SuperAdmin)(handler)))
		chain.ServeHTTP(rr, req)
		if rr.Code != http.StatusForbidden {
			t.Errorf("status = %d, want 403", rr.Code)
		}
	})
}
