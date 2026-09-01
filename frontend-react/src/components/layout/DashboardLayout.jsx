import Sidebar from './Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0A0F1E',
      color: '#F8FAFC',
      fontFamily: 'Inter, sans-serif',
    }}>
      <Sidebar />
      <main style={{
        marginLeft: '260px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}