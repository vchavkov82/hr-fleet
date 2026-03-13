'use client'

import { useState, useMemo } from 'react'
import { BG_TAX_2026 } from '@/lib/bulgarian-tax'
import { computeNetFromGross, eurToBgn, bgnToEur } from '@/lib/calculations'

type Mode = 'gross-to-net' | 'net-to-gross'

const fmt = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function findGrossFromNet(targetNetBgn: number, bornAfter1960: boolean): number {
  // Binary search for gross (BGN) that yields the target net (BGN)
  let lo = targetNetBgn
  let hi = targetNetBgn * 2
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const result = computeNetFromGross(mid, bornAfter1960)
    if (Math.abs(result.netSalary - targetNetBgn) < 0.01) return mid
    if (result.netSalary < targetNetBgn) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

interface SalaryCalculatorProps {
  labels: Record<string, string>
}

export default function SalaryCalculator({ labels }: SalaryCalculatorProps) {
  const [amount, setAmount] = useState(Math.round(bgnToEur(2000)))
  const [mode, setMode] = useState<Mode>('gross-to-net')
  const [bornAfter1960, setBornAfter1960] = useState(true)

  // Convert EUR input to BGN for calculations
  const result = useMemo(() => {
    const valBgn = eurToBgn(Math.max(0, amount || 0))
    if (mode === 'gross-to-net') {
      return computeNetFromGross(valBgn, bornAfter1960)
    } else {
      const gross = findGrossFromNet(valBgn, bornAfter1960)
      return computeNetFromGross(gross, bornAfter1960)
    }
  }, [amount, mode, bornAfter1960])

  // Format BGN result as EUR
  const fmtEur = (v: number) => fmt.format(bgnToEur(v))

  return (
    <div className="card p-6 sm:p-8">
      {/* Mode tabs */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
        <button
          onClick={() => setMode('gross-to-net')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            mode === 'gross-to-net'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {labels.grossToNet}
        </button>
        <button
          onClick={() => setMode('net-to-gross')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            mode === 'net-to-gross'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {labels.netToGross}
        </button>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'gross-to-net' ? labels.grossSalary : labels.desiredNet}
        </label>
        <div className="relative">
          <input
            type="number"
            min={0}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-16 text-lg font-semibold text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
            EUR
          </span>
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
        {/* Key figures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-primary-50 p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {labels.grossSalary}
            </p>
            <p className="mt-1 text-xl font-bold text-navy">
              {fmtEur(result.gross)}
            </p>
          </div>
          <div className="rounded-xl bg-green-50 p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {labels.netSalary}
            </p>
            <p className="mt-1 text-xl font-bold text-green-700">
              {fmtEur(result.netSalary)}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {labels.totalCost}
            </p>
            <p className="mt-1 text-xl font-bold text-amber-700">
              {fmtEur(result.totalEmployerCost)}
            </p>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  {labels.deduction}
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-600">
                  {labels.employee}
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-600">
                  {labels.employer}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-2.5 px-4 text-gray-700">{labels.pension}</td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.empPension)}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.erPension)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.illnessMaternity}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.empIllness)}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.erIllness)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.unemployment}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.empUnemployment)}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.erUnemployment)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.accident}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">-</td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.erAccident)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">{labels.health}</td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.empHealth)}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.erHealth)}
                </td>
              </tr>
              {bornAfter1960 && (
                <tr>
                  <td className="py-2.5 px-4 text-gray-700">
                    {labels.universalPension}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium">
                    {fmtEur(result.empUniversal)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium">
                    {fmtEur(result.erUniversal)}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50 font-semibold">
                <td className="py-2.5 px-4 text-gray-900">
                  {labels.totalContributions}
                </td>
                <td className="py-2.5 px-4 text-right text-red-600">
                  {fmtEur(result.totalEmployeeDeductions)}
                </td>
                <td className="py-2.5 px-4 text-right text-red-600">
                  {fmtEur(result.totalEmployerContributions)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.incomeTax} (10%)
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {fmtEur(result.incomeTax)}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Insurable income note */}
        <p className="text-xs text-gray-500 text-center">
          {labels.insurableNote} {fmtEur(result.insurable)} (
          {labels.minMax}: {fmt.format(bgnToEur(BG_TAX_2026.MIN_INSURABLE_INCOME))} -{' '}
          {fmt.format(bgnToEur(BG_TAX_2026.MAX_INSURABLE_INCOME))})
        </p>
      </div>
    </div>
  )
}
