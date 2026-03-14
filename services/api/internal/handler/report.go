package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/service"
)

// ReportServicer defines the interface the handler needs from the report service.
type ReportServicer interface {
	PayrollSummary(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.PayrollSummaryReport, error)
	TaxLiabilities(ctx context.Context, periodStart, periodEnd pgtype.Date) (*service.TaxLiabilityReport, error)
}

// ReportHandler handles HTTP requests for report operations.
type ReportHandler struct {
	svc ReportServicer
}

// NewReportHandler creates a new ReportHandler.
func NewReportHandler(svc ReportServicer) *ReportHandler {
	return &ReportHandler{svc: svc}
}

// HandlePayrollSummary handles GET /api/v1/reports/payroll-summary.
// @Summary Get payroll summary report
// @Description Generate payroll summary for a date period
// @Tags Reports
// @Produce json
// @Param period_start query string true "Period start (YYYY-MM-DD)"
// @Param period_end query string true "Period end (YYYY-MM-DD)"
// @Success 200 {object} service.PayrollSummaryReport
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /reports/payroll-summary [get]
func (h *ReportHandler) HandlePayrollSummary(w http.ResponseWriter, r *http.Request) {
	periodStart, periodEnd, ok := parsePeriodParams(w, r)
	if !ok {
		return
	}

	report, err := h.svc.PayrollSummary(r.Context(), periodStart, periodEnd)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to generate payroll summary")
		return
	}

	RespondJSON(w, http.StatusOK, report)
}

// HandleTaxLiabilities handles GET /api/v1/reports/tax-liabilities.
// @Summary Get tax liabilities report
// @Description Generate tax liabilities breakdown for a date period
// @Tags Reports
// @Produce json
// @Param period_start query string true "Period start (YYYY-MM-DD)"
// @Param period_end query string true "Period end (YYYY-MM-DD)"
// @Success 200 {object} service.TaxLiabilityReport
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /reports/tax-liabilities [get]
func (h *ReportHandler) HandleTaxLiabilities(w http.ResponseWriter, r *http.Request) {
	periodStart, periodEnd, ok := parsePeriodParams(w, r)
	if !ok {
		return
	}

	report, err := h.svc.TaxLiabilities(r.Context(), periodStart, periodEnd)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to generate tax liabilities report")
		return
	}

	RespondJSON(w, http.StatusOK, report)
}

// parsePeriodParams extracts and validates period_start and period_end query params.
func parsePeriodParams(w http.ResponseWriter, r *http.Request) (pgtype.Date, pgtype.Date, bool) {
	startStr := r.URL.Query().Get("period_start")
	endStr := r.URL.Query().Get("period_end")

	if startStr == "" || endStr == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "period_start and period_end are required (YYYY-MM-DD)")
		return pgtype.Date{}, pgtype.Date{}, false
	}

	startTime, err := time.Parse("2006-01-02", startStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "period_start must be YYYY-MM-DD format")
		return pgtype.Date{}, pgtype.Date{}, false
	}

	endTime, err := time.Parse("2006-01-02", endStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "period_end must be YYYY-MM-DD format")
		return pgtype.Date{}, pgtype.Date{}, false
	}

	if endTime.Before(startTime) {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "period_end must be after period_start")
		return pgtype.Date{}, pgtype.Date{}, false
	}

	start := pgtype.Date{Time: startTime, Valid: true}
	end := pgtype.Date{Time: endTime, Valid: true}

	return start, end, true
}
