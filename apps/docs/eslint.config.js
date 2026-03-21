import nextConfig from '@hr/eslint-config/next'

export default [
  ...nextConfig,
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },
]
