package odoo

import (
	"context"
	"fmt"
)

// ListAttendance retrieves hr.attendance records from Odoo with optional domain filters.
// Returns the attendance slice and total count for pagination.
func (c *Client) ListAttendance(ctx context.Context, domain []any, limit, offset int) ([]AttendanceRecord, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount(ctx, "hr.attendance", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list attendance count: %w", err)
	}

	records, err := c.SearchRead(ctx, "hr.attendance", domain, attendanceFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list attendance: %w", err)
	}

	items := make([]AttendanceRecord, 0, len(records))
	for _, rec := range records {
		items = append(items, parseAttendance(rec))
	}

	return items, int(count), nil
}

// CheckIn creates a new hr.attendance record for the given employee (clock-in).
func (c *Client) CheckIn(ctx context.Context, employeeID int64) (int64, error) {
	vals := map[string]any{"employee_id": employeeID}
	id, err := c.Create(ctx, "hr.attendance", vals)
	if err != nil {
		return 0, fmt.Errorf("check in: %w", err)
	}
	return id, nil
}

// CheckOut writes the check_out timestamp on an existing hr.attendance record.
func (c *Client) CheckOut(ctx context.Context, attendanceID int64) error {
	// Odoo auto-fills check_out on write when the field is set
	return c.Write(ctx, "hr.attendance", attendanceID, map[string]any{
		"check_out": "now",
	})
}

// parseAttendance converts a raw Odoo record map into an AttendanceRecord struct.
func parseAttendance(rec map[string]any) AttendanceRecord {
	return AttendanceRecord{
		ID:          toInt64(rec["id"]),
		EmployeeID:  parseMany2One(rec["employee_id"]),
		CheckIn:     toString(rec["check_in"]),
		CheckOut:    toString(rec["check_out"]),
		WorkedHours: toFloat64(rec["worked_hours"]),
	}
}
