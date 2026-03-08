import { setRequestLocale } from 'next-intl/server'
import SidebarNav from '@/components/dashboard/sidebar-nav'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav />
      <main className="flex-1 lg:ml-0 p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
