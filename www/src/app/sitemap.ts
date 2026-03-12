import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobshr.com'

  const staticPaths = [
    '', // home
    '/features',
    '/pricing',
    '/about',
    '/partners',
    '/careers',
    '/contact',
    '/help-center',
    '/hr-tools',
    '/hr-tools/salary-calculator',
    '/hr-tools/employment-cost-calculator',
    '/hr-tools/leave-calculator',
    '/hr-tools/templates',
  ]

  const legalPaths = ['/privacy', '/terms', '/cookies', '/gdpr', '/system-status']

  const allPaths = [...staticPaths, ...legalPaths]

  const now = new Date().toISOString()

  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const path of allPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
      })
    }
  }

  return entries
}

