package tenant

import (
	"context"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
)

func TestOdooCompanyID_RoundTrip(t *testing.T) {
	ctx := WithOdooCompanyID(context.Background(), 42)
	if got := OdooCompanyID(ctx); got != 42 {
		t.Fatalf("OdooCompanyID = %d, want 42", got)
	}
	if OdooCompanyID(context.Background()) != 0 {
		t.Fatal("unset context should return 0")
	}
}

func TestOrganizationID_RoundTrip(t *testing.T) {
	var id pgtype.UUID
	if err := id.Scan("550e8400-e29b-41d4-a716-446655440000"); err != nil {
		t.Fatal(err)
	}
	ctx := WithOrganizationID(context.Background(), id)
	got, ok := OrganizationID(ctx)
	if !ok || !got.Valid {
		t.Fatal("expected valid organization id")
	}
	if _, ok := OrganizationID(context.Background()); ok {
		t.Fatal("unset context should not report organization")
	}
}
