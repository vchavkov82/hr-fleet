import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@hr/design-system'],
  serverExternalPackages: ['@resvg/resvg-js', 'sharp'],
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default config
