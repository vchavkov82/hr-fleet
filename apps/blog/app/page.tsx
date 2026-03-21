import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '../lib/posts'
import { SITE } from '../lib/config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PostCard from '../components/PostCard'

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.desc,
}

export default function HomePage() {
  const allPosts = getAllPosts()
  const featuredPosts = allPosts.filter(p => p.featured)
  const recentPosts = allPosts.filter(p => !p.featured).slice(0, SITE.postPerIndex)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{SITE.title}</h1>
          <p className="text-lg text-gray-600">{SITE.desc}</p>
        </section>

        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Избрани статии</h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {featuredPosts.map(post => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Последни статии</h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Всички статии &rarr;
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {recentPosts.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
