import type {
  CategoryBreakdown,
  CategorySummary,
  DashboardData,
  MappingConfig,
  MonthlySummary,
  SubcategorySummary,
  SummaryStats,
  Transaction,
  TransactionType,
} from '../types'

const DEFAULT_CATEGORY = 'Uncategorized'
const DEFAULT_DESCRIPTION = ''

let idCounter = 0

function generateId(): number {
  idCounter += 1
  return Date.now() * 1000 + idCounter
}

/**
 * Parses a raw value into a finite number.
 * Handles formats like "1,000.50", "1000.50", "-500", and numeric values.
 * Returns null for empty or unparseable input.
 */
export function parseAmount(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value !== 'string') return null

  const str = value.replace(/\s/g, '').replace(',', '.').trim()
  if (!str) return null

  const parsed = Number(str)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Parses a raw value into a valid Date object.
 * Supports ISO strings, common date formats, and Date instances.
 * Returns null for invalid or empty input.
 */
export function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value !== 'string') return null

  const str = value.trim()
  if (!str) return null

  // Try direct parsing first (handles ISO 8601 and RFC 2822).
  const direct = new Date(str)
  if (!Number.isNaN(direct.getTime())) return direct

  // Try common formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, MM/DD/YYYY.
  const match = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
  if (match) {
    const [, first, second, yearRaw] = match
    const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw)
    // Prefer day-first interpretation (common in many locales), fall back to month-first.
    const candidates = [
      new Date(year, Number(second) - 1, Number(first)),
      new Date(year, Number(first) - 1, Number(second)),
    ]
    for (const candidate of candidates) {
      if (
        !Number.isNaN(candidate.getTime()) &&
        candidate.getFullYear() === year &&
        candidate.getMonth() ===
          (candidates.indexOf(candidate) === 0
            ? Number(second) - 1
            : Number(first) - 1)
      ) {
        return candidate
      }
    }
  }

  return null
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function toMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getCell(
  row: any[] | Record<string, unknown>,
  key: string | number | null | undefined
): unknown {
  if (key === null || key === undefined) return undefined
  if (Array.isArray(row)) {
    const index = typeof key === 'number' ? key : Number(key)
    if (!Number.isInteger(index) || index < 0) return undefined
    return row[index]
  }
  if (typeof row === 'object' && row !== null) {
    return (row as Record<string, unknown>)[String(key)]
  }
  return undefined
}

/**
 * Converts raw data rows into Transaction objects.
 * - Parses dates into ISO date strings (invalid dates are skipped).
 * - Parses amounts into numbers (unparseable amounts are skipped).
 * - Determines type by amount sign (negative = expense, otherwise income).
 * - Generates a unique id for each transaction.
 */
export function processTransactions(
  rawData: any[],
  mapping: MappingConfig
): Transaction[] {
  if (!Array.isArray(rawData) || rawData.length === 0) return []
  if (!mapping) return []

  const transactions: Transaction[] = []

  for (const row of rawData) {
    if (row === null || row === undefined) continue

    const rawDate = getCell(row, mapping.dateColumn)
    const rawAmount = getCell(row, mapping.amountColumn)

    const date = parseDate(rawDate)
    if (!date) continue

    const amount = parseAmount(rawAmount)
    if (amount === null) continue

    const type: TransactionType = amount < 0 ? 'expense' : 'income'

    const categoryValue = getCell(row, mapping.categoryColumn)
    const subcategoryValue =
      mapping.subcategoryColumn !== undefined
        ? getCell(row, mapping.subcategoryColumn)
        : undefined
    const descriptionValue = getCell(row, mapping.descriptionColumn)

    const transaction: Transaction = {
      id: generateId(),
      date: toIsoDate(date),
      amount: Math.abs(amount),
      category:
        typeof categoryValue === 'string' && categoryValue.trim()
          ? categoryValue.trim()
          : DEFAULT_CATEGORY,
      description:
        typeof descriptionValue === 'string' && descriptionValue.trim()
          ? descriptionValue.trim()
          : DEFAULT_DESCRIPTION,
      type,
    }

    if (
      mapping.subcategoryColumn !== undefined &&
      typeof subcategoryValue === 'string' &&
      subcategoryValue.trim()
    ) {
      transaction.subcategory = subcategoryValue.trim()
    }

    transactions.push(transaction)
  }

  return transactions
}

/**
 * Computes summary statistics and chart-ready groupings from transactions.
 */
export function calculateSummary(transactions: Transaction[]): DashboardData {
  const summary: SummaryStats = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: transactions.length,
  }

  const monthlyMap = new Map<string, MonthlySummary>()
  const categoryMap = new Map<string, CategorySummary>()

  for (const transaction of transactions) {
    const amount = transaction.amount

    if (transaction.type === 'income') {
      summary.totalIncome += amount
    } else {
      summary.totalExpense += amount
    }

    const date = parseDate(transaction.date)
    if (date) {
      const monthKey = toMonthKey(date)
      const existing = monthlyMap.get(monthKey)
      if (existing) {
        if (transaction.type === 'income') {
          existing.income += amount
        } else {
          existing.expense += amount
        }
        existing.net = existing.income - existing.expense
      } else {
        const income = transaction.type === 'income' ? amount : 0
        const expense = transaction.type === 'expense' ? amount : 0
        monthlyMap.set(monthKey, {
          month: toMonthLabel(monthKey),
          income,
          expense,
          net: income - expense,
        })
      }
    }

    const category = transaction.category || DEFAULT_CATEGORY
    const existingCategory = categoryMap.get(category)
    if (existingCategory) {
      existingCategory.amount += amount
      existingCategory.count += 1
    } else {
      categoryMap.set(category, {
        category,
        amount,
        count: 1,
      })
    }
  }

  summary.netBalance = summary.totalIncome - summary.totalExpense

  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  )

  const categoryData = Array.from(categoryMap.values()).sort(
    (a, b) => b.amount - a.amount
  )

  return {
    transactions,
    summary,
    monthlyData,
    categoryData,
  }
}

/**
 * Calculates hierarchical category breakdown from transactions.
 * Groups transactions by category and subcategory, computing totals and percentages.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[]
): CategoryBreakdown[] {
  if (!Array.isArray(transactions) || transactions.length === 0) return []

  // First pass: calculate category totals
  const categoryMap = new Map<string, { amount: number; count: number }>()
  let totalExpenses = 0

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue

    const category = transaction.category || DEFAULT_CATEGORY
    const existing = categoryMap.get(category)

    if (existing) {
      existing.amount += transaction.amount
      existing.count += 1
    } else {
      categoryMap.set(category, {
        amount: transaction.amount,
        count: 1,
      })
    }

    totalExpenses += transaction.amount
  }

  if (totalExpenses === 0) return []

  // Second pass: calculate subcategory breakdowns
  const subcategoryMap = new Map<string, Map<string, { amount: number; count: number }>>()

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue

    const category = transaction.category || DEFAULT_CATEGORY
    const subcategory = transaction.subcategory || 'General'

    if (!subcategoryMap.has(category)) {
      subcategoryMap.set(category, new Map())
    }

    const categorySubMap = subcategoryMap.get(category)!
    const existing = categorySubMap.get(subcategory)

    if (existing) {
      existing.amount += transaction.amount
      existing.count += 1
    } else {
      categorySubMap.set(subcategory, {
        amount: transaction.amount,
        count: 1,
      })
    }
  }

  // Build breakdown array
  const breakdown: CategoryBreakdown[] = []

  for (const [category, data] of categoryMap) {
    const percentage = (data.amount / totalExpenses) * 100
    const categorySubMap = subcategoryMap.get(category)

    const subcategories: SubcategorySummary[] = []

    if (categorySubMap) {
      for (const [subcategory, subData] of categorySubMap) {
        const subcategoryPercentage = (subData.amount / data.amount) * 100
        subcategories.push({
          name: subcategory,
          amount: subData.amount,
          count: subData.count,
          percentage: subcategoryPercentage,
        })
      }

      // Sort subcategories by amount descending
      subcategories.sort((a, b) => b.amount - a.amount)
    }

    breakdown.push({
      category,
      amount: data.amount,
      count: data.count,
      percentage,
      subcategories,
    })
  }

  // Sort by amount descending
  breakdown.sort((a, b) => b.amount - a.amount)

  return breakdown
}

/**
 * Formats a number as a currency string.
 * Defaults to USD when no currency is provided.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  if (!Number.isFinite(amount)) return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
