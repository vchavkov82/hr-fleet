package service

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/vchavkov/hr-backend/internal/cache"
	"github.com/vchavkov/hr-backend/platform/odoo"
)

// mockOdooClient implements OdooClient for testing.
type mockOdooClient struct {
	listFunc   func(domain []any, limit, offset int) ([]odoo.Employee, int, error)
	getFunc    func(id int64) (*odoo.Employee, error)
	createFunc func(req odoo.EmployeeCreateRequest) (int64, error)
	updateFunc func(id int64, vals map[string]any) error
}

func (m *mockOdooClient) ListEmployees(domain []any, limit, offset int) ([]odoo.Employee, int, error) {
	if m.listFunc != nil {
		return m.listFunc(domain, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockOdooClient) GetEmployee(id int64) (*odoo.Employee, error) {
	if m.getFunc != nil {
		return m.getFunc(id)
	}
	return nil, nil
}

func (m *mockOdooClient) CreateEmployee(req odoo.EmployeeCreateRequest) (int64, error) {
	if m.createFunc != nil {
		return m.createFunc(req)
	}
	return 0, nil
}

func (m *mockOdooClient) UpdateEmployee(id int64, vals map[string]any) error {
	if m.updateFunc != nil {
		return m.updateFunc(id, vals)
	}
	return nil
}

func setupTestService(t *testing.T) (*miniredis.Miniredis, *EmployeeService, *mockOdooClient) {
	t.Helper()
	mr := miniredis.RunT(t)
	c, err := cache.NewCache("redis://" + mr.Addr())
	if err != nil {
		t.Fatalf("NewCache: %v", err)
	}
	mock := &mockOdooClient{}
	svc := NewEmployeeService(mock, c)
	return mr, svc, mock
}

func TestEmployeeService_List_CacheHit(t *testing.T) {
	_, svc, mock := setupTestService(t)
	ctx := context.Background()

	odooCallCount := 0
	mock.listFunc = func(domain []any, limit, offset int) ([]odoo.Employee, int, error) {
		odooCallCount++
		return []odoo.Employee{{ID: 1, Name: "Alice"}}, 1, nil
	}

	// First call populates cache
	_, _, err := svc.List(ctx, "", 0, true, 20, 0)
	if err != nil {
		t.Fatalf("List: %v", err)
	}

	// Second call should use cache (no additional Odoo call)
	emps, total, err := svc.List(ctx, "", 0, true, 20, 0)
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if odooCallCount != 1 {
		t.Errorf("Odoo called %d times, want 1", odooCallCount)
	}
	if len(emps) != 1 || total != 1 {
		t.Errorf("got %d employees, total %d; want 1, 1", len(emps), total)
	}
}

func TestEmployeeService_List_CacheMiss_CallsOdoo(t *testing.T) {
	_, svc, mock := setupTestService(t)
	ctx := context.Background()

	called := false
	mock.listFunc = func(domain []any, limit, offset int) ([]odoo.Employee, int, error) {
		called = true
		return []odoo.Employee{{ID: 1, Name: "Bob"}}, 1, nil
	}

	emps, total, err := svc.List(ctx, "", 0, true, 20, 0)
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if !called {
		t.Error("Odoo should have been called on cache miss")
	}
	if len(emps) != 1 || emps[0].Name != "Bob" || total != 1 {
		t.Errorf("unexpected result: %+v, %d", emps, total)
	}
}

func TestEmployeeService_Create_InvalidatesCache(t *testing.T) {
	_, svc, mock := setupTestService(t)
	ctx := context.Background()

	callCount := 0
	mock.listFunc = func(domain []any, limit, offset int) ([]odoo.Employee, int, error) {
		callCount++
		return []odoo.Employee{{ID: 1}}, 1, nil
	}
	mock.createFunc = func(req odoo.EmployeeCreateRequest) (int64, error) {
		return 2, nil
	}

	// Populate cache
	_, _, _ = svc.List(ctx, "", 0, true, 20, 0)

	// Create employee (should invalidate)
	_, err := svc.Create(ctx, odoo.EmployeeCreateRequest{Name: "New", WorkEmail: "new@test.com"})
	if err != nil {
		t.Fatalf("Create: %v", err)
	}

	// Next list should call Odoo again
	_, _, _ = svc.List(ctx, "", 0, true, 20, 0)
	if callCount != 2 {
		t.Errorf("Odoo called %d times, want 2 (cache should have been invalidated)", callCount)
	}
}

func TestEmployeeService_List_GracefulDegradation_StaleCache(t *testing.T) {
	mr, svc, mock := setupTestService(t)
	ctx := context.Background()

	mock.listFunc = func(domain []any, limit, offset int) ([]odoo.Employee, int, error) {
		return []odoo.Employee{{ID: 1, Name: "Cached"}}, 1, nil
	}

	// Populate cache
	_, _, _ = svc.List(ctx, "", 0, true, 20, 0)

	// Now Odoo fails
	mock.listFunc = func(domain []any, limit, offset int) ([]odoo.Employee, int, error) {
		return nil, 0, errors.New("odoo connection refused")
	}

	// Delete primary cache (simulating expiry), keep stale
	keys := mr.Keys()
	for _, k := range keys {
		if k != "" && !contains(k, ":stale") {
			mr.Del(k)
		}
	}

	// Should return stale data
	emps, _, err := svc.List(ctx, "", 0, true, 20, 0)
	if err != nil {
		t.Fatalf("should return stale data, got error: %v", err)
	}
	if len(emps) != 1 || emps[0].Name != "Cached" {
		t.Errorf("expected stale cached data, got %+v", emps)
	}
}

func TestEmployeeService_List_Unavailable_NoCacheAtAll(t *testing.T) {
	_, svc, mock := setupTestService(t)
	ctx := context.Background()

	mock.listFunc = func(domain []any, limit, offset int) ([]odoo.Employee, int, error) {
		return nil, 0, errors.New("odoo down")
	}

	_, _, err := svc.List(ctx, "", 0, true, 20, 0)
	if !errors.Is(err, ErrServiceUnavailable) {
		t.Errorf("expected ErrServiceUnavailable, got %v", err)
	}
}

func TestEmployeeService_Get_GracefulDegradation(t *testing.T) {
	mr, svc, mock := setupTestService(t)
	ctx := context.Background()

	mock.getFunc = func(id int64) (*odoo.Employee, error) {
		return &odoo.Employee{ID: 1, Name: "Detail"}, nil
	}

	// Populate cache
	_, _ = svc.Get(ctx, 1)

	// Now Odoo fails
	mock.getFunc = func(id int64) (*odoo.Employee, error) {
		return nil, errors.New("odoo down")
	}

	// Delete primary, keep stale
	keys := mr.Keys()
	for _, k := range keys {
		if k != "" && !contains(k, ":stale") {
			mr.Del(k)
		}
	}

	emp, err := svc.Get(ctx, 1)
	if err != nil {
		t.Fatalf("should return stale, got error: %v", err)
	}
	if emp.Name != "Detail" {
		t.Errorf("expected Detail, got %s", emp.Name)
	}
	_ = mr
}

func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}
