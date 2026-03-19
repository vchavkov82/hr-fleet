import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface DashboardStats {
  active_employees: number;
  total_employees: number;
  pending_leaves: number;
  expiring_contracts: number;
  pending_payroll: number;
  pending_timesheets: number;
}

export interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  department_name?: string;
  job_title: string;
  status: 'active' | 'inactive' | 'terminated';
  hire_date: string;
  work_phone?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  manager_id?: string;
  manager_name?: string;
  employee_count: number;
  parent_id?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  created_at: string;
}

export interface Contract {
  id: string;
  employee_id: string;
  employee_name: string;
  contract_type: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'expired' | 'terminated';
  salary: number;
  currency: string;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  employee_name: string;
  week_start: string;
  week_end: string;
  total_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface Attendance {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
}

export interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'processing' | 'completed' | 'cancelled';
  total_gross: number;
  total_net: number;
  employee_count: number;
  created_at: string;
}

export interface Payslip {
  id: string;
  employee_id: string;
  employee_name: string;
  payroll_run_id: string;
  period_start: string;
  period_end: string;
  gross_salary: number;
  net_salary: number;
  status: 'generated' | 'sent' | 'viewed';
}

export interface Expense {
  id: string;
  employee_id: string;
  employee_name: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  description?: string;
}

export interface Appraisal {
  id: string;
  employee_id: string;
  employee_name: string;
  reviewer_id: string;
  reviewer_name: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'in_progress' | 'completed';
  overall_rating?: number;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  duration_hours: number;
  instructor?: string;
  status: 'active' | 'inactive';
  enrolled_count: number;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [employees, allEmployees, leaves, contracts] = await Promise.all([
    api.get('/employees', { params: { active: true, per_page: 1 } }),
    api.get('/employees', { params: { per_page: 1 } }),
    api.get('/leave/requests', { params: { status: 'pending', per_page: 1 } }),
    api.get('/contracts', { params: { per_page: 1 } }),
  ]);

  return {
    active_employees: employees.data?.meta?.total ?? 0,
    total_employees: allEmployees.data?.meta?.total ?? 0,
    pending_leaves: leaves.data?.meta?.total ?? 0,
    expiring_contracts: contracts.data?.meta?.total ?? 0,
    pending_payroll: 0,
    pending_timesheets: 0,
  };
}

export async function getEmployees(params?: {
  page?: number;
  per_page?: number;
  active?: boolean;
  department_id?: string;
  search?: string;
}): Promise<PaginatedResponse<Employee>> {
  const res = await api.get('/employees', { params });
  return res.data;
}

export async function getDepartments(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Department>> {
  const res = await api.get('/departments', { params });
  return res.data;
}

export async function getLeaveRequests(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  employee_id?: string;
}): Promise<PaginatedResponse<LeaveRequest>> {
  const res = await api.get('/leave/requests', { params });
  return res.data;
}

export async function getContracts(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  employee_id?: string;
}): Promise<PaginatedResponse<Contract>> {
  const res = await api.get('/contracts', { params });
  return res.data;
}

export async function getTimesheets(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<Timesheet>> {
  const res = await api.get('/timesheets', { params });
  return res.data;
}

export async function getAttendance(params?: {
  page?: number;
  per_page?: number;
  date?: string;
}): Promise<PaginatedResponse<Attendance>> {
  const res = await api.get('/attendance', { params });
  return res.data;
}

export async function getPayrollRuns(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<PayrollRun>> {
  const res = await api.get('/payroll/runs', { params });
  return res.data;
}

export async function getPayslips(params?: {
  page?: number;
  per_page?: number;
  payroll_run_id?: string;
}): Promise<PaginatedResponse<Payslip>> {
  const res = await api.get('/payslips', { params });
  return res.data;
}

export async function getExpenses(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<Expense>> {
  const res = await api.get('/expenses', { params });
  return res.data;
}

export async function getAppraisals(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<Appraisal>> {
  const res = await api.get('/appraisals', { params });
  return res.data;
}

export async function getCourses(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Course>> {
  const res = await api.get('/training/courses', { params });
  return res.data;
}

export async function getAuditLog(params?: {
  page?: number;
  per_page?: number;
  user_id?: string;
  resource_type?: string;
}): Promise<PaginatedResponse<AuditLogEntry>> {
  const res = await api.get('/audit-log', { params });
  return res.data;
}

export async function approveLeave(id: string): Promise<void> {
  await api.post(`/leave/requests/${id}/approve`);
}

export async function rejectLeave(id: string): Promise<void> {
  await api.post(`/leave/requests/${id}/reject`);
}

export async function approveTimesheet(id: string): Promise<void> {
  await api.post(`/timesheets/${id}/approve`);
}

export async function approveExpense(id: string): Promise<void> {
  await api.post(`/expenses/${id}/approve`);
}

export async function rejectExpense(id: string): Promise<void> {
  await api.post(`/expenses/${id}/reject`);
}

export async function getEmployee(id: string): Promise<Employee> {
  const res = await api.get(`/employees/${id}`);
  return res.data;
}

export async function createEmployee(data: Partial<Employee>): Promise<Employee> {
  const res = await api.post('/employees', data);
  return res.data;
}

export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  const res = await api.patch(`/employees/${id}`, data);
  return res.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export async function getEmployeeContracts(employeeId: string): Promise<PaginatedResponse<Contract>> {
  const res = await api.get('/contracts', { params: { employee_id: employeeId, per_page: 50 } });
  return res.data;
}

export async function getEmployeeLeaves(employeeId: string): Promise<PaginatedResponse<LeaveRequest>> {
  const res = await api.get('/leave/requests', { params: { employee_id: employeeId, per_page: 50 } });
  return res.data;
}

export async function getEmployeeTimesheets(employeeId: string): Promise<PaginatedResponse<Timesheet>> {
  const res = await api.get('/timesheets', { params: { employee_id: employeeId, per_page: 50 } });
  return res.data;
}

export async function getEmployeePayslips(employeeId: string): Promise<PaginatedResponse<Payslip>> {
  const res = await api.get('/payslips', { params: { employee_id: employeeId, per_page: 50 } });
  return res.data;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  last_login_at?: string;
  created_at: string;
}

export async function getUsers(params?: {
  page?: number;
  per_page?: number;
  role?: string;
}): Promise<PaginatedResponse<User>> {
  const res = await api.get('/users', { params });
  return res.data;
}

export interface OrgSettings {
  company_name: string;
  timezone: string;
  currency: string;
  date_format: string;
  fiscal_year_start: string;
}

export async function getOrgSettings(): Promise<OrgSettings> {
  const res = await api.get('/settings/organization');
  return res.data;
}

export async function updateOrgSettings(data: Partial<OrgSettings>): Promise<OrgSettings> {
  const res = await api.patch('/settings/organization', data);
  return res.data;
}

export async function getDepartment(id: string): Promise<Department> {
  const res = await api.get(`/departments/${id}`);
  return res.data;
}

export async function createDepartment(data: Partial<Department>): Promise<Department> {
  const res = await api.post('/departments', data);
  return res.data;
}

export async function updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
  const res = await api.patch(`/departments/${id}`, data);
  return res.data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`);
}

export async function getDepartmentEmployees(
  departmentId: string,
  params?: { page?: number; per_page?: number },
): Promise<PaginatedResponse<Employee>> {
  const res = await api.get('/employees', { params: { ...params, department_id: departmentId } });
  return res.data;
}

export async function getPayrollRun(id: string): Promise<PayrollRun> {
  const res = await api.get(`/payroll/runs/${id}`);
  return res.data;
}

export async function getPayrollRunPayslips(
  runId: string,
  params?: { page?: number; per_page?: number },
): Promise<PaginatedResponse<Payslip>> {
  const res = await api.get('/payslips', { params: { ...params, payroll_run_id: runId } });
  return res.data;
}
