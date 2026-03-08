import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Mock @/navigation
vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
  usePathname: () => '/dashboard/employees',
}))

// Mock the API module
const mockFetchEmployees = vi.fn()
vi.mock('@/lib/api', () => ({
  fetchEmployees: (...args: unknown[]) => mockFetchEmployees(...args),
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
      this.name = 'ApiError'
    }
  },
}))

import EmployeeTable from '@/components/dashboard/employee-table'
import type { Employee } from '@/lib/types/employee'

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: 'Ivan Petrov',
    workEmail: 'ivan@example.com',
    jobTitle: 'Developer',
    department: { id: 5, name: 'Research & Development' },
    job: { id: 1, name: 'Developer' },
    manager: null,
    workPhone: '+359 88 123',
    mobilePhone: '+359 89 123',
    employeeType: 'employee',
    active: true,
    createDate: '2024-03-15',
    writeDate: '2024-03-15',
  },
  {
    id: 2,
    name: 'Maria Ivanova',
    workEmail: 'maria@example.com',
    jobTitle: 'Marketing Manager',
    department: { id: 8, name: 'Marketing' },
    job: { id: 2, name: 'Manager' },
    manager: null,
    workPhone: '+359 88 234',
    mobilePhone: '',
    employeeType: 'contractor',
    active: false,
    createDate: '2023-11-01',
    writeDate: '2024-01-10',
  },
  {
    id: 3,
    name: 'Georgi Dimitrov',
    workEmail: 'georgi@example.com',
    jobTitle: 'Sales Rep',
    department: { id: 3, name: 'Sales' },
    job: { id: 3, name: 'Salesperson' },
    manager: null,
    workPhone: '+359 88 345',
    mobilePhone: '',
    employeeType: 'employee',
    active: true,
    createDate: '2024-06-01',
    writeDate: '2024-06-01',
  },
]

describe('EmployeeTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table with employee data', () => {
    render(<EmployeeTable data={MOCK_EMPLOYEES} />)
    expect(screen.getByText('Ivan Petrov')).toBeInTheDocument()
    expect(screen.getByText('Maria Ivanova')).toBeInTheDocument()
    expect(screen.getByText('Georgi Dimitrov')).toBeInTheDocument()
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<EmployeeTable data={MOCK_EMPLOYEES} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('department')).toBeInTheDocument()
    expect(screen.getByText('position')).toBeInTheDocument()
    expect(screen.getByText('startDate')).toBeInTheDocument()
    expect(screen.getByText('status')).toBeInTheDocument()
  })

  it('sorts by name column when header clicked', () => {
    render(<EmployeeTable data={MOCK_EMPLOYEES} />)
    const nameHeader = screen.getByText('name')
    // Click to sort ascending
    fireEvent.click(nameHeader)
    const rows = screen.getAllByRole('row')
    // First row is header, data rows follow -- sorted ascending by name
    const firstDataCell = rows[1].querySelectorAll('td')[0]
    expect(firstDataCell.textContent).toBe('Georgi Dimitrov')
  })

  it('filters by search text (client-side, no token)', () => {
    render(<EmployeeTable data={MOCK_EMPLOYEES} />)
    const searchInput = screen.getByPlaceholderText('search')
    fireEvent.change(searchInput, { target: { value: 'Ivan' } })
    expect(screen.getByText('Ivan Petrov')).toBeInTheDocument()
    expect(screen.queryByText('Georgi Dimitrov')).not.toBeInTheDocument()
  })

  it('shows empty state when no employees', () => {
    render(<EmployeeTable data={[]} />)
    expect(screen.getByText('noResults')).toBeInTheDocument()
  })

  it('shows loading skeleton while fetching', () => {
    render(<EmployeeTable data={[]} loading />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('pagination controls display correct page info', () => {
    // Create 25 employees to trigger pagination (pageSize=20)
    const manyEmployees: Employee[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Employee ${String(i + 1).padStart(2, '0')}`,
      workEmail: `emp${i + 1}@example.com`,
      jobTitle: 'Worker',
      department: { id: 1, name: 'Administration' },
      job: { id: 1, name: 'Worker' },
      manager: null,
      workPhone: '',
      mobilePhone: '',
      employeeType: 'employee' as const,
      active: true,
      createDate: '2024-01-01',
      writeDate: '2024-01-01',
    }))
    render(<EmployeeTable data={manyEmployees} />)
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument()
  })

  it('fetches from API when token is provided', async () => {
    mockFetchEmployees.mockResolvedValue({
      data: MOCK_EMPLOYEES,
      pagination: { page: 1, perPage: 20, total: 3, totalPages: 1 },
    })

    render(<EmployeeTable token="test-token" />)

    await waitFor(() => {
      expect(mockFetchEmployees).toHaveBeenCalledWith('test-token', expect.objectContaining({}))
    })

    await waitFor(() => {
      expect(screen.getByText('Ivan Petrov')).toBeInTheDocument()
    })
  })

  it('shows error state when API call fails', async () => {
    mockFetchEmployees.mockRejectedValue(new Error('Network error'))

    render(<EmployeeTable token="test-token" />)

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })
    expect(screen.getByText('Failed to load employees')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})
