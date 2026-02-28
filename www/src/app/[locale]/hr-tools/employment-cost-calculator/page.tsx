import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import EmploymentCostCalculator from '@/components/calculators/employment-cost-calculator'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'pages.hrTools.employmentCostCalculator',
  })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function EmploymentCostCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.hrTools.employmentCostCalculator')

  const labels: Record<string, string> = {
    grossSalary: t('grossSalary'),
    numberOfEmployees: t('numberOfEmployees'),
    bornAfter1960: t('bornAfter1960'),
    costPerEmployee: t('costPerEmployee'),
    perMonth: t('perMonth'),
    monthlyTeam: t('monthlyTeam'),
    employees: t('employees'),
    annualTeam: t('annualTeam'),
    perYear: t('perYear'),
    perEmployeeBreakdown: t('perEmployeeBreakdown'),
    pension: t('pension'),
    illnessMaternity: t('illnessMaternity'),
    unemployment: t('unemployment'),
    accident: t('accident'),
    health: t('health'),
    universalPension: t('universalPension'),
    totalEmployerContributions: t('totalEmployerContributions'),
    totalPerEmployee: t('totalPerEmployee'),
    disclaimer: t('disclaimer'),
  }

  return (
    <div className="py-16 sm:py-20">
      <div className="container-xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/hr-tools" className="hover:text-primary transition-colors">
            HR Tools
          </Link>
          <span className="mx-2">/</span>
          <span className="text-navy font-medium">{t('heading')}</span>
        </nav>

        {/* SEO content above calculator */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="section-label">{t('sectionLabel')}</span>
          <h1 className="mt-4 text-3xl font-bold font-heading text-navy sm:text-4xl lg:text-5xl">
            {t('heading')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            {t('introP1')}
          </p>
          <p className="mt-3 text-gray-600 leading-relaxed">{t('introP2')}</p>
        </div>

        {/* Calculator */}
        <div className="max-w-2xl mx-auto mb-16">
          <EmploymentCostCalculator labels={labels} />
        </div>

        {/* SEO content below calculator */}
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold font-heading text-navy">
            {t('obligationsTitle')}
          </h2>
          <p className="text-gray-600 leading-relaxed">{t('obligationsP1')}</p>
          <p className="text-gray-600 leading-relaxed">{t('obligationsP2')}</p>

          <h2 className="mt-10 text-2xl font-bold font-heading text-navy">
            {t('penaltiesTitle')}
          </h2>
          <p className="text-gray-600 leading-relaxed">{t('penaltiesP1')}</p>

          <h2 className="mt-10 text-2xl font-bold font-heading text-navy">
            {t('optimizationTitle')}
          </h2>
          <p className="text-gray-600 leading-relaxed">{t('optimizationP1')}</p>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary-50 p-8 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-heading text-navy">
            {t('ctaTitle')}
          </h2>
          <p className="mt-2 text-gray-600 max-w-xl mx-auto">{t('ctaDesc')}</p>
          <Link href="/auth/sign-up" className="btn-primary mt-6 inline-flex">
            {t('ctaButton')}
          </Link>
        </div>
      </div>
    </div>
  )
}
