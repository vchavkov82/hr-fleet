import BundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: resolve(__dirname, '../..'),
  poweredByHeader: false,
  reactStrictMode: true,
  generateEtags: false,
  eslint: { ignoreDuringBuilds: true },
  // Type checking runs as a separate turbo task (typecheck) for better parallelism
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['remark-gfm'],
  allowedDevOrigins: ['hr.svc.chavkov.com', 'suse-06.lan.assistance.bg', 'suse-09.lan.assistance.bg'],

  // CDN asset prefix only in production; in dev this can cause stale chunk/runtime mismatches.
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_CDN_URL || undefined : undefined,

  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudflare-image-loader.ts',
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_URL || 'http://localhost:5080'}/api/v1/:path*`,
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:locale/home',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: 'https://blog.jobshr.com/:path*',
        permanent: true,
      },
      {
        source: '/docs/:path*',
        destination: 'https://docs.jobshr.com/:path*',
        permanent: true,
      },
    ]
  },

  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return []
    }

    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, immutable',
          },
        ],
      },
    ]
  },

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      if (!isServer) {
        // In dev mode next-intl's BaseLink resolves next/link to the Pages Router
        // implementation (next/dist/client/link) because its node_modules files
        // don't get the appPagesBrowser webpack layer alias applied. That Pages
        // Router link transitively requires is-dynamic.js which is absent from
        // the App Router client bundle → runtime TypeError.
        // Fix: alias the Pages Router link entry points to the App Router version.
        const nextPkg = new URL(import.meta.resolve('next/package.json')).pathname
        const nextRoot = nextPkg.replace(/\/package\.json$/, '')
        config.resolve.alias['next/dist/api/link'] = `${nextRoot}/dist/client/app-dir/link.js`
        config.resolve.alias['next/dist/client/link'] = `${nextRoot}/dist/client/app-dir/link.js`
      }
    }

    // Speed up module resolution
    config.resolve.symlinks = false

    return config
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
