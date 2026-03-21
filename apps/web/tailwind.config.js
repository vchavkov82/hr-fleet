const { colors, surface } = require('@hr/design-system/colors')
const { typography } = require('@hr/design-system/typography')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.primary.DEFAULT,
          light: colors.primary.light,
          dark: colors.primary.dark,
          50: colors.primary[50],
          100: colors.primary[100],
          200: colors.primary[200],
          500: colors.primary[500],
          600: colors.primary[600],
          700: colors.primary[700],
          900: colors.primary[900],
        },
        accent: {
          DEFAULT: colors.accent.DEFAULT,
          light: colors.accent.light,
          dark: colors.accent.dark,
        },
        navy: {
          DEFAULT: colors.navy.DEFAULT,
          light: colors.navy.light,
          dark: colors.navy.dark,
          deep: colors.navy.deep,
        },
        success: colors.success,
        warning: colors.warning,
        surface: {
          light: surface.light,
          lighter: surface.lighter,
        },
        'light-blue': colors['light-blue'],
      },
      backgroundImage: {
        'hero-gradient': `linear-gradient(180deg, ${colors.primary[50]} 0%, #FFFFFF 100%)`,
        'brand-gradient': `linear-gradient(135deg, ${colors.primary.DEFAULT} 0%, ${colors.primary.light} 100%)`,
        'dark-gradient': `linear-gradient(135deg, ${colors.navy.DEFAULT} 0%, ${colors.navy.light} 100%)`,
        'cta-gradient': `linear-gradient(135deg, ${colors.primary.DEFAULT} 0%, ${colors.primary[700]} 100%)`,
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        heading: typography.fontFamily.heading,
      },
      fontWeight: {
        extralight: typography.fontWeight.extralight,
        light: typography.fontWeight.light,
        normal: typography.fontWeight.normal,
        medium: typography.fontWeight.medium,
        semibold: typography.fontWeight.semibold,
        bold: typography.fontWeight.bold,
        extrabold: typography.fontWeight.extrabold,
        black: typography.fontWeight.black,
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
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
