import type { PaginatedResponse, AuthResponse, Employee, EmployeeCreateInput, EmployeeListParams, Department, DepartmentCreateInput, DepartmentListParams, LeaveRequest, LeaveRequestCreateInput, LeaveListParams, Contract, ContractListParams, Timesheet, TimesheetListParams, Attendance, AttendanceListParams, PayrollRun, PayrollRunListParams, Payslip, PayslipListParams, Expense, ExpenseListParams, Appraisal, AppraisalListParams, Course, CourseListParams, User, UserListParams, OrgSettings, AuditLogEntry, AuditLogListParams, DashboardStats } from './types.js';
export interface ApiClientOptions {
    /**
     * Base URL of the Go API, e.g. "https://api.hr.example.com".
     * Must not include "/api/v1" — the client appends that prefix.
     */
    baseUrl: string;
    /**
     * Callback that returns the current bearer token (or null/undefined when
     * unauthenticated). May be async to support token-refresh flows.
     */
    getToken?: () => string | null | undefined | Promise<string | null | undefined>;
}
export declare class ApiClient {
    private readonly baseUrl;
    private readonly getToken;
    constructor(options: ApiClientOptions);
    private request;
    login(email: string, password: string): Promise<AuthResponse>;
    refreshToken(token: string): Promise<AuthResponse>;
    getDashboardStats(): Promise<DashboardStats>;
    getEmployees(params?: EmployeeListParams): Promise<PaginatedResponse<Employee>>;
    getEmployee(id: string): Promise<Employee>;
    createEmployee(data: EmployeeCreateInput): Promise<Employee>;
    updateEmployee(id: string, data: Partial<Employee>): Promise<Employee>;
    deleteEmployee(id: string): Promise<void>;
    getEmployeeContracts(employeeId: string, params?: {
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<Contract>>;
    getEmployeeLeaves(employeeId: string, params?: {
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<LeaveRequest>>;
    getEmployeeTimesheets(employeeId: string, params?: {
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<Timesheet>>;
    getEmployeePayslips(employeeId: string, params?: {
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<Payslip>>;
    getDepartments(params?: DepartmentListParams): Promise<PaginatedResponse<Department>>;
    getDepartment(id: string): Promise<Department>;
    createDepartment(data: DepartmentCreateInput): Promise<Department>;
    updateDepartment(id: string, data: Partial<Department>): Promise<Department>;
    deleteDepartment(id: string): Promise<void>;
    getDepartmentEmployees(departmentId: string, params?: {
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<Employee>>;
    getLeaveRequests(params?: LeaveListParams): Promise<PaginatedResponse<LeaveRequest>>;
    createLeaveRequest(data: LeaveRequestCreateInput): Promise<LeaveRequest>;
    approveLeave(id: string): Promise<void>;
    rejectLeave(id: string): Promise<void>;
    getContracts(params?: ContractListParams): Promise<PaginatedResponse<Contract>>;
    getTimesheets(params?: TimesheetListParams): Promise<PaginatedResponse<Timesheet>>;
    approveTimesheet(id: string): Promise<void>;
    getAttendance(params?: AttendanceListParams): Promise<PaginatedResponse<Attendance>>;
    getPayrollRuns(params?: PayrollRunListParams): Promise<PaginatedResponse<PayrollRun>>;
    getPayrollRun(id: string): Promise<PayrollRun>;
    getPayslips(params?: PayslipListParams): Promise<PaginatedResponse<Payslip>>;
    getPayrollRunPayslips(runId: string, params?: {
        page?: number;
        per_page?: number;
    }): Promise<PaginatedResponse<Payslip>>;
    getExpenses(params?: ExpenseListParams): Promise<PaginatedResponse<Expense>>;
    approveExpense(id: string): Promise<void>;
    rejectExpense(id: string): Promise<void>;
    getAppraisals(params?: AppraisalListParams): Promise<PaginatedResponse<Appraisal>>;
    getCourses(params?: CourseListParams): Promise<PaginatedResponse<Course>>;
    getUsers(params?: UserListParams): Promise<PaginatedResponse<User>>;
    getOrgSettings(): Promise<OrgSettings>;
    updateOrgSettings(data: Partial<OrgSettings>): Promise<OrgSettings>;
    getAuditLog(params?: AuditLogListParams): Promise<PaginatedResponse<AuditLogEntry>>;
}
//# sourceMappingURL=client.d.ts.map