import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { TemplatePageLayout } from '@/components/templates/template-page-layout'

const SLUG = 'employment-contract'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.hrTools.templates' })
  const templates = t.raw('list') as Array<{ name: string; slug: string; description: string }>
  const template = templates.find((t) => t.slug === SLUG)
  return {
    title: `${template?.name} | HR`,
    description: template?.description,
  }
}

export default async function EmploymentContractPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.hrTools.templates')
  const allTemplates = t.raw('list') as Array<{
    name: string
    slug: string
    description: string
    whatsIncluded: string[]
    howToUse: string[]
    seoContent: string
  }>
  const template = allTemplates.find((t) => t.slug === SLUG)!
  const labels = {
    downloadCard: t.raw('downloadCard') as any,
    emailGate: t.raw('emailGate') as any,
    relatedTitle: t('relatedTitle'),
  }

  return (
    <TemplatePageLayout
      template={template}
      allTemplates={allTemplates}
      labels={labels}
      icon={
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
    />
  )
}
