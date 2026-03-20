package service

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
)

const (
	// TaskTypeWebhookDeliver is the asynq task type for webhook delivery.
	TaskTypeWebhookDeliver = "webhook:deliver"

	// WebhookMaxRetry is the maximum number of delivery retries.
	WebhookMaxRetry = 5
)

// WebhookDispatcher defines the interface for dispatching webhook events.
// Other services use this to trigger webhook notifications.
type WebhookDispatcher interface {
	Dispatch(ctx context.Context, event string, payload any) error
}

// WebhookDeliverPayload is the payload for async webhook delivery tasks.
type WebhookDeliverPayload struct {
	WebhookID  string `json:"webhook_id"`
	DeliveryID string `json:"delivery_id"`
	URL        string `json:"url"`
	Secret     string `json:"secret"`
	Event      string `json:"event"`
	Body       []byte `json:"body"`
}

// WebhookRegistrationResponse is the API response for webhook registration.
type WebhookRegistrationResponse struct {
	ID        string   `json:"id"`
	URL       string   `json:"url"`
	Events    []string `json:"events"`
	Active    bool     `json:"active"`
	CreatedAt any      `json:"created_at"`
}

// WebhookService manages webhook registrations and dispatches events.
type WebhookService struct {
	queries     *db.Queries
	asynqClient *asynq.Client
}

// NewWebhookService creates a new WebhookService.
func NewWebhookService(queries *db.Queries, asynqClient *asynq.Client) *WebhookService {
	return &WebhookService{
		queries:     queries,
		asynqClient: asynqClient,
	}
}

// Register creates a new webhook registration and returns the HMAC secret (shown once).
func (s *WebhookService) Register(ctx context.Context, url string, events []string, createdBy pgtype.UUID) (*WebhookRegistrationResponse, string, error) {
	secret, err := generateWebhookSecret()
	if err != nil {
		return nil, "", fmt.Errorf("generate secret: %w", err)
	}

	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return nil, "", fmt.Errorf("tenant required")
	}

	reg, err := s.queries.CreateWebhookRegistration(ctx, db.CreateWebhookRegistrationParams{
		Url:            url,
		Events:         events,
		Secret:         secret,
		CreatedBy:      createdBy,
		OrganizationID: orgID,
	})
	if err != nil {
		return nil, "", fmt.Errorf("create webhook registration: %w", err)
	}

	resp := &WebhookRegistrationResponse{
		ID:        webhookUUIDToString(reg.ID),
		URL:       reg.Url,
		Events:    reg.Events,
		Active:    reg.Active,
		CreatedAt: reg.CreatedAt.Time,
	}

	return resp, secret, nil
}

// List returns active webhook registrations for the current tenant.
func (s *WebhookService) List(ctx context.Context) ([]WebhookRegistrationResponse, error) {
	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return nil, fmt.Errorf("tenant required")
	}
	regs, err := s.queries.ListWebhookRegistrations(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("list webhook registrations: %w", err)
	}

	result := make([]WebhookRegistrationResponse, len(regs))
	for i, r := range regs {
		result[i] = WebhookRegistrationResponse{
			ID:        webhookUUIDToString(r.ID),
			URL:       r.Url,
			Events:    r.Events,
			Active:    r.Active,
			CreatedAt: r.CreatedAt.Time,
		}
	}

	return result, nil
}

// Deactivate disables a webhook registration.
func (s *WebhookService) Deactivate(ctx context.Context, webhookID pgtype.UUID) error {
	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return fmt.Errorf("tenant required")
	}
	return s.queries.DeactivateWebhook(ctx, db.DeactivateWebhookParams{
		ID:             webhookID,
		OrganizationID: orgID,
	})
}

// Dispatch finds active registrations matching the event and enqueues delivery tasks.
func (s *WebhookService) Dispatch(ctx context.Context, event string, payload any) error {
	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return nil
	}
	regs, err := s.queries.ListWebhookRegistrations(ctx, orgID)
	if err != nil {
		return fmt.Errorf("list registrations: %w", err)
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal payload: %w", err)
	}

	for _, reg := range regs {
		if !matchesEvent(reg.Events, event) {
			continue
		}

		delivery, err := s.queries.CreateWebhookDelivery(ctx, db.CreateWebhookDeliveryParams{
			WebhookID: reg.ID,
			Event:     event,
			Payload:   bodyBytes,
		})
		if err != nil {
			return fmt.Errorf("create delivery record: %w", err)
		}

		taskPayload := WebhookDeliverPayload{
			WebhookID:  webhookUUIDToString(reg.ID),
			DeliveryID: webhookUUIDToString(delivery.ID),
			URL:        reg.Url,
			Secret:     reg.Secret,
			Event:      event,
			Body:       bodyBytes,
		}

		taskBytes, err := json.Marshal(taskPayload)
		if err != nil {
			return fmt.Errorf("marshal task payload: %w", err)
		}

		task := asynq.NewTask(TaskTypeWebhookDeliver, taskBytes,
			asynq.MaxRetry(WebhookMaxRetry),
			asynq.Queue("webhooks"),
		)

		if _, err := s.asynqClient.EnqueueContext(ctx, task); err != nil {
			return fmt.Errorf("enqueue delivery: %w", err)
		}
	}

	return nil
}

// ListDeliveries returns delivery history for a webhook.
func (s *WebhookService) ListDeliveries(ctx context.Context, webhookID pgtype.UUID, limit, offset int32) ([]db.WebhookDelivery, error) {
	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return nil, fmt.Errorf("tenant required")
	}
	if _, err := s.queries.GetWebhookRegistration(ctx, db.GetWebhookRegistrationParams{
		ID:             webhookID,
		OrganizationID: orgID,
	}); err != nil {
		return nil, err
	}
	return s.queries.ListDeliveriesByWebhook(ctx, db.ListDeliveriesByWebhookParams{
		WebhookID: webhookID,
		Limit:     limit,
		Offset:    offset,
	})
}

// SignPayload creates an HMAC-SHA256 signature for a webhook payload.
func SignPayload(secret string, body []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}

// generateWebhookSecret generates a random 32-byte hex-encoded secret.
func generateWebhookSecret() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// matchesEvent checks if an event matches any of the registered event patterns.
func matchesEvent(events []string, event string) bool {
	for _, e := range events {
		if e == "*" || e == event {
			return true
		}
	}
	return false
}

// webhookUUIDToString converts a pgtype.UUID to string.
func webhookUUIDToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	b := u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
