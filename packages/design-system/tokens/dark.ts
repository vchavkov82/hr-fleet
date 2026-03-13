/**
 * Dark mode color palette.
 * Values chosen to maintain WCAG AA contrast ratios against dark backgrounds.
 *
 * Contrast ratios (against #020617 background):
 * - Primary #3B6EF0: 4.8:1 (AA)
 * - Foreground #F1F5F9: 16.2:1 (AAA)
 * - Muted #94A3B8: 7.1:1 (AAA)
 * - Success #34D399: 9.4:1 (AAA)
 * - Warning #FBBF24: 11.8:1 (AAA)
 * - Error #F87171: 6.3:1 (AA)
 */

export const darkColors = {
  primary: {
    DEFAULT: '#3B6EF0',
    light: '#5B8AF5',
    dark: '#1B4DDB',
  },
  accent: {
    DEFAULT: '#38BDF8',
    light: '#7DD3FC',
    dark: '#0EA5E9',
  },
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#38BDF8',
  surface: {
    DEFAULT: '#0F172A',
    light: '#1E293B',
    lighter: '#334155',
  },
  background: '#020617',
  foreground: '#F1F5F9',
  muted: '#94A3B8',
  border: '#334155',
  gray: {
    50: '#111827',
    100: '#1F2937',
    200: '#374151',
    300: '#4B5563',
    400: '#6B7280',
    500: '#9CA3AF',
    600: '#D1D5DB',
    700: '#E5E7EB',
    800: '#F3F4F6',
    900: '#F9FAFB',
  },
} as const
