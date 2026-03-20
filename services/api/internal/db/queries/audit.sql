-- name: CreateAuditEntry :one
INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, organization_id)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, user_id, action, resource_type, resource_id, details, organization_id, created_at;

-- name: ListAuditEntries :many
SELECT id, user_id, action, resource_type, resource_id, details, organization_id, created_at
FROM audit_log
WHERE resource_type = coalesce(sqlc.narg('resource_type'), resource_type)
  AND (
    sqlc.narg('organization_id')::uuid IS NULL
    OR organization_id = sqlc.narg('organization_id')::uuid
  )
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
