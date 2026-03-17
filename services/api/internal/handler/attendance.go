package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// AttendanceServicer defines the interface the handler needs.
type AttendanceServicer interface {
	List(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.AttendanceRecord, int, error)
	CheckIn(ctx context.Context, employeeID int64) (int64, error)
	CheckOut(ctx context.Context, attendanceID int64) error
}

// AttendanceHandler handles HTTP requests for attendance operations.
type AttendanceHandler struct {
	svc AttendanceServicer
}

// NewAttendanceHandler creates a new AttendanceHandler.
func NewAttendanceHandler(svc AttendanceServicer) *AttendanceHandler {
	return &AttendanceHandler{svc: svc}
}

// HandleList handles GET /api/v1/attendance
// @Summary List attendance records
// @Description List attendance records with optional employee filter and pagination
// @Tags Attendance
// @Produce json
// @Param employee_id query integer false "Filter by employee ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /attendance [get]
func (h *AttendanceHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID := int64QueryParam(r, "employee_id", 0)
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	records, total, err := h.svc.List(r.Context(), employeeID, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list attendance records")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  records,
		"total": total,
		"page":  page,
	})
}

// HandleCheckIn handles POST /api/v1/attendance/check-in
// @Summary Check in an employee
// @Description Record an attendance check-in for an employee
// @Tags Attendance
// @Accept json
// @Produce json
// @Param body body object true "Check-in request" example({"employee_id": 1})
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /attendance/check-in [post]
func (h *AttendanceHandler) HandleCheckIn(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EmployeeID int64 `json:"employee_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.EmployeeID <= 0 {
		respondError(w, http.StatusBadRequest, "employee_id must be greater than 0")
		return
	}

	id, err := h.svc.CheckIn(r.Context(), req.EmployeeID)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to check in")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// HandleCheckOut handles POST /api/v1/attendance/{id}/check-out
// @Summary Check out an attendance record
// @Description Record an attendance check-out by attendance ID
// @Tags Attendance
// @Produce json
// @Param id path integer true "Attendance ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /attendance/{id}/check-out [post]
func (h *AttendanceHandler) HandleCheckOut(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid attendance ID")
		return
	}

	if err := h.svc.CheckOut(r.Context(), id); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to check out")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
