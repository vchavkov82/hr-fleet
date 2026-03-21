import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  experimental: {
    mdxRs: false,
  },
}

export default config
