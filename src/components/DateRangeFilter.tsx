interface DateRangeFilterProps {
  startDate?: string
  endDate?: string
  onDateRangeChange: (start?: string, end?: string) => void
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangeFilterProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || undefined
    onDateRangeChange(value, endDate)
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || undefined
    onDateRangeChange(startDate, value)
  }

  const handleClear = () => {
    onDateRangeChange(undefined, undefined)
  }

  const hasActiveFilter = startDate || endDate

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Date Range</h3>
        {hasActiveFilter && (
          <button
            onClick={handleClear}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="start-date" className="block text-xs font-medium text-gray-600 mb-1">
            From
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate || ''}
            onChange={handleStartChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="end-date" className="block text-xs font-medium text-gray-600 mb-1">
            To
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate || ''}
            onChange={handleEndChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  )
}