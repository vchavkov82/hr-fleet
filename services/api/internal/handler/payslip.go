package handler

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
)

// PayslipServicer defines the interface for payslip operations.
type PayslipServicer interface {
	Get(ctx context.Context, id pgtype.UUID) (db.Payslip, error)
	List(ctx context.Context, payrollRunID pgtype.UUID, limit, offset int) ([]db.ListPayslipsRow, int64, error)
	ListByRun(ctx context.Context, payrollRunID pgtype.UUID) ([]db.Payslip, error)
}

// PayslipHandler handles HTTP requests for payslip operations.
type PayslipHandler struct {
	svc PayslipServicer
}

// NewPayslipHandler creates a new PayslipHandler.
func NewPayslipHandler(svc PayslipServicer) *PayslipHandler {
	return &PayslipHandler{svc: svc}
}

// HandleGet handles GET /api/v1/payslips/{id}.
// @Summary Get payslip by ID
// @Description Retrieve a single payslip by UUID
// @Tags Payslips
// @Produce json
// @Param id path string true "Payslip ID (UUID)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /payslips/{id} [get]
func (h *PayslipHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePathUUID(w, r, "id")
	if !ok {
		return
	}

	payslip, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrPayslipNotFound) {
			RespondError(w, http.StatusNotFound, "not_found", "Payslip not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "internal_error", "Failed to get payslip")
		return
	}

	RespondJSON(w, http.StatusOK, payslip)
}

// HandleList handles GET /api/v1/payslips.
// @Summary List payslips
// @Description List payslips with pagination, optionally filtered by payroll run
// @Tags Payslips
// @Produce json
// @Param payroll_run_id query string false "Filter by payroll run ID (UUID)"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 25)"
// @Success 200 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /payslips [get]
func (h *PayslipHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 25)
	offset := (page - 1) * perPage

	var runID pgtype.UUID
	if runIDStr := r.URL.Query().Get("payroll_run_id"); runIDStr != "" {
		if err := runID.Scan(runIDStr); err != nil || !runID.Valid {
			RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid payroll_run_id UUID")
			return
		}
	}

	payslips, total, err := h.svc.List(r.Context(), runID, perPage, offset)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "list_failed", "Failed to list payslips")
		return
	}

	RespondList(w, payslips, total, page, perPage)
}

// HandleConfirm handles POST /api/v1/payslips/{id}/confirm.
// @Summary Confirm a payslip
// @Description Confirm a payslip has been reviewed
// @Tags Payslips
// @Produce json
// @Param id path string true "Payslip ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /payslips/{id}/confirm [post]
func (h *PayslipHandler) HandleConfirm(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePathUUID(w, r, "id")
	if !ok {
		return
	}

	// Verify payslip exists
	_, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrPayslipNotFound) {
			RespondError(w, http.StatusNotFound, "not_found", "Payslip not found")
			return
		}
		RespondError(w, http.StatusInternalServerError, "internal_error", "Failed to confirm payslip")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{"status": "confirmed"})
}
