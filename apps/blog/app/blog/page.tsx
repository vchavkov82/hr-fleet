import type { Metadata } from 'next'
import { getAllPosts } from '../../lib/posts'
import { SITE } from '../../lib/config'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import PostCard from '../../components/PostCard'
import Pagination from '../../components/Pagination'

export const metadata: Metadata = {
  title: 'Всички статии',
  description: SITE.desc,
}

const PER_PAGE = SITE.postPerPage

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const allPosts = getAllPosts()
  const totalPages = Math.ceil(allPosts.length / PER_PAGE)
  const posts = allPosts.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Всички статии</h1>
        <div className="grid gap-8 sm:grid-cols-2">
          {posts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/blog"
        />
      </main>
      <Footer />
    </>
  )
}
