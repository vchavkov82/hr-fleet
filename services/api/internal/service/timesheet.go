package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// TimesheetOdooClient defines the Odoo interface for timesheet operations.
type TimesheetOdooClient interface {
	ListTimesheets(domain []any, limit, offset int) ([]odoo.TimesheetEntry, int, error)
	CreateTimesheet(vals map[string]any) (int64, error)
	UpdateTimesheet(id int64, vals map[string]any) error
}

// TimesheetService provides business logic for timesheet operations.
type TimesheetService struct {
	odoo  TimesheetOdooClient
	cache *cache.Cache
}

// NewTimesheetService creates a new TimesheetService.
func NewTimesheetService(odoo TimesheetOdooClient, cache *cache.Cache) *TimesheetService {
	return &TimesheetService{odoo: odoo, cache: cache}
}

// List retrieves timesheet entries with optional filtering.
func (s *TimesheetService) List(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error) {
	domain := []any{}
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}
	if dateFrom != "" {
		domain = append(domain, []any{"date", ">=", dateFrom})
	}
	if dateTo != "" {
		domain = append(domain, []any{"date", "<=", dateTo})
	}

	entries, total, err := s.odoo.ListTimesheets(domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list timesheets: %w", err)
	}
	return entries, total, nil
}

// Create creates a new timesheet entry.
func (s *TimesheetService) Create(ctx context.Context, employeeID int64, date, name string, hours float64, projectID, taskID int64) (int64, error) {
	vals := map[string]any{
		"employee_id": employeeID,
		"date":        date,
		"name":        name,
		"unit_amount": hours,
	}
	if projectID > 0 {
		vals["project_id"] = projectID
	}
	if taskID > 0 {
		vals["task_id"] = taskID
	}

	id, err := s.odoo.CreateTimesheet(vals)
	if err != nil {
		return 0, fmt.Errorf("create timesheet: %w", err)
	}
	return id, nil
}
