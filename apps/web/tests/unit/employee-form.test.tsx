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

import EmployeeForm from '@/components/dashboard/employee-form'
import type { Employee } from '@/lib/types/employee'

const MOCK_EMPLOYEE: Employee = {
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
}

describe('EmployeeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('shows validation error when name is empty', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    // Set email and department to valid values, leave name empty
    fireEvent.change(screen.getByLabelText('form.email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('form.department'), { target: { value: '1' } })

    // Use form submit to bypass HTML5 required validation
    const form = screen.getByLabelText('form.email').closest('form')!
    fireEvent.submit(form)

    expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error when email is empty', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    fireEvent.change(screen.getByLabelText('form.name'), { target: { value: 'Test User' } })
    // Leave email empty -- our validate() checks regex before HTML5 required
    fireEvent.change(screen.getByLabelText('form.department'), { target: { value: '1' } })

    // Simulate form submit via the form element to bypass HTML5 validation
    const form = screen.getByLabelText('form.name').closest('form')!
    fireEvent.submit(form)

    expect(screen.getByText('Valid email required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with form data when valid', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    fireEvent.change(screen.getByLabelText('form.name'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('form.email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('form.jobTitle'), { target: { value: 'Engineer' } })
    fireEvent.change(screen.getByLabelText('form.department'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('form.employeeType'), { target: { value: 'contractor' } })

    fireEvent.click(screen.getByText('form.save'))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test User',
      workEmail: 'test@example.com',
      jobTitle: 'Engineer',
      departmentId: 1,
      employeeType: 'contractor',
    })
  })

  it('shows loading state during submission', async () => {
    // onSubmit returns a never-resolving promise to keep submitting=true
    const onSubmit = vi.fn((): Promise<void> => new Promise(() => {}))
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    fireEvent.change(screen.getByLabelText('form.name'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('form.email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('form.department'), { target: { value: '1' } })

    const form = screen.getByLabelText('form.name').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('...')).toBeInTheDocument()
    })
  })

  it('pre-fills fields in edit mode', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<EmployeeForm employee={MOCK_EMPLOYEE} onSubmit={onSubmit} onCancel={onCancel} />)

    expect(screen.getByLabelText('form.name')).toHaveValue('Ivan Petrov')
    expect(screen.getByLabelText('form.email')).toHaveValue('ivan@example.com')
    expect(screen.getByLabelText('form.jobTitle')).toHaveValue('Developer')
    expect(screen.getByLabelText('form.department')).toHaveValue('5')
    expect(screen.getByLabelText('form.employeeType')).toHaveValue('employee')
  })

  it('shows error message on submission failure', async () => {
    const onSubmit = vi.fn(() => Promise.reject(new Error('API failure')))
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    fireEvent.change(screen.getByLabelText('form.name'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('form.email'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('form.department'), { target: { value: '1' } })

    const form = screen.getByLabelText('form.name').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('submit-error')).toBeInTheDocument()
      expect(screen.getByText('API failure')).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button clicked', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />)

    fireEvent.click(screen.getByText('form.cancel'))
    expect(onCancel).toHaveBeenCalled()
  })
})
