import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import SignUpForm from './SignUpForm'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.auth.signUp' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ plan?: string }>
}) {
  const { locale } = await params
  const { plan = 'starter' } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('pages.auth.signUp')

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Navy branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-navy-deep text-white p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl font-heading mb-8">
            <span className="text-2xl">HR</span>
          </Link>

          <h2 className="text-3xl font-bold font-heading mb-4">
            {t('panel.heading')}
          </h2>
          <p className="text-gray-300 mb-10 leading-relaxed">
            {t('panel.subheading')}
          </p>

          <ul className="space-y-5 text-left">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-200">{t('panel.feature1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-200">{t('panel.feature2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-200">{t('panel.feature3')}</span>
            </li>
          </ul>

          {/* Testimonial */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <blockquote className="text-gray-300 italic text-sm leading-relaxed">
              {t('panel.testimonial')}
            </blockquote>
            <div className="mt-3">
              <p className="text-white font-semibold text-sm">{t('panel.testimonialAuthor')}</p>
              <p className="text-gray-400 text-xs">{t('panel.testimonialRole')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - White form */}
      <div className="flex items-center justify-center bg-white py-12 px-4">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-navy font-bold text-xl font-heading">
              HR
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading text-navy">{t('heading')}</h1>
          </div>

          <div className="bg-white rounded-2xl lg:shadow-none shadow-sm lg:border-0 border border-gray-200 lg:p-0 p-8">
            <SignUpForm
              plan={plan}
              selectedPlan={t('selectedPlan')}
              growthPlan={t('growthPlan')}
              trialNote={t('trialNote')}
              firstNameLabel={t('firstNameLabel')}
              lastNameLabel={t('lastNameLabel')}
              companyLabel={t('companyLabel')}
              emailLabel={t('emailLabel')}
              passwordLabel={t('passwordLabel')}
              termsText={t('termsText')}
              termsLink={t('termsLink')}
              and={t('and')}
              privacyLink={t('privacyLink')}
              submitFree={t('submitFree')}
              submitTrial={t('submitTrial')}
              noCardNote={t('noCardNote')}
              hasAccount={t('hasAccount')}
              loginLink={t('loginLink')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
