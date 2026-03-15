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
    const t = await getTranslations({ locale, namespace: 'pages.privacy' })
    return enhancedMetadata({
        title: t('metaTitle'),
        description: t('metaDescription'),
        locale,
        path: '/privacy',
    })
}

const sections = [
    { id: 'introduction', key: 'toc.introduction' },
    { id: 'data-controller', key: 'toc.dataController' },
    { id: 'data-we-collect', key: 'toc.dataWeCollect' },
    { id: 'how-we-use', key: 'toc.howWeUse' },
    { id: 'legal-basis', key: 'toc.legalBasis' },
    { id: 'data-sharing', key: 'toc.dataSharing' },
    { id: 'international-transfers', key: 'toc.internationalTransfers' },
    { id: 'data-retention', key: 'toc.dataRetention' },
    { id: 'your-rights', key: 'toc.yourRights' },
    { id: 'children', key: 'toc.children' },
    { id: 'changes', key: 'toc.changes' },
    { id: 'contact-dpo', key: 'toc.contactDpo' },
] as const

export default async function PrivacyPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('pages.privacy')

    const breadcrumbs = breadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/${locale}` },
        { name: t('hero.heading'), url: `${BASE_URL}/${locale}/privacy` },
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

                            {/* 1. Introduction */}
                            <section id="introduction" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('introduction.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('introduction.content')}</p>
                                <p className="text-gray-700 leading-relaxed">{t('introduction.scope')}</p>
                            </section>

                            {/* 2. Data Controller */}
                            <section id="data-controller" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('controller.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('controller.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('controller.companyLabel')}:</strong> HR EOOD
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('controller.bulstat')}:</strong> 123456789
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('controller.addressLabel')}:</strong> {t('controller.addressValue')}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>{t('controller.emailLabel')}:</strong> dpo@hr.com
                                    </p>
                                </div>
                            </section>

                            {/* 3. Data We Collect */}
                            <section id="data-we-collect" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('information.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('information.description')}</p>

                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-3">{t('information.personal.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('information.personal.description')}</p>
                                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                            <li>{t('information.personal.items.name')}</li>
                                            <li>{t('information.personal.items.email')}</li>
                                            <li>{t('information.personal.items.phone')}</li>
                                            <li>{t('information.personal.items.company')}</li>
                                            <li>{t('information.personal.items.address')}</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-3">{t('information.usage.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('information.usage.description')}</p>
                                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                            <li>{t('information.usage.items.pages')}</li>
                                            <li>{t('information.usage.items.features')}</li>
                                            <li>{t('information.usage.items.time')}</li>
                                            <li>{t('information.usage.items.device')}</li>
                                            <li>{t('information.usage.items.browser')}</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-3">{t('information.employment.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('information.employment.description')}</p>
                                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                            <li>{t('information.employment.items.cv')}</li>
                                            <li>{t('information.employment.items.salary')}</li>
                                            <li>{t('information.employment.items.leave')}</li>
                                            <li>{t('information.employment.items.performance')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* 4. How We Use Data */}
                            <section id="how-we-use" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('usage.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('usage.description')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li>{t('usage.items.service')}</li>
                                    <li>{t('usage.items.support')}</li>
                                    <li>{t('usage.items.improvement')}</li>
                                    <li>{t('usage.items.communication')}</li>
                                    <li>{t('usage.items.security')}</li>
                                    <li>{t('usage.items.legal')}</li>
                                </ul>
                            </section>

                            {/* 5. Legal Basis */}
                            <section id="legal-basis" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('legalBasis.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('legalBasis.description')}</p>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('legalBasis.consent.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('legalBasis.consent.description')}</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('legalBasis.contract.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('legalBasis.contract.description')}</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('legalBasis.legal.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('legalBasis.legal.description')}</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('legalBasis.interest.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('legalBasis.interest.description')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 6. Data Sharing */}
                            <section id="data-sharing" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('sharing.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('sharing.description')}</p>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('sharing.never.title')}</h3>
                                        <p className="text-gray-700">{t('sharing.never.content')}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('sharing.exceptions.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('sharing.exceptions.description')}</p>
                                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                            <li>{t('sharing.exceptions.items.consent')}</li>
                                            <li>{t('sharing.exceptions.items.providers')}</li>
                                            <li>{t('sharing.exceptions.items.legal')}</li>
                                            <li>{t('sharing.exceptions.items.safety')}</li>
                                            <li>{t('sharing.exceptions.items.transfer')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* 7. International Transfers */}
                            <section id="international-transfers" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('international.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('international.description')}</p>
                                <p className="text-gray-700">{t('international.safeguards')}</p>
                            </section>

                            {/* 8. Data Retention */}
                            <section id="data-retention" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('retention.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('retention.description')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li>{t('retention.items.active')}</li>
                                    <li>{t('retention.items.legal')}</li>
                                    <li>{t('retention.items.deletion')}</li>
                                </ul>
                            </section>

                            {/* 9. Your Rights */}
                            <section id="your-rights" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('rights.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('rights.description')}</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold mb-2 text-primary">{t('rights.access.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('rights.access.content')}</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold mb-2 text-primary">{t('rights.correction.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('rights.correction.content')}</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold mb-2 text-primary">{t('rights.deletion.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('rights.deletion.content')}</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold mb-2 text-primary">{t('rights.portability.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('rights.portability.content')}</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold mb-2 text-primary">{t('rights.restriction.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('rights.restriction.content')}</p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                                        <h3 className="font-semibold mb-2 text-primary">{t('rights.objection.title')}</h3>
                                        <p className="text-gray-700 text-sm">{t('rights.objection.content')}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mt-6">{t('rights.exerciseNote')}</p>
                            </section>

                            {/* 10. Children's Privacy */}
                            <section id="children" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('children.title')}</h2>
                                <p className="text-gray-700 leading-relaxed">{t('children.content')}</p>
                            </section>

                            {/* 11. Changes to Policy */}
                            <section id="changes" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('changes.title')}</h2>
                                <p className="text-gray-700 leading-relaxed">{t('changes.content')}</p>
                            </section>

                            {/* 12. Contact DPO */}
                            <section id="contact-dpo" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('contact.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('contact.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.email')}:</strong> privacy@hr.com
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.dpo')}:</strong> dpo@hr.com
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.address')}:</strong> {t('contact.addressDetails')}
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.phone')}:</strong> +359 2 123 4567
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>{t('contact.supervisory')}:</strong> {t('contact.supervisoryDetails')}
                                    </p>
                                </div>
                            </section>

                            {/* Summary */}
                            <section className="bg-primary/5 p-8 rounded-lg">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('summary.title')}</h2>
                                <p className="text-gray-700 leading-relaxed">{t('summary.content')}</p>
                                <p className="text-gray-700 mt-4">
                                    {t('summary.trust')} <strong>{t('summary.commitment')}</strong>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
