import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, notifications, helpers } from '../../services/api'
import useAuthStore from '../../stores/authStore'

/* ── ICON SYSTEM — matches Login/Register/Landing/AdminDashboard, no emoji ── */
function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" /></svg>
    case 'moon':
      return <svg {...common}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" /></svg>
    case 'rocket':
      return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
    case 'cpu':
      return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
    case 'zap':
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
    case 'check-circle':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
    case 'bell':
      return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
    case 'edit':
      return <svg {...common}><path d="M4 20h4l10.5-10.5a2 2 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
    case 'list':
      return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="0.9" fill="currentColor" stroke="none" /></svg>
    case 'circle-dot':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></svg>
    case 'ticket':
      return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M10 6.5v11" strokeDasharray="2 2" /></svg>
    case 'brain':
      return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
    default:
      return null
  }
}

const STATUS_CONFIG = {
  open:        { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Open' },
  in_progress: { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', label: 'In Progress' },
  pending:     { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Pending' },
  resolved:    { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Resolved' },
  closed:      { color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', label: 'Closed' },
}

const PRI_CONFIG = {
  critical: { color: '#DC2626', label: 'Critical' },
  high:     { color: '#EA580C', label: 'High' },
  medium:   { color: '#D97706', label: 'Medium' },
  low:      { color: '#059669', label: 'Low' },
}

function StatusPill({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.open
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.7rem', borderRadius:100, fontSize:'0.7rem', fontWeight:600, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:c.color, display:'inline-block' }} />
      {c.label}
    </span>
  )
}

function PriPill({ priority }) {
  const c = PRI_CONFIG[priority] || PRI_CONFIG.medium
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.68rem', fontWeight:600, color:c.color }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:c.color, display:'inline-block' }} />
      {c.label}
    </span>
  )
}

export default function ClientDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ total:0, open:0, in_progress:0, resolved:0 })
  const [recentTickets, setRecentTickets] = useState([])
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [ticketData, notifData] = await Promise.all([
        tickets.list({ page_size: 100 }),
        notifications.list(),
      ])
      if (ticketData) {
        const all = ticketData.tickets
        setStats({
          total: ticketData.total,
          open: all.filter(t => t.status === 'open').length,
          in_progress: all.filter(t => t.status === 'in_progress').length,
          resolved: all.filter(t => ['resolved','closed'].includes(t.status)).length,
        })
        setRecentTickets(all.slice(0, 6))
      }
      if (notifData) setNotifs(notifData.slice(0, 5))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greetIcon = hour < 12 ? 'sun' : hour < 17 ? 'sun' : 'moon'
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const unread = notifs.filter(n => !n.is_read).length

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes fadeIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes ping2   { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
    @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    .tkt-card { transition: all 0.2s; }
    .tkt-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(232,69,10,0.12) !important; border-color:#FED7C8 !important; }
    .qa-btn  { transition: all 0.2s; }
    .qa-btn:hover { transform: translateY(-3px) !important; }
    .notif-item { transition: all 0.2s; }
    .notif-item:hover { background: #F1F5F9 !important; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: #FED7C8; border-radius: 3px; }
  `

  const statCards = [
    { label:'Total Tickets', value:stats.total,       icon:'ticket', accent:'#E8450A', grad:'linear-gradient(135deg,rgba(232,69,10,0.08),rgba(232,69,10,0.02))',   border:'#FED7C8',  to:'/client/tickets' },
    { label:'Open',          value:stats.open,        icon:'circle-dot', accent:'#DC2626', grad:'linear-gradient(135deg,rgba(220,38,38,0.08),rgba(220,38,38,0.02))', border:'#FECACA', to:'/client/tickets?status=open' },
    { label:'In Progress',   value:stats.in_progress, icon:'zap', accent:'#7C3AED', grad:'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(124,58,237,0.02))',   border:'#DDD6FE',  to:'/client/tickets?status=in_progress' },
    { label:'Resolved',      value:stats.resolved,    icon:'check-circle', accent:'#059669', grad:'linear-gradient(135deg,rgba(5,150,105,0.08),rgba(5,150,105,0.02))',   border:'#A7F3D0',  to:'/client/tickets?status=resolved' },
  ]

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="My Dashboard"
        subtitle={new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        actions={
          <Link to="/client/new-ticket" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.65rem 1.35rem', background:'#E8450A', color:'#fff', borderRadius:100, fontSize:'0.85rem', fontWeight:700, textDecoration:'none', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 4px 14px rgba(232,69,10,0.3)', transition:'all 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.transform='translateY(-1px)'}
            onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}
          >+ New Ticket</Link>
        }
      />

      <div style={{ padding:'2rem', fontFamily:'Plus Jakarta Sans,sans-serif', background:'#F8FAFC', minHeight:'100%', animation:'fadeIn 0.5s ease both' }}>

        {/* ── HERO WELCOME BANNER ── */}
        <div style={{ position:'relative', overflow:'hidden', borderRadius:22, marginBottom:'2rem', padding:'2.5rem 2.5rem 2rem', background:'linear-gradient(135deg,#FFFFFF 0%,#FFF9F5 50%,#FFFFFF 100%)', border:'1.5px solid #FED7C8', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,69,10,0.06),transparent 70%)', top:-80, right:80, pointerEvents:'none', filter:'blur(40px)' }} />
          <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.05),transparent 70%)', bottom:-60, right:20, pointerEvents:'none', filter:'blur(30px)' }} />
          {/* Grid pattern */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize:'30px 30px', pointerEvents:'none', opacity:0.6 }} />

          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.78rem', fontWeight:600, color:'#E8450A', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'JetBrains Mono,monospace', marginBottom:'0.6rem' }}><Icon name={greetIcon} size={13} /> {greeting}</div>
              <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'clamp(1.5rem,3vw,2.1rem)', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'0.6rem' }}>
                {firstName},<br/>
                <span style={{ background:'linear-gradient(90deg,#E8450A,#7C3AED)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>how can we help you today?</span>
              </h2>
              <p style={{ color:'#64748B', fontSize:'0.875rem', lineHeight:1.6, maxWidth:400 }}>
                Submit a ticket and our AI will classify it, set priority, and route it to the right team — instantly.
              </p>
            </div>

            {/* CTA card */}
            <div style={{ background:'#FFF5F2', border:'1.5px solid #FED7C8', borderRadius:16, padding:'1.5rem', minWidth:220, animation:'float 5s ease-in-out infinite' }}>
              <div style={{ fontSize:'0.72rem', color:'#E8450A', fontFamily:'JetBrains Mono,monospace', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.5rem' }}>Quick submit</div>
              <div style={{ fontSize:'0.82rem', color:'#64748B', lineHeight:1.5, marginBottom:'1rem' }}>Describe your issue and AI handles the rest</div>
              <Link to="/client/new-ticket" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', padding:'0.75rem 1.25rem', background:'#E8450A', color:'#fff', borderRadius:100, fontSize:'0.85rem', fontWeight:700, textDecoration:'none', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 4px 14px rgba(232,69,10,0.3)' }}>
                <Icon name="rocket" size={15} /> Submit a ticket
              </Link>
            </div>
          </div>

          {/* Bottom stats inline */}
          <div style={{ position:'relative', zIndex:1, display:'flex', gap:'2rem', marginTop:'2rem', paddingTop:'1.5rem', borderTop:'1px solid #F1F5F9', flexWrap:'wrap' }}>
            {[['cpu','AI-classified','Instant'],['zap','Avg resolution','6 hours'],['check-circle','SLA tracking','Live'],['bell','Notifications','Real-time']].map(([ic,l,v]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ color:'#E8450A', display:'flex' }}><Icon name={ic} size={16} /></span>
                <div>
                  <div style={{ fontSize:'0.7rem', color:'#94A3B8', lineHeight:1 }}>{l}</div>
                  <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#334155', lineHeight:1.3 }}>{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {statCards.map(c => (
            <Link key={c.label} to={c.to} style={{ textDecoration:'none', display:'block', borderRadius:18, padding:'1.5rem', background:'#FFFFFF', border:`1.5px solid ${c.border}`, position:'relative', overflow:'hidden', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 12px 32px ${c.accent}22`}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.03)'}}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:c.accent }} />
              <div style={{ color:c.accent, marginBottom:'0.85rem' }}><Icon name={c.icon} size={26} strokeWidth={1.6} /></div>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'2rem', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', lineHeight:1, marginBottom:'0.3rem' }}>{c.value}</div>
              <div style={{ fontSize:'0.78rem', fontWeight:500, color:'#64748B' }}>{c.label}</div>
            </Link>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:600, color:'#94A3B8', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'JetBrains Mono,monospace', marginBottom:'0.85rem' }}>Quick actions</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'0.75rem' }}>
            {[
              { to:'/client/new-ticket',          icon:'edit', label:'New Ticket',   accent:'#E8450A' },
              { to:'/client/tickets',              icon:'list', label:'All Tickets',  accent:'#7C3AED' },
              { to:'/client/tickets?status=open',  icon:'circle-dot', label:'Open Issues',  accent:'#DC2626' },
              { to:'/client/tickets?status=resolved',icon:'check-circle',label:'Resolved',   accent:'#059669' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="qa-btn" style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:14, padding:'1.25rem', textAlign:'center', textDecoration:'none', color:'#0F172A', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.6rem', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor=`${a.accent}40`;e.currentTarget.style.background=`${a.accent}08`}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='#F1F5F9';e.currentTarget.style.background='#FFFFFF'}}
              >
                <div style={{ width:42, height:42, borderRadius:12, background:`${a.accent}15`, border:`1px solid ${a.accent}30`, color:a.accent, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name={a.icon} size={19} /></div>
                <div style={{ fontSize:'0.78rem', fontWeight:600, color:'#475569' }}>{a.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── TWO COLUMNS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', alignItems:'start' }}>

          {/* LEFT — Recent tickets */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <div>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:700, color:'#0F172A' }}>Recent Tickets</div>
                <div style={{ fontSize:'0.72rem', color:'#94A3B8', marginTop:'0.1rem' }}>Your latest support requests</div>
              </div>
              <Link to="/client/tickets" style={{ fontSize:'0.78rem', color:'#E8450A', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:'0.3rem' }}>View all →</Link>
            </div>

            {loading ? (
              <div style={{ padding:'3rem', textAlign:'center' }}>
                <div style={{ width:36, height:36, border:'3px solid #FED7C8', borderTopColor:'#E8450A', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }} />
                <div style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Loading your tickets...</div>
              </div>
            ) : recentTickets.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3.5rem 2rem', background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:18, boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ color:'#CBD5E1', marginBottom:'1rem', display:'flex', justifyContent:'center' }}><Icon name="ticket" size={44} strokeWidth={1.4} /></div>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:700, color:'#0F172A', marginBottom:'0.5rem' }}>No tickets yet</div>
                <p style={{ fontSize:'0.85rem', color:'#94A3B8', marginBottom:'1.5rem', lineHeight:1.6 }}>Submit your first ticket and our AI will classify it instantly.</p>
                <Link to="/client/new-ticket" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.7rem 1.5rem', background:'#E8450A', color:'#fff', borderRadius:100, fontSize:'0.85rem', fontWeight:700, textDecoration:'none', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 4px 14px rgba(232,69,10,0.3)' }}><Icon name="rocket" size={15} /> Submit a ticket</Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {recentTickets.map(t => {
                  const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.open
                  const pc = PRI_CONFIG[t.priority] || PRI_CONFIG.medium
                  return (
                    <Link key={t.id} to={`/client/tickets/${t.id}`} className="tkt-card" style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:16, padding:'1.25rem 1.4rem', textDecoration:'none', color:'#0F172A', display:'block', position:'relative', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                      {/* Left accent bar */}
                      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:pc.color, borderRadius:'3px 0 0 3px' }} />

                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.6rem' }}>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.65rem', color:'#94A3B8', background:'#F8FAFC', padding:'0.12rem 0.45rem', borderRadius:5 }}>{t.ticket_number}</span>
                        <StatusPill status={t.status} />
                        <span style={{ marginLeft:'auto', fontSize:'0.7rem', color:'#94A3B8' }}>{helpers.timeAgo(t.created_at)}</span>
                      </div>

                      <div style={{ fontSize:'0.9rem', fontWeight:600, color:'#0F172A', lineHeight:1.4, marginBottom:'0.5rem' }}>{t.title}</div>

                      <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                        <PriPill priority={t.priority} />
                        <span style={{ fontSize:'0.72rem', color:'#94A3B8' }}>{helpers.categoryLabel(t.category)}</span>
                        {t.assigned_to && (
                          <span style={{ fontSize:'0.7rem', color:'#94A3B8', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                            <span style={{ width:16, height:16, borderRadius:'50%', background:'#F5F3FF', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'#7C3AED' }}>
                              {t.assigned_to.full_name?.[0]?.toUpperCase()}
                            </span>
                            {t.assigned_to.full_name}
                          </span>
                        )}
                      </div>

                      {t.ai_summary && (
                        <div style={{ marginTop:'0.75rem', background:'#FFF5F2', border:'1px solid #FED7C8', borderRadius:10, padding:'0.6rem 0.85rem', fontSize:'0.75rem', color:'#64748B', lineHeight:1.55, display:'flex', alignItems:'flex-start', gap:'0.4rem' }}>
                          <span style={{ flexShrink:0, color:'#E8450A' }}><Icon name="cpu" size={13} /></span>
                          {t.ai_summary.slice(0, 110)}{t.ai_summary.length > 110 ? '…' : ''}
                        </div>
                      )}
                    </Link>
                  )
                })}

                <Link to="/client/tickets" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', padding:'0.85rem', background:'#F8FAFC', border:'1.5px dashed #E2E8F0', borderRadius:16, textDecoration:'none', color:'#94A3B8', fontSize:'0.82rem', transition:'all 0.2s' }}
                  onMouseOver={e=>{e.currentTarget.style.borderColor='#FED7C8';e.currentTarget.style.color='#E8450A'}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor='#E2E8F0';e.currentTarget.style.color='#94A3B8'}}
                >View all tickets →</Link>
              </div>
            )}
          </div>

          {/* RIGHT — Notifications + AI tip */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Notifications */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:700, color:'#0F172A', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  Notifications
                  {unread > 0 && (
                    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:18, height:18, borderRadius:'50%', background:'#DC2626', color:'#fff', fontSize:'0.62rem', fontWeight:700 }}>{unread}</span>
                  )}
                </div>
                {notifs.length > 0 && <span style={{ fontSize:'0.72rem', color:'#94A3B8' }}>{notifs.length} recent</span>}
              </div>

              {notifs.length === 0 ? (
                <div style={{ textAlign:'center', padding:'2rem', background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ color:'#CBD5E1', marginBottom:'0.5rem', display:'flex', justifyContent:'center' }}><Icon name="bell" size={26} strokeWidth={1.5} /></div>
                  <div style={{ fontSize:'0.82rem', color:'#94A3B8' }}>No notifications yet</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {notifs.map(n => (
                    <div key={n.id} className="notif-item" style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.85rem', background: n.is_read ? '#FFFFFF' : '#FFF5F2', border:`1.5px solid ${n.is_read ? '#F1F5F9' : '#FED7C8'}`, borderRadius:12, cursor:'pointer' }}>
                      <div style={{ position:'relative', flexShrink:0, marginTop:3 }}>
                        {!n.is_read && <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#E8450A', animation:'ping2 1.5s ease-out infinite', opacity:0.5 }} />}
                        <div style={{ width:8, height:8, borderRadius:'50%', background: n.is_read ? '#E2E8F0' : '#E8450A', position:'relative' }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.8rem', color: n.is_read ? '#64748B' : '#0F172A', lineHeight:1.5 }}>{n.message}</div>
                        <div style={{ fontSize:'0.68rem', color:'#94A3B8', marginTop:'0.2rem' }}>{helpers.timeAgo(n.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI tip card */}
            <div style={{ background:'linear-gradient(135deg,#F5F3FF,#FFF5F2)', border:'1.5px solid #DDD6FE', borderRadius:16, padding:'1.25rem', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)', pointerEvents:'none' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.75rem' }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'#EDE9FE', border:'1px solid #DDD6FE', color:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="brain" size={16} /></div>
                <div>
                  <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.85rem', fontWeight:700, color:'#0F172A' }}>AI tip</div>
                  <div style={{ fontSize:'0.68rem', color:'#94A3B8' }}>For better classification</div>
                </div>
              </div>
              <p style={{ fontSize:'0.8rem', color:'#64748B', lineHeight:1.65 }}>
                Include <strong style={{ color:'#334155' }}>when it started</strong>, <strong style={{ color:'#334155' }}>who is affected</strong>, and <strong style={{ color:'#334155' }}>what you've already tried</strong> for faster, more accurate AI routing.
              </p>
            </div>

            {/* Progress card */}
            {stats.total > 0 && (
              <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:16, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.85rem', fontWeight:700, color:'#0F172A', marginBottom:'1rem' }}>Your ticket progress</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  {[
                    { label:'Resolution rate', val: stats.total > 0 ? Math.round((stats.resolved/stats.total)*100) : 0, color:'#059669' },
                    { label:'Open rate',        val: stats.total > 0 ? Math.round((stats.open/stats.total)*100) : 0,     color:'#DC2626' },
                    { label:'In progress',      val: stats.total > 0 ? Math.round((stats.in_progress/stats.total)*100) : 0, color:'#7C3AED' },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
                        <span style={{ fontSize:'0.75rem', color:'#64748B' }}>{m.label}</span>
                        <span style={{ fontSize:'0.75rem', fontWeight:600, color:m.color, fontFamily:'JetBrains Mono,monospace' }}>{m.val}%</span>
                      </div>
                      <div style={{ height:5, background:'#F1F5F9', borderRadius:100, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:100, background:m.color, width:`${m.val}%`, transition:'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
