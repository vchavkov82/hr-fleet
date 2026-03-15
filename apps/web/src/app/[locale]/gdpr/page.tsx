import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data'

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'pages.gdpr' })
    return enhancedMetadata({
        title: t('metaTitle'),
        description: t('metaDescription'),
        locale,
        path: '/gdpr',
    })
}

const sections = [
    { id: 'commitment', key: 'toc.commitment' },
    { id: 'data-processing', key: 'toc.dataProcessing' },
    { id: 'sub-processors', key: 'toc.subProcessors' },
    { id: 'technical-measures', key: 'toc.technicalMeasures' },
    { id: 'data-subject-rights', key: 'toc.dataSubjectRights' },
    { id: 'cross-border', key: 'toc.crossBorder' },
    { id: 'dpo', key: 'toc.dpo' },
    { id: 'breach-notification', key: 'toc.breachNotification' },
    { id: 'compliance-docs', key: 'toc.complianceDocs' },
    { id: 'contact', key: 'toc.contact' },
] as const

export default async function GdprPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('pages.gdpr')

    const breadcrumbs = breadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/${locale}` },
        { name: t('hero.heading'), url: `${BASE_URL}/${locale}/gdpr` },
    ])

    return (
        <div className="min-h-screen bg-white">
            <script {...jsonLdScript(breadcrumbs)} />
            {/* Hero Section */}
            <section className="bg-navy text-white py-20">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                            {t('hero.heading')}
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            {t('hero.subheading')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-20">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-lg max-w-none prose-headings:text-navy prose-a:text-primary">
                            {/* Last Updated */}
                            <p className="text-sm text-gray-500 mb-8">{t('lastUpdated')}</p>

                            {/* Table of Contents */}
                            <nav className="bg-surface-lighter border border-gray-200 rounded-xl p-6 mb-12">
                                <h2 className="text-lg font-bold text-navy mb-4">{t('toc.title')}</h2>
                                <ol className="list-decimal pl-5 space-y-2 text-sm">
                                    {sections.map((s) => (
                                        <li key={s.id}>
                                            <a href={`#${s.id}`} className="text-primary hover:underline">
                                                {t(s.key)}
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </nav>

                            {/* 1. Our Commitment */}
                            <section id="commitment" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('overview.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('overview.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="font-semibold mb-3">{t('overview.keyPrinciples.title')}</h3>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                        <li>{t('overview.keyPrinciples.lawfulness')}</li>
                                        <li>{t('overview.keyPrinciples.fairness')}</li>
                                        <li>{t('overview.keyPrinciples.transparency')}</li>
                                        <li>{t('overview.keyPrinciples.purpose')}</li>
                                        <li>{t('overview.keyPrinciples.minimization')}</li>
                                        <li>{t('overview.keyPrinciples.accuracy')}</li>
                                        <li>{t('overview.keyPrinciples.limitation')}</li>
                                        <li>{t('overview.keyPrinciples.integrity')}</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 2. Data Processing Agreement */}
                            <section id="data-processing" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('dpa.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('dpa.description')}</p>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('dpa.scope.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('dpa.scope.description')}</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('dpa.duration.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('dpa.duration.description')}</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('dpa.obligations.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('dpa.obligations.description')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Sub-Processors */}
                            <section id="sub-processors" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('subProcessors.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('subProcessors.description')}</p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-navy">{t('subProcessors.colProvider')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-navy">{t('subProcessors.colPurpose')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-navy">{t('subProcessors.colLocation')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            <tr><td className="px-4 py-3">Amazon Web Services (AWS)</td><td className="px-4 py-3">{t('subProcessors.aws')}</td><td className="px-4 py-3">EU (Frankfurt)</td></tr>
                                            <tr><td className="px-4 py-3">Google Analytics</td><td className="px-4 py-3">{t('subProcessors.analytics')}</td><td className="px-4 py-3">EU</td></tr>
                                            <tr><td className="px-4 py-3">Mailgun</td><td className="px-4 py-3">{t('subProcessors.email')}</td><td className="px-4 py-3">EU</td></tr>
                                            <tr><td className="px-4 py-3">Stripe</td><td className="px-4 py-3">{t('subProcessors.payments')}</td><td className="px-4 py-3">EU / US (SCC)</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* 4. Technical & Organizational Measures */}
                            <section id="technical-measures" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('security.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('security.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="font-semibold mb-3">{t('security.measures.title')}</h3>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                        <li>{t('security.measures.encryption')}</li>
                                        <li>{t('security.measures.access')}</li>
                                        <li>{t('security.measures.audits')}</li>
                                        <li>{t('security.measures.training')}</li>
                                        <li>{t('security.measures.backup')}</li>
                                        <li>{t('security.measures.monitoring')}</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 5. Data Subject Rights */}
                            <section id="data-subject-rights" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('rights.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('rights.description')}</p>

                                <div className="space-y-4">
                                    {['inform', 'access', 'rectification', 'erasure', 'restrict', 'portability', 'objection', 'automated'].map((right) => (
                                        <div key={right} className="bg-white border border-gray-200 rounded-lg p-5">
                                            <h3 className="font-semibold mb-2 text-primary">{t(`rights.${right}.title`)}</h3>
                                            <p className="text-gray-700 text-sm">{t(`rights.${right}.description`)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                                    <h3 className="font-semibold mb-3 text-blue-800">{t('exercise.process.title')}</h3>
                                    <ol className="list-decimal pl-6 space-y-2 text-blue-700">
                                        <li>{t('exercise.process.step1')}</li>
                                        <li>{t('exercise.process.step2')}</li>
                                        <li>{t('exercise.process.step3')}</li>
                                        <li>{t('exercise.process.step4')}</li>
                                    </ol>
                                    <p className="text-blue-700 mt-3">
                                        <strong>{t('exercise.timeline.title')}:</strong> {t('exercise.timeline.content')}
                                    </p>
                                </div>
                            </section>

                            {/* 6. Cross-Border Transfers */}
                            <section id="cross-border" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('transfers.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('transfers.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="font-semibold mb-2">{t('transfers.safeguards.title')}</h3>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                        <li>{t('transfers.safeguards.adequacy')}</li>
                                        <li>{t('transfers.safeguards.sccs')}</li>
                                        <li>{t('transfers.safeguards.bcrs')}</li>
                                        <li>{t('transfers.safeguards.derogations')}</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 7. Data Protection Officer */}
                            <section id="dpo" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('dpo.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('dpo.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('dpo.name')}:</strong> {t('dpo.nameValue')}
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('dpo.email')}:</strong> dpo@hr.com
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('dpo.phone')}:</strong> +359 2 123 4567
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>{t('dpo.address')}:</strong> {t('dpo.addressDetails')}
                                    </p>
                                </div>
                            </section>

                            {/* 8. Breach Notification */}
                            <section id="breach-notification" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('breaches.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('breaches.description')}</p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                    <h3 className="font-semibold mb-2 text-red-800">{t('breaches.notification.title')}</h3>
                                    <p className="text-red-700">{t('breaches.notification.content')}</p>
                                </div>
                            </section>

                            {/* 9. Compliance Documentation */}
                            <section id="compliance-docs" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('compliance.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('compliance.description')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li>{t('compliance.items.ropa')}</li>
                                    <li>{t('compliance.items.dpia')}</li>
                                    <li>{t('compliance.items.policies')}</li>
                                    <li>{t('compliance.items.training')}</li>
                                    <li>{t('compliance.items.incidents')}</li>
                                </ul>
                            </section>

                            {/* 10. Contact & Complaints */}
                            <section id="contact" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('contact.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('contact.description')}</p>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="font-semibold mb-3">{t('contact.us.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('contact.us.description')}</p>
                                        <div className="text-sm text-gray-600">
                                            <p><strong>Email:</strong> dpo@hr.com</p>
                                            <p><strong>Phone:</strong> +359 2 123 4567</p>
                                            <p><strong>Address:</strong> {t('contact.addressDetails')}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="font-semibold mb-3">{t('contact.supervisory.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('contact.supervisory.description')}</p>
                                        <div className="text-sm text-gray-600">
                                            <p><strong>{t('contact.supervisory.authority')}:</strong> {t('contact.supervisory.authorityName')}</p>
                                            <p><strong>Address:</strong> {t('contact.supervisory.authorityAddress')}</p>
                                            <p><strong>Website:</strong> www.cpdp.bg</p>
                                            <p><strong>Email:</strong> kzld@cpdp.bg</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Summary */}
                            <section className="bg-blue-50 p-8 rounded-lg">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('summary.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('summary.content')}</p>
                                <p className="text-gray-700">
                                    <strong>{t('summary.commitment')}</strong> {t('summary.promise')}
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
