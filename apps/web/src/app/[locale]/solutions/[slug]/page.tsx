import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SectionReveal } from '@/components/ui/section-reveal'
import { solutions, getSolutionBySlug } from '@/data/solutions'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    solutions.map((s) => ({ locale, slug: s.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const solution = getSolutionBySlug(slug)
  if (!solution) return {}
  return {
    title: `${solution.name} HR Solutions | HR`,
    description: solution.description,
  }
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const solution = getSolutionBySlug(slug)
  if (!solution) notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-navy-deep text-white py-20">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-white/10 rounded-full text-sm font-medium mb-4">
              {solution.name}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {solution.headline}
            </h1>
            <p className="text-xl text-blue-200 leading-relaxed">
              {solution.description}
            </p>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-navy mb-8">
                Common Challenges
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {solution.challenges.map((challenge) => (
                  <div
                    key={challenge}
                    className="flex items-start gap-4 p-6 bg-red-50 rounded-xl"
                  >
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-gray-700">{challenge}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Benefits */}
      <SectionReveal>
        <section className="py-20 bg-surface-lighter">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-navy mb-8">
                How We Help
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {solution.benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm"
                  >
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Features */}
      <SectionReveal>
        <section className="py-20">
          <div className="container-xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-navy mb-8">
                Key Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {solution.features.map((feature) => (
                  <div
                    key={feature}
                    className="bg-primary/5 rounded-xl p-6 text-center"
                  >
                    <p className="font-semibold text-navy">{feature}</p>
                  </div>
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
                Ready to transform HR for your {solution.name.toLowerCase()} team?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Start a free trial and see the difference.
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
