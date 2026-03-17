package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// DepartmentServicer defines the interface the handler needs from the service layer.
type DepartmentServicer interface {
	List(ctx context.Context, limit, offset int) ([]odoo.Department, int, error)
	Get(ctx context.Context, id int64) (*odoo.Department, error)
}

// DepartmentHandler handles HTTP requests for department operations.
type DepartmentHandler struct {
	svc DepartmentServicer
}

// NewDepartmentHandler creates a new DepartmentHandler.
func NewDepartmentHandler(svc DepartmentServicer) *DepartmentHandler {
	return &DepartmentHandler{svc: svc}
}

// HandleList handles GET /api/v1/departments
func (h *DepartmentHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	if page < 1 {
		page = 1
	}
	if perPage > 100 {
		perPage = 100
	}
	offset := (page - 1) * perPage

	depts, total, err := h.svc.List(r.Context(), perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list departments"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  depts,
		"total": total,
		"page":  page,
	})
}

// HandleGet handles GET /api/v1/departments/{id}
func (h *DepartmentHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid department id"}`, http.StatusBadRequest)
		return
	}

	dept, err := h.svc.Get(r.Context(), id)
	if err != nil {
		http.Error(w, `{"error":"department not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dept)
}
