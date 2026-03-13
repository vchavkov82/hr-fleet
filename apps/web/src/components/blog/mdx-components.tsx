import Link from 'next/link'
import type { ComponentProps } from 'react'

function normalizeInternalHref(href: string, locale: string) {
  if (href.startsWith('/posts/')) {
    return `/${locale}/blog/${href.slice('/posts/'.length)}`
  }
  if (href.startsWith('/blog/')) {
    return `/${locale}${href}`
  }
  return href
}

export function createMdxComponents(locale: string) {
  return {
    a: ({ href = '', children, ...rest }: ComponentProps<'a'>) => {
      if (typeof href === 'string' && (href.startsWith('/posts/') || href.startsWith('/blog/'))) {
        const normalized = normalizeInternalHref(href, locale)
        return (
          <Link href={normalized} {...(rest as Omit<ComponentProps<typeof Link>, 'href'>)}>
            {children}
          </Link>
        )
      }

      return (
        <a href={href} {...rest}>
          {children}
        </a>
      )
    },
  }
}
