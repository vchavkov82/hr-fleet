package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
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
func (h *ExpenseHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID := int64QueryParam(r, "employee_id", 0)
	state := r.URL.Query().Get("state")
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	expenses, total, err := h.svc.List(r.Context(), employeeID, state, perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list expenses"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  expenses,
		"total": total,
		"page":  page,
	})
}

// HandleCreate handles POST /api/v1/expenses
func (h *ExpenseHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EmployeeID int64   `json:"employee_id"`
		Name       string  `json:"name"`
		Amount     float64 `json:"amount"`
		Date       string  `json:"date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	id, err := h.svc.Create(r.Context(), req.EmployeeID, req.Name, req.Amount, req.Date)
	if err != nil {
		http.Error(w, `{"error":"failed to create expense"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"id": id})
}

// HandleApprove handles PATCH /api/v1/expenses/{id} with action=approve
func (h *ExpenseHandler) HandleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid expense id"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		Action string `json:"action"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	switch req.Action {
	case "approve":
		if err := h.svc.Approve(r.Context(), id); err != nil {
			http.Error(w, `{"error":"failed to approve expense"}`, http.StatusInternalServerError)
			return
		}
	case "refuse":
		if err := h.svc.Refuse(r.Context(), id); err != nil {
			http.Error(w, `{"error":"failed to refuse expense"}`, http.StatusInternalServerError)
			return
		}
	default:
		http.Error(w, `{"error":"invalid action, use approve or refuse"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
