import { setRequestLocale, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SectionReveal } from '@/components/ui/section-reveal'
import Hero from '@/components/sections/hero'
import TrustedCompanies from '@/components/sections/trusted-companies'
import Features from '@/components/sections/features'
import { StatsCounters } from '@/components/sections/stats-counters'
import HowItWorks from '@/components/sections/how-it-works'
import Testimonials from '@/components/sections/testimonials'
import BlogPosts from '@/components/sections/blog-posts'
import CTA from '@/components/sections/cta'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('stats')
  const statsItems = t.raw('items') as Record<
    string,
    { value: number; suffix: string; label: string }
  >

  return (
    <>
      <Hero />

      <SectionReveal>
        <TrustedCompanies />
      </SectionReveal>

      <SectionReveal>
        <Features />
      </SectionReveal>

      {/* Stats section */}
      <SectionReveal>
        <section className="bg-navy-deep py-20">
          <div className="container-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-200 mb-6">
              {t('sectionLabel')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-12">
              {t('heading')}
            </h2>
            <StatsCounters items={Object.values(statsItems)} />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <HowItWorks />
      </SectionReveal>

      <SectionReveal>
        <Testimonials />
      </SectionReveal>

      <SectionReveal>
        <BlogPosts />
      </SectionReveal>

      <SectionReveal>
        <CTA />
      </SectionReveal>
    </>
  )
}
