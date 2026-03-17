package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog/log"

	"github.com/vchavkov/hr/services/api/internal/db"
)

// Payroll run statuses.
const (
	PayrollStatusDraft      = "draft"
	PayrollStatusApproved   = "approved"
	PayrollStatusProcessing = "processing"
	PayrollStatusCompleted  = "completed"
	PayrollStatusFailed     = "failed"
	PayrollStatusCancelled  = "cancelled"
)

// Asynq task type for payroll processing.
const TaskTypePayrollProcess = "payroll:process"

// Payroll errors.
var (
	ErrPayrollNotFound       = errors.New("payroll run not found")
	ErrPayrollInvalidStatus  = errors.New("invalid status transition")
	ErrPayrollImmutable      = errors.New("completed payroll runs are immutable")
)

// validTransitions defines the payroll state machine.
var validTransitions = map[string][]string{
	PayrollStatusDraft:      {PayrollStatusApproved, PayrollStatusCancelled},
	PayrollStatusApproved:   {PayrollStatusProcessing, PayrollStatusCancelled},
	PayrollStatusProcessing: {PayrollStatusCompleted, PayrollStatusFailed},
}

// PayrollService manages payroll run lifecycle.
type PayrollService struct {
	queries     *db.Queries
	asynqClient *asynq.Client
}

// NewPayrollService creates a new PayrollService.
func NewPayrollService(queries *db.Queries, asynqClient *asynq.Client) *PayrollService {
	return &PayrollService{
		queries:     queries,
		asynqClient: asynqClient,
	}
}

// canTransition checks if a status transition is valid.
func canTransition(from, to string) bool {
	allowed, ok := validTransitions[from]
	if !ok {
		return false
	}
	for _, s := range allowed {
		if s == to {
			return true
		}
	}
	return false
}

// Create creates a new payroll run in draft status.
func (s *PayrollService) Create(ctx context.Context, periodStart, periodEnd pgtype.Date, createdBy pgtype.UUID) (db.PayrollRun, error) {
	run, err := s.queries.CreatePayrollRun(ctx, db.CreatePayrollRunParams{
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		Status:      PayrollStatusDraft,
		CreatedBy:   createdBy,
	})
	if err != nil {
		return db.PayrollRun{}, fmt.Errorf("create payroll run: %w", err)
	}

	s.audit(ctx, createdBy, "payroll.created", "payroll_run", uuidToString(run.ID), nil)
	return run, nil
}

// Approve transitions a payroll run from draft to approved.
func (s *PayrollService) Approve(ctx context.Context, runID, approvedBy pgtype.UUID) error {
	run, err := s.queries.GetPayrollRun(ctx, runID)
	if err != nil {
		return ErrPayrollNotFound
	}
	if run.Status == PayrollStatusCompleted {
		return ErrPayrollImmutable
	}
	if !canTransition(run.Status, PayrollStatusApproved) {
		return ErrPayrollInvalidStatus
	}

	if err := s.queries.UpdatePayrollRunStatus(ctx, db.UpdatePayrollRunStatusParams{
		ID:     runID,
		Status: PayrollStatusApproved,
	}); err != nil {
		return fmt.Errorf("approve payroll run: %w", err)
	}

	s.audit(ctx, approvedBy, "payroll.approved", "payroll_run", uuidToString(runID), nil)
	return nil
}

// TriggerProcessing transitions from approved to processing and enqueues the async task.
func (s *PayrollService) TriggerProcessing(ctx context.Context, runID, triggeredBy pgtype.UUID) error {
	run, err := s.queries.GetPayrollRun(ctx, runID)
	if err != nil {
		return ErrPayrollNotFound
	}
	if run.Status == PayrollStatusCompleted {
		return ErrPayrollImmutable
	}
	if !canTransition(run.Status, PayrollStatusProcessing) {
		return ErrPayrollInvalidStatus
	}

	if err := s.queries.UpdatePayrollRunStatus(ctx, db.UpdatePayrollRunStatusParams{
		ID:     runID,
		Status: PayrollStatusProcessing,
	}); err != nil {
		return fmt.Errorf("update payroll status: %w", err)
	}

	// Enqueue async processing task
	payload, _ := json.Marshal(map[string]string{
		"run_id":       uuidToString(runID),
		"triggered_by": uuidToString(triggeredBy),
	})
	task := asynq.NewTask(TaskTypePayrollProcess, payload)
	if _, err := s.asynqClient.Enqueue(task); err != nil {
		// Rollback status on enqueue failure
		_ = s.queries.UpdatePayrollRunStatus(ctx, db.UpdatePayrollRunStatusParams{
			ID:     runID,
			Status: PayrollStatusApproved,
		})
		return fmt.Errorf("enqueue payroll task: %w", err)
	}

	s.audit(ctx, triggeredBy, "payroll.processing", "payroll_run", uuidToString(runID), nil)
	return nil
}

// GetStatus retrieves a payroll run by ID.
func (s *PayrollService) GetStatus(ctx context.Context, runID pgtype.UUID) (db.PayrollRun, error) {
	run, err := s.queries.GetPayrollRun(ctx, runID)
	if err != nil {
		return db.PayrollRun{}, ErrPayrollNotFound
	}
	return run, nil
}

// List retrieves payroll runs with optional status filter and pagination.
func (s *PayrollService) List(ctx context.Context, status pgtype.Text, limit, offset int32) ([]db.PayrollRun, error) {
	return s.queries.ListPayrollRuns(ctx, db.ListPayrollRunsParams{
		Status: status,
		Limit:  limit,
		Offset: offset,
	})
}

// audit writes an audit log entry, logging errors but not failing the operation.
func (s *PayrollService) audit(ctx context.Context, userID pgtype.UUID, action, resourceType, resourceID string, details map[string]any) {
	var detailsJSON []byte
	if details != nil {
		detailsJSON, _ = json.Marshal(details)
	}
	if _, err := s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
		UserID:       userID,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Details:      detailsJSON,
	}); err != nil {
		log.Error().Err(err).Str("action", action).Msg("failed to write audit log")
	}
}

// uuidToString is defined in auth.go — removed duplicate to avoid redeclaration.
