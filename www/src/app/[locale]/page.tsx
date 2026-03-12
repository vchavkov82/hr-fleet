import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Hero from '@/components/sections/hero'
import TrustedCompanies from '@/components/sections/trusted-companies'
import HomepageStats from '@/components/sections/homepage-stats'
import Features from '@/components/sections/features'
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

  return (
    <>
      <Hero />
      <TrustedCompanies />
      <HomepageStats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <BlogPosts />
      <CTA />
    </>
  )
}
