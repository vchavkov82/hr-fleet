import { SITE } from '../../lib/config'

export const dynamic = 'force-static'

export async function GET() {
  const base = SITE.website.replace(/\/$/, '')

  const content = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
