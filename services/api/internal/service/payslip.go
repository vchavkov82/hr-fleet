package service

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/vchavkov/hr/services/api/internal/db"
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
	p, err := s.queries.GetPayslip(ctx, id)
	if err != nil {
		return db.Payslip{}, ErrPayslipNotFound
	}
	return p, nil
}

// ListByRun retrieves all payslips for a given payroll run.
func (s *PayslipService) ListByRun(ctx context.Context, payrollRunID pgtype.UUID) ([]db.Payslip, error) {
	return s.queries.ListPayslipsByRun(ctx, payrollRunID)
}
