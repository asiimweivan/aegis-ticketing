import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications, helpers } from '../../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'bell') return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
  if (name === 'bell-off') return <svg {...common}><path d="M3 3l18 18" /><path d="M18.5 13.5c-.3-.9-.5-2-.5-5.5a6 6 0 0 0-9.8-4.6" /><path d="M6.3 6.3C6.1 6.9 6 7.6 6 8c0 5-2 6-2 6h11" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'edit') return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'message') return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>
  if (name === 'alert-triangle') return <svg {...common}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'alert-octagon') return <svg {...common}><path d="M8 3h8l5 5v8l-5 5H8l-5-5V8Z" /><path d="M12 8v5" /><circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" /></svg>
  return null
}

var TYPE_ICON = {
  ticket_created: 'ticket',
  ticket_assigned: 'user',
  ticket_updated: 'edit',
  ticket_resolved: 'check-circle',
  ticket_comment: 'message',
  sla_warning: 'alert-triangle',
  sla_breached: 'alert-octagon',
  system: 'bell',
}

export default function NotificationBell(props) {
  var theme = props.theme || 'dark'
  var openArr = useState(false)
  var open = openArr[0]
  var setOpen = openArr[1]
  var itemsArr = useState([])
  var items = itemsArr[0]
  var setItems = itemsArr[1]
  var unreadArr = useState(0)
  var unread = unreadArr[0]
  var setUnread = unreadArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var ref = useRef(null)
  var navigate = useNavigate()

  var fetchAll = useCallback(function () {
    Promise.all([
      notifications.list().catch(function () { return [] }),
      notifications.unreadCount().catch(function () { return { count: 0 } }),
    ]).then(function (results) {
      var list = results[0]
      var count = results[1]
      setItems(Array.isArray(list) ? list : (list && list.notifications) || [])
      setUnread((count && (count.count != null ? count.count : count.unread_count)) || 0)
    }).catch(function (e) { console.error('Notification fetch error:', e) }).finally(function () { setLoading(false) })
  }, [])

  useEffect(function () {
    fetchAll()
    var interval = setInterval(fetchAll, 30000)
    return function () { clearInterval(interval) }
  }, [fetchAll])

  useEffect(function () {
    function fn(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return function () { document.removeEventListener('mousedown', fn) }
  }, [])

  function handleMarkRead(id, e) {
    if (e) e.stopPropagation()
    notifications.markRead(id).then(function () {
      setItems(function (prev) { return prev.map(function (n) { return n.id === id ? Object.assign({}, n, { is_read: true }) : n }) })
      setUnread(function (u) { return Math.max(0, u - 1) })
    }).catch(function (e) { console.error(e) })
  }

  function handleMarkAllRead() {
    notifications.markAllRead().then(function () {
      setItems(function (prev) { return prev.map(function (n) { return Object.assign({}, n, { is_read: true }) }) })
      setUnread(0)
    }).catch(function (e) { console.error(e) })
  }

  function handleClick(n) {
    if (!n.is_read) handleMarkRead(n.id)
    setOpen(false)
    if (n.ticket_id) navigate('/staff/tickets/' + n.ticket_id)
    else if (n.link) navigate(n.link)
  }

  var css = "\n    @keyframes bellRing { 0%,100%{transform:rotate(0)} 10%,30%{transform:rotate(-12deg)} 20%,40%{transform:rotate(12deg)} 50%{transform:rotate(0)} }\n    @keyframes ping3 { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.4);opacity:0} }\n    @keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }\n    .notif-bell-btn:hover .bell-icon { animation: bellRing 0.5s ease; }\n    .notif-item-row:hover { background: rgba(255,255,255,0.04) !important; }\n    .notif-scroll::-webkit-scrollbar { width: 4px; }\n    .notif-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }\n  "

  var bg = '#0B0E17'
  var border = 'rgba(255,255,255,0.1)'
  var text = '#F1F3F8'
  var subtext = '#5C6478'
  var hoverBg = 'rgba(255,255,255,0.04)'
  var accent = '#F97316'

  return (
    <div ref={ref} style={{ position: 'relative', fontFamily: "'Inter',sans-serif" }}>
      <style>{css}</style>
      <button
        className="notif-bell-btn"
        onClick={function () { setOpen(function (o) { return !o }) }}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: 10,
          background: open ? hoverBg : 'rgba(255,255,255,0.04)',
          border: '1.5px solid ' + border, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', color: text,
        }}
      >
        <span className="bell-icon" style={{ display: 'flex' }}><Icon name="bell" size={17} /></span>
        {unread > 0 && (
          <>
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#F87171' }} />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#F87171', animation: 'ping3 1.6s ease-out infinite' }} />
          </>
        )}
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 100, background: '#F87171', color: '#fff', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono,monospace' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '120%', right: 0, zIndex: 500,
          width: 360, maxHeight: 480, background: bg, border: '1.5px solid ' + border,
          borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden', animation: 'dropIn 0.18s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid ' + border }}>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: text }}>Notifications</div>
              {unread > 0 && <div style={{ fontSize: '0.72rem', color: subtext, marginTop: '0.1rem' }}>{unread} unread</div>}
            </div>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} style={{ fontSize: '0.74rem', color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-scroll" style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: subtext, fontSize: '0.82rem' }}>Loading...</div>
            ) : !items.length ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <div style={{ color: '#3A3F52', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}><Icon name="bell-off" size={32} strokeWidth={1.4} /></div>
                <div style={{ fontSize: '0.85rem', color: subtext }}>No notifications yet</div>
              </div>
            ) : items.map(function (n) {
              return (
                <div key={n.id} className="notif-item-row" onClick={function () { handleClick(n) }} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.85rem 1.25rem', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n.is_read ? 'transparent' : 'rgba(249,115,22,0.05)',
                  transition: 'background 0.15s',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.06)', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={TYPE_ICON[n.type] || 'bell'} size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', color: text, lineHeight: 1.5, fontWeight: n.is_read ? 500 : 700 }}>{n.message || n.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '0.68rem', color: subtext }}>{helpers.timeAgo(n.created_at)}</span>
                      {!n.is_read && (
                        <button onClick={function (e) { handleMarkRead(n.id, e) }} style={{ fontSize: '0.66rem', color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Mark read</button>
                      )}
                    </div>
                  </div>
                  {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F87171', flexShrink: 0, marginTop: 6 }} />}
                </div>
              )
            })}
          </div>

          {items.length > 0 && (
            <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid ' + border }}>
              <button onClick={function () { setOpen(false); navigate('/notifications') }} style={{ fontSize: '0.78rem', color: subtext, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}