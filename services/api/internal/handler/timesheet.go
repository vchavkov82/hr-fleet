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

// TimesheetServicer defines the interface the handler needs.
type TimesheetServicer interface {
	List(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error)
	Create(ctx context.Context, employeeID int64, date, name string, hours float64, projectID, taskID int64) (int64, error)
	Update(ctx context.Context, id int64, vals map[string]any) error
}

// TimesheetHandler handles HTTP requests for timesheet operations.
type TimesheetHandler struct {
	svc TimesheetServicer
}

// NewTimesheetHandler creates a new TimesheetHandler.
func NewTimesheetHandler(svc TimesheetServicer) *TimesheetHandler {
	return &TimesheetHandler{svc: svc}
}

// HandleList handles GET /api/v1/timesheets
// @Summary List timesheet entries
// @Description List timesheet entries with optional employee and date filters
// @Tags Timesheets
// @Produce json
// @Param employee_id query integer false "Filter by employee ID"
// @Param date_from query string false "Filter from date (YYYY-MM-DD)"
// @Param date_to query string false "Filter to date (YYYY-MM-DD)"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /timesheets [get]
func (h *TimesheetHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID := int64QueryParam(r, "employee_id", 0)
	dateFrom := r.URL.Query().Get("date_from")
	dateTo := r.URL.Query().Get("date_to")
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	entries, total, err := h.svc.List(r.Context(), employeeID, dateFrom, dateTo, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list timesheets")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  entries,
		"total": total,
		"page":  page,
	})
}

// HandleCreate handles POST /api/v1/timesheets
// @Summary Create a timesheet entry
// @Description Create a new timesheet entry for an employee
// @Tags Timesheets
// @Accept json
// @Produce json
// @Param body body object true "Timesheet entry"
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /timesheets [post]
func (h *TimesheetHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EmployeeID int64   `json:"employee_id"`
		Date       string  `json:"date"`
		Name       string  `json:"name"`
		Hours      float64 `json:"hours"`
		ProjectID  int64   `json:"project_id"`
		TaskID     int64   `json:"task_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var errs []string
	if req.EmployeeID <= 0 {
		errs = append(errs, "employee_id must be greater than 0")
	}
	if strings.TrimSpace(req.Date) == "" {
		errs = append(errs, "date is required")
	}
	if req.Hours <= 0 || req.Hours > 24 {
		errs = append(errs, "hours must be greater than 0 and at most 24")
	}
	if len(errs) > 0 {
		respondError(w, http.StatusBadRequest, strings.Join(errs, "; "))
		return
	}

	id, err := h.svc.Create(r.Context(), req.EmployeeID, req.Date, req.Name, req.Hours, req.ProjectID, req.TaskID)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create timesheet entry")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// HandleUpdate handles PUT /api/v1/timesheets/{id}
// @Summary Update a timesheet entry
// @Description Update an existing timesheet entry
// @Tags Timesheets
// @Accept json
// @Produce json
// @Param id path integer true "Timesheet entry ID"
// @Param body body object true "Timesheet fields to update"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /timesheets/{id} [put]
func (h *TimesheetHandler) HandleUpdate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid timesheet ID")
		return
	}

	var req struct {
		Date      string  `json:"date"`
		Name      string  `json:"name"`
		Hours     float64 `json:"hours"`
		ProjectID int64   `json:"project_id"`
		TaskID    int64   `json:"task_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	vals := map[string]any{}
	if req.Date != "" {
		vals["date"] = req.Date
	}
	if req.Name != "" {
		vals["name"] = req.Name
	}
	if req.Hours != 0 {
		if req.Hours <= 0 || req.Hours > 24 {
			respondError(w, http.StatusBadRequest, "hours must be greater than 0 and at most 24")
			return
		}
		vals["unit_amount"] = req.Hours
	}
	if req.ProjectID > 0 {
		vals["project_id"] = req.ProjectID
	}
	if req.TaskID > 0 {
		vals["task_id"] = req.TaskID
	}
	if len(vals) == 0 {
		respondError(w, http.StatusBadRequest, "No fields to update")
		return
	}

	if err := h.svc.Update(r.Context(), id, vals); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to update timesheet entry")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Timesheet entry updated successfully"})
}
