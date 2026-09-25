import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets, notifications, helpers } from '../../services/api'
import useAuthStore from '../../stores/authStore'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'sun') return <svg {...common}><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" /></svg>
  if (name === 'moon') return <svg {...common}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" /></svg>
  if (name === 'rocket') return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'bell') return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
  if (name === 'edit') return <svg {...common}><path d="M4 20h4l10.5-10.5a2 2 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
  if (name === 'list') return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="0.9" fill="currentColor" stroke="none" /></svg>
  if (name === 'circle-dot') return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'brain') return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
  return null
}

var STATUS_CONFIG = {
  open: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label: 'Open' },
  in_progress: { color: '#B4ACF9', bg: 'rgba(124,111,238,0.1)', border: 'rgba(124,111,238,0.3)', label: 'In Progress' },
  pending: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', label: 'Pending' },
  resolved: { color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', label: 'Resolved' },
  closed: { color: '#8A93A6', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', label: 'Closed' },
}

var PRI_CONFIG = {
  critical: { color: '#F87171', label: 'Critical' },
  high: { color: '#F97316', label: 'High' },
  medium: { color: '#FBBF24', label: 'Medium' },
  low: { color: '#34D399', label: 'Low' },
}

function StatusPill(props) {
  var c = STATUS_CONFIG[props.status] || STATUS_CONFIG.open
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.7rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color, border: '1px solid ' + c.border }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
      {c.label}
    </span>
  )
}

function PriPill(props) {
  var c = PRI_CONFIG[props.priority] || PRI_CONFIG.medium
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 600, color: c.color }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
      {c.label}
    </span>
  )
}

export default function ClientDashboard() {
  var authStore = useAuthStore()
  var user = authStore.user
  var statsArr = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 })
  var stats = statsArr[0]
  var setStats = statsArr[1]
  var recentTicketsArr = useState([])
  var recentTickets = recentTicketsArr[0]
  var setRecentTickets = recentTicketsArr[1]
  var notifsArr = useState([])
  var notifs = notifsArr[0]
  var setNotifs = notifsArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]

  useEffect(function () { loadData() }, [])

  function loadData() {
    Promise.all([
      tickets.list({ page_size: 100 }),
      notifications.list(),
    ]).then(function (results) {
      var ticketData = results[0], notifData = results[1]
      if (ticketData) {
        var all = ticketData.tickets
        setStats({
          total: ticketData.total,
          open: all.filter(function (t) { return t.status === 'open' }).length,
          in_progress: all.filter(function (t) { return t.status === 'in_progress' }).length,
          resolved: all.filter(function (t) { return ['resolved', 'closed'].indexOf(t.status) !== -1 }).length,
        })
        setRecentTickets(all.slice(0, 6))
      }
      if (notifData) setNotifs(notifData.slice(0, 5))
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  var firstName = (user && user.full_name && user.full_name.split(' ')[0]) || 'there'
  var hour = new Date().getHours()
  var greetIcon = hour < 18 ? 'sun' : 'moon'
  var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  var unread = notifs.filter(function (n) { return !n.is_read }).length

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes ping2   { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.4);opacity:0} }\n    @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }\n    @keyframes spin    { to{transform:rotate(360deg)} }\n    @keyframes meshDrift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(4%,3%) scale(1.06)} }\n    .tkt-card { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }\n    .tkt-card:hover { transform: translateY(-3px); border-color:rgba(249,115,22,0.35) !important; box-shadow: 0 16px 40px -16px rgba(232,69,10,0.3) !important; }\n    .qa-btn  { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }\n    .qa-btn:hover { transform: translateY(-4px) !important; }\n    .stat-card { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }\n    .stat-card:hover { transform: translateY(-4px); }\n    .notif-item { transition: all 0.2s; }\n    .notif-item:hover { background: rgba(255,255,255,0.05) !important; }\n    ::-webkit-scrollbar { width: 3px; }\n    ::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 3px; }\n  "

  var statCards = [
    { label: 'Total Tickets', value: stats.total, icon: 'ticket', accent: '#F97316', to: '/client/tickets' },
    { label: 'Open', value: stats.open, icon: 'circle-dot', accent: '#F87171', to: '/client/tickets?status=open' },
    { label: 'In Progress', value: stats.in_progress, icon: 'zap', accent: '#7C6FEE', to: '/client/tickets?status=in_progress' },
    { label: 'Resolved', value: stats.resolved, icon: 'check-circle', accent: '#34D399', to: '/client/tickets?status=resolved' },
  ]

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="My Dashboard"
        subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={
          <Link to="/client/new-ticket" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.35rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 16px rgba(232,69,10,0.4)', transition: 'all 0.2s' }}
            onMouseOver={function (e) { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={function (e) { e.currentTarget.style.transform = 'translateY(0)' }}
          >+ New Ticket</Link>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.5s ease both' }}>

        {/* HERO WELCOME BANNER */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, marginBottom: '2rem', padding: '2.75rem 2.75rem 2.25rem', background: 'linear-gradient(135deg,rgba(232,69,10,0.1) 0%,rgba(124,111,238,0.08) 60%,rgba(255,255,255,0.02) 100%)', border: '1.5px solid rgba(249,115,22,0.25)' }}>
          <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.18),transparent 70%)', top: -120, right: 60, pointerEvents: 'none', filter: 'blur(20px)', animation: 'meshDrift 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,111,238,0.15),transparent 70%)', bottom: -80, right: 10, pointerEvents: 'none', filter: 'blur(20px)', animation: 'meshDrift 18s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#FDBA74', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono,monospace', marginBottom: '0.7rem' }}><Icon name={greetIcon} size={13} /> {greeting}</div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(1.7rem,3.4vw,2.4rem)', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '0.75rem' }}>
                {firstName},<br />
                <span style={{ background: 'linear-gradient(90deg,#F97316,#7C6FEE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>how can we help you today?</span>
              </h2>
              <p style={{ color: '#B0B8C8', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 400 }}>
                Submit a ticket and our AI will classify it, set priority, and route it to the right team - instantly.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(249,115,22,0.3)', borderRadius: 18, padding: '1.6rem', minWidth: 230, animation: 'float 5s ease-in-out infinite', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '0.72rem', color: '#F97316', fontFamily: 'JetBrains Mono,monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 700 }}>Quick submit</div>
              <div style={{ fontSize: '0.82rem', color: '#8A93A6', lineHeight: 1.6, marginBottom: '1.1rem' }}>Describe your issue and AI handles the rest</div>
              <Link to="/client/new-ticket" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.8rem 1.25rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 6px 20px rgba(232,69,10,0.4)' }}>
                <Icon name="rocket" size={15} /> Submit a ticket
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '2rem', marginTop: '2.25rem', paddingTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            {[['cpu', 'AI-classified', 'Instant'], ['zap', 'Avg resolution', '6 hours'], ['check-circle', 'SLA tracking', 'Live'], ['bell', 'Notifications', 'Real-time']].map(function (item) {
              var ic = item[0], l = item[1], v = item[2]
              return (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#F97316', display: 'flex' }}><Icon name={ic} size={16} /></span>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#5C6478', lineHeight: 1 }}>{l}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D6DCE8', lineHeight: 1.3, marginTop: '0.15rem' }}>{v}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map(function (c) {
            return (
              <Link key={c.label} to={c.to} className="stat-card" style={{ textDecoration: 'none', display: 'block', borderRadius: 18, padding: '1.6rem', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.accent }} />
                <div style={{ width: 42, height: 42, borderRadius: 12, background: c.accent + '1A', color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem' }}><Icon name={c.icon} size={20} /></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '2rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.35rem' }}>{c.value}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8A93A6' }}>{c.label}</div>
              </Link>
            )
          })}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5C6478', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono,monospace', marginBottom: '0.9rem' }}>Quick actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem' }}>
            {[
              { to: '/client/new-ticket', icon: 'edit', label: 'New Ticket', accent: '#F97316' },
              { to: '/client/tickets', icon: 'list', label: 'All Tickets', accent: '#7C6FEE' },
              { to: '/client/tickets?status=open', icon: 'circle-dot', label: 'Open Issues', accent: '#F87171' },
              { to: '/client/tickets?status=resolved', icon: 'check-circle', label: 'Resolved', accent: '#34D399' },
            ].map(function (a) {
              return (
                <Link key={a.to} to={a.to} className="qa-btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', textAlign: 'center', textDecoration: 'none', color: '#F1F3F8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}
                  onMouseOver={function (e) { e.currentTarget.style.borderColor = a.accent + '55'; e.currentTarget.style.background = a.accent + '0D' }}
                  onMouseOut={function (e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: a.accent + '1A', color: a.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={a.icon} size={19} /></div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#D6DCE8' }}>{a.label}</div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* TWO COLUMNS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#F1F3F8' }}>Recent Tickets</div>
                <div style={{ fontSize: '0.72rem', color: '#5C6478', marginTop: '0.15rem' }}>Your latest support requests</div>
              </div>
              <Link to="/client/tickets" style={{ fontSize: '0.78rem', color: '#F97316', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>View all &rarr;</Link>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading your tickets...</div>
              </div>
            ) : recentTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 18 }}>
                <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="ticket" size={44} strokeWidth={1.4} /></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.5rem' }}>No tickets yet</div>
                <p style={{ fontSize: '0.85rem', color: '#8A93A6', marginBottom: '1.5rem', lineHeight: 1.6 }}>Submit your first ticket and our AI will classify it instantly.</p>
                <Link to="/client/new-ticket" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.6rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 6px 18px rgba(232,69,10,0.35)' }}><Icon name="rocket" size={15} /> Submit a ticket</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {recentTickets.map(function (t) {
                  var pc = PRI_CONFIG[t.priority] || PRI_CONFIG.medium
                  return (
                    <Link key={t.id} to={'/client/tickets/' + t.id} className="tkt-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.3rem 1.5rem', textDecoration: 'none', color: '#F1F3F8', display: 'block', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: pc.color, borderRadius: '3px 0 0 3px' }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.65rem', color: '#5C6478', background: 'rgba(255,255,255,0.04)', padding: '0.12rem 0.45rem', borderRadius: 5 }}>{t.ticket_number}</span>
                        <StatusPill status={t.status} />
                        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#5C6478' }}>{helpers.timeAgo(t.created_at)}</span>
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#F1F3F8', lineHeight: 1.4, marginBottom: '0.55rem' }}>{t.title}</div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <PriPill priority={t.priority} />
                        <span style={{ fontSize: '0.72rem', color: '#5C6478' }}>{helpers.categoryLabel(t.category)}</span>
                        {t.assigned_to && (
                          <span style={{ fontSize: '0.7rem', color: '#5C6478', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(124,111,238,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#B4ACF9' }}>
                              {t.assigned_to.full_name && t.assigned_to.full_name[0].toUpperCase()}
                            </span>
                            {t.assigned_to.full_name}
                          </span>
                        )}
                      </div>

                      {t.ai_summary && (
                        <div style={{ marginTop: '0.85rem', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '0.65rem 0.9rem', fontSize: '0.75rem', color: '#B0B8C8', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <span style={{ flexShrink: 0, color: '#F97316' }}><Icon name="cpu" size={13} /></span>
                          {t.ai_summary.slice(0, 110)}{t.ai_summary.length > 110 ? '\u2026' : ''}
                        </div>
                      )}
                    </Link>
                  )
                })}

                <Link to="/client/tickets" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.9rem', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 16, textDecoration: 'none', color: '#5C6478', fontSize: '0.82rem', transition: 'all 0.2s' }}
                  onMouseOver={function (e) { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; e.currentTarget.style.color = '#F97316' }}
                  onMouseOut={function (e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#5C6478' }}
                >View all tickets &rarr;</Link>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#F1F3F8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Notifications
                  {unread > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: '#F87171', color: '#fff', fontSize: '0.62rem', fontWeight: 700 }}>{unread}</span>
                  )}
                </div>
                {notifs.length > 0 && <span style={{ fontSize: '0.72rem', color: '#5C6478' }}>{notifs.length} recent</span>}
              </div>

              {notifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
                  <div style={{ color: '#3A3F52', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><Icon name="bell" size={26} strokeWidth={1.5} /></div>
                  <div style={{ fontSize: '0.82rem', color: '#5C6478' }}>No notifications yet</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {notifs.map(function (n) {
                    return (
                      <div key={n.id} className="notif-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.9rem', background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(249,115,22,0.06)', border: '1.5px solid ' + (n.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(249,115,22,0.25)'), borderRadius: 12, cursor: 'pointer' }}>
                        <div style={{ position: 'relative', flexShrink: 0, marginTop: 3 }}>
                          {!n.is_read && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#F97316', animation: 'ping2 1.5s ease-out infinite', opacity: 0.5 }} />}
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? '#3A3F52' : '#F97316', position: 'relative' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', color: n.is_read ? '#8A93A6' : '#F1F3F8', lineHeight: 1.5 }}>{n.message}</div>
                          <div style={{ fontSize: '0.68rem', color: '#5C6478', marginTop: '0.25rem' }}>{helpers.timeAgo(n.created_at)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ background: 'linear-gradient(135deg,rgba(124,111,238,0.1),rgba(249,115,22,0.08))', border: '1.5px solid rgba(124,111,238,0.3)', borderRadius: 16, padding: '1.35rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,111,238,0.18),transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(124,111,238,0.18)', border: '1px solid rgba(124,111,238,0.35)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="brain" size={16} /></div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.87rem', fontWeight: 700, color: '#F1F3F8' }}>AI tip</div>
                  <div style={{ fontSize: '0.68rem', color: '#5C6478' }}>For better classification</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#B0B8C8', lineHeight: 1.7 }}>
                Include <strong style={{ color: '#F1F3F8' }}>when it started</strong>, <strong style={{ color: '#F1F3F8' }}>who is affected</strong>, and <strong style={{ color: '#F1F3F8' }}>what you've already tried</strong> for faster, more accurate AI routing.
              </p>
            </div>

            {stats.total > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.35rem' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.87rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.1rem' }}>Your ticket progress</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { label: 'Resolution rate', val: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0, color: '#34D399' },
                    { label: 'Open rate', val: stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0, color: '#F87171' },
                    { label: 'In progress', val: stats.total > 0 ? Math.round((stats.in_progress / stats.total) * 100) : 0, color: '#B4ACF9' },
                  ].map(function (m) {
                    return (
                      <div key={m.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#8A93A6' }}>{m.label}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: m.color, fontFamily: 'JetBrains Mono,monospace' }}>{m.val}%</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 100, background: m.color, width: m.val + '%', transition: 'width 1s ease' }} />
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