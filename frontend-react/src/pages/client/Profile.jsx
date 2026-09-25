import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import useAuthStore from '../../stores/authStore'

function Icon(props) {
  var name = props.name
  var size = props.size || 16
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'phone') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'building') return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 8h4v13h-4M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  return null
}

export default function ClientProfile() {
  var authStore = useAuthStore()
  var user = authStore.user
  var initials = user && user.full_name ? user.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2) : '??'

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    .settings-link:hover { border-color:rgba(249,115,22,0.3) !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title="My Profile" subtitle="Your account information" />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both', maxWidth: 640 }}>

        <div style={{ background: 'linear-gradient(135deg,rgba(232,69,10,0.1),rgba(124,111,238,0.06))', border: '1.5px solid rgba(249,115,22,0.25)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#34D399)', color: '#05070D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora',sans-serif", fontSize: '1.3rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 8px 24px -6px rgba(52,211,153,0.4)' }}>{initials}</div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.01em' }}>{user && user.full_name}</div>
            <div style={{ fontSize: '0.85rem', color: '#8A93A6' }}>{user && user.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 700, color: '#34D399', background: 'rgba(52,211,153,0.12)', padding: '0.15rem 0.55rem', borderRadius: 100, marginTop: '0.5rem', textTransform: 'capitalize' }}>
              <Icon name="shield" size={11} /> {user && user.role} account
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.25rem' }}>Account Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', color: '#8A93A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="mail" size={15} /></div>
              <div><div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div><div style={{ fontSize: '0.85rem', color: '#D6DCE8', fontWeight: 600 }}>{user && user.email}</div></div>
            </div>
            {user && user.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', color: '#8A93A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="phone" size={15} /></div>
                <div><div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div><div style={{ fontSize: '0.85rem', color: '#D6DCE8', fontWeight: 600 }}>{user.phone}</div></div>
              </div>
            )}
            {user && user.department && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', color: '#8A93A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="building" size={15} /></div>
                <div><div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</div><div style={{ fontSize: '0.85rem', color: '#D6DCE8', fontWeight: 600 }}>{user.department}</div></div>
              </div>
            )}
            {user && user.created_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', color: '#8A93A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="calendar" size={15} /></div>
                <div><div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member since</div><div style={{ fontSize: '0.85rem', color: '#D6DCE8', fontWeight: 600 }}>{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
              </div>
            )}
            {user && user.last_login && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', color: '#8A93A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="clock" size={15} /></div>
                <div><div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last sign in</div><div style={{ fontSize: '0.85rem', color: '#D6DCE8', fontWeight: 600 }}>{new Date(user.last_login).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>
              </div>
            )}
          </div>
        </div>

        <Link to="/settings" className="settings-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem 1.5rem', textDecoration: 'none', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: user && user.mfa_enabled ? 'rgba(52,211,153,0.12)' : 'rgba(124,111,238,0.12)', color: user && user.mfa_enabled ? '#34D399' : '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={17} /></div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F1F3F8' }}>Security Settings</div>
              <div style={{ fontSize: '0.75rem', color: '#5C6478' }}>Two-factor authentication {user && user.mfa_enabled ? 'enabled' : 'not enabled'}</div>
            </div>
          </div>
          <span style={{ color: '#5C6478' }}>&rarr;</span>
        </Link>
      </div>
    </DashboardLayout>
  )
}
