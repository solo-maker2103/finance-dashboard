function ImportWizard() {
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
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-gray-700">File upload coming soon</p>
          <p className="mt-2 text-sm text-gray-500">
            Select a CSV or Excel file to get started.
          </p>
        </div>
      </main>
    </div>
  )
}

export default ImportWizard