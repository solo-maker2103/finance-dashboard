import Dexie, { type Table } from 'dexie'
import type { MappingConfig, Transaction } from '../types'

export class FinanceDashboardDB extends Dexie {
  transactions!: Table<Transaction, number>
  mappingConfig!: Table<MappingConfig, number>

  constructor() {
    super('FinanceDashboard')
    this.version(2).stores({
      transactions: '++id, date, category, type, currency',
      mappingConfig: '++id, currency',
    })
  }
}

export const db = new FinanceDashboardDB()
