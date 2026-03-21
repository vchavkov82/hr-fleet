'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import '@docsearch/css'

const DocSearch = dynamic(
  () => import('@docsearch/react').then(m => m.DocSearch),
  { ssr: false },
)

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-gray-200 bg-white flex items-center px-6 gap-6">
      <Link
        href="/docs"
        className="flex items-center gap-2 font-semibold text-gray-900 text-sm"
      >
        <span className="text-hr-primary font-bold text-lg">HR</span>
        <span className="text-gray-400">/</span>
        <span>Docs</span>
      </Link>

      <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600 flex-1">
        <Link href="/docs/getting-started" className="hover:text-gray-900 transition-colors">
          Getting Started
        </Link>
        <Link href="/docs/features" className="hover:text-gray-900 transition-colors">
          Features
        </Link>
        <Link href="/docs/sdk-guides" className="hover:text-gray-900 transition-colors">
          API
        </Link>
        <Link href="/docs/bg" className="hover:text-gray-900 transition-colors">
          Български
        </Link>
      </nav>

      <div className="ml-auto">
        <DocSearch
          appId="XBW1JU7CW5"
          apiKey="6b0341e2f50196d328d088dbb5cd6166"
          indexName="localstack"
          searchParameters={{
            facets: ['lvl0'],
          }}
        />
      </div>
    </header>
  )
}
