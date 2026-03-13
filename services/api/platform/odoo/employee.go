package odoo

import (
	"encoding/json"
	"fmt"
)

// ListEmployees retrieves hr.employee records from Odoo with optional domain filters.
// Returns the employee slice and total count for pagination.
func (c *Client) ListEmployees(domain []any, limit, offset int) ([]Employee, int, error) {
	if domain == nil {
		domain = []any{}
	}

	// Get total count for pagination
	count, err := c.SearchCount("hr.employee", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list employees count: %w", err)
	}

	// Fetch records
	records, err := c.SearchRead("hr.employee", domain, employeeFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list employees: %w", err)
	}

	employees := make([]Employee, 0, len(records))
	for _, rec := range records {
		emp, err := parseEmployee(rec)
		if err != nil {
			return nil, 0, fmt.Errorf("parse employee: %w", err)
		}
		employees = append(employees, emp)
	}

	return employees, int(count), nil
}

// GetEmployee retrieves a single hr.employee by ID.
func (c *Client) GetEmployee(id int64) (*Employee, error) {
	records, err := c.Read("hr.employee", []int64{id}, employeeFields)
	if err != nil {
		return nil, fmt.Errorf("get employee %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("employee %d not found", id)
	}

	emp, err := parseEmployee(records[0])
	if err != nil {
		return nil, fmt.Errorf("parse employee %d: %w", id, err)
	}

	return &emp, nil
}

// CreateEmployee creates a new hr.employee record in Odoo.
func (c *Client) CreateEmployee(req EmployeeCreateRequest) (int64, error) {
	vals := map[string]any{
		"name":          req.Name,
		"work_email":    req.WorkEmail,
		"job_title":     req.JobTitle,
		"employee_type": req.EmployeeType,
	}
	if req.DepartmentID > 0 {
		vals["department_id"] = req.DepartmentID
	}

	id, err := c.Create("hr.employee", vals)
	if err != nil {
		return 0, fmt.Errorf("create employee: %w", err)
	}

	return id, nil
}

// UpdateEmployee updates an existing hr.employee record with the provided fields.
// Only the fields present in vals are sent (partial update).
func (c *Client) UpdateEmployee(id int64, vals map[string]any) error {
	if err := c.Write("hr.employee", id, vals); err != nil {
		return fmt.Errorf("update employee %d: %w", id, err)
	}
	return nil
}

// parseEmployee converts a raw Odoo record map into an Employee struct.
func parseEmployee(rec map[string]any) (Employee, error) {
	emp := Employee{
		ID:           toInt64(rec["id"]),
		Name:         toString(rec["name"]),
		WorkEmail:    toString(rec["work_email"]),
		JobTitle:     toString(rec["job_title"]),
		WorkPhone:    toString(rec["work_phone"]),
		MobilePhone:  toString(rec["mobile_phone"]),
		EmployeeType: toString(rec["employee_type"]),
		Active:       toBool(rec["active"]),
		CreateDate:   toString(rec["create_date"]),
		WriteDate:    toString(rec["write_date"]),
	}

	emp.DepartmentID = parseMany2One(rec["department_id"])
	emp.JobID = parseMany2One(rec["job_id"])
	emp.ParentID = parseMany2One(rec["parent_id"])

	return emp, nil
}

// parseMany2One extracts a Many2One value from an Odoo field.
// Odoo returns many2one as [id, "name"] or false if empty.
func parseMany2One(v any) Many2One {
	arr, ok := v.([]any)
	if !ok || len(arr) < 2 {
		return Many2One{}
	}
	return Many2One{
		ID:   toInt64(arr[0]),
		Name: toString(arr[1]),
	}
}

// toInt64 converts an any to int64.
func toInt64(v any) int64 {
	switch n := v.(type) {
	case float64:
		return int64(n)
	case int64:
		return n
	case int:
		return int64(n)
	case json.Number:
		i, _ := n.Int64()
		return i
	default:
		return 0
	}
}

// toString converts an any to string.
func toString(v any) string {
	s, _ := v.(string)
	return s
}

// toBool converts an any to bool.
func toBool(v any) bool {
	b, _ := v.(bool)
	return b
}
