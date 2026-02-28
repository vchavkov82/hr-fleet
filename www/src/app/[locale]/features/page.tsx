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

const FEATURE_SECTIONS = [
  { id: 'ats', key: 'ats', reversed: false },
  { id: 'employees', key: 'employees', reversed: true },
  { id: 'leave', key: 'leave', reversed: false },
  { id: 'payroll', key: 'payroll', reversed: true },
  { id: 'performance', key: 'performance', reversed: false },
  { id: 'onboarding', key: 'onboarding', reversed: true },
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

      {/* Feature rows */}
      {FEATURE_SECTIONS.map((section, index) => {
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

      {/* Closing CTA */}
      <CTA />
    </div>
  )
}
