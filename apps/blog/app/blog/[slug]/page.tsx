import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getAllPosts, getPostBySlug } from '../../../lib/posts'
import { SITE } from '../../../lib/config'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import TagList from '../../../components/TagList'
import dayjs from 'dayjs'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const ogImageUrl = `${SITE.website}blog/${slug}/og.png`

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.pubDatetime,
      modifiedTime: post.modDatetime,
      authors: [post.author],
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const idx = allPosts.findIndex(p => p.slug === slug)
  const prev = idx < allPosts.length - 1 ? allPosts[idx + 1] : null
  const next = idx > 0 ? allPosts[idx - 1] : null

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <article>
          <header className="mb-8">
            <TagList tags={post.tags} className="mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{post.description}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{post.author}</span>
              <span>&middot;</span>
              <time dateTime={post.pubDatetime}>
                {dayjs(post.pubDatetime).format('D MMMM YYYY')}
              </time>
              <span>&middot;</span>
              <span>{post.readingTime}</span>
            </div>
          </header>

          {post.featuredImage && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={960}
                height={540}
                className="w-full object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-gray prose-lg max-w-none">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </article>

        <nav className="mt-12 border-t border-gray-200 pt-8 grid grid-cols-2 gap-4">
          {prev && (
            <Link
              href={`/blog/${prev.slug}`}
              className="group flex flex-col gap-1"
            >
              <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                &larr; Предишна
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-2">
                {prev.title}
              </span>
            </Link>
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="group flex flex-col gap-1 col-start-2 text-right"
            >
              <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                Следваща &rarr;
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-2">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </main>
      <Footer />
    </>
  )
}
