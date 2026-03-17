package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
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
func (h *AttendanceHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID := int64QueryParam(r, "employee_id", 0)
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	records, total, err := h.svc.List(r.Context(), employeeID, perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list attendance"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  records,
		"total": total,
		"page":  page,
	})
}

// HandleCheckIn handles POST /api/v1/attendance/check-in
func (h *AttendanceHandler) HandleCheckIn(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EmployeeID int64 `json:"employee_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	id, err := h.svc.CheckIn(r.Context(), req.EmployeeID)
	if err != nil {
		http.Error(w, `{"error":"failed to check in"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"id": id})
}

// HandleCheckOut handles POST /api/v1/attendance/check-out
func (h *AttendanceHandler) HandleCheckOut(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid attendance id"}`, http.StatusBadRequest)
		return
	}

	if err := h.svc.CheckOut(r.Context(), id); err != nil {
		http.Error(w, `{"error":"failed to check out"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
