import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

const namespaces = [
  'nav', 'hero', 'features', 'featuresOverview', 'howItWorks',
  'pricingPreview', 'testimonials', 'cta', 'trustedCompanies',
  'blogPosts', 'stats', 'footer', 'pages', 'blog', 'about',
  'careers', 'contact', 'partners', 'helpCenter', 'cookies', 'auth',
] as const

async function loadMessages(locale: string) {
  const messages: Record<string, unknown> = {}
  for (const ns of namespaces) {
    messages[ns] = (await import(`../../messages/${locale}/${ns}.json`)).default
  }
  return messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: await loadMessages(locale),
  }
})
