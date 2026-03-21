// No 'use client' — importable from server AND client components

type ImagePreset = 'thumbnail' | 'card' | 'hero' | 'avatar';

const PRESETS: Record<ImagePreset, { width: number; height?: number; quality: number }> = {
  thumbnail: { width: 64, height: 64, quality: 75 },
  card: { width: 400, quality: 80 },
  hero: { width: 1200, quality: 85 },
  avatar: { width: 128, height: 128, quality: 80 },
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

/** Unsplash supports resizing via query params; avoid /cdn-cgi (often 404 when CF Image Resizing is off or external fetch is restricted). */
function buildUnsplashUrl(
  src: string,
  width: number,
  quality: number,
  extra?: { height?: number }
): string | null {
  try {
    const u = new URL(src);
    if (u.hostname !== 'images.unsplash.com') return null;
    u.searchParams.set('w', String(width));
    u.searchParams.set('q', String(quality));
    if (extra?.height) u.searchParams.set('h', String(extra.height));
    if (!u.searchParams.has('fit')) u.searchParams.set('fit', 'crop');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * next/image custom loader: same-origin assets use Cloudflare resizing; remote Unsplash uses Unsplash’s API (not /cdn-cgi).
 */
export function resolveImageLoaderUrl(src: string, width: number, quality: number): string {
  if (!src || src.startsWith('data:') || src.includes('/cdn-cgi/image/')) return src;

  if (src.startsWith('http://') || src.startsWith('https://')) {
    const unsplash = buildUnsplashUrl(src, width, quality);
    if (unsplash) return unsplash;
    // Other remote URLs: serve directly (same URL for all breakpoints; avoids CF 404)
    return src;
  }

  const params = [`width=${width}`, `quality=${quality}`, 'format=auto'];
  return `/cdn-cgi/image/${params.join(',')}/${src}`;
}

export function buildCloudflareImageUrl(src: string, options: CFImageOptions = {}): string {
  if (!src || src.startsWith('data:') || src.includes('/cdn-cgi/image/')) return src;
  const opts = options.preset ? { ...PRESETS[options.preset], ...options } : options;
  const width = opts.width ?? 800;
  const quality = opts.quality ?? 75;

  if (src.startsWith('http://') || src.startsWith('https://')) {
    const unsplash = buildUnsplashUrl(src, width, quality, { height: opts.height });
    if (unsplash) return unsplash;
    return src;
  }

  const params: string[] = [];
  if (opts.width) params.push(`width=${opts.width}`);
  if (opts.height) params.push(`height=${opts.height}`);
  if (opts.fit) params.push(`fit=${opts.fit}`);
  if (opts.blur) params.push(`blur=${opts.blur}`);
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
