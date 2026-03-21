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
/** Wraps optional typed list params into a RequestOptions object. */
function withParams(params) {
    if (params === undefined)
        return {};
    return { params: params };
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
        const query = options.params !== undefined ? buildQuery(options.params) : '';
        const url = `${this.baseUrl}/api/v1${path}${query}`;
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const init = { method, headers };
        if (options.body !== undefined)
            init.body = JSON.stringify(options.body);
        if (options.signal !== undefined)
            init.signal = options.signal;
        const res = await fetch(url, init);
        if (!res.ok) {
            const rawBody = await res.text().catch(() => 'Unknown error');
            let message = rawBody;
            try {
                const parsed = JSON.parse(rawBody);
                if (parsed !== null &&
                    typeof parsed === 'object' &&
                    'error' in parsed) {
                    const errField = parsed['error'];
                    if (errField !== null &&
                        typeof errField === 'object' &&
                        'message' in errField) {
                        const msg = errField['message'];
                        if (typeof msg === 'string')
                            message = msg;
                    }
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
        return this.request('GET', '/employees', withParams(params));
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
        return this.request('GET', '/departments', withParams(params));
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
        return this.request('GET', '/leave/requests', withParams(params));
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
        return this.request('GET', '/contracts', withParams(params));
    }
    // ---------------------------------------------------------------------------
    // Timesheets
    // ---------------------------------------------------------------------------
    getTimesheets(params) {
        return this.request('GET', '/timesheets', withParams(params));
    }
    approveTimesheet(id) {
        return this.request('POST', `/timesheets/${id}/approve`);
    }
    // ---------------------------------------------------------------------------
    // Attendance
    // ---------------------------------------------------------------------------
    getAttendance(params) {
        return this.request('GET', '/attendance', withParams(params));
    }
    // ---------------------------------------------------------------------------
    // Payroll
    // ---------------------------------------------------------------------------
    getPayrollRuns(params) {
        return this.request('GET', '/payroll/runs', withParams(params));
    }
    getPayrollRun(id) {
        return this.request('GET', `/payroll/runs/${id}`);
    }
    getPayslips(params) {
        return this.request('GET', '/payslips', withParams(params));
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
        return this.request('GET', '/expenses', withParams(params));
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
        return this.request('GET', '/appraisals', withParams(params));
    }
    // ---------------------------------------------------------------------------
    // Training
    // ---------------------------------------------------------------------------
    getCourses(params) {
        return this.request('GET', '/training/courses', withParams(params));
    }
    // ---------------------------------------------------------------------------
    // Users
    // ---------------------------------------------------------------------------
    getUsers(params) {
        return this.request('GET', '/users', withParams(params));
    }
    // ---------------------------------------------------------------------------
    // Org settings
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
        return this.request('GET', '/audit-log', withParams(params));
    }
}
//# sourceMappingURL=client.js.map