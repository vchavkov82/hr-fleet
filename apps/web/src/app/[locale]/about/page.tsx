import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data'
import { SectionReveal } from '@/components/ui/section-reveal'
import { AboutStats } from './about-stats'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.about' })
  return enhancedMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    path: '/about',
  })
}

const TEAM = [
  { initials: 'IP', name: 'Ivan Petrov', roleKey: 'ceo', bioKey: 'ceoBio' },
  { initials: 'MD', name: 'Maria Dimitrova', roleKey: 'cto', bioKey: 'ctoBio' },
  { initials: 'GI', name: 'Georgi Ivanov', roleKey: 'cpo', bioKey: 'cpoBio' },
  { initials: 'ET', name: 'Elena Todorova', roleKey: 'coo', bioKey: 'cooBio' },
] as const

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.about')

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: t('hero.heading'), url: `${BASE_URL}/${locale}/about` },
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
            <p className="text-xl text-blue-200 leading-relaxed">
              {t('hero.subheading')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold font-heading mb-6 text-navy">
                    {t('story.heading')}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {t('story.content1')}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {t('story.content2')}
                  </p>
                </div>
                <AboutStats
                  labels={{
                    companies: t('stats.companies'),
                    employees: t('stats.employees'),
                    rating: t('stats.rating'),
                    uptime: t('stats.uptime'),
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Mission & Values Section */}
      <SectionReveal>
        <section className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy">
                {t('mission.heading')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-12">
                {t('mission.content')}
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{t('values.simplicity.title')}</h3>
                  <p className="text-gray-600">{t('values.simplicity.description')}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{t('values.compliance.title')}</h3>
                  <p className="text-gray-600">{t('values.compliance.description')}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{t('values.innovation.title')}</h3>
                  <p className="text-gray-600">{t('values.innovation.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Team Section */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-heading mb-6 text-navy">
                {t('team.heading')}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-12">
                {t('team.subheading')}
              </p>

              <div className="grid md:grid-cols-4 gap-8">
                {TEAM.map((member) => (
                  <div key={member.initials} className="text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center text-primary text-2xl font-bold">
                      {member.initials}
                    </div>
                    <h3 className="font-semibold mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t(`team.members.${member.roleKey}`)}</p>
                    <p className="text-xs text-gray-500">{t(`team.members.${member.bioKey}`)}</p>
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/auth/sign-up" className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  {t('cta.primaryButton')}
                </a>
                <a href="/contact" className="inline-flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors">
                  {t('cta.secondaryButton')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
