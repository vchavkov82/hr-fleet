package handler

import (
	"encoding/json"
	"net/http"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog/log"
	"github.com/vchavkov/hr/services/api/internal/worker"
)

// OdooSyncEnqueuer is satisfied by *asynq.Client for tests and production.
type OdooSyncEnqueuer interface {
	Enqueue(task *asynq.Task, opts ...asynq.Option) (*asynq.TaskInfo, error)
}

// OdooWebhookHandler handles incoming webhook callbacks from Odoo.
type OdooWebhookHandler struct {
	enqueuer    OdooSyncEnqueuer
	secretToken string
}

// NewOdooWebhookHandler creates a new OdooWebhookHandler.
func NewOdooWebhookHandler(enqueuer OdooSyncEnqueuer, secretToken string) *OdooWebhookHandler {
	return &OdooWebhookHandler{
		enqueuer:    enqueuer,
		secretToken: secretToken,
	}
}

// OdooWebhookPayload represents the webhook payload from Odoo automated actions.
type OdooWebhookPayload struct {
	Model     string  `json:"model"`
	RecordIDs []int64 `json:"record_ids"`
	IDs       []int64 `json:"ids"`       // alias for record_ids when easier to emit from Odoo
	Operation string  `json:"operation"` // create, write, unlink
	Token     string  `json:"token"`
	// CompanyID is Odoo res.company id; when set, cache invalidation is scoped to that company only.
	CompanyID int64 `json:"company_id"`
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
		RespondError(w, http.StatusBadRequest, "invalid_request", "Invalid payload")
		return
	}

	if h.secretToken != "" && payload.Token != h.secretToken {
		log.Warn().Msg("invalid webhook token")
		RespondError(w, http.StatusUnauthorized, "invalid_token", "Invalid token")
		return
	}

	recordIDs := payload.RecordIDs
	if len(recordIDs) == 0 {
		recordIDs = payload.IDs
	}

	if payload.Model == "" || len(recordIDs) == 0 {
		RespondError(w, http.StatusBadRequest, "validation_error", "model and record_ids (or ids) are required")
		return
	}

	if payload.Operation == "" {
		payload.Operation = "write"
	}

	task, err := worker.NewOdooSyncTask(payload.Model, payload.Operation, recordIDs, payload.CompanyID)
	if err != nil {
		log.Error().Err(err).Msg("failed to create sync task")
		RespondError(w, http.StatusInternalServerError, "task_creation_failed", "Failed to queue sync task")
		return
	}

	_, err = h.enqueuer.Enqueue(task)
	if err != nil {
		log.Error().Err(err).Msg("failed to enqueue sync task")
		RespondError(w, http.StatusInternalServerError, "enqueue_failed", "Failed to queue sync task")
		return
	}

	log.Info().
		Str("model", payload.Model).
		Str("operation", payload.Operation).
		Ints64("ids", recordIDs).
		Msg("queued Odoo sync task")

	RespondJSON(w, http.StatusOK, map[string]any{
		"message": "Sync task queued",
		"model":   payload.Model,
		"ids":     recordIDs,
	})
}
