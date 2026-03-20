/**
 * Base URL for browser calls to the Go API (scheme + host + optional port).
 * Must not include `/api/v1` — request paths append that segment.
 */
export function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || ''
  return raw.replace(/\/api\/v1\/?$/, '')
}
