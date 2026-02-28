'use client'

import { useState, useMemo } from 'react'
import { BG_TAX_2026 } from '@/lib/bulgarian-tax'

interface LeaveCalculatorProps {
  labels: Record<string, string>
}

export default function LeaveCalculator({ labels }: LeaveCalculatorProps) {
  const [yearsOfService, setYearsOfService] = useState(0)
  const [isDisabled, setIsDisabled] = useState(false)
  const [hasHazardousWork, setHasHazardousWork] = useState(false)
  const [isUnder18, setIsUnder18] = useState(false)

  const result = useMemo(() => {
    const baseDays = isDisabled
      ? 26
      : isUnder18
        ? 26
        : BG_TAX_2026.MINIMUM_ANNUAL_LEAVE_DAYS

    // +1 day per 5 years of service (common collective agreement pattern)
    const experienceBonus = Math.floor(yearsOfService / 5)

    // Hazardous work adds 5 days
    const hazardousBonus = hasHazardousWork ? 5 : 0

    const totalLeaveDays = baseDays + experienceBonus + hazardousBonus
    const publicHolidays = BG_TAX_2026.PUBLIC_HOLIDAYS_PER_YEAR
    const totalDaysOff = totalLeaveDays + publicHolidays

    return {
      baseDays,
      experienceBonus,
      hazardousBonus,
      totalLeaveDays,
      publicHolidays,
      totalDaysOff,
    }
  }, [yearsOfService, isDisabled, hasHazardousWork, isUnder18])

  return (
    <div className="card p-6 sm:p-8">
      {/* Input fields */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.yearsOfService}
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={yearsOfService}
            onChange={(e) => setYearsOfService(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-xl border border-gray-200 py-3 px-4 text-lg font-semibold text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">{labels.yearsOfServiceHint}</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{labels.isDisabled}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isUnder18}
              onChange={(e) => setIsUnder18(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{labels.isUnder18}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHazardousWork}
              onChange={(e) => setHasHazardousWork(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{labels.hasHazardousWork}</span>
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Key figure */}
        <div className="rounded-xl bg-primary-50 p-6 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {labels.totalAnnualLeave}
          </p>
          <p className="mt-2 text-4xl font-bold text-primary">
            {result.totalLeaveDays}
          </p>
          <p className="mt-1 text-sm text-gray-600">{labels.workingDays}</p>
        </div>

        {/* Breakdown */}
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-600">
                  {labels.component}
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-600">
                  {labels.days}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-2.5 px-4 text-gray-700">{labels.baseLeave}</td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {result.baseDays}
                </td>
              </tr>
              {result.experienceBonus > 0 && (
                <tr>
                  <td className="py-2.5 px-4 text-gray-700">
                    {labels.experienceBonus} ({yearsOfService} {labels.years})
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-green-600">
                    +{result.experienceBonus}
                  </td>
                </tr>
              )}
              {result.hazardousBonus > 0 && (
                <tr>
                  <td className="py-2.5 px-4 text-gray-700">
                    {labels.hazardousBonus}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-green-600">
                    +{result.hazardousBonus}
                  </td>
                </tr>
              )}
              <tr className="bg-primary-50 font-semibold">
                <td className="py-2.5 px-4 text-primary">
                  {labels.totalAnnualLeave}
                </td>
                <td className="py-2.5 px-4 text-right text-primary">
                  {result.totalLeaveDays}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-gray-700">
                  {labels.publicHolidays}
                </td>
                <td className="py-2.5 px-4 text-right font-medium">
                  {result.publicHolidays}
                </td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="py-2.5 px-4 text-gray-900">
                  {labels.totalDaysOff}
                </td>
                <td className="py-2.5 px-4 text-right text-navy">
                  {result.totalDaysOff}
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
