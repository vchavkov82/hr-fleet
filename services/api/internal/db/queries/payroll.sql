-- name: CreatePayrollRun :one
INSERT INTO payroll_runs (period_start, period_end, status, created_by)
VALUES ($1, $2, $3, $4)
RETURNING id, period_start, period_end, status, created_by, approved_by, error_details, completed_at, created_at, updated_at;

-- name: GetPayrollRun :one
SELECT id, period_start, period_end, status, created_by, approved_by, error_details, completed_at, created_at, updated_at
FROM payroll_runs
WHERE id = $1;

-- name: ListPayrollRuns :many
SELECT id, period_start, period_end, status, created_by, approved_by, error_details, completed_at, created_at, updated_at
FROM payroll_runs
WHERE status = coalesce(sqlc.narg('status'), status)
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: UpdatePayrollRunStatus :exec
UPDATE payroll_runs SET status = $2, updated_at = now() WHERE id = $1;

-- name: SetPayrollRunError :exec
UPDATE payroll_runs SET status = 'failed', error_details = $2, updated_at = now() WHERE id = $1;

-- name: SetPayrollRunCompleted :exec
UPDATE payroll_runs SET status = 'completed', completed_at = now(), updated_at = now() WHERE id = $1;

-- name: CreatePayslip :one
INSERT INTO payslips (payroll_run_id, employee_odoo_id, gross_salary_stotinki, employer_social_stotinki, employee_social_stotinki, employer_health_stotinki, employee_health_stotinki, income_tax_stotinki, net_salary_stotinki, calculation_details)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, payroll_run_id, employee_odoo_id, gross_salary_stotinki, employer_social_stotinki, employee_social_stotinki, employer_health_stotinki, employee_health_stotinki, income_tax_stotinki, net_salary_stotinki, calculation_details, created_at;

-- name: ListPayslipsByRun :many
SELECT id, payroll_run_id, employee_odoo_id, gross_salary_stotinki, employer_social_stotinki, employee_social_stotinki, employer_health_stotinki, employee_health_stotinki, income_tax_stotinki, net_salary_stotinki, calculation_details, created_at
FROM payslips
WHERE payroll_run_id = $1
ORDER BY employee_odoo_id;

-- name: GetPayslip :one
SELECT id, payroll_run_id, employee_odoo_id, gross_salary_stotinki, employer_social_stotinki, employee_social_stotinki, employer_health_stotinki, employee_health_stotinki, income_tax_stotinki, net_salary_stotinki, calculation_details, created_at
FROM payslips
WHERE id = $1;
