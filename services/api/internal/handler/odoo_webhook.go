package handler

import (
	"encoding/json"
	"net/http"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog/log"
	"github.com/vchavkov/hr/services/api/internal/worker"
)

// OdooWebhookHandler handles incoming webhook callbacks from Odoo.
type OdooWebhookHandler struct {
	asynqClient *asynq.Client
	secretToken string
}

// NewOdooWebhookHandler creates a new OdooWebhookHandler.
func NewOdooWebhookHandler(asynqClient *asynq.Client, secretToken string) *OdooWebhookHandler {
	return &OdooWebhookHandler{
		asynqClient: asynqClient,
		secretToken: secretToken,
	}
}

// OdooWebhookPayload represents the webhook payload from Odoo automated actions.
type OdooWebhookPayload struct {
	Model     string  `json:"model"`
	RecordIDs []int64 `json:"record_ids"`
	Operation string  `json:"operation"` // create, write, unlink
	Token     string  `json:"token"`
}

// HandleWebhook handles POST /api/v1/webhooks/odoo
// @Summary Receive Odoo webhook
// @Description Receive webhook callbacks from Odoo automated actions
// @Tags Webhooks
// @Accept json
// @Produce json
// @Param body body OdooWebhookPayload true "Webhook payload"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /webhooks/odoo [post]
func (h *OdooWebhookHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	var payload OdooWebhookPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		log.Warn().Err(err).Msg("invalid webhook payload")
		respondError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	if h.secretToken != "" && payload.Token != h.secretToken {
		log.Warn().Msg("invalid webhook token")
		respondError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	if payload.Model == "" || len(payload.RecordIDs) == 0 {
		respondError(w, http.StatusBadRequest, "model and record_ids are required")
		return
	}

	if payload.Operation == "" {
		payload.Operation = "write"
	}

	task, err := worker.NewOdooSyncTask(payload.Model, payload.Operation, payload.RecordIDs)
	if err != nil {
		log.Error().Err(err).Msg("failed to create sync task")
		respondError(w, http.StatusInternalServerError, "Failed to queue sync task")
		return
	}

	_, err = h.asynqClient.Enqueue(task)
	if err != nil {
		log.Error().Err(err).Msg("failed to enqueue sync task")
		respondError(w, http.StatusInternalServerError, "Failed to queue sync task")
		return
	}

	log.Info().
		Str("model", payload.Model).
		Str("operation", payload.Operation).
		Ints64("ids", payload.RecordIDs).
		Msg("queued Odoo sync task")

	respondJSON(w, http.StatusOK, map[string]any{
		"message": "Sync task queued",
		"model":   payload.Model,
		"ids":     payload.RecordIDs,
	})
}
