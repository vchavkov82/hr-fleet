import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'

export default async function DashboardBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dashboard.billing')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-heading text-navy">{t('title')}</h1>
      <p className="mt-4 text-gray-600">{t('intro')}</p>
      <p className="mt-4 text-sm text-gray-600 font-mono bg-gray-100 rounded-lg px-4 py-3">{t('apiHint')}</p>
      <p className="mt-4 text-sm text-gray-500">{t('envHint')}</p>
    </div>
  )
}
