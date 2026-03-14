-- 003_payroll_runs.sql: Payroll runs, payslips, and audit log

CREATE TABLE IF NOT EXISTS payroll_runs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start   DATE NOT NULL,
    period_end     DATE NOT NULL,
    status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'processing', 'completed', 'failed')),
    created_by     UUID NOT NULL REFERENCES users(id),
    approved_by    UUID REFERENCES users(id),
    error_details  JSONB,
    completed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_runs_status ON payroll_runs (status);

CREATE TABLE IF NOT EXISTS payslips (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id             UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_odoo_id           INTEGER NOT NULL,
    gross_salary_stotinki      BIGINT NOT NULL,
    employer_social_stotinki   BIGINT NOT NULL,
    employee_social_stotinki   BIGINT NOT NULL,
    employer_health_stotinki   BIGINT NOT NULL,
    employee_health_stotinki   BIGINT NOT NULL,
    income_tax_stotinki        BIGINT NOT NULL,
    net_salary_stotinki        BIGINT NOT NULL,
    calculation_details        JSONB,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payslips_payroll_run_id ON payslips (payroll_run_id);

CREATE TABLE IF NOT EXISTS audit_log (
    id             BIGSERIAL PRIMARY KEY,
    user_id        UUID REFERENCES users(id),
    action         TEXT NOT NULL,
    resource_type  TEXT NOT NULL,
    resource_id    TEXT NOT NULL,
    details        JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_resource ON audit_log (resource_type, resource_id);
