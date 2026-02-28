import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'

interface FooterColumn {
  label: string
  links: { label: string; href: string }[]
}

interface FooterProps {
  columns?: FooterColumn[]
  copyright?: string
  theme?: 'light' | 'dark'
}

export const Footer: React.FC<FooterProps> = ({
  columns = [],
  copyright = new Date().getFullYear().toString(),
  theme = 'dark',
}) => {
  return (
    <footer
      className={clsx(
        theme === 'dark' ? 'bg-navy-deep text-white' : 'bg-gray-50 text-navy'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Footer Columns */}
        {columns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {columns.map((column) => (
              <div key={column.label}>
                <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">
                  {column.label}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={clsx(
                          'text-sm transition-colors',
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-600 hover:text-primary'
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div
          className={clsx(
            'border-t',
            theme === 'dark' ? 'border-navy-light' : 'border-gray-200'
          )}
        />

        {/* Copyright */}
        <div className="mt-8 flex items-center justify-between flex-col md:flex-row gap-4">
          <p className="text-sm text-gray-400">{copyright}</p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className={clsx(
                'text-sm transition-colors',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-primary'
              )}
            >
              Privacy
            </Link>
            <Link
              href="#"
              className={clsx(
                'text-sm transition-colors',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-primary'
              )}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
