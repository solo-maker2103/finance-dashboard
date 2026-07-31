import { Link, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold text-gray-900">
            Finance Dashboard
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/import" className="text-gray-600 transition hover:text-gray-900">
              Import
            </Link>
            <Link to="/dashboard" className="text-gray-600 transition hover:text-gray-900">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

export default Layout