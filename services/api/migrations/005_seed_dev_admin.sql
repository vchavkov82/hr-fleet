-- 005_seed_dev_admin.sql: Seed development admin user
-- WARNING: This creates a hardcoded dev user. Do NOT run in production.

INSERT INTO users (email, password_hash, role, active)
VALUES (
    'admin@hr.dev',
    '$2a$12$MFcfBGkA4oHnX.EOz8Lg5OYqpqTA36KgNJGag4GLDYy66bTFkOjhm',
    'super_admin',
    true
)
ON CONFLICT (email) DO NOTHING;
