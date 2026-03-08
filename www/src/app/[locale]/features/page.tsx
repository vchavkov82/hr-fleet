import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import CTA from '@/components/sections/cta'
import { FeatureRow } from '@/components/sections/feature-row'
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
  const t = await getTranslations({ locale, namespace: 'pages.features' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

const ACTIVE_FEATURES = [
  { id: 'employees', key: 'employees', reversed: false },
  { id: 'calculators', key: 'calculators', reversed: true },
  { id: 'compliance', key: 'compliance', reversed: false },
] as const

const ROADMAP_FEATURES = [
  { id: 'ats', key: 'ats' },
  { id: 'leave', key: 'leave' },
  { id: 'payroll', key: 'payroll' },
  { id: 'performance', key: 'performance' },
  { id: 'onboarding', key: 'onboarding' },
] as const

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.features')

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-deep text-white py-20">
        <div className="container-xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
            {t('hero.heading')}
          </h1>
          <p className="mt-6 text-xl text-blue-200 max-w-3xl mx-auto">
            {t('hero.subheading')}
          </p>
        </div>
      </section>

      {/* Active feature rows */}
      {ACTIVE_FEATURES.map((section, index) => {
        const features = t.raw(`sections.${section.key}.features`) as string[]
        const isEven = index % 2 === 1

        return (
          <section
            key={section.id}
            className={`py-20 ${isEven ? 'bg-surface-lighter' : 'bg-white'}`}
          >
            <div className="container-xl">
              <SectionReveal>
                <FeatureRow
                  id={section.id}
                  title={t(`sections.${section.key}.title`)}
                  description={t(`sections.${section.key}.description`)}
                  features={features}
                  imagePlaceholder={t(`sections.${section.key}.imagePlaceholder`)}
                  reversed={section.reversed}
                />
              </SectionReveal>
            </div>
          </section>
        )
      })}

      {/* Roadmap section */}
      <section className="py-20 bg-surface-lighter">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-navy mb-3">
              {t('roadmap.heading')}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {t('roadmap.subheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROADMAP_FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold font-heading text-navy">
                    {t(`sections.${feature.key}.title`)}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 flex-shrink-0 ml-2">
                    {t('roadmap.comingSoon')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {t(`sections.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <CTA />
    </div>
  )
}
