import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTags, getPostsByTag } from '../../lib/posts'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'Тагове',
  description: 'Разгледайте статиите по тема.',
}

export default function TagsPage() {
  const tags = getAllTags()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Тагове</h1>
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => {
            const count = getPostsByTag(tag).length
            return (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors"
              >
                <span>#{tag}</span>
                <span className="text-xs text-gray-400">({count})</span>
              </Link>
            )
          })}
        </div>
      </main>
      <Footer />
    </>
  )
}
