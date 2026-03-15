import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data'
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
  const t = await getTranslations({ locale, namespace: 'pages.careers' })
  return enhancedMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    path: '/careers',
  })
}

const CULTURE_ITEMS = [
  { key: 'remote', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'learning', iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { key: 'health', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { key: 'retreats', iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
] as const

const POSITIONS = ['seniorEngineer', 'productDesigner', 'hrSpecialist', 'marketingManager', 'qaEngineer'] as const

const BENEFIT_CATEGORIES = [
  { key: 'health', items: ['private', 'dental', 'vision', 'wellness'] },
  { key: 'workLife', items: ['remote', 'flexible', 'vacation', 'parental'] },
  { key: 'financial', items: ['competitive', 'equity', 'bonus', 'retirement'] },
  { key: 'development', items: ['budget', 'conferences', 'courses', 'mentorship'] },
] as const

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.careers')

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: t('hero.heading'), url: `${BASE_URL}/${locale}/careers` },
  ])

  return (
    <div className="min-h-screen bg-white">
      <script {...jsonLdScript(breadcrumbs)} />
      {/* Hero Section */}
      <section className="bg-navy-deep text-white py-20">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {t('hero.heading')}
            </h1>
            <p className="text-xl text-blue-200 leading-relaxed mb-8">
              {t('hero.subheading')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#open-positions" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                {t('hero.primaryButton')}
              </a>
              <a href="#culture" className="inline-flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy transition-colors">
                {t('hero.secondaryButton')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <SectionReveal>
        <section id="culture" className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('culture.heading')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('culture.subheading')}
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {CULTURE_ITEMS.map(({ key, iconPath }) => (
                  <div key={key} className="text-center p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t(`culture.values.${key}.title`)}</h3>
                    <p className="text-gray-600 text-sm">{t(`culture.values.${key}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Open Positions Section */}
      <SectionReveal>
        <section id="open-positions" className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('positions.heading')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('positions.subheading')}
              </p>

              <div className="space-y-4">
                {POSITIONS.map((posKey) => (
                  <div key={posKey} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t(`positions.items.${posKey}.title`)}</h3>
                        <p className="text-gray-600 text-sm mb-3">{t(`positions.items.${posKey}.description`)}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{t(`positions.items.${posKey}.department`)}</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{t(`positions.items.${posKey}.location`)}</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{t(`positions.items.${posKey}.type`)}</span>
                        </div>
                      </div>
                      <a href={`mailto:careers@hr.bg?subject=Application: ${posKey}`} className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
                        {t('positions.applyButton')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">{t('positions.noMatch')}</p>
                <a href="mailto:careers@hr.bg" className="inline-flex items-center px-6 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
                  {t('positions.spontaneousButton')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Benefits Section */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('benefits.heading')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('benefits.subheading')}
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {BENEFIT_CATEGORIES.map(({ key, items }) => (
                  <div key={key} className="bg-white p-8 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">{t(`benefits.${key}.title`)}</h3>
                    <ul className="space-y-3 text-gray-600">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t(`benefits.${key}.items.${item}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Hiring Process Section */}
      <SectionReveal>
        <section className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('process.heading')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('process.subheading')}
              </p>

              <div className="grid md:grid-cols-4 gap-8">
                {(['apply', 'screening', 'interviews', 'offer'] as const).map((step, i) => (
                  <div key={step} className="text-center">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold mb-2">{t(`process.steps.${step}.title`)}</h3>
                    <p className="text-sm text-gray-600">{t(`process.steps.${step}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* CTA Section */}
      <SectionReveal>
        <section className="py-20 bg-primary text-white">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-heading mb-6">
                {t('cta.heading')}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {t('cta.subheading')}
              </p>
              <a href="mailto:careers@hr.bg" className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                {t('cta.button')}
              </a>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
