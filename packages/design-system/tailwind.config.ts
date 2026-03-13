import type { Config } from 'tailwindcss'

const colors = {
  primary: {
    DEFAULT: 'var(--color-primary)',
    light: 'var(--color-primary-light)',
    dark: 'var(--color-primary-dark)',
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    200: 'var(--color-primary-200)',
    500: 'var(--color-primary-500)',
    600: 'var(--color-primary-600)',
    700: 'var(--color-primary-700)',
    900: 'var(--color-primary-900)',
  },
  accent: {
    DEFAULT: 'var(--color-accent)',
    light: 'var(--color-accent-light)',
    dark: 'var(--color-accent-dark)',
  },
  navy: {
    DEFAULT: 'var(--color-navy)',
    light: 'var(--color-navy-light)',
    dark: 'var(--color-navy-dark)',
    deep: 'var(--color-navy-deep)',
  },
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
  surface: {
    DEFAULT: 'var(--color-surface)',
    light: 'var(--color-surface-light)',
    lighter: 'var(--color-surface-lighter)',
  },
  background: 'var(--color-background)',
  foreground: 'var(--color-foreground)',
  muted: 'var(--color-muted)',
  border: 'var(--color-border)',
  'light-blue': 'var(--color-surface-light)',
  gray: {
    50: 'var(--color-gray-50)',
    100: 'var(--color-gray-100)',
    200: 'var(--color-gray-200)',
    300: 'var(--color-gray-300)',
    400: 'var(--color-gray-400)',
    500: 'var(--color-gray-500)',
    600: 'var(--color-gray-600)',
    700: 'var(--color-gray-700)',
    800: 'var(--color-gray-800)',
    900: 'var(--color-gray-900)',
  },
}

const backgroundImage = {
  'hero-gradient': 'linear-gradient(180deg, var(--color-primary-50) 0%, var(--color-background) 100%)',
  'brand-gradient': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
  'dark-gradient': 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%)',
  'cta-gradient': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-700) 100%)',
}

const fontFamily = {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  heading: ['var(--font-mulish)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
}

export const designTokens = {
  colors,
  backgroundImage,
  fontFamily,
}

export default {
  content: [
    '../../apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../apps/blog/src/**/*.{js,ts,jsx,tsx,astro,md}',
    '../../apps/docs/src/**/*.{js,ts,jsx,tsx,astro,md}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors,
      backgroundImage,
      fontFamily,
      fontWeight: {
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
} as Config
