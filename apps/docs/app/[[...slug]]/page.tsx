import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import { getAllDocs, getDoc } from '@/lib/docs'
import { TableOfContents } from '@/components/TableOfContents'

type Params = { slug?: string[] }

export async function generateStaticParams() {
  const docs = getAllDocs()
  return docs.map(doc => ({
    slug: doc.slug.length ? doc.slug : undefined,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug = [] } = await params
  const doc = getDoc(slug)
  if (!doc) return {}
  return {
    title: doc.frontmatter.title as string | undefined,
    description: doc.frontmatter.description as string | undefined,
  }
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug = [] } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()

  return (
    <div className="flex gap-8 px-8 py-10 max-w-screen-xl mx-auto">
      <article className="flex-1 min-w-0 prose prose-neutral max-w-none prose-headings:scroll-mt-20 prose-a:text-hr-primary prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none">
        <MDXRemote
          source={doc.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypePrettyCode, { theme: { dark: 'one-dark-pro', light: 'github-light' } }],
              ],
            },
          }}
        />
      </article>
      <aside className="hidden xl:block w-64 shrink-0">
        <TableOfContents source={doc.content} />
      </aside>
    </div>
  )
}
