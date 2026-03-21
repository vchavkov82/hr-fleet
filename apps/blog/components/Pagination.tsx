import Link from 'next/link'
import { clsx } from 'clsx'

type Props = {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null

  const prev = currentPage > 1 ? currentPage - 1 : null
  const next = currentPage < totalPages ? currentPage + 1 : null

  function pageHref(page: number) {
    return page === 1 ? basePath : `${basePath}?page=${page}`
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 mt-12"
    >
      {prev !== null ? (
        <Link
          href={pageHref(prev)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          &larr; Предишна
        </Link>
      ) : (
        <span className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
          &larr; Предишна
        </span>
      )}

      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>

      {next !== null ? (
        <Link
          href={pageHref(next)}
          className={clsx(
            'rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
          )}
        >
          Следваща &rarr;
        </Link>
      ) : (
        <span className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-300 cursor-not-allowed">
          Следваща &rarr;
        </span>
      )}
    </nav>
  )
}
