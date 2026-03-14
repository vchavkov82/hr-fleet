-- name: CreateWebhookRegistration :one
INSERT INTO webhook_registrations (url, events, secret, created_by)
VALUES ($1, $2, $3, $4)
RETURNING id, url, events, secret, active, created_by, created_at;

-- name: ListWebhookRegistrations :many
SELECT id, url, events, secret, active, created_by, created_at
FROM webhook_registrations
WHERE active = true
ORDER BY created_at DESC;

-- name: GetWebhookRegistration :one
SELECT id, url, events, secret, active, created_by, created_at
FROM webhook_registrations
WHERE id = $1;

-- name: DeactivateWebhook :exec
UPDATE webhook_registrations SET active = false WHERE id = $1;

-- name: CreateWebhookDelivery :one
INSERT INTO webhook_deliveries (webhook_id, event, payload)
VALUES ($1, $2, $3)
RETURNING id, webhook_id, event, payload, status, attempts, last_response_code, last_error, created_at;

-- name: UpdateWebhookDeliveryStatus :exec
UPDATE webhook_deliveries SET status = $2, attempts = $3, last_response_code = $4, last_error = $5 WHERE id = $1;

-- name: ListPendingDeliveries :many
SELECT id, webhook_id, event, payload, status, attempts, last_response_code, last_error, created_at
FROM webhook_deliveries
WHERE status = 'pending'
ORDER BY created_at
LIMIT $1;

-- name: ListDeliveriesByWebhook :many
SELECT id, webhook_id, event, payload, status, attempts, last_response_code, last_error, created_at
FROM webhook_deliveries
WHERE webhook_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
