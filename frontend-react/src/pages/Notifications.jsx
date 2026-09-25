import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Topbar from '../components/layout/Topbar'
import { notifications, helpers } from '../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 16
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'edit') return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'message') return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>
  if (name === 'alert-triangle') return <svg {...common}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'bell-off') return <svg {...common}><path d="M3 3l18 18" /><path d="M18.5 13.5c-.3-.9-.5-2-.5-5.5a6 6 0 0 0-9.8-4.6" /><path d="M6.3 6.3C6.1 6.9 6 7.6 6 8c0 5-2 6-2 6h11" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
  if (name === 'bell') return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
  return null
}

var TYPE_ICON = {
  ticket_created: 'ticket', ticket_assigned: 'user', ticket_updated: 'edit',
  ticket_resolved: 'check-circle', ticket_comment: 'message',
  sla_warning: 'alert-triangle', sla_breached: 'alert-triangle', system: 'bell',
}

export default function Notifications() {
  var navigate = useNavigate()
  var itemsArr = useState([])
  var items = itemsArr[0]
  var setItems = itemsArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var filterArr = useState('all')
  var filter = filterArr[0]
  var setFilter = filterArr[1]

  useEffect(function () { loadAll() }, [])

  function loadAll() {
    setLoading(true)
    notifications.list().then(function (res) {
      setItems(Array.isArray(res) ? res : (res && res.notifications) || [])
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function markRead(id) {
    notifications.markRead(id).then(function () {
      setItems(function (prev) { return prev.map(function (n) { return n.id === id ? Object.assign({}, n, { is_read: true }) : n }) })
    }).catch(function (e) { console.error(e) })
  }

  function markAllRead() {
    notifications.markAllRead().then(function () {
      setItems(function (prev) { return prev.map(function (n) { return Object.assign({}, n, { is_read: true }) }) })
    }).catch(function (e) { console.error(e) })
  }

  function handleClick(n) {
    if (!n.is_read) markRead(n.id)
    if (n.ticket_id) navigate('/staff/tickets/' + n.ticket_id)
  }

  var filtered = filter === 'unread' ? items.filter(function (n) { return !n.is_read }) : items
  var unreadCount = items.filter(function (n) { return !n.is_read }).length

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .notif-row:hover { background:rgba(255,255,255,0.04) !important; }\n    .filter-tab:hover { color:#D6DCE8 !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Notifications"
        subtitle={loading ? 'Loading...' : items.length + ' total' + (unreadCount ? ', ' + unreadCount + ' unread' : '')}
        actions={
          unreadCount > 0 && (
            <button onClick={markAllRead} style={{ padding: '0.55rem 1.1rem', background: 'rgba(249,115,22,0.1)', border: '1.5px solid rgba(249,115,22,0.3)', color: '#FDBA74', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
              Mark all read
            </button>
          )
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[['all', 'All'], ['unread', 'Unread']].map(function (pair) {
            var v = pair[0], l = pair[1]
            var active = filter === v
            return (
              <button key={v} className="filter-tab" onClick={function () { setFilter(v) }} style={{ padding: '0.75rem 0', background: 'none', border: 'none', borderBottom: '2px solid ' + (active ? '#F97316' : 'transparent'), color: active ? '#F97316' : '#8A93A6', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif", marginBottom: -1 }}>
                {l}{v === 'unread' && unreadCount > 0 ? ' (' + unreadCount + ')' : ''}
              </button>
            )
          })}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading notifications...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="bell-off" size={44} strokeWidth={1.4} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#F1F3F8' }}>
                {filter === 'unread' ? "You're all caught up" : 'No notifications yet'}
              </div>
            </div>
          ) : filtered.map(function (n) {
            return (
              <div key={n.id} className="notif-row" onClick={function () { handleClick(n) }} style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                background: n.is_read ? 'transparent' : 'rgba(249,115,22,0.04)',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={TYPE_ICON[n.type] || 'bell'} size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', color: n.is_read ? '#8A93A6' : '#F1F3F8', fontWeight: n.is_read ? 500 : 700, lineHeight: 1.5 }}>{n.message || n.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#5C6478', marginTop: '0.3rem' }}>{helpers.timeAgo(n.created_at)}</div>
                </div>
                {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F87171', flexShrink: 0, marginTop: 6 }} />}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
