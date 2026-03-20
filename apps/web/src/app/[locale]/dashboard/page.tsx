import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { routing } from '@/i18n/routing'
import { fetchEmployees } from '@/lib/api'
import { DashboardMetricCards } from '@/components/dashboard/dashboard-metric-cards'
import DepartmentChart from '@/components/dashboard/department-chart'
import EmployeeGrowthChart from '@/components/dashboard/employee-growth-chart'
import ActivityFeed from '@/components/dashboard/activity-feed'
import QuickActions from '@/components/dashboard/quick-actions'
import UpcomingEvents from '@/components/dashboard/upcoming-events'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'dashboard.overview' })

  // Fetch employee count from API (graceful fallback to placeholder)
  let totalEmployees: number | string = '--'
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (token) {
      const res = await fetchEmployees(token, { perPage: 1 })
      totalEmployees = res.pagination?.total ?? res.data.length
    }
  } catch {
    // API unavailable -- show placeholder
    totalEmployees = '--'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('lastUpdated')}
        </div>
      </div>

      <DashboardMetricCards
        totalEmployees={totalEmployees}
        labels={{
          totalEmployees: t('totalEmployees'),
          pendingLeave: t('pendingLeave'),
          recentHires: t('recentHires'),
          openPositions: t('openPositions'),
          vsLastMonth: t('vsLastMonth'),
        }}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmployeeGrowthChart title={t('employeeGrowth')} />
        </div>
        <DepartmentChart title={t('departmentDistribution')} />
      </div>

      {/* Bottom row: Activity + Quick Actions + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityFeed title={t('recentActivity')} />
        <QuickActions title={t('quickActions')} />
        <UpcomingEvents title={t('upcomingEvents')} />
      </div>
    </div>
  )
}
