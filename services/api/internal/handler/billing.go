package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stripe/stripe-go/v81"
	checkoutsession "github.com/stripe/stripe-go/v81/checkout/session"
	stripewebhook "github.com/stripe/stripe-go/v81/webhook"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
)

// BillingHandler creates Stripe Checkout sessions and processes Stripe webhooks.
type BillingHandler struct {
	queries       *db.Queries
	priceID       string
	successURL    string
	cancelURL     string
	webhookSecret string
}

// NewBillingHandler returns a handler; stripe.Key is set from secretKey when non-empty.
func NewBillingHandler(queries *db.Queries, secretKey, priceID, successURL, cancelURL, webhookSecret string) *BillingHandler {
	if secretKey != "" {
		stripe.Key = secretKey
	}
	return &BillingHandler{
		queries:       queries,
		priceID:       priceID,
		successURL:    successURL,
		cancelURL:     cancelURL,
		webhookSecret: webhookSecret,
	}
}

// HandleCreateCheckoutSession POST /billing/checkout-session — returns Stripe Checkout URL.
func (h *BillingHandler) HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	if h.priceID == "" || h.successURL == "" || h.cancelURL == "" || stripe.Key == "" {
		RespondError(w, http.StatusNotImplemented, "BILLING_DISABLED", "Stripe billing is not configured")
		return
	}

	orgID, ok := tenant.OrganizationID(r.Context())
	if !ok || !orgID.Valid {
		RespondError(w, http.StatusBadRequest, "TENANT_REQUIRED", "Organization context required")
		return
	}

	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{Price: stripe.String(h.priceID), Quantity: stripe.Int64(1)},
		},
		SuccessURL:        stripe.String(h.successURL),
		CancelURL:         stripe.String(h.cancelURL),
		ClientReferenceID: stripe.String(orgUUIDToString(orgID)),
	}

	sess, err := checkoutsession.New(params)
	if err != nil {
		RespondError(w, http.StatusBadGateway, "STRIPE_ERROR", "Failed to create checkout session")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{"url": sess.URL})
}

// HandleStripeWebhook POST /webhooks/stripe — verifies signature and updates subscription state.
func (h *BillingHandler) HandleStripeWebhook(w http.ResponseWriter, r *http.Request) {
	if h.webhookSecret == "" {
		RespondError(w, http.StatusNotImplemented, "BILLING_DISABLED", "Stripe webhook not configured")
		return
	}

	const maxBody = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, maxBody)
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	sig := r.Header.Get("Stripe-Signature")
	event, err := stripewebhook.ConstructEvent(payload, sig, h.webhookSecret)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		var raw struct {
			ClientReferenceID string `json:"client_reference_id"`
			Customer          string `json:"customer"`
			Subscription      string `json:"subscription"`
		}
		if err := json.Unmarshal(event.Data.Raw, &raw); err != nil {
			break
		}
		if raw.ClientReferenceID == "" || raw.Customer == "" {
			break
		}
		var orgID pgtype.UUID
		if err := orgID.Scan(raw.ClientReferenceID); err != nil {
			break
		}
		_ = h.queries.UpdateOrganizationStripe(r.Context(), db.UpdateOrganizationStripeParams{
			ID: orgID,
			StripeCustomerID: pgtype.Text{
				String: raw.Customer,
				Valid:  true,
			},
		})
		status := "trialing"
		if raw.Subscription == "" {
			status = "active"
		}
		_ = h.queries.UpdateOrganizationSubscription(r.Context(), db.UpdateOrganizationSubscriptionParams{
			ID:                 orgID,
			SubscriptionStatus: status,
		})

	case "customer.subscription.updated", "customer.subscription.deleted":
		var raw struct {
			Customer string `json:"customer"`
			Status   string `json:"status"`
		}
		if err := json.Unmarshal(event.Data.Raw, &raw); err != nil {
			break
		}
		if raw.Customer == "" {
			break
		}
		org, err := h.queries.GetOrganizationByStripeCustomerID(r.Context(), pgtype.Text{
			String: raw.Customer,
			Valid:  true,
		})
		if err != nil {
			break
		}
		mapped := mapStripeSubscriptionStatus(raw.Status)
		if event.Type == "customer.subscription.deleted" {
			mapped = "canceled"
		}
		_ = h.queries.UpdateOrganizationSubscription(r.Context(), db.UpdateOrganizationSubscriptionParams{
			ID:                 org.ID,
			SubscriptionStatus: mapped,
		})
	}

	w.WriteHeader(http.StatusOK)
}

func mapStripeSubscriptionStatus(s string) string {
	switch strings.ToLower(s) {
	case "active":
		return "active"
	case "trialing":
		return "trialing"
	case "past_due":
		return "past_due"
	case "canceled", "unpaid", "incomplete_expired":
		return "canceled"
	default:
		return "none"
	}
}

func orgUUIDToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	id, err := uuid.FromBytes(u.Bytes[:])
	if err != nil {
		return ""
	}
	return id.String()
}
