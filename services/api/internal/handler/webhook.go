package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
)

// WebhookServicer defines the interface the handler needs from the webhook service.
type WebhookServicer interface {
	Register(ctx context.Context, url string, events []string, createdBy pgtype.UUID) (*service.WebhookRegistrationResponse, string, error)
	List(ctx context.Context) ([]service.WebhookRegistrationResponse, error)
	Deactivate(ctx context.Context, webhookID pgtype.UUID) error
	ListDeliveries(ctx context.Context, webhookID pgtype.UUID, limit, offset int32) ([]db.WebhookDelivery, error)
}

// WebhookHandler handles HTTP requests for webhook operations.
type WebhookHandler struct {
	svc WebhookServicer
}

// NewWebhookHandler creates a new WebhookHandler.
func NewWebhookHandler(svc WebhookServicer) *WebhookHandler {
	return &WebhookHandler{svc: svc}
}

type registerWebhookRequest struct {
	URL    string   `json:"url"`
	Events []string `json:"events"`
}

// HandleRegister handles POST /api/v1/webhooks.
func (h *WebhookHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req registerWebhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	if req.URL == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "url is required")
		return
	}
	if len(req.Events) == 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "at least one event is required")
		return
	}

	_, claims, _ := jwtauth.FromContext(r.Context())
	userIDStr, _ := claims["sub"].(string)
	userID := parseUUID(userIDStr)

	reg, secret, err := h.svc.Register(r.Context(), req.URL, req.Events, userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to register webhook")
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]any{
		"data":   reg,
		"secret": secret,
	})
}

// HandleList handles GET /api/v1/webhooks.
func (h *WebhookHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	regs, err := h.svc.List(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list webhooks")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{"data": regs})
}

// HandleDeactivate handles DELETE /api/v1/webhooks/{id}.
func (h *WebhookHandler) HandleDeactivate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id := parseUUID(idStr)

	if err := h.svc.Deactivate(r.Context(), id); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to deactivate webhook")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{"message": "Webhook deactivated"})
}

// HandleListDeliveries handles GET /api/v1/webhooks/{id}/deliveries.
func (h *WebhookHandler) HandleListDeliveries(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id := parseUUID(idStr)

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 20)
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	deliveries, err := h.svc.ListDeliveries(r.Context(), id, int32(perPage), int32(offset))
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list deliveries")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{"data": deliveries})
}
