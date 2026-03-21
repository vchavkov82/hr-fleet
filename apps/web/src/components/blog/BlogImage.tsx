'use client'

import Image from 'next/image'
import { useState } from 'react'

type BlogImageProps = {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  aspectClass?: string
}

/**
 * Renders a blog image with a gradient placeholder fallback when the image
 * fails to load (e.g. external URL unreachable).
 */
export function BlogImage({ src, alt, className = '', loading = 'lazy', aspectClass }: BlogImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-50 via-white to-purple-50 ${aspectClass ?? 'aspect-video'} ${className}`}
        aria-label={alt}
      />
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
        className="object-cover"
        loading={loading}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
