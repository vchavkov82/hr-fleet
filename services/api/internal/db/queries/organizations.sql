-- name: GetOrganizationByID :one
SELECT id, name, slug, odoo_company_id, status, stripe_customer_id, subscription_status, created_at, updated_at
FROM organizations
WHERE id = $1;

-- name: GetOrganizationBySlug :one
SELECT id, name, slug, odoo_company_id, status, stripe_customer_id, subscription_status, created_at, updated_at
FROM organizations
WHERE slug = $1;

-- name: GetOrganizationByOdooCompanyID :one
SELECT id, name, slug, odoo_company_id, status, stripe_customer_id, subscription_status, created_at, updated_at
FROM organizations
WHERE odoo_company_id = $1;

-- name: GetOrganizationByStripeCustomerID :one
SELECT id, name, slug, odoo_company_id, status, stripe_customer_id, subscription_status, created_at, updated_at
FROM organizations
WHERE stripe_customer_id = $1;

-- name: GetFirstActiveOrganization :one
SELECT id, name, slug, odoo_company_id, status, stripe_customer_id, subscription_status, created_at, updated_at
FROM organizations
WHERE status = 'active'
ORDER BY created_at ASC
LIMIT 1;

-- name: CreateOrganization :one
INSERT INTO organizations (name, slug, odoo_company_id, status)
VALUES ($1, $2, $3, $4)
RETURNING id, name, slug, odoo_company_id, status, stripe_customer_id, subscription_status, created_at, updated_at;

-- name: UpdateOrganizationStripe :exec
UPDATE organizations
SET stripe_customer_id = $2, updated_at = now()
WHERE id = $1;

-- name: UpdateOrganizationSubscription :exec
UPDATE organizations
SET subscription_status = $2, updated_at = now()
WHERE id = $1;

-- name: AddOrganizationMember :exec
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ($1, $2, $3)
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- name: ListMembershipsByUser :many
SELECT
    om.organization_id,
    om.user_id,
    om.role,
    o.name AS organization_name,
    o.slug,
    o.odoo_company_id,
    o.status,
    o.subscription_status,
    o.created_at AS organization_created_at
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = $1
ORDER BY om.created_at ASC;

-- name: GetMembership :one
SELECT
    om.organization_id,
    om.user_id,
    om.role,
    o.name AS organization_name,
    o.slug,
    o.odoo_company_id,
    o.status,
    o.subscription_status
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = $1 AND om.organization_id = $2;
