import { useState } from 'react'
import FileUpload from '../components/FileUpload'
import type { ParsedFile } from '../lib/fileParser'

function ImportWizard() {
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Import Wizard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload an Excel or CSV file and map its columns to your transactions.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <FileUpload onFileParsed={setParsedFile} />
        </div>

        {parsedFile && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Parsed data</h2>
            <p className="mt-1 text-sm text-gray-500">
              {parsedFile.rows.length} data rows · {parsedFile.headers.length} columns
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {parsedFile.headers.map((header, index) => (
                      <th
                        key={index}
                        className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-600"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedFile.rows.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="whitespace-nowrap px-4 py-2 text-gray-700"
                        >
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedFile.rows.length > 10 && (
              <p className="mt-3 text-xs text-gray-400">
                Showing first 10 of {parsedFile.rows.length} rows.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ImportWizard