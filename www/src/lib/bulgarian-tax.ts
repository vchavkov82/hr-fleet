/**
 * Bulgarian Tax and Social Security Constants for 2026
 *
 * Sources:
 * - PWC Tax Summaries Bulgaria 2026 (https://taxsummaries.pwc.com/bulgaria/individual/other-taxes)
 * - Bulgarian Ministry of Economy (https://www.mi.government.bg/en/general/vaznagrajdeniya-i-osigurovki/)
 * - Eurofast Bulgaria minimum wage 2026 (https://eurofast.eu/bulgaria-to-increase-its-minimum-wage-from-2026/)
 * - BTA maximum insurable income 2026 (https://www.bta.bg/en/news/bulgaria/1036420)
 *
 * All rates are for Category III workers (most common for office/IT workers).
 * Employer/employee split follows the standard 60/40 ratio.
 */

export const BG_TAX_2026 = {
  /** Personal income tax (flat rate) */
  INCOME_TAX_RATE: 0.10,

  /**
   * Social security contributions
   * Split ratio: employer ~60% / employee ~40% for most contributions
   * Category III — most common for office workers
   */
  SOCIAL_SECURITY: {
    /** Pension (Category III workers) */
    PENSION_TOTAL: 0.148,
    PENSION_EMPLOYER: 0.0888,
    PENSION_EMPLOYEE: 0.0592,

    /** General illness and maternity */
    ILLNESS_MATERNITY_TOTAL: 0.035,
    ILLNESS_MATERNITY_EMPLOYER: 0.021,
    ILLNESS_MATERNITY_EMPLOYEE: 0.014,

    /** Unemployment */
    UNEMPLOYMENT_TOTAL: 0.01,
    UNEMPLOYMENT_EMPLOYER: 0.006,
    UNEMPLOYMENT_EMPLOYEE: 0.004,

    /** Accident at work (employer only, 0.4%-1.1%, using 0.5% for office/low-risk) */
    ACCIDENT_EMPLOYER: 0.005,
  },

  /** Health insurance: 8% total */
  HEALTH: {
    TOTAL: 0.08,
    EMPLOYER: 0.048,
    EMPLOYEE: 0.032,
  },

  /** Additional mandatory pension (universal, born after Dec 31, 1959) */
  UNIVERSAL_PENSION: {
    TOTAL: 0.05,
    EMPLOYER: 0.028,
    EMPLOYEE: 0.022,
  },

  /** Minimum insurable income (BGN per month, 2026) — minimum wage */
  MIN_INSURABLE_INCOME: 1213,

  /** Maximum insurable income (BGN per month, 2026) — social security ceiling */
  MAX_INSURABLE_INCOME: 3850,

  /** Summary: total employer contribution rate (Category III, born after 1960, average risk) */
  TOTAL_EMPLOYER_RATE: 0.1892,

  /** Summary: total employee contribution rate (Category III, born after 1960) */
  TOTAL_EMPLOYEE_RATE: 0.1378,

  /** Minimum annual paid leave (working days) */
  MINIMUM_ANNUAL_LEAVE_DAYS: 20,

  /** Approximate number of public holidays per year */
  PUBLIC_HOLIDAYS_PER_YEAR: 15,
} as const
