export interface Employee {
  id: number
  name: string
  workEmail: string
  jobTitle: string
  department: { id: number; name: string }
  job: { id: number; name: string }
  manager: { id: number; name: string } | null
  workPhone: string
  employeeType: string
  active: boolean
  createDate: string
  writeDate: string
}

export interface EmployeeCreateInput {
  name: string
  workEmail: string
  jobTitle: string
  departmentId: number
  employeeType: string
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
