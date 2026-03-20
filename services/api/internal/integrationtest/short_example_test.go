package integrationtest

import "testing"

// Example for future tests that need Postgres, Odoo, or Redis:
//
//	func TestLiveSomething(t *testing.T) {
//		if testing.Short() {
//			t.Skip("skipping integration test in short mode")
//		}
//		// ...
//	}
//
// CI and package scripts use: go test ./... -short -count=1
func TestShortModeConventionDocumented(t *testing.T) {
	t.Log("integration tests that need external services should call testing.Short() and t.Skip")
}
