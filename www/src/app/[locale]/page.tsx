import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Hero from '@/components/sections/hero'
import HomepageStats from '@/components/sections/homepage-stats'
import Features from '@/components/sections/features'
import Testimonials from '@/components/sections/testimonials'
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
      <HomepageStats />
      <Features />
      <Testimonials />
      <CTA />
    </>
  )
}
