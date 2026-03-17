package handler

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// PayrollOCAServicer defines the interface the handler needs.
type PayrollOCAServicer interface {
	ListStructures(ctx context.Context, limit, offset int) ([]odoo.PayrollStructure, int, error)
	GetStructure(ctx context.Context, id int64) (*odoo.PayrollStructure, error)
	ListRules(ctx context.Context, structID int64, limit, offset int) ([]odoo.SalaryRule, int, error)
	ListPayslips(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.PayslipOCA, int, error)
	CreatePayslipRun(ctx context.Context, name, dateFrom, dateTo string) (int64, error)
	GeneratePayslips(ctx context.Context, runID int64) error
	ConfirmPayslipRun(ctx context.Context, runID int64) error
}

// PayrollOCAHandler handles HTTP requests for OCA payroll operations.
type PayrollOCAHandler struct {
	svc PayrollOCAServicer
}

// NewPayrollOCAHandler creates a new PayrollOCAHandler.
func NewPayrollOCAHandler(svc PayrollOCAServicer) *PayrollOCAHandler {
	return &PayrollOCAHandler{svc: svc}
}

// HandleListStructures handles GET /api/v1/payroll/structures
// @Summary List payroll structures
// @Description List all payroll structures with pagination
// @Tags Payroll OCA
// @Produce json
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /payroll/structures [get]
func (h *PayrollOCAHandler) HandleListStructures(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	structures, total, err := h.svc.ListStructures(r.Context(), perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list payroll structures")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  structures,
		"total": total,
	})
}

// HandleGetStructure handles GET /api/v1/payroll/structures/{id}
// @Summary Get payroll structure by ID
// @Description Retrieve a single payroll structure by its ID
// @Tags Payroll OCA
// @Produce json
// @Param id path integer true "Structure ID"
// @Success 200 {object} odoo.PayrollStructure
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /payroll/structures/{id} [get]
func (h *PayrollOCAHandler) HandleGetStructure(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid structure ID")
		return
	}

	structure, err := h.svc.GetStructure(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusNotFound, "Payroll structure not found")
		return
	}

	respondJSON(w, http.StatusOK, structure)
}

// HandleListRules handles GET /api/v1/payroll/rules
// @Summary List salary rules
// @Description List salary rules with optional structure filter
// @Tags Payroll OCA
// @Produce json
// @Param struct_id query integer false "Filter by structure ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /payroll/rules [get]
func (h *PayrollOCAHandler) HandleListRules(w http.ResponseWriter, r *http.Request) {
	structID := int64QueryParam(r, "struct_id", 0)
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	rules, total, err := h.svc.ListRules(r.Context(), structID, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list salary rules")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  rules,
		"total": total,
	})
}
