import { ApiError } from './errors.js'
import type {
  PaginatedResponse,
  AuthResponse,
  Employee,
  EmployeeCreateInput,
  EmployeeListParams,
  Department,
  DepartmentCreateInput,
  DepartmentListParams,
  LeaveRequest,
  LeaveRequestCreateInput,
  LeaveListParams,
  Contract,
  ContractListParams,
  Timesheet,
  TimesheetListParams,
  Attendance,
  AttendanceListParams,
  PayrollRun,
  PayrollRunListParams,
  Payslip,
  PayslipListParams,
  Expense,
  ExpenseListParams,
  Appraisal,
  AppraisalListParams,
  Course,
  CourseListParams,
  User,
  UserListParams,
  OrgSettings,
  AuditLogEntry,
  AuditLogListParams,
  DashboardStats,
} from './types.js'

export interface ApiClientOptions {
  /**
   * Base URL of the Go API, e.g. "https://api.hr.example.com".
   * Must not include "/api/v1" — the client appends that prefix.
   */
  baseUrl: string
  /**
   * Callback that returns the current bearer token (or null/undefined when
   * unauthenticated). May be async to support token-refresh flows.
   */
  getToken?: () => string | null | undefined | Promise<string | null | undefined>
}

type ParamsRecord = Record<string, string | number | boolean | undefined | null>

type RequestOptions = {
  params?: ParamsRecord
  body?: unknown
  signal?: AbortSignal
}

function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      qs.set(key, String(value))
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly getToken: NonNullable<ApiClientOptions['getToken']>

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '')
    this.getToken = options.getToken ?? (() => null)
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const token = await this.getToken()
    const query = options.params ? buildQuery(options.params) : ''
    const url = `${this.baseUrl}/api/v1${path}${query}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const init: RequestInit = { method, headers }
    if (options.body !== undefined) init.body = JSON.stringify(options.body)
    if (options.signal !== undefined) init.signal = options.signal
    const res = await fetch(url, init)

    if (!res.ok) {
      const body = await res.text().catch(() => 'Unknown error')
      // Try to extract message from JSON error envelope { "error": { "message": "..." } }
      let message = body
      try {
        const parsed = JSON.parse(body) as unknown
        if (
          parsed !== null &&
          typeof parsed === 'object' &&
          'error' in parsed &&
          parsed.error !== null &&
          typeof parsed.error === 'object' &&
          'message' in parsed.error &&
          typeof (parsed.error as Record<string, unknown>).message === 'string'
        ) {
          message = (parsed.error as Record<string, string>).message
        }
      } catch {
        // leave message as raw body text
      }
      throw new ApiError(res.status, message)
    }

    if (res.status === 204) {
      return undefined as T
    }

    return res.json() as Promise<T>
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/login', {
      body: { email, password },
    })
  }

  refreshToken(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/refresh', {
      body: { refresh_token: token },
    })
  }

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  async getDashboardStats(): Promise<DashboardStats> {
    const [employees, allEmployees, leaves, contracts] = await Promise.all([
      this.request<PaginatedResponse<Employee>>('GET', '/employees', {
        params: { active: true, per_page: 1 },
      }),
      this.request<PaginatedResponse<Employee>>('GET', '/employees', {
        params: { per_page: 1 },
      }),
      this.request<PaginatedResponse<LeaveRequest>>('GET', '/leave/requests', {
        params: { status: 'pending', per_page: 1 },
      }),
      this.request<PaginatedResponse<Contract>>('GET', '/contracts', {
        params: { per_page: 1 },
      }),
    ])

    return {
      active_employees: employees.meta.total,
      total_employees: allEmployees.meta.total,
      pending_leaves: leaves.meta.total,
      expiring_contracts: contracts.meta.total,
      pending_payroll: 0,
      pending_timesheets: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // Employees
  // ---------------------------------------------------------------------------

  getEmployees(
    params?: EmployeeListParams,
  ): Promise<PaginatedResponse<Employee>> {
    return this.request<PaginatedResponse<Employee>>('GET', '/employees', {
      params: params as RequestOptions['params'],
    })
  }

  getEmployee(id: string): Promise<Employee> {
    return this.request<Employee>('GET', `/employees/${id}`)
  }

  createEmployee(data: EmployeeCreateInput): Promise<Employee> {
    return this.request<Employee>('POST', '/employees', { body: data })
  }

  updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    return this.request<Employee>('PATCH', `/employees/${id}`, { body: data })
  }

  deleteEmployee(id: string): Promise<void> {
    return this.request<void>('DELETE', `/employees/${id}`)
  }

  getEmployeeContracts(
    employeeId: string,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Contract>> {
    return this.request<PaginatedResponse<Contract>>('GET', '/contracts', {
      params: { employee_id: employeeId, per_page: 50, ...params },
    })
  }

  getEmployeeLeaves(
    employeeId: string,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<LeaveRequest>> {
    return this.request<PaginatedResponse<LeaveRequest>>(
      'GET',
      '/leave/requests',
      { params: { employee_id: employeeId, per_page: 50, ...params } },
    )
  }

  getEmployeeTimesheets(
    employeeId: string,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Timesheet>> {
    return this.request<PaginatedResponse<Timesheet>>('GET', '/timesheets', {
      params: { employee_id: employeeId, per_page: 50, ...params },
    })
  }

  getEmployeePayslips(
    employeeId: string,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Payslip>> {
    return this.request<PaginatedResponse<Payslip>>('GET', '/payslips', {
      params: { employee_id: employeeId, per_page: 50, ...params },
    })
  }

  // ---------------------------------------------------------------------------
  // Departments
  // ---------------------------------------------------------------------------

  getDepartments(
    params?: DepartmentListParams,
  ): Promise<PaginatedResponse<Department>> {
    return this.request<PaginatedResponse<Department>>('GET', '/departments', {
      params: params as RequestOptions['params'],
    })
  }

  getDepartment(id: string): Promise<Department> {
    return this.request<Department>('GET', `/departments/${id}`)
  }

  createDepartment(data: DepartmentCreateInput): Promise<Department> {
    return this.request<Department>('POST', '/departments', { body: data })
  }

  updateDepartment(
    id: string,
    data: Partial<Department>,
  ): Promise<Department> {
    return this.request<Department>('PATCH', `/departments/${id}`, {
      body: data,
    })
  }

  deleteDepartment(id: string): Promise<void> {
    return this.request<void>('DELETE', `/departments/${id}`)
  }

  getDepartmentEmployees(
    departmentId: string,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Employee>> {
    return this.request<PaginatedResponse<Employee>>('GET', '/employees', {
      params: { department_id: departmentId, ...params },
    })
  }

  // ---------------------------------------------------------------------------
  // Leave requests
  // ---------------------------------------------------------------------------

  getLeaveRequests(
    params?: LeaveListParams,
  ): Promise<PaginatedResponse<LeaveRequest>> {
    return this.request<PaginatedResponse<LeaveRequest>>(
      'GET',
      '/leave/requests',
      { params: params as RequestOptions['params'] },
    )
  }

  createLeaveRequest(data: LeaveRequestCreateInput): Promise<LeaveRequest> {
    return this.request<LeaveRequest>('POST', '/leave/requests', { body: data })
  }

  approveLeave(id: string): Promise<void> {
    return this.request<void>('POST', `/leave/requests/${id}/approve`)
  }

  rejectLeave(id: string): Promise<void> {
    return this.request<void>('POST', `/leave/requests/${id}/reject`)
  }

  // ---------------------------------------------------------------------------
  // Contracts
  // ---------------------------------------------------------------------------

  getContracts(
    params?: ContractListParams,
  ): Promise<PaginatedResponse<Contract>> {
    return this.request<PaginatedResponse<Contract>>('GET', '/contracts', {
      params: params as RequestOptions['params'],
    })
  }

  // ---------------------------------------------------------------------------
  // Timesheets
  // ---------------------------------------------------------------------------

  getTimesheets(
    params?: TimesheetListParams,
  ): Promise<PaginatedResponse<Timesheet>> {
    return this.request<PaginatedResponse<Timesheet>>('GET', '/timesheets', {
      params: params as RequestOptions['params'],
    })
  }

  approveTimesheet(id: string): Promise<void> {
    return this.request<void>('POST', `/timesheets/${id}/approve`)
  }

  // ---------------------------------------------------------------------------
  // Attendance
  // ---------------------------------------------------------------------------

  getAttendance(
    params?: AttendanceListParams,
  ): Promise<PaginatedResponse<Attendance>> {
    return this.request<PaginatedResponse<Attendance>>('GET', '/attendance', {
      params: params as RequestOptions['params'],
    })
  }

  // ---------------------------------------------------------------------------
  // Payroll
  // ---------------------------------------------------------------------------

  getPayrollRuns(
    params?: PayrollRunListParams,
  ): Promise<PaginatedResponse<PayrollRun>> {
    return this.request<PaginatedResponse<PayrollRun>>('GET', '/payroll/runs', {
      params: params as RequestOptions['params'],
    })
  }

  getPayrollRun(id: string): Promise<PayrollRun> {
    return this.request<PayrollRun>('GET', `/payroll/runs/${id}`)
  }

  getPayslips(
    params?: PayslipListParams,
  ): Promise<PaginatedResponse<Payslip>> {
    return this.request<PaginatedResponse<Payslip>>('GET', '/payslips', {
      params: params as RequestOptions['params'],
    })
  }

  getPayrollRunPayslips(
    runId: string,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Payslip>> {
    return this.request<PaginatedResponse<Payslip>>('GET', '/payslips', {
      params: { payroll_run_id: runId, ...params },
    })
  }

  // ---------------------------------------------------------------------------
  // Expenses
  // ---------------------------------------------------------------------------

  getExpenses(
    params?: ExpenseListParams,
  ): Promise<PaginatedResponse<Expense>> {
    return this.request<PaginatedResponse<Expense>>('GET', '/expenses', {
      params: params as RequestOptions['params'],
    })
  }

  approveExpense(id: string): Promise<void> {
    return this.request<void>('POST', `/expenses/${id}/approve`)
  }

  rejectExpense(id: string): Promise<void> {
    return this.request<void>('POST', `/expenses/${id}/reject`)
  }

  // ---------------------------------------------------------------------------
  // Appraisals
  // ---------------------------------------------------------------------------

  getAppraisals(
    params?: AppraisalListParams,
  ): Promise<PaginatedResponse<Appraisal>> {
    return this.request<PaginatedResponse<Appraisal>>('GET', '/appraisals', {
      params: params as RequestOptions['params'],
    })
  }

  // ---------------------------------------------------------------------------
  // Training
  // ---------------------------------------------------------------------------

  getCourses(params?: CourseListParams): Promise<PaginatedResponse<Course>> {
    return this.request<PaginatedResponse<Course>>('GET', '/training/courses', {
      params: params as RequestOptions['params'],
    })
  }

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  getUsers(params?: UserListParams): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>('GET', '/users', {
      params: params as RequestOptions['params'],
    })
  }

  // ---------------------------------------------------------------------------
  // Org Settings
  // ---------------------------------------------------------------------------

  getOrgSettings(): Promise<OrgSettings> {
    return this.request<OrgSettings>('GET', '/settings/organization')
  }

  updateOrgSettings(data: Partial<OrgSettings>): Promise<OrgSettings> {
    return this.request<OrgSettings>('PATCH', '/settings/organization', {
      body: data,
    })
  }

  // ---------------------------------------------------------------------------
  // Audit log
  // ---------------------------------------------------------------------------

  getAuditLog(
    params?: AuditLogListParams,
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    return this.request<PaginatedResponse<AuditLogEntry>>('GET', '/audit-log', {
      params: params as RequestOptions['params'],
    })
  }
}
