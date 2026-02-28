'use client'

import { useState, useMemo } from 'react'
import { BG_TAX_2026 } from '@/lib/bulgarian-tax'

const fmt = new Intl.NumberFormat('bg-BG', {
  style: 'currency',
  currency: 'BGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function computeEmployerCost(gross: number, bornAfter1960: boolean) {
  const ss = BG_TAX_2026.SOCIAL_SECURITY
  const h = BG_TAX_2026.HEALTH
  const up = BG_TAX_2026.UNIVERSAL_PENSION

  const insurable = Math.min(
    Math.max(gross, BG_TAX_2026.MIN_INSURABLE_INCOME),
    BG_TAX_2026.MAX_INSURABLE_INCOME
  )

  const erPension = insurable * ss.PENSION_EMPLOYER
  const erIllness = insurable * ss.ILLNESS_MATERNITY_EMPLOYER
  const erUnemployment = insurable * ss.UNEMPLOYMENT_EMPLOYER
  const erAccident = insurable * ss.ACCIDENT_EMPLOYER
  const erHealth = insurable * h.EMPLOYER
  const erUniversal = bornAfter1960 ? insurable * up.EMPLOYER : 0

  const totalEmployerContributions =
    erPension + erIllness + erUnemployment + erAccident + erHealth + erUniversal

  const totalPerEmployee = gross + totalEmployerContributions

  return {
    gross,
    insurable,
    erPension,
    erIllness,
    erUnemployment,
    erAccident,
    erHealth,
    erUniversal,
    totalEmployerContributions,
    totalPerEmployee,
  }
}

interface EmploymentCostCalculatorProps {
  labels: Record<string, string>
}

export default function EmploymentCostCalculator({
  labels,
}: EmploymentCostCalculatorProps) {
  const [grossSalary, setGrossSalary] = useState(2000)
  const [numberOfEmployees, setNumberOfEmployees] = useState(10)
  const [bornAfter1960, setBornAfter1960] = useState(true)

  const result = useMemo(() => {
    const val = Math.max(0, grossSalary || 0)
    const count = Math.max(1, numberOfEmployees || 1)
    const perEmployee = computeEmployerCost(val, bornAfter1960)
    const monthlyTeamCost = perEmployee.totalPerEmployee * count
    const annualTeamCost = monthlyTeamCost * 12

    return {
      ...perEmployee,
      numberOfEmployees: count,
      monthlyTeamCost,
      annualTeamCost,
    }
  }, [grossSalary, numberOfEmployees, bornAfter1960])

  return (
    <div className="card p-6 sm:p-8">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.grossSalary}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={100}
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-16 text-lg font-semibold text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
              BGN
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.numberOfEmployees}
          </label>
          <input
            type="number"
            min={1}
            max={10000}
            value={numberOfEmployees}
            onChange={(e) => setNumberOfEmployees(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 py-3 px-4 text-lg font-semibold text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Born after 1960 toggle */}
      <label className="flex items-center gap-3 mb-8 cursor-pointer">
        <input
          type="checkbox"
          checked={bornAfter1960}
          onChange={(e) => setBornAfter1960(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-sm text-gray-700">{labels.bornAfter1960}</span>
      </label>

      {/* Results */}
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-primary-50 p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {labels.costPerEmployee}
            </p>
            <p className="mt-1 text-xl font-bold text-navy">
              {fmt.format(result.totalPerEmployee)}
            </p>
            <p className="text-xs text-gray-500">{labels.perMonth}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {labels.monthlyTeam}
            </p>
            <p className="mt-1 text-xl font-bold text-amber-700">
              {fmt.format(result.monthlyTeamCost)}
            </p>
            <p className="text-xs text-gray-500">
              {result.numberOfEmployees} {labels.employees}
            </p>
          </div>
          <div className="rounded-xl bg-red-50 p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {labels.annualTeam}
            </p>
            <p className="mt-1 text-xl font-bold text-red-700">
              {fmt.format(result.annualTeamCost)}
            </p>
            <p className="text-xs text-gray-500">{labels.perYear}</p>
          </div>
        </div>

        {/* Per-employee breakdown */}
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <div className="bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {labels.perEmployeeBreakdown}
            </h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.grossSalary}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmt.format(result.gross)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">{labels.pension}</td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmt.format(result.erPension)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.illnessMaternity}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmt.format(result.erIllness)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.unemployment}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmt.format(result.erUnemployment)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.accident}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmt.format(result.erAccident)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">{labels.health}</td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmt.format(result.erHealth)}
                </td>
              </tr>
              {bornAfter1960 && (
                <tr>
                  <td className="py-2.5 px-4 text-gray-700">
                    {labels.universalPension}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium">
                    {fmt.format(result.erUniversal)}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50 font-semibold">
                <td className="py-2.5 px-4 text-gray-900">
                  {labels.totalEmployerContributions}
                </td>
                <td className="py-2.5 px-4 text-right text-red-600">
                  {fmt.format(result.totalEmployerContributions)}
                </td>
              </tr>
              <tr className="bg-primary-50 font-semibold">
                <td className="py-2.5 px-4 text-primary">
                  {labels.totalPerEmployee}
                </td>
                <td className="py-2.5 px-4 text-right text-primary">
                  {fmt.format(result.totalPerEmployee)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 text-center">{labels.disclaimer}</p>
      </div>
    </div>
  )
}
