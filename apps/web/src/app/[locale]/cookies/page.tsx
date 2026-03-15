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
    const t = await getTranslations({ locale, namespace: 'pages.cookies' })
    return enhancedMetadata({
        title: t('metaTitle'),
        description: t('metaDescription'),
        locale,
        path: '/cookies',
    })
}

const sections = [
    { id: 'what-are-cookies', key: 'toc.whatAreCookies' },
    { id: 'types-of-cookies', key: 'toc.typesOfCookies' },
    { id: 'cookies-we-use', key: 'toc.cookiesWeUse' },
    { id: 'how-to-manage', key: 'toc.howToManage' },
    { id: 'third-party', key: 'toc.thirdParty' },
    { id: 'changes', key: 'toc.changes' },
    { id: 'contact', key: 'toc.contact' },
] as const

export default async function CookiesPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('pages.cookies')

    const breadcrumbs = breadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/${locale}` },
        { name: t('hero.heading'), url: `${BASE_URL}/${locale}/cookies` },
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

                            {/* 1. What Are Cookies */}
                            <section id="what-are-cookies" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('whatAre.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('whatAre.description')}</p>
                                <p className="text-gray-700 leading-relaxed">{t('whatAre.purpose')}</p>
                            </section>

                            {/* 2. Types of Cookies */}
                            <section id="types-of-cookies" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('types.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('types.description')}</p>

                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-3 text-green-600">{t('types.essential.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('types.essential.description')}</p>
                                        <p className="text-sm text-gray-600 mb-3">{t('types.essential.examples')}</p>
                                        <div className="bg-gray-50 p-4 rounded">
                                            <p className="text-sm font-medium mb-2">{t('types.essential.cookiesUsed')}</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>session_id -- {t('cookieTable.sessionId')}</li>
                                                <li>auth_token -- {t('cookieTable.authToken')}</li>
                                                <li>csrf_token -- {t('cookieTable.csrfToken')}</li>
                                                <li>locale -- {t('cookieTable.locale')}</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-3 text-blue-600">{t('types.performance.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('types.performance.description')}</p>
                                        <p className="text-sm text-gray-600 mb-3">{t('types.performance.examples')}</p>
                                        <div className="bg-gray-50 p-4 rounded">
                                            <p className="text-sm font-medium mb-2">{t('types.performance.cookiesUsed')}</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>_ga -- {t('cookieTable.ga')}</li>
                                                <li>_gid -- {t('cookieTable.gid')}</li>
                                                <li>_gat -- {t('cookieTable.gat')}</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-3 text-purple-600">{t('types.functional.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('types.functional.description')}</p>
                                        <p className="text-sm text-gray-600 mb-3">{t('types.functional.examples')}</p>
                                        <div className="bg-gray-50 p-4 rounded">
                                            <p className="text-sm font-medium mb-2">{t('types.functional.cookiesUsed')}</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>preferences -- {t('cookieTable.preferences')}</li>
                                                <li>language -- {t('cookieTable.language')}</li>
                                                <li>theme -- {t('cookieTable.theme')}</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-3 text-orange-600">{t('types.marketing.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('types.marketing.description')}</p>
                                        <p className="text-sm text-gray-600 mb-3">{t('types.marketing.examples')}</p>
                                        <div className="bg-gray-50 p-4 rounded">
                                            <p className="text-sm font-medium mb-2">{t('types.marketing.cookiesUsed')}</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>_fbp -- {t('cookieTable.fbp')}</li>
                                                <li>li_sugr -- {t('cookieTable.liSugr')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Cookies We Use (Table) */}
                            <section id="cookies-we-use" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('cookieTable.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('cookieTable.description')}</p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-navy">{t('cookieTable.colName')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-navy">{t('cookieTable.colPurpose')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-navy">{t('cookieTable.colDuration')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-navy">{t('cookieTable.colType')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            <tr><td className="px-4 py-3">session_id</td><td className="px-4 py-3">{t('cookieTable.sessionId')}</td><td className="px-4 py-3">{t('cookieTable.session')}</td><td className="px-4 py-3 text-green-600">{t('cookieTable.typeEssential')}</td></tr>
                                            <tr><td className="px-4 py-3">auth_token</td><td className="px-4 py-3">{t('cookieTable.authToken')}</td><td className="px-4 py-3">24h</td><td className="px-4 py-3 text-green-600">{t('cookieTable.typeEssential')}</td></tr>
                                            <tr><td className="px-4 py-3">csrf_token</td><td className="px-4 py-3">{t('cookieTable.csrfToken')}</td><td className="px-4 py-3">{t('cookieTable.session')}</td><td className="px-4 py-3 text-green-600">{t('cookieTable.typeEssential')}</td></tr>
                                            <tr><td className="px-4 py-3">locale</td><td className="px-4 py-3">{t('cookieTable.locale')}</td><td className="px-4 py-3">1 {t('cookieTable.year')}</td><td className="px-4 py-3 text-purple-600">{t('cookieTable.typeFunctional')}</td></tr>
                                            <tr><td className="px-4 py-3">_ga</td><td className="px-4 py-3">{t('cookieTable.ga')}</td><td className="px-4 py-3">2 {t('cookieTable.years')}</td><td className="px-4 py-3 text-blue-600">{t('cookieTable.typeAnalytics')}</td></tr>
                                            <tr><td className="px-4 py-3">_gid</td><td className="px-4 py-3">{t('cookieTable.gid')}</td><td className="px-4 py-3">24h</td><td className="px-4 py-3 text-blue-600">{t('cookieTable.typeAnalytics')}</td></tr>
                                            <tr><td className="px-4 py-3">_gat</td><td className="px-4 py-3">{t('cookieTable.gat')}</td><td className="px-4 py-3">1 min</td><td className="px-4 py-3 text-blue-600">{t('cookieTable.typeAnalytics')}</td></tr>
                                            <tr><td className="px-4 py-3">_fbp</td><td className="px-4 py-3">{t('cookieTable.fbp')}</td><td className="px-4 py-3">3 {t('cookieTable.months')}</td><td className="px-4 py-3 text-orange-600">{t('cookieTable.typeMarketing')}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* 4. How to Manage Cookies */}
                            <section id="how-to-manage" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('managing.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('managing.description')}</p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">{t('managing.browser.title')}</h3>
                                        <p className="text-gray-700 mb-3">{t('managing.browser.description')}</p>
                                        <div className="bg-gray-50 p-4 rounded">
                                            <p className="text-sm font-medium mb-2">{t('managing.browser.popular')}</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li><strong>Chrome:</strong> Settings &rarr; Privacy and security &rarr; Cookies</li>
                                                <li><strong>Firefox:</strong> Options &rarr; Privacy & Security &rarr; Cookies</li>
                                                <li><strong>Safari:</strong> Preferences &rarr; Privacy &rarr; Cookies</li>
                                                <li><strong>Edge:</strong> Settings &rarr; Privacy and services &rarr; Cookies</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">{t('managing.consent.title')}</h3>
                                        <p className="text-gray-700">{t('managing.consent.description')}</p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                        <h3 className="font-semibold mb-3 text-blue-800">{t('choices.impact.title')}</h3>
                                        <p className="text-blue-700">{t('choices.impact.description')}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Third-Party Cookies */}
                            <section id="third-party" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('thirdParty.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-6">{t('thirdParty.description')}</p>

                                <div className="space-y-4">
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="font-semibold mb-2">Google Analytics</h3>
                                        <p className="text-gray-700 text-sm mb-2">{t('thirdParty.analytics.description')}</p>
                                        <a href="https://policies.google.com/privacy" className="text-primary text-sm hover:underline">
                                            {t('thirdParty.privacyPolicy')}
                                        </a>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="font-semibold mb-2">Facebook Pixel</h3>
                                        <p className="text-gray-700 text-sm mb-2">{t('thirdParty.marketing.description')}</p>
                                        <a href="https://www.facebook.com/privacy/policy/" className="text-primary text-sm hover:underline">
                                            {t('thirdParty.privacyPolicy')}
                                        </a>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="font-semibold mb-2">LinkedIn Insight Tag</h3>
                                        <p className="text-gray-700 text-sm mb-2">{t('thirdParty.linkedin.description')}</p>
                                        <a href="https://www.linkedin.com/legal/privacy-policy" className="text-primary text-sm hover:underline">
                                            {t('thirdParty.privacyPolicy')}
                                        </a>
                                    </div>
                                </div>
                            </section>

                            {/* 6. Changes to Policy */}
                            <section id="changes" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('updates.title')}</h2>
                                <p className="text-gray-700 leading-relaxed">{t('updates.content')}</p>
                            </section>

                            {/* 7. Contact */}
                            <section id="contact" className="mb-12 scroll-mt-24">
                                <h2 className="text-2xl font-bold text-navy mb-4">{t('contact.title')}</h2>
                                <p className="text-gray-700 leading-relaxed mb-4">{t('contact.description')}</p>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.email')}:</strong> privacy@hr.com
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <strong>{t('contact.address')}:</strong> {t('contact.addressDetails')}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>{t('contact.phone')}:</strong> +359 2 123 4567
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
