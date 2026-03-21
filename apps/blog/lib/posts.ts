import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const POSTS_DIR = path.join(process.cwd(), 'content/blog')

export type Post = {
  slug: string
  title: string
  description: string
  pubDatetime: string
  modDatetime?: string
  tags: string[]
  featured: boolean
  draft: boolean
  ogImage?: string
  featuredImage?: string
  author: string
  readingTime: string
  content: string
}

export function getAllPosts(): Post[] {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))

  return files
    .map(filename => {
      const slug = filename.replace(/\.mdx?$/, '')
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8')
      const { data, content } = matter(raw)

      return {
        slug,
        title: data.title ?? '',
        description: data.description ?? '',
        pubDatetime: data.pubDatetime
          ? new Date(data.pubDatetime).toISOString()
          : '',
        modDatetime: data.modDatetime
          ? new Date(data.modDatetime).toISOString()
          : undefined,
        tags: data.tags ?? [],
        featured: data.featured ?? false,
        draft: data.draft ?? false,
        ogImage: data.ogImage,
        featuredImage: data.featuredImage,
        author: data.author ?? 'HR Team',
        readingTime: readingTime(content).text,
        content,
      }
    })
    .filter(p => !p.draft)
    .sort(
      (a, b) =>
        new Date(b.modDatetime ?? b.pubDatetime).getTime() -
        new Date(a.modDatetime ?? a.pubDatetime).getTime()
    )
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find(p => p.slug === slug)
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  return [...new Set(posts.flatMap(p => p.tags))].sort()
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter(p => p.tags.includes(tag))
}
