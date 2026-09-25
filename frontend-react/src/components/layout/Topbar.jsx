import { useNavigate } from 'react-router-dom'
import NotificationBell from '../ui/NotificationBell'
import useAuthStore from '../../stores/authStore'

var ROLE_GRADIENTS = {
  admin: 'linear-gradient(135deg,#E8450A,#F97316)',
  staff: 'linear-gradient(135deg,#6D5EF0,#B4ACF9)',
  client: 'linear-gradient(135deg,#059669,#34D399)',
}

export default function Topbar(props) {
  var title = props.title
  var subtitle = props.subtitle
  var actions = props.actions
  var navigate = useNavigate()
  var authStore = useAuthStore()
  var user = authStore.user
  var logout = authStore.logout

  function handleLogout() {
    logout()
    navigate('/login')
  }

  var role = (user && user.role) || 'client'
  var avatarGradient = ROLE_GRADIENTS[role] || ROLE_GRADIENTS.client

  var initials = (user && user.full_name)
    ? user.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 2rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(5,7,13,0.9)',
      backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 40,
      fontFamily: "'Inter',sans-serif",
    }}>

      <div>
        <h1 style={{
          fontSize: '1.15rem', fontWeight: 700,
          fontFamily: "'Sora',sans-serif",
          color: '#F1F3F8', lineHeight: 1.2,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#8A93A6', marginTop: '0.15rem', fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {actions}

        <NotificationBell theme="dark" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div onClick={function () { navigate('/account') }} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: avatarGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 800, color: '#0A0F1E', flexShrink: 0,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'transform 0.2s',
          }}
            title={((user && user.full_name) || 'User') + ' - View profile'}
            onMouseOver={function (e) { e.currentTarget.style.transform = 'scale(1.08)' }}
            onMouseOut={function (e) { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {initials}
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.4rem 0.85rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#8A93A6',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onMouseOver={function (e) { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
            onMouseOut={function (e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8A93A6'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
