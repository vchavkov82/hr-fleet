import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { TemplatePageLayout } from '@/components/templates/template-page-layout'

const SLUG = 'onboarding-checklist'

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

export default async function OnboardingChecklistPage({
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      }
    />
  )
}
