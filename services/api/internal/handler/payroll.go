package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/service"
)

// PayrollHandler handles HTTP requests for payroll run operations.
type PayrollHandler struct {
	svc *service.PayrollService
}

// NewPayrollHandler creates a new PayrollHandler.
func NewPayrollHandler(svc *service.PayrollService) *PayrollHandler {
	return &PayrollHandler{svc: svc}
}

type createPayrollRunRequest struct {
	PeriodStart string `json:"period_start"` // YYYY-MM-DD
	PeriodEnd   string `json:"period_end"`   // YYYY-MM-DD
}

// HandleCreate handles POST /api/v1/payroll-runs.
func (h *PayrollHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req createPayrollRunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	periodStart, err := parseDate(req.PeriodStart)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_date", "Invalid period_start date format (YYYY-MM-DD)")
		return
	}
	periodEnd, err := parseDate(req.PeriodEnd)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_date", "Invalid period_end date format (YYYY-MM-DD)")
		return
	}

	userID := userIDFromContext(r.Context())

	run, err := h.svc.Create(r.Context(), periodStart, periodEnd, userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "create_failed", "Failed to create payroll run")
		return
	}

	RespondJSON(w, http.StatusCreated, run)
}

// HandleApprove handles POST /api/v1/payroll-runs/{id}/approve.
func (h *PayrollHandler) HandleApprove(w http.ResponseWriter, r *http.Request) {
	runID, ok := parsePathUUID(w, r, "id")
	if !ok {
		return
	}
	userID := userIDFromContext(r.Context())

	err := h.svc.Approve(r.Context(), runID, userID)
	if err != nil {
		handlePayrollError(w, err)
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{"status": "approved"})
}

// HandleProcess handles POST /api/v1/payroll-runs/{id}/process.
// Returns 202 Accepted with a poll URL.
func (h *PayrollHandler) HandleProcess(w http.ResponseWriter, r *http.Request) {
	runID, ok := parsePathUUID(w, r, "id")
	if !ok {
		return
	}
	userID := userIDFromContext(r.Context())

	err := h.svc.TriggerProcessing(r.Context(), runID, userID)
	if err != nil {
		handlePayrollError(w, err)
		return
	}

	idStr := chi.URLParam(r, "id")
	w.Header().Set("Location", "/api/v1/payroll-runs/"+idStr)
	RespondJSON(w, http.StatusAccepted, map[string]string{
		"status":   "processing",
		"poll_url": "/api/v1/payroll-runs/" + idStr,
	})
}

// HandleGetStatus handles GET /api/v1/payroll-runs/{id}.
func (h *PayrollHandler) HandleGetStatus(w http.ResponseWriter, r *http.Request) {
	runID, ok := parsePathUUID(w, r, "id")
	if !ok {
		return
	}

	run, err := h.svc.GetStatus(r.Context(), runID)
	if err != nil {
		handlePayrollError(w, err)
		return
	}

	RespondJSON(w, http.StatusOK, run)
}

// HandleList handles GET /api/v1/payroll-runs.
func (h *PayrollHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 20)
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	statusStr := r.URL.Query().Get("status")
	var statusFilter pgtype.Text
	if statusStr != "" {
		statusFilter = pgtype.Text{String: statusStr, Valid: true}
	}

	runs, err := h.svc.List(r.Context(), statusFilter, int32(perPage), int32((page-1)*perPage))
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "list_failed", "Failed to list payroll runs")
		return
	}

	// Use total = len(runs) as approximation; proper count query can be added later
	RespondList(w, runs, int64(len(runs)), page, perPage)
}

// handlePayrollError maps service errors to HTTP responses.
func handlePayrollError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, service.ErrPayrollNotFound):
		RespondError(w, http.StatusNotFound, "not_found", "Payroll run not found")
	case errors.Is(err, service.ErrPayrollInvalidStatus):
		RespondError(w, http.StatusConflict, "invalid_status", "Invalid status transition")
	case errors.Is(err, service.ErrPayrollImmutable):
		RespondError(w, http.StatusConflict, "immutable", "Completed payroll runs cannot be modified")
	default:
		RespondError(w, http.StatusInternalServerError, "internal_error", err.Error())
	}
}

// parseDate parses a YYYY-MM-DD string into pgtype.Date.
func parseDate(s string) (pgtype.Date, error) {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return pgtype.Date{}, err
	}
	return pgtype.Date{
		Time:  t,
		Valid: true,
	}, nil
}

// parsePathUUID extracts and validates a UUID from the URL path.
func parsePathUUID(w http.ResponseWriter, r *http.Request, param string) (pgtype.UUID, bool) {
	idStr := chi.URLParam(r, param)
	var u pgtype.UUID
	if err := u.Scan(idStr); err != nil || !u.Valid {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid UUID")
		return pgtype.UUID{}, false
	}
	return u, true
}

// userIDFromContext extracts the user ID from JWT claims in context.
// Returns a zero UUID if not found (should be behind auth middleware).
func userIDFromContext(ctx context.Context) pgtype.UUID {
	// The auth middleware stores user_id in context via jwtauth.
	// This is a simplified extraction; actual implementation depends on auth middleware.
	var u pgtype.UUID
	if claims, ok := ctx.Value("user_id").(string); ok {
		_ = u.Scan(claims)
	}
	return u
}
