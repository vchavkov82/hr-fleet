package tenant

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type ctxKey int

const (
	ctxKeyOdooCompanyID ctxKey = iota
	ctxKeyOrganizationID
)

// WithOdooCompanyID attaches the Odoo res.company id for RPC context (multi-company).
func WithOdooCompanyID(ctx context.Context, companyID int64) context.Context {
	return context.WithValue(ctx, ctxKeyOdooCompanyID, companyID)
}

// OdooCompanyID returns the Odoo company id from context, or 0 if unset.
func OdooCompanyID(ctx context.Context) int64 {
	v, _ := ctx.Value(ctxKeyOdooCompanyID).(int64)
	return v
}

// WithOrganizationID attaches the app organization (tenant) UUID.
func WithOrganizationID(ctx context.Context, id pgtype.UUID) context.Context {
	return context.WithValue(ctx, ctxKeyOrganizationID, id)
}

// OrganizationID returns the organization id from context.
func OrganizationID(ctx context.Context) (pgtype.UUID, bool) {
	v, ok := ctx.Value(ctxKeyOrganizationID).(pgtype.UUID)
	return v, ok && v.Valid
}
