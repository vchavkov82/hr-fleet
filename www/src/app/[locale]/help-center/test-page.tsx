import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
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
    const t = await getTranslations({ locale, namespace: 'helpCenter' })
    return { title: t('metaTitle'), description: t('metaDescription') }
}

export default async function TestHelpCenterPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('helpCenter')

    return (
        <div className="min-h-screen bg-white p-8">
            <h1 className="text-4xl font-bold mb-4">{t('hero.heading')}</h1>
            <p className="text-xl mb-8">{t('hero.subheading')}</p>
            <div className="bg-gray-100 p-4 rounded">
                <p>Help Center is working! Translations are loading properly.</p>
            </div>
        </div>
    )
}
