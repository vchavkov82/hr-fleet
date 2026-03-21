import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllTags, getPostsByTag } from '../../../lib/posts'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import PostCard from '../../../components/PostCard'

type Props = {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  return getAllTags().map(tag => ({ tag }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `#${tag}`,
    description: `Статии с таг: ${tag}`,
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const posts = getPostsByTag(tag)
  if (!posts.length) notFound()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          #{tag}
        </h1>
        <p className="text-gray-500 mb-8">{posts.length} статии</p>
        <div className="grid gap-8 sm:grid-cols-2">
          {posts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
