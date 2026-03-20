-- 006_organizations.sql: Multi-tenant organizations, memberships, org-scoped data

CREATE TABLE IF NOT EXISTS organizations (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  TEXT NOT NULL,
    slug                  TEXT NOT NULL UNIQUE,
    odoo_company_id       BIGINT NOT NULL UNIQUE,
    status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'canceled')),
    stripe_customer_id    TEXT,
    subscription_status   TEXT NOT NULL DEFAULT 'none' CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled')),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_status ON organizations (status);

CREATE TABLE IF NOT EXISTS organization_members (
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'hr_manager', 'payroll_manager', 'recruiter', 'employee', 'viewer')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX idx_organization_members_user_id ON organization_members (user_id);

-- Default dev tenant (Odoo default company id is usually 1)
INSERT INTO organizations (name, slug, odoo_company_id, status)
SELECT 'Development', 'dev', 1, 'active'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'dev');

-- Link existing users to dev org as org admin (global super_admin stays on users.role)
INSERT INTO organization_members (organization_id, user_id, role)
SELECT o.id, u.id, 'admin'
FROM organizations o
CROSS JOIN users u
WHERE o.slug = 'dev'
  AND NOT EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.organization_id = o.id AND m.user_id = u.id
  );

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_org ON refresh_tokens (user_id, organization_id);

ALTER TABLE api_keys
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

UPDATE api_keys k
SET organization_id = (SELECT id FROM organizations WHERE slug = 'dev' LIMIT 1)
WHERE organization_id IS NULL;

ALTER TABLE api_keys
    ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON api_keys (organization_id);

ALTER TABLE webhook_registrations
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

UPDATE webhook_registrations w
SET organization_id = (SELECT id FROM organizations WHERE slug = 'dev' LIMIT 1)
WHERE organization_id IS NULL;

ALTER TABLE webhook_registrations
    ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_webhook_registrations_org ON webhook_registrations (organization_id);

ALTER TABLE payroll_runs
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

UPDATE payroll_runs p
SET organization_id = (SELECT id FROM organizations WHERE slug = 'dev' LIMIT 1)
WHERE organization_id IS NULL;

ALTER TABLE payroll_runs
    ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payroll_runs_organization_id ON payroll_runs (organization_id);

ALTER TABLE audit_log
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

UPDATE audit_log a
SET organization_id = (SELECT id FROM organizations WHERE slug = 'dev' LIMIT 1)
WHERE organization_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_organization_id ON audit_log (organization_id);

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

UPDATE employees e
SET organization_id = (SELECT id FROM organizations WHERE slug = 'dev' LIMIT 1)
WHERE organization_id IS NULL;

ALTER TABLE employees
    ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_organization_email ON employees (organization_id, email);

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees (organization_id);
