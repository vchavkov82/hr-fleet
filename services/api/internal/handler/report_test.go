package handler

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/testutil"
)

type mockReportService struct {
	payrollSummaryFunc  func(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.PayrollSummaryReport, error)
	taxLiabilitiesFunc  func(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.TaxLiabilityReport, error)
}

func (m *mockReportService) PayrollSummary(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.PayrollSummaryReport, error) {
	if m.payrollSummaryFunc != nil {
		return m.payrollSummaryFunc(ctx, periodStart, periodEnd)
	}
	return &service.PayrollSummaryReport{}, nil
}

func (m *mockReportService) TaxLiabilities(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.TaxLiabilityReport, error) {
	if m.taxLiabilitiesFunc != nil {
		return m.taxLiabilitiesFunc(ctx, periodStart, periodEnd)
	}
	return &service.TaxLiabilityReport{}, nil
}

func setupReportRouter(mock *mockReportService) http.Handler {
	h := NewReportHandler(mock)
	r := chi.NewRouter()
	r.Get("/reports/payroll-summary", h.HandlePayrollSummary)
	r.Get("/reports/tax-liabilities", h.HandleTaxLiabilities)
	return r
}

func TestReportHandler_HandlePayrollSummary_MissingParams(t *testing.T) {
	mock := &mockReportService{}
	router := setupReportRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/reports/payroll-summary", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "VALIDATION_ERROR")
}

func TestReportHandler_HandlePayrollSummary_InvalidPeriodStart(t *testing.T) {
	mock := &mockReportService{}
	router := setupReportRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/reports/payroll-summary?period_start=invalid&period_end=2024-01-31", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "VALIDATION_ERROR")
}

func TestReportHandler_HandlePayrollSummary_InvalidPeriodEnd(t *testing.T) {
	mock := &mockReportService{}
	router := setupReportRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/reports/payroll-summary?period_start=2024-01-01&period_end=invalid", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "VALIDATION_ERROR")
}

func TestReportHandler_HandlePayrollSummary_EndBeforeStart(t *testing.T) {
	mock := &mockReportService{}
	router := setupReportRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/reports/payroll-summary?period_start=2024-01-31&period_end=2024-01-01", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "VALIDATION_ERROR")
}

func TestReportHandler_HandlePayrollSummary_Success(t *testing.T) {
	mock := &mockReportService{
		payrollSummaryFunc: func(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.PayrollSummaryReport, error) {
			return &service.PayrollSummaryReport{
				PeriodStart:          "2024-01-01",
				PeriodEnd:            "2024-01-31",
				EmployeeCount:        10,
				TotalGrossStotinki:   500000,
				TotalNetStotinki:     400000,
			}, nil
		},
	}

	router := setupReportRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/reports/payroll-summary?period_start=2024-01-01&period_end=2024-01-31", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestReportHandler_HandlePayrollSummary_ServiceError(t *testing.T) {
	mock := &mockReportService{
		payrollSummaryFunc: func(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.PayrollSummaryReport, error) {
			return nil, errors.New("database error")
		},
	}

	router := setupReportRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/reports/payroll-summary?period_start=2024-01-01&period_end=2024-01-31", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusInternalServerError)
	testutil.AssertErrorCode(t, w, "INTERNAL_ERROR")
}

func TestReportHandler_HandleTaxLiabilities_MissingParams(t *testing.T) {
	mock := &mockReportService{}
	router := setupReportRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/reports/tax-liabilities?period_start=2024-01-01", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "VALIDATION_ERROR")
}

func TestReportHandler_HandleTaxLiabilities_Success(t *testing.T) {
	mock := &mockReportService{
		taxLiabilitiesFunc: func(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.TaxLiabilityReport, error) {
			return &service.TaxLiabilityReport{
				PeriodStart:   "2024-01-01",
				PeriodEnd:     "2024-01-31",
				EmployeeCount: 10,
				TotalStotinki: 130000,
			}, nil
		},
	}

	router := setupReportRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/reports/tax-liabilities?period_start=2024-01-01&period_end=2024-01-31", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestReportHandler_HandleTaxLiabilities_ServiceError(t *testing.T) {
	mock := &mockReportService{
		taxLiabilitiesFunc: func(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.TaxLiabilityReport, error) {
			return nil, errors.New("database error")
		},
	}

	router := setupReportRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/reports/tax-liabilities?period_start=2024-01-01&period_end=2024-01-31", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusInternalServerError)
	testutil.AssertErrorCode(t, w, "INTERNAL_ERROR")
}

func TestParsePeriodParams_ValidDates(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/test?period_start=2024-01-01&period_end=2024-01-31", nil)
	w := httptest.NewRecorder()

	start, end, ok := parsePeriodParams(w, req)
	if !ok {
		t.Fatal("expected ok=true")
	}
	if !start.Valid || !end.Valid {
		t.Error("expected valid dates")
	}
	if start.Time.Day() != 1 || end.Time.Day() != 31 {
		t.Errorf("start=%v, end=%v", start.Time, end.Time)
	}
}

func TestParsePeriodParams_MissingStart(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/test?period_end=2024-01-31", nil)
	w := httptest.NewRecorder()

	_, _, ok := parsePeriodParams(w, req)
	if ok {
		t.Error("expected ok=false for missing period_start")
	}
	testutil.AssertStatus(t, w, http.StatusBadRequest)
}

func TestParsePeriodParams_MissingEnd(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/test?period_start=2024-01-01", nil)
	w := httptest.NewRecorder()

	_, _, ok := parsePeriodParams(w, req)
	if ok {
		t.Error("expected ok=false for missing period_end")
	}
	testutil.AssertStatus(t, w, http.StatusBadRequest)
}
