// No 'use client' — importable from server AND client components
type ImagePreset = 'thumbnail' | 'card' | 'hero' | 'avatar';

const PRESETS: Record<ImagePreset, { width: number; height?: number; quality: number }> = {
  thumbnail: { width: 64,   height: 64,  quality: 75 },
  card:      { width: 400,              quality: 80 },
  hero:      { width: 1200,             quality: 85 },
  avatar:    { width: 128,  height: 128, quality: 80 },
};

interface CFImageOptions {
  width?: number;
  height?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg';
  quality?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop';
  blur?: number; // 1-250
  preset?: ImagePreset;
}

export function buildCloudflareImageUrl(src: string, options: CFImageOptions = {}): string {
  if (!src || src.startsWith('data:') || src.includes('/cdn-cgi/image/')) return src;
  const opts = options.preset ? { ...PRESETS[options.preset], ...options } : options;
  const params: string[] = [];
  if (opts.width)  params.push(`width=${opts.width}`);
  if (opts.height) params.push(`height=${opts.height}`);
  if (opts.fit)    params.push(`fit=${opts.fit}`);
  if (opts.blur)   params.push(`blur=${opts.blur}`);
  params.push(`quality=${opts.quality ?? 75}`);
  params.push(`format=${opts.format ?? 'auto'}`);
  return `/cdn-cgi/image/${params.join(',')}/${src}`;
}

export function buildBlurPlaceholderUrl(src: string): string {
  return buildCloudflareImageUrl(src, { width: 10, quality: 10, format: 'webp', blur: 20 });
}

// Static inline SVG placeholder — use for listing page cards to avoid per-card fetch
// Prevents CLS: always present, zero additional network requests
export const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==';
