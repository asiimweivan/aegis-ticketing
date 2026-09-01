import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications, helpers } from '../../services/api'

const TYPE_ICON = {
  ticket_created: '🎫',
  ticket_assigned: '👤',
  ticket_updated: '✏️',
  ticket_resolved: '✅',
  ticket_comment: '💬',
  sla_warning: '⚠️',
  sla_breached: '🔴',
  system: '🔔',
}

export default function NotificationBell({ theme = 'dark' }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const navigate = useNavigate()

  const isLight = theme === 'light'

  const fetchAll = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        notifications.list().catch(() => []),
        notifications.unreadCount().catch(() => ({ count: 0 })),
      ])
      setItems(Array.isArray(list) ? list : list?.notifications || [])
      setUnread(count?.count ?? count?.unread_count ?? 0)
    } catch (e) { console.error('Notification fetch error:', e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [fetchAll])

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleMarkRead = async (id, e) => {
    e?.stopPropagation()
    try {
      await notifications.markRead(id)
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnread(u => Math.max(0, u - 1))
    } catch (e) { console.error(e) }
  }

  const handleMarkAllRead = async () => {
    try {
      await notifications.markAllRead()
      setItems(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    } catch (e) { console.error(e) }
  }

  const handleClick = (n) => {
    if (!n.is_read) handleMarkRead(n.id)
    setOpen(false)
    if (n.ticket_id) navigate(`/staff/tickets/${n.ticket_id}`)
    else if (n.link) navigate(n.link)
  }

  const css = `
    @keyframes bellRing { 0%,100%{transform:rotate(0)} 10%,30%{transform:rotate(-12deg)} 20%,40%{transform:rotate(12deg)} 50%{transform:rotate(0)} }
    @keyframes ping3 { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.4);opacity:0} }
    @keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    .notif-bell-btn:hover .bell-icon { animation: bellRing 0.5s ease; }
    .notif-item-row:hover { background: ${isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)'} !important; }
    .notif-scroll::-webkit-scrollbar { width: 4px; }
    .notif-scroll::-webkit-scrollbar-thumb { background: ${isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; }
  `

  const bg      = isLight ? '#FFFFFF' : '#0B1525'
  const border  = isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)'
  const text    = isLight ? '#0F172A' : '#F0F0FF'
  const subtext = isLight ? '#64748B' : 'rgba(240,240,255,0.45)'
  const hoverBg = isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)'
  const accent  = isLight ? '#E8450A' : '#FFD93D'

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <style>{css}</style>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          position:'relative', width:38, height:38, borderRadius:10,
          background: open ? hoverBg : (isLight ? '#FFFFFF' : 'rgba(255,255,255,0.04)'),
          border:`1.5px solid ${border}`, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.2s',
        }}
      >
        <span className="bell-icon" style={{ fontSize:'1.05rem' }}>🔔</span>
        {unread > 0 && (
          <>
            <span style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#FF5F7E' }} />
            <span style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#FF5F7E', animation:'ping3 1.6s ease-out infinite' }} />
          </>
        )}
        {unread > 0 && (
          <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, padding:'0 3px', borderRadius:100, background:'#FF5F7E', color:'#fff', fontSize:'0.6rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono,monospace' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'120%', right:0, zIndex:500,
          width:360, maxHeight:480, background:bg, border:`1.5px solid ${border}`,
          borderRadius:16, boxShadow: isLight ? '0 16px 48px rgba(0,0,0,0.12)' : '0 20px 60px rgba(0,0,0,0.6)',
          overflow:'hidden', animation:'dropIn 0.18s ease',
          display:'flex', flexDirection:'column',
        }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', borderBottom:`1px solid ${border}` }}>
            <div>
              <div style={{ fontFamily:'Plus Jakarta Sans,Syne,sans-serif', fontSize:'0.95rem', fontWeight:800, color:text }}>Notifications</div>
              {unread > 0 && <div style={{ fontSize:'0.72rem', color:subtext, marginTop:'0.1rem' }}>{unread} unread</div>}
            </div>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} style={{ fontSize:'0.74rem', color:accent, background:'none', border:'none', cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notif-scroll" style={{ overflowY:'auto', flex:1 }}>
            {loading ? (
              <div style={{ padding:'2.5rem', textAlign:'center', color:subtext, fontSize:'0.82rem' }}>Loading...</div>
            ) : !items.length ? (
              <div style={{ padding:'3rem 1.5rem', textAlign:'center' }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.6rem', opacity:0.4 }}>🔕</div>
                <div style={{ fontSize:'0.85rem', color:subtext }}>No notifications yet</div>
              </div>
            ) : items.map(n => (
              <div key={n.id} className="notif-item-row" onClick={() => handleClick(n)} style={{
                display:'flex', alignItems:'flex-start', gap:'0.75rem',
                padding:'0.85rem 1.25rem', cursor:'pointer',
                borderBottom:`1px solid ${isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)'}`,
                background: n.is_read ? 'transparent' : (isLight ? '#FFF5F2' : 'rgba(255,211,61,0.04)'),
                transition:'background 0.15s',
              }}>
                <div style={{ width:32, height:32, borderRadius:9, background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>
                  {TYPE_ICON[n.type] || '🔔'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.82rem', color:text, lineHeight:1.5, fontWeight: n.is_read ? 500 : 700 }}>{n.message || n.title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.3rem' }}>
                    <span style={{ fontSize:'0.68rem', color:subtext }}>{helpers.timeAgo(n.created_at)}</span>
                    {!n.is_read && (
                      <button onClick={(e)=>handleMarkRead(n.id, e)} style={{ fontSize:'0.66rem', color:accent, background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:0 }}>Mark read</button>
                    )}
                  </div>
                </div>
                {!n.is_read && <div style={{ width:7, height:7, borderRadius:'50%', background:'#FF5F7E', flexShrink:0, marginTop:6 }} />}
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div style={{ padding:'0.75rem', textAlign:'center', borderTop:`1px solid ${border}` }}>
              <button onClick={() => { setOpen(false); navigate('/notifications') }} style={{ fontSize:'0.78rem', color:subtext, background:'none', border:'none', cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}