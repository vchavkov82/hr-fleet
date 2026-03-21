import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Страницата не е намерена.</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          &larr; Към началото
        </Link>
      </main>
      <Footer />
    </>
  )
}
