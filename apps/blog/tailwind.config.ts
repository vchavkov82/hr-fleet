import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import { designTokens } from '@hr/design-system/tailwind'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      ...designTokens,
    },
  },
  plugins: [typography],
}

export default config
