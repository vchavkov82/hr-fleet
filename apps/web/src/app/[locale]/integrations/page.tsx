import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data'
import { SectionReveal } from '@/components/ui/section-reveal'
import { integrations, categoryLabels, type Integration } from '@/data/integrations'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const title = locale === 'bg' ? 'Интеграции | HR' : 'Integrations | HR'
  const description =
    locale === 'bg'
      ? 'Свържете HR платформата с инструментите, които вече използвате.'
      : 'Connect your HR platform with the tools you already use.'
  return enhancedMetadata({ title, description, locale, path: '/integrations' })
}

function groupByCategory(items: Integration[]): Record<string, Integration[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, Integration[]>
  )
}

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const isBg = locale === 'bg'
  const grouped = groupByCategory(integrations)

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/${locale}` },
    { name: isBg ? 'Интеграции' : 'Integrations', url: `${BASE_URL}/${locale}/integrations` },
  ])

  return (
    <div className="min-h-screen bg-white">
      <script {...jsonLdScript(breadcrumbs)} />
      {/* Hero */}
      <section className="bg-navy-deep text-white py-20">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {isBg ? 'Интеграции' : 'Integrations'}
            </h1>
            <p className="text-xl text-blue-200 leading-relaxed">
              {isBg
                ? 'Свържете HR платформата с инструментите, които вашият екип вече използва.'
                : 'Connect your HR platform with the tools your team already uses.'}
            </p>
          </div>
        </div>
      </section>

      {/* Integration Grid by Category */}
      {Object.entries(grouped).map(([category, items]) => (
        <SectionReveal key={category}>
          <section className="py-16">
            <div className="container-xl">
              <h2 className="text-2xl font-bold font-heading text-navy mb-8">
                {categoryLabels[category as Integration['category']]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((integration) => (
                  <article
                    key={integration.slug}
                    className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl">
                        {integration.icon}
                      </div>
                      <h3 className="text-lg font-bold font-heading text-navy">
                        {integration.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {integration.description}
                    </p>
                  </article>
                ))}
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
                {isBg ? 'Не виждате вашата интеграция?' : "Don't see your integration?"}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {isBg
                  ? 'Свържете се с нас и ще проучим как да свържем вашите инструменти.'
                  : "Contact us and we'll explore how to connect your tools."}
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isBg ? 'Свържете се с нас' : 'Contact Us'}
              </a>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
