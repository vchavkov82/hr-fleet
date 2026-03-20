package auth

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
)

// Role represents a user role in the system.
type Role string

const (
	SuperAdmin      Role = "super_admin"
	Admin           Role = "admin"
	HRManager       Role = "hr_manager"
	HROfficer       Role = "hr_officer"
	PayrollManager  Role = "payroll_manager"
	Recruiter       Role = "recruiter"
	Accountant      Role = "accountant"
	Employee        Role = "employee"
	Viewer          Role = "viewer"
)

// Permission represents an action that can be performed.
type Permission string

const (
	ManageUsers      Permission = "manage_users"
	ManageEmployees  Permission = "manage_employees"
	ManagePayroll    Permission = "manage_payroll"
	ApprovePayroll   Permission = "approve_payroll"
	ViewPayroll      Permission = "view_payroll"
	ManageLeave      Permission = "manage_leave"
	ApproveLeave     Permission = "approve_leave"
	ManageContracts  Permission = "manage_contracts"
	ViewReports      Permission = "view_reports"
	ManageWebhooks   Permission = "manage_webhooks"
	ViewAudit        Permission = "view_audit"
)

// RolePermissions maps each role to its allowed permissions.
var RolePermissions = map[Role][]Permission{
	SuperAdmin: {
		ManageUsers, ManageEmployees, ManagePayroll, ApprovePayroll,
		ViewPayroll, ManageLeave, ApproveLeave, ManageContracts,
		ViewReports, ManageWebhooks, ViewAudit,
	},
	Admin: {
		ManageUsers, ManageEmployees, ManagePayroll, ApprovePayroll,
		ViewPayroll, ManageLeave, ApproveLeave, ManageContracts,
		ViewReports, ManageWebhooks, ViewAudit,
	},
	HRManager: {
		ManageEmployees, ManageLeave, ApproveLeave, ManageContracts,
		ViewPayroll, ViewReports,
	},
	HROfficer: {
		ManageEmployees, ManageLeave, ManageContracts, ViewReports,
	},
	PayrollManager: {
		ManagePayroll, ApprovePayroll, ViewPayroll, ViewReports,
	},
	Recruiter: {
		ManageEmployees, ManageContracts, ViewReports,
	},
	Accountant: {
		ManagePayroll, ViewPayroll, ViewReports,
	},
	Employee: {
		ViewPayroll,
	},
	Viewer: {
		ViewReports, ViewPayroll,
	},
}

// HasPermission checks if a role has a specific permission.
func HasPermission(role Role, perm Permission) bool {
	perms, ok := RolePermissions[role]
	if !ok {
		return false
	}
	for _, p := range perms {
		if p == perm {
			return true
		}
	}
	return false
}

// RequireRole returns middleware that checks the JWT role claim against allowed roles.
func RequireRole(roles ...Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, claims, _ := jwtauth.FromContext(r.Context())
			roleStr, _ := claims["role"].(string)
			userRole := Role(roleStr)

			for _, allowed := range roles {
				if userRole == allowed {
					next.ServeHTTP(w, r)
					return
				}
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "insufficient permissions"})
		})
	}
}

// RequirePermission returns middleware that checks if the user's role has a specific permission.
func RequirePermission(perm Permission) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, claims, _ := jwtauth.FromContext(r.Context())
			roleStr, _ := claims["role"].(string)

			if !HasPermission(Role(roleStr), perm) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": "insufficient permissions"})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
