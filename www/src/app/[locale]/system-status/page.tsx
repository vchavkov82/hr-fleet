import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'pages.systemStatus' })
    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
    }
}

const services = [
    { key: 'webApp', uptime: '99.99' },
    { key: 'api', uptime: '99.99' },
    { key: 'database', uptime: '99.99' },
    { key: 'email', uptime: '99.98' },
    { key: 'search', uptime: '99.97' },
    { key: 'fileStorage', uptime: '99.99' },
] as const

const uptimeDays = Array.from({ length: 30 }, (_, i) => ({
    day: 30 - i,
    status: i === 12 ? 'degraded' : 'operational',
}))

export default async function SystemStatusPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('pages.systemStatus')

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-navy text-white py-20">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse" />
                            <h1 className="text-4xl md:text-5xl font-bold font-heading">
                                {t('hero.heading')}
                            </h1>
                        </div>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            {t('hero.subheading')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Current Status Banner */}
            <section className="py-12 bg-gray-50">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold">{t('currentStatus.title')}</h2>
                                <span className="text-sm text-gray-500">{t('currentStatus.lastUpdated')}</span>
                            </div>

                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                        <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-600 mb-2">{t('currentStatus.operational')}</h3>
                                    <p className="text-gray-600">{t('currentStatus.allSystems')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Status Table */}
            <section className="py-20">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                            {t('services.title')}
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                            {t('services.description')}
                        </p>

                        <div className="space-y-4">
                            {services.map((svc) => (
                                <div key={svc.key} className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold mb-1">{t(`services.items.${svc.key}.title`)}</h3>
                                            <p className="text-sm text-gray-600">{t(`services.items.${svc.key}.description`)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">{svc.uptime}%</span>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 bg-green-500 rounded-full" />
                                                <span className="text-green-600 font-medium">{t('status.operational')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 30-Day Uptime Chart */}
            <section className="py-20 bg-gray-50">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                            {t('uptime.title')}
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                            {t('uptime.description')}
                        </p>

                        {/* Uptime Stats */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg text-center">
                                <h3 className="font-semibold mb-4">{t('uptime.last24Hours')}</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">99.99%</div>
                                <div className="text-sm text-gray-600">{t('uptime.uptime')}</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg text-center">
                                <h3 className="font-semibold mb-4">{t('uptime.last7Days')}</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">99.98%</div>
                                <div className="text-sm text-gray-600">{t('uptime.uptime')}</div>
                            </div>
                            <div className="bg-white p-6 rounded-lg text-center">
                                <h3 className="font-semibold mb-4">{t('uptime.last30Days')}</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">99.97%</div>
                                <div className="text-sm text-gray-600">{t('uptime.uptime')}</div>
                            </div>
                        </div>

                        {/* 30-Day Bar Chart */}
                        <div className="bg-white p-6 rounded-lg">
                            <h3 className="font-semibold mb-4">{t('uptime.uptimeHistory')}</h3>
                            <div className="flex items-end gap-1 h-16">
                                {uptimeDays.map((d) => (
                                    <div
                                        key={d.day}
                                        className={`flex-1 rounded-sm transition-colors ${
                                            d.status === 'operational' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-400 hover:bg-yellow-500'
                                        }`}
                                        style={{ height: d.status === 'operational' ? '100%' : '75%' }}
                                        title={`Day ${d.day}: ${d.status === 'operational' ? '100%' : '99.5%'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>{t('uptime.daysAgo')}</span>
                                <span>{t('uptime.today')}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" /> {t('uptime.legendOperational')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 bg-yellow-400 rounded-sm inline-block" /> {t('uptime.legendDegraded')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Incidents */}
            <section className="py-20">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold font-heading mb-6 text-navy text-center">
                            {t('incidents.title')}
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                            {t('incidents.description')}
                        </p>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-12">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">{t('incidents.noIncidents')}</h3>
                            <p className="text-green-700">{t('incidents.noIncidentsDescription')}</p>
                        </div>

                        {/* Past Incidents */}
                        <h3 className="text-2xl font-bold font-heading mb-6 text-navy">
                            {t('pastIncidents.title')}
                        </h3>

                        <div className="space-y-4">
                            {['incident1', 'incident2', 'incident3'].map((incident) => (
                                <div key={incident} className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold mb-1">{t(`pastIncidents.items.${incident}.title`)}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{t(`pastIncidents.items.${incident}.description`)}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>{t(`pastIncidents.items.${incident}.date`)}</span>
                                                <span>-</span>
                                                <span>{t(`pastIncidents.items.${incident}.duration`)}</span>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full whitespace-nowrap">
                                            {t('status.resolved')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscribe */}
            <section className="py-20 bg-gray-50">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold font-heading mb-6 text-navy">
                            {t('subscribe.title')}
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            {t('subscribe.description')}
                        </p>

                        <form className="max-w-md mx-auto">
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder={t('subscribe.placeholder')}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {t('subscribe.button')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact */}
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
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h3 className="font-semibold mb-3">{t('contact.email.title')}</h3>
                                <p className="text-gray-600 text-sm mb-4">{t('contact.email.description')}</p>
                                <a href="mailto:support@hr.com" className="text-primary font-semibold hover:text-primary/90 transition-colors">
                                    support@hr.com
                                </a>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h3 className="font-semibold mb-3">{t('contact.twitter.title')}</h3>
                                <p className="text-gray-600 text-sm mb-4">{t('contact.twitter.description')}</p>
                                <a href="#" className="text-primary font-semibold hover:text-primary/90 transition-colors">
                                    @JobsHR_Status
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
