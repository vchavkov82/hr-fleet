import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import {
  TemplatePageLayout,
  type TemplatePageLabels,
} from '@/components/templates/template-page-layout'

const SLUG = 'termination-document'

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

export default async function TerminationDocumentPage({
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      }
    />
  )
}
