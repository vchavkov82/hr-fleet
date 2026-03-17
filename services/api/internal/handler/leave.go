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

// LeaveServicer defines the interface the handler needs from the leave service.
type LeaveServicer interface {
	ListAllocations(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.LeaveAllocation, int, error)
	ListRequests(ctx context.Context, employeeID int64, status string, page, perPage int) ([]odoo.LeaveRequest, int, error)
	CreateRequest(ctx context.Context, req odoo.LeaveCreateRequest) (int64, error)
	ApproveRequest(ctx context.Context, leaveID int64, approverUserID string) error
	RejectRequest(ctx context.Context, leaveID int64, reason, rejecterUserID string) error
	CancelRequest(ctx context.Context, leaveID int64) error
}

// LeaveHandler handles HTTP requests for leave operations.
type LeaveHandler struct {
	svc LeaveServicer
}

// NewLeaveHandler creates a new LeaveHandler.
func NewLeaveHandler(svc LeaveServicer) *LeaveHandler {
	return &LeaveHandler{svc: svc}
}

// HandleListAllocations handles GET /api/v1/leave/allocations.
// @Summary List leave allocations
// @Description List leave allocations with optional employee filter
// @Tags Leave
// @Produce json
// @Param employee_id query integer false "Filter by employee ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 20, max 100)"
// @Success 200 {object} ListResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /leave/allocations [get]
func (h *LeaveHandler) HandleListAllocations(w http.ResponseWriter, r *http.Request) {
	employeeID, _ := strconv.ParseInt(r.URL.Query().Get("employee_id"), 10, 64)
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 20)
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	allocs, total, err := h.svc.ListAllocations(r.Context(), employeeID, page, perPage)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", "HR service temporarily unavailable")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list allocations")
		return
	}

	RespondList(w, allocs, int64(total), page, perPage)
}

// HandleListRequests handles GET /api/v1/leave/requests.
// @Summary List leave requests
// @Description List leave requests with optional employee and status filter
// @Tags Leave
// @Produce json
// @Param employee_id query integer false "Filter by employee ID"
// @Param status query string false "Filter by status"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 20, max 100)"
// @Success 200 {object} ListResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /leave/requests [get]
func (h *LeaveHandler) HandleListRequests(w http.ResponseWriter, r *http.Request) {
	employeeID, _ := strconv.ParseInt(r.URL.Query().Get("employee_id"), 10, 64)
	status := r.URL.Query().Get("status")
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 20)
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	requests, total, err := h.svc.ListRequests(r.Context(), employeeID, status, page, perPage)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", "HR service temporarily unavailable")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list leave requests")
		return
	}

	RespondList(w, requests, int64(total), page, perPage)
}

// HandleCreateRequest handles POST /api/v1/leave/requests.
// @Summary Create a leave request
// @Description Submit a new leave request
// @Tags Leave
// @Accept json
// @Produce json
// @Param body body odoo.LeaveCreateRequest true "Leave request details"
// @Success 201 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /leave/requests [post]
func (h *LeaveHandler) HandleCreateRequest(w http.ResponseWriter, r *http.Request) {
	var req odoo.LeaveCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	var errs []string
	if req.EmployeeID <= 0 {
		errs = append(errs, "employee_id is required")
	}
	if req.HolidayStatusID <= 0 {
		errs = append(errs, "holiday_status_id is required")
	}
	if req.DateFrom == "" {
		errs = append(errs, "date_from is required")
	}
	if req.DateTo == "" {
		errs = append(errs, "date_to is required")
	}
	if len(errs) > 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", strings.Join(errs, "; "))
		return
	}

	id, err := h.svc.CreateRequest(r.Context(), req)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create leave request")
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]any{
		"id":      id,
		"message": "Leave request created successfully",
	})
}

// HandleApproveRequest handles POST /api/v1/leave/requests/{id}/approve.
// @Summary Approve a leave request
// @Description Approve a pending leave request
// @Tags Leave
// @Produce json
// @Param id path integer true "Leave request ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /leave/requests/{id}/approve [post]
func (h *LeaveHandler) HandleApproveRequest(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid leave request ID")
		return
	}

	// In production, extract from JWT claims
	approverID := "system"

	if err := h.svc.ApproveRequest(r.Context(), id, approverID); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to approve leave request")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"message": "Leave request approved",
	})
}

// HandleRejectRequest handles POST /api/v1/leave/requests/{id}/reject.
// @Summary Reject a leave request
// @Description Reject a pending leave request with optional reason
// @Tags Leave
// @Accept json
// @Produce json
// @Param id path integer true "Leave request ID"
// @Param body body object false "Rejection reason"
// @Success 200 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /leave/requests/{id}/reject [post]
func (h *LeaveHandler) HandleRejectRequest(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid leave request ID")
		return
	}

	var body struct {
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	rejecterID := "system"

	if err := h.svc.RejectRequest(r.Context(), id, body.Reason, rejecterID); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to reject leave request")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"message": "Leave request rejected",
	})
}

// HandleCancelRequest handles DELETE /api/v1/leave/requests/{id}.
// @Summary Cancel a leave request
// @Description Cancel a leave request by setting its state to cancelled
// @Tags Leave
// @Produce json
// @Param id path integer true "Leave request ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /leave/requests/{id} [delete]
func (h *LeaveHandler) HandleCancelRequest(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid leave request ID")
		return
	}

	if err := h.svc.CancelRequest(r.Context(), id); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to cancel leave request")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"message": "Leave request cancelled",
	})
}
