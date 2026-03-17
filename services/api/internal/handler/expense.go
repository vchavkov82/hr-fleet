package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// ExpenseServicer defines the interface the handler needs.
type ExpenseServicer interface {
	List(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.ExpenseReport, int, error)
	Create(ctx context.Context, employeeID int64, name string, amount float64, date string) (int64, error)
	Approve(ctx context.Context, id int64) error
	Refuse(ctx context.Context, id int64) error
}

// ExpenseHandler handles HTTP requests for expense operations.
type ExpenseHandler struct {
	svc ExpenseServicer
}

// NewExpenseHandler creates a new ExpenseHandler.
func NewExpenseHandler(svc ExpenseServicer) *ExpenseHandler {
	return &ExpenseHandler{svc: svc}
}

// HandleList handles GET /api/v1/expenses
// @Summary List expenses
// @Description List expense reports with optional employee and state filters
// @Tags Expenses
// @Produce json
// @Param employee_id query integer false "Filter by employee ID"
// @Param state query string false "Filter by state (e.g. draft, approved, refused)"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /expenses [get]
func (h *ExpenseHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID := int64QueryParam(r, "employee_id", 0)
	state := r.URL.Query().Get("state")
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	expenses, total, err := h.svc.List(r.Context(), employeeID, state, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list expenses")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  expenses,
		"total": total,
		"page":  page,
	})
}

// HandleCreate handles POST /api/v1/expenses
// @Summary Create an expense
// @Description Create a new expense report for an employee
// @Tags Expenses
// @Accept json
// @Produce json
// @Param body body object true "Expense details"
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /expenses [post]
func (h *ExpenseHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EmployeeID int64   `json:"employee_id"`
		Name       string  `json:"name"`
		Amount     float64 `json:"amount"`
		Date       string  `json:"date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var errs []string
	if req.EmployeeID <= 0 {
		errs = append(errs, "employee_id must be greater than 0")
	}
	if strings.TrimSpace(req.Name) == "" {
		errs = append(errs, "name is required")
	}
	if req.Amount <= 0 {
		errs = append(errs, "amount must be greater than 0")
	}
	if strings.TrimSpace(req.Date) == "" {
		errs = append(errs, "date is required")
	}
	if len(errs) > 0 {
		respondError(w, http.StatusBadRequest, strings.Join(errs, "; "))
		return
	}

	id, err := h.svc.Create(r.Context(), req.EmployeeID, req.Name, req.Amount, req.Date)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create expense")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// HandleUpdate handles PATCH /api/v1/expenses/{id}
// @Summary Update expense status
// @Description Approve or refuse an expense by ID
// @Tags Expenses
// @Accept json
// @Produce json
// @Param id path integer true "Expense ID"
// @Param body body object true "Action (approve or refuse)" example({"action": "approve"})
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /expenses/{id} [patch]
func (h *ExpenseHandler) HandleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid expense ID")
		return
	}

	var req struct {
		Action string `json:"action"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	switch req.Action {
	case "approve":
		if err := h.svc.Approve(r.Context(), id); err != nil {
			if errors.Is(err, service.ErrServiceUnavailable) {
				respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
				return
			}
			respondError(w, http.StatusInternalServerError, "Failed to approve expense")
			return
		}
	case "refuse":
		if err := h.svc.Refuse(r.Context(), id); err != nil {
			if errors.Is(err, service.ErrServiceUnavailable) {
				respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
				return
			}
			respondError(w, http.StatusInternalServerError, "Failed to refuse expense")
			return
		}
	default:
		respondError(w, http.StatusBadRequest, "Invalid action, use approve or refuse")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
