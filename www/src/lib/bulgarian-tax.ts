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

/**
 * EOOD/OOD (Limited Company) Tax Constants for 2026
 *
 * Used for freelancer vs employment comparison calculator.
 * Assumes owner self-insures on minimum income and extracts profit as dividends.
 *
 * Sources:
 * - PWC Bulgaria Corporate Withholding Taxes (https://taxsummaries.pwc.com/bulgaria/corporate/withholding-taxes)
 * - T8G Consulting - Dividend Tax Increase (https://t8gconsulting.com/en/increase-of-the-dividend-tax-in-bulgaria-from-5-to-10/)
 * - Ruskov & Kollegen - Self-Insured Persons (https://ruskov-law.eu/bulgaria/article/social-security-contributions-self-insured-persons.html)
 * - KiK-Info Contribution Rates (https://kik-info.com/spravochnik/osigurovki-i-danaci/)
 */
export const BG_EOOD_2026 = {
  /** Corporate income tax rate */
  CORPORATE_TAX_RATE: 0.10,

  /** Dividend withholding tax (increased from 5% to 10% in 2026) */
  DIVIDEND_TAX_RATE: 0.10,

  /**
   * Self-insured person contribution rates (managing director / owner)
   * Self-insured persons pay 100% of contributions themselves (no employer/employee split)
   */
  SELF_INSURANCE: {
    /** Pension — born after 31.12.1959 (14.8%) or born before (19.8%) */
    PENSION_AFTER_1959: 0.148,
    PENSION_BEFORE_1960: 0.198,

    /** Universal pension fund (born after 31.12.1959 only) */
    UNIVERSAL_PENSION: 0.05,

    /** General illness and maternity (optional but recommended) */
    ILLNESS_MATERNITY: 0.035,

    /** Health insurance */
    HEALTH: 0.08,

    /** Total rate — born after 1959, with illness/maternity */
    TOTAL_AFTER_1959_WITH_SICK: 0.313,

    /** Total rate — born after 1959, without illness/maternity */
    TOTAL_AFTER_1959_NO_SICK: 0.278,
  },

  /** Minimum self-insurance income base (BGN/month, April 2025+) */
  MIN_SELF_INSURANCE_INCOME: 1077,

  /** Maximum self-insurance income base (BGN/month, 2026) */
  MAX_SELF_INSURANCE_INCOME: 4130,

  /**
   * Typical monthly overhead costs (BGN)
   * Used as defaults in the comparison calculator — user can adjust
   */
  OVERHEAD: {
    /** Monthly accountant fee (average, BGN) */
    ACCOUNTANT_FEE: 294,

    /** Monthly bank account maintenance (BGN) */
    BANK_FEES: 25,

    /** Company registration amortized over 5 years (BGN/month) */
    REGISTRATION_AMORTIZED: 40,

    /** Estimated admin time cost — 3 hours/month at average rate (BGN) */
    ADMIN_TIME: 150,
  },
} as const
