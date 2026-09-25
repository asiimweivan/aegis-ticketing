import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'home') return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M10 6.5v11" strokeDasharray="2 2" /></svg>
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
  if (name === 'bookmark') return <svg {...common}><path d="M6 4h12v16l-6-4-6 4Z" /></svg>
  if (name === 'users') return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /><path d="M16 8.5a3 3 0 1 1 0-5.9" /><path d="M14.5 14.3c2.7.3 4.5 2.6 4.5 5.7" /></svg>
  if (name === 'bar-chart') return <svg {...common}><path d="M3 20h18" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></svg>
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
  if (name === 'book-open') return <svg {...common}><path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z" /><path d="M12 6.5v13" /></svg>
  if (name === 'settings') return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'grid') return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></svg>
  if (name === 'log-out') return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
  return null
}

var navItems = {
  client: [
    { to: '/client', icon: 'home', label: 'Dashboard', exact: true },
    { to: '/client/tickets', icon: 'ticket', label: 'My Tickets' },
    { to: '/client/new-ticket', icon: 'plus', label: 'New Ticket' },
    { to: '/client/services', icon: 'grid', label: 'Service Catalog' },
    { to: '/knowledge-base', icon: 'book-open', label: 'Knowledge Base' },
    { to: '/client/profile', icon: 'user', label: 'My Profile' },
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

var roleColors = {
  client: { bg: 'rgba(52,211,153,0.1)', border: '#34D399', text: '#34D399', avatarBg: 'rgba(52,211,153,0.15)' },
  staff: { bg: 'rgba(124,111,238,0.1)', border: '#7C6FEE', text: '#B4ACF9', avatarBg: 'rgba(124,111,238,0.15)' },
  admin: { bg: 'rgba(232,69,10,0.1)', border: '#F97316', text: '#F97316', avatarBg: 'rgba(232,69,10,0.15)' },
}

export default function Sidebar(props) {
  var unreadCount = props.unreadCount || 0
  var authStore = useAuthStore()
  var user = authStore.user
  var logout = authStore.logout
  var navigate = useNavigate()
  var location = useLocation()
  var role = (user && user.role) || 'client'
  var colors = roleColors[role]
  var items = navItems[role] || []

  var initials = (user && user.full_name)
    ? user.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
    : '??'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');\n    .sb-link { transition: all 0.2s; }\n    .sb-logout { transition: color 0.2s; }\n  "

  return (
    <aside style={{
      width: '260px', background: '#0A0F1E',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      fontFamily: "'Inter',sans-serif",
    }}>
      <style>{css}</style>

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '1.25rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <img src="/aeg_logo.png" alt="AEG" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
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
            fontSize: '0.85rem', fontWeight: 600, color: '#F1F3F8',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{user && user.full_name}</div>
          <div style={{
            fontSize: '0.72rem', fontWeight: 500,
            color: colors.text, textTransform: 'capitalize',
          }}>{role}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#5C6478',
          padding: '0.5rem 1.25rem', marginTop: '0.5rem',
        }}>Menu</div>

        {items.map(function (item) {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className="sb-link"
              style={function (linkProps) {
                var isActive = item.to.indexOf('?') !== -1
                  ? (location.pathname + location.search) === item.to
                  : (linkProps.isActive && !location.search)
                return {
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.875rem', fontWeight: 500,
                  color: isActive ? colors.text : '#8A93A6',
                  textDecoration: 'none',
                  borderLeft: '3px solid ' + (isActive ? colors.border : 'transparent'),
                  background: isActive ? colors.bg : 'transparent',
                }
              }}
            >
              <span style={{ width: 20, display: 'flex', justifyContent: 'center' }}><Icon name={item.icon} size={16} /></span>
              {item.label}
              {item.label === 'My Tickets' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#F97316', color: '#0A0F1E',
                  fontSize: '0.65rem', fontWeight: 800,
                  padding: '0.15rem 0.45rem', borderRadius: '100px',
                }}>{unreadCount}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          className="sb-logout"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem',
            padding: '0.65rem 0', fontSize: '0.875rem', fontWeight: 500, color: '#8A93A6',
            cursor: 'pointer', background: 'none', border: 'none',
            width: '100%', fontFamily: 'Inter,sans-serif',
          }}
          onMouseOver={function (e) { e.currentTarget.style.color = '#F87171' }}
          onMouseOut={function (e) { e.currentTarget.style.color = '#8A93A6' }}
        >
          <Icon name="log-out" size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}



