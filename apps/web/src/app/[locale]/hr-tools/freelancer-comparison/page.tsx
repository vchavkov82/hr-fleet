import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import FreelancerComparison from '@/components/calculators/freelancer-comparison'

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
    namespace: 'pages.hrTools.freelancerComparison',
  })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function FreelancerComparisonPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.hrTools.freelancerComparison')

  const labels: Record<string, string> = {
    // Input section
    'input.monthlyAmount': t('input.monthlyAmount'),
    'input.monthlyAmountHelp': t('input.monthlyAmountHelp'),
    'input.bornAfter1960': t('input.bornAfter1960'),
    'input.illnessMaternity': t('input.illnessMaternity'),
    'input.illnessMaternityNote': t('input.illnessMaternityNote'),
    'input.vatRegistered': t('input.vatRegistered'),
    'input.vatNote': t('input.vatNote'),
    'input.monthly': t('input.monthly'),
    'input.annual': t('input.annual'),

    // Savings banner
    'savings.banner': t('savings.banner'),
    'savings.perMonth': t('savings.perMonth'),
    'savings.perYear': t('savings.perYear'),
    'savings.effectiveTaxRate': t('savings.effectiveTaxRate'),
    'savings.eoodRate': t('savings.eoodRate'),
    'savings.employmentRate': t('savings.employmentRate'),
    'savings.totalWithVacation': t('savings.totalWithVacation'),

    // EOOD column
    'eood.title': t('eood.title'),
    'eood.revenue': t('eood.revenue'),
    'eood.selfInsurance': t('eood.selfInsurance'),
    'eood.insuranceBase': t('eood.insuranceBase'),
    'eood.overhead': t('eood.overhead'),
    'eood.accountantFee': t('eood.accountantFee'),
    'eood.bankFees': t('eood.bankFees'),
    'eood.adminTime': t('eood.adminTime'),
    'eood.registrationAmortized': t('eood.registrationAmortized'),
    'eood.totalOverhead': t('eood.totalOverhead'),
    'eood.taxableProfit': t('eood.taxableProfit'),
    'eood.corporateTax': t('eood.corporateTax'),
    'eood.afterTaxProfit': t('eood.afterTaxProfit'),
    'eood.dividendTax': t('eood.dividendTax'),
    'eood.netToOwner': t('eood.netToOwner'),
    'eood.effectiveTaxRate': t('eood.effectiveTaxRate'),
    'eood.vatBreakdown': t('eood.vatBreakdown'),
    'eood.exclVat': t('eood.exclVat'),
    'eood.vatAmount': t('eood.vatAmount'),
    'eood.totalInvoice': t('eood.totalInvoice'),
    'eood.vatNote': t('eood.vatNote'),

    // Employment column
    'employment.title': t('employment.title'),
    'employment.recommended': t('employment.recommended'),
    'employment.grossSalary': t('employment.grossSalary'),
    'employment.employeeDeductions': t('employment.employeeDeductions'),
    'employment.incomeTax': t('employment.incomeTax'),
    'employment.netSalary': t('employment.netSalary'),
    'employment.employerCost': t('employment.employerCost'),
    'employment.effectiveTaxRate': t('employment.effectiveTaxRate'),

    // Benefits comparison
    'benefits.title': t('benefits.title'),
    'benefits.paidLeave': t('benefits.paidLeave'),
    'benefits.paidLeaveEood': t('benefits.paidLeaveEood'),
    'benefits.paidLeaveEmployment': t('benefits.paidLeaveEmployment'),
    'benefits.sickPay': t('benefits.sickPay'),
    'benefits.sickPayEood': t('benefits.sickPayEood'),
    'benefits.sickPayEmployment': t('benefits.sickPayEmployment'),
    'benefits.maternity': t('benefits.maternity'),
    'benefits.maternityEood': t('benefits.maternityEood'),
    'benefits.maternityEmployment': t('benefits.maternityEmployment'),
    'benefits.unemployment': t('benefits.unemployment'),
    'benefits.unemploymentEood': t('benefits.unemploymentEood'),
    'benefits.unemploymentEmployment': t('benefits.unemploymentEmployment'),
    'benefits.mortgage': t('benefits.mortgage'),
    'benefits.mortgageEood': t('benefits.mortgageEood'),
    'benefits.mortgageEmployment': t('benefits.mortgageEmployment'),
    'benefits.laborProtection': t('benefits.laborProtection'),
    'benefits.laborProtectionEood': t('benefits.laborProtectionEood'),
    'benefits.laborProtectionEmployment': t('benefits.laborProtectionEmployment'),
    'benefits.vacationDays': t('benefits.vacationDays'),
    'benefits.vacationDaysMin': t('benefits.vacationDaysMin'),
    'benefits.vacationValue': t('benefits.vacationValue'),

    // Disclaimer
    disclaimer: t('disclaimer'),

    // CTA
    'cta.title': t('cta.title'),
    'cta.description': t('cta.description'),
    'cta.button': t('cta.button'),

    // Mobile CTA
    'mobileCta.savings': t('mobileCta.savings'),
    'mobileCta.button': t('mobileCta.button'),
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
        <div className="max-w-5xl mx-auto mb-16">
          <FreelancerComparison labels={labels} />
        </div>

        {/* SEO content below calculator */}
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold font-heading text-navy">
            {t('seo.howItWorksTitle')}
          </h2>
          <p className="text-gray-600 leading-relaxed">{t('seo.howItWorksP1')}</p>
          <p className="text-gray-600 leading-relaxed">{t('seo.howItWorksP2')}</p>

          <h2 className="mt-10 text-2xl font-bold font-heading text-navy">
            {t('seo.eoodVsEmploymentTitle')}
          </h2>
          <p className="text-gray-600 leading-relaxed">{t('seo.eoodVsEmploymentP1')}</p>
          <p className="text-gray-600 leading-relaxed">{t('seo.eoodVsEmploymentP2')}</p>

          <h2 className="mt-10 text-2xl font-bold font-heading text-navy">
            {t('seo.hiddenCostsTitle')}
          </h2>
          <p className="text-gray-600 leading-relaxed">{t('seo.hiddenCostsP1')}</p>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary-50 p-8 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-heading text-navy">
            {t('cta.title')}
          </h2>
          <p className="mt-2 text-gray-600 max-w-xl mx-auto">{t('cta.description')}</p>
          <Link href="/auth/sign-up" className="btn-primary mt-6 inline-flex">
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </div>
  )
}
