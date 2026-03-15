import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/navigation'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data'

export const dynamic = 'force-static'
export const revalidate = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.hrTools' })
  return enhancedMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    path: '/hr-tools',
  })
}

const CALCULATORS = [
  {
    href: '/hr-tools/ai-assistant',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5h.01v.01H12v-.01z" />
      </svg>
    ),
    labelKey: 'calculatorCards.aiAssistant',
  },
  {
    href: '/hr-tools/salary-calculator',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    labelKey: 'calculatorCards.salary',
  },
  {
    href: '/hr-tools/leave-calculator',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    labelKey: 'calculatorCards.leave',
  },
  {
    href: '/hr-tools/employment-cost-calculator',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    labelKey: 'calculatorCards.employmentCost',
  },
  {
    href: '/hr-tools/freelancer-comparison',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    labelKey: 'calculatorCards.freelancerComparison',
  },
] as const

export default async function HrToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.hrTools')
  const tools = t.raw('tools') as Array<{
    title: string
    description: string
    badge: string
  }>

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: t('heroHeading'), url: `${BASE_URL}/${locale}/hr-tools` },
  ])

  return (
    <div>
      <script {...jsonLdScript(breadcrumbs)} />
      {/* Hero */}
      <section className="bg-navy-deep text-white py-16 sm:py-20">
        <div className="container-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
            {t('sectionLabel')}
          </span>
          <h1 className="mt-6 text-3xl font-bold font-heading sm:text-4xl lg:text-5xl">
            {t('heroHeading')}
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            {t('heroSubheading')}
          </p>
        </div>
      </section>

      {/* Calculators Section */}
      <section className="py-16 sm:py-20 bg-surface-light">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="section-label">{t('calculatorsLabel')}</span>
            <h2 className="mt-4 text-2xl font-bold font-heading text-navy sm:text-3xl">
              {t('calculatorsHeading')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              {t('calculatorsSubheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {CALCULATORS.map((calc) => {
              const title = t(`${calc.labelKey}.title`)
              const description = t(`${calc.labelKey}.description`)
              return (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="card p-6 group flex flex-col gap-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`${title}: ${description}`}
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 text-primary group-hover:bg-primary-100 transition-colors">
                    {calc.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-heading text-navy group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                    {t('tryItFree')}
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 sm:py-20">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="section-label">{t('templatesLabel')}</span>
            <h2 className="mt-4 text-2xl font-bold font-heading text-navy sm:text-3xl">
              {t('templatesHeading')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              {t('templatesSubheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <div key={i} className="card p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold bg-primary-50 text-primary px-3 py-1 rounded-full">
                    {tool.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-navy">
                    {tool.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                  {t('downloadFree')}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-surface-light">
        <div className="container-xl">
          <div className="rounded-2xl bg-cta-gradient p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl font-bold font-heading sm:text-3xl">
              {t('needHelp')}
            </h2>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">
              {t('needHelpDesc')}
            </p>
            <Link
              href="/auth/sign-up"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-gray-50"
            >
              {t('requestConsult')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
