import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data'
import { SectionReveal } from '@/components/ui/section-reveal'
import { PartnerForm } from './partner-form'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.partners' })
  return enhancedMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    path: '/partners',
  })
}

const PARTNER_TYPES = [
  { key: 'reseller', icon: (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )},
  { key: 'integration', icon: (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  )},
  { key: 'technology', icon: (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )},
] as const

const BENEFITS = [
  { icon: (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ), key: 'revenue' },
  { icon: (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ), key: 'training' },
  { icon: (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ), key: 'coMarketing' },
  { icon: (
    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ), key: 'support' },
] as const

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.partners')

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: t('hero.heading'), url: `${BASE_URL}/${locale}/partners` },
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
            <a href="#partner-form" className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              {t('hero.button')}
            </a>
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('types.title')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('types.subheading')}
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {PARTNER_TYPES.map(({ key, icon }) => (
                  <div key={key} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      {icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{t(`types.${key}.title`)}</h3>
                    <p className="text-gray-600 mb-4">{t(`types.${key}.description`)}</p>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      {(['benefit1', 'benefit2', 'benefit3', 'benefit4'] as const).map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t(`types.${key}.benefits.${b}`)}
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

      {/* Benefits Section */}
      <SectionReveal>
        <section className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('why.title')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('why.subheading')}
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {BENEFITS.map(({ key, icon }) => (
                  <div key={key} className="bg-white p-8 rounded-xl shadow-sm flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t(`why.benefits.${key}.title`)}</h3>
                      <p className="text-gray-600">{t(`why.benefits.${key}.description`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Current Partners Section */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('current.title')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('current.subheading')}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {['TechCo', 'PayrollBG', 'HRCloud', 'DataSync'].map((name) => (
                  <div key={name} className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100">
                    <div className="text-lg font-bold text-gray-400 mb-1">{name}</div>
                    <p className="text-xs text-gray-500">Partner</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Partner Application Form */}
      <SectionReveal>
        <section id="partner-form" className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('form.title')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('form.description')}
              </p>

              <PartnerForm
                labels={{
                  companyName: t('form.companyName'),
                  website: t('form.website'),
                  contactName: t('form.contactName'),
                  email: t('form.email'),
                  partnerType: t('form.partnerType'),
                  selectType: t('form.selectType'),
                  types: {
                    referral: t('types.referral.title'),
                    integration: t('types.integration.title'),
                    reseller: t('types.reseller.title'),
                    technology: t('types.technology.title'),
                  },
                  companySize: t('form.companySize'),
                  selectSize: t('form.selectSize'),
                  sizes: {
                    small: t('form.sizes.small'),
                    medium: t('form.sizes.medium'),
                    large: t('form.sizes.large'),
                    enterprise: t('form.sizes.enterprise'),
                  },
                  agreement: t('form.agreement'),
                  submit: t('form.submit'),
                  successTitle: t('form.successTitle'),
                  successMessage: t('form.successMessage'),
                }}
              />
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Contact Section */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy">
                {t('contact.title')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {t('contact.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface-lighter p-6 rounded-xl">
                  <h3 className="font-semibold mb-3">{t('contact.email.title')}</h3>
                  <p className="text-gray-600 mb-2">{t('contact.email.description')}</p>
                  <a href="mailto:partners@hr.bg" className="text-primary font-semibold hover:text-primary/90 transition-colors">
                    partners@hr.bg
                  </a>
                </div>
                <div className="bg-surface-lighter p-6 rounded-xl">
                  <h3 className="font-semibold mb-3">{t('contact.phone.title')}</h3>
                  <p className="text-gray-600 mb-2">{t('contact.phone.description')}</p>
                  <a href="tel:+35921234567" className="text-primary font-semibold hover:text-primary/90 transition-colors">
                    +359 2 123 4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
