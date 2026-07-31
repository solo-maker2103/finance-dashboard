export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id?: number
  date: string
  amount: number
  category: string
  description: string
  type: TransactionType
}

export interface MappingConfig {
  id?: number
  dateColumn: string
  amountColumn: string
  categoryColumn: string
  descriptionColumn: string
}

export interface SummaryStats {
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
}

export interface DashboardData {
  transactions: Transaction[]
  summary: SummaryStats
}