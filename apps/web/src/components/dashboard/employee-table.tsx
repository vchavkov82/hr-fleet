'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import type { Employee } from '@/lib/types/employee'
import { fetchEmployees, ApiError } from '@/lib/api'

interface EmployeeTableProps {
  /** Auth token for API calls. When empty, falls back to data prop. */
  token?: string
  /** Pre-loaded data (used for testing / SSR fallback). */
  data?: Employee[]
  departments?: string[]
  loading?: boolean
}

const columnHelper = createColumnHelper<Employee>()

export default function EmployeeTable({ token, data: initialData, departments = [], loading: externalLoading }: EmployeeTableProps) {
  const t = useTranslations('dashboard.employees')
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [employees, setEmployees] = useState<Employee[]>(initialData ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadEmployees = useCallback(async (search?: string) => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchEmployees(token, {
        search,
        department: departmentFilter || undefined,
      })
      setEmployees(res.data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`${err.status}: ${err.message}`)
      } else {
        setError('Failed to load employees')
      }
    } finally {
      setLoading(false)
    }
  }, [token, departmentFilter])

  // Fetch on mount and when department filter changes
  useEffect(() => {
    if (token) {
      loadEmployees()
    }
  }, [token, loadEmployees])

  // Use initialData when no token (test / SSR fallback mode)
  useEffect(() => {
    if (!token && initialData) {
      setEmployees(initialData)
    }
  }, [token, initialData])

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setGlobalFilter(value)
    if (token) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        loadEmployees(value)
      }, 300)
    }
  }, [token, loadEmployees])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => t('name'),
        cell: (info) => (
          <Link
            href={`/dashboard/employees/${info.row.original.id}`}
            className="text-blue-700 hover:text-blue-900 font-medium"
          >
            {info.getValue()}
          </Link>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('workEmail', {
        header: () => t('email'),
        enableSorting: false,
      }),
      columnHelper.accessor((row) => row.department.name, {
        id: 'department',
        header: () => t('department'),
        enableSorting: true,
      }),
      columnHelper.accessor('jobTitle', {
        header: () => t('position'),
        enableSorting: false,
      }),
      columnHelper.accessor('createDate', {
        header: () => t('startDate'),
        cell: (info) => {
          const val = info.getValue()
          if (!val) return '-'
          return new Date(val).toLocaleDateString()
        },
        enableSorting: true,
      }),
      columnHelper.accessor('active', {
        header: () => t('status'),
        cell: (info) => (
          <span
            className={
              info.getValue()
                ? 'inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset'
                : 'inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset'
            }
          >
            {info.getValue() ? t('active') : t('inactive')}
          </span>
        ),
        enableSorting: false,
      }),
    ],
    [t],
  )

  const filteredData = useMemo(() => {
    if (!departmentFilter) return employees
    return employees.filter((e) => e.department.name === departmentFilter)
  }, [employees, departmentFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter: token ? '' : globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: token ? undefined : setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const isLoading = externalLoading || loading

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="loading-skeleton">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center" data-testid="error-state">
        <p className="text-red-700 mb-3">{error}</p>
        <button
          onClick={() => loadEmployees()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const uniqueDepartments =
    departments.length > 0
      ? departments
      : [...new Set(employees.map((e) => e.department.name))].filter(Boolean).sort()

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder={t('search')}
          value={globalFilter}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('allDepartments')}</option>
          {uniqueDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <Link
          href="/dashboard/employees/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
        >
          {t('addNew')}
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      )}
                      {header.column.getIsSorted() === 'desc' && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  {t('noResults')}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
