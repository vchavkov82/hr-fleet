import nextConfig from '@hr/eslint-config/next'

const config = [
  ...nextConfig,
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts'] },
]

export default config
