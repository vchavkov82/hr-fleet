'use client'
// CRITICAL: 'use client' must be first line — Next.js App Router serializes
// the loaderFile function to pass to client components. Without this directive,
// the build fails with "Function cannot be passed directly to Client Component props."
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/images#cloudflare

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Pass through data URIs and already-transformed URLs
  if (src.startsWith('data:') || src.includes('/cdn-cgi/image/')) return src;
  const params = [`width=${width}`, `quality=${quality ?? 75}`, 'format=auto'];
  // Use relative /cdn-cgi/image/ path — works on same domain behind CF proxy
  return `/cdn-cgi/image/${params.join(',')}/${src}`;
}
