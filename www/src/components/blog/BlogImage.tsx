'use client'

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
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
