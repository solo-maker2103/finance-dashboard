export type ColumnType = 'date' | 'amount' | 'category' | 'subcategory' | 'description'

export interface ColumnMapping {
  date: number | null
  amount: number | null
  category: number | null
  subcategory: number | null
  description: number | null
}

const KEYWORDS: Record<ColumnType, string[]> = {
  date: [
    'date',
    'datetime',
    'transaction date',
    'posting date',
    'posted date',
    'payment date',
    'operation date',
    'day',
    'дата',
    'дата операции',
    'дата транзакции',
    'дата платежа',
    'дата проводки',
    'время',
  ],
  amount: [
    'amount',
    'sum',
    'total',
    'value',
    'price',
    'debit',
    'credit',
    'balance',
    'money',
    'сумма',
    'итого',
    'цена',
    'значение',
    'списание',
    'поступление',
    'платёж',
    'платеж',
    'дебет',
    'кредит',
    'счёт',
    'счет',
  ],
  category: [
    'category',
    'group',
    'class',
    'kind',
    'merchant category',
    'категория',
    'группа',
    'класс',
    'вид',
  ],
  subcategory: [
    'subcategory',
    'sub category',
    'sub_category',
    'type',
    'подкатегория',
    'тип',
  ],
  description: [
    'description',
    'memo',
    'note',
    'notes',
    'details',
    'name',
    'payee',
    'merchant',
    'comment',
    'comments',
    'reference',
    'info',
    'описание',
    'комментарий',
    'наименование',
    'назначение',
    'контрагент',
    'примечание',
    'детали',
  ],
}

const DATE_PATTERNS: RegExp[] = [
  // 2024-01-31
  /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/,
  // 31.01.2024 / 1/31/2024 / 31-01-24
  /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2}(?:\d{2})?$/,
  // 31 января 2024
  /^\d{1,2}\s+[а-яё]{3,}\s+\d{2,4}$/i,
  // 31 Jan 2024
  /^\d{1,2}\s+[a-z]{3,}\s+\d{2,4}$/i,
]

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

interface Candidate {
  type: ColumnType
  column: number
  score: number
}

function buildHeaderCandidates(headers: string[]): Candidate[] {
  const candidates: Candidate[] = []

  headers.forEach((header, column) => {
    const normalized = normalize(header)
    if (!normalized) return

    ;(Object.entries(KEYWORDS) as [ColumnType, string[]][]).forEach(([type, keywords]) => {
      let best = 0

      for (const keyword of keywords) {
        const kw = normalize(keyword)
        if (normalized === kw) {
          best = Math.max(best, 3)
        } else if (normalized.includes(kw)) {
          best = Math.max(best, 2)
        } else if (kw.includes(normalized) && normalized.length >= 3) {
          best = Math.max(best, 1)
        }
      }

      if (best > 0) {
        candidates.push({ type, column, score: best })
      }
    })
  })

  return candidates
}

function isDateValue(value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') return false
  const str = String(value).trim()
  if (!str) return false
  return DATE_PATTERNS.some((pattern) => pattern.test(str))
}

function isNumericValue(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'string') return false
  const str = value.trim()
  if (!str) return false
  const parsed = Number(str.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(parsed)
}

function findColumnByValues(
  sampleData: any[],
  columns: number[],
  predicate: (value: unknown) => boolean,
  threshold = 0.5
): number | null {
  for (const column of columns) {
    const values = sampleData.map((row) => row[column])
    const nonEmpty = values.filter(
      (value) => value !== '' && value !== null && value !== undefined
    )
    if (nonEmpty.length === 0) continue

    const matches = nonEmpty.filter(predicate)
    if (matches.length / nonEmpty.length >= threshold) {
      return column
    }
  }
  return null
}

export function detectColumnType(headers: string[], sampleData: any[]): ColumnMapping {
  const mapping: ColumnMapping = {
    date: null,
    amount: null,
    category: null,
    subcategory: null,
    description: null,
  }

  const usedColumns = new Set<number>()

  const headerCandidates = buildHeaderCandidates(headers).sort(
    (a, b) => b.score - a.score || a.column - b.column
  )

  for (const candidate of headerCandidates) {
    if (mapping[candidate.type] !== null) continue
    if (usedColumns.has(candidate.column)) continue

    mapping[candidate.type] = candidate.column
    usedColumns.add(candidate.column)
  }

  // Fall back to value-based detection for any missing types.
  const availableColumns = headers
    .map((_, index) => index)
    .filter((index) => !usedColumns.has(index))

  if (mapping.date === null) {
    mapping.date = findColumnByValues(sampleData, availableColumns, isDateValue)
    if (mapping.date !== null) usedColumns.add(mapping.date)
  }

  if (mapping.amount === null) {
    mapping.amount = findColumnByValues(sampleData, availableColumns, isNumericValue)
    if (mapping.amount !== null) usedColumns.add(mapping.amount)
  }

  return mapping
}