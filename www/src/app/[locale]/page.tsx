import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SectionReveal } from '@/components/ui/section-reveal'
import Hero from '@/components/sections/hero'
import Features from '@/components/sections/features'
import HowItWorks from '@/components/sections/how-it-works'
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

  return (
    <>
      <Hero />

      <SectionReveal>
        <Features />
      </SectionReveal>

      <SectionReveal>
        <HowItWorks />
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
