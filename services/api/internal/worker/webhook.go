package worker

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/hibiken/asynq"
	"github.com/vchavkov/hr/services/api/internal/service"
)

const webhookDeliveryTimeout = 10 * time.Second

// WebhookDeliverHandler processes async webhook delivery tasks.
type WebhookDeliverHandler struct {
	httpClient *http.Client
}

// NewWebhookDeliverHandler creates a new handler for webhook delivery tasks.
func NewWebhookDeliverHandler() *WebhookDeliverHandler {
	return &WebhookDeliverHandler{
		httpClient: &http.Client{
			Timeout: webhookDeliveryTimeout,
		},
	}
}

// ProcessTask delivers a webhook HTTP POST to the registered URL.
func (h *WebhookDeliverHandler) ProcessTask(ctx context.Context, t *asynq.Task) error {
	var payload service.WebhookDeliverPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, payload.URL, bytes.NewReader(payload.Body))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Webhook-Event", payload.Event)
	req.Header.Set("X-Webhook-Delivery", payload.DeliveryID)

	// HMAC-SHA256 signature
	signature := service.SignPayload(payload.Secret, payload.Body)
	req.Header.Set("X-Webhook-Signature", "sha256="+signature)

	resp, err := h.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("deliver webhook to %s: %w", payload.URL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	return fmt.Errorf("webhook delivery failed: status %d", resp.StatusCode)
}

// TaskType returns the asynq task type this handler processes.
func (h *WebhookDeliverHandler) TaskType() string {
	return service.TaskTypeWebhookDeliver
}
