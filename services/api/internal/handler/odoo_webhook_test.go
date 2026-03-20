package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/hibiken/asynq"
)

type stubOdooEnqueuer struct {
	err    error
	called int
}

func (s *stubOdooEnqueuer) Enqueue(task *asynq.Task, opts ...asynq.Option) (*asynq.TaskInfo, error) {
	s.called++
	if s.err != nil {
		return nil, s.err
	}
	return &asynq.TaskInfo{}, nil
}

func TestOdooWebhookHandleWebhook_InvalidBody(t *testing.T) {
	h := NewOdooWebhookHandler(&stubOdooEnqueuer{}, "")
	req := httptest.NewRequest(http.MethodPost, "/webhooks/odoo", bytes.NewReader([]byte(`{`)))
	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d", w.Code)
	}
}

func TestOdooWebhookHandleWebhook_InvalidToken(t *testing.T) {
	h := NewOdooWebhookHandler(&stubOdooEnqueuer{}, "expected-secret")
	body, _ := json.Marshal(OdooWebhookPayload{Model: "hr.employee", RecordIDs: []int64{1}, Token: "wrong"})
	req := httptest.NewRequest(http.MethodPost, "/webhooks/odoo", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d", w.Code)
	}
}

func TestOdooWebhookHandleWebhook_Validation(t *testing.T) {
	h := NewOdooWebhookHandler(&stubOdooEnqueuer{}, "")
	body, _ := json.Marshal(OdooWebhookPayload{Model: "", RecordIDs: nil, Token: ""})
	req := httptest.NewRequest(http.MethodPost, "/webhooks/odoo", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
}

func TestOdooWebhookHandleWebhook_Success(t *testing.T) {
	enq := &stubOdooEnqueuer{}
	h := NewOdooWebhookHandler(enq, "")
	body, _ := json.Marshal(OdooWebhookPayload{Model: "hr.employee", RecordIDs: []int64{1, 2}, Operation: "write", Token: ""})
	req := httptest.NewRequest(http.MethodPost, "/webhooks/odoo", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
	if enq.called != 1 {
		t.Fatalf("Enqueue called %d times, want 1", enq.called)
	}
}

func TestOdooWebhookHandleWebhook_IDSAlias(t *testing.T) {
	enq := &stubOdooEnqueuer{}
	h := NewOdooWebhookHandler(enq, "")
	body, _ := json.Marshal(map[string]any{
		"model": "hr.employee",
		"ids":   []int64{42},
	})
	req := httptest.NewRequest(http.MethodPost, "/webhooks/odoo", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.HandleWebhook(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
	if enq.called != 1 {
		t.Fatalf("Enqueue called %d times, want 1", enq.called)
	}
}
