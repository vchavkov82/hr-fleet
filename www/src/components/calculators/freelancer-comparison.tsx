'use client'

import { useState, useMemo } from 'react'
import { BG_EOOD_2026 } from '@/lib/bulgarian-tax'
import {
  computeNetFromGross,
  computeEoodNet,
  computeSavings,
  computeEmploymentEffectiveTaxRate,
} from '@/lib/calculations'

const fmt = new Intl.NumberFormat('bg-BG', {
  style: 'currency',
  currency: 'BGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const pct = (n: number) => `${(n * 100).toFixed(1)}%`

interface FreelancerComparisonProps {
  labels: Record<string, string>
}

export default function FreelancerComparison({
  labels,
}: FreelancerComparisonProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [monthlyAmount, setMonthlyAmount] = useState(3000)
  const [bornAfter1960, setBornAfter1960] = useState(true)
  const [includeIllnessMaternity, setIncludeIllnessMaternity] = useState(true)
  const [includeVat, setIncludeVat] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)
  const [vacationDays, setVacationDays] = useState(20)
  const [accountantFee, setAccountantFee] = useState<number>(
    BG_EOOD_2026.OVERHEAD.ACCOUNTANT_FEE,
  )
  const [bankFees, setBankFees] = useState<number>(BG_EOOD_2026.OVERHEAD.BANK_FEES)
  const [adminTime, setAdminTime] = useState<number>(BG_EOOD_2026.OVERHEAD.ADMIN_TIME)
  const [registrationAmortized, setRegistrationAmortized] = useState<number>(
    BG_EOOD_2026.OVERHEAD.REGISTRATION_AMORTIZED,
  )
  const [showDeductions, setShowDeductions] = useState(false)

  // ── Calculations ───────────────────────────────────────────────────────────
  const eoodResult = useMemo(
    () =>
      computeEoodNet(Math.max(0, monthlyAmount || 0), {
        bornAfter1960,
        includeIllnessMaternity,
        overhead: { accountantFee, bankFees, adminTime, registrationAmortized },
      }),
    [
      monthlyAmount,
      bornAfter1960,
      includeIllnessMaternity,
      accountantFee,
      bankFees,
      adminTime,
      registrationAmortized,
    ],
  )

  const employmentResult = useMemo(
    () => computeNetFromGross(Math.max(0, monthlyAmount || 0), bornAfter1960),
    [monthlyAmount, bornAfter1960],
  )

  const dailySalary = (monthlyAmount || 0) / 21
  const savings = useMemo(
    () =>
      computeSavings(
        employmentResult.netSalary,
        eoodResult.netToOwner,
        Math.max(20, vacationDays || 20),
        dailySalary,
      ),
    [employmentResult.netSalary, eoodResult.netToOwner, vacationDays, dailySalary],
  )

  const employmentEffectiveTaxRate = computeEmploymentEffectiveTaxRate(employmentResult)
  const multiplier = isAnnual ? 12 : 1

  // VAT visual breakdown (pass-through, does not affect net)
  const vatAmount = includeVat ? (monthlyAmount || 0) * 0.2 : 0
  const invoiceWithVat = (monthlyAmount || 0) + vatAmount

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmtVal = (v: number) => fmt.format(v * multiplier)
  const periodLabel = isAnnual ? labels.perYear : labels.perMonth

  // ── Benefits rows ──────────────────────────────────────────────────────────
  const benefitsRows = [
    {
      label: labels.benefitPaidLeave,
      eood: false,
      eoodNote: labels.benefitPaidLeaveEoodNote,
      employment: true,
      employmentNote: `${Math.max(20, vacationDays)} ${labels.days}, ${labels.worth} ${fmtVal(savings.vacationValueMonthly)}`,
    },
    {
      label: labels.benefitSickPay,
      eood: false,
      eoodNote: '',
      employment: true,
      employmentNote: labels.benefitSickPayNote,
    },
    {
      label: labels.benefitMaternity,
      eood: 'warning' as const,
      eoodNote: labels.benefitMaternityEoodNote,
      employment: true,
      employmentNote: labels.benefitMaternityEmploymentNote,
    },
    {
      label: labels.benefitUnemployment,
      eood: false,
      eoodNote: '',
      employment: true,
      employmentNote: '',
    },
    {
      label: labels.benefitMortgage,
      eood: 'warning' as const,
      eoodNote: labels.benefitMortgageEoodNote,
      employment: true,
      employmentNote: '',
    },
    {
      label: labels.benefitLaborCode,
      eood: false,
      eoodNote: '',
      employment: true,
      employmentNote: '',
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pb-20 lg:pb-0">
      {/* 1. Input section */}
      <div className="card mx-auto max-w-2xl p-6 sm:p-8 mb-8">
        {/* Invoice amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.monthlyInvoiceAmount}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={50000}
              step={100}
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-16 text-lg font-semibold text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
              BGN
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bornAfter1960}
              onChange={(e) => setBornAfter1960(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{labels.bornAfter1960}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeIllnessMaternity}
              onChange={(e) => setIncludeIllnessMaternity(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">
              {labels.includeIllnessMaternity}
            </span>
            <span className="text-xs text-gray-400">
              {labels.illnessMaternityRateNote}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeVat}
              onChange={(e) => setIncludeVat(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{labels.vatRegistered}</span>
          </label>
        </div>

        {/* Monthly / Annual toggle */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              !isAnnual
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {labels.monthly}
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              isAnnual
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {labels.annual}
          </button>
        </div>
      </div>

      {/* 2. Savings banner */}
      <div className="rounded-2xl bg-green-50 border border-green-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-green-800">
              {labels.save} {fmtVal(savings.totalMonthlySavings)}{' '}
              {periodLabel}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {labels.effectiveTaxRate}: EOOD {pct(eoodResult.effectiveTaxRate)}{' '}
              vs {labels.employment} {pct(employmentEffectiveTaxRate)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Side-by-side columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: EOOD (muted) */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700">
              {labels.eoodTitle}
            </h3>
          </div>

          {/* VAT breakdown (shown when VAT toggle ON) */}
          {includeVat && (
            <div className="rounded-xl bg-white border border-gray-100 p-4 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">{labels.invoiceExclVat}</span>
                <span className="font-medium">{fmtVal(monthlyAmount)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">{labels.vat20}</span>
                <span className="font-medium">{fmtVal(vatAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-1">
                <span className="font-medium text-gray-700">
                  {labels.totalInvoice}
                </span>
                <span className="font-bold">{fmtVal(invoiceWithVat)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {labels.vatPassthroughNote}
              </p>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <Row
              label={labels.revenue}
              value={fmtVal(eoodResult.monthlyRevenue)}
            />
            <Row
              label={`${labels.selfInsurance} (${labels.base} ${fmt.format(eoodResult.insuranceBase)})`}
              value={`-${fmtVal(eoodResult.monthlyInsurance)}`}
              muted
            />

            {/* Overhead breakdown (editable) */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {labels.overheadCosts}
              </p>
              <OverheadInput
                label={labels.accountantFee}
                value={accountantFee}
                onChange={setAccountantFee}
              />
              <OverheadInput
                label={labels.bankFeesLabel}
                value={bankFees}
                onChange={setBankFees}
              />
              <OverheadInput
                label={labels.adminTimeLabel}
                value={adminTime}
                onChange={setAdminTime}
              />
              <OverheadInput
                label={labels.registrationLabel}
                value={registrationAmortized}
                onChange={setRegistrationAmortized}
              />
              <div className="flex justify-between pt-1 font-medium text-gray-700">
                <span>{labels.totalOverhead}</span>
                <span>-{fmtVal(eoodResult.totalOverhead)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-3">
              <Row
                label={labels.taxableProfit}
                value={fmtVal(eoodResult.taxableProfit)}
              />
              <Row
                label={`${labels.corporateTax} (10%)`}
                value={`-${fmtVal(eoodResult.corporateTax)}`}
                muted
              />
              <Row
                label={labels.afterTaxProfit}
                value={fmtVal(eoodResult.afterTaxProfit)}
              />
              <Row
                label={`${labels.dividendTax} (10%)`}
                value={`-${fmtVal(eoodResult.dividendTax)}`}
                muted
              />
            </div>

            <div className="pt-3 border-t-2 border-gray-300">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-800">
                  {labels.netToOwner}
                </span>
                <span className="text-xl font-bold text-gray-800">
                  {fmtVal(eoodResult.netToOwner)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {labels.effectiveTaxRate}: {pct(eoodResult.effectiveTaxRate)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Employment (highlighted) */}
        <div className="relative bg-green-50 border-2 border-green-300 ring-2 ring-green-200 rounded-2xl p-6">
          {/* Recommended badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-block rounded-full bg-green-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
              {labels.recommended}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-6 mt-2">
            <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-green-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-green-800">
              {labels.employmentTitle}
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <Row
              label={labels.grossSalary}
              value={fmtVal(employmentResult.gross)}
            />

            {/* Employee deductions (collapsible) */}
            <div>
              <button
                onClick={() => setShowDeductions(!showDeductions)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-gray-500">
                  {labels.employeeDeductions}
                </span>
                <span className="flex items-center gap-1 font-medium text-red-500">
                  -{fmtVal(employmentResult.totalEmployeeDeductions)}
                  <svg
                    className={`h-4 w-4 transition-transform ${showDeductions ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </button>
              {showDeductions && (
                <div className="mt-2 ml-2 space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>{labels.pension}</span>
                    <span>-{fmtVal(employmentResult.empPension)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{labels.illnessMaternity}</span>
                    <span>-{fmtVal(employmentResult.empIllness)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{labels.unemployment}</span>
                    <span>-{fmtVal(employmentResult.empUnemployment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{labels.health}</span>
                    <span>-{fmtVal(employmentResult.empHealth)}</span>
                  </div>
                  {bornAfter1960 && (
                    <div className="flex justify-between">
                      <span>{labels.universalPension}</span>
                      <span>-{fmtVal(employmentResult.empUniversal)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Row
              label={`${labels.incomeTax} (10%)`}
              value={`-${fmtVal(employmentResult.incomeTax)}`}
              muted
            />

            <div className="pt-3 border-t-2 border-green-300">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-green-800">
                  {labels.netSalary}
                </span>
                <span className="text-xl font-bold text-green-700">
                  {fmtVal(employmentResult.netSalary)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {labels.employerCost}: {fmtVal(employmentResult.totalEmployerCost)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {labels.effectiveTaxRate}: {pct(employmentEffectiveTaxRate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Benefits comparison table */}
      <div className="card p-6 sm:p-8 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {labels.benefitsComparison}
        </h3>

        {/* Vacation days input */}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            {labels.vacationDaysLabel}
          </label>
          <input
            type="number"
            min={20}
            max={60}
            value={vacationDays}
            onChange={(e) =>
              setVacationDays(Math.max(20, Number(e.target.value) || 20))
            }
            className="w-20 rounded-lg border border-gray-200 py-1.5 px-3 text-sm font-semibold text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <span className="text-xs text-gray-400">{labels.minDays}</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  {labels.benefit}
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600">
                  {labels.eoodTitle}
                </th>
                <th className="py-3 px-4 text-center font-semibold text-green-700">
                  {labels.employmentTitle}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {benefitsRows.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 text-gray-700">{row.label}</td>
                  <td className="py-3 px-4 text-center">
                    {row.eood === 'warning' ? (
                      <div>
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100">
                          <svg
                            className="h-4 w-4 text-amber-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                            />
                          </svg>
                        </span>
                        {row.eoodNote && (
                          <p className="text-xs text-amber-600 mt-1">
                            {row.eoodNote}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100">
                          <svg
                            className="h-4 w-4 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </span>
                        {row.eoodNote && (
                          <p className="text-xs text-gray-400 mt-1">
                            {row.eoodNote}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div>
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
                        <svg
                          className="h-4 w-4 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </span>
                      {row.employmentNote && (
                        <p className="text-xs text-green-700 mt-1">
                          {row.employmentNote}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Footnote */}
      <p className="text-xs text-gray-400 text-center mb-8">
        {labels.footnoteDisclaimer}
      </p>

      {/* 6. CTA section */}
      <div className="rounded-2xl bg-primary-50 p-8 text-center mb-8">
        <p className="text-lg font-bold text-navy mb-4">{labels.ctaTitle}</p>
        <a
          href="/auth/sign-up"
          className="inline-block rounded-xl bg-primary px-8 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          {labels.ctaButton}
        </a>
      </div>

      {/* 7. Sticky mobile CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-lg px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-sm font-bold text-green-700">
              {labels.save} {fmtVal(savings.totalMonthlySavings)} {periodLabel}
            </p>
          </div>
          <a
            href="/auth/sign-up"
            className="rounded-lg bg-primary px-5 py-2 text-sm text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            {labels.ctaButton}
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className={muted ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
      <span className={`font-medium ${muted ? 'text-gray-400' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function OverheadInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-500 text-xs">{label}</span>
      <div className="relative w-24">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded-lg border border-gray-200 py-1 pl-2 pr-8 text-xs font-medium text-right focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          BGN
        </span>
      </div>
    </div>
  )
}
