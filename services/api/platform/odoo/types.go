package odoo

import "encoding/json"

// JSONRPCRequest represents a JSON-RPC 2.0 request to Odoo.
type JSONRPCRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  any `json:"params"`
	ID      int         `json:"id"`
}

// JSONRPCResponse represents a JSON-RPC 2.0 response from Odoo.
type JSONRPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      int             `json:"id"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *RPCError       `json:"error,omitempty"`
}

// RPCError represents an error returned by Odoo's JSON-RPC endpoint.
type RPCError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    any `json:"data,omitempty"`
}

func (e *RPCError) Error() string {
	return e.Message
}

// Many2One represents an Odoo many2one field value [id, name].
type Many2One struct {
	ID   int64
	Name string
}

// Employee represents an hr.employee record from Odoo.
type Employee struct {
	ID           int64   `json:"id"`
	Name         string  `json:"name"`
	WorkEmail    string  `json:"work_email"`
	JobTitle     string  `json:"job_title"`
	DepartmentID Many2One `json:"department_id"`
	JobID        Many2One `json:"job_id"`
	ParentID     Many2One `json:"parent_id"`
	WorkPhone    string  `json:"work_phone"`
	MobilePhone  string  `json:"mobile_phone"`
	EmployeeType string  `json:"employee_type"`
	Active       bool    `json:"active"`
	CreateDate   string  `json:"create_date"`
	WriteDate    string  `json:"write_date"`
}

// EmployeeCreateRequest contains fields for creating a new hr.employee record.
type EmployeeCreateRequest struct {
	Name         string `json:"name"`
	WorkEmail    string `json:"work_email"`
	JobTitle     string `json:"job_title"`
	DepartmentID int64  `json:"department_id"`
	EmployeeType string `json:"employee_type"`
}

// Contract represents an hr.contract record from Odoo.
type Contract struct {
	ID            int64    `json:"id"`
	EmployeeID    Many2One `json:"employee_id"`
	Name          string   `json:"name"`
	DateStart     string   `json:"date_start"`
	DateEnd       string   `json:"date_end,omitempty"`
	Wage          float64  `json:"wage"`
	State         string   `json:"state"`
	StructureType Many2One `json:"structure_type_id"`
	Department    Many2One `json:"department_id"`
}

// ContractCreateRequest contains fields for creating a new hr.contract record.
type ContractCreateRequest struct {
	EmployeeID    int64   `json:"employee_id"`
	Name          string  `json:"name"`
	DateStart     string  `json:"date_start"`
	DateEnd       string  `json:"date_end,omitempty"`
	Wage          float64 `json:"wage"`
	StructureType int64   `json:"structure_type_id,omitempty"`
	DepartmentID  int64   `json:"department_id,omitempty"`
}

// contractFields lists the field names to request from Odoo for hr.contract records.
var contractFields = []string{
	"id",
	"employee_id",
	"name",
	"date_start",
	"date_end",
	"wage",
	"state",
	"structure_type_id",
	"department_id",
}

// LeaveAllocation represents an hr.leave.allocation record from Odoo.
type LeaveAllocation struct {
	ID              int64    `json:"id"`
	EmployeeID      Many2One `json:"employee_id"`
	HolidayStatusID Many2One `json:"holiday_status_id"`
	NumberOfDays    float64  `json:"number_of_days"`
	State           string   `json:"state"`
}

// leaveAllocationFields lists the field names for hr.leave.allocation.
var leaveAllocationFields = []string{
	"id",
	"employee_id",
	"holiday_status_id",
	"number_of_days",
	"state",
}

// LeaveRequest represents an hr.leave record from Odoo.
type LeaveRequest struct {
	ID              int64    `json:"id"`
	EmployeeID      Many2One `json:"employee_id"`
	HolidayStatusID Many2One `json:"holiday_status_id"`
	DateFrom        string   `json:"date_from"`
	DateTo          string   `json:"date_to"`
	NumberOfDays    float64  `json:"number_of_days"`
	State           string   `json:"state"`
	Name            string   `json:"name"`
}

// LeaveCreateRequest contains fields for creating a new hr.leave record.
type LeaveCreateRequest struct {
	EmployeeID      int64  `json:"employee_id"`
	HolidayStatusID int64  `json:"holiday_status_id"`
	DateFrom        string `json:"date_from"`
	DateTo          string `json:"date_to"`
	Name            string `json:"name"`
}

// leaveRequestFields lists the field names for hr.leave.
var leaveRequestFields = []string{
	"id",
	"employee_id",
	"holiday_status_id",
	"date_from",
	"date_to",
	"number_of_days",
	"state",
	"name",
}

// employeeFields lists the field names to request from Odoo for hr.employee records.
var employeeFields = []string{
	"id",
	"name",
	"work_email",
	"job_title",
	"job_id",
	"department_id",
	"parent_id",
	"work_phone",
	"mobile_phone",
	"employee_type",
	"active",
	"create_date",
	"write_date",
}

// PayrollStructure represents an hr.payroll.structure record from Odoo (OCA payroll).
type PayrollStructure struct {
	ID      int64    `json:"id"`
	Name    string   `json:"name"`
	Code    string   `json:"code"`
	TypeID  Many2One `json:"type_id"`
	RuleIDs []int64  `json:"rule_ids"`
	Active  bool     `json:"active"`
}

var payrollStructureFields = []string{
	"id", "name", "code", "type_id", "rule_ids", "active",
}

// SalaryRule represents an hr.salary.rule record from Odoo (OCA payroll).
type SalaryRule struct {
	ID           int64    `json:"id"`
	Name         string   `json:"name"`
	Code         string   `json:"code"`
	CategoryID   Many2One `json:"category_id"`
	StructID     Many2One `json:"struct_id"`
	Sequence     int64    `json:"sequence"`
	Amount       float64  `json:"amount_fix"`
	AmountPython string   `json:"amount_python_compute"`
	Active       bool     `json:"active"`
}

var salaryRuleFields = []string{
	"id", "name", "code", "category_id", "struct_id", "sequence",
	"amount_fix", "amount_python_compute", "active",
}

// PayslipOCA represents an hr.payslip record from OCA payroll (richer than base).
type PayslipOCA struct {
	ID           int64    `json:"id"`
	EmployeeID   Many2One `json:"employee_id"`
	StructID     Many2One `json:"struct_id"`
	Name         string   `json:"name"`
	Number       string   `json:"number"`
	DateFrom     string   `json:"date_from"`
	DateTo       string   `json:"date_to"`
	State        string   `json:"state"`
	NetWage      float64  `json:"net_wage"`
	GrossWage    float64  `json:"gross_wage"`
	ContractID   Many2One `json:"contract_id"`
	PayslipRunID Many2One `json:"payslip_run_id"`
}

var payslipOCAFields = []string{
	"id", "employee_id", "struct_id", "name", "number",
	"date_from", "date_to", "state", "net_wage", "gross_wage",
	"contract_id", "payslip_run_id",
}

// PayslipRun represents an hr.payslip.run record from OCA payroll.
type PayslipRun struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	DateFrom string `json:"date_start"`
	DateTo   string `json:"date_end"`
	State    string `json:"state"`
}

var payslipRunFields = []string{
	"id", "name", "date_start", "date_end", "state",
}
