import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { users, tickets, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

/* ---- ICON SYSTEM - matches the rest of the app, no emoji ---- */
function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'mail') {
    return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  }
  if (name === 'phone') {
    return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  }
  if (name === 'building') {
    return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 8h4v13h-4M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" /></svg>
  }
  if (name === 'calendar') {
    return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
  }
  if (name === 'ticket') {
    return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M10 6.5v11" strokeDasharray="2 2" /></svg>
  }
  if (name === 'check-circle') {
    return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  }
  if (name === 'circle-dot') {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></svg>
  }
  if (name === 'clock') {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  }
  if (name === 'arrow-left') {
    return <svg {...common}><path d="M19 12H5M5 12l6-6M5 12l6 6" /></svg>
  }
  if (name === 'user') {
    return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  }
  return null
}

var CATEGORY_COLORS = {
  technical: '#6460FF',
  administrative: '#0EA5E9',
  billing: '#F59E0B',
  infrastructure: '#EC4899',
  hr: '#22C55E',
  security: '#F43F5E',
  general: '#94A3B8',
}

export default function ClientProfile() {
  var params = useParams()
  var id = params.id
  var showToast = useToast()
  var clientState = useState(null)
  var client = clientState[0]
  var setClient = clientState[1]
  var ticketsState = useState([])
  var clientTickets = ticketsState[0]
  var setClientTickets = ticketsState[1]
  var loadingState = useState(true)
  var loading = loadingState[0]
  var setLoading = loadingState[1]
  var filterState = useState('')
  var statusFilter = filterState[0]
  var setStatusFilter = filterState[1]

  useEffect(function () { loadProfile() }, [id])

  function loadProfile() {
    setLoading(true)
    Promise.all([
      users.get(id),
      tickets.list({ client_id: id, page_size: 100 }),
    ]).then(function (results) {
      var u = results[0]
      var t = results[1]
      if (u) setClient(u)
      if (t) setClientTickets(t.tickets || [])
    }).catch(function () {
      showToast('Failed to load client profile', 'error')
    }).finally(function () {
      setLoading(false)
    })
  }

  var filteredTickets = statusFilter
    ? clientTickets.filter(function (t) { return t.status === statusFilter })
    : clientTickets

  var total = clientTickets.length
  var open = clientTickets.filter(function (t) { return t.status === 'open' }).length
  var inProgress = clientTickets.filter(function (t) { return t.status === 'in_progress' }).length
  var resolved = clientTickets.filter(function (t) { return t.status === 'resolved' || t.status === 'closed' }).length

  var resolvedWithTimes = clientTickets.filter(function (t) {
    return (t.status === 'resolved' || t.status === 'closed') && t.resolved_at && t.created_at
  })
  var avgResolutionHours = null
  if (resolvedWithTimes.length > 0) {
    var totalHours = resolvedWithTimes.reduce(function (sum, t) {
      var created = new Date(t.created_at).getTime()
      var resolvedAt = new Date(t.resolved_at).getTime()
      return sum + (resolvedAt - created) / 3600000
    }, 0)
    avgResolutionHours = Math.round(totalHours / resolvedWithTimes.length)
  }

  var categoryCounts = {}
  clientTickets.forEach(function (t) {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
  })
  var topCategories = Object.keys(categoryCounts)
    .map(function (cat) { return { category: cat, count: categoryCounts[cat] } })
    .sort(function (a, b) { return b.count - a.count })
    .slice(0, 4)

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .tkt-row:hover { background:#F8FAFC !important; }\n    .filter-chip { transition:all 0.15s; }\n  "

  if (loading) {
    return (
      <DashboardLayout>
        <Topbar title="Client Profile" subtitle="Loading..." />
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #FED7C8', borderTopColor: '#E8450A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Loading client profile...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <Topbar title="Client Profile" subtitle="Not found" />
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>Client not found.</div>
      </DashboardLayout>
    )
  }

  var initials = (client.full_name || '').split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Client Profile"
        subtitle={client.full_name}
        actions={
          <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#475569', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
            <Icon name="arrow-left" size={14} /> All Users
          </Link>
        }
      />

      <div style={{ padding: '2rem', fontFamily: 'Plus Jakarta Sans,sans-serif', background: '#F8FAFC', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        {/* Profile header card */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 18, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF5F2', border: '2px solid #FED7C8', color: '#E8450A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans,sans-serif', flexShrink: 0 }}>{initials}</div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>{client.full_name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748B' }}><Icon name="mail" size={14} /> {client.email}</span>
              {client.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748B' }}><Icon name="phone" size={14} /> {client.phone}</span>}
              {client.department && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748B' }}><Icon name="building" size={14} /> {client.department}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748B' }}><Icon name="calendar" size={14} /> Joined {helpers.formatDate(client.created_at)}</span>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, background: client.is_active ? '#ECFDF5' : '#FEF2F2', color: client.is_active ? '#059669' : '#DC2626', border: '1px solid ' + (client.is_active ? '#A7F3D0' : '#FECACA') }}>
            {client.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 14, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E8450A' }} />
            <div style={{ color: '#E8450A', marginBottom: '0.6rem' }}><Icon name="ticket" size={20} /></div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{total}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Total Tickets</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 14, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#DC2626' }} />
            <div style={{ color: '#DC2626', marginBottom: '0.6rem' }}><Icon name="circle-dot" size={20} /></div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{open}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Open</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 14, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#7C3AED' }} />
            <div style={{ color: '#7C3AED', marginBottom: '0.6rem' }}><Icon name="clock" size={20} /></div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{inProgress}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>In Progress</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 14, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#059669' }} />
            <div style={{ color: '#059669', marginBottom: '0.6rem' }}><Icon name="check-circle" size={20} /></div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{resolved}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Resolved</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 14, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#D97706' }} />
            <div style={{ color: '#D97706', marginBottom: '0.6rem' }}><Icon name="clock" size={20} /></div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{avgResolutionHours !== null ? avgResolutionHours + 'h' : '\u2014'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Avg Resolution</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>

          {/* Ticket list */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Ticket History</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['', 'open', 'in_progress', 'resolved', 'closed'].map(function (s) {
                  return (
                    <button key={s || 'all'} onClick={function () { setStatusFilter(s) }} className="filter-chip" style={{
                      padding: '0.3rem 0.75rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                      border: '1.5px solid ' + (statusFilter === s ? '#FED7C8' : '#E2E8F0'),
                      background: statusFilter === s ? '#FFF5F2' : '#FFFFFF',
                      color: statusFilter === s ? '#E8450A' : '#64748B',
                      fontFamily: 'Plus Jakarta Sans,sans-serif',
                    }}>{s === '' ? 'All' : s.replace('_', ' ')}</button>
                  )
                })}
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ color: '#CBD5E1', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="ticket" size={36} strokeWidth={1.4} /></div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>No tickets match this filter.</div>
              </div>
            ) : filteredTickets.map(function (t) {
              return (
                <Link key={t.id} to={'/staff/tickets/' + t.id} className="tkt-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F8FAFC', textDecoration: 'none', color: '#0F172A' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#94A3B8' }}>{t.ticket_number}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: CATEGORY_COLORS[t.category] || '#94A3B8', textTransform: 'capitalize' }}>{t.category}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                  </div>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', minWidth: 70, textAlign: 'right' }}>{helpers.timeAgo(t.created_at)}</span>
                </Link>
              )
            })}
          </div>

          {/* Sidebar: category breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>Top Categories</div>
              {topCategories.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No data yet.</div>
              ) : topCategories.map(function (c) {
                var pct = total > 0 ? Math.round((c.count / total) * 100) : 0
                var color = CATEGORY_COLORS[c.category] || '#94A3B8'
                return (
                  <div key={c.category} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, textTransform: 'capitalize' }}>{c.category}</span>
                      <span style={{ fontSize: '0.72rem', color: color, fontWeight: 700 }}>{c.count}</span>
                    </div>
                    <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 100, background: color, width: pct + '%' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>Account Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Role</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', textTransform: 'capitalize' }}>{client.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Last login</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>{client.last_login ? helpers.timeAgo(client.last_login) : 'Never'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Resolution rate</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#059669' }}>{total > 0 ? Math.round((resolved / total) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
