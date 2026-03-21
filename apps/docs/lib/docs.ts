import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_DIR = path.join(process.cwd(), 'content/docs')

export type DocMeta = {
  slug: string[]
  title: string
  description?: string
  sidebar?: { order?: number; label?: string }
  draft?: boolean
}

export function getAllDocs(): DocMeta[] {
  return walkDir(DOCS_DIR, [])
}

function walkDir(dir: string, prefix: string[]): DocMeta[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const results: DocMeta[] = []
  for (const entry of entries) {
    if (entry.isDirectory()) {
      results.push(...walkDir(path.join(dir, entry.name), [...prefix, entry.name]))
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      const name = entry.name.replace(/\.mdx?$/, '')
      const slug = name === 'index' ? prefix : [...prefix, name]
      const raw = fs.readFileSync(path.join(dir, entry.name), 'utf-8')
      const { data } = matter(raw)
      results.push({
        slug,
        title: (data.title as string) ?? name,
        description: data.description as string | undefined,
        sidebar: data.sidebar as DocMeta['sidebar'],
        draft: data.draft as boolean | undefined,
      })
    }
  }
  return results
}

export function getDoc(slug: string[]) {
  const tryPaths = [
    path.join(DOCS_DIR, ...slug) + '.mdx',
    path.join(DOCS_DIR, ...slug) + '.md',
    path.join(DOCS_DIR, ...slug, 'index.mdx'),
    path.join(DOCS_DIR, ...slug, 'index.md'),
  ]
  for (const p of tryPaths) {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf-8')
      const { data, content } = matter(raw)
      return { frontmatter: data as Record<string, unknown>, content }
    }
  }
  return null
}

export type SidebarSection = {
  title: string
  href: string
  order: number
  children: SidebarItem[]
}

export type SidebarItem = {
  title: string
  href: string
  order: number
}

const SECTION_LABELS: Record<string, string> = {
  'getting-started': 'Getting Started',
  features: 'Features',
  'core-concepts': 'Core Concepts',
  'sdk-guides': 'SDK & API Guides',
  'odoo-module': 'Odoo Integration',
  security: 'Security',
  faq: 'FAQ',
  'release-notes': 'Release Notes',
  bg: 'Български',
}

const SECTION_ORDER: Record<string, number> = {
  'getting-started': 1,
  features: 2,
  'core-concepts': 3,
  'sdk-guides': 4,
  'odoo-module': 5,
  security: 6,
  faq: 7,
  'release-notes': 8,
  bg: 9,
}

export function buildSidebar(): SidebarSection[] {
  const docs = getAllDocs()
  const grouped = new Map<string, DocMeta[]>()

  for (const doc of docs) {
    if (doc.draft) continue
    const section = doc.slug[0] ?? 'root'
    if (!grouped.has(section)) grouped.set(section, [])
    grouped.get(section)!.push(doc)
  }

  const result: SidebarSection[] = []
  for (const [section, items] of grouped) {
    items.sort((a, b) => (a.sidebar?.order ?? 99) - (b.sidebar?.order ?? 99))
    result.push({
      title: SECTION_LABELS[section] ?? section,
      href: `/docs/${section}`,
      order: SECTION_ORDER[section] ?? 99,
      children: items.map(item => ({
        title: item.sidebar?.label ?? item.title,
        href: item.slug.length ? `/docs/${item.slug.join('/')}` : '/docs',
        order: item.sidebar?.order ?? 99,
      })),
    })
  }

  result.sort((a, b) => a.order - b.order)
  return result
}
