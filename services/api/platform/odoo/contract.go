package odoo

import (
	"fmt"
)

// SearchContracts retrieves hr.contract records with optional domain filters.
func (c *Client) SearchContracts(domain []any, limit, offset int) ([]Contract, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.contract", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("search contracts count: %w", err)
	}

	records, err := c.SearchRead("hr.contract", domain, contractFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("search contracts: %w", err)
	}

	contracts := make([]Contract, 0, len(records))
	for _, rec := range records {
		c, err := parseContract(rec)
		if err != nil {
			return nil, 0, fmt.Errorf("parse contract: %w", err)
		}
		contracts = append(contracts, c)
	}

	return contracts, int(count), nil
}

// GetContract retrieves a single hr.contract by ID.
func (c *Client) GetContract(id int64) (*Contract, error) {
	records, err := c.Read("hr.contract", []int64{id}, contractFields)
	if err != nil {
		return nil, fmt.Errorf("get contract %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("contract %d not found", id)
	}

	contract, err := parseContract(records[0])
	if err != nil {
		return nil, fmt.Errorf("parse contract %d: %w", id, err)
	}

	return &contract, nil
}

// CreateContract creates a new hr.contract record in Odoo.
func (c *Client) CreateContract(vals map[string]any) (int64, error) {
	id, err := c.Create("hr.contract", vals)
	if err != nil {
		return 0, fmt.Errorf("create contract: %w", err)
	}
	return id, nil
}

// UpdateContract updates an existing hr.contract record in Odoo.
func (c *Client) UpdateContract(id int64, vals map[string]any) error {
	if err := c.Write("hr.contract", id, vals); err != nil {
		return fmt.Errorf("update contract %d: %w", id, err)
	}
	return nil
}

// parseContract converts a raw Odoo record map into a Contract struct.
func parseContract(rec map[string]any) (Contract, error) {
	c := Contract{
		ID:        toInt64(rec["id"]),
		Name:      toString(rec["name"]),
		DateStart: toString(rec["date_start"]),
		DateEnd:   toString(rec["date_end"]),
		Wage:      toFloat64(rec["wage"]),
		State:     toString(rec["state"]),
	}

	c.EmployeeID = parseMany2One(rec["employee_id"])
	c.StructureType = parseMany2One(rec["structure_type_id"])
	c.Department = parseMany2One(rec["department_id"])

	return c, nil
}

// toFloat64 converts an any to float64.
func toFloat64(v any) float64 {
	switch n := v.(type) {
	case float64:
		return n
	case int64:
		return float64(n)
	case int:
		return float64(n)
	default:
		return 0
	}
}
