package odoo

// ListEmployees retrieves hr.employee records from Odoo. Stub.
func (c *Client) ListEmployees(domain []interface{}, limit, offset int) ([]Employee, int, error) {
	panic("not implemented")
}

// GetEmployee retrieves a single hr.employee by ID. Stub.
func (c *Client) GetEmployee(id int64) (*Employee, error) {
	panic("not implemented")
}

// CreateEmployee creates a new hr.employee record. Stub.
func (c *Client) CreateEmployee(req EmployeeCreateRequest) (int64, error) {
	panic("not implemented")
}

// UpdateEmployee updates an existing hr.employee record. Stub.
func (c *Client) UpdateEmployee(id int64, vals map[string]interface{}) error {
	panic("not implemented")
}
