import type { Metadata } from 'next'
import { buildSidebar } from '@/lib/docs'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'HR Docs', template: '%s | HR Docs' },
  description: 'HR SaaS platform documentation — employee management, leave, payroll, and more.',
  metadataBase: new URL('https://docs.hr.svc.assistance.bg'),
  openGraph: {
    siteName: 'HR Docs',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sidebar = buildSidebar()

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        <div className="flex">
          <Sidebar items={sidebar} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  )
}
