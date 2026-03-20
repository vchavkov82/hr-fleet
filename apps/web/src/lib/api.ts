import type { Employee, EmployeeCreateInput, EmployeeListResponse } from './types/employee'
import { apiBaseUrl } from './api-base'

/**
 * API base URL:
 * - In browser: use NEXT_PUBLIC_API_URL (or relative empty string when same-origin via proxy)
 * - In SSR: NEXT_PUBLIC_API_URL or direct backend on localhost:5080
 */
function serverApiBase(): string {
  const fromEnv = apiBaseUrl()
  if (fromEnv !== '') return fromEnv
  return 'http://localhost:5080'
}

const API_BASE =
  typeof window !== 'undefined' ? apiBaseUrl() : serverApiBase()

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error')
    throw new ApiError(res.status, body)
  }

  return res.json()
}

export async function fetchEmployees(
  token: string,
  params?: { page?: number; perPage?: number; search?: string; department?: string },
): Promise<EmployeeListResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('per_page', String(params.perPage))
  if (params?.search) query.set('search', params.search)
  if (params?.department) query.set('department', params.department)
  const qs = query.toString()
  return apiFetch<EmployeeListResponse>(
    `/api/v1/employees${qs ? `?${qs}` : ''}`,
    token,
  )
}

export async function fetchEmployee(
  token: string,
  id: number,
): Promise<Employee> {
  return apiFetch<Employee>(`/api/v1/employees/${id}`, token)
}

export async function createEmployee(
  token: string,
  data: EmployeeCreateInput,
): Promise<Employee> {
  return apiFetch<Employee>('/api/v1/employees', token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateEmployee(
  token: string,
  id: number,
  data: Partial<EmployeeCreateInput>,
): Promise<Employee> {
  return apiFetch<Employee>(`/api/v1/employees/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
