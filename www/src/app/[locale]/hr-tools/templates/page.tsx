import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { SectionReveal } from '@/components/ui/section-reveal'

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
  return { title: t('metaTitle'), description: t('metaDescription') }
}

const TEMPLATE_ICONS = [
  // Employment Contract
  <svg key="contract" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  // Job Description
  <svg key="jd" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  // Leave Policy
  <svg key="leave" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  // Onboarding Checklist
  <svg key="onboarding" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  // Performance Review
  <svg key="performance" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  // Termination Document
  <svg key="termination" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
]

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.hrTools.templates')
  const templates = t.raw('list') as Array<{
    name: string
    description: string
    slug: string
  }>

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-deep py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-4xl font-bold font-heading text-white sm:text-5xl">
            {t('heading')}
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            {t('subheading')}
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, i) => (
              <SectionReveal key={template.slug} delay={i * 0.08}>
                <Link
                  href={`/hr-tools/templates/${template.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 bg-white h-full"
                >
                  <div className="flex items-start justify-between">
                    {TEMPLATE_ICONS[i]}
                    <span className="text-xs font-semibold bg-primary-50 text-primary px-3 py-1 rounded-full">
                      PDF
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold font-heading text-navy group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                    {t('downloadFree')}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-surface-light">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <SectionReveal>
            <h2 className="text-2xl font-bold font-heading text-navy sm:text-3xl">
              {t('ctaHeading')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              {t('ctaDescription')}
            </p>
            <Link href="/auth/sign-up" className="btn-primary mt-6 inline-flex">
              {t('ctaButton')}
            </Link>
          </SectionReveal>
        </div>
      </section>
    </div>
  )
}
