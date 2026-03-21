'use client'
// CRITICAL: 'use client' must be first line — Next.js App Router serializes
// the loaderFile function to pass to client components. Without this directive,
// the build fails with "Function cannot be passed directly to Client Component props."
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/images#cloudflare

import { resolveImageLoaderUrl } from '@/lib/image-utils'

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return resolveImageLoaderUrl(src, width, quality ?? 75)
}
