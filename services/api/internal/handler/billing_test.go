package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/vchavkov/hr/services/api/internal/testutil"
)

func TestHandleCreateCheckoutSession_BillingDisabled(t *testing.T) {
	h := NewBillingHandler(nil, "", "", "", "", "")

	req := httptest.NewRequest(http.MethodPost, "/billing/checkout-session", nil)
	w := httptest.NewRecorder()
	h.HandleCreateCheckoutSession(w, req)

	testutil.AssertStatus(t, w, http.StatusNotImplemented)
	testutil.AssertErrorCode(t, w, "BILLING_DISABLED")
}

func TestHandleCreateCheckoutSession_MissingOrgContext(t *testing.T) {
	h := NewBillingHandler(nil, "sk_test_xxx", "price_xxx", "https://example.com/success", "https://example.com/cancel", "")

	req := httptest.NewRequest(http.MethodPost, "/billing/checkout-session", nil)
	w := httptest.NewRecorder()
	h.HandleCreateCheckoutSession(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "TENANT_REQUIRED")
}

func TestHandleStripeWebhook_WebhookDisabled(t *testing.T) {
	h := NewBillingHandler(nil, "", "", "", "", "")

	req := httptest.NewRequest(http.MethodPost, "/webhooks/stripe", nil)
	w := httptest.NewRecorder()
	h.HandleStripeWebhook(w, req)

	testutil.AssertStatus(t, w, http.StatusNotImplemented)
	testutil.AssertErrorCode(t, w, "BILLING_DISABLED")
}

func TestHandleStripeWebhook_InvalidSignature(t *testing.T) {
	h := NewBillingHandler(nil, "", "", "", "", "whsec_test_secret")

	payload := `{"type":"checkout.session.completed"}`
	req := testutil.NewTestRequest(http.MethodPost, "/webhooks/stripe", payload)
	req.Header.Set("Stripe-Signature", "invalid_signature")
	w := httptest.NewRecorder()
	h.HandleStripeWebhook(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
}

func TestMapStripeSubscriptionStatus(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"active", "active"},
		{"ACTIVE", "active"},
		{"Active", "active"},
		{"trialing", "trialing"},
		{"TRIALING", "trialing"},
		{"past_due", "past_due"},
		{"PAST_DUE", "past_due"},
		{"canceled", "canceled"},
		{"CANCELED", "canceled"},
		{"unpaid", "canceled"},
		{"incomplete_expired", "canceled"},
		{"unknown_status", "none"},
		{"", "none"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := mapStripeSubscriptionStatus(tt.input)
			if got != tt.want {
				t.Errorf("mapStripeSubscriptionStatus(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestOrgUUIDToString(t *testing.T) {
	tests := []struct {
		name string
		uuid testutil.TestUUIDInput
		want string
	}{
		{
			name: "valid uuid",
			uuid: testutil.TestUUIDInput{Index: 1, Valid: true},
			want: "00000000-0000-0000-0000-000000000001",
		},
		{
			name: "invalid uuid",
			uuid: testutil.TestUUIDInput{Index: 0, Valid: false},
			want: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pgUUID := testutil.TestUUIDWithValid(tt.uuid.Index, tt.uuid.Valid)
			got := orgUUIDToString(pgUUID)
			if got != tt.want {
				t.Errorf("orgUUIDToString() = %q, want %q", got, tt.want)
			}
		})
	}
}
