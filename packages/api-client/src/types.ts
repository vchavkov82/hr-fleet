// ---------------------------------------------------------------------------
// Shared primitive types
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

// ---------------------------------------------------------------------------
// Employee
// ---------------------------------------------------------------------------

/** Odoo employee_type selection values. */
export type OdooEmployeeType =
  | 'employee'
  | 'student'
  | 'trainee'
  | 'contractor'
  | 'freelance'

export type EmployeeStatus = 'active' | 'inactive' | 'terminated'

export interface Employee {
  id: string
  employee_number: string
  first_name: string
  last_name: string
  email: string
  department_id: string
  department_name?: string
  job_title: string
  status: EmployeeStatus
  hire_date: string
  work_phone?: string
  employee_type?: OdooEmployeeType
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface EmployeeCreateInput {
  first_name: string
  last_name: string
  email: string
  department_id: string
  job_title: string
  employee_type?: OdooEmployeeType
  hire_date?: string
  work_phone?: string
}

export interface EmployeeListParams {
  page?: number
  per_page?: number
  search?: string
  department_id?: string
  active?: boolean
  status?: EmployeeStatus
}

// ---------------------------------------------------------------------------
// Department
// ---------------------------------------------------------------------------

export interface Department {
  id: string
  name: string
  code: string
  manager_id?: string
  manager_name?: string
  employee_count: number
  parent_id?: string
}

export interface DepartmentCreateInput {
  name: string
  code: string
  manager_id?: string
  parent_id?: string
}

export interface DepartmentListParams {
  page?: number
  per_page?: number
}

// ---------------------------------------------------------------------------
// Leave
// ---------------------------------------------------------------------------

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface LeaveRequest {
  id: string
  employee_id: string
  employee_name: string
  leave_type: string
  start_date: string
  end_date: string
  days: number
  status: LeaveStatus
  reason?: string
  created_at: string
}

export interface LeaveRequestCreateInput {
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason?: string
}

export interface LeaveListParams {
  page?: number
  per_page?: number
  status?: LeaveStatus
  employee_id?: string
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

export type ContractStatus = 'active' | 'expired' | 'terminated'

export interface Contract {
  id: string
  employee_id: string
  employee_name: string
  contract_type: string
  start_date: string
  end_date?: string
  status: ContractStatus
  salary: number
  currency: string
}

export interface ContractListParams {
  page?: number
  per_page?: number
  status?: ContractStatus
  employee_id?: string
}

// ---------------------------------------------------------------------------
// Timesheet
// ---------------------------------------------------------------------------

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Timesheet {
  id: string
  employee_id: string
  employee_name: string
  week_start: string
  week_end: string
  total_hours: number
  status: TimesheetStatus
}

export interface TimesheetListParams {
  page?: number
  per_page?: number
  status?: TimesheetStatus
  employee_id?: string
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'on_leave'

export interface Attendance {
  id: string
  employee_id: string
  employee_name: string
  date: string
  check_in?: string
  check_out?: string
  status: AttendanceStatus
}

export interface AttendanceListParams {
  page?: number
  per_page?: number
  date?: string
  employee_id?: string
}

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------

export type PayrollRunStatus =
  | 'draft'
  | 'processing'
  | 'completed'
  | 'cancelled'

export interface PayrollRun {
  id: string
  period_start: string
  period_end: string
  status: PayrollRunStatus
  total_gross: number
  total_net: number
  employee_count: number
  created_at: string
}

export interface PayrollRunListParams {
  page?: number
  per_page?: number
  status?: PayrollRunStatus
}

export type PayslipStatus = 'generated' | 'sent' | 'viewed'

export interface Payslip {
  id: string
  employee_id: string
  employee_name: string
  payroll_run_id: string
  period_start: string
  period_end: string
  gross_salary: number
  net_salary: number
  status: PayslipStatus
}

export interface PayslipListParams {
  page?: number
  per_page?: number
  payroll_run_id?: string
  employee_id?: string
}

// ---------------------------------------------------------------------------
// Expense
// ---------------------------------------------------------------------------

export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed'

export interface Expense {
  id: string
  employee_id: string
  employee_name: string
  category: string
  amount: number
  currency: string
  date: string
  status: ExpenseStatus
  description?: string
}

export interface ExpenseListParams {
  page?: number
  per_page?: number
  status?: ExpenseStatus
  employee_id?: string
}

// ---------------------------------------------------------------------------
// Appraisal
// ---------------------------------------------------------------------------

export type AppraisalStatus = 'draft' | 'in_progress' | 'completed'

export interface Appraisal {
  id: string
  employee_id: string
  employee_name: string
  reviewer_id: string
  reviewer_name: string
  period_start: string
  period_end: string
  status: AppraisalStatus
  overall_rating?: number
}

export interface AppraisalListParams {
  page?: number
  per_page?: number
  status?: AppraisalStatus
  employee_id?: string
}

// ---------------------------------------------------------------------------
// Training
// ---------------------------------------------------------------------------

export type CourseStatus = 'active' | 'inactive'

export interface Course {
  id: string
  name: string
  description?: string
  duration_hours: number
  instructor?: string
  status: CourseStatus
  enrolled_count: number
}

export interface CourseListParams {
  page?: number
  per_page?: number
  status?: CourseStatus
}

// ---------------------------------------------------------------------------
// Users & Settings
// ---------------------------------------------------------------------------

export type UserStatus = 'active' | 'inactive' | 'pending'

export interface User {
  id: string
  email: string
  name: string
  role: string
  status: UserStatus
  last_login_at?: string
  created_at: string
}

export interface UserListParams {
  page?: number
  per_page?: number
  role?: string
}

export interface OrgSettings {
  company_name: string
  timezone: string
  currency: string
  date_format: string
  fiscal_year_start: string
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string
  user_id: string
  user_email: string
  action: string
  resource_type: string
  resource_id: string
  changes?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

export interface AuditLogListParams {
  page?: number
  per_page?: number
  user_id?: string
  resource_type?: string
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStats {
  active_employees: number
  total_employees: number
  pending_leaves: number
  expiring_contracts: number
  pending_payroll: number
  pending_timesheets: number
}
