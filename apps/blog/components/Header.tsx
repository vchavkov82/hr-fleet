import Link from 'next/link'
import { SITE } from '../lib/config'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-primary"
          >
            {SITE.title}
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/blog"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Всички статии
            </Link>
            <Link
              href="/tags"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Тагове
            </Link>
            <Link
              href={SITE.website}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              HR платформа
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
