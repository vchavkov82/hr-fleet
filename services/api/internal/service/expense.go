package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// ExpenseOdooClient defines the Odoo interface for expense operations.
type ExpenseOdooClient interface {
	ListExpenses(domain []any, limit, offset int) ([]odoo.ExpenseReport, int, error)
	CreateExpense(vals map[string]any) (int64, error)
	ApproveExpense(id int64) error
	RefuseExpense(id int64) error
}

// ExpenseService provides business logic for expense operations.
type ExpenseService struct {
	odoo  ExpenseOdooClient
	cache *cache.Cache
}

// NewExpenseService creates a new ExpenseService.
func NewExpenseService(odoo ExpenseOdooClient, cache *cache.Cache) *ExpenseService {
	return &ExpenseService{odoo: odoo, cache: cache}
}

// List retrieves expense reports with optional filtering.
func (s *ExpenseService) List(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.ExpenseReport, int, error) {
	domain := []any{}
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}
	if state != "" {
		domain = append(domain, []any{"state", "=", state})
	}

	expenses, total, err := s.odoo.ListExpenses(domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list expenses: %w", err)
	}
	return expenses, total, nil
}

// Create creates a new expense report.
func (s *ExpenseService) Create(ctx context.Context, employeeID int64, name string, amount float64, date string) (int64, error) {
	vals := map[string]any{
		"employee_id":  employeeID,
		"name":         name,
		"total_amount": amount,
		"date":         date,
	}

	id, err := s.odoo.CreateExpense(vals)
	if err != nil {
		return 0, fmt.Errorf("create expense: %w", err)
	}
	return id, nil
}

// Approve approves an expense report.
func (s *ExpenseService) Approve(ctx context.Context, id int64) error {
	if err := s.odoo.ApproveExpense(id); err != nil {
		return fmt.Errorf("approve expense: %w", err)
	}
	return nil
}

// Refuse refuses an expense report.
func (s *ExpenseService) Refuse(ctx context.Context, id int64) error {
	if err := s.odoo.RefuseExpense(id); err != nil {
		return fmt.Errorf("refuse expense: %w", err)
	}
	return nil
}
