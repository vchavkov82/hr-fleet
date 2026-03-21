import nextConfig from '@hr/eslint-config/next'

const config = [
  ...nextConfig,
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'dist/**', 'scripts/**', 'next-env.d.ts', '*.py'] },
]

export default config
