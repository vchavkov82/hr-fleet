package odoo

import (
	"fmt"
)

// SearchLeaveAllocations retrieves hr.leave.allocation records.
func (c *Client) SearchLeaveAllocations(domain []any, limit, offset int) ([]LeaveAllocation, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.leave.allocation", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("search leave allocations count: %w", err)
	}

	records, err := c.SearchRead("hr.leave.allocation", domain, leaveAllocationFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("search leave allocations: %w", err)
	}

	allocs := make([]LeaveAllocation, 0, len(records))
	for _, rec := range records {
		a := LeaveAllocation{
			ID:           toInt64(rec["id"]),
			NumberOfDays: toFloat64(rec["number_of_days"]),
			State:        toString(rec["state"]),
		}
		a.EmployeeID = parseMany2One(rec["employee_id"])
		a.HolidayStatusID = parseMany2One(rec["holiday_status_id"])
		allocs = append(allocs, a)
	}

	return allocs, int(count), nil
}

// SearchLeaveRequests retrieves hr.leave records.
func (c *Client) SearchLeaveRequests(domain []any, limit, offset int) ([]LeaveRequest, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.leave", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("search leave requests count: %w", err)
	}

	records, err := c.SearchRead("hr.leave", domain, leaveRequestFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("search leave requests: %w", err)
	}

	requests := make([]LeaveRequest, 0, len(records))
	for _, rec := range records {
		lr := LeaveRequest{
			ID:           toInt64(rec["id"]),
			DateFrom:     toString(rec["date_from"]),
			DateTo:       toString(rec["date_to"]),
			NumberOfDays: toFloat64(rec["number_of_days"]),
			State:        toString(rec["state"]),
			Name:         toString(rec["name"]),
		}
		lr.EmployeeID = parseMany2One(rec["employee_id"])
		lr.HolidayStatusID = parseMany2One(rec["holiday_status_id"])
		requests = append(requests, lr)
	}

	return requests, int(count), nil
}

// CreateLeaveRequest creates a new hr.leave record in Odoo.
func (c *Client) CreateLeaveRequest(vals map[string]any) (int64, error) {
	id, err := c.Create("hr.leave", vals)
	if err != nil {
		return 0, fmt.Errorf("create leave request: %w", err)
	}
	return id, nil
}

// ActionApproveLeave calls action_approve on an hr.leave record.
func (c *Client) ActionApproveLeave(leaveID int64) error {
	return c.CallAction("hr.leave", []int64{leaveID}, "action_approve")
}

// ActionRefuseLeave calls action_refuse on an hr.leave record.
func (c *Client) ActionRefuseLeave(leaveID int64) error {
	return c.CallAction("hr.leave", []int64{leaveID}, "action_refuse")
}
