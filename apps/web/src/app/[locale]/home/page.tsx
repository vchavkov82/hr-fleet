'use client'

import { useEffect } from 'react'
import { useRouter } from '@/navigation'
import { useParams } from 'next/navigation'

/**
 * Redirect page - sends users to the new blog homepage
 * The blog now serves as the main homepage with integrated marketing content
 */
export default function HomePage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string || 'en'

  useEffect(() => {
    // Redirect to blog homepage which now serves as the main landing page
    router.push(`/${locale || 'en'}`)
  }, [router, locale])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">Redirecting...</h1>
        <p className="text-gray-600">Taking you to our new homepage...</p>
      </div>
    </div>
  )
}
