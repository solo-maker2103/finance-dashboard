import { useState, useMemo } from 'react'
import type { Transaction } from '../types'
import { calculateCategoryBreakdown, formatCurrency } from '../lib/dataProcessor'

type SortOption = 'amount' | 'alphabetical' | 'subcategories'

interface CategoryBreakdownProps {
  transactions: Transaction[]
  onCategorySelect?: (category: string, subcategory?: string) => void
}

export default function CategoryBreakdown({
  transactions,
  onCategorySelect,
}: CategoryBreakdownProps) {
  const [sortBy, setSortBy] = useState<SortOption>('amount')
  const [showOnlyWithSubcategories, setShowOnlyWithSubcategories] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const breakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions)
  }, [transactions])

  const filteredAndSorted = useMemo(() => {
    let result = [...breakdown]

    // Filter if needed
    if (showOnlyWithSubcategories) {
      result = result.filter((item) => item.subcategories.length > 0)
    }

    // Sort
    switch (sortBy) {
      case 'amount':
        result.sort((a, b) => b.amount - a.amount)
        break
      case 'alphabetical':
        result.sort((a, b) => a.category.localeCompare(b.category))
        break
      case 'subcategories':
        result.sort((a, b) => b.subcategories.length - a.subcategories.length)
        break
    }

    return result
  }, [breakdown, sortBy, showOnlyWithSubcategories])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleCategoryClick = (category: string) => {
    onCategorySelect?.(category)
  }

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    onCategorySelect?.(category, subcategory)
  }

  // Empty state
  if (filteredAndSorted.length === 0) {
    return (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-lg font-medium">No expense data available</p>
        <p className="text-sm mt-1">
          {transactions.length === 0
            ? 'Import transactions to see category breakdown'
            : 'No expenses found in the selected date range'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
        {/* Sort Dropdown */}
        <div className="flex-1">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="amount">By Amount</option>
            <option value="alphabetical">Alphabetically</option>
            <option value="subcategories">By Subcategories Count</option>
          </select>
        </div>

        {/* Toggle */}
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyWithSubcategories}
              onChange={(e) => setShowOnlyWithSubcategories(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show only with subcategories</span>
          </label>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAndSorted.map((item) => {
          const isExpanded = expandedCategories.has(item.category)
          const hasSubcategories = item.subcategories.length > 0

          return (
            <div
              key={item.category}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              {/* Category Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleCategoryClick(item.category)}
                      className="text-left w-full group"
                    >
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {item.category}
                      </h3>
                    </button>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-semibold text-red-600">
                        {formatCurrency(item.amount)}
                      </span>
                      {hasSubcategories && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {item.subcategories.length} subcategories
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-600">{item.count} transactions</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>

                {/* Expand/Collapse Button */}
                {hasSubcategories && (
                  <button
                    onClick={() => toggleCategory(item.category)}
                    className="mt-3 flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 mr-1 transition-transform duration-200 ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    {isExpanded ? 'Collapse' : 'Expand'} subcategories
                  </button>
                )}
              </div>

              {/* Subcategories List */}
              {hasSubcategories && isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-3">
                    {item.subcategories.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => handleSubcategoryClick(item.category, sub.name)}
                        className="w-full text-left p-3 bg-white rounded-md hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {sub.name}
                          </span>
                          <span className="text-sm font-semibold text-red-600 ml-2">
                            {formatCurrency(sub.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>{sub.count} transactions</span>
                          <span>{sub.percentage.toFixed(1)}% of category</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}