import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { createMdxComponents } from '@/components/blog/mdx-components'
import { getAllPostParams, getAllPosts, getPostBySlug } from '@/lib/blog'

export async function generateStaticParams() {
  return getAllPostParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(locale, slug)
  if (!post) return {}

  const t = await getTranslations({ locale, namespace: 'blog' })
  const title = `${post.data.title} | ${t('metaTitle')}`

  return {
    title,
    description: post.data.description,
    alternates: {
      canonical: post.data.canonicalURL,
    },
  }
}

function formatDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const formatLocale = locale === 'bg' ? 'bg-BG' : 'en-US'
  return new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long' }).format(date)
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await getPostBySlug(locale, slug)
  if (!post) notFound()

  const t = await getTranslations('blog')
  const posts = await getAllPosts(locale)
  const index = posts.findIndex((item) => item.slug === slug)
  const prevPost = index > 0 ? posts[index - 1] : null
  const nextPost = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null

  return (
    <div className="py-16">
      <div className="container-xl">
        <div className="mb-6">
          <Link href={`/${locale}/blog`} className="text-sm font-semibold text-primary hover:underline">
            {t('sectionLabel')}
          </Link>
        </div>

        <header className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-navy">
            {post.data.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{post.data.author}</span>
            <span aria-hidden="true">•</span>
            <span>{formatDate(post.data.pubDatetime, locale)}</span>
            <span aria-hidden="true">•</span>
            <span>
              {post.readTimeMinutes} {t('readTime')}
            </span>
          </div>
          {(post.data.tags || []).length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {(post.data.tags || []).map((tag) => (
                <li key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        <article className="prose prose-lg max-w-none mt-10">
          <MDXRemote
            source={post.content}
            components={createMdxComponents(locale)}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </article>

        {(prevPost || nextPost) && (
          <nav className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {prevPost && (
              <Link href={`/${locale}/blog/${prevPost.slug}`} className="group border border-gray-100 rounded-xl p-4 hover:border-primary/40">
                <span className="text-xs text-gray-500">Previous</span>
                <p className="text-sm font-semibold text-navy group-hover:text-primary mt-1">
                  {prevPost.data.title}
                </p>
              </Link>
            )}
            {nextPost && (
              <Link href={`/${locale}/blog/${nextPost.slug}`} className="group border border-gray-100 rounded-xl p-4 hover:border-primary/40 text-right sm:ml-auto">
                <span className="text-xs text-gray-500">Next</span>
                <p className="text-sm font-semibold text-navy group-hover:text-primary mt-1">
                  {nextPost.data.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
