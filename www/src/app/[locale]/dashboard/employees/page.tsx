import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { routing } from '@/i18n/routing'
import EmployeeDirectoryClient from './employee-directory-client'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'dashboard.employees' })
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>
      <EmployeeDirectoryClient token={token} />
    </div>
  )
}
