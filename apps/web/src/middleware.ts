import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

/** Paths under /dashboard require an auth token cookie. */
const PROTECTED_PREFIX = '/dashboard'

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix to check route (e.g. /en/dashboard -> /dashboard)
  const localePattern = /^\/(en|bg)(\/|$)/
  const match = pathname.match(localePattern)
  const pathWithoutLocale = match ? pathname.slice(match[1].length + 1) : pathname

  if (pathWithoutLocale.startsWith(PROTECTED_PREFIX)) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      const locale = match?.[1] || 'en'
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|api|favicon\\.ico|.*\\..*).*)'],
}
