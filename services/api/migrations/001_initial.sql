-- 001_initial.sql: Initial schema for HR platform
-- Employees table synced from Odoo with local extensions

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS employees (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_id     INTEGER UNIQUE,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    department  TEXT NOT NULL DEFAULT '',
    job_title   TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_odoo_id ON employees (odoo_id) WHERE odoo_id IS NOT NULL;
CREATE INDEX idx_employees_email ON employees (email);
CREATE INDEX idx_employees_status ON employees (status);
CREATE INDEX idx_employees_department ON employees (department);
