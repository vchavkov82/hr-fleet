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
    const t = await getTranslations({ locale, namespace: 'pages.terms' })
    return enhancedMetadata({
        title: t('metaTitle'),
        description: t('metaDescription'),
        locale,
        path: '/terms',
    })
}

const sections = [
    { id: 'introduction', key: 'toc.introduction' },
    { id: 'services', key: 'toc.services' },
    { id: 'accounts', key: 'toc.accounts' },
    { id: 'acceptable-use', key: 'toc.acceptableUse' },
    { id: 'intellectual-property', key: 'toc.intellectualProperty' },
    { id: 'payment', key: 'toc.payment' },
    { id: 'data-processing', key: 'toc.dataProcessing' },
    { id: 'liability', key: 'toc.liability' },
    { id: 'termination', key: 'toc.termination' },
    { id: 'governing-law', key: 'toc.governingLaw' },
    { id: 'contact', key: 'toc.contact' },
] as const

export default async function TermsPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('pages.terms')

    const breadcrumbs = breadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/${locale}` },
        { name: t('hero.heading'), url: `${BASE_URL}/${locale}/terms` },
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

                            {/* 1. Acceptance / Introduction */}
                            <section id="introduction" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('introduction.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('introduction.content')}</p>
                                <p className="text-gray-700 leading-relaxed">{t('introduction.acceptance')}</p>
                            </section>

                            {/* 2. Description of Service */}
                            <section id="services" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('services.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('services.description')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li>{t('services.items.item1')}</li>
                                    <li>{t('services.items.item2')}</li>
                                    <li>{t('services.items.item3')}</li>
                                    <li>{t('services.items.item4')}</li>
                                    <li>{t('services.items.item5')}</li>
                                </ul>
                                <p className="text-gray-700 leading-relaxed mt-4">{t('services.scope')}</p>
                            </section>

                            {/* 3. User Accounts */}
                            <section id="accounts" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('account.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('account.description')}</p>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('account.registration.title')}</h3>
                                        <p className="text-gray-700">{t('account.registration.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('account.termination.title')}</h3>
                                        <p className="text-gray-700">{t('account.termination.content')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 4. Acceptable Use */}
                            <section id="acceptable-use" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('responsibilities.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('responsibilities.description')}</p>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('responsibilities.accuracy.title')}</h3>
                                        <p className="text-gray-700">{t('responsibilities.accuracy.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('responsibilities.compliance.title')}</h3>
                                        <p className="text-gray-700">{t('responsibilities.compliance.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('responsibilities.security.title')}</h3>
                                        <p className="text-gray-700">{t('responsibilities.security.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('responsibilities.prohibited.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('responsibilities.prohibited.description')}</p>
                                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                            <li>{t('responsibilities.prohibited.items.spam')}</li>
                                            <li>{t('responsibilities.prohibited.items.malware')}</li>
                                            <li>{t('responsibilities.prohibited.items.scraping')}</li>
                                            <li>{t('responsibilities.prohibited.items.impersonation')}</li>
                                            <li>{t('responsibilities.prohibited.items.illegal')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Intellectual Property */}
                            <section id="intellectual-property" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('intellectual.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('intellectual.description')}</p>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('intellectual.ours.title')}</h3>
                                        <p className="text-gray-700">{t('intellectual.ours.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('intellectual.yours.title')}</h3>
                                        <p className="text-gray-700">{t('intellectual.yours.content')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 6. Payment Terms */}
                            <section id="payment" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('fees.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('fees.description')}</p>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('fees.subscription.title')}</h3>
                                        <p className="text-gray-700">{t('fees.subscription.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('fees.refunds.title')}</h3>
                                        <p className="text-gray-700">{t('fees.refunds.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('fees.taxes.title')}</h3>
                                        <p className="text-gray-700">{t('fees.taxes.content')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 7. Data Processing */}
                            <section id="data-processing" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('privacy.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.description')}</p>
                                <p className="text-gray-700">
                                    {t('privacy.policyText')}{' '}
                                    <a href="/privacy" className="text-primary hover:underline">{t('privacy.policyLink')}</a>{' '}
                                    {t('privacy.policyLink2')}
                                </p>
                            </section>

                            {/* 8. Limitation of Liability */}
                            <section id="liability" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('liability.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('liability.description')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li>{t('liability.items.item1')}</li>
                                    <li>{t('liability.items.item2')}</li>
                                    <li>{t('liability.items.item3')}</li>
                                    <li>{t('liability.items.item4')}</li>
                                </ul>
                                <div className="bg-gray-50 rounded-lg p-6 mt-6">
                                    <h3 className="text-lg font-semibold mb-2">{t('indemnification.title')}</h3>
                                    <p className="text-gray-700 leading-relaxed">{t('indemnification.content')}</p>
                                </div>
                            </section>

                            {/* 9. Termination */}
                            <section id="termination" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('termination.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('termination.description')}</p>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('termination.byUser.title')}</h3>
                                        <p className="text-gray-700">{t('termination.byUser.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('termination.byUs.title')}</h3>
                                        <p className="text-gray-700">{t('termination.byUs.content')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 10. Governing Law */}
                            <section id="governing-law" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('governing.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('governing.content')}</p>
                                <p className="text-gray-700 leading-relaxed">{t('governing.disputes')}</p>
                            </section>

                            {/* 11. Changes to Terms */}
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('changes.title')}</h2>
                                <p className="text-gray-700 leading-relaxed">{t('changes.content')}</p>
                            </section>

                            {/* 12. Contact Information */}
                            <section id="contact" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('contact.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('contact.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.companyName')}:</strong> HR EOOD
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.email')}:</strong> legal@hr.com
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.address')}:</strong> {t('contact.addressDetails')}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>{t('contact.phone')}:</strong> +359 2 123 4567
                                    </p>
                                </div>
                            </section>

                            {/* Summary */}
                            <section className="bg-primary/5 p-8 rounded-lg">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('summary.title')}</h2>
                                <p className="text-gray-700 leading-relaxed">{t('summary.content')}</p>
                                <p className="text-gray-700 mt-4">
                                    {t('summary.agreement')} <strong>{t('summary.acceptance')}</strong>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
