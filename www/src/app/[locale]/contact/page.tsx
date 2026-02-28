import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SectionReveal } from '@/components/ui/section-reveal'
import { ContactForm } from './contact-form'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.contact' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.contact')

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-navy-deep text-white py-16">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {t('hero.heading')}
            </h1>
            <p className="text-xl text-blue-200 leading-relaxed">
              {t('hero.subheading')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form + Info Section */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Contact Form */}
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-6 text-navy">
                    {t('form.title')}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {t('form.description')}
                  </p>
                  <ContactForm
                    labels={{
                      firstName: t('form.firstName'),
                      lastName: t('form.lastName'),
                      email: t('form.email'),
                      phone: t('form.phone'),
                      company: t('form.company'),
                      companySize: t('form.companySize'),
                      selectCompanySize: t('form.selectCompanySize'),
                      companySizes: {
                        small: t('form.companySizes.small'),
                        medium: t('form.companySizes.medium'),
                        large: t('form.companySizes.large'),
                        enterprise: t('form.companySizes.enterprise'),
                      },
                      subject: t('form.subject'),
                      selectSubject: t('form.selectSubject'),
                      subjects: {
                        general: t('form.subjects.general'),
                        sales: t('form.subjects.sales'),
                        demo: t('form.subjects.demo'),
                        support: t('form.subjects.support'),
                        partnership: t('form.subjects.partnership'),
                        feedback: t('form.subjects.feedback'),
                        other: t('form.subjects.other'),
                      },
                      message: t('form.message'),
                      privacy: t('form.privacy'),
                      privacyLink: t('form.privacyLink'),
                      submit: t('form.submit'),
                      submitting: t('form.submitting'),
                      successTitle: t('form.successTitle'),
                      successMessage: t('form.successMessage'),
                      successAction: t('form.successAction'),
                    }}
                  />
                </div>

                {/* Right: Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-6 text-navy">
                    {t('offices.title')}
                  </h2>

                  <div className="space-y-6">
                    {/* Email */}
                    <div className="bg-surface-lighter p-6 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('offices.email.title')}</h3>
                          <a href="mailto:hello@hr.bg" className="text-primary hover:text-primary/80 transition-colors">
                            hello@hr.bg
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="bg-surface-lighter p-6 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('offices.phone.title')}</h3>
                          <a href="tel:+35921234567" className="text-primary hover:text-primary/80 transition-colors">
                            +359 2 123 4567
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-surface-lighter p-6 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('offices.address.title')}</h3>
                          <p className="text-gray-600">{t('offices.address.value')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="bg-surface-lighter p-6 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t('support.title')}</h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>{t('support.mondayFriday')}:</strong> {t('support.weekdayHours')}</p>
                            <p><strong>{t('support.saturday')}:</strong> {t('support.saturdayHours')}</p>
                            <p><strong>{t('support.sunday')}:</strong> {t('support.sundayHours')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4 mt-6">
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* FAQ Section */}
      <SectionReveal>
        <section className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                {t('faq.title')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                {t('faq.subheading')}
              </p>

              <div className="space-y-4">
                {(['question1', 'question2', 'question3', 'question4', 'question5', 'question6', 'question7', 'question8'] as const).map((key) => (
                  <details key={key} className="bg-white p-6 rounded-lg border border-gray-200 group">
                    <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                      {t(`faq.items.${key}`)}
                      <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-3 text-gray-600">{t(`faq.items.${key.replace('question', 'answer')}`)}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
