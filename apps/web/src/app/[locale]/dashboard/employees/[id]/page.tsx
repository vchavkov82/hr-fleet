'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import EmployeeForm from '@/components/dashboard/employee-form'
import { fetchEmployee, updateEmployee, createEmployee, ApiError } from '@/lib/api'
import type { Employee, EmployeeCreateInput, OdooEmployeeType } from '@/lib/types/employee'
import { useParams } from 'next/navigation'

function getAuthToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/)
  return match?.[1] ?? ''
}

export default function EmployeeDetailPage() {
  const t = useTranslations('dashboard.employees')
  const router = useRouter()
  const params = useParams()
  const idParam = params?.id as string

  const isNew = idParam === 'new'
  const employeeId = isNew ? 0 : Number(idParam)

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(isNew)

  const loadEmployee = useCallback(async () => {
    if (isNew) return
    const token = getAuthToken()
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const emp = await fetchEmployee(token, employeeId)
      setEmployee(emp)
    } catch (err) {
      setError(err instanceof ApiError ? `${err.status}: ${err.message}` : 'Failed to load employee')
    } finally {
      setLoading(false)
    }
  }, [isNew, employeeId])

  useEffect(() => {
    loadEmployee()
  }, [loadEmployee])

  async function handleSubmit(data: EmployeeCreateInput) {
    const token = getAuthToken()
    if (isNew) {
      await createEmployee(token, data)
      router.push('/dashboard/employees')
    } else {
      await updateEmployee(token, employeeId, data)
      setEditing(false)
      loadEmployee()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse w-48" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700 mb-3">{error}</p>
        <button
          onClick={loadEmployee}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isNew || editing) {
    return (
      <div>
        <Link href="/dashboard/employees" className="text-blue-700 hover:text-blue-900 text-sm mb-4 inline-block">
          &larr; {t('title')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isNew ? t('addNew') : employee?.name}
        </h1>
        <EmployeeForm
          employee={isNew ? undefined : (employee ?? undefined)}
          onSubmit={handleSubmit}
          onCancel={() => isNew ? router.push('/dashboard/employees') : setEditing(false)}
        />
      </div>
    )
  }

  if (!employee) return null

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
          {employee.mobilePhone && <Row label="Mobile" value={employee.mobilePhone} />}
          {employee.manager && <Row label="Manager" value={employee.manager.name} />}
          <Row label={t('status')} value={employee.active ? t('active') : t('inactive')} />
          <Row
            label="Type"
            value={t(`types.${employee.employeeType as OdooEmployeeType}`)}
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
