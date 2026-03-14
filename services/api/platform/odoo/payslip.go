package odoo

import "encoding/json"

// PayslipSearchParams defines filters for searching payslips in Odoo.
type PayslipSearchParams struct {
	EmployeeID int64  `json:"employee_id,omitempty"`
	DateFrom   string `json:"date_from,omitempty"`
	DateTo     string `json:"date_to,omitempty"`
	State      string `json:"state,omitempty"`
}

// OdooPayslip represents a payslip record from Odoo's hr.payslip model.
type OdooPayslip struct {
	ID         int64   `json:"id"`
	EmployeeID []any   `json:"employee_id"`
	DateFrom   string  `json:"date_from"`
	DateTo     string  `json:"date_to"`
	State      string  `json:"state"`
	Name       string  `json:"name"`
	NetWage    float64 `json:"net_wage"`
}

// SearchPayslips searches hr.payslip records in Odoo.
func (c *Client) SearchPayslips(filters []any, offset, limit int) ([]OdooPayslip, int, error) {
	domain := filters
	if domain == nil {
		domain = []any{}
	}

	countRaw, err := c.Call("hr.payslip", "search_count", []any{domain})
	if err != nil {
		return nil, 0, err
	}
	var count int
	if err := json.Unmarshal(countRaw, &count); err != nil {
		return nil, 0, err
	}

	raw, err := c.Call("hr.payslip", "search_read", []any{
		domain,
		[]string{"id", "employee_id", "date_from", "date_to", "state", "name", "net_wage"},
		offset,
		limit,
	})
	if err != nil {
		return nil, 0, err
	}

	var payslips []OdooPayslip
	if err := json.Unmarshal(raw, &payslips); err != nil {
		return nil, 0, err
	}

	return payslips, count, nil
}
