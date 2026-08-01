import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Transaction } from '../types'
import { db } from '../store'
import { calculateSummary, calculateCategoryBreakdown, formatCurrency } from '../lib/dataProcessor'
import CategoryPieChart from '../components/CategoryPieChart'
import CategoryBreakdown from '../components/CategoryBreakdown'
import DateRangeFilter from '../components/DateRangeFilter'

interface DateRange {
  start?: string
  end?: string
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState<DateRange>({})

  // Load transactions from database
  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true)
        const allTransactions = await db.transactions.toArray()
        setTransactions(allTransactions)
      } catch (error) {
        console.error('Failed to load transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTransactions()
  }, [])

  // Parse URL query parameters on mount
  useEffect(() => {
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (category) setSelectedCategory(category)
    if (subcategory) setSelectedSubcategory(subcategory)
    if (start || end) setDateRange({ start: start || undefined, end: end || undefined })
  }, [searchParams])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory)
    if (dateRange.start) params.set('start', dateRange.start)
    if (dateRange.end) params.set('end', dateRange.end)

    const newSearchParams = params.toString()
    const currentSearchParams = searchParams.toString()
    
    if (newSearchParams !== currentSearchParams) {
      setSearchParams(newSearchParams ? `?${newSearchParams}` : '', { replace: true })
    }
  }, [selectedCategory, selectedSubcategory, dateRange, searchParams, setSearchParams])

  // Filter transactions based on all active filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Category filter
      if (selectedCategory && transaction.category !== selectedCategory) {
        return false
      }

      // Subcategory filter
      if (selectedSubcategory && transaction.subcategory !== selectedSubcategory) {
        return false
      }

      // Date range filter
      if (dateRange.start && transaction.date < dateRange.start) {
        return false
      }
      if (dateRange.end && transaction.date > dateRange.end) {
        return false
      }

      return true
    })
  }, [transactions, selectedCategory, selectedSubcategory, dateRange])

  // Calculate summary stats from filtered transactions
  const summary = useMemo(() => {
    return calculateSummary(filteredTransactions)
  }, [filteredTransactions])

  // Category breakdown for filtered transactions
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(filteredTransactions)
  }, [filteredTransactions])

  // Handlers
  const handleCategorySelect = useCallback((category: string, subcategory?: string) => {
    if (subcategory) {
      // Clicking subcategory: set both category and subcategory
      setSelectedCategory(category)
      setSelectedSubcategory(subcategory)
    } else {
      // Clicking category: toggle or set category, clear subcategory
      setSelectedCategory(selectedCategory === category ? undefined : category)
      setSelectedSubcategory(undefined)
    }
  }, [selectedCategory])

  const handleClearCategoryFilter = () => {
    setSelectedCategory(undefined)
    setSelectedSubcategory(undefined)
  }

  const handleClearSubcategoryFilter = () => {
    setSelectedSubcategory(undefined)
  }

  const handleClearAllFilters = () => {
    setSelectedCategory(undefined)
    setSelectedSubcategory(undefined)
    setDateRange({})
  }

  const handleDateRangeChange = (start?: string, end?: string) => {
    setDateRange({ start, end })
  }

  // Check if any filters are active
  const hasActiveFilters = selectedCategory || selectedSubcategory || dateRange.start || dateRange.end

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your financial overview at a glance.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DateRangeFilter
              startDate={dateRange.start}
              endDate={dateRange.end}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 animate-fadeIn">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900">Active Filters</h3>
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 rounded-full text-sm animate-slideIn">
                    <span className="text-blue-900 font-medium">{selectedCategory}</span>
                    <button
                      onClick={handleClearCategoryFilter}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label="Clear category filter"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedSubcategory && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 rounded-full text-sm animate-slideIn">
                    <span className="text-blue-600">›</span>
                    <span className="text-blue-900 font-medium">{selectedSubcategory}</span>
                    <button
                      onClick={handleClearSubcategoryFilter}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label="Clear subcategory filter"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {(dateRange.start || dateRange.end) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 rounded-full text-sm animate-slideIn">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-blue-900 font-medium">
                      {dateRange.start && dateRange.end
                        ? `${dateRange.start} to ${dateRange.end}`
                        : dateRange.start
                        ? `From ${dateRange.start}`
                        : `Until ${dateRange.end}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filtered View Indicator */}
        {hasActiveFilters && (
          <div className="mb-6 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>
                Showing <span className="font-semibold">{filteredTransactions.length}</span> of{' '}
                <span className="font-semibold">{transactions.length}</span> transactions
              </span>
            </div>
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View all
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="mt-2 text-2xl font-semibold text-green-600">
              {formatCurrency(summary.summary.totalIncome)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {summary.summary.transactionCount} transactions
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">
              {formatCurrency(summary.summary.totalExpense)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {categoryBreakdown.length} categories
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Net Balance</p>
            <p className={`mt-2 text-2xl font-semibold ${summary.summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.summary.netBalance)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Income - Expenses
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {filteredTransactions.length}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {filteredTransactions.length !== transactions.length && (
                <span>of {transactions.length} total</span>
              )}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Monthly Chart */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
            {summary.monthlyData.length > 0 ? (
              <div className="space-y-3">
                {summary.monthlyData.map((month) => (
                  <div key={month.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{month.month}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600">+{formatCurrency(month.income)}</span>
                        <span className="text-red-600">-{formatCurrency(month.expense)}</span>
                        <span className={`font-medium ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.net)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="flex h-2">
                        <div
                          className="bg-green-500 h-2 transition-all duration-300"
                          style={{
                            width: `${month.income + month.expense > 0 ? (month.income / (month.income + month.expense)) * 100 : 50}%`
                          }}
                        />
                        <div
                          className="bg-red-500 h-2 transition-all duration-300"
                          style={{
                            width: `${month.income + month.expense > 0 ? (month.expense / (month.income + month.expense)) * 100 : 50}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">No data available for the selected period</p>
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h2>
            <CategoryPieChart
              transactions={filteredTransactions}
              onCategoryClick={handleCategorySelect}
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
              <div className="group relative">
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Help: Category breakdown"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                  <p className="font-semibold mb-1">Category Breakdown</p>
                  <p className="text-xs text-gray-300">Click on a category to filter transactions. Expand cards to see subcategories. Use the controls above to sort and filter the view.</p>
                </div>
              </div>
            </div>
            <CategoryBreakdown
              transactions={filteredTransactions}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <div className="group relative">
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Help: Recent transactions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg">
                <p className="font-semibold mb-1">Recent Transactions</p>
                <p className="text-xs text-gray-300">Shows your 20 most recent transactions. Use filters above to narrow down the list by category, subcategory, or date range.</p>
              </div>
            </div>
          </div>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.subcategory || '—'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {filteredTransactions.length > 20 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 20 of {filteredTransactions.length} transactions
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm mt-1">
                {transactions.length === 0
                  ? 'Import transactions to see them here'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          )}
        </div>

        {/* What's New Section */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-900 mb-2">What's New: Subcategory Support</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  You can now organize transactions with <strong>subcategories</strong> for more detailed analytics.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Import files with category and subcategory columns</li>
                  <li>Click on categories in charts to filter your view</li>
                  <li>Expand category cards to see subcategory breakdowns</li>
                  <li>Use the view mode toggle to switch between categories, subcategories, or both</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Tip:</strong> Use the "Show only with subcategories" filter to focus on categories with detailed breakdowns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {transactions.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900">No transactions yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Import your financial data to see charts and insights here.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}