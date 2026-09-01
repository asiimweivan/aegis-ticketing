import { useNavigate } from 'react-router-dom'
import NotificationBell from '../ui/NotificationBell'
import useAuthStore from '../../stores/authStore'

export default function Topbar({ title, subtitle, actions }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isLight = false // dashboards stay dark for now — set true if you switch dashboards to white

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 2rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(10,15,30,0.9)',
      backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 40,
      fontFamily: "'Plus Jakarta Sans', 'Space Grotesk', sans-serif",
    }}>

      {/* Left — title + subtitle */}
      <div>
        <h1 style={{
          fontSize: '1.15rem', fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', 'Space Grotesk', sans-serif",
          color: '#F8FAFC', lineHeight: 1.2,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#8B9BB4', marginTop: '0.15rem', fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right — actions + bell + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Custom action buttons from parent */}
        {actions}

        {/* Notification Bell */}
        <NotificationBell theme="dark" />

        {/* User avatar + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: isAdmin
              ? 'linear-gradient(135deg,#FFD93D,#FF8E53)'
              : user?.role === 'staff'
                ? 'linear-gradient(135deg,#A78BFF,#6460FF)'
                : 'linear-gradient(135deg,#4ECDC4,#44B5AE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', flexShrink: 0,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
            title={user?.full_name || 'User'}
          >
            {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.4rem 0.85rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, color: 'rgba(240,240,255,0.5)',
              fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,95,126,0.1)'; e.currentTarget.style.color = '#FF8E8E'; e.currentTarget.style.borderColor = 'rgba(255,95,126,0.25)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(240,240,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}