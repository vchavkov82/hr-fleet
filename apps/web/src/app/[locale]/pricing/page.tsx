import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/navigation'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from '@/lib/structured-data'
import { QuoteForm } from '@/components/ui/quote-form'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.pricing' })
  return enhancedMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    path: '/pricing',
  })
}

const ACTIVE_MODULES = ['coreHr'] as const
const COMING_SOON_MODULES = [
  'ats',
  'leave',
  'payroll',
  'performance',
  'onboarding',
] as const
const ALL_MODULE_KEYS = [
  ...ACTIVE_MODULES,
  ...COMING_SOON_MODULES,
] as const

const MODULE_ICONS: Record<string, React.ReactNode> = {
  coreHr: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  ),
  ats: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
      />
    </svg>
  ),
  leave: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  ),
  payroll: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
      />
    </svg>
  ),
  performance: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  ),
  onboarding: (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
      />
    </svg>
  ),
}

const FEATURE_ROWS = [
  'employeeProfiles',
  'orgChart',
  'documentStorage',
] as const

const FEATURE_MATRIX: Record<string, boolean[]> = {
  employeeProfiles: [true],
  orgChart: [true],
  documentStorage: [true],
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.pricing')

  const moduleNames = Object.fromEntries(
    ALL_MODULE_KEYS.map((k) => [k, t(`modules.${k}.name`)])
  )

  const quoteLabels = {
    title: t('quoteForm.title'),
    subtitle: t('quoteForm.subtitle'),
    name: t('quoteForm.name'),
    namePlaceholder: t('quoteForm.namePlaceholder'),
    email: t('quoteForm.email'),
    emailPlaceholder: t('quoteForm.emailPlaceholder'),
    company: t('quoteForm.company'),
    companyPlaceholder: t('quoteForm.companyPlaceholder'),
    employees: t('quoteForm.employees'),
    employeesPlaceholder: t('quoteForm.employeesPlaceholder'),
    employeeSizes: t.raw('quoteForm.employeeSizes') as string[],
    modules: t('quoteForm.modules'),
    moduleNames,
    message: t('quoteForm.message'),
    messagePlaceholder: t('quoteForm.messagePlaceholder'),
    submit: t('quoteForm.submit'),
    successTitle: t('quoteForm.successTitle'),
    successMessage: t('quoteForm.successMessage'),
    submitAnother: t('quoteForm.submitAnother'),
    required: t('quoteForm.required'),
    selectModule: t('quoteForm.selectModule'),
  }

  const faqItems = t.raw('faqItems') as Array<{ question: string; answer: string }>
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: t('heading'), url: `${BASE_URL}/${locale}/pricing` },
  ])

  return (
    <div>
      <script {...jsonLdScript(breadcrumbs)} />
      <script {...jsonLdScript(faqJsonLd(faqItems))} />
      {/* Hero */}
      <section className="bg-navy-deep text-white py-20">
        <div className="container-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-200 mb-6">
            {t('sectionLabel')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading mb-4">
            {t('heading')}
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            {t('subheading')}
          </p>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-primary-50/60 py-12">
        <div className="container-xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold font-heading text-navy sm:text-2xl">
              {t('saasBannerTitle')}
            </h2>
            <p className="mt-2 text-sm text-gray-700 sm:text-base">
              {t('saasBannerBody')}
            </p>
          </div>
          <Link
            href="/auth/sign-up"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {t('saasStartTrial')}
          </Link>
        </div>
      </section>

      {/* Module Cards */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-navy mb-3">
              {t('modulesHeading')}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {t('modulesSubheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active modules */}
            {ACTIVE_MODULES.map((key) => {
              const features = t.raw(
                `modules.${key}.features`
              ) as string[]
              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-5">
                    {MODULE_ICONS[key]}
                  </div>
                  <h3 className="text-lg font-bold font-heading text-navy mb-2">
                    {t(`modules.${key}.name`)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t(`modules.${key}.description`)}
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2"
                      >
                        <svg
                          className="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#quote"
                    className="block text-center w-full rounded-xl bg-primary text-white px-6 py-3 text-sm font-semibold hover:bg-primary-dark transition-colors duration-200"
                  >
                    {t('getQuote')}
                  </a>
                </div>
              )
            })}

            {/* Coming soon modules */}
            {COMING_SOON_MODULES.map((key) => {
              const features = t.raw(
                `modules.${key}.features`
              ) as string[]
              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col opacity-60 relative"
                >
                  <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    {t('comingSoon')}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-5">
                    {MODULE_ICONS[key]}
                  </div>
                  <h3 className="text-lg font-bold font-heading text-navy mb-2">
                    {t(`modules.${key}.name`)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t(`modules.${key}.description`)}
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Checklist (available features only) */}
      <section className="py-20 bg-surface-lighter">
        <div className="container-xl max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-navy mb-3">
              {t('comparisonHeading')}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {t('comparisonSubheading')}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {FEATURE_ROWS.map((row, idx) => (
              <div
                key={row}
                className={`flex items-center gap-3 px-6 py-4 ${idx !== FEATURE_ROWS.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                {FEATURE_MATRIX[row][0] ? (
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="w-5 h-5 text-gray-300 flex-shrink-0 text-center">
                    &mdash;
                  </span>
                )}
                <span className="text-sm text-gray-700">
                  {t(`comparison.${row}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote" className="py-20 bg-white scroll-mt-20">
        <div className="container-xl max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-heading text-navy mb-3">
              {quoteLabels.title}
            </h2>
            <p className="text-gray-600">{quoteLabels.subtitle}</p>
          </div>
          <QuoteForm labels={quoteLabels} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface-lighter">
        <div className="container-xl max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-navy mb-3">
              {t('faqHeading')}
            </h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-semibold text-navy hover:bg-gray-50 transition list-none [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
