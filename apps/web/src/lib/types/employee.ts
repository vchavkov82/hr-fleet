/** Maps to Odoo hr.employee record fields. */
export interface Employee {
  id: number
  name: string
  workEmail: string
  jobTitle: string
  department: { id: number; name: string }
  job: { id: number; name: string }
  manager: { id: number; name: string } | null
  workPhone: string
  mobilePhone: string
  employeeType: OdooEmployeeType
  active: boolean
  createDate: string
  writeDate: string
}

/** Odoo employee_type selection values. */
export type OdooEmployeeType = 'employee' | 'student' | 'trainee' | 'contractor' | 'freelance'

export interface EmployeeCreateInput {
  name: string
  workEmail: string
  jobTitle: string
  departmentId: number
  employeeType: OdooEmployeeType
}

export interface EmployeeListResponse {
  data: Employee[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
  stale?: boolean
}
