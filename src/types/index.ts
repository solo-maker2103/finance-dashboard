export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id?: number
  date: string
  amount: number
  category: string
  subcategory?: string
  description: string
  type: TransactionType
}

export interface MappingConfig {
  id?: number
  dateColumn: string
  amountColumn: string
  categoryColumn: string
  subcategoryColumn?: string
  descriptionColumn: string
}

export interface SummaryStats {
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
}

export interface MonthlySummary {
  month: string
  income: number
  expense: number
  net: number
}

export interface CategorySummary {
  category: string
  amount: number
  count: number
}

export interface SubcategorySummary {
  name: string
  amount: number
  count: number
  percentage: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  count: number
  percentage: number
  subcategories: SubcategorySummary[]
}

export interface DashboardData {
  transactions: Transaction[]
  summary: SummaryStats
  monthlyData: MonthlySummary[]
  categoryData: CategorySummary[]
}