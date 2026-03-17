package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// PayrollOCAOdooClient defines the Odoo interface for OCA payroll operations.
type PayrollOCAOdooClient interface {
	ListPayrollStructures(domain []any, limit, offset int) ([]odoo.PayrollStructure, int, error)
	GetPayrollStructure(id int64) (*odoo.PayrollStructure, error)
	ListSalaryRules(domain []any, limit, offset int) ([]odoo.SalaryRule, int, error)
	ListPayslipsOCA(domain []any, limit, offset int) ([]odoo.PayslipOCA, int, error)
	ListPayslipRuns(domain []any, limit, offset int) ([]odoo.PayslipRun, int, error)
	CreatePayslipRun(vals map[string]any) (int64, error)
	GeneratePayslips(runID int64) error
	ConfirmPayslipRun(runID int64) error
}

// PayrollOCAService provides business logic for OCA payroll operations.
type PayrollOCAService struct {
	odoo  PayrollOCAOdooClient
	cache *cache.Cache
}

// NewPayrollOCAService creates a new PayrollOCAService.
func NewPayrollOCAService(odoo PayrollOCAOdooClient, cache *cache.Cache) *PayrollOCAService {
	return &PayrollOCAService{odoo: odoo, cache: cache}
}

// ListStructures retrieves payroll structures.
func (s *PayrollOCAService) ListStructures(ctx context.Context, limit, offset int) ([]odoo.PayrollStructure, int, error) {
	structures, total, err := s.odoo.ListPayrollStructures(nil, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list structures: %w", err)
	}
	return structures, total, nil
}

// GetStructure retrieves a single payroll structure.
func (s *PayrollOCAService) GetStructure(ctx context.Context, id int64) (*odoo.PayrollStructure, error) {
	structure, err := s.odoo.GetPayrollStructure(id)
	if err != nil {
		return nil, fmt.Errorf("get structure: %w", err)
	}
	return structure, nil
}

// ListRules retrieves salary rules with optional structure filter.
func (s *PayrollOCAService) ListRules(ctx context.Context, structID int64, limit, offset int) ([]odoo.SalaryRule, int, error) {
	domain := []any{}
	if structID > 0 {
		domain = append(domain, []any{"struct_id", "=", structID})
	}
	rules, total, err := s.odoo.ListSalaryRules(domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list rules: %w", err)
	}
	return rules, total, nil
}

// ListPayslips retrieves OCA payslips with optional filters.
func (s *PayrollOCAService) ListPayslips(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.PayslipOCA, int, error) {
	domain := []any{}
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}
	if state != "" {
		domain = append(domain, []any{"state", "=", state})
	}
	payslips, total, err := s.odoo.ListPayslipsOCA(domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list payslips: %w", err)
	}
	return payslips, total, nil
}

// CreatePayslipRun creates a new payslip batch run.
func (s *PayrollOCAService) CreatePayslipRun(ctx context.Context, name, dateFrom, dateTo string) (int64, error) {
	vals := map[string]any{
		"name":       name,
		"date_start": dateFrom,
		"date_end":   dateTo,
	}
	id, err := s.odoo.CreatePayslipRun(vals)
	if err != nil {
		return 0, fmt.Errorf("create payslip run: %w", err)
	}
	return id, nil
}

// GeneratePayslips triggers payslip generation for a run.
func (s *PayrollOCAService) GeneratePayslips(ctx context.Context, runID int64) error {
	if err := s.odoo.GeneratePayslips(runID); err != nil {
		return fmt.Errorf("generate payslips: %w", err)
	}
	return nil
}

// ConfirmPayslipRun confirms/closes a payslip run.
func (s *PayrollOCAService) ConfirmPayslipRun(ctx context.Context, runID int64) error {
	if err := s.odoo.ConfirmPayslipRun(runID); err != nil {
		return fmt.Errorf("confirm payslip run: %w", err)
	}
	return nil
}
