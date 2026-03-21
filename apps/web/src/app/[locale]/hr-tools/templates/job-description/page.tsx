import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import {
  TemplatePageLayout,
  type TemplatePageLabels,
} from '@/components/templates/template-page-layout'

const SLUG = 'job-description'

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

export default async function JobDescriptionPage({
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
  const labels: TemplatePageLabels = {
    downloadCard: t.raw('downloadCard') as TemplatePageLabels['downloadCard'],
    emailGate: t.raw('emailGate') as TemplatePageLabels['emailGate'],
    relatedTitle: t('relatedTitle'),
  }

  return (
    <TemplatePageLayout
      template={template}
      allTemplates={allTemplates}
      labels={labels}
      icon={
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      }
    />
  )
}
