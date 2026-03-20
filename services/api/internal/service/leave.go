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

const (
	leaveAllocCacheTTL = 5 * time.Minute
	leaveReqCacheTTL   = 5 * time.Minute
)

// LeaveOdooClient defines the interface for Odoo leave operations.
type LeaveOdooClient interface {
	SearchLeaveAllocations(ctx context.Context, domain []any, limit, offset int) ([]odoo.LeaveAllocation, int, error)
	SearchLeaveRequests(ctx context.Context, domain []any, limit, offset int) ([]odoo.LeaveRequest, int, error)
	CreateLeaveRequest(ctx context.Context, vals map[string]any) (int64, error)
	ActionApproveLeave(ctx context.Context, leaveID int64) error
	ActionRefuseLeave(ctx context.Context, leaveID int64) error
	CancelLeaveRequest(ctx context.Context, id int64) error
}

// LeaveService provides business logic for leave management.
type LeaveService struct {
	odoo       LeaveOdooClient
	cache      *cache.Cache
	queries    *db.Queries
	webhookSvc WebhookDispatcher
}

// NewLeaveService creates a new LeaveService.
func NewLeaveService(odoo LeaveOdooClient, cache *cache.Cache, queries *db.Queries, webhookSvc WebhookDispatcher) *LeaveService {
	return &LeaveService{odoo: odoo, cache: cache, queries: queries, webhookSvc: webhookSvc}
}

// leaveAllocResult is the cached structure for allocation list responses.
type leaveAllocResult struct {
	Allocations []odoo.LeaveAllocation `json:"allocations"`
	Total       int                    `json:"total"`
}

// leaveReqResult is the cached structure for leave request list responses.
type leaveReqResult struct {
	Requests []odoo.LeaveRequest `json:"requests"`
	Total    int                 `json:"total"`
}

// ListAllocations retrieves leave allocations with optional employee filtering.
func (s *LeaveService) ListAllocations(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.LeaveAllocation, int, error) {
	offset := (page - 1) * perPage
	key := leaveAllocCacheKey(ctx, employeeID, perPage, offset)

	var cached leaveAllocResult
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return cached.Allocations, cached.Total, nil
	}

	domain := leaveBaseDomain(ctx, employeeID)

	allocs, total, err := s.odoo.SearchLeaveAllocations(ctx, domain, perPage, offset)
	if err != nil {
		var stale leaveAllocResult
		if staleErr := s.cache.GetStale(ctx, key, &stale); staleErr == nil {
			return stale.Allocations, stale.Total, nil
		}
		return nil, 0, ErrServiceUnavailable
	}

	_ = s.cache.Set(ctx, key, leaveAllocResult{Allocations: allocs, Total: total}, leaveAllocCacheTTL)
	return allocs, total, nil
}

// ListRequests retrieves leave requests with optional employee and status filtering.
func (s *LeaveService) ListRequests(ctx context.Context, employeeID int64, status string, page, perPage int) ([]odoo.LeaveRequest, int, error) {
	offset := (page - 1) * perPage
	key := leaveReqCacheKey(ctx, employeeID, status, perPage, offset)

	var cached leaveReqResult
	if err := s.cache.Get(ctx, key, &cached); err == nil {
		return cached.Requests, cached.Total, nil
	}

	domain := leaveBaseDomain(ctx, employeeID)
	if status != "" {
		domain = append(domain, []any{"state", "=", status})
	}

	requests, total, err := s.odoo.SearchLeaveRequests(ctx, domain, perPage, offset)
	if err != nil {
		var stale leaveReqResult
		if staleErr := s.cache.GetStale(ctx, key, &stale); staleErr == nil {
			return stale.Requests, stale.Total, nil
		}
		return nil, 0, ErrServiceUnavailable
	}

	_ = s.cache.Set(ctx, key, leaveReqResult{Requests: requests, Total: total}, leaveReqCacheTTL)
	return requests, total, nil
}

// CreateRequest creates a new leave request via Odoo.
func (s *LeaveService) CreateRequest(ctx context.Context, req odoo.LeaveCreateRequest) (int64, error) {
	vals := map[string]any{
		"employee_id":       req.EmployeeID,
		"holiday_status_id": req.HolidayStatusID,
		"date_from":         req.DateFrom,
		"date_to":           req.DateTo,
		"name":              req.Name,
	}

	id, err := s.odoo.CreateLeaveRequest(ctx, vals)
	if err != nil {
		return 0, fmt.Errorf("create leave request: %w", err)
	}

	_ = s.cache.DeletePattern(ctx, leaveReqInvalidatePattern(ctx))
	return id, nil
}

// ApproveRequest approves a leave request and records audit + webhook.
func (s *LeaveService) ApproveRequest(ctx context.Context, leaveID int64, approverUserID string) error {
	if err := s.odoo.ActionApproveLeave(ctx, leaveID); err != nil {
		return fmt.Errorf("approve leave %d: %w", leaveID, err)
	}

	_ = s.cache.DeletePattern(ctx, leaveReqInvalidatePattern(ctx))

	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"approver": approverUserID})
		orgID, _ := tenant.OrganizationID(ctx)
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         pgtype.UUID{},
			Action:         "leave.approved",
			ResourceType:   "leave",
			ResourceID:     fmt.Sprintf("%d", leaveID),
			Details:        details,
			OrganizationID: orgID,
		})
	}

	// Webhook dispatch
	if s.webhookSvc != nil {
		_ = s.webhookSvc.Dispatch(ctx, "leave.approved", map[string]any{"id": leaveID, "approver": approverUserID})
	}

	return nil
}

// RejectRequest rejects a leave request and records audit + webhook.
func (s *LeaveService) RejectRequest(ctx context.Context, leaveID int64, reason, rejecterUserID string) error {
	if err := s.odoo.ActionRefuseLeave(ctx, leaveID); err != nil {
		return fmt.Errorf("reject leave %d: %w", leaveID, err)
	}

	_ = s.cache.DeletePattern(ctx, leaveReqInvalidatePattern(ctx))

	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"rejecter": rejecterUserID, "reason": reason})
		orgID, _ := tenant.OrganizationID(ctx)
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         pgtype.UUID{},
			Action:         "leave.rejected",
			ResourceType:   "leave",
			ResourceID:     fmt.Sprintf("%d", leaveID),
			Details:        details,
			OrganizationID: orgID,
		})
	}

	// Webhook dispatch
	if s.webhookSvc != nil {
		_ = s.webhookSvc.Dispatch(ctx, "leave.rejected", map[string]any{"id": leaveID, "reason": reason, "rejecter": rejecterUserID})
	}

	return nil
}

// CancelRequest cancels a leave request via Odoo.
func (s *LeaveService) CancelRequest(ctx context.Context, leaveID int64) error {
	if err := s.odoo.CancelLeaveRequest(ctx, leaveID); err != nil {
		return fmt.Errorf("cancel leave request %d: %w", leaveID, err)
	}

	_ = s.cache.DeletePattern(ctx, leaveReqInvalidatePattern(ctx))

	if s.queries != nil {
		details, _ := json.Marshal(map[string]any{"leave_id": leaveID})
		orgID, _ := tenant.OrganizationID(ctx)
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         pgtype.UUID{},
			Action:         "leave.cancelled",
			ResourceType:   "leave",
			ResourceID:     fmt.Sprintf("%d", leaveID),
			Details:        details,
			OrganizationID: orgID,
		})
	}

	// Webhook dispatch
	if s.webhookSvc != nil {
		_ = s.webhookSvc.Dispatch(ctx, "leave.cancelled", map[string]any{"id": leaveID})
	}

	return nil
}

func leaveBaseDomain(ctx context.Context, employeeID int64) []any {
	var domain []any
	if c := tenant.OdooCompanyID(ctx); c > 0 {
		domain = append(domain, []any{"company_id", "=", c})
	}
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}
	return domain
}

func leaveAllocCacheKey(ctx context.Context, employeeID int64, limit, offset int) string {
	c := tenant.OdooCompanyID(ctx)
	raw := fmt.Sprintf("oc=%d&e=%d&l=%d&o=%d", c, employeeID, limit, offset)
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%s%s%x", cachekeys.LeaveAllocPrefix, cachekeys.OdooCompanyShard(c), h[:8])
}

func leaveReqCacheKey(ctx context.Context, employeeID int64, status string, limit, offset int) string {
	c := tenant.OdooCompanyID(ctx)
	raw := fmt.Sprintf("oc=%d&e=%d&s=%s&l=%d&o=%d", c, employeeID, status, limit, offset)
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%s%s%x", cachekeys.LeaveReqPrefix, cachekeys.OdooCompanyShard(c), h[:8])
}

func leaveReqInvalidatePattern(ctx context.Context) string {
	return fmt.Sprintf("%s%s*", cachekeys.LeaveReqPrefix, cachekeys.OdooCompanyShard(tenant.OdooCompanyID(ctx)))
}
