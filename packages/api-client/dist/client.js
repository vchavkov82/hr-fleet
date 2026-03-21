import { ApiError } from './errors.js';
function buildQuery(params) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            qs.set(key, String(value));
        }
    }
    const str = qs.toString();
    return str ? `?${str}` : '';
}
export class ApiClient {
    baseUrl;
    getToken;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/+$/, '');
        this.getToken = options.getToken ?? (() => null);
    }
    async request(method, path, options = {}) {
        const token = await this.getToken();
        const query = options.params ? buildQuery(options.params) : '';
        const url = `${this.baseUrl}/api/v1${path}${query}`;
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(url, {
            method,
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            signal: options.signal,
        });
        if (!res.ok) {
            const body = await res.text().catch(() => 'Unknown error');
            // Try to extract message from JSON error envelope { "error": { "message": "..." } }
            let message = body;
            try {
                const parsed = JSON.parse(body);
                if (parsed !== null &&
                    typeof parsed === 'object' &&
                    'error' in parsed &&
                    parsed.error !== null &&
                    typeof parsed.error === 'object' &&
                    'message' in parsed.error &&
                    typeof parsed.error.message === 'string') {
                    message = parsed.error.message;
                }
            }
            catch {
                // leave message as raw body text
            }
            throw new ApiError(res.status, message);
        }
        if (res.status === 204) {
            return undefined;
        }
        return res.json();
    }
    // ---------------------------------------------------------------------------
    // Auth
    // ---------------------------------------------------------------------------
    login(email, password) {
        return this.request('POST', '/auth/login', {
            body: { email, password },
        });
    }
    refreshToken(token) {
        return this.request('POST', '/auth/refresh', {
            body: { refresh_token: token },
        });
    }
    // ---------------------------------------------------------------------------
    // Dashboard
    // ---------------------------------------------------------------------------
    async getDashboardStats() {
        const [employees, allEmployees, leaves, contracts] = await Promise.all([
            this.request('GET', '/employees', {
                params: { active: true, per_page: 1 },
            }),
            this.request('GET', '/employees', {
                params: { per_page: 1 },
            }),
            this.request('GET', '/leave/requests', {
                params: { status: 'pending', per_page: 1 },
            }),
            this.request('GET', '/contracts', {
                params: { per_page: 1 },
            }),
        ]);
        return {
            active_employees: employees.meta.total,
            total_employees: allEmployees.meta.total,
            pending_leaves: leaves.meta.total,
            expiring_contracts: contracts.meta.total,
            pending_payroll: 0,
            pending_timesheets: 0,
        };
    }
    // ---------------------------------------------------------------------------
    // Employees
    // ---------------------------------------------------------------------------
    getEmployees(params) {
        return this.request('GET', '/employees', {
            params: params,
        });
    }
    getEmployee(id) {
        return this.request('GET', `/employees/${id}`);
    }
    createEmployee(data) {
        return this.request('POST', '/employees', { body: data });
    }
    updateEmployee(id, data) {
        return this.request('PATCH', `/employees/${id}`, { body: data });
    }
    deleteEmployee(id) {
        return this.request('DELETE', `/employees/${id}`);
    }
    getEmployeeContracts(employeeId, params) {
        return this.request('GET', '/contracts', {
            params: { employee_id: employeeId, per_page: 50, ...params },
        });
    }
    getEmployeeLeaves(employeeId, params) {
        return this.request('GET', '/leave/requests', { params: { employee_id: employeeId, per_page: 50, ...params } });
    }
    getEmployeeTimesheets(employeeId, params) {
        return this.request('GET', '/timesheets', {
            params: { employee_id: employeeId, per_page: 50, ...params },
        });
    }
    getEmployeePayslips(employeeId, params) {
        return this.request('GET', '/payslips', {
            params: { employee_id: employeeId, per_page: 50, ...params },
        });
    }
    // ---------------------------------------------------------------------------
    // Departments
    // ---------------------------------------------------------------------------
    getDepartments(params) {
        return this.request('GET', '/departments', {
            params: params,
        });
    }
    getDepartment(id) {
        return this.request('GET', `/departments/${id}`);
    }
    createDepartment(data) {
        return this.request('POST', '/departments', { body: data });
    }
    updateDepartment(id, data) {
        return this.request('PATCH', `/departments/${id}`, {
            body: data,
        });
    }
    deleteDepartment(id) {
        return this.request('DELETE', `/departments/${id}`);
    }
    getDepartmentEmployees(departmentId, params) {
        return this.request('GET', '/employees', {
            params: { department_id: departmentId, ...params },
        });
    }
    // ---------------------------------------------------------------------------
    // Leave requests
    // ---------------------------------------------------------------------------
    getLeaveRequests(params) {
        return this.request('GET', '/leave/requests', { params: params });
    }
    createLeaveRequest(data) {
        return this.request('POST', '/leave/requests', { body: data });
    }
    approveLeave(id) {
        return this.request('POST', `/leave/requests/${id}/approve`);
    }
    rejectLeave(id) {
        return this.request('POST', `/leave/requests/${id}/reject`);
    }
    // ---------------------------------------------------------------------------
    // Contracts
    // ---------------------------------------------------------------------------
    getContracts(params) {
        return this.request('GET', '/contracts', {
            params: params,
        });
    }
    // ---------------------------------------------------------------------------
    // Timesheets
    // ---------------------------------------------------------------------------
    getTimesheets(params) {
        return this.request('GET', '/timesheets', {
            params: params,
        });
    }
    approveTimesheet(id) {
        return this.request('POST', `/timesheets/${id}/approve`);
    }
    // ---------------------------------------------------------------------------
    // Attendance
    // ---------------------------------------------------------------------------
    getAttendance(params) {
        return this.request('GET', '/attendance', {
            params: params,
        });
    }
    // ---------------------------------------------------------------------------
    // Payroll
    // ---------------------------------------------------------------------------
    getPayrollRuns(params) {
        return this.request('GET', '/payroll/runs', {
            params: params,
        });
    }
    getPayrollRun(id) {
        return this.request('GET', `/payroll/runs/${id}`);
    }
    getPayslips(params) {
        return this.request('GET', '/payslips', {
            params: params,
        });
    }
    getPayrollRunPayslips(runId, params) {
        return this.request('GET', '/payslips', {
            params: { payroll_run_id: runId, ...params },
        });
    }
    // ---------------------------------------------------------------------------
    // Expenses
    // ---------------------------------------------------------------------------
    getExpenses(params) {
        return this.request('GET', '/expenses', {
            params: params,
        });
    }
    approveExpense(id) {
        return this.request('POST', `/expenses/${id}/approve`);
    }
    rejectExpense(id) {
        return this.request('POST', `/expenses/${id}/reject`);
    }
    // ---------------------------------------------------------------------------
    // Appraisals
    // ---------------------------------------------------------------------------
    getAppraisals(params) {
        return this.request('GET', '/appraisals', {
            params: params,
        });
    }
    // ---------------------------------------------------------------------------
    // Training
    // ---------------------------------------------------------------------------
    getCourses(params) {
        return this.request('GET', '/training/courses', {
            params: params,
        });
    }
    // ---------------------------------------------------------------------------
    // Users
    // ---------------------------------------------------------------------------
    getUsers(params) {
        return this.request('GET', '/users', {
            params: params,
        });
    }
    // ---------------------------------------------------------------------------
    // Org Settings
    // ---------------------------------------------------------------------------
    getOrgSettings() {
        return this.request('GET', '/settings/organization');
    }
    updateOrgSettings(data) {
        return this.request('PATCH', '/settings/organization', {
            body: data,
        });
    }
    // ---------------------------------------------------------------------------
    // Audit log
    // ---------------------------------------------------------------------------
    getAuditLog(params) {
        return this.request('GET', '/audit-log', {
            params: params,
        });
    }
}
//# sourceMappingURL=client.js.map