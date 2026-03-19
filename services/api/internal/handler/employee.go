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

// EmployeeServicer defines the interface the handler needs from the service layer.
type EmployeeServicer interface {
	List(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error)
	Get(ctx context.Context, id int64) (*odoo.Employee, error)
	Create(ctx context.Context, req odoo.EmployeeCreateRequest) (int64, error)
	Update(ctx context.Context, id int64, vals map[string]any) error
	Deactivate(ctx context.Context, id int64) error
}

// EmployeeHandler handles HTTP requests for employee operations.
type EmployeeHandler struct {
	svc EmployeeServicer
}

// NewEmployeeHandler creates a new EmployeeHandler.
func NewEmployeeHandler(svc EmployeeServicer) *EmployeeHandler {
	return &EmployeeHandler{svc: svc}
}

// HandleList handles GET /api/v1/employees with search, department_id, page, per_page query params.
// @Summary List employees
// @Description List employees with optional search, department filter, and pagination
// @Tags Employees
// @Produce json
// @Param search query string false "Search by name or email"
// @Param department_id query integer false "Filter by department ID"
// @Param active query boolean false "Filter by active status (default true)"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 20, max 100)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /employees [get]
func (h *EmployeeHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	departmentID, _ := strconv.ParseInt(r.URL.Query().Get("department_id"), 10, 64)

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 20)
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	// Default to active employees only unless explicitly set
	activeOnly := r.URL.Query().Get("active") != "false"

	employees, total, err := h.svc.List(r.Context(), search, departmentID, activeOnly, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusInternalServerError, "list_failed", "Failed to list employees")
		return
	}

	RespondList(w, employees, int64(total), page, perPage)
}

// HandleGet handles GET /api/v1/employees/{id}.
// @Summary Get employee by ID
// @Description Retrieve a single employee by their Odoo ID
// @Tags Employees
// @Produce json
// @Param id path integer true "Employee ID"
// @Success 200 {object} odoo.Employee
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /employees/{id} [get]
func (h *EmployeeHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid employee ID")
		return
	}

	emp, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusNotFound, "not_found", "Employee not found")
		return
	}

	RespondJSON(w, http.StatusOK, emp)
}

// HandleCreate handles POST /api/v1/employees.
// @Summary Create a new employee
// @Description Create a new employee in the HR system
// @Tags Employees
// @Accept json
// @Produce json
// @Param body body odoo.EmployeeCreateRequest true "Employee details"
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /employees [post]
func (h *EmployeeHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req odoo.EmployeeCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Validate required fields
	var fieldErrors []FieldError
	if len(strings.TrimSpace(req.Name)) < 2 {
		fieldErrors = append(fieldErrors, FieldError{Field: "name", Message: "required (min 2 characters)"})
	}
	if !isValidEmail(req.WorkEmail) {
		fieldErrors = append(fieldErrors, FieldError{Field: "work_email", Message: "required and must be a valid email"})
	}
	if len(fieldErrors) > 0 {
		RespondError(w, http.StatusBadRequest, "validation_error", "Validation failed", fieldErrors...)
		return
	}

	id, err := h.svc.Create(r.Context(), req)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "create_failed", "Failed to create employee")
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]any{
		"id":      id,
		"message": "Employee created successfully",
	})
}

// HandleUpdate handles PUT /api/v1/employees/{id}.
// @Summary Update an employee
// @Description Update employee fields by ID
// @Tags Employees
// @Accept json
// @Produce json
// @Param id path integer true "Employee ID"
// @Param body body map[string]any true "Fields to update"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /employees/{id} [put]
func (h *EmployeeHandler) HandleUpdate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid employee ID")
		return
	}

	var vals map[string]any
	if err := json.NewDecoder(r.Body).Decode(&vals); err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	if err := h.svc.Update(r.Context(), id, vals); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusInternalServerError, "update_failed", "Failed to update employee")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"message": "Employee updated successfully",
	})
}

// HandleDelete handles DELETE /api/v1/employees/{id} (soft delete).
// @Summary Deactivate an employee
// @Description Soft-delete (deactivate) an employee by ID
// @Tags Employees
// @Produce json
// @Param id path integer true "Employee ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /employees/{id} [delete]
func (h *EmployeeHandler) HandleDelete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid employee ID")
		return
	}

	if err := h.svc.Deactivate(r.Context(), id); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusInternalServerError, "delete_failed", "Failed to deactivate employee")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"message": "Employee deactivated successfully",
	})
}

// intQueryParam extracts an integer query parameter with a default value.
func intQueryParam(r *http.Request, key string, defaultVal int) int {
	s := r.URL.Query().Get(key)
	if s == "" {
		return defaultVal
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal
	}
	return v
}

// int64QueryParam extracts an int64 query parameter with a default value.
func int64QueryParam(r *http.Request, key string, defaultVal int64) int64 {
	s := r.URL.Query().Get(key)
	if s == "" {
		return defaultVal
	}
	v, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return defaultVal
	}
	return v
}

// isValidEmail performs a basic email format check.
func isValidEmail(email string) bool {
	if email == "" {
		return false
	}
	at := strings.Index(email, "@")
	dot := strings.LastIndex(email, ".")
	return at > 0 && dot > at+1 && dot < len(email)-1
}
