import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

type SitemapEntry = {
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

const pages: SitemapEntry[] = [
  // Core pages
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/features', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/partners', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/careers', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/help-center', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/integrations', priority: 0.7, changeFrequency: 'monthly' },

  // HR Tools
  { path: '/hr-tools', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/hr-tools/salary-calculator', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/hr-tools/employment-cost-calculator', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/hr-tools/leave-calculator', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/hr-tools/templates', priority: 0.7, changeFrequency: 'monthly' },

  // Feature details
  { path: '/features/payroll', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/features/onboarding', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/features/compliance', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/features/time-tracking', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/features/employee-management', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/features/reporting', priority: 0.7, changeFrequency: 'monthly' },

  // Solutions
  { path: '/solutions/technology', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/solutions/healthcare', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/solutions/finance', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/solutions/retail', priority: 0.7, changeFrequency: 'monthly' },

  // Legal
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/gdpr', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/security', priority: 0.3, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobshr.com'
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const page of pages) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  return entries
}
