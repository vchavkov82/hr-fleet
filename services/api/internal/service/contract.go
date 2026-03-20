package service

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/internal/cachekeys"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

const contractListCacheTTL = 5 * time.Minute

// ContractOdooClient defines the interface for Odoo contract operations.
type ContractOdooClient interface {
	SearchContracts(ctx context.Context, domain []any, limit, offset int) ([]odoo.Contract, int, error)
	GetContract(ctx context.Context, id int64) (*odoo.Contract, error)
	CreateContract(ctx context.Context, vals map[string]any) (int64, error)
	UpdateContract(ctx context.Context, id int64, vals map[string]any) error
}

// ContractService provides business logic for contract operations.
type ContractService struct {
	odoo    ContractOdooClient
	cache   *cache.Cache
	queries *db.Queries
}

// NewContractService creates a new ContractService.
func NewContractService(odoo ContractOdooClient, cache *cache.Cache, queries *db.Queries) *ContractService {
	return &ContractService{odoo: odoo, cache: cache, queries: queries}
}

// contractListResult is the cached structure for contract list responses.
type contractListResult struct {
	Contracts []odoo.Contract `json:"contracts"`
	Total     int             `json:"total"`
}

// List retrieves contracts with optional employee filtering and pagination.
func (s *ContractService) List(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.Contract, int, error) {
	offset := (page - 1) * perPage
	key := contractListCacheKey(ctx, employeeID, perPage, offset)

	var cached contractListResult
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return cached.Contracts, cached.Total, nil
	}

	var domain []any
	if c := tenant.OdooCompanyID(ctx); c > 0 {
		domain = append(domain, []any{"company_id", "=", c})
	}
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}

	contracts, total, err := s.odoo.SearchContracts(ctx, domain, perPage, offset)
	if err != nil {
		var stale contractListResult
		if staleErr := s.cache.GetStale(ctx, key, &stale); staleErr == nil {
			return stale.Contracts, stale.Total, nil
		}
		return nil, 0, ErrServiceUnavailable
	}

	_ = s.cache.Set(ctx, key, contractListResult{Contracts: contracts, Total: total}, contractListCacheTTL)
	return contracts, total, nil
}

// Get retrieves a single contract by ID.
func (s *ContractService) Get(ctx context.Context, id int64) (*odoo.Contract, error) {
	key := fmt.Sprintf("%s%s%d", cachekeys.ContractsDetailPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx)), id)

	var cached odoo.Contract
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return &cached, nil
	}

	contract, err := s.odoo.GetContract(ctx, id)
	if err != nil {
		var stale odoo.Contract
		if staleErr := s.cache.GetStale(ctx, key, &stale); staleErr == nil {
			return &stale, nil
		}
		return nil, ErrServiceUnavailable
	}

	_ = s.cache.Set(ctx, key, contract, contractListCacheTTL)
	return contract, nil
}

// Create creates a new contract via Odoo.
func (s *ContractService) Create(ctx context.Context, req odoo.ContractCreateRequest) (int64, error) {
	vals := map[string]any{
		"employee_id": req.EmployeeID,
		"name":        req.Name,
		"date_start":  req.DateStart,
		"wage":        req.Wage,
	}
	if req.DateEnd != "" {
		vals["date_end"] = req.DateEnd
	}
	if req.StructureType > 0 {
		vals["structure_type_id"] = req.StructureType
	}
	if req.DepartmentID > 0 {
		vals["department_id"] = req.DepartmentID
	}

	id, err := s.odoo.CreateContract(ctx, vals)
	if err != nil {
		return 0, fmt.Errorf("create contract: %w", err)
	}

	_ = s.cache.DeletePattern(ctx, fmt.Sprintf("%s%s*", cachekeys.ContractsListPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx))))

	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"employee_id": req.EmployeeID, "name": req.Name})
		orgID, _ := tenant.OrganizationID(ctx)
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         pgtype.UUID{},
			Action:         "contract.created",
			ResourceType:   "contract",
			ResourceID:     fmt.Sprintf("%d", id),
			Details:        details,
			OrganizationID: orgID,
		})
	}

	return id, nil
}

// Update updates an existing contract via Odoo.
func (s *ContractService) Update(ctx context.Context, id int64, vals map[string]any) error {
	if err := s.odoo.UpdateContract(ctx, id, vals); err != nil {
		return fmt.Errorf("update contract %d: %w", id, err)
	}

	_ = s.cache.DeletePattern(ctx, fmt.Sprintf("%s%s*", cachekeys.ContractsListPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx))))
	_ = s.cache.DeletePattern(ctx, fmt.Sprintf("%s%s%d*", cachekeys.ContractsDetailPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx)), id))

	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"contract_id": id, "fields": vals})
		orgID, _ := tenant.OrganizationID(ctx)
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         pgtype.UUID{},
			Action:         "contract.updated",
			ResourceType:   "contract",
			ResourceID:     fmt.Sprintf("%d", id),
			Details:        details,
			OrganizationID: orgID,
		})
	}

	return nil
}

func contractListCacheKey(ctx context.Context, employeeID int64, limit, offset int) string {
	c := tenant.OdooCompanyID(ctx)
	raw := fmt.Sprintf("oc=%d&e=%d&l=%d&o=%d", c, employeeID, limit, offset)
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%s%s%x", cachekeys.ContractsListPrefix, cachekeys.OdooCompanyShard(c), h[:8])
}
