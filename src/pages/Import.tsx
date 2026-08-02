import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  FileSpreadsheet,
  ListTree,
  LoaderCircle,
  StickyNote,
  Tags,
  Wallet,
} from 'lucide-react'
import FileUpload from '../components/FileUpload'
import { detectColumnType, type ColumnMapping } from '../lib/columnDetector'
import type { ParsedFile } from '../lib/fileParser'
import { db } from '../store'
import { processTransactions } from '../lib/dataProcessor'
import type { MappingConfig, Transaction, TransactionType, Currency } from '../types'

const PREVIEW_LIMIT = 5

type MappingKey = 'date' | 'amount' | 'category' | 'subcategory' | 'description'

interface MappedRow extends Transaction {}

const MAPPING_FIELDS: {
  key: MappingKey
  label: string
  required: boolean
  icon: typeof CalendarDays
  hint: string
}[] = [
  {
    key: 'date',
    label: 'Date column',
    required: true,
    icon: CalendarDays,
    hint: 'The column containing the transaction date.',
  },
  {
    key: 'amount',
    label: 'Amount column',
    required: true,
    icon: Wallet,
    hint: 'The column containing the transaction amount.',
  },
  {
    key: 'category',
    label: 'Category column',
    required: false,
    icon: ListTree,
    hint: 'Optional: used to group transactions.',
  },
  {
    key: 'subcategory',
    label: 'Subcategory column',
    required: false,
    icon: Tags,
    hint: 'Optional: enables hierarchical category analysis (e.g., "Food > Groceries").',
  },
  {
    key: 'description',
    label: 'Description column',
    required: false,
    icon: StickyNote,
    hint: 'Optional: free-text description.',
  },
]

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'RUB', label: 'Russian Ruble', symbol: '₽' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'KRW', label: 'South Korean Won', symbol: '₩' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'Fr' },
]

const COLUMN_STYLES: Record<
  MappingKey,
  { headerClass: string; cellClass: string; chipClass: string; chipText: string }
> = {
  date: {
    headerClass: 'bg-blue-50 text-blue-800',
    cellClass: 'bg-blue-50/60',
    chipClass: 'bg-blue-100 text-blue-700',
    chipText: 'Date',
  },
  amount: {
    headerClass: 'bg-emerald-50 text-emerald-800',
    cellClass: 'bg-emerald-50/60',
    chipClass: 'bg-emerald-100 text-emerald-700',
    chipText: 'Amount',
  },
  category: {
    headerClass: 'bg-violet-50 text-violet-800',
    cellClass: 'bg-violet-50/60',
    chipClass: 'bg-violet-100 text-violet-700',
    chipText: 'Category',
  },
  subcategory: {
    headerClass: 'bg-pink-50 text-pink-800',
    cellClass: 'bg-pink-50/60',
    chipClass: 'bg-pink-100 text-pink-700',
    chipText: 'Subcategory',
  },
  description: {
    headerClass: 'bg-amber-50 text-amber-800',
    cellClass: 'bg-amber-50/60',
    chipClass: 'bg-amber-100 text-amber-700',
    chipText: 'Description',
  },
}

const STEP_ORDER: MappingKey[] = ['date', 'amount', 'category', 'subcategory', 'description']

function typeForColumn(mapping: ColumnMapping, column: number): MappingKey | null {
  for (const key of STEP_ORDER) {
    if (mapping[key] === column) return key
  }
  return null
}

function parseAmount(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const str = value.replace(/\s/g, '').replace(',', '.').trim()
  if (!str) return null
  const parsed = Number(str)
  return Number.isFinite(parsed) ? parsed : null
}

function mapRow(row: unknown[], mapping: ColumnMapping, currency: Currency = 'USD'): MappedRow {
  const rawDate = mapping.date !== null ? row[mapping.date] : ''
  const amount = mapping.amount !== null ? parseAmount(row[mapping.amount]) : null

  return {
    date: String(rawDate ?? '').trim(),
    amount: Math.abs(amount ?? 0),
    currency,
    category:
      mapping.category !== null ? String(row[mapping.category] ?? '').trim() : '',
    subcategory:
      mapping.subcategory !== null ? String(row[mapping.subcategory] ?? '').trim() : '',
    description:
      mapping.description !== null ? String(row[mapping.description] ?? '').trim() : '',
    type: (amount ?? 0) < 0 ? 'expense' : 'income',
  }
}

function formatAmount(amount: number, type: TransactionType, currency: Currency = 'USD'): string {
  const currencySymbol = CURRENCIES.find(c => c.value === currency)?.symbol || '$'
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return type === 'expense' ? `-${currencySymbol}${formatted}` : `+${currencySymbol}${formatted}`
}

function formatDate(value: string): string {
  if (!value) return '—'
  return value
}

function Import() {
  const navigate = useNavigate()
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: null,
    amount: null,
    category: null,
    subcategory: null,
    description: null,
  })
  const [currency, setCurrency] = useState<Currency>('USD')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleFileParsed = useCallback((parsed: ParsedFile) => {
    setParsedFile(parsed)
    setSaveError(null)
    setMapping(detectColumnType(parsed.headers, parsed.rows))
  }, [])

  const handleFileCleared = useCallback(() => {
    setParsedFile(null)
    setMapping({ date: null, amount: null, category: null, subcategory: null, description: null })
    setCurrency('USD')
    setSaveError(null)
  }, [])

  const usedColumns = new Set(
    STEP_ORDER.filter((key) => mapping[key] !== null).map(
      (key) => mapping[key] as number
    )
  )

  const isDateValid = mapping.date !== null
  const isAmountValid = mapping.amount !== null
  const canConfirm = isDateValid && isAmountValid

  const handleMappingChange = (key: MappingKey, rawValue: string) => {
    const value = rawValue === '' ? null : Number(rawValue)
    setMapping((prev) => ({ ...prev, [key]: value }))
  }

  const previewRows =
    parsedFile && mapping
      ? parsedFile.rows.slice(0, PREVIEW_LIMIT).map((row, index) => ({
          id: index,
          ...mapRow(row, mapping, currency),
        }))
      : []

  const handleConfirm = async () => {
    if (!parsedFile || mapping.date === null || mapping.amount === null) return

    // Validation: Check if category and subcategory are mapped to the same column
    if (
      mapping.category !== null &&
      mapping.subcategory !== null &&
      mapping.category === mapping.subcategory
    ) {
      setSaveError('Category and Subcategory cannot be mapped to the same column.')
      return
    }

    const config: MappingConfig = {
      dateColumn: parsedFile.headers[mapping.date],
      amountColumn: parsedFile.headers[mapping.amount],
      categoryColumn:
        mapping.category !== null ? parsedFile.headers[mapping.category] : '',
      subcategoryColumn:
        mapping.subcategory !== null ? parsedFile.headers[mapping.subcategory] : '',
      descriptionColumn:
        mapping.description !== null ? parsedFile.headers[mapping.description] : '',
      currency,
    }

    setSaving(true)
    setSaveError(null)
    try {
      // Process and save transactions
      const transactions = processTransactions(parsedFile.rows, config)
      
      if (transactions.length === 0) {
        setSaveError('No valid transactions found in the file. Please check your data.')
        setSaving(false)
        return
      }
      
      // Save mapping config and transactions in a transaction
      await db.transaction('rw', [db.mappingConfig, db.transactions], async () => {
        await db.mappingConfig.add(config)
        await db.transactions.bulkAdd(transactions)
      })
      
      navigate('/dashboard')
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? `Failed to save data: ${error.message}`
          : 'Failed to save data. Please try again.'
      )
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Import Wizard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a file, map its columns, and import your transactions.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Step indicator */}
        <ol className="mb-6 flex items-center gap-2 sm:gap-4">
          {[
            { label: 'Upload file', done: parsedFile !== null, active: parsedFile === null },
            { label: 'Map columns', done: canConfirm, active: parsedFile !== null },
            { label: 'Done', done: false, active: false },
          ].map((step, index) => (
            <li key={step.label} className="flex flex-1 items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step.done
                      ? 'bg-green-500 text-white'
                      : step.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    step.done || step.active ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    step.done ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>

        {!parsedFile ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <FileUpload onFileParsed={handleFileParsed} onFileCleared={handleFileCleared} />
          </div>
        ) : (
          <>
            {/* Preview table with highlighted columns */}
            <section className="rounded-lg border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    1. Preview your data
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {parsedFile.rows.length} rows · {parsedFile.headers.length} columns ·
                    showing first {Math.min(PREVIEW_LIMIT, parsedFile.rows.length)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {STEP_ORDER.filter((key) => mapping[key] !== null).map((key) => (
                    <span
                      key={key}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${COLUMN_STYLES[key].chipClass}`}
                    >
                      {COLUMN_STYLES[key].chipText}
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr>
                      {parsedFile.headers.map((header, column) => {
                        const mappedType = typeForColumn(mapping, column)
                        const style = mappedType ? COLUMN_STYLES[mappedType] : null
                        return (
                          <th
                            key={column}
                            className={`whitespace-nowrap px-4 py-3 text-left font-semibold ${
                              style ? style.headerClass : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span>{header || `Column ${column + 1}`}</span>
                              {style && (
                                <span
                                  className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.chipClass}`}
                                >
                                  {style.chipText}
                                </span>
                              )}
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedFile.rows.slice(0, PREVIEW_LIMIT).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, column) => {
                          const mappedType = typeForColumn(mapping, column)
                          const style = mappedType ? COLUMN_STYLES[mappedType] : null
                          return (
                            <td
                              key={column}
                              className={`whitespace-nowrap px-4 py-2.5 text-gray-700 ${
                                style ? style.cellClass : ''
                              }`}
                            >
                              {String(cell ?? '') || '—'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Currency Selection */}
            <section className="mt-6 rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">2. Select Currency</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Choose the currency for your transactions.
                </p>
              </div>

              <div className="p-5">
                <label htmlFor="currency-select" className="block text-sm font-medium text-gray-900 mb-2">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.value} value={curr.value}>
                      {curr.symbol} {curr.label} ({curr.value})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  This currency will be used for all imported transactions and displayed throughout the dashboard.
                </p>
              </div>
            </section>

            {/* Mapping dropdowns */}
            <section className="mt-6 rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">3. Map columns</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Select which column corresponds to each field. Date and amount are
                  required.
                </p>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {MAPPING_FIELDS.map(({ key, label, required, icon: Icon, hint }) => {
                  const isMapped = mapping[key] !== null
                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-gray-200 p-4 transition-colors"
                    >
                      <label
                        htmlFor={`map-${key}`}
                        className="flex items-center gap-2 text-sm font-medium text-gray-900"
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isMapped ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        {label}
                        {required && (
                          <span className="text-xs text-red-500" title="Required">
                            *
                          </span>
                        )}
                      </label>
                      <p className="mt-1 text-xs text-gray-500">{hint}</p>

                      <select
                        id={`map-${key}`}
                        value={mapping[key] === null ? '' : String(mapping[key])}
                        onChange={(event) => handleMappingChange(key, event.target.value)}
                        className={`mt-3 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                          isMapped
                            ? 'border-blue-400'
                            : 'border-gray-300 focus:border-blue-400'
                        }`}
                      >
                        <option value="">
                          {required ? 'Select a column...' : 'Not mapped (optional)'}
                        </option>
                        {parsedFile.headers.map((header, column) => (
                          <option
                            key={column}
                            value={String(column)}
                            disabled={usedColumns.has(column) && mapping[key] !== column}
                          >
                            {column + 1}. {header || `Column ${column + 1}`}
                          </option>
                        ))}
                      </select>

                      {!isMapped && required && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                          This field is required.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {!canConfirm && (
                <div className="mx-5 mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-800">
                    Select both a <strong>Date</strong> and an <strong>Amount</strong>{' '}
                    column to continue.
                  </p>
                </div>
              )}
            </section>

            {/* Parsed data preview */}
            <section className="mt-6 rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">
                  4. Preview parsed data
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Here is how the first {PREVIEW_LIMIT} rows will look after mapping.
                  Amounts are automatically detected as income or expense by sign.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Subcategory</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.map((row) => (
                      <tr key={row.id}>
                        <td className="whitespace-nowrap px-4 py-2.5 text-gray-700">
                          {formatDate(row.date)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-2.5 font-medium ${
                            row.type === 'expense' ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {formatAmount(row.amount, row.type, row.currency)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-gray-700">
                          {row.category || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-gray-700">
                          {row.subcategory || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="max-w-xs truncate px-4 py-2.5 text-gray-700">
                          {row.description || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {previewRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm text-gray-400"
                        >
                          No data rows found to preview.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-stretch gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  <FileSpreadsheet className="mr-1.5 inline h-4 w-4 text-gray-400" />
                  Mapping will be saved and you will be taken to the dashboard.
                </p>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canConfirm || saving}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    canConfirm && !saving
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      : 'cursor-not-allowed bg-gray-300'
                  }`}
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Confirm & Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {saveError && (
                <div className="flex items-start gap-3 border-t border-red-200 bg-red-50 px-5 py-3">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{saveError}</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default Import