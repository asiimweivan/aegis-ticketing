import Sidebar from './Sidebar'

export default function DashboardLayout(props) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#05070D',
      color: '#F1F3F8',
      fontFamily: "'Inter',sans-serif",
    }}>
      <Sidebar />
      <main style={{
        marginLeft: '260px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {props.children}
      </main>
    </div>
  )
}