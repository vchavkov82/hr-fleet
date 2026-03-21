import Link from 'next/link'
import { SITE } from '../lib/config'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {SITE.title}. Всички права запазени.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/rss.xml" className="hover:text-gray-900 transition-colors">
              RSS
            </Link>
            <Link href="/sitemap.xml" className="hover:text-gray-900 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
