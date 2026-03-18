package worker

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog/log"
)

const (
	TaskTypeOdooSync = "odoo:sync"
)

// OdooSyncPayload represents the payload for an Odoo sync task.
type OdooSyncPayload struct {
	Model     string  `json:"model"`
	IDs       []int64 `json:"ids"`
	Operation string  `json:"operation"` // create, write, unlink
}

// OdooSyncHandler handles async Odoo synchronization tasks.
type OdooSyncHandler struct {
}

// NewOdooSyncHandler creates a new OdooSyncHandler.
func NewOdooSyncHandler() *OdooSyncHandler {
	return &OdooSyncHandler{}
}

// ProcessTask handles an Odoo sync task.
func (h *OdooSyncHandler) ProcessTask(_ context.Context, t *asynq.Task) error {
	var payload OdooSyncPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}

	logger := log.With().
		Str("model", payload.Model).
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Logger()

	logger.Info().Msg("processing Odoo sync task")

	switch payload.Model {
	case "hr.employee":
		return h.syncEmployees(payload)
	case "hr.contract":
		return h.syncContracts(payload)
	case "hr.leave":
		return h.syncLeaveRequests(payload)
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

func (h *OdooSyncHandler) syncEmployees(payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing employees from Odoo")
	return nil
}

func (h *OdooSyncHandler) syncContracts(payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing contracts from Odoo")
	return nil
}

func (h *OdooSyncHandler) syncLeaveRequests(payload OdooSyncPayload) error {
	log.Info().
		Str("operation", payload.Operation).
		Ints64("ids", payload.IDs).
		Msg("syncing leave requests from Odoo")
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

// NewOdooSyncTask creates a new Asynq task for Odoo sync.
func NewOdooSyncTask(model, operation string, ids []int64) (*asynq.Task, error) {
	payload := OdooSyncPayload{
		Model:     model,
		IDs:       ids,
		Operation: operation,
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal payload: %w", err)
	}
	return asynq.NewTask(TaskTypeOdooSync, data), nil
}
