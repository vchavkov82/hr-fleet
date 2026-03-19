package worker

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog/log"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tax"
)

// PayrollProcessor handles async payroll processing tasks.
type PayrollProcessor struct {
	queries *db.Queries
}

// NewPayrollProcessor creates a new PayrollProcessor.
func NewPayrollProcessor(queries *db.Queries) *PayrollProcessor {
	return &PayrollProcessor{queries: queries}
}

// payrollPayload is the JSON payload for the payroll:process task.
type payrollPayload struct {
	RunID       string `json:"run_id"`
	TriggeredBy string `json:"triggered_by"`
}

// HandlePayrollProcess processes a payroll run: fetches employees, calculates tax, creates payslips.
// Fails the entire batch if any employee calculation or insert fails.
func (p *PayrollProcessor) HandlePayrollProcess(ctx context.Context, t *asynq.Task) error {
	var payload payrollPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal payload: %w", err)
	}
	runID := parseUUID(payload.RunID)
	triggeredBy := parseUUID(payload.TriggeredBy)

	logger := log.With().Str("run_id", payload.RunID).Logger()
	logger.Info().Msg("starting payroll processing")

	// Fetch all active employees
	employees, err := p.queries.ListEmployees(ctx, db.ListEmployeesParams{
		Limit:  1000,
		Offset: 0,
		Status: pgtype.Text{String: "active", Valid: true},
	})
	if err != nil {
		p.failRun(ctx, runID, triggeredBy, fmt.Sprintf("fetch employees: %v", err))
		return fmt.Errorf("fetch employees: %w", err)
	}

	if len(employees) == 0 {
		p.failRun(ctx, runID, triggeredBy, "no active employees found")
		return fmt.Errorf("no active employees found")
	}

	// Process each employee - fail entire batch on any error
	for _, emp := range employees {
		// For now, use a default gross salary. In production this would come from contracts.
		// The payslip creation expects gross salary to be provided per employee.
		grossStotinki := int64(0)
		if emp.OdooID.Valid {
			// Placeholder: actual salary would come from employee contract/Odoo
			grossStotinki = 300_000 // default 3000 BGN for MVP
		}

		if grossStotinki <= 0 {
			p.failRun(ctx, runID, triggeredBy, fmt.Sprintf("employee %d has no salary configured", emp.OdooID.Int32))
			return fmt.Errorf("employee %d has no salary", emp.OdooID.Int32)
		}

		result := tax.Calculate(tax.CalculationInput{GrossSalaryStotinki: grossStotinki})

		detailsJSON, _ := json.Marshal(result.Details)

		_, err := p.queries.CreatePayslip(ctx, db.CreatePayslipParams{
			PayrollRunID:           runID,
			EmployeeOdooID:         emp.OdooID.Int32,
			GrossSalaryStotinki:    result.GrossSalaryStotinki,
			EmployerSocialStotinki: result.EmployerSocial,
			EmployeeSocialStotinki: result.EmployeeSocial,
			EmployerHealthStotinki: result.EmployerHealth,
			EmployeeHealthStotinki: result.EmployeeHealth,
			IncomeTaxStotinki:      result.IncomeTax,
			NetSalaryStotinki:      result.NetSalaryStotinki,
			CalculationDetails:     detailsJSON,
		})
		if err != nil {
			p.failRun(ctx, runID, triggeredBy, fmt.Sprintf("create payslip for employee %d: %v", emp.OdooID.Int32, err))
			return fmt.Errorf("create payslip: %w", err)
		}
	}

	// Mark run as completed
	if err := p.queries.SetPayrollRunCompleted(ctx, runID); err != nil {
		p.failRun(ctx, runID, triggeredBy, fmt.Sprintf("mark completed: %v", err))
		return fmt.Errorf("mark completed: %w", err)
	}

	p.auditLog(ctx, triggeredBy, "payroll.completed", "payroll_run", payload.RunID)
	logger.Info().Int("employees", len(employees)).Msg("payroll processing completed")
	return nil
}

// failRun marks the payroll run as failed and writes an audit entry.
func (p *PayrollProcessor) failRun(ctx context.Context, runID, userID pgtype.UUID, reason string) {
	errDetails, _ := json.Marshal(map[string]string{"error": reason})
	_ = p.queries.SetPayrollRunError(ctx, db.SetPayrollRunErrorParams{
		ID:           runID,
		ErrorDetails: errDetails,
	})
	p.auditLog(ctx, userID, "payroll.failed", "payroll_run", uuidStr(runID))
}

func (p *PayrollProcessor) auditLog(ctx context.Context, userID pgtype.UUID, action, resType, resID string) {
	_, _ = p.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
		UserID:       userID,
		Action:       action,
		ResourceType: resType,
		ResourceID:   resID,
	})
}

// parseUUID parses a UUID string into pgtype.UUID.
func parseUUID(s string) pgtype.UUID {
	var u pgtype.UUID
	_ = u.Scan(s)
	return u
}

func uuidStr(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	b := u.Bytes
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
