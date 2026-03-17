package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
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
func (h *PayrollOCAHandler) HandleListStructures(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	structures, total, err := h.svc.ListStructures(r.Context(), perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list structures"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  structures,
		"total": total,
	})
}

// HandleGetStructure handles GET /api/v1/payroll/structures/{id}
func (h *PayrollOCAHandler) HandleGetStructure(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid structure id"}`, http.StatusBadRequest)
		return
	}

	structure, err := h.svc.GetStructure(r.Context(), id)
	if err != nil {
		http.Error(w, `{"error":"structure not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(structure)
}

// HandleListRules handles GET /api/v1/payroll/rules
func (h *PayrollOCAHandler) HandleListRules(w http.ResponseWriter, r *http.Request) {
	structID := int64QueryParam(r, "struct_id", 0)
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	rules, total, err := h.svc.ListRules(r.Context(), structID, perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list rules"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  rules,
		"total": total,
	})
}
