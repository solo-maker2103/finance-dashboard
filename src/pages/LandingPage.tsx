import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Personal Finance Dashboard
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Turn your Excel or CSV files into beautiful financial insights.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/import"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Import your data
          </Link>
          <Link
            to="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            View dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage