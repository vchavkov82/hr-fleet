import { getAllPosts } from '../../lib/posts'
import { SITE } from '../../lib/config'

export const dynamic = 'force-static'

export async function GET() {
  const posts = getAllPosts()
  const base = SITE.website.replace(/\/$/, '')

  const items = posts
    .map(post => {
      const url = `${base}/blog/${post.slug}`
      const pubDate = new Date(post.pubDatetime).toUTCString()
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${post.tags.map(t => `<category><![CDATA[${t}]]></category>`).join('\n      ')}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${SITE.title}]]></title>
    <link>${base}</link>
    <description><![CDATA[${SITE.desc}]]></description>
    <language>${SITE.lang}</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
