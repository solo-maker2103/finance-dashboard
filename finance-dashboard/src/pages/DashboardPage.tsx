function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your financial overview at a glance.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">$0.00</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">$0.00</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Net Balance</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">$0.00</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">0</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-gray-700">Charts coming soon</p>
          <p className="mt-2 text-sm text-gray-500">
            Import transactions to see charts and insights here.
          </p>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage