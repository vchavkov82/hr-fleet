import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
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
  const title = locale === 'bg' ? 'Сигурност | HR' : 'Security | HR'
  const description =
    locale === 'bg'
      ? 'Научете как защитаваме вашите данни с enterprise-grade сигурност.'
      : 'Learn how we protect your data with enterprise-grade security measures.'
  return { title, description }
}

const SECURITY_SECTIONS = [
  {
    id: 'data-protection',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    titleEn: 'Data Protection',
    titleBg: 'Защита на данни',
    descriptionEn: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Database backups are encrypted and stored in geographically redundant locations.',
    descriptionBg: 'Всички данни се криптират в покой с AES-256 и при пренос с TLS 1.3. Резервните копия на базата данни се криптират и съхраняват в географски разпределени локации.',
  },
  {
    id: 'infrastructure',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
      </svg>
    ),
    titleEn: 'Infrastructure Security',
    titleBg: 'Сигурност на инфраструктурата',
    descriptionEn: 'Our infrastructure runs on enterprise-grade cloud providers with SOC 2 compliance. Network segmentation, firewalls, and intrusion detection systems protect all services.',
    descriptionBg: 'Нашата инфраструктура работи на enterprise-grade облачни доставчици със SOC 2 съответствие. Мрежова сегментация, защитни стени и системи за откриване на проникване защитават всички услуги.',
  },
  {
    id: 'compliance',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    titleEn: 'GDPR Compliance',
    titleBg: 'Съответствие с GDPR',
    descriptionEn: 'Fully compliant with GDPR and Bulgarian data protection regulations. We provide data processing agreements, right to erasure, data portability, and transparent privacy controls.',
    descriptionBg: 'Пълно съответствие с GDPR и българското законодателство за защита на данните. Предоставяме споразумения за обработка на данни, право на изтриване, преносимост на данни и прозрачни контроли за поверителност.',
  },
  {
    id: 'access-control',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    titleEn: 'Access Control',
    titleBg: 'Контрол на достъпа',
    descriptionEn: 'Role-based access control (RBAC) with fine-grained permissions. Multi-factor authentication, session management, and comprehensive audit logging for all actions.',
    descriptionBg: 'Контрол на достъпа базиран на роли (RBAC) с фини разрешения. Многофакторна автентикация, управление на сесии и подробно логване на одит за всички действия.',
  },
  {
    id: 'business-continuity',
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    titleEn: 'Business Continuity',
    titleBg: 'Непрекъсваемост на бизнеса',
    descriptionEn: '99.9% uptime SLA with automated failover. Regular disaster recovery testing, automated backups every hour, and 30-day backup retention policy.',
    descriptionBg: '99.9% SLA за наличност с автоматичен failover. Редовно тестване за възстановяване при бедствия, автоматични резервни копия на всеки час и 30-дневна политика за задържане на резервни копия.',
  },
] as const

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const isBg = locale === 'bg'

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-navy-deep text-white py-20">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {isBg ? 'Сигурност на enterprise ниво' : 'Enterprise-Grade Security'}
            </h1>
            <p className="text-xl text-blue-200 leading-relaxed">
              {isBg
                ? 'Вашите HR данни са защитени с най-високи стандарти за сигурност.'
                : 'Your HR data is protected with the highest security standards in the industry.'}
            </p>
          </div>
        </div>
      </section>

      {/* Security Sections */}
      {SECURITY_SECTIONS.map((section, index) => (
        <SectionReveal key={section.id}>
          <section className={`py-20 ${index % 2 === 1 ? 'bg-surface-lighter' : 'bg-white'}`}>
            <div className="container-xl">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold font-heading text-navy mb-4">
                      {isBg ? section.titleBg : section.titleEn}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {isBg ? section.descriptionBg : section.descriptionEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>
      ))}

      {/* CTA */}
      <SectionReveal>
        <section className="py-20 bg-primary text-white">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-heading mb-6">
                {isBg ? 'Готови да защитите вашите HR данни?' : 'Ready to secure your HR data?'}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {isBg
                  ? 'Започнете безплатен пробен период и вижте нашата сигурност в действие.'
                  : 'Start a free trial and see our security in action.'}
              </p>
              <a
                href="/auth/sign-up"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isBg ? 'Започнете безплатно' : 'Start Free Trial'}
              </a>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
