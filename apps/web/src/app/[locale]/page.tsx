import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { enhancedMetadata, BASE_URL } from '@/lib/seo'
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
} from '@/lib/structured-data'
import Hero from '@/components/sections/hero'
import TrustedCompanies from '@/components/sections/trusted-companies'
import HomepageStats from '@/components/sections/homepage-stats'
import Features from '@/components/sections/features'
import HowItWorks from '@/components/sections/how-it-works'
import Testimonials from '@/components/sections/testimonials'
import BlogPosts from '@/components/sections/blog-posts'
import CTA from '@/components/sections/cta'
import { AnimatedSection } from '@/components/ui/animated-section'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.home' })
  return enhancedMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    path: '',
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', url: `${BASE_URL}/${locale}` },
  ])

  return (
    <>
      <script {...jsonLdScript(organizationJsonLd())} />
      <script {...jsonLdScript(softwareApplicationJsonLd())} />
      <script {...jsonLdScript(breadcrumbs)} />
      {/* Hero rendered immediately for LCP — no animation wrapper */}
      <Hero />
      <TrustedCompanies />
      <AnimatedSection>
        <HomepageStats />
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <Features />
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <HowItWorks />
      </AnimatedSection>
      <AnimatedSection delay={0.15}>
        <Testimonials />
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <BlogPosts />
      </AnimatedSection>
      <AnimatedSection>
        <CTA />
      </AnimatedSection>
    </>
  )
}
