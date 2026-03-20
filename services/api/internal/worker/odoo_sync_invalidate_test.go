package worker

import (
	"strings"
	"testing"
)

func TestEmployeeListInvalidatePattern(t *testing.T) {
	if got := employeeListInvalidatePattern(3); got != "employees:list:oc:3:*" {
		t.Fatalf("scoped: %q", got)
	}
	if got := employeeListInvalidatePattern(0); got != "employees:list:*" {
		t.Fatalf("global: %q", got)
	}
}

func TestEmployeeDetailInvalidatePattern(t *testing.T) {
	if got := employeeDetailInvalidatePattern(5, 99); !strings.HasPrefix(got, "employees:detail:oc:5:99") {
		t.Fatalf("scoped: %q", got)
	}
	if got := employeeDetailInvalidatePattern(0, 12); got != "employees:detail:*12*" {
		t.Fatalf("fallback: %q", got)
	}
}

func TestLeaveInvalidatePatterns(t *testing.T) {
	pats := leaveInvalidatePatterns(2)
	if len(pats) != 2 {
		t.Fatalf("want 2 patterns, got %d", len(pats))
	}
	for _, p := range pats {
		if !strings.Contains(p, "oc:2:") {
			t.Fatalf("expected shard in %q", p)
		}
	}
	global := leaveInvalidatePatterns(0)
	if len(global) != 1 || global[0] != "leave:*" {
		t.Fatalf("global leave patterns: %#v", global)
	}
}
