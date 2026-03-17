package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// TimesheetServicer defines the interface the handler needs.
type TimesheetServicer interface {
	List(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error)
	Create(ctx context.Context, employeeID int64, date, name string, hours float64, projectID, taskID int64) (int64, error)
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
func (h *TimesheetHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID := int64QueryParam(r, "employee_id", 0)
	dateFrom := r.URL.Query().Get("date_from")
	dateTo := r.URL.Query().Get("date_to")
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	entries, total, err := h.svc.List(r.Context(), employeeID, dateFrom, dateTo, perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list timesheets"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  entries,
		"total": total,
		"page":  page,
	})
}

// HandleCreate handles POST /api/v1/timesheets
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
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	id, err := h.svc.Create(r.Context(), req.EmployeeID, req.Date, req.Name, req.Hours, req.ProjectID, req.TaskID)
	if err != nil {
		http.Error(w, `{"error":"failed to create timesheet"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"id": id})
}
