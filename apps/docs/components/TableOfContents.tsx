'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Heading = {
  id: string
  text: string
  level: number
}

function extractHeadings(source: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: Heading[] = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    headings.push({ id, text, level })
  }

  return headings
}

type Props = {
  source: string
}

export function TableOfContents({ source }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const headings = extractHeadings(source)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0% -80% 0%' },
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="On this page" className="sticky top-20">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map(h => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block text-sm transition-colors',
                h.level === 3 && 'pl-3',
                activeId === h.id
                  ? 'text-hr-primary font-medium'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
