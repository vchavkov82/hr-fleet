package odoo

import "fmt"

// ListExpenses retrieves hr.expense records from Odoo with optional domain filters.
// Returns the expense slice and total count for pagination.
func (c *Client) ListExpenses(domain []any, limit, offset int) ([]ExpenseReport, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.expense", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list expenses count: %w", err)
	}

	records, err := c.SearchRead("hr.expense", domain, expenseFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list expenses: %w", err)
	}

	expenses := make([]ExpenseReport, 0, len(records))
	for _, rec := range records {
		expenses = append(expenses, parseExpense(rec))
	}

	return expenses, int(count), nil
}

// CreateExpense creates a new hr.expense record in Odoo.
func (c *Client) CreateExpense(vals map[string]any) (int64, error) {
	id, err := c.Create("hr.expense", vals)
	if err != nil {
		return 0, fmt.Errorf("create expense: %w", err)
	}
	return id, nil
}

// ApproveExpense triggers the approval action on an hr.expense record.
func (c *Client) ApproveExpense(id int64) error {
	return c.CallAction("hr.expense", []int64{id}, "action_approve")
}

// RefuseExpense triggers the refusal action on an hr.expense record.
func (c *Client) RefuseExpense(id int64) error {
	return c.CallAction("hr.expense", []int64{id}, "action_refuse")
}

// parseExpense converts a raw Odoo record map into an ExpenseReport struct.
func parseExpense(rec map[string]any) ExpenseReport {
	return ExpenseReport{
		ID:          toInt64(rec["id"]),
		EmployeeID:  parseMany2One(rec["employee_id"]),
		Name:        toString(rec["name"]),
		Date:        toString(rec["date"]),
		TotalAmount: toFloat64(rec["total_amount"]),
		State:       toString(rec["state"]),
		ProductID:   parseMany2One(rec["product_id"]),
	}
}
