import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ImportWizard from './pages/ImportWizard'
import Landing from './pages/Landing'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/import" element={<ImportWizard />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App