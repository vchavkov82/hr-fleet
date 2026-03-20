-- name: GetEmployee :one
SELECT id, organization_id, odoo_id, name, email, department, job_title, status, created_at, updated_at
FROM employees
WHERE id = $1 AND organization_id = $2;

-- name: GetEmployeeByOdooID :one
SELECT id, organization_id, odoo_id, name, email, department, job_title, status, created_at, updated_at
FROM employees
WHERE odoo_id = $1 AND organization_id = $2;

-- name: ListEmployees :many
SELECT id, organization_id, odoo_id, name, email, department, job_title, status, created_at, updated_at
FROM employees
WHERE organization_id = $3 AND status = coalesce(sqlc.narg('status'), status)
ORDER BY name
LIMIT $1 OFFSET $2;

-- name: CreateEmployee :one
INSERT INTO employees (organization_id, odoo_id, name, email, department, job_title, status)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, organization_id, odoo_id, name, email, department, job_title, status, created_at, updated_at;

-- name: UpdateEmployee :one
UPDATE employees
SET name = $2, email = $3, department = $4, job_title = $5, status = $6, updated_at = now()
WHERE id = $1 AND organization_id = $7
RETURNING id, organization_id, odoo_id, name, email, department, job_title, status, created_at, updated_at;
