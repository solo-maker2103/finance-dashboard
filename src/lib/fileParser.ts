import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedFile {
  headers: string[]
  rows: any[][]
}

export const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

export function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf('.')
  return index >= 0 ? filename.slice(index).toLowerCase() : ''
}

export function isAcceptedFile(file: File): boolean {
  return (ACCEPTED_EXTENSIONS as string[]).includes(getFileExtension(file.name))
}

async function parseCsv(file: File): Promise<ParsedFile> {
  const text = await file.text()

  return new Promise((resolve, reject) => {
    Papa.parse<unknown[]>(text, {
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(`Failed to parse CSV: ${result.errors[0].message}`))
          return
        }

        const matrix = result.data as unknown[][]
        if (matrix.length === 0) {
          reject(new Error('The CSV file appears to be empty.'))
          return
        }

        resolve({
          headers: matrix[0].map((cell) => String(cell ?? '').trim()),
          rows: matrix.slice(1).map((row) => row.map((cell) => cell ?? '')),
        })
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`))
      },
    })
  })
}

async function parseExcel(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('The Excel file does not contain any sheets.')
  }

  const worksheet = workbook.Sheets[sheetName]
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  })

  if (matrix.length === 0) {
    throw new Error('The Excel file appears to be empty.')
  }

  return {
    headers: matrix[0].map((cell) => String(cell ?? '').trim()),
    rows: matrix.slice(1).map((row) => row.map((cell) => cell ?? '')),
  }
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const extension = getFileExtension(file.name)

  switch (extension) {
    case '.csv':
      return parseCsv(file)
    case '.xlsx':
    case '.xls':
      return parseExcel(file)
    default:
      throw new Error(
        `Unsupported file type${
          extension ? ` "${extension}"` : ''
        }. Please upload a .csv, .xlsx, or .xls file.`
      )
  }
}