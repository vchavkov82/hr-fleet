'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import EmployeeForm from '@/components/dashboard/employee-form'
import type { Employee, EmployeeCreateInput } from '@/lib/types/employee'

// Mock data -- will be replaced by API call in Plan 05
const MOCK_EMPLOYEE: Employee = {
  id: 1,
  name: 'Ivan Petrov',
  workEmail: 'ivan@company.bg',
  jobTitle: 'Senior Developer',
  department: { id: 1, name: 'Engineering' },
  job: { id: 1, name: 'Developer' },
  manager: null,
  workPhone: '+359 88 123 4567',
  employeeType: 'employee',
  active: true,
  createDate: '2024-03-15',
  writeDate: '2024-03-15',
}

export default function EmployeeDetailPage() {
  const t = useTranslations('dashboard.employees')
  const [editing, setEditing] = useState(false)
  const employee = MOCK_EMPLOYEE

  function handleSubmit(data: EmployeeCreateInput) {
    // Will call updateEmployee API in Plan 05
    console.log('Update employee:', data)
    setEditing(false)
  }

  if (editing) {
    return (
      <div>
        <Link href="/dashboard/employees" className="text-blue-700 hover:text-blue-900 text-sm mb-4 inline-block">
          &larr; {t('title')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{employee.name}</h1>
        <EmployeeForm
          employee={employee}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div>
      <Link href="/dashboard/employees" className="text-blue-700 hover:text-blue-900 text-sm mb-4 inline-block">
        &larr; {t('title')}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <dl className="divide-y divide-gray-200">
          <Row label={t('email')} value={employee.workEmail} />
          <Row label={t('department')} value={employee.department.name} />
          <Row label={t('position')} value={employee.jobTitle} />
          <Row label="Phone" value={employee.workPhone} />
          <Row label={t('status')} value={employee.active ? t('active') : t('inactive')} />
          <Row
            label="Type"
            value={t(`types.${employee.employeeType as 'employee' | 'contractor' | 'trainee'}`)}
          />
          <Row label={t('startDate')} value={new Date(employee.createDate).toLocaleDateString()} />
        </dl>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{value}</dd>
    </div>
  )
}
