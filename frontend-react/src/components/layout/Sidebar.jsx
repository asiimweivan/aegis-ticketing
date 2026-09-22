import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>
    case 'ticket':
      return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M10 6.5v11" strokeDasharray="2 2" /></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case 'bookmark':
      return <svg {...common}><path d="M6 4h12v16l-6-4-6 4Z" /></svg>
    case 'users':
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /><path d="M16 8.5a3 3 0 1 1 0-5.9" /><path d="M14.5 14.3c2.7.3 4.5 2.6 4.5 5.7" /></svg>
    case 'bar-chart':
      return <svg {...common}><path d="M3 20h18" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></svg>
    case 'file-text':
      return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
    case 'book-open':
      return <svg {...common}><path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z" /><path d="M12 6.5v13" /></svg>
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
    case 'log-out':
      return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
    default:
      return null
  }
}

const navItems = {
  client: [
    { to: '/client', icon: 'home', label: 'Dashboard', exact: true },
    { to: '/client/tickets', icon: 'ticket', label: 'My Tickets' },
    { to: '/client/new-ticket', icon: 'plus', label: 'New Ticket' },
    { to: '/knowledge-base', icon: 'book-open', label: 'Knowledge Base' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ],
  staff: [
    { to: '/staff', icon: 'home', label: 'Dashboard', exact: true },
    { to: '/staff/tickets', icon: 'ticket', label: 'All Tickets' },
    { to: '/staff/tickets?assigned=me', icon: 'bookmark', label: 'My Queue' },
    { to: '/knowledge-base', icon: 'book-open', label: 'Knowledge Base' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ],
  admin: [
    { to: '/admin', icon: 'home', label: 'Dashboard', exact: true },
    { to: '/admin/tickets', icon: 'ticket', label: 'All Tickets' },
    { to: '/admin/users', icon: 'users', label: 'Users' },
    { to: '/admin/analytics', icon: 'bar-chart', label: 'Analytics' },
    { to: '/admin/reports', icon: 'file-text', label: 'Reports' },
    { to: '/admin/knowledge-base', icon: 'book-open', label: 'Knowledge Base' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
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
            <span style={{ width: 20, display: 'flex', justifyContent: 'center' }}><Icon name={item.icon} size={16} /></span>
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
          <Icon name="log-out" size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}
