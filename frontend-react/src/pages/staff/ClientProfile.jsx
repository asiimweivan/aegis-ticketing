import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge } from '../../components/ui/Badge'
import { users, tickets, helpers } from '../../services/api'

var CAT_COLORS = { technical: '#7C6FEE', administrative: '#0EA5E9', billing: '#FBBF24', infrastructure: '#F87171', hr: '#34D399', security: '#F97316', general: '#8A93A6' }

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'arrow-left') return <svg {...common}><path d="M19 12H5M5 12l6-6M5 12l6 6" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'phone') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'building') return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 8h4v13h-4M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'circle-dot') return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  return null
}

var STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function ClientProfile() {
  var params = useParams()
  var id = params.id
  var clientArr = useState(null)
  var client = clientArr[0]
  var setClient = clientArr[1]
  var allTicketsArr = useState([])
  var allTickets = allTicketsArr[0]
  var setAllTickets = allTicketsArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var statusFilterArr = useState('')
  var statusFilter = statusFilterArr[0]
  var setStatusFilter = statusFilterArr[1]

  useEffect(function () { loadData() }, [id])

  function loadData() {
    setLoading(true)
    Promise.all([
      users.get(id),
      tickets.list({ client_id: id, page_size: 100 }),
    ]).then(function (results) {
      var c = results[0], t = results[1]
      if (c) setClient(c)
      if (t) setAllTickets(t.tickets || [])
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  var filteredTickets = statusFilter ? allTickets.filter(function (t) { return t.status === statusFilter }) : allTickets

  var stats = {
    total: allTickets.length,
    open: allTickets.filter(function (t) { return t.status === 'open' }).length,
    in_progress: allTickets.filter(function (t) { return t.status === 'in_progress' }).length,
    resolved: allTickets.filter(function (t) { return ['resolved', 'closed'].indexOf(t.status) !== -1 }).length,
  }

  var resolvedWithTimes = allTickets.filter(function (t) { return t.resolved_at && t.created_at })
  var avgResolutionHours = resolvedWithTimes.length
    ? Math.round(resolvedWithTimes.reduce(function (sum, t) { return sum + (new Date(t.resolved_at) - new Date(t.created_at)) / 3600000 }, 0) / resolvedWithTimes.length)
    : null

  var categoryCounts = {}
  allTickets.forEach(function (t) { categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1 })
  var topCategories = Object.keys(categoryCounts).map(function (c) { return { category: c, count: categoryCounts[c] } }).sort(function (a, b) { return b.count - a.count }).slice(0, 5)
  var maxCatCount = topCategories.length ? topCategories[0].count : 1

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .filter-chip:hover { border-color:rgba(249,115,22,0.3) !important; }\n    .tkt-row:hover { background:rgba(255,255,255,0.04) !important; }\n  "

  if (loading) {
    return (
      <DashboardLayout>
        <style>{css}</style>
        <Topbar title="Loading..." />
        <div style={{ padding: '4rem', textAlign: 'center', background: '#05070D', minHeight: '100%' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading client profile...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <style>{css}</style>
        <Topbar title="Not found" />
        <div style={{ padding: '4rem', textAlign: 'center', background: '#05070D', minHeight: '100%', fontFamily: "'Inter',sans-serif" }}>
          <div style={{ color: '#F1F3F8', marginBottom: '1rem' }}>Client not found</div>
          <Link to="/staff/tickets" style={{ color: '#F97316', fontSize: '0.85rem', fontWeight: 600 }}>&larr; Back to tickets</Link>
        </div>
      </DashboardLayout>
    )
  }

  var initials = client.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title={client.full_name} subtitle="Client Profile" />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>
        <Link to="/staff/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#8A93A6', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <Icon name="arrow-left" size={14} /> Back
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.1),rgba(124,111,238,0.06))', border: '1.5px solid rgba(52,211,153,0.25)', borderRadius: 20, padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#34D399)', color: '#05070D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora',sans-serif", fontSize: '1.25rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 8px 24px -6px rgba(52,211,153,0.4)' }}>{initials}</div>
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.01em' }}>{client.full_name}</div>
                <div style={{ fontSize: '0.82rem', color: '#8A93A6' }}>{client.email}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 700, color: client.is_active ? '#34D399' : '#F87171', background: client.is_active ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', padding: '0.15rem 0.55rem', borderRadius: 100, marginTop: '0.4rem' }}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.85rem' }}>
              {[
                { label: 'Total Tickets', value: stats.total, icon: 'ticket', accent: '#F97316' },
                { label: 'Open', value: stats.open, icon: 'circle-dot', accent: '#F87171' },
                { label: 'In Progress', value: stats.in_progress, icon: 'zap', accent: '#7C6FEE' },
                { label: 'Resolved', value: stats.resolved, icon: 'check-circle', accent: '#34D399' },
              ].map(function (s) {
                return (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.1rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.accent }} />
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: s.accent + '1A', color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem' }}><Icon name={s.icon} size={14} /></div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#F1F3F8', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.68rem', color: '#8A93A6', marginTop: '0.25rem', fontWeight: 600 }}>{s.label}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.92rem', fontWeight: 700, color: '#F1F3F8' }}>Ticket History</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {STATUS_FILTERS.map(function (f) {
                    var active = statusFilter === f.value
                    return (
                      <button key={f.value} className="filter-chip" onClick={function () { setStatusFilter(f.value) }} style={{ padding: '0.3rem 0.75rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid ' + (active ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)'), background: active ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)', color: active ? '#F97316' : '#8A93A6', fontFamily: "'Inter',sans-serif" }}>{f.label}</button>
                    )
                  })}
                </div>
              </div>
              {filteredTickets.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#5C6478', fontSize: '0.85rem' }}>No tickets in this filter</div>
              ) : filteredTickets.map(function (t) {
                return (
                  <Link key={t.id} to={'/staff/tickets/' + t.id} className="tkt-row" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#5C6478', flexShrink: 0 }}>{t.ticket_number}</span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#F1F3F8', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <StatusBadge status={t.status} />
                    <span style={{ fontSize: '0.72rem', color: '#5C6478', flexShrink: 0 }}>{helpers.timeAgo(t.created_at)}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.88rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.1rem' }}>Account Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ color: '#8A93A6', flexShrink: 0 }}><Icon name="mail" size={14} /></span>
                  <span style={{ fontSize: '0.8rem', color: '#D6DCE8' }}>{client.email}</span>
                </div>
                {client.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <span style={{ color: '#8A93A6', flexShrink: 0 }}><Icon name="phone" size={14} /></span>
                    <span style={{ fontSize: '0.8rem', color: '#D6DCE8' }}>{client.phone}</span>
                  </div>
                )}
                {client.department && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <span style={{ color: '#8A93A6', flexShrink: 0 }}><Icon name="building" size={14} /></span>
                    <span style={{ fontSize: '0.8rem', color: '#D6DCE8' }}>{client.department}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ color: '#8A93A6', flexShrink: 0 }}><Icon name="calendar" size={14} /></span>
                  <span style={{ fontSize: '0.8rem', color: '#D6DCE8' }}>Joined {new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {avgResolutionHours != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <span style={{ color: '#8A93A6', flexShrink: 0 }}><Icon name="clock" size={14} /></span>
                    <span style={{ fontSize: '0.8rem', color: '#D6DCE8' }}>Avg resolution: {avgResolutionHours}h</span>
                  </div>
                )}
              </div>
            </div>

            {topCategories.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.88rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.1rem' }}>Top Categories</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topCategories.map(function (c) {
                    var color = CAT_COLORS[c.category] || '#8A93A6'
                    return (
                      <div key={c.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#D6DCE8', textTransform: 'capitalize', fontWeight: 500 }}>{c.category}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: color }}>{c.count}</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 100, background: color, width: (c.count / maxCatCount * 100) + '%' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}