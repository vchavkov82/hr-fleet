import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Mock next-intl (already in setup.ts but we need specific behavior for dashboard)
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

// Mock @/navigation
vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
  usePathname: () => '/dashboard',
}))

import EmployeeTable from '@/components/dashboard/employee-table'
import EmployeeForm from '@/components/dashboard/employee-form'
import MetricCard from '@/components/dashboard/metric-card'
import type { Employee } from '@/lib/types/employee'

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: 'Ivan Petrov',
    workEmail: 'ivan@example.com',
    jobTitle: 'Developer',
    department: { id: 1, name: 'Engineering' },
    job: { id: 1, name: 'Dev' },
    manager: null,
    workPhone: '+359 88 123',
    employeeType: 'employee',
    active: true,
    createDate: '2024-03-15',
    writeDate: '2024-03-15',
  },
  {
    id: 2,
    name: 'Maria Ivanova',
    workEmail: 'maria@example.com',
    jobTitle: 'Manager',
    department: { id: 2, name: 'Marketing' },
    job: { id: 2, name: 'Mgr' },
    manager: null,
    workPhone: '+359 88 234',
    employeeType: 'contractor',
    active: false,
    createDate: '2023-11-01',
    writeDate: '2024-01-10',
  },
]

describe('EmployeeTable', () => {
  it('renders table headers', () => {
    render(<EmployeeTable data={MOCK_EMPLOYEES} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('department')).toBeInTheDocument()
    expect(screen.getByText('position')).toBeInTheDocument()
    expect(screen.getByText('startDate')).toBeInTheDocument()
    expect(screen.getByText('status')).toBeInTheDocument()
  })

  it('renders employee rows', () => {
    render(<EmployeeTable data={MOCK_EMPLOYEES} />)
    expect(screen.getByText('Ivan Petrov')).toBeInTheDocument()
    expect(screen.getByText('Maria Ivanova')).toBeInTheDocument()
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument()
  })

  it('shows empty state when data is empty', () => {
    render(<EmployeeTable data={[]} />)
    expect(screen.getByText('noResults')).toBeInTheDocument()
  })
})

describe('EmployeeForm', () => {
  it('renders all form fields', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    expect(screen.getByLabelText('form.name')).toBeInTheDocument()
    expect(screen.getByLabelText('form.email')).toBeInTheDocument()
    expect(screen.getByLabelText('form.jobTitle')).toBeInTheDocument()
    expect(screen.getByLabelText('form.department')).toBeInTheDocument()
    expect(screen.getByLabelText('form.employeeType')).toBeInTheDocument()
  })

  it('calls onSubmit with form data when submitted with valid input', async () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    fireEvent.change(screen.getByLabelText('form.name'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('form.email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('form.jobTitle'), { target: { value: 'Engineer' } })
    fireEvent.change(screen.getByLabelText('form.department'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('form.employeeType'), { target: { value: 'employee' } })

    fireEvent.click(screen.getByText('form.save'))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test User',
      workEmail: 'test@example.com',
      jobTitle: 'Engineer',
      departmentId: 1,
      employeeType: 'employee',
    })
  })
})

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(
      <MetricCard
        title="Total Employees"
        value={42}
        icon={<span data-testid="icon">IC</span>}
      />,
    )
    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders trend when provided', () => {
    render(
      <MetricCard
        title="Hires"
        value={7}
        icon={<span>IC</span>}
        trend={{ value: 12, label: 'vs last month' }}
      />,
    )
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })
})
