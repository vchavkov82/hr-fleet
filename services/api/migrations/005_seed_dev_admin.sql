-- 005_seed_dev_admin.sql: Seed development admin user
-- WARNING: This creates a hardcoded dev user. Do NOT run in production.

INSERT INTO users (email, password_hash, role, active)
VALUES (
    'admin@hr.dev',
    '$2b$12$a2UHDqw09Yqa.gk0rT2VcOHwNx3FeC7ejwLYGsfEpA1TWwjmF9YLy',
    'super_admin',
    true
)
ON CONFLICT (email) DO NOTHING;
