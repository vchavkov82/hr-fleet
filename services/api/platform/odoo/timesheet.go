package odoo

import "fmt"

// ListTimesheets retrieves account.analytic.line records from Odoo with optional domain filters.
// Returns the timesheet slice and total count for pagination.
func (c *Client) ListTimesheets(domain []any, limit, offset int) ([]TimesheetEntry, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("account.analytic.line", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list timesheets count: %w", err)
	}

	records, err := c.SearchRead("account.analytic.line", domain, timesheetFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list timesheets: %w", err)
	}

	entries := make([]TimesheetEntry, 0, len(records))
	for _, rec := range records {
		entries = append(entries, parseTimesheet(rec))
	}

	return entries, int(count), nil
}

// CreateTimesheet creates a new account.analytic.line record in Odoo.
func (c *Client) CreateTimesheet(vals map[string]any) (int64, error) {
	id, err := c.Create("account.analytic.line", vals)
	if err != nil {
		return 0, fmt.Errorf("create timesheet: %w", err)
	}
	return id, nil
}

// parseTimesheet converts a raw Odoo record map into a TimesheetEntry struct.
func parseTimesheet(rec map[string]any) TimesheetEntry {
	return TimesheetEntry{
		ID:         toInt64(rec["id"]),
		EmployeeID: parseMany2One(rec["employee_id"]),
		ProjectID:  parseMany2One(rec["project_id"]),
		TaskID:     parseMany2One(rec["task_id"]),
		Date:       toString(rec["date"]),
		UnitAmount: toFloat64(rec["unit_amount"]),
		Name:       toString(rec["name"]),
	}
}
