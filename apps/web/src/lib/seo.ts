import type { Metadata } from 'next'

const BASE_URL = 'https://jobshr.com'

/**
 * Generate enhanced metadata with hreflang alternates, OpenGraph, and Twitter cards.
 */
export function enhancedMetadata({
  title,
  description,
  locale,
  path,
  ogImage,
}: {
  title: string
  description: string
  locale: string
  path: string
  ogImage?: string
}): Metadata {
  const url = `${BASE_URL}/${locale}${path}`
  const image = ogImage ?? `${BASE_URL}/og-default.png`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en${path}`,
        bg: `${BASE_URL}/bg${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'HR Platform',
      locale: locale === 'bg' ? 'bg_BG' : 'en_US',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export { BASE_URL }
