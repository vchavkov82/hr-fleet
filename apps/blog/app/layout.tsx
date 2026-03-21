import type { Metadata } from 'next'
import { SITE } from '../lib/config'
import './globals.css'

export const metadata: Metadata = {
  title: { default: SITE.title, template: `%s | ${SITE.title}` },
  description: SITE.desc,
  metadataBase: new URL(SITE.website),
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: SITE.website,
    siteName: SITE.title,
  },
  alternates: {
    types: {
      'application/rss+xml': `${SITE.website}rss.xml`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
