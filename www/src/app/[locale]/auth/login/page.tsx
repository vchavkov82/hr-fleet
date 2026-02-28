import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import LoginForm from './LoginForm'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.auth.login' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.auth.login')

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
            <LoginForm
              emailLabel={t('emailLabel')}
              passwordLabel={t('passwordLabel')}
              forgotPassword={t('forgotPassword')}
              rememberMe={t('rememberMe')}
              submit={t('submit')}
              noAccount={t('noAccount')}
              signUpLink={t('signUpLink')}
            />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">{t('sslNote')}</p>
        </div>
      </div>
    </div>
  )
}
