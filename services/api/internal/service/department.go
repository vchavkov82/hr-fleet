package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// DepartmentOdooClient defines the Odoo interface for department operations.
type DepartmentOdooClient interface {
	ListDepartments(domain []any, limit, offset int) ([]odoo.Department, int, error)
	GetDepartment(id int64) (*odoo.Department, error)
}

// DepartmentService provides business logic for department operations.
type DepartmentService struct {
	odoo  DepartmentOdooClient
	cache *cache.Cache
}

// NewDepartmentService creates a new DepartmentService.
func NewDepartmentService(odoo DepartmentOdooClient, cache *cache.Cache) *DepartmentService {
	return &DepartmentService{odoo: odoo, cache: cache}
}

// List retrieves departments with optional filtering and pagination.
func (s *DepartmentService) List(ctx context.Context, limit, offset int) ([]odoo.Department, int, error) {
	depts, total, err := s.odoo.ListDepartments(nil, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list departments: %w", err)
	}
	return depts, total, nil
}

// Get retrieves a single department by ID.
func (s *DepartmentService) Get(ctx context.Context, id int64) (*odoo.Department, error) {
	dept, err := s.odoo.GetDepartment(id)
	if err != nil {
		return nil, fmt.Errorf("get department: %w", err)
	}
	return dept, nil
}
