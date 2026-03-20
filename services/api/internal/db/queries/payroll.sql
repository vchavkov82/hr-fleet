-- name: CreatePayrollRun :one
INSERT INTO payroll_runs (period_start, period_end, status, created_by, organization_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, period_start, period_end, status, created_by, approved_by, error_details, completed_at, created_at, updated_at, organization_id;

-- name: GetPayrollRun :one
SELECT id, period_start, period_end, status, created_by, approved_by, error_details, completed_at, created_at, updated_at, organization_id
FROM payroll_runs
WHERE id = $1 AND organization_id = $2;

-- name: GetPayrollRunByID :one
SELECT id, period_start, period_end, status, created_by, approved_by, error_details, completed_at, created_at, updated_at, organization_id
FROM payroll_runs
WHERE id = $1;

-- name: ListPayrollRuns :many
SELECT id, period_start, period_end, status, created_by, approved_by, error_details, completed_at, created_at, updated_at, organization_id
FROM payroll_runs
WHERE organization_id = $3 AND status = coalesce(sqlc.narg('status'), status)
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountPayrollRuns :one
SELECT count(*)::bigint
FROM payroll_runs
WHERE organization_id = $1 AND status = coalesce(sqlc.narg('status'), status);

-- name: UpdatePayrollRunStatus :exec
UPDATE payroll_runs SET status = $2, updated_at = now() WHERE id = $1 AND organization_id = $3;

-- name: SetPayrollRunError :exec
UPDATE payroll_runs SET status = 'failed', error_details = $2, updated_at = now() WHERE id = $1 AND organization_id = $3;

-- name: SetPayrollRunCompleted :exec
UPDATE payroll_runs SET status = 'completed', completed_at = now(), updated_at = now() WHERE id = $1 AND organization_id = $2;

-- name: SetPayrollRunErrorByRunID :exec
UPDATE payroll_runs SET status = 'failed', error_details = $2, updated_at = now() WHERE id = $1;

-- name: SetPayrollRunCompletedByRunID :exec
UPDATE payroll_runs SET status = 'completed', completed_at = now(), updated_at = now() WHERE id = $1;

-- name: CreatePayslip :one
INSERT INTO payslips (payroll_run_id, employee_odoo_id, gross_salary_stotinki, employer_social_stotinki, employee_social_stotinki, employer_health_stotinki, employee_health_stotinki, income_tax_stotinki, net_salary_stotinki, calculation_details)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, payroll_run_id, employee_odoo_id, gross_salary_stotinki, employer_social_stotinki, employee_social_stotinki, employer_health_stotinki, employee_health_stotinki, income_tax_stotinki, net_salary_stotinki, calculation_details, created_at;

-- name: ListPayslipsByRun :many
SELECT p.id, p.payroll_run_id, p.employee_odoo_id, p.gross_salary_stotinki, p.employer_social_stotinki, p.employee_social_stotinki, p.employer_health_stotinki, p.employee_health_stotinki, p.income_tax_stotinki, p.net_salary_stotinki, p.calculation_details, p.created_at
FROM payslips p
JOIN payroll_runs r ON r.id = p.payroll_run_id
WHERE p.payroll_run_id = $1 AND r.organization_id = $2
ORDER BY p.employee_odoo_id;

-- name: GetPayslip :one
SELECT p.id, p.payroll_run_id, p.employee_odoo_id, p.gross_salary_stotinki, p.employer_social_stotinki, p.employee_social_stotinki, p.employer_health_stotinki, p.employee_health_stotinki, p.income_tax_stotinki, p.net_salary_stotinki, p.calculation_details, p.created_at
FROM payslips p
JOIN payroll_runs r ON r.id = p.payroll_run_id
WHERE p.id = $1 AND r.organization_id = $2;
