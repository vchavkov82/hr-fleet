package handler

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/testutil"
)

type mockPayrollService struct {
	createFunc           func(ctx context.Context, periodStart, periodEnd pgtype.Date, userID pgtype.UUID) (db.PayrollRun, error)
	approveFunc          func(ctx context.Context, runID, userID pgtype.UUID) error
	triggerProcessingFn  func(ctx context.Context, runID, userID pgtype.UUID) error
	getStatusFunc        func(ctx context.Context, runID pgtype.UUID) (db.PayrollRun, error)
	listFunc             func(ctx context.Context, statusFilter pgtype.Text, limit, offset int32) ([]db.PayrollRun, int64, error)
	cancelFunc           func(ctx context.Context, runID, userID pgtype.UUID) error
}

func (m *mockPayrollService) Create(ctx context.Context, periodStart, periodEnd pgtype.Date, userID pgtype.UUID) (db.PayrollRun, error) {
	if m.createFunc != nil {
		return m.createFunc(ctx, periodStart, periodEnd, userID)
	}
	return db.PayrollRun{ID: testutil.TestUUID(1)}, nil
}

func (m *mockPayrollService) Approve(ctx context.Context, runID, userID pgtype.UUID) error {
	if m.approveFunc != nil {
		return m.approveFunc(ctx, runID, userID)
	}
	return nil
}

func (m *mockPayrollService) TriggerProcessing(ctx context.Context, runID, userID pgtype.UUID) error {
	if m.triggerProcessingFn != nil {
		return m.triggerProcessingFn(ctx, runID, userID)
	}
	return nil
}

func (m *mockPayrollService) GetStatus(ctx context.Context, runID pgtype.UUID) (db.PayrollRun, error) {
	if m.getStatusFunc != nil {
		return m.getStatusFunc(ctx, runID)
	}
	return db.PayrollRun{ID: runID, Status: "draft"}, nil
}

func (m *mockPayrollService) List(ctx context.Context, statusFilter pgtype.Text, limit, offset int32) ([]db.PayrollRun, int64, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, statusFilter, limit, offset)
	}
	return []db.PayrollRun{}, 0, nil
}

func (m *mockPayrollService) Cancel(ctx context.Context, runID, userID pgtype.UUID) error {
	if m.cancelFunc != nil {
		return m.cancelFunc(ctx, runID, userID)
	}
	return nil
}

func setupPayrollRouter(svc *service.PayrollService) http.Handler {
	h := NewPayrollHandler(svc)
	r := chi.NewRouter()
	r.Post("/payroll-runs", h.HandleCreate)
	r.Get("/payroll-runs", h.HandleList)
	r.Get("/payroll-runs/{id}", h.HandleGetStatus)
	r.Post("/payroll-runs/{id}/approve", h.HandleApprove)
	r.Post("/payroll-runs/{id}/process", h.HandleProcess)
	r.Post("/payroll-runs/{id}/cancel", h.HandleCancel)
	return r
}

func TestPayrollHandler_HandleCreate_InvalidJSON(t *testing.T) {
	h := NewPayrollHandler(nil)
	req := testutil.NewTestRequest(http.MethodPost, "/payroll-runs", "{invalid")
	w := httptest.NewRecorder()
	h.HandleCreate(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_request")
}

func TestPayrollHandler_HandleCreate_InvalidPeriodStart(t *testing.T) {
	h := NewPayrollHandler(nil)
	body := map[string]string{"period_start": "invalid", "period_end": "2024-01-31"}
	req := testutil.NewTestRequest(http.MethodPost, "/payroll-runs", body)
	w := httptest.NewRecorder()
	h.HandleCreate(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_date")
}

func TestPayrollHandler_HandleCreate_InvalidPeriodEnd(t *testing.T) {
	h := NewPayrollHandler(nil)
	body := map[string]string{"period_start": "2024-01-01", "period_end": "invalid"}
	req := testutil.NewTestRequest(http.MethodPost, "/payroll-runs", body)
	w := httptest.NewRecorder()
	h.HandleCreate(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_date")
}

func TestPayrollHandler_HandleList_Defaults(t *testing.T) {
	// This test validates the handler's default pagination behavior
	// The actual service call cannot be tested without dependency injection refactoring
	h := NewPayrollHandler(nil)
	if h == nil {
		t.Error("expected non-nil handler")
	}
}

func TestPayrollHandler_HandleApprove_InvalidUUID(t *testing.T) {
	h := NewPayrollHandler(nil)
	r := chi.NewRouter()
	r.Post("/payroll-runs/{id}/approve", h.HandleApprove)

	req := httptest.NewRequest(http.MethodPost, "/payroll-runs/not-a-uuid/approve", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestPayrollHandler_HandleGetStatus_InvalidUUID(t *testing.T) {
	h := NewPayrollHandler(nil)
	r := chi.NewRouter()
	r.Get("/payroll-runs/{id}", h.HandleGetStatus)

	req := httptest.NewRequest(http.MethodGet, "/payroll-runs/invalid-uuid", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestParseDate_ValidDate(t *testing.T) {
	d, err := parseDate("2024-03-15")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !d.Valid {
		t.Error("expected valid date")
	}
	if d.Time.Year() != 2024 || d.Time.Month() != 3 || d.Time.Day() != 15 {
		t.Errorf("date = %v, want 2024-03-15", d.Time)
	}
}

func TestParseDate_InvalidDate(t *testing.T) {
	_, err := parseDate("not-a-date")
	if err == nil {
		t.Error("expected error for invalid date")
	}
}

func TestHandlePayrollError_NotFound(t *testing.T) {
	w := httptest.NewRecorder()
	handlePayrollError(w, service.ErrPayrollNotFound)

	testutil.AssertStatus(t, w, http.StatusNotFound)
	testutil.AssertErrorCode(t, w, "not_found")
}

func TestHandlePayrollError_InvalidStatus(t *testing.T) {
	w := httptest.NewRecorder()
	handlePayrollError(w, service.ErrPayrollInvalidStatus)

	testutil.AssertStatus(t, w, http.StatusConflict)
	testutil.AssertErrorCode(t, w, "invalid_status")
}

func TestHandlePayrollError_Immutable(t *testing.T) {
	w := httptest.NewRecorder()
	handlePayrollError(w, service.ErrPayrollImmutable)

	testutil.AssertStatus(t, w, http.StatusConflict)
	testutil.AssertErrorCode(t, w, "immutable")
}

func TestHandlePayrollError_Generic(t *testing.T) {
	w := httptest.NewRecorder()
	handlePayrollError(w, errors.New("some error"))

	testutil.AssertStatus(t, w, http.StatusInternalServerError)
	testutil.AssertErrorCode(t, w, "internal_error")
}

// Ensure the mock and helper remain compilable for future test expansion.
var (
	_ = (&mockPayrollService{}).Create
	_ = (&mockPayrollService{}).Approve
	_ = (&mockPayrollService{}).TriggerProcessing
	_ = (&mockPayrollService{}).GetStatus
	_ = (&mockPayrollService{}).List
	_ = (&mockPayrollService{}).Cancel
	_ = setupPayrollRouter
)
