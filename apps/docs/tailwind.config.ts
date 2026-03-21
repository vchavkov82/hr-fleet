import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'hr-primary': '#1B4DDB',
        'hr-primary-soft': '#EEF2FF',
        'gray-neutral': {
          100: '#E1E3EB',
          400: '#707385',
          600: '#4B4E5C',
          800: '#030B24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
}

export default config
