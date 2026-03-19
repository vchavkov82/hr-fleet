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
// @Summary List departments
// @Description List all departments with pagination
// @Tags Departments
// @Produce json
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50, max 100)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /departments [get]
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
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusInternalServerError, "list_failed", "Failed to list departments")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"data":  depts,
		"total": total,
		"page":  page,
	})
}

// HandleGet handles GET /api/v1/departments/{id}
// @Summary Get department by ID
// @Description Retrieve a single department by its ID
// @Tags Departments
// @Produce json
// @Param id path integer true "Department ID"
// @Success 200 {object} odoo.Department
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /departments/{id} [get]
func (h *DepartmentHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid department ID")
		return
	}

	dept, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusNotFound, "not_found", "Department not found")
		return
	}

	RespondJSON(w, http.StatusOK, dept)
}
