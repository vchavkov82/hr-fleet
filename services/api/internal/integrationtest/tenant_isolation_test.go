package integrationtest

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/vchavkov/hr/services/api/internal/db"
)

// Exercises organization_members isolation against a real Postgres when
// INTEGRATION_DATABASE_URL is set (e.g. local compose). Skipped under -short
// or when the URL is unset so CI stays hermetic.
func TestTenantMembershipIsolation_Postgres(t *testing.T) {
	if testing.Short() {
		t.Skip("integration test")
	}
	dsn := os.Getenv("INTEGRATION_DATABASE_URL")
	if dsn == "" {
		t.Skip("INTEGRATION_DATABASE_URL not set")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("pgxpool: %v", err)
	}
	t.Cleanup(pool.Close)

	suffix := fmt.Sprintf("%d", os.Getpid())
	slugA := "itest-a-" + suffix
	slugB := "itest-b-" + suffix
	emailA := "itest-a-" + suffix + "@example.test"
	emailB := "itest-b-" + suffix + "@example.test"

	q := db.New(pool)
	t.Cleanup(func() {
		_, _ = pool.Exec(ctx, `DELETE FROM organizations WHERE slug IN ($1,$2)`, slugA, slugB)
		_, _ = pool.Exec(ctx, `DELETE FROM users WHERE email IN ($1,$2)`, emailA, emailB)
	})

	orgA, err := q.CreateOrganization(ctx, db.CreateOrganizationParams{
		Name:          "Itest A",
		Slug:          slugA,
		OdooCompanyID: 880000 + int64(os.Getpid()%1000),
		Status:        "active",
	})
	if err != nil {
		t.Fatal(err)
	}
	orgB, err := q.CreateOrganization(ctx, db.CreateOrganizationParams{
		Name:          "Itest B",
		Slug:          slugB,
		OdooCompanyID: 890000 + int64(os.Getpid()%1000),
		Status:        "active",
	})
	if err != nil {
		t.Fatal(err)
	}

	userA, err := q.CreateUser(ctx, db.CreateUserParams{
		Email:        emailA,
		PasswordHash: "x",
		Role:         "employee",
	})
	if err != nil {
		t.Fatal(err)
	}
	userB, err := q.CreateUser(ctx, db.CreateUserParams{
		Email:        emailB,
		PasswordHash: "x",
		Role:         "employee",
	})
	if err != nil {
		t.Fatal(err)
	}

	if err := q.AddOrganizationMember(ctx, db.AddOrganizationMemberParams{
		OrganizationID: orgA.ID,
		UserID:         userA.ID,
		Role:           "admin",
	}); err != nil {
		t.Fatal(err)
	}
	if err := q.AddOrganizationMember(ctx, db.AddOrganizationMemberParams{
		OrganizationID: orgB.ID,
		UserID:         userB.ID,
		Role:           "admin",
	}); err != nil {
		t.Fatal(err)
	}

	_, err = q.GetMembership(ctx, db.GetMembershipParams{
		UserID:         userA.ID,
		OrganizationID: orgA.ID,
	})
	if err != nil {
		t.Fatalf("user A in org A: %v", err)
	}

	_, err = q.GetMembership(ctx, db.GetMembershipParams{
		UserID:         userA.ID,
		OrganizationID: orgB.ID,
	})
	if err == nil {
		t.Fatal("user A must not be a member of org B")
	}
	if err != pgx.ErrNoRows {
		t.Fatalf("expected no rows, got %v", err)
	}
}
