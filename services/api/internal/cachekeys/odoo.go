package cachekeys

import "fmt"

// OdooCompanyShard namespaces cache keys per Odoo res.company to prevent cross-tenant leakage.
func OdooCompanyShard(odooCompanyID int64) string {
	return fmt.Sprintf("oc:%d:", odooCompanyID)
}

// Redis key prefixes for Odoo-backed HR data (used by API services and Odoo webhook sync worker).
const (
	EmployeesListPrefix   = "employees:list:"
	EmployeesDetailPrefix = "employees:detail:"
	ContractsListPrefix   = "contracts:list:"
	ContractsDetailPrefix = "contracts:detail:"
	// LeaveAllocPrefix and LeaveReqPrefix are used for list cache keys (hashed suffix).
	LeaveAllocPrefix = "leave:alloc:"
	LeaveReqPrefix   = "leave:req:"
	// LeavePattern matches all leave-related API cache keys and :stale variants.
	LeavePattern = "leave:*"
)
