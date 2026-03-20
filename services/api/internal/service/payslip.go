package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/tenant"
)

var (
	ErrPayslipNotFound = errors.New("payslip not found")
)

// PayslipService provides payslip operations.
type PayslipService struct {
	queries *db.Queries
}

// NewPayslipService creates a new PayslipService.
func NewPayslipService(queries *db.Queries) *PayslipService {
	return &PayslipService{queries: queries}
}

// Get retrieves a single payslip by ID.
func (s *PayslipService) Get(ctx context.Context, id pgtype.UUID) (db.Payslip, error) {
	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return db.Payslip{}, fmt.Errorf("tenant required")
	}
	p, err := s.queries.GetPayslip(ctx, db.GetPayslipParams{ID: id, OrganizationID: orgID})
	if err != nil {
		return db.Payslip{}, ErrPayslipNotFound
	}
	return p, nil
}

// List retrieves payslips with pagination, optionally filtered by payroll run.
func (s *PayslipService) List(ctx context.Context, payrollRunID pgtype.UUID, limit, offset int) ([]db.ListPayslipsRow, int64, error) {
	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return nil, 0, fmt.Errorf("tenant required")
	}

	count, err := s.queries.CountPayslips(ctx, db.CountPayslipsParams{
		OrganizationID: orgID,
		Column2:        payrollRunID,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("count payslips: %w", err)
	}

	rows, err := s.queries.ListPayslips(ctx, db.ListPayslipsParams{
		Limit:          int32(limit),
		Offset:         int32(offset),
		OrganizationID: orgID,
		Column4:        payrollRunID,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list payslips: %w", err)
	}

	return rows, count, nil
}

// ListByRun retrieves all payslips for a given payroll run.
func (s *PayslipService) ListByRun(ctx context.Context, payrollRunID pgtype.UUID) ([]db.Payslip, error) {
	orgID, ok := tenant.OrganizationID(ctx)
	if !ok || !orgID.Valid {
		return nil, fmt.Errorf("tenant required")
	}
	return s.queries.ListPayslipsByRun(ctx, db.ListPayslipsByRunParams{
		PayrollRunID:   payrollRunID,
		OrganizationID: orgID,
	})
}
