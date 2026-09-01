import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Client
import ClientDashboard from './pages/client/Dashboard'
import ClientTickets from './pages/client/Tickets'
import ClientNewTicket from './pages/client/NewTicket'
import ClientTicketDetail from './pages/client/TicketDetail'

// Staff
import StaffDashboard from './pages/staff/Dashboard'
import StaffTickets from './pages/staff/Tickets'
import StaffTicketDetail from './pages/staff/TicketDetail'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminTickets from './pages/admin/Tickets'
import AdminUsers from './pages/admin/Users'
import AdminAnalytics from './pages/admin/Analytics'
import AdminReports from './pages/admin/Reports'

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />
  return children
}

// Auto redirect logged in users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'staff') return <Navigate to="/staff" replace />
    return <Navigate to="/client" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Client */}
      <Route path="/client" element={
        <ProtectedRoute roles={['client']}>
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/client/tickets" element={
        <ProtectedRoute roles={['client']}>
          <ClientTickets />
        </ProtectedRoute>
      } />
      <Route path="/client/new-ticket" element={
        <ProtectedRoute roles={['client']}>
          <ClientNewTicket />
        </ProtectedRoute>
      } />
      <Route path="/client/tickets/:id" element={
        <ProtectedRoute roles={['client']}>
          <ClientTicketDetail />
        </ProtectedRoute>
      } />

      {/* Staff */}
      <Route path="/staff" element={
        <ProtectedRoute roles={['staff', 'admin']}>
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/staff/tickets" element={
        <ProtectedRoute roles={['staff', 'admin']}>
          <StaffTickets />
        </ProtectedRoute>
      } />
      <Route path="/staff/tickets/:id" element={
        <ProtectedRoute roles={['staff', 'admin']}>
          <StaffTicketDetail />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/tickets" element={
        <ProtectedRoute roles={['admin']}>
          <AdminTickets />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute roles={['admin']}>
          <AdminAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}>
          <AdminReports />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}