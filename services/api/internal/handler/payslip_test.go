package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/testutil"
)

type mockPayslipService struct {
	getFunc       func(ctx context.Context, id pgtype.UUID) (db.Payslip, error)
	listByRunFunc func(ctx context.Context, payrollRunID pgtype.UUID) ([]db.Payslip, error)
}

func (m *mockPayslipService) Get(ctx context.Context, id pgtype.UUID) (db.Payslip, error) {
	if m.getFunc != nil {
		return m.getFunc(ctx, id)
	}
	return db.Payslip{ID: id}, nil
}

func (m *mockPayslipService) ListByRun(ctx context.Context, payrollRunID pgtype.UUID) ([]db.Payslip, error) {
	if m.listByRunFunc != nil {
		return m.listByRunFunc(ctx, payrollRunID)
	}
	return []db.Payslip{}, nil
}

func setupPayslipRouter(mock *mockPayslipService) http.Handler {
	h := NewPayslipHandler(mock)
	r := chi.NewRouter()
	r.Get("/payslips", h.HandleList)
	r.Get("/payslips/{id}", h.HandleGet)
	r.Post("/payslips/{id}/confirm", h.HandleConfirm)
	return r
}

func TestPayslipHandler_HandleGet_Success(t *testing.T) {
	payslipID := testutil.TestUUID(1)
	mock := &mockPayslipService{
		getFunc: func(ctx context.Context, id pgtype.UUID) (db.Payslip, error) {
			return db.Payslip{
				ID:                  payslipID,
				EmployeeOdooID:      100,
				GrossSalaryStotinki: 200000,
				NetSalaryStotinki:   150000,
			}, nil
		},
	}

	router := setupPayslipRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/payslips/00000000-0000-0000-0000-000000000001", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "ID")
}

func TestPayslipHandler_HandleGet_InvalidUUID(t *testing.T) {
	mock := &mockPayslipService{}
	router := setupPayslipRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/payslips/not-a-uuid", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestPayslipHandler_HandleGet_NotFound(t *testing.T) {
	mock := &mockPayslipService{
		getFunc: func(ctx context.Context, id pgtype.UUID) (db.Payslip, error) {
			return db.Payslip{}, service.ErrPayslipNotFound
		},
	}

	router := setupPayslipRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/payslips/00000000-0000-0000-0000-000000000001", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusNotFound)
	testutil.AssertErrorCode(t, w, "not_found")
}

func TestPayslipHandler_HandleList_MissingPayrollRunID(t *testing.T) {
	mock := &mockPayslipService{}
	router := setupPayslipRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/payslips", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "missing_param")
}

func TestPayslipHandler_HandleList_InvalidPayrollRunID(t *testing.T) {
	mock := &mockPayslipService{}
	router := setupPayslipRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/payslips?payroll_run_id=not-a-uuid", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestPayslipHandler_HandleList_Success(t *testing.T) {
	mock := &mockPayslipService{
		listByRunFunc: func(ctx context.Context, payrollRunID pgtype.UUID) ([]db.Payslip, error) {
			return []db.Payslip{
				{ID: testutil.TestUUID(1), EmployeeOdooID: 100},
				{ID: testutil.TestUUID(2), EmployeeOdooID: 101},
			}, nil
		},
	}

	router := setupPayslipRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/payslips?payroll_run_id=00000000-0000-0000-0000-000000000001", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "data")
	testutil.AssertHasField(t, resp, "total")

	if resp["total"] != float64(2) {
		t.Errorf("total = %v, want 2", resp["total"])
	}
}

func TestPayslipHandler_HandleConfirm_InvalidUUID(t *testing.T) {
	mock := &mockPayslipService{}
	router := setupPayslipRouter(mock)

	req := httptest.NewRequest(http.MethodPost, "/payslips/bad-uuid/confirm", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestPayslipHandler_HandleConfirm_NotFound(t *testing.T) {
	mock := &mockPayslipService{
		getFunc: func(ctx context.Context, id pgtype.UUID) (db.Payslip, error) {
			return db.Payslip{}, service.ErrPayslipNotFound
		},
	}

	router := setupPayslipRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/payslips/00000000-0000-0000-0000-000000000001/confirm", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusNotFound)
	testutil.AssertErrorCode(t, w, "not_found")
}

func TestPayslipHandler_HandleConfirm_Success(t *testing.T) {
	mock := &mockPayslipService{
		getFunc: func(ctx context.Context, id pgtype.UUID) (db.Payslip, error) {
			return db.Payslip{ID: id}, nil
		},
	}

	router := setupPayslipRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/payslips/00000000-0000-0000-0000-000000000001/confirm", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	if resp["status"] != "confirmed" {
		t.Errorf("status = %v, want confirmed", resp["status"])
	}
}
