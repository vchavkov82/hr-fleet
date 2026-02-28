import type { Config } from 'tailwindcss'

const colors = {
  primary: {
    DEFAULT: '#1B4DDB',
    light: '#3B6EF0',
    dark: '#133AAB',
    50: '#EEF2FF',
    100: '#DBE4FE',
    200: '#BCC8FC',
    500: '#1B4DDB',
    600: '#133AAB',
    700: '#0E2E80',
    900: '#0A1F5C',
  },
  accent: {
    DEFAULT: '#0EA5E9',
    light: '#38BDF8',
    dark: '#0284C7',
  },
  navy: {
    DEFAULT: '#0F172A',
    light: '#1E293B',
    dark: '#020617',
    deep: '#030B24',
  },
  success: '#059669',
  warning: '#D97706',
  surface: {
    light: '#F0F4FE',
    lighter: '#F8FAFC',
  },
  'light-blue': '#F0F4FE',
}

const backgroundImage = {
  'hero-gradient': 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)',
  'brand-gradient': 'linear-gradient(135deg, #1B4DDB 0%, #3B6EF0 100%)',
  'dark-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
  'cta-gradient': 'linear-gradient(135deg, #1B4DDB 0%, #0E2E80 100%)',
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
    '../../www/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../blog/src/**/*.{js,ts,jsx,tsx,astro,md}',
    '../../docs/src/**/*.{js,ts,jsx,tsx,astro,md}',
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
