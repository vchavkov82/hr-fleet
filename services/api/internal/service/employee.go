package service

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/internal/cachekeys"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// ErrServiceUnavailable is returned when Odoo is down and no cached data exists.
var ErrServiceUnavailable = errors.New("hr service temporarily unavailable")

const (
	listCacheTTL   = 5 * time.Minute
	detailCacheTTL = 5 * time.Minute
)

// OdooClient defines the interface for Odoo employee operations.
// Using an interface allows mock injection for testing.
type OdooClient interface {
	ListEmployees(ctx context.Context, domain []any, limit, offset int) ([]odoo.Employee, int, error)
	GetEmployee(ctx context.Context, id int64) (*odoo.Employee, error)
	CreateEmployee(ctx context.Context, req odoo.EmployeeCreateRequest) (int64, error)
	UpdateEmployee(ctx context.Context, id int64, vals map[string]any) error
}

// listResult is the cached structure for employee list responses.
type listResult struct {
	Employees []odoo.Employee `json:"employees"`
	Total     int             `json:"total"`
}

// EmployeeService provides business logic for employee operations with
// Redis caching and graceful degradation when Odoo is unavailable.
type EmployeeService struct {
	odoo       OdooClient
	cache      *cache.Cache
	queries    *db.Queries
	webhookSvc WebhookDispatcher
}

// NewEmployeeService creates a new EmployeeService.
func NewEmployeeService(odoo OdooClient, cache *cache.Cache, queries *db.Queries, webhookSvc WebhookDispatcher) *EmployeeService {
	return &EmployeeService{odoo: odoo, cache: cache, queries: queries, webhookSvc: webhookSvc}
}

// List retrieves employees with optional filtering, pagination, and caching.
// On Odoo failure, it falls back to stale cache data. Returns ErrServiceUnavailable
// if Odoo is down and no cache exists.
func (s *EmployeeService) List(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error) {
	key := employeeListCacheKey(ctx, search, departmentID, activeOnly, limit, offset)

	// Check primary cache
	var cached listResult
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return cached.Employees, cached.Total, nil
	}

	domain := buildEmployeeDomain(ctx, search, departmentID, activeOnly)

	employees, total, err := s.odoo.ListEmployees(ctx, domain, limit, offset)
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
	key := fmt.Sprintf("%s%s%d", cachekeys.EmployeesDetailPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx)), id)

	// Check primary cache
	var cached odoo.Employee
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return &cached, nil
	}

	emp, err := s.odoo.GetEmployee(ctx, id)
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
	id, err := s.odoo.CreateEmployee(ctx, req)
	if err != nil {
		return 0, fmt.Errorf("create employee: %w", err)
	}

	_ = s.cache.DeletePattern(ctx, employeeListInvalidatePattern(ctx))

	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"name": req.Name, "email": req.WorkEmail})
		orgID, _ := tenant.OrganizationID(ctx)
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         pgtype.UUID{},
			Action:         "employee.created",
			ResourceType:   "employee",
			ResourceID:     fmt.Sprintf("%d", id),
			Details:        details,
			OrganizationID: orgID,
		})
	}

	// Webhook dispatch
	if s.webhookSvc != nil {
		_ = s.webhookSvc.Dispatch(ctx, "employee.created", map[string]any{"id": id, "name": req.Name, "email": req.WorkEmail})
	}

	return id, nil
}

// Update updates an employee via Odoo and invalidates relevant caches.
// No graceful degradation for writes -- returns error directly.
func (s *EmployeeService) Update(ctx context.Context, id int64, vals map[string]any) error {
	if err := s.odoo.UpdateEmployee(ctx, id, vals); err != nil {
		return fmt.Errorf("update employee %d: %w", id, err)
	}

	_ = s.cache.DeletePattern(ctx, employeeListInvalidatePattern(ctx))
	_ = s.cache.DeletePattern(ctx, fmt.Sprintf("%s%s%d*", cachekeys.EmployeesDetailPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx)), id))

	if s.queries != nil {
		details, _ := json.Marshal(vals)
		orgID, _ := tenant.OrganizationID(ctx)
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         pgtype.UUID{},
			Action:         "employee.updated",
			ResourceType:   "employee",
			ResourceID:     fmt.Sprintf("%d", id),
			Details:        details,
			OrganizationID: orgID,
		})
	}

	// Webhook dispatch
	if s.webhookSvc != nil {
		_ = s.webhookSvc.Dispatch(ctx, "employee.updated", map[string]any{"id": id, "changes": vals})
	}

	return nil
}

// Deactivate performs a soft delete by setting active=false in Odoo.
func (s *EmployeeService) Deactivate(ctx context.Context, id int64) error {
	return s.Update(ctx, id, map[string]any{"active": false})
}

func buildEmployeeDomain(ctx context.Context, search string, departmentID int64, activeOnly bool) []any {
	var domain []any
	if c := tenant.OdooCompanyID(ctx); c > 0 {
		domain = append(domain, []any{"company_id", "=", c})
	}
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

func employeeListCacheKey(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) string {
	c := tenant.OdooCompanyID(ctx)
	raw := fmt.Sprintf("oc=%d&s=%s&d=%d&a=%t&l=%d&o=%d", c, search, departmentID, activeOnly, limit, offset)
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%s%s%x", cachekeys.EmployeesListPrefix, cachekeys.OdooCompanyShard(c), h[:8])
}

func employeeListInvalidatePattern(ctx context.Context) string {
	return fmt.Sprintf("%s%s*", cachekeys.EmployeesListPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx)))
}
