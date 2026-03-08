/**
 * Pure calculation functions for Bulgarian salary and EOOD comparison.
 *
 * All functions are pure (no side effects) and independently testable.
 * Used by both the salary calculator and the freelancer comparison tool.
 */
import { BG_TAX_2026, BG_EOOD_2026 } from './bulgarian-tax'

// ─── Currency Conversion ────────────────────────────────────────────────────

/** Fixed BGN/EUR exchange rate (1 EUR = 1.95583 BGN) */
export const BGN_EUR_RATE = 1.95583

/** Convert BGN amount to EUR */
export function bgnToEur(bgn: number): number {
  return bgn / BGN_EUR_RATE
}

/** Convert EUR amount to BGN */
export function eurToBgn(eur: number): number {
  return eur * BGN_EUR_RATE
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmploymentResult {
  gross: number
  insurable: number
  empPension: number
  empIllness: number
  empUnemployment: number
  empHealth: number
  empUniversal: number
  totalEmployeeDeductions: number
  taxableIncome: number
  incomeTax: number
  netSalary: number
  erPension: number
  erIllness: number
  erUnemployment: number
  erAccident: number
  erHealth: number
  erUniversal: number
  totalEmployerContributions: number
  totalEmployerCost: number
}

export interface EoodOptions {
  bornAfter1960: boolean
  includeIllnessMaternity: boolean
  overhead: {
    accountantFee: number
    bankFees: number
    adminTime: number
    registrationAmortized: number
  }
}

export interface EoodResult {
  monthlyRevenue: number
  insuranceBase: number
  monthlyInsurance: number
  totalOverhead: number
  overheadBreakdown: EoodOptions['overhead']
  taxableProfit: number
  corporateTax: number
  afterTaxProfit: number
  dividendTax: number
  netToOwner: number
  effectiveTaxRate: number
}

export interface SavingsResult {
  monthlySavings: number
  annualSavings: number
  vacationValueMonthly: number
  vacationValueAnnual: number
  totalMonthlySavings: number
  totalAnnualSavings: number
}

// ─── Employment Calculation ──────────────────────────────────────────────────

/**
 * Compute net salary from gross for a Bulgarian employment contract.
 *
 * Extracted verbatim from salary-calculator.tsx to ensure identical results.
 * Category III workers, standard 60/40 employer/employee split.
 */
export function computeNetFromGross(
  gross: number,
  bornAfter1960: boolean,
): EmploymentResult {
  const ss = BG_TAX_2026.SOCIAL_SECURITY
  const h = BG_TAX_2026.HEALTH
  const up = BG_TAX_2026.UNIVERSAL_PENSION

  // Insurable income is clamped between min and max
  const insurable = Math.min(
    Math.max(gross, BG_TAX_2026.MIN_INSURABLE_INCOME),
    BG_TAX_2026.MAX_INSURABLE_INCOME,
  )

  // Employee deductions (on insurable income)
  const empPension = insurable * ss.PENSION_EMPLOYEE
  const empIllness = insurable * ss.ILLNESS_MATERNITY_EMPLOYEE
  const empUnemployment = insurable * ss.UNEMPLOYMENT_EMPLOYEE
  const empHealth = insurable * h.EMPLOYEE
  const empUniversal = bornAfter1960 ? insurable * up.EMPLOYEE : 0

  const totalEmployeeDeductions =
    empPension + empIllness + empUnemployment + empHealth + empUniversal

  // Taxable income and tax
  const taxableIncome = gross - totalEmployeeDeductions
  const incomeTax = Math.max(taxableIncome, 0) * BG_TAX_2026.INCOME_TAX_RATE

  // Net salary
  const netSalary = gross - totalEmployeeDeductions - incomeTax

  // Employer contributions (on insurable income)
  const erPension = insurable * ss.PENSION_EMPLOYER
  const erIllness = insurable * ss.ILLNESS_MATERNITY_EMPLOYER
  const erUnemployment = insurable * ss.UNEMPLOYMENT_EMPLOYER
  const erAccident = insurable * ss.ACCIDENT_EMPLOYER
  const erHealth = insurable * h.EMPLOYER
  const erUniversal = bornAfter1960 ? insurable * up.EMPLOYER : 0

  const totalEmployerContributions =
    erPension + erIllness + erUnemployment + erAccident + erHealth + erUniversal

  const totalEmployerCost = gross + totalEmployerContributions

  return {
    gross,
    insurable,
    empPension,
    empIllness,
    empUnemployment,
    empHealth,
    empUniversal,
    totalEmployeeDeductions,
    taxableIncome: Math.max(taxableIncome, 0),
    incomeTax,
    netSalary,
    erPension,
    erIllness,
    erUnemployment,
    erAccident,
    erHealth,
    erUniversal,
    totalEmployerContributions,
    totalEmployerCost,
  }
}

// ─── EOOD Calculation ────────────────────────────────────────────────────────

/**
 * Compute net income for an EOOD owner-manager.
 *
 * Models the most common optimization: self-insure on minimum base (1,077 BGN),
 * pay corporate tax on profit, then dividend tax on after-tax profit.
 *
 * Calculation order:
 * revenue -> self-insurance (on minimum 1077 BGN) -> subtract overhead
 * -> taxable profit -> corporate tax 10% -> after-tax profit
 * -> dividend tax 10% -> net to owner
 */
export function computeEoodNet(
  monthlyRevenue: number,
  options: EoodOptions,
): EoodResult {
  const { includeIllnessMaternity, overhead } = options
  const eood = BG_EOOD_2026

  // 1. Self-insurance contributions (on minimum base, NOT on revenue)
  const insuranceBase = eood.MIN_SELF_INSURANCE_INCOME
  const insuranceRate = includeIllnessMaternity
    ? eood.SELF_INSURANCE.TOTAL_AFTER_1959_WITH_SICK
    : eood.SELF_INSURANCE.TOTAL_AFTER_1959_NO_SICK
  const monthlyInsurance = insuranceBase * insuranceRate

  // 2. Total overhead
  const totalOverhead =
    overhead.accountantFee +
    overhead.bankFees +
    overhead.adminTime +
    overhead.registrationAmortized

  // 3. Taxable profit (revenue - insurance - overhead), clamped to 0
  const taxableProfit = Math.max(
    0,
    monthlyRevenue - monthlyInsurance - totalOverhead,
  )

  // 4. Corporate tax (10%)
  const corporateTax = taxableProfit * eood.CORPORATE_TAX_RATE

  // 5. After-tax profit
  const afterTaxProfit = taxableProfit - corporateTax

  // 6. Dividend tax (10% on after-tax profit)
  const dividendTax = afterTaxProfit * eood.DIVIDEND_TAX_RATE

  // 7. Net to owner
  const netToOwner = afterTaxProfit - dividendTax

  // 8. Effective tax rate (1 - net/revenue)
  const effectiveTaxRate =
    monthlyRevenue > 0 ? 1 - netToOwner / monthlyRevenue : 0

  return {
    monthlyRevenue,
    insuranceBase,
    monthlyInsurance,
    totalOverhead,
    overheadBreakdown: overhead,
    taxableProfit,
    corporateTax,
    afterTaxProfit,
    dividendTax,
    netToOwner,
    effectiveTaxRate,
  }
}

// ─── Savings Calculation ─────────────────────────────────────────────────────

/**
 * Compute savings when choosing employment over EOOD.
 *
 * @param employmentNet - Monthly net salary from employment
 * @param eoodNet - Monthly net income from EOOD
 * @param vacationDays - Annual paid vacation days (minimum 20)
 * @param dailySalary - Daily salary rate for vacation value calculation
 */
export function computeSavings(
  employmentNet: number,
  eoodNet: number,
  vacationDays: number,
  dailySalary: number,
): SavingsResult {
  const monthlySavings = employmentNet - eoodNet
  const vacationValueMonthly = (vacationDays * dailySalary) / 12
  const totalMonthlySavings = monthlySavings + vacationValueMonthly

  return {
    monthlySavings,
    annualSavings: monthlySavings * 12,
    vacationValueMonthly,
    vacationValueAnnual: vacationValueMonthly * 12,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute effective tax rate for employment (1 - netSalary / totalEmployerCost).
 */
export function computeEmploymentEffectiveTaxRate(
  result: EmploymentResult,
): number {
  return result.totalEmployerCost > 0
    ? 1 - result.netSalary / result.totalEmployerCost
    : 0
}
