package handler

import (
	"context"
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr-backend/internal/service"
	"github.com/vchavkov/hr-backend/platform/odoo"
)

// EmployeeServicer defines the interface the handler needs from the service layer.
type EmployeeServicer interface {
	List(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error)
	Get(ctx context.Context, id int64) (*odoo.Employee, error)
	Create(ctx context.Context, req odoo.EmployeeCreateRequest) (int64, error)
	Update(ctx context.Context, id int64, vals map[string]any) error
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
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list employees")
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(perPage)))

	respondJSON(w, http.StatusOK, map[string]any{
		"data": employees,
		"pagination": map[string]any{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// HandleGet handles GET /api/v1/employees/{id}.
func (h *EmployeeHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	emp, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusNotFound, "Employee not found")
		return
	}

	respondJSON(w, http.StatusOK, emp)
}

// HandleCreate handles POST /api/v1/employees.
func (h *EmployeeHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req odoo.EmployeeCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	var errs []string
	if len(strings.TrimSpace(req.Name)) < 2 {
		errs = append(errs, "name is required (min 2 characters)")
	}
	if !isValidEmail(req.WorkEmail) {
		errs = append(errs, "work_email is required and must be a valid email")
	}
	if len(errs) > 0 {
		respondError(w, http.StatusBadRequest, strings.Join(errs, "; "))
		return
	}

	id, err := h.svc.Create(r.Context(), req)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create employee")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{
		"id":      id,
		"message": "Employee created successfully",
	})
}

// HandleUpdate handles PUT /api/v1/employees/{id}.
func (h *EmployeeHandler) HandleUpdate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	var vals map[string]any
	if err := json.NewDecoder(r.Body).Decode(&vals); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.svc.Update(r.Context(), id, vals); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to update employee")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"message": "Employee updated successfully",
	})
}

// respondJSON writes a JSON response with the given status code.
func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// respondError writes a JSON error response.
func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
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

// isValidEmail performs a basic email format check.
func isValidEmail(email string) bool {
	if email == "" {
		return false
	}
	at := strings.Index(email, "@")
	dot := strings.LastIndex(email, ".")
	return at > 0 && dot > at+1 && dot < len(email)-1
}
