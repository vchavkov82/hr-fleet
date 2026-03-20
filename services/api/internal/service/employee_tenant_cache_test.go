package service

import (
	"context"
	"strings"
	"testing"

	"github.com/vchavkov/hr/services/api/internal/tenant"
)

func TestEmployeeListCacheKey_differsByOdooCompany(t *testing.T) {
	ctx1 := tenant.WithOdooCompanyID(context.Background(), 1)
	ctx2 := tenant.WithOdooCompanyID(context.Background(), 2)
	k1 := employeeListCacheKey(ctx1, "x", 0, true, 10, 0)
	k2 := employeeListCacheKey(ctx2, "x", 0, true, 10, 0)
	if k1 == k2 {
		t.Fatalf("keys should differ for different companies: %q vs %q", k1, k2)
	}
	if !strings.Contains(k1, "oc:1:") || !strings.Contains(k2, "oc:2:") {
		t.Fatalf("expected odoo shard in keys: %q %q", k1, k2)
	}
}

func TestEmployeeListInvalidatePattern_scopedToCompany(t *testing.T) {
	ctx := tenant.WithOdooCompanyID(context.Background(), 7)
	p := employeeListInvalidatePattern(ctx)
	if want := "employees:list:oc:7:*"; p != want {
		t.Fatalf("pattern = %q, want %q", p, want)
	}
}
