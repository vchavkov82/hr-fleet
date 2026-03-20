package testutil

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
)

// TestJWTAuth is a shared JWT authenticator for tests using HS256.
var TestJWTAuth = jwtauth.New("HS256", []byte("test-secret-key-for-unit-tests"), nil)

// MakeTestToken creates a valid JWT token for testing with default claims.
func MakeTestToken() string {
	return MakeTestTokenWithClaims(map[string]any{
		"sub":   "test-user-id",
		"email": "test@example.com",
		"role":  "admin",
	})
}

// MakeTestTokenWithClaims creates a JWT token with custom claims.
func MakeTestTokenWithClaims(claims map[string]any) string {
	if claims["exp"] == nil {
		claims["exp"] = time.Now().Add(time.Hour).Unix()
	}
	_, tokenString, _ := TestJWTAuth.Encode(claims)
	return tokenString
}

// MakeExpiredToken creates an expired JWT token for testing auth failures.
func MakeExpiredToken() string {
	return MakeTestTokenWithClaims(map[string]any{
		"sub":   "test-user-id",
		"email": "test@example.com",
		"exp":   time.Now().Add(-time.Hour).Unix(),
	})
}

// NewTestRequest creates an httptest.Request with common defaults.
func NewTestRequest(method, path string, body any) *http.Request {
	var bodyReader io.Reader
	if body != nil {
		switch v := body.(type) {
		case string:
			bodyReader = bytes.NewBufferString(v)
		case []byte:
			bodyReader = bytes.NewBuffer(v)
		default:
			jsonBytes, _ := json.Marshal(body)
			bodyReader = bytes.NewBuffer(jsonBytes)
		}
	}

	req := httptest.NewRequest(method, path, bodyReader)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return req
}

// NewAuthenticatedRequest creates an httptest.Request with a valid JWT token.
func NewAuthenticatedRequest(method, path string, body any) *http.Request {
	req := NewTestRequest(method, path, body)
	req.Header.Set("Authorization", "Bearer "+MakeTestToken())
	return req
}

// NewAuthenticatedRequestWithToken creates an httptest.Request with a specific token.
func NewAuthenticatedRequestWithToken(method, path string, body any, token string) *http.Request {
	req := NewTestRequest(method, path, body)
	req.Header.Set("Authorization", "Bearer "+token)
	return req
}

// TestUUID generates a deterministic UUID for testing based on an index.
func TestUUID(index int) pgtype.UUID {
	return TestUUIDWithValid(index, true)
}

// TestUUIDInput is used to configure test UUID generation.
type TestUUIDInput struct {
	Index int
	Valid bool
}

// TestUUIDWithValid generates a deterministic UUID with explicit validity.
func TestUUIDWithValid(index int, valid bool) pgtype.UUID {
	var pgUUID pgtype.UUID
	if valid {
		id := uuid.MustParse("00000000-0000-0000-0000-" + padInt(index, 12))
		pgUUID.Bytes = id
	}
	pgUUID.Valid = valid
	return pgUUID
}

func padInt(n, width int) string {
	s := ""
	for i := 0; i < width; i++ {
		s += string('0' + byte(n%10))
		n /= 10
	}
	// Reverse
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}

// TestOrganization creates a test organization with default values.
func TestOrganization(id pgtype.UUID, status, subscriptionStatus string) db.Organization {
	return db.Organization{
		ID:                 id,
		Name:               "Test Organization",
		Slug:               "test-org",
		OdooCompanyID:      1,
		Status:             status,
		SubscriptionStatus: subscriptionStatus,
	}
}

// ContextWithOrganization returns a context with organization ID set.
func ContextWithOrganization(orgID pgtype.UUID) context.Context {
	return tenant.WithOrganizationID(context.Background(), orgID)
}

// ContextWithOdooCompany returns a context with Odoo company ID set.
func ContextWithOdooCompany(companyID int64) context.Context {
	return tenant.WithOdooCompanyID(context.Background(), companyID)
}

// ContextWithTenant returns a context with both org and Odoo company set.
func ContextWithTenant(orgID pgtype.UUID, odooCompanyID int64) context.Context {
	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	return tenant.WithOdooCompanyID(ctx, odooCompanyID)
}

// AssertStatus checks the response status code.
func AssertStatus(t *testing.T, w *httptest.ResponseRecorder, want int) {
	t.Helper()
	if w.Code != want {
		t.Fatalf("status = %d, want %d. Body: %s", w.Code, want, w.Body.String())
	}
}

// AssertJSONResponse parses the response body as JSON and returns it.
func AssertJSONResponse(t *testing.T, w *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var resp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse JSON response: %v. Body: %s", err, w.Body.String())
	}
	return resp
}

// AssertErrorCode checks that the error response contains the expected code.
func AssertErrorCode(t *testing.T, w *httptest.ResponseRecorder, wantCode string) {
	t.Helper()
	resp := AssertJSONResponse(t, w)
	errObj, ok := resp["error"].(map[string]any)
	if !ok {
		t.Fatalf("expected error object in response, got: %v", resp)
	}
	if errObj["code"] != wantCode {
		t.Errorf("error code = %v, want %v", errObj["code"], wantCode)
	}
}

// AssertHasField checks that the JSON response contains a specific field.
func AssertHasField(t *testing.T, resp map[string]any, field string) {
	t.Helper()
	if _, ok := resp[field]; !ok {
		t.Errorf("expected field %q in response, got: %v", field, resp)
	}
}

// MockQuerier is a mock implementation of db.Querier for testing.
type MockQuerier struct {
	GetOrganizationByIDFunc             func(ctx context.Context, id pgtype.UUID) (db.Organization, error)
	GetOrganizationByStripeCustomerIDFn func(ctx context.Context, stripeCustomerID pgtype.Text) (db.Organization, error)
	UpdateOrganizationStripeFn          func(ctx context.Context, arg db.UpdateOrganizationStripeParams) error
	UpdateOrganizationSubscriptionFn    func(ctx context.Context, arg db.UpdateOrganizationSubscriptionParams) error
}

// GetOrganizationByID implements the Querier interface.
func (m *MockQuerier) GetOrganizationByID(ctx context.Context, id pgtype.UUID) (db.Organization, error) {
	if m.GetOrganizationByIDFunc != nil {
		return m.GetOrganizationByIDFunc(ctx, id)
	}
	return db.Organization{}, nil
}

// GetOrganizationByStripeCustomerID implements the Querier interface.
func (m *MockQuerier) GetOrganizationByStripeCustomerID(ctx context.Context, stripeCustomerID pgtype.Text) (db.Organization, error) {
	if m.GetOrganizationByStripeCustomerIDFn != nil {
		return m.GetOrganizationByStripeCustomerIDFn(ctx, stripeCustomerID)
	}
	return db.Organization{}, nil
}

// UpdateOrganizationStripe implements the Querier interface.
func (m *MockQuerier) UpdateOrganizationStripe(ctx context.Context, arg db.UpdateOrganizationStripeParams) error {
	if m.UpdateOrganizationStripeFn != nil {
		return m.UpdateOrganizationStripeFn(ctx, arg)
	}
	return nil
}

// UpdateOrganizationSubscription implements the Querier interface.
func (m *MockQuerier) UpdateOrganizationSubscription(ctx context.Context, arg db.UpdateOrganizationSubscriptionParams) error {
	if m.UpdateOrganizationSubscriptionFn != nil {
		return m.UpdateOrganizationSubscriptionFn(ctx, arg)
	}
	return nil
}
