import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SectionReveal } from '@/components/ui/section-reveal'
import { featureDetails, getFeatureBySlug } from '@/data/feature-details'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    featureDetails.map((f) => ({ locale, slug: f.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const feature = getFeatureBySlug(slug)
  if (!feature) return {}
  return {
    title: `${feature.name} | HR`,
    description: feature.description,
  }
}

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const feature = getFeatureBySlug(slug)
  if (!feature) notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-navy-deep text-white py-20">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {feature.headline}
            </h1>
            <p className="text-xl text-blue-200 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-navy mb-8">
                Key Benefits
              </h2>
              <ul className="space-y-4">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* How It Works */}
      <SectionReveal>
        <section className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-navy mb-8">
                How It Works
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                {feature.howItWorks.map((step, index) => (
                  <div key={step.step} className="text-center">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {index + 1}
                    </div>
                    <h3 className="font-bold text-navy mb-2">{step.step}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* FAQ */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-navy mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {feature.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="bg-white rounded-xl border border-gray-200 p-6 group"
                  >
                    <summary className="font-semibold text-navy cursor-pointer list-none flex items-center justify-between">
                      {faq.question}
                      <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* CTA */}
      <SectionReveal>
        <section className="py-20 bg-primary text-white">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold font-heading mb-6">
                Try {feature.name} today
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Start a free trial and experience the difference.
              </p>
              <a
                href="/auth/sign-up"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
