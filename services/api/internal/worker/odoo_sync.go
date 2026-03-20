package worker

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog/log"
	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/internal/cachekeys"
)

const (
	TaskTypeOdooSync = "odoo:sync"
)

// OdooSyncPayload represents the payload for an Odoo sync task.
type OdooSyncPayload struct {
	Model         string  `json:"model"`
	IDs           []int64 `json:"ids"`
	Operation     string  `json:"operation"` // create, write, unlink
	OdooCompanyID int64   `json:"odoo_company_id"`
}

// OdooSyncHandler handles async Odoo synchronization tasks (cache invalidation after Odoo-side changes).
type OdooSyncHandler struct {
	cache *cache.Cache
}

// NewOdooSyncHandler creates a new OdooSyncHandler. Cache may be nil (invalidation skipped).
func NewOdooSyncHandler(cache *cache.Cache) *OdooSyncHandler {
	return &OdooSyncHandler{cache: cache}
}

// ProcessTask handles an Odoo sync task.
func (h *OdooSyncHandler) ProcessTask(ctx context.Context, t *asynq.Task) error {
	var payload OdooSyncPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}

	logger := log.With().
		Str("model", payload.Model).
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Int64("odoo_company_id", payload.OdooCompanyID).
		Logger()

	logger.Info().Msg("processing Odoo sync task")

	switch payload.Model {
	case "hr.employee":
		return h.syncEmployees(ctx, payload)
	case "hr.contract":
		return h.syncContracts(ctx, payload)
	case "hr.leave":
		return h.syncLeaveRequests(ctx, payload)
	case "hr.attendance":
		return h.syncAttendance(payload)
	case "hr.expense":
		return h.syncExpenses(payload)
	case "hr.appraisal":
		return h.syncAppraisals(payload)
	case "hr.course.schedule":
		return h.syncCourseSchedules(payload)
	default:
		logger.Warn().Msg("unknown model for sync, skipping")
		return nil
	}
}

func (h *OdooSyncHandler) syncEmployees(ctx context.Context, payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing employees from Odoo (cache invalidation)")
	if h.cache == nil {
		return nil
	}
	if err := h.cache.DeletePattern(ctx, employeeListInvalidatePattern(payload.OdooCompanyID)); err != nil {
		return fmt.Errorf("invalidate employee list cache: %w", err)
	}
	for _, id := range payload.IDs {
		pat := employeeDetailInvalidatePattern(payload.OdooCompanyID, id)
		if err := h.cache.DeletePattern(ctx, pat); err != nil {
			return fmt.Errorf("invalidate employee detail cache %d: %w", id, err)
		}
	}
	return nil
}

func (h *OdooSyncHandler) syncContracts(ctx context.Context, payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing contracts from Odoo (cache invalidation)")
	if h.cache == nil {
		return nil
	}
	if err := h.cache.DeletePattern(ctx, contractListInvalidatePattern(payload.OdooCompanyID)); err != nil {
		return fmt.Errorf("invalidate contract list cache: %w", err)
	}
	for _, id := range payload.IDs {
		pat := contractDetailInvalidatePattern(payload.OdooCompanyID, id)
		if err := h.cache.DeletePattern(ctx, pat); err != nil {
			return fmt.Errorf("invalidate contract detail cache %d: %w", id, err)
		}
	}
	return nil
}

func (h *OdooSyncHandler) syncLeaveRequests(ctx context.Context, payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing leave from Odoo (cache invalidation)")
	if h.cache == nil {
		return nil
	}
	for _, pat := range leaveInvalidatePatterns(payload.OdooCompanyID) {
		if err := h.cache.DeletePattern(ctx, pat); err != nil {
			return fmt.Errorf("invalidate leave cache: %w", err)
		}
	}
	return nil
}

func (h *OdooSyncHandler) syncAttendance(payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing attendance from Odoo")
	return nil
}

func (h *OdooSyncHandler) syncExpenses(payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing expenses from Odoo")
	return nil
}

func (h *OdooSyncHandler) syncAppraisals(payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing appraisals from Odoo")
	return nil
}

func (h *OdooSyncHandler) syncCourseSchedules(payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing course schedules from Odoo")
	return nil
}

func employeeListInvalidatePattern(odooCompanyID int64) string {
	if odooCompanyID > 0 {
		return fmt.Sprintf("%s%s*", cachekeys.EmployeesListPrefix, cachekeys.OdooCompanyShard(odooCompanyID))
	}
	return cachekeys.EmployeesListPrefix + "*"
}

func employeeDetailInvalidatePattern(odooCompanyID, recordID int64) string {
	if odooCompanyID > 0 {
		return fmt.Sprintf("%s%s%d*", cachekeys.EmployeesDetailPrefix, cachekeys.OdooCompanyShard(odooCompanyID), recordID)
	}
	return fmt.Sprintf("%s*%d*", cachekeys.EmployeesDetailPrefix, recordID)
}

func contractListInvalidatePattern(odooCompanyID int64) string {
	if odooCompanyID > 0 {
		return fmt.Sprintf("%s%s*", cachekeys.ContractsListPrefix, cachekeys.OdooCompanyShard(odooCompanyID))
	}
	return cachekeys.ContractsListPrefix + "*"
}

func contractDetailInvalidatePattern(odooCompanyID, recordID int64) string {
	if odooCompanyID > 0 {
		return fmt.Sprintf("%s%s%d*", cachekeys.ContractsDetailPrefix, cachekeys.OdooCompanyShard(odooCompanyID), recordID)
	}
	return fmt.Sprintf("%s*%d*", cachekeys.ContractsDetailPrefix, recordID)
}

func leaveInvalidatePatterns(odooCompanyID int64) []string {
	if odooCompanyID > 0 {
		shard := cachekeys.OdooCompanyShard(odooCompanyID)
		return []string{
			cachekeys.LeaveAllocPrefix + shard + "*",
			cachekeys.LeaveReqPrefix + shard + "*",
		}
	}
	return []string{cachekeys.LeavePattern}
}

// NewOdooSyncTask creates a new Asynq task for Odoo sync.
// odooCompanyID should be the Odoo res.company id when known (e.g. from webhook payload); 0 falls back to broad invalidation.
func NewOdooSyncTask(model, operation string, ids []int64, odooCompanyID int64) (*asynq.Task, error) {
	payload := OdooSyncPayload{
		Model:         model,
		IDs:           ids,
		Operation:     operation,
		OdooCompanyID: odooCompanyID,
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal payload: %w", err)
	}
	return asynq.NewTask(TaskTypeOdooSync, data), nil
}
