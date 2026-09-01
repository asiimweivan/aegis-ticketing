import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

const navItems = {
  client: [
    { to: '/client', icon: '🏠', label: 'Dashboard', exact: true },
    { to: '/client/tickets', icon: '🎫', label: 'My Tickets' },
    { to: '/client/new-ticket', icon: '➕', label: 'New Ticket' },
  ],
  staff: [
    { to: '/staff', icon: '🏠', label: 'Dashboard', exact: true },
    { to: '/staff/tickets', icon: '🎫', label: 'All Tickets' },
    { to: '/staff/tickets?assigned=me', icon: '📌', label: 'My Queue' },
  ],
  admin: [
    { to: '/admin', icon: '🏠', label: 'Dashboard', exact: true },
    { to: '/admin/tickets', icon: '🎫', label: 'All Tickets' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/analytics', icon: '📊', label: 'Analytics' },
    { to: '/admin/reports', icon: '📄', label: 'Reports' }
  ],
}

const roleColors = {
  client: { accent: '#00C9A7', bg: 'rgba(0,201,167,0.06)', border: 'rgba(0,201,167,1)', text: '#00C9A7', avatarBg: 'rgba(0,201,167,0.15)' },
  staff: { accent: '#6366F1', bg: 'rgba(99,102,241,0.06)', border: '#6366F1', text: '#818CF8', avatarBg: 'rgba(99,102,241,0.15)' },
  admin: { accent: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: '#F59E0B', text: '#FCD34D', avatarBg: 'rgba(245,158,11,0.15)' },
}

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role || 'client'
  const colors = roleColors[role]
  const items = navItems[role] || []

  const initials = user?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: '260px', background: '#0D1B3E',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #00C9A7, #6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700, color: '#fff',
          flexShrink: 0,
        }}>AE</div>
        AEG
      </div>

      {/* User info */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: colors.avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 700, color: colors.text, flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{user?.full_name}</div>
          <div style={{
            fontSize: '0.72rem', fontWeight: 500,
            color: colors.text, textTransform: 'capitalize',
          }}>{role}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#8B9BB4',
          padding: '0.5rem 1.25rem', marginTop: '0.5rem',
        }}>Menu</div>

        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              color: isActive ? colors.text : '#8B9BB4',
              textDecoration: 'none',
              borderLeft: `3px solid ${isActive ? colors.border : 'transparent'}`,
              background: isActive ? colors.bg : 'transparent',
              transition: 'all 0.2s',
            })}
          >
            <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
            {item.label === 'My Tickets' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#F43F5E', color: '#fff',
                fontSize: '0.65rem', fontWeight: 700,
                padding: '0.15rem 0.45rem', borderRadius: '100px',
              }}>{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem',
            padding: '0.65rem 0', fontSize: '0.875rem', color: '#8B9BB4',
            cursor: 'pointer', background: 'none', border: 'none',
            width: '100%', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.color = '#F43F5E'}
          onMouseOut={e => e.currentTarget.style.color = '#8B9BB4'}
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  )
}