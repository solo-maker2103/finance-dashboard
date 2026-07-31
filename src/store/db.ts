import Dexie, { type Table } from 'dexie'
import type { MappingConfig, Transaction } from '../types'

export class FinanceDashboardDB extends Dexie {
  transactions!: Table<Transaction, number>
  mappingConfig!: Table<MappingConfig, number>

  constructor() {
    super('FinanceDashboard')
    this.version(1).stores({
      transactions: '++id, date, category, type',
      mappingConfig: '++id',
    })
  }
}

export const db = new FinanceDashboardDB()