import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { CircleAlert, FileSpreadsheet, LoaderCircle, UploadCloud, X } from 'lucide-react'
import { isAcceptedFile, parseFile, type ParsedFile } from '../lib/fileParser'

interface FileUploadProps {
  onFileParsed: (data: ParsedFile) => void
  onFileCleared?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

function FileUpload({ onFileParsed, onFileCleared }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const openFileDialog = () => {
    if (!isLoading) {
      inputRef.current?.click()
    }
  }

  const handleFile = useCallback(
    async (file: File) => {
      if (!isAcceptedFile(file)) {
        setSelectedFile(null)
        setError(
          `Unsupported file type "${file.name
            .slice(file.name.lastIndexOf('.'))
            .toLowerCase()}": only .csv, .xlsx, and .xls files are accepted.`
        )
        return
      }

      setSelectedFile(file)
      setError(null)
      setIsLoading(true)

      try {
        const parsed = await parseFile(file)
        onFileParsed(parsed)
      } catch (parseError) {
        setError(
          parseError instanceof Error ? parseError.message : 'Failed to parse the selected file.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [onFileParsed]
  )

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      void handleFile(file)
    }
    event.target.value = ''
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!isLoading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (isLoading) return

    const file = event.dataTransfer.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  const resetSelection = () => {
    setSelectedFile(null)
    setError(null)
    onFileCleared?.()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload a CSV or Excel file"
        className={`group relative flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
            : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50'
        } ${isLoading ? 'cursor-wait' : ''}`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-gray-700">Parsing file...</p>
          </div>
        ) : (
          <>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 transition-colors duration-200 ${
                isDragging ? 'bg-blue-100' : 'group-hover:bg-blue-100'
              }`}
            >
              <UploadCloud
                className={`h-8 w-8 transition-colors duration-200 ${
                  isDragging ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                }`}
              />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                or <span className="font-medium text-blue-600 underline underline-offset-2">click to browse</span>
              </p>
            </div>
            <p className="text-xs text-gray-400">Accepts .csv, .xlsx, and .xls files</p>
          </>
        )}
      </button>

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-green-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          {!isLoading && (
            <button
              type="button"
              onClick={resetSelection}
              aria-label="Remove selected file"
              className="rounded-md p-1 text-gray-400 transition hover:bg-green-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}

export default FileUpload