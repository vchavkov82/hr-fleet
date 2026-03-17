package odoo

import "fmt"

// ListDepartments retrieves hr.department records from Odoo with optional domain filters.
// Returns the department slice and total count for pagination.
func (c *Client) ListDepartments(domain []any, limit, offset int) ([]Department, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.department", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list departments count: %w", err)
	}

	records, err := c.SearchRead("hr.department", domain, departmentFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list departments: %w", err)
	}

	depts := make([]Department, 0, len(records))
	for _, rec := range records {
		depts = append(depts, parseDepartment(rec))
	}

	return depts, int(count), nil
}

// GetDepartment retrieves a single hr.department by ID.
func (c *Client) GetDepartment(id int64) (*Department, error) {
	records, err := c.Read("hr.department", []int64{id}, departmentFields)
	if err != nil {
		return nil, fmt.Errorf("get department %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("department %d not found", id)
	}

	d := parseDepartment(records[0])
	return &d, nil
}

// parseDepartment converts a raw Odoo record map into a Department struct.
func parseDepartment(rec map[string]any) Department {
	return Department{
		ID:        toInt64(rec["id"]),
		Name:      toString(rec["name"]),
		ParentID:  parseMany2One(rec["parent_id"]),
		ManagerID: parseMany2One(rec["manager_id"]),
		CompanyID: parseMany2One(rec["company_id"]),
		Active:    toBool(rec["active"]),
		ChildIDs:  toInt64Slice(rec["child_ids"]),
	}
}
