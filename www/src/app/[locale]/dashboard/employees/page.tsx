import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import EmployeeTable from '@/components/dashboard/employee-table'
import type { Employee } from '@/lib/types/employee'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1, name: 'Ivan Petrov', workEmail: 'ivan@company.bg', jobTitle: 'Senior Developer',
    department: { id: 1, name: 'Engineering' }, job: { id: 1, name: 'Developer' },
    manager: null, workPhone: '+359 88 123 4567', employeeType: 'employee',
    active: true, createDate: '2024-03-15', writeDate: '2024-03-15',
  },
  {
    id: 2, name: 'Maria Ivanova', workEmail: 'maria@company.bg', jobTitle: 'Marketing Manager',
    department: { id: 2, name: 'Marketing' }, job: { id: 2, name: 'Manager' },
    manager: null, workPhone: '+359 88 234 5678', employeeType: 'employee',
    active: true, createDate: '2023-11-01', writeDate: '2024-01-10',
  },
  {
    id: 3, name: 'Georgi Dimitrov', workEmail: 'georgi@company.bg', jobTitle: 'Sales Rep',
    department: { id: 3, name: 'Sales' }, job: { id: 3, name: 'Sales' },
    manager: null, workPhone: '+359 88 345 6789', employeeType: 'employee',
    active: true, createDate: '2024-06-01', writeDate: '2024-06-01',
  },
  {
    id: 4, name: 'Elena Todorova', workEmail: 'elena@company.bg', jobTitle: 'HR Specialist',
    department: { id: 4, name: 'HR' }, job: { id: 4, name: 'HR' },
    manager: null, workPhone: '+359 88 456 7890', employeeType: 'employee',
    active: true, createDate: '2024-01-15', writeDate: '2024-01-15',
  },
  {
    id: 5, name: 'Nikolay Stoyanov', workEmail: 'nikolay@company.bg', jobTitle: 'QA Engineer',
    department: { id: 1, name: 'Engineering' }, job: { id: 5, name: 'QA' },
    manager: { id: 1, name: 'Ivan Petrov' }, workPhone: '+359 88 567 8901', employeeType: 'contractor',
    active: true, createDate: '2025-01-10', writeDate: '2025-01-10',
  },
  {
    id: 6, name: 'Dessislava Koleva', workEmail: 'desi@company.bg', jobTitle: 'Finance Analyst',
    department: { id: 5, name: 'Finance' }, job: { id: 6, name: 'Analyst' },
    manager: null, workPhone: '+359 88 678 9012', employeeType: 'employee',
    active: false, createDate: '2023-05-20', writeDate: '2025-12-31',
  },
  {
    id: 7, name: 'Petar Angelov', workEmail: 'petar@company.bg', jobTitle: 'DevOps Engineer',
    department: { id: 1, name: 'Engineering' }, job: { id: 7, name: 'DevOps' },
    manager: { id: 1, name: 'Ivan Petrov' }, workPhone: '+359 88 789 0123', employeeType: 'employee',
    active: true, createDate: '2024-09-01', writeDate: '2024-09-01',
  },
]

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'dashboard.employees' })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>
      <EmployeeTable data={MOCK_EMPLOYEES} />
    </div>
  )
}
