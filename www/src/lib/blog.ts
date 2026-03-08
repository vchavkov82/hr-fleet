import { promises as fs } from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

function matter(source: string): { data: Record<string, unknown>; content: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: source }
  const data = (yaml.load(match[1]) as Record<string, unknown>) || {}
  return { data, content: match[2] }
}

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')
const BG_SUFFIX = '-bg'

export type BlogFrontmatter = {
  author: string
  pubDatetime: string
  modDatetime?: string | null
  title: string
  featured?: boolean
  draft?: boolean
  tags?: string[]
  ogImage?: string
  description: string
  canonicalURL?: string
  timezone?: string
}

export type BlogPost = {
  slug: string
  locale: string
  content: string
  data: BlogFrontmatter
  readTimeMinutes: number
  fileName: string
}

function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return ''
}

function getLocaleFromFileName(fileName: string) {
  const base = fileName.replace(/\.(md|mdx)$/, '')
  return base.endsWith(BG_SUFFIX) ? 'bg' : 'en'
}

function getSlugFromFileName(fileName: string) {
  const base = fileName.replace(/\.(md|mdx)$/, '')
  return base.endsWith(BG_SUFFIX) ? base.slice(0, -BG_SUFFIX.length) : base
}

function getReadTimeMinutes(content: string) {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

async function readPostFile(fileName: string): Promise<BlogPost> {
  const fullPath = path.join(BLOG_DIR, fileName)
  const source = await fs.readFile(fullPath, 'utf8')
  const { data, content } = matter(source)
  const locale = getLocaleFromFileName(fileName)
  const slug = getSlugFromFileName(fileName)

  const normalizedData: BlogFrontmatter = {
    author: (data.author as string) || 'HR Team',
    pubDatetime: normalizeDate(data.pubDatetime),
    modDatetime: normalizeDate(data.modDatetime) || null,
    title: (data.title as string) || slug,
    featured: Boolean(data.featured),
    draft: Boolean(data.draft),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    ogImage: typeof data.ogImage === 'string' ? data.ogImage : undefined,
    description: (data.description as string) || '',
    canonicalURL: typeof data.canonicalURL === 'string' ? data.canonicalURL : undefined,
    timezone: typeof data.timezone === 'string' ? data.timezone : undefined,
  }

  return {
    slug,
    locale,
    content,
    data: normalizedData,
    readTimeMinutes: getReadTimeMinutes(content),
    fileName,
  }
}

export async function getAllPosts(locale: string): Promise<BlogPost[]> {
  const entries = await fs.readdir(BLOG_DIR)
  const files = entries.filter((file) => /\.(md|mdx)$/.test(file))
  const posts = await Promise.all(files.map((file) => readPostFile(file)))

  return posts
    .filter((post) => post.locale === locale)
    .filter((post) => !post.data.draft)
    .sort((a, b) => {
      const aDate = new Date(a.data.modDatetime || a.data.pubDatetime).getTime()
      const bDate = new Date(b.data.modDatetime || b.data.pubDatetime).getTime()
      return bDate - aDate
    })
}

export async function getPostBySlug(locale: string, slug: string): Promise<BlogPost | null> {
  const candidates = [
    locale === 'bg' ? `${slug}${BG_SUFFIX}.md` : `${slug}.md`,
    locale === 'bg' ? `${slug}${BG_SUFFIX}.mdx` : `${slug}.mdx`,
  ]

  for (const fileName of candidates) {
    try {
      await fs.access(path.join(BLOG_DIR, fileName))
      return await readPostFile(fileName)
    } catch {
      continue
    }
  }

  return null
}

export async function getAllPostParams() {
  const entries = await fs.readdir(BLOG_DIR)
  const files = entries.filter((file) => /\.(md|mdx)$/.test(file))
  const posts = await Promise.all(files.map((file) => readPostFile(file)))

  return posts
    .filter((post) => !post.data.draft)
    .map((post) => ({ locale: post.locale, slug: post.slug }))
}
