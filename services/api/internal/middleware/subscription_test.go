package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
	"github.com/vchavkov/hr/services/api/internal/testutil"
)

// mockDBTX is a mock database transaction that returns predefined organizations.
type mockDBTX struct {
	org db.Organization
	err error
}

func (m *mockDBTX) Exec(ctx context.Context, sql string, arguments ...interface{}) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, nil
}

func (m *mockDBTX) Query(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
	return nil, nil
}

func (m *mockDBTX) QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row {
	return &mockRow{org: m.org, err: m.err}
}

type mockRow struct {
	org db.Organization
	err error
}

func (r *mockRow) Scan(dest ...any) error {
	if r.err != nil {
		return r.err
	}
	if len(dest) >= 9 {
		if v, ok := dest[0].(*pgtype.UUID); ok {
			*v = r.org.ID
		}
		if v, ok := dest[1].(*string); ok {
			*v = r.org.Name
		}
		if v, ok := dest[2].(*string); ok {
			*v = r.org.Slug
		}
		if v, ok := dest[3].(*int64); ok {
			*v = r.org.OdooCompanyID
		}
		if v, ok := dest[4].(*string); ok {
			*v = r.org.Status
		}
		if v, ok := dest[5].(*pgtype.Text); ok {
			*v = r.org.StripeCustomerID
		}
		if v, ok := dest[6].(*string); ok {
			*v = r.org.SubscriptionStatus
		}
	}
	return nil
}

func newMockQueries(org db.Organization, err error) *db.Queries {
	return db.New(&mockDBTX{org: org, err: err})
}

func TestRequireWritableSubscription_EnforceDisabled(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	middleware := RequireWritableSubscription(nil, false)
	handler := middleware(next)

	req := httptest.NewRequest(http.MethodPost, "/test", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if !called {
		t.Error("next handler was not called when enforce=false")
	}
	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestRequireWritableSubscription_GETAlwaysPasses(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	org := testutil.TestOrganization(testutil.TestUUID(1), "active", "canceled")
	queries := newMockQueries(org, nil)
	middleware := RequireWritableSubscription(queries, true)
	handler := middleware(next)

	methods := []string{http.MethodGet, http.MethodHead, http.MethodOptions}
	for _, method := range methods {
		t.Run(method, func(t *testing.T) {
			called = false
			orgID := testutil.TestUUID(1)
			ctx := tenant.WithOrganizationID(context.Background(), orgID)
			req := httptest.NewRequest(method, "/test", nil).WithContext(ctx)
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)

			if !called {
				t.Errorf("%s request was not passed through", method)
			}
		})
	}
}

func TestRequireWritableSubscription_MissingOrgContext(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	middleware := RequireWritableSubscription(nil, true)
	handler := middleware(next)

	req := httptest.NewRequest(http.MethodPost, "/test", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if !called {
		t.Error("next handler was not called when org context is missing")
	}
}

func TestRequireWritableSubscription_ActiveSubscriptionAllowsPOST(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	orgID := testutil.TestUUID(1)
	org := testutil.TestOrganization(orgID, "active", "active")
	queries := newMockQueries(org, nil)
	middleware := RequireWritableSubscription(queries, true)
	handler := middleware(next)

	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	req := httptest.NewRequest(http.MethodPost, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if !called {
		t.Error("next handler was not called for active subscription")
	}
	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestRequireWritableSubscription_TrialingSubscriptionAllowsPOST(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	orgID := testutil.TestUUID(1)
	org := testutil.TestOrganization(orgID, "active", "trialing")
	queries := newMockQueries(org, nil)
	middleware := RequireWritableSubscription(queries, true)
	handler := middleware(next)

	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	req := httptest.NewRequest(http.MethodPost, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if !called {
		t.Error("next handler was not called for trialing subscription")
	}
	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestRequireWritableSubscription_CanceledSubscriptionBlocksPOST(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	orgID := testutil.TestUUID(1)
	org := testutil.TestOrganization(orgID, "active", "canceled")
	queries := newMockQueries(org, nil)
	middleware := RequireWritableSubscription(queries, true)
	handler := middleware(next)

	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	req := httptest.NewRequest(http.MethodPost, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if called {
		t.Error("next handler was called for canceled subscription")
	}
	testutil.AssertStatus(t, w, http.StatusPaymentRequired)

	var resp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	errObj := resp["error"].(map[string]any)
	if errObj["code"] != "SUBSCRIPTION_INACTIVE" {
		t.Errorf("error code = %v, want SUBSCRIPTION_INACTIVE", errObj["code"])
	}
}

func TestRequireWritableSubscription_CanceledSubscriptionBlocksPUT(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})

	orgID := testutil.TestUUID(1)
	org := testutil.TestOrganization(orgID, "active", "canceled")
	queries := newMockQueries(org, nil)
	middleware := RequireWritableSubscription(queries, true)
	handler := middleware(next)

	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	req := httptest.NewRequest(http.MethodPut, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if called {
		t.Error("next handler was called for canceled subscription on PUT")
	}
	testutil.AssertStatus(t, w, http.StatusPaymentRequired)
}

func TestRequireWritableSubscription_CanceledSubscriptionBlocksDELETE(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})

	orgID := testutil.TestUUID(1)
	org := testutil.TestOrganization(orgID, "active", "canceled")
	queries := newMockQueries(org, nil)
	middleware := RequireWritableSubscription(queries, true)
	handler := middleware(next)

	ctx := tenant.WithOrganizationID(context.Background(), orgID)
	req := httptest.NewRequest(http.MethodDelete, "/test", nil).WithContext(ctx)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if called {
		t.Error("next handler was called for canceled subscription on DELETE")
	}
	testutil.AssertStatus(t, w, http.StatusPaymentRequired)
}
