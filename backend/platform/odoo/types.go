package odoo

import "encoding/json"

// JSONRPCRequest represents a JSON-RPC 2.0 request to Odoo.
type JSONRPCRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params"`
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
	Data    interface{} `json:"data,omitempty"`
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
