import type { Metadata } from 'next'
import { inter, mulish } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HR — Onboard, Manage & Pay Your Global Teams',
    template: '%s | HR',
  },
  description:
    'The all-in-one platform to onboard, manage, and pay contractors, EOR employees, and direct employees in 150+ countries. Compliant global hiring made simple.',
  keywords: ['global hiring', 'EOR', 'employer of record', 'contractor management', 'global payroll', 'remote workforce', 'HR platform'],
  authors: [{ name: 'HR' }],
  icons: {
    icon: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mulish.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  )
}
