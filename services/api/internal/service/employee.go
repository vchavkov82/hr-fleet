package service

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"time"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// ErrServiceUnavailable is returned when Odoo is down and no cached data exists.
var ErrServiceUnavailable = errors.New("hr service temporarily unavailable")

const (
	listCacheTTL   = 5 * time.Minute
	detailCacheTTL = 5 * time.Minute
	listKeyPrefix  = "employees:list:"
	detailKeyPfx   = "employees:detail:"
)

// OdooClient defines the interface for Odoo employee operations.
// Using an interface allows mock injection for testing.
type OdooClient interface {
	ListEmployees(domain []any, limit, offset int) ([]odoo.Employee, int, error)
	GetEmployee(id int64) (*odoo.Employee, error)
	CreateEmployee(req odoo.EmployeeCreateRequest) (int64, error)
	UpdateEmployee(id int64, vals map[string]any) error
}

// listResult is the cached structure for employee list responses.
type listResult struct {
	Employees []odoo.Employee `json:"employees"`
	Total     int             `json:"total"`
}

// EmployeeService provides business logic for employee operations with
// Redis caching and graceful degradation when Odoo is unavailable.
type EmployeeService struct {
	odoo  OdooClient
	cache *cache.Cache
}

// NewEmployeeService creates a new EmployeeService.
func NewEmployeeService(odoo OdooClient, cache *cache.Cache) *EmployeeService {
	return &EmployeeService{odoo: odoo, cache: cache}
}

// List retrieves employees with optional filtering, pagination, and caching.
// On Odoo failure, it falls back to stale cache data. Returns ErrServiceUnavailable
// if Odoo is down and no cache exists.
func (s *EmployeeService) List(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error) {
	key := listCacheKey(search, departmentID, activeOnly, limit, offset)

	// Check primary cache
	var cached listResult
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return cached.Employees, cached.Total, nil
	}

	// Build Odoo domain filters
	domain := buildDomain(search, departmentID, activeOnly)

	employees, total, err := s.odoo.ListEmployees(domain, limit, offset)
	if err != nil {
		// Graceful degradation: try stale cache
		var stale listResult
		if staleErr := s.cache.GetStale(ctx, key, &stale); staleErr == nil {
			return stale.Employees, stale.Total, nil
		}
		return nil, 0, ErrServiceUnavailable
	}

	// Cache the result
	_ = s.cache.Set(ctx, key, listResult{Employees: employees, Total: total}, listCacheTTL)

	return employees, total, nil
}

// Get retrieves a single employee by ID with caching and graceful degradation.
func (s *EmployeeService) Get(ctx context.Context, id int64) (*odoo.Employee, error) {
	key := fmt.Sprintf("%s%d", detailKeyPfx, id)

	// Check primary cache
	var cached odoo.Employee
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return &cached, nil
	}

	emp, err := s.odoo.GetEmployee(id)
	if err != nil {
		// Graceful degradation: try stale cache
		var stale odoo.Employee
		if staleErr := s.cache.GetStale(ctx, key, &stale); staleErr == nil {
			return &stale, nil
		}
		return nil, ErrServiceUnavailable
	}

	_ = s.cache.Set(ctx, key, emp, detailCacheTTL)
	return emp, nil
}

// Create creates a new employee via Odoo and invalidates list caches.
// No graceful degradation for writes -- returns error directly.
func (s *EmployeeService) Create(ctx context.Context, req odoo.EmployeeCreateRequest) (int64, error) {
	id, err := s.odoo.CreateEmployee(req)
	if err != nil {
		return 0, fmt.Errorf("create employee: %w", err)
	}

	// Invalidate list caches
	_ = s.cache.DeletePattern(ctx, listKeyPrefix+"*")

	return id, nil
}

// Update updates an employee via Odoo and invalidates relevant caches.
// No graceful degradation for writes -- returns error directly.
func (s *EmployeeService) Update(ctx context.Context, id int64, vals map[string]any) error {
	if err := s.odoo.UpdateEmployee(id, vals); err != nil {
		return fmt.Errorf("update employee %d: %w", id, err)
	}

	// Invalidate both list and detail caches
	_ = s.cache.DeletePattern(ctx, listKeyPrefix+"*")
	_ = s.cache.DeletePattern(ctx, fmt.Sprintf("%s%d*", detailKeyPfx, id))

	return nil
}

// buildDomain constructs an Odoo domain filter from search parameters.
func buildDomain(search string, departmentID int64, activeOnly bool) []any {
	var domain []any

	if search != "" {
		domain = append(domain, []any{"name", "ilike", search})
	}
	if departmentID > 0 {
		domain = append(domain, []any{"department_id", "=", departmentID})
	}
	if activeOnly {
		domain = append(domain, []any{"active", "=", true})
	}

	return domain
}

// listCacheKey generates a deterministic cache key from list parameters.
func listCacheKey(search string, departmentID int64, activeOnly bool, limit, offset int) string {
	raw := fmt.Sprintf("s=%s&d=%d&a=%t&l=%d&o=%d", search, departmentID, activeOnly, limit, offset)
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%s%x", listKeyPrefix, h[:8])
}
