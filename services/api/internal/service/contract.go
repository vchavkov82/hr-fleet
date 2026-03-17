package service

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

const (
	contractListCacheTTL = 5 * time.Minute
	contractListKeyPfx   = "contracts:list:"
	contractDetailKeyPfx = "contracts:detail:"
)

// ContractOdooClient defines the interface for Odoo contract operations.
type ContractOdooClient interface {
	SearchContracts(domain []any, limit, offset int) ([]odoo.Contract, int, error)
	GetContract(id int64) (*odoo.Contract, error)
	CreateContract(vals map[string]any) (int64, error)
	UpdateContract(id int64, vals map[string]any) error
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
	key := contractListCacheKey(employeeID, perPage, offset)

	var cached contractListResult
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return cached.Contracts, cached.Total, nil
	}

	var domain []any
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}

	contracts, total, err := s.odoo.SearchContracts(domain, perPage, offset)
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
	key := fmt.Sprintf("%s%d", contractDetailKeyPfx, id)

	var cached odoo.Contract
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return &cached, nil
	}

	contract, err := s.odoo.GetContract(id)
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

	id, err := s.odoo.CreateContract(vals)
	if err != nil {
		return 0, fmt.Errorf("create contract: %w", err)
	}

	_ = s.cache.DeletePattern(ctx, contractListKeyPfx+"*")

	// Audit log
	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"employee_id": req.EmployeeID, "name": req.Name})
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			Action:       "contract.created",
			ResourceType: "contract",
			ResourceID:   fmt.Sprintf("%d", id),
			Details:      details,
		})
	}

	return id, nil
}

// Update updates an existing contract via Odoo.
func (s *ContractService) Update(ctx context.Context, id int64, vals map[string]any) error {
	if err := s.odoo.UpdateContract(id, vals); err != nil {
		return fmt.Errorf("update contract %d: %w", id, err)
	}

	// Invalidate caches
	_ = s.cache.DeletePattern(ctx, contractListKeyPfx+"*")
	_ = s.cache.DeletePattern(ctx, fmt.Sprintf("%s%d", contractDetailKeyPfx, id))

	// Audit log
	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"contract_id": id, "fields": vals})
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			Action:       "contract.updated",
			ResourceType: "contract",
			ResourceID:   fmt.Sprintf("%d", id),
			Details:      details,
		})
	}

	return nil
}

func contractListCacheKey(employeeID int64, limit, offset int) string {
	raw := fmt.Sprintf("e=%d&l=%d&o=%d", employeeID, limit, offset)
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%s%x", contractListKeyPfx, h[:8])
}
