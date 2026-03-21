import { getAllPosts, getAllTags } from '../../lib/posts'
import { SITE } from '../../lib/config'

export const dynamic = 'force-static'

export async function GET() {
  const base = SITE.website.replace(/\/$/, '')
  const posts = getAllPosts()
  const tags = getAllTags()

  const staticUrls = [
    { url: base, priority: '1.0', changefreq: 'daily' },
    { url: `${base}/blog`, priority: '0.9', changefreq: 'daily' },
    { url: `${base}/tags`, priority: '0.7', changefreq: 'weekly' },
  ]

  const postUrls = posts.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastmod: (post.modDatetime ?? post.pubDatetime).split('T')[0],
    priority: '0.8',
    changefreq: 'monthly',
  }))

  const tagUrls = tags.map(tag => ({
    url: `${base}/tags/${tag}`,
    priority: '0.6',
    changefreq: 'weekly',
  }))

  const allUrls = [...staticUrls, ...postUrls, ...tagUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    entry => `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
