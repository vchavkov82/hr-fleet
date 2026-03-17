package odoo

import (
	"fmt"
)

// ListPayrollStructures retrieves hr.payroll.structure records from Odoo with optional domain filters.
// Returns the structure slice and total count for pagination.
func (c *Client) ListPayrollStructures(domain []any, limit, offset int) ([]PayrollStructure, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.payroll.structure", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list payroll structures count: %w", err)
	}

	records, err := c.SearchRead("hr.payroll.structure", domain, payrollStructureFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list payroll structures: %w", err)
	}

	structures := make([]PayrollStructure, 0, len(records))
	for _, rec := range records {
		s, err := parsePayrollStructure(rec)
		if err != nil {
			return nil, 0, fmt.Errorf("parse payroll structure: %w", err)
		}
		structures = append(structures, s)
	}

	return structures, int(count), nil
}

// GetPayrollStructure retrieves a single hr.payroll.structure by ID.
func (c *Client) GetPayrollStructure(id int64) (*PayrollStructure, error) {
	records, err := c.Read("hr.payroll.structure", []int64{id}, payrollStructureFields)
	if err != nil {
		return nil, fmt.Errorf("get payroll structure %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("payroll structure %d not found", id)
	}

	s, err := parsePayrollStructure(records[0])
	if err != nil {
		return nil, fmt.Errorf("parse payroll structure %d: %w", id, err)
	}

	return &s, nil
}

// ListSalaryRules retrieves hr.salary.rule records from Odoo with optional domain filters.
// Returns the rule slice and total count for pagination.
func (c *Client) ListSalaryRules(domain []any, limit, offset int) ([]SalaryRule, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.salary.rule", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list salary rules count: %w", err)
	}

	records, err := c.SearchRead("hr.salary.rule", domain, salaryRuleFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list salary rules: %w", err)
	}

	rules := make([]SalaryRule, 0, len(records))
	for _, rec := range records {
		r, err := parseSalaryRule(rec)
		if err != nil {
			return nil, 0, fmt.Errorf("parse salary rule: %w", err)
		}
		rules = append(rules, r)
	}

	return rules, int(count), nil
}

// ListPayslipsOCA retrieves hr.payslip records (OCA payroll) from Odoo with optional domain filters.
// Returns the payslip slice and total count for pagination.
func (c *Client) ListPayslipsOCA(domain []any, limit, offset int) ([]PayslipOCA, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.payslip", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list payslips oca count: %w", err)
	}

	records, err := c.SearchRead("hr.payslip", domain, payslipOCAFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list payslips oca: %w", err)
	}

	payslips := make([]PayslipOCA, 0, len(records))
	for _, rec := range records {
		p, err := parsePayslipOCA(rec)
		if err != nil {
			return nil, 0, fmt.Errorf("parse payslip oca: %w", err)
		}
		payslips = append(payslips, p)
	}

	return payslips, int(count), nil
}

// ListPayslipRuns retrieves hr.payslip.run records from Odoo with optional domain filters.
// Returns the run slice and total count for pagination.
func (c *Client) ListPayslipRuns(domain []any, limit, offset int) ([]PayslipRun, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.payslip.run", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list payslip runs count: %w", err)
	}

	records, err := c.SearchRead("hr.payslip.run", domain, payslipRunFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list payslip runs: %w", err)
	}

	runs := make([]PayslipRun, 0, len(records))
	for _, rec := range records {
		r, err := parsePayslipRun(rec)
		if err != nil {
			return nil, 0, fmt.Errorf("parse payslip run: %w", err)
		}
		runs = append(runs, r)
	}

	return runs, int(count), nil
}

// CreatePayslipRun creates a new hr.payslip.run record in Odoo.
func (c *Client) CreatePayslipRun(vals map[string]any) (int64, error) {
	id, err := c.Create("hr.payslip.run", vals)
	if err != nil {
		return 0, fmt.Errorf("create payslip run: %w", err)
	}
	return id, nil
}

// GeneratePayslips triggers the action_generate_payslips action on an hr.payslip.run record.
func (c *Client) GeneratePayslips(runID int64) error {
	if err := c.CallAction("hr.payslip.run", []int64{runID}, "action_generate_payslips"); err != nil {
		return fmt.Errorf("generate payslips for run %d: %w", runID, err)
	}
	return nil
}

// ConfirmPayslipRun triggers the action_close action on an hr.payslip.run record.
func (c *Client) ConfirmPayslipRun(runID int64) error {
	if err := c.CallAction("hr.payslip.run", []int64{runID}, "action_close"); err != nil {
		return fmt.Errorf("confirm payslip run %d: %w", runID, err)
	}
	return nil
}

// parsePayrollStructure converts a raw Odoo record map into a PayrollStructure struct.
func parsePayrollStructure(rec map[string]any) (PayrollStructure, error) {
	s := PayrollStructure{
		ID:      toInt64(rec["id"]),
		Name:    toString(rec["name"]),
		Code:    toString(rec["code"]),
		RuleIDs: toInt64Slice(rec["rule_ids"]),
		Active:  toBool(rec["active"]),
	}

	s.TypeID = parseMany2One(rec["type_id"])

	return s, nil
}

// parseSalaryRule converts a raw Odoo record map into a SalaryRule struct.
func parseSalaryRule(rec map[string]any) (SalaryRule, error) {
	r := SalaryRule{
		ID:           toInt64(rec["id"]),
		Name:         toString(rec["name"]),
		Code:         toString(rec["code"]),
		Sequence:     toInt64(rec["sequence"]),
		Amount:       toFloat64(rec["amount_fix"]),
		AmountPython: toString(rec["amount_python_compute"]),
		Active:       toBool(rec["active"]),
	}

	r.CategoryID = parseMany2One(rec["category_id"])
	r.StructID = parseMany2One(rec["struct_id"])

	return r, nil
}

// parsePayslipOCA converts a raw Odoo record map into a PayslipOCA struct.
func parsePayslipOCA(rec map[string]any) (PayslipOCA, error) {
	p := PayslipOCA{
		ID:        toInt64(rec["id"]),
		Name:      toString(rec["name"]),
		Number:    toString(rec["number"]),
		DateFrom:  toString(rec["date_from"]),
		DateTo:    toString(rec["date_to"]),
		State:     toString(rec["state"]),
		NetWage:   toFloat64(rec["net_wage"]),
		GrossWage: toFloat64(rec["gross_wage"]),
	}

	p.EmployeeID = parseMany2One(rec["employee_id"])
	p.StructID = parseMany2One(rec["struct_id"])
	p.ContractID = parseMany2One(rec["contract_id"])
	p.PayslipRunID = parseMany2One(rec["payslip_run_id"])

	return p, nil
}

// parsePayslipRun converts a raw Odoo record map into a PayslipRun struct.
func parsePayslipRun(rec map[string]any) (PayslipRun, error) {
	r := PayslipRun{
		ID:       toInt64(rec["id"]),
		Name:     toString(rec["name"]),
		DateFrom: toString(rec["date_start"]),
		DateTo:   toString(rec["date_end"]),
		State:    toString(rec["state"]),
	}

	return r, nil
}

