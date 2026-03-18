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

// AppraisalServicer defines the interface the handler needs from the service layer.
type AppraisalServicer interface {
	ListAppraisals(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.Appraisal, int, error)
	GetAppraisal(ctx context.Context, id int64) (*odoo.Appraisal, error)
	CreateAppraisal(ctx context.Context, req odoo.AppraisalCreateRequest) (int64, error)
	UpdateAppraisal(ctx context.Context, id int64, vals map[string]any) error
	ConfirmAppraisal(ctx context.Context, id int64) error
	CompleteAppraisal(ctx context.Context, id int64) error
	ResetAppraisal(ctx context.Context, id int64) error
	ListTemplates(ctx context.Context, limit, offset int) ([]odoo.AppraisalTemplate, int, error)
}

// AppraisalHandler handles HTTP requests for appraisal operations.
type AppraisalHandler struct {
	svc AppraisalServicer
}

// NewAppraisalHandler creates a new AppraisalHandler.
func NewAppraisalHandler(svc AppraisalServicer) *AppraisalHandler {
	return &AppraisalHandler{svc: svc}
}

// HandleList handles GET /api/v1/appraisals
// @Summary List appraisals
// @Description List employee appraisals with optional filters
// @Tags Appraisals
// @Produce json
// @Param employee_id query integer false "Filter by employee ID"
// @Param state query string false "Filter by state (1_new, 2_pending, 3_done)"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals [get]
func (h *AppraisalHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID := int64QueryParam(r, "employee_id", 0)
	state := r.URL.Query().Get("state")
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	appraisals, total, err := h.svc.ListAppraisals(r.Context(), employeeID, state, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list appraisals")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  appraisals,
		"total": total,
	})
}

// HandleGet handles GET /api/v1/appraisals/{id}
// @Summary Get appraisal by ID
// @Description Retrieve a single appraisal by its ID
// @Tags Appraisals
// @Produce json
// @Param id path integer true "Appraisal ID"
// @Success 200 {object} odoo.Appraisal
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals/{id} [get]
func (h *AppraisalHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid appraisal ID")
		return
	}

	appraisal, err := h.svc.GetAppraisal(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusNotFound, "Appraisal not found")
		return
	}

	respondJSON(w, http.StatusOK, appraisal)
}

// HandleCreate handles POST /api/v1/appraisals
// @Summary Create a new appraisal
// @Description Create a new employee appraisal
// @Tags Appraisals
// @Accept json
// @Produce json
// @Param body body odoo.AppraisalCreateRequest true "Appraisal data"
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals [post]
func (h *AppraisalHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req odoo.AppraisalCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.EmployeeID <= 0 {
		respondError(w, http.StatusBadRequest, "employee_id is required")
		return
	}
	if req.DateClose == "" {
		respondError(w, http.StatusBadRequest, "date_close is required")
		return
	}

	id, err := h.svc.CreateAppraisal(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create appraisal")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// HandleUpdate handles PUT /api/v1/appraisals/{id}
// @Summary Update an appraisal
// @Description Update appraisal feedback and notes
// @Tags Appraisals
// @Accept json
// @Produce json
// @Param id path integer true "Appraisal ID"
// @Param body body map[string]any true "Fields to update"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals/{id} [put]
func (h *AppraisalHandler) HandleUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid appraisal ID")
		return
	}

	var vals map[string]any
	if err := json.NewDecoder(r.Body).Decode(&vals); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.svc.UpdateAppraisal(r.Context(), id, vals); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to update appraisal")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Appraisal updated successfully"})
}

// HandleConfirm handles POST /api/v1/appraisals/{id}/confirm
// @Summary Confirm appraisal
// @Description Send appraisal to employee for feedback
// @Tags Appraisals
// @Produce json
// @Param id path integer true "Appraisal ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals/{id}/confirm [post]
func (h *AppraisalHandler) HandleConfirm(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid appraisal ID")
		return
	}

	if err := h.svc.ConfirmAppraisal(r.Context(), id); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to confirm appraisal")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Appraisal confirmed and sent to employee"})
}

// HandleComplete handles POST /api/v1/appraisals/{id}/complete
// @Summary Complete appraisal
// @Description Mark appraisal as done
// @Tags Appraisals
// @Produce json
// @Param id path integer true "Appraisal ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals/{id}/complete [post]
func (h *AppraisalHandler) HandleComplete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid appraisal ID")
		return
	}

	if err := h.svc.CompleteAppraisal(r.Context(), id); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to complete appraisal")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Appraisal completed"})
}

// HandleReset handles POST /api/v1/appraisals/{id}/reset
// @Summary Reset appraisal
// @Description Reset appraisal back to draft state
// @Tags Appraisals
// @Produce json
// @Param id path integer true "Appraisal ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals/{id}/reset [post]
func (h *AppraisalHandler) HandleReset(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid appraisal ID")
		return
	}

	if err := h.svc.ResetAppraisal(r.Context(), id); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to reset appraisal")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Appraisal reset to draft"})
}

// HandleListTemplates handles GET /api/v1/appraisals/templates
// @Summary List appraisal templates
// @Description List available appraisal templates
// @Tags Appraisals
// @Produce json
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /appraisals/templates [get]
func (h *AppraisalHandler) HandleListTemplates(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	templates, total, err := h.svc.ListTemplates(r.Context(), perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list appraisal templates")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  templates,
		"total": total,
	})
}
