package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
)

type mockWebhookServicer struct {
	registerFunc         func(ctx context.Context, url string, events []string, createdBy pgtype.UUID) (*service.WebhookRegistrationResponse, string, error)
	listFunc             func(ctx context.Context) ([]service.WebhookRegistrationResponse, error)
	deactivateFunc       func(ctx context.Context, webhookID pgtype.UUID) error
	listDeliveriesFunc   func(ctx context.Context, webhookID pgtype.UUID, limit, offset int32) ([]db.WebhookDelivery, error)
}

func (m *mockWebhookServicer) Register(ctx context.Context, url string, events []string, createdBy pgtype.UUID) (*service.WebhookRegistrationResponse, string, error) {
	if m.registerFunc != nil {
		return m.registerFunc(ctx, url, events, createdBy)
	}
	return &service.WebhookRegistrationResponse{}, "secret", nil
}

func (m *mockWebhookServicer) List(ctx context.Context) ([]service.WebhookRegistrationResponse, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx)
	}
	return nil, nil
}

func (m *mockWebhookServicer) Deactivate(ctx context.Context, webhookID pgtype.UUID) error {
	if m.deactivateFunc != nil {
		return m.deactivateFunc(ctx, webhookID)
	}
	return nil
}

func (m *mockWebhookServicer) ListDeliveries(ctx context.Context, webhookID pgtype.UUID, limit, offset int32) ([]db.WebhookDelivery, error) {
	if m.listDeliveriesFunc != nil {
		return m.listDeliveriesFunc(ctx, webhookID, limit, offset)
	}
	return nil, nil
}

func setupWebhookRouter(mock WebhookServicer) http.Handler {
	h := NewWebhookHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Post("/webhooks", h.HandleRegister)
		r.Get("/webhooks", h.HandleList)
		r.Delete("/webhooks/{id}", h.HandleDeactivate)
		r.Get("/webhooks/{id}/deliveries", h.HandleListDeliveries)
	})
	return r
}

func TestWebhookHandleRegister_Validation(t *testing.T) {
	mock := &mockWebhookServicer{}
	router := setupWebhookRouter(mock)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks", bytes.NewReader([]byte(`{}`)))
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
}

func TestWebhookHandleRegister_Success(t *testing.T) {
	mock := &mockWebhookServicer{
		registerFunc: func(ctx context.Context, url string, events []string, createdBy pgtype.UUID) (*service.WebhookRegistrationResponse, string, error) {
			return &service.WebhookRegistrationResponse{URL: url}, "whsec_test", nil
		},
	}
	router := setupWebhookRouter(mock)
	body, _ := json.Marshal(map[string]any{"url": "https://example.com/hook", "events": []string{"employee.created"}})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
}
