import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
import Dashboard from './pages/dashboard'
import CustomDashboard from './pages/CustomDashboard'
import Investments from './pages/investments'
import Loans from './pages/loans'
import Budgets from './pages/budgets'
import Billing from './pages/billing'
import Reports from './pages/reports'
import Settings from './pages/settings'
import Accounts from './pages/accounts'
import Transactions from './pages/transactions'
import Currencies from './pages/currencies'
import PDCs from './pages/pdcs'
import Family from './pages/family'
import AppLauncher from './pages/launcher'
import Taxes from './pages/taxes'
import Assets from './pages/assets'
import Zakat from './pages/zakat'
import SuperAdmin from './pages/admin/superadmin'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLauncher />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/dashboard/custom" element={<MainLayout><CustomDashboard /></MainLayout>} />
          <Route path="/accounts" element={<MainLayout><Accounts /></MainLayout>} />
          <Route path="/transactions" element={<MainLayout><Transactions /></MainLayout>} />
          <Route path="/currencies" element={<MainLayout><Currencies /></MainLayout>} />
          <Route path="/pdcs" element={<MainLayout><PDCs /></MainLayout>} />
          <Route path="/budgets" element={<MainLayout><Budgets /></MainLayout>} />
          <Route path="/investments" element={<MainLayout><Investments /></MainLayout>} />
          <Route path="/loans" element={<MainLayout><Loans /></MainLayout>} />
          <Route path="/billing" element={<MainLayout><Billing /></MainLayout>} />
          <Route path="/family" element={<MainLayout><Family /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
          <Route path="/taxes" element={<MainLayout><Taxes /></MainLayout>} />
          <Route path="/assets" element={<MainLayout><Assets /></MainLayout>} />
          <Route path="/zakat" element={<MainLayout><Zakat /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
        </Route>

        {/* Admin Route */}
        <Route path="/admin" element={<ProtectedRoute role="superadmin"><MainLayout><SuperAdmin /></MainLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
