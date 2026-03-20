-- name: CreateUser :one
INSERT INTO users (email, password_hash, role)
VALUES ($1, $2, $3)
RETURNING id, email, password_hash, role, active, created_at, updated_at;

-- name: GetUserByEmail :one
SELECT id, email, password_hash, role, active, created_at, updated_at
FROM users
WHERE email = $1;

-- name: GetUserByID :one
SELECT id, email, password_hash, role, active, created_at, updated_at
FROM users
WHERE id = $1;

-- name: UpdateUserRole :exec
UPDATE users SET role = $2, updated_at = now() WHERE id = $1;

-- name: DeactivateUser :exec
UPDATE users SET active = false, updated_at = now() WHERE id = $1;

-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens (user_id, token_hash, expires_at, organization_id)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, token_hash, expires_at, created_at, organization_id;

-- name: GetRefreshToken :one
SELECT id, user_id, token_hash, expires_at, created_at, organization_id
FROM refresh_tokens
WHERE token_hash = $1;

-- name: DeleteRefreshToken :exec
DELETE FROM refresh_tokens WHERE token_hash = $1;

-- name: DeleteExpiredRefreshTokens :exec
DELETE FROM refresh_tokens WHERE expires_at < now();

-- name: CreateAPIKey :one
INSERT INTO api_keys (user_id, organization_id, name, key_hash, key_prefix, scopes, expires_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, user_id, organization_id, name, key_hash, key_prefix, scopes, active, last_used_at, expires_at, created_at;

-- name: GetAPIKeyByHash :one
SELECT id, user_id, organization_id, name, key_hash, key_prefix, scopes, active, last_used_at, expires_at, created_at
FROM api_keys
WHERE key_hash = $1;

-- name: ListAPIKeysByUser :many
SELECT id, user_id, organization_id, name, key_hash, key_prefix, scopes, active, last_used_at, expires_at, created_at
FROM api_keys
WHERE user_id = $1 AND organization_id = $2
ORDER BY created_at DESC;

-- name: DeactivateAPIKey :exec
UPDATE api_keys SET active = false WHERE id = $1 AND organization_id = $2;

-- name: UpdateAPIKeyLastUsed :exec
UPDATE api_keys SET last_used_at = now() WHERE id = $1;
