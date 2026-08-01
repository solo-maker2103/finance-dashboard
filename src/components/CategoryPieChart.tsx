import { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Transaction } from '../types'
import { calculateCategoryBreakdown, formatCurrency } from '../lib/dataProcessor'

type ViewMode = 'categories' | 'subcategories' | 'all'

interface CategoryPieChartProps {
  transactions: Transaction[]
  onCategoryClick?: (category: string, subcategory?: string) => void
}

const CATEGORY_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#14b8a6',
  '#6366f1',
]

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff00) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function CustomTooltip({ active, payload, viewMode }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  if (viewMode === 'categories' || (viewMode === 'all' && data.category && !data.subcategory)) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.category}</p>
        <p className="text-sm text-gray-600">{formatCurrency(data.amount)}</p>
        <p className="text-sm text-gray-500">{data.percentage.toFixed(1)}%</p>
      </div>
    )
  }

  if (viewMode === 'subcategories' || (viewMode === 'all' && data.subcategory)) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">
          {data.category} {'>'} {data.subcategory}
        </p>
        <p className="text-sm text-gray-600">{formatCurrency(data.amount)}</p>
        <p className="text-sm text-gray-500">{data.percentage.toFixed(1)}%</p>
      </div>
    )
  }

  return null
}

function CustomLegend({
  data,
  viewMode,
  onCategoryClick,
  activeFilter,
  onClearFilter,
}: any) {
  if (!data || data.length === 0) return null

  return (
    <div className="mt-4">
      {activeFilter && (
        <button
          onClick={onClearFilter}
          className="mb-3 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          aria-label="Clear active filter"
        >
          Clear filter
        </button>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" role="list">
        {data.map((entry: any, index: number) => {
          const isActive = !activeFilter || entry.category === activeFilter
          const label = viewMode === 'subcategories' ? entry.subcategory : entry.category

          return (
            <button
              key={index}
              onClick={() => onCategoryClick?.(entry.category, entry.subcategory)}
              disabled={!isActive}
              className={`flex items-center gap-2 p-2 rounded-md transition-all text-left ${
                isActive
                  ? 'hover:bg-gray-50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              aria-label={`${label}: ${entry.percentage.toFixed(1)}%${!isActive ? ' (filtered out)' : ''}`}
              aria-disabled={!isActive}
              role="listitem"
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-700 truncate flex-1">{label}</span>
              {activeFilter && isActive && (
                <span className="text-xs text-gray-500">{entry.percentage.toFixed(1)}%</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CategoryPieChart({
  transactions,
  onCategoryClick,
}: CategoryPieChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const breakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions)
  }, [transactions])

  const chartData = useMemo(() => {
    if (breakdown.length === 0) return { categories: [], subcategories: [], all: [] }

    const totalExpenses = breakdown.reduce((sum, cat) => sum + cat.amount, 0)

    const categories = breakdown.map((cat, index) => ({
      category: cat.category,
      amount: cat.amount,
      percentage: (cat.amount / totalExpenses) * 100,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))

    const subcategories: any[] = []
    breakdown.forEach((cat, catIndex) => {
      cat.subcategories.forEach((sub) => {
        subcategories.push({
          category: cat.category,
          subcategory: sub.name,
          amount: sub.amount,
          percentage: (sub.amount / totalExpenses) * 100,
          color: lightenColor(CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length], 20),
        })
      })
    })

    const all: any[] = []
    breakdown.forEach((cat, catIndex) => {
      all.push({
        category: cat.category,
        amount: cat.amount,
        percentage: (cat.amount / totalExpenses) * 100,
        color: CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length],
        isCategory: true,
      })

      cat.subcategories.forEach((sub) => {
        all.push({
          category: cat.category,
          subcategory: sub.name,
          amount: sub.amount,
          percentage: (sub.amount / totalExpenses) * 100,
          color: lightenColor(CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length], 20),
          isCategory: false,
        })
      })
    })

    return { categories, subcategories, all }
  }, [breakdown])

  const handleCategoryClick = (category: string, subcategory?: string) => {
    if (subcategory) {
      onCategoryClick?.(category, subcategory)
    } else {
      setActiveFilter(activeFilter === category ? null : category)
      onCategoryClick?.(category)
    }
  }

  const handleClearFilter = () => {
    setActiveFilter(null)
  }

  const getDisplayData = () => {
    switch (viewMode) {
      case 'categories':
        return chartData.categories
      case 'subcategories':
        return chartData.subcategories
      case 'all':
      default:
        return chartData.all
    }
  }

  const displayData = getDisplayData()
  const hasSubcategories = breakdown.some((cat) => cat.subcategories.length > 0)

  if (breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 opacity-50"
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
      {hasSubcategories && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex rounded-lg shadow-sm" role="group" aria-label="Chart view mode">
            <button
              onClick={() => setViewMode('categories')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-colors ${
                viewMode === 'categories'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={viewMode === 'categories'}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode('subcategories')}
              className={`px-4 py-2 text-sm font-medium border-t border-b transition-colors ${
                viewMode === 'subcategories'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={viewMode === 'subcategories'}
            >
              Subcategories
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={viewMode === 'all'}
            >
              All
            </button>
          </div>
        </div>
      )}

      <div className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart aria-label="Expense distribution pie chart">
            <Pie
              data={displayData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={viewMode === 'all' ? 50 : 0}
              fill="#8884d8"
              label={viewMode !== 'all' ? (entry: any) => `${entry.percentage.toFixed(1)}%` : false}
              labelLine={false}
              onClick={(entry: any) => handleCategoryClick(entry.category, entry.subcategory)}
              className="cursor-pointer"
              role="graphics-symbol"
            >
              {displayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip viewMode={viewMode} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend
        data={displayData}
        viewMode={viewMode}
        onCategoryClick={handleCategoryClick}
        activeFilter={activeFilter}
        onClearFilter={handleClearFilter}
      />
    </div>
  )
}