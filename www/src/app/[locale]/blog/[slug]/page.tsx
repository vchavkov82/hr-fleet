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

  const authorInitials = post.data.author?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'HR'

  return (
    <div>
      {/* Article Header */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>

          <div className="mb-6">
            {(post.data.tags || []).length > 0 && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                {post.data.tags[0]}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {post.data.title}
            </h1>
            {post.data.description && (
              <p className="text-lg text-gray-600">{post.data.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 py-6 border-y border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {authorInitials}
              </div>
              <div>
                <p className="font-medium text-gray-900">{post.data.author || 'HR Team'}</p>
                <p className="text-sm text-gray-600">
                  {post.readTimeMinutes} {t('readTime')}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {formatDate(post.data.pubDatetime, locale)}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-lg prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
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

        {/* Tags */}
        {(post.data.tags || []).length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-3 flex-wrap">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {post.data.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Previous/Next */}
        {(prevPost || nextPost) && (
          <nav className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {prevPost && (
              <Link
                href={`/${locale}/blog/${prevPost.slug}`}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Previous</span>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{prevPost.data.title}</div>
                </div>
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/${locale}/blog/${nextPost.slug}`}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group text-right sm:col-start-2 justify-end"
              >
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Next</span>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{nextPost.data.title}</div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
