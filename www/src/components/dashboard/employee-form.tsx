'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import type { Employee, EmployeeCreateInput } from '@/lib/types/employee'

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (data: EmployeeCreateInput) => void | Promise<void>
  onCancel: () => void
}

const DEPARTMENTS = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Marketing' },
  { id: 3, name: 'Sales' },
  { id: 4, name: 'HR' },
  { id: 5, name: 'Finance' },
  { id: 6, name: 'Operations' },
]

const EMPLOYEE_TYPES = ['employee', 'contractor', 'trainee'] as const

export default function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const t = useTranslations('dashboard.employees')

  const [name, setName] = useState(employee?.name ?? '')
  const [workEmail, setWorkEmail] = useState(employee?.workEmail ?? '')
  const [jobTitle, setJobTitle] = useState(employee?.jobTitle ?? '')
  const [departmentId, setDepartmentId] = useState(employee?.department.id ?? 0)
  const [employeeType, setEmployeeType] = useState(employee?.employeeType ?? 'employee')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name || name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!workEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) errs.workEmail = 'Valid email required'
    if (!departmentId) errs.departmentId = 'Department required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        workEmail: workEmail.trim(),
        jobTitle: jobTitle.trim(),
        departmentId,
        employeeType,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const errorClass = 'mt-1 text-xs text-red-600'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label htmlFor="emp-name" className={labelClass}>{t('form.name')}</label>
        <input
          id="emp-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="emp-email" className={labelClass}>{t('form.email')}</label>
        <input
          id="emp-email"
          type="email"
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          className={inputClass}
          required
        />
        {errors.workEmail && <p className={errorClass}>{errors.workEmail}</p>}
      </div>

      <div>
        <label htmlFor="emp-title" className={labelClass}>{t('form.jobTitle')}</label>
        <input
          id="emp-title"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="emp-dept" className={labelClass}>{t('form.department')}</label>
        <select
          id="emp-dept"
          value={departmentId}
          onChange={(e) => setDepartmentId(Number(e.target.value))}
          className={inputClass}
          required
        >
          <option value={0} disabled>--</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        {errors.departmentId && <p className={errorClass}>{errors.departmentId}</p>}
      </div>

      <div>
        <label htmlFor="emp-type" className={labelClass}>{t('form.employeeType')}</label>
        <select
          id="emp-type"
          value={employeeType}
          onChange={(e) => setEmployeeType(e.target.value)}
          className={inputClass}
        >
          {EMPLOYEE_TYPES.map((type) => (
            <option key={type} value={type}>{t(`types.${type}`)}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {submitting ? '...' : t('form.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {t('form.cancel')}
        </button>
      </div>
    </form>
  )
}
