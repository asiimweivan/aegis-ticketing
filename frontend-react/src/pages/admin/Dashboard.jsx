import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { analytics, tickets, users, helpers } from '../../services/api'
import useAuthStore from '../../stores/authStore'

const CAT_COLORS = ['#E8450A','#6460FF','#059669','#D97706','#0EA5E9','#DC2626','#64748B']

/* ── ICON SYSTEM — matches Login/Register/Landing, no emoji ── */
function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'download':
      return <svg {...common}><path d="M12 3v13" /><path d="m6.5 11 5.5 5.5L17.5 11" /><path d="M4 20h16" /></svg>
    case 'bar-chart':
      return <svg {...common}><path d="M3 20h18" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></svg>
    case 'users':
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /><path d="M16 8.5a3 3 0 1 1 0-5.9" /><path d="M14.5 14.3c2.7.3 4.5 2.6 4.5 5.7" /></svg>
    case 'shield':
      return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9.5 12 1.8 1.8L15 10" /></svg>
    case 'ticket':
      return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M10 6.5v11" strokeDasharray="2 2" /></svg>
    case 'circle-dot':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></svg>
    case 'zap':
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
    case 'check-circle':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
    case 'alert':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
    case 'refresh':
      return <svg {...common}><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></svg>
    case 'cpu':
      return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
    case 'repeat':
      return <svg {...common}><path d="M17 2 21 6l-4 4" /><path d="M3 12v-2a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 12v2a4 4 0 0 1-4 4H3" /></svg>
    case 'x':
      return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
    default:
      return null
  }
}

function Card({ children, accent = '#E8450A', style = {} }) {
  return (
    <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:18, position:'relative', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', ...style }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent }} />
      {children}
    </div>
  )
}

function BigStatCard({ label, value, sub, icon, accent, trend }) {
  return (
    <Card accent={accent} style={{ padding:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div style={{ width:42, height:42, borderRadius:12, background:`${accent}15`, border:`1px solid ${accent}30`, color:accent, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name={icon} size={19} /></div>
        {trend !== undefined && (
          <span style={{ fontSize:'0.72rem', fontWeight:700, color: trend >= 0?'#059669':'#DC2626', background: trend >= 0?'#F0FDF4':'#FEF2F2', padding:'0.2rem 0.5rem', borderRadius:100 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'2rem', fontWeight:800, color:'#0F172A', letterSpacing:'-0.03em', lineHeight:1, marginBottom:'0.3rem' }}>{value ?? '—'}</div>
      <div style={{ fontSize:'0.78rem', color:'#64748B', fontWeight:600 }}>{label}</div>
      {sub && <div style={{ fontSize:'0.72rem', color:accent, marginTop:'0.3rem', fontWeight:600 }}>{sub}</div>}
    </Card>
  )
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [retrainMsg, setRetrainMsg] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dash, ticketData, staffData] = await Promise.all([
        analytics.dashboard().catch(e => { console.error('Analytics error:', e); return null }),
        tickets.list({ page_size: 10 }).catch(e => { console.error('Tickets error:', e); return null }),
        users.list().catch(e => { console.error('Users error:', e); return null }),
      ])
      if (dash) setData(dash)
      if (ticketData) setRecentTickets(ticketData.tickets || [])
      if (staffData) setStaffList((Array.isArray(staffData) ? staffData : staffData.users || []).filter(u => u.role === 'staff'))
    } catch (e) { console.error('Dashboard load error:', e) }
    finally { setLoading(false) }
  }

  const retrainML = async () => {
    setRetraining(true); setRetrainMsg('')
    try {
      const res = await analytics.retrainML()
      setRetrainMsg(res.message || 'Model retrained successfully')
    } catch (e) { setRetrainMsg('Retraining failed — need at least 20 resolved tickets.') }
    finally { setRetraining(false) }
  }

  const downloadReport = async () => {
    setDownloading(true)
    setDownloadError('')
    try {
      const res = await tickets.list({ page_size: 100 })
      const all = res?.tickets || []

      if (!all.length) {
        setDownloadError('No tickets found to export yet.')
        setDownloading(false)
        return
      }

      const now = new Date()
      const headers = ['Ticket #','Title','Category','Status','Priority','Client','Assigned To','SLA Due','AI Confidence','Created','Resolved']
      const rows = all.map(t => [
        t.ticket_number || '',
        `"${(t.title||'').replace(/"/g,'""')}"`,
        t.category || '',
        t.status || '',
        t.priority || '',
        t.client?.full_name || '',
        t.assigned_to?.full_name || 'Unassigned',
        t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : 'No SLA',
        t.ai_confidence ? `${Math.round(t.ai_confidence*100)}%` : '—',
        t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '',
        t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('en-GB') : '—',
      ])

      const csvLines = [
        `AEGIS Issue Ticket Report`,
        `Generated: ${now.toLocaleString('en-GB')}`,
        `By: ${user?.email || 'admin'}`,
        `Total tickets: ${all.length}`,
        '',
        headers.join(','),
        ...rows.map(r => r.join(','))
      ]
      const csv = csvLines.join('\n')

      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AEG_Ticket_Report_${now.toISOString().slice(0,10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch(e) {
      console.error('Download report error:', e)
      setDownloadError(e?.message || 'Could not generate report. Check your connection and try again.')
    } finally {
      setDownloading(false)
    }
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Admin'
  const s = data?.stats
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    .admin-tab { padding:0.45rem 1rem; border-radius:8px; font-size:0.82rem; font-weight:600; cursor:pointer; border:none; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.2s; }
    .admin-tab.active { background:#FFF5F2; color:#E8450A; }
    .admin-tab:not(.active) { background:transparent; color:#94A3B8; }
    .admin-tab:not(.active):hover { color:#475569; }
    .ticket-row:hover { background:#F8FAFC !important; }
    .quick-action:hover { border-color:#FED7C8 !important; background:#FFF5F2 !important; transform:translateY(-2px); }
    .staff-row:hover { background:#F8FAFC !important; }
    .dl-btn:hover:not(:disabled) { background:#FED7C8 !important; }
  `

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Command Center"
        subtitle={now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
        actions={
          <div style={{ display:'flex', gap:'0.6rem' }}>
            <button onClick={downloadReport} disabled={downloading} className="dl-btn" style={{ padding:'0.55rem 1.1rem', background:'#FFF5F2', border:'1.5px solid #FED7C8', color:'#C2410C', borderRadius:8, fontSize:'0.82rem', fontWeight:700, cursor:downloading?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:'0.4rem', transition:'all 0.2s', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
              {downloading ? (
                <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(232,69,10,0.25)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#E8450A" strokeWidth="2" strokeLinecap="round"/></svg> Generating...</>
              ) : <><Icon name="download" size={14} /> Download Report</>}
            </button>
            <Link to="/admin/analytics" style={{ padding:'0.55rem 1.1rem', background:'#E8450A', color:'#fff', borderRadius:8, fontSize:'0.82rem', fontWeight:700, textDecoration:'none', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 2px 8px rgba(232,69,10,0.25)', display:'flex', alignItems:'center', gap:'0.4rem' }}><Icon name="bar-chart" size={14} /> Analytics</Link>
            <Link to="/admin/users" style={{ padding:'0.55rem 1.1rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', color:'#475569', borderRadius:8, fontSize:'0.82rem', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:'0.4rem' }}><Icon name="users" size={14} /> Users</Link>
          </div>
        }
      />

      <div style={{ padding:'2rem', fontFamily:'Plus Jakarta Sans,sans-serif', background:'#F8FAFC', minHeight:'100%', animation:'fadeIn 0.5s ease both' }}>

        {downloadError && (
          <div style={{ background:'#FEF2F2', border:'1.5px solid #FECACA', color:'#DC2626', padding:'0.85rem 1.25rem', borderRadius:12, fontSize:'0.85rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.6rem', fontWeight:500 }}>
            <Icon name="alert" size={16} /> {downloadError}
            <button onClick={() => setDownloadError('')} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#DC2626', display:'flex' }}><Icon name="x" size={15} /></button>
          </div>
        )}

        {/* ── WELCOME BANNER ── */}
        <div style={{ position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#FFF5F2 0%,#FFFBEB 50%,#F5F3FF 100%)', border:'1.5px solid #FED7C8', borderRadius:20, padding:'2rem 2.5rem', marginBottom:'2rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,0,0,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.015) 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'#E8450A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(232,69,10,0.35)' }}><Icon name="shield" size={21} /></div>
              <div>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.3rem', fontWeight:800, color:'#0F172A', letterSpacing:'-0.02em' }}>{greeting}, {firstName}</div>
                <div style={{ fontSize:'0.8rem', color:'#64748B', fontWeight:500 }}>
                  Full system visibility · {loading ? '...' : (s?.total ?? 0)} tickets · {staffList.length} staff registered
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', position:'relative', zIndex:1 }}>
            <Link to="/admin/tickets" style={{ padding:'0.65rem 1.25rem', background:'#FFFFFF', border:'1.5px solid #FECACA', color:'#DC2626', borderRadius:10, fontSize:'0.85rem', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'0.4rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <Icon name="circle-dot" size={14} /> {loading ? '...' : (s?.open ?? 0)} open tickets
            </Link>
            <button onClick={downloadReport} disabled={downloading} style={{ padding:'0.65rem 1.25rem', background:'#E8450A', color:'#fff', borderRadius:10, fontSize:'0.85rem', fontWeight:700, border:'none', cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 4px 14px rgba(232,69,10,0.3)', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              {downloading ? (
                <><svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> Generating...</>
              ) : <><Icon name="download" size={14} /> Download Report →</>}
            </button>
          </div>
        </div>

        {/* ── KPI GRID ── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:18, padding:'1.5rem', height:120 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'#F1F5F9', marginBottom:'1rem' }} />
                <div style={{ height:28, background:'#F1F5F9', borderRadius:6, marginBottom:'0.5rem', width:'60%' }} />
                <div style={{ height:12, background:'#F8FAFC', borderRadius:4, width:'80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
            <BigStatCard label="Total Tickets"  value={s?.total ?? 0}  icon="ticket" accent="#E8450A" trend={12} sub="All time" />
            <BigStatCard label="Open Now"       value={s?.open ?? 0}   icon="circle-dot" accent="#DC2626" sub="Needs attention" />
            <BigStatCard label="In Progress"    value={s?.in_progress ?? 0} icon="zap" accent="#6460FF" sub="Being worked on" />
            <BigStatCard label="Resolved"       value={s?.resolved ?? 0} icon="check-circle" accent="#059669" trend={8} sub="Total resolved" />
            <BigStatCard label="SLA Breached"   value={s?.sla_breached ?? 0} icon="alert" accent="#D97706" sub={s?.sla_breached > 0 ? 'Needs review' : 'All on track'} />
            <BigStatCard label="Avg Resolution" value={s?.avg_resolution_hours ? `${s.avg_resolution_hours}h` : '—'} icon="clock" accent="#A78BFF" sub="Per ticket" />
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:10, padding:'0.3rem', width:'fit-content', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          {[['overview','Overview'],['tickets','Recent Tickets'],['staff','Staff Performance']].map(([v,l]) => (
            <button key={v} className={`admin-tab${activeTab===v?' active':''}`} onClick={()=>setActiveTab(v)}>{l}</button>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'0.75rem', marginBottom:'2rem' }}>
          {[
            { to:'/admin/tickets',            icon:'ticket', label:'All Tickets',    color:'#E8450A' },
            { to:'/admin/users',              icon:'users', label:'Manage Users',   color:'#059669' },
            { to:'/admin/analytics',          icon:'bar-chart', label:'Analytics',      color:'#A78BFF' },
            { to:'/admin/tickets?status=open',icon:'circle-dot', label:'Open Issues',    color:'#DC2626' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="quick-action" style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:14, padding:'1.25rem', textAlign:'center', textDecoration:'none', color:'#0F172A', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.6rem', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${a.color}15`, border:`1px solid ${a.color}30`, color:a.color, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name={a.icon} size={20} /></div>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#475569' }}>{a.label}</div>
            </Link>
          ))}
        </div>

        {/* ── MAIN 2-COL ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'1.5rem' }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {(activeTab==='overview'||activeTab==='tickets') && (
              <Card accent="#E8450A" style={{ padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
                  <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#0F172A' }}>Tickets by Category</div>
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.65rem', color:'#94A3B8' }}>ALL TIME</span>
                </div>
                {loading ? (
                  <div style={{ color:'#94A3B8', fontSize:'0.85rem' }}>Loading...</div>
                ) : !data?.category_breakdown?.length ? (
                  <div style={{ color:'#94A3B8', fontSize:'0.85rem', padding:'1rem 0', textAlign:'center' }}>
                    <div style={{ color:'#CBD5E1', marginBottom:'0.5rem', display:'flex', justifyContent:'center' }}><Icon name="bar-chart" size={32} strokeWidth={1.4} /></div>
                    No data yet — submit some tickets first
                  </div>
                ) : data.category_breakdown.map((d, i) => {
                  const max = Math.max(...data.category_breakdown.map(x=>x.count))
                  const c = CAT_COLORS[i % CAT_COLORS.length]
                  return (
                    <div key={d.category} style={{ marginBottom:'0.85rem' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.35rem' }}>
                        <span style={{ fontSize:'0.8rem', color:'#475569', fontWeight:600, textTransform:'capitalize' }}>{d.category}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.72rem', color:c, fontWeight:700 }}>{d.count}</span>
                          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.68rem', color:'#94A3B8' }}>{d.percentage}%</span>
                        </div>
                      </div>
                      <div style={{ height:7, background:'#F1F5F9', borderRadius:100, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:100, background:c, width:`${max>0?(d.count/max*100):0}%`, transition:'width 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
                      </div>
                    </div>
                  )
                })}
              </Card>
            )}

            <Card accent="#6460FF" style={{}}>
              <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#0F172A' }}>Recent Tickets</div>
                <Link to="/admin/tickets" style={{ fontSize:'0.78rem', color:'#E8450A', fontWeight:700, textDecoration:'none' }}>View all →</Link>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 90px 85px 85px', gap:'0.75rem', padding:'0.65rem 1.5rem', borderBottom:'1px solid #F8FAFC' }}>
                {['ID','Title','Status','Priority','Time'].map(h => (
                  <span key={h} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.62rem', color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase' }}>{h}</span>
                ))}
              </div>
              {loading ? (
                <div style={{ padding:'2.5rem', textAlign:'center' }}>
                  <div style={{ width:32, height:32, border:'3px solid #FED7C8', borderTopColor:'#E8450A', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 0.75rem' }} />
                  <div style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Loading tickets...</div>
                </div>
              ) : !recentTickets.length ? (
                <div style={{ padding:'2.5rem', textAlign:'center', color:'#94A3B8', fontSize:'0.85rem' }}>No tickets yet</div>
              ) : recentTickets.map(t => (
                <Link key={t.id} to={`/staff/tickets/${t.id}`} className="ticket-row" style={{ display:'grid', gridTemplateColumns:'120px 1fr 90px 85px 85px', gap:'0.75rem', alignItems:'center', padding:'0.9rem 1.5rem', borderBottom:'1px solid #F8FAFC', textDecoration:'none', color:'#0F172A', transition:'background 0.15s' }}>
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.7rem', color:'#94A3B8' }}>{t.ticket_number}</span>
                  <span style={{ fontSize:'0.82rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</span>
                  <span><StatusBadge status={t.status} /></span>
                  <span><PriorityBadge priority={t.priority} /></span>
                  <span style={{ fontSize:'0.72rem', color:'#94A3B8' }}>{helpers.timeAgo(t.created_at)}</span>
                </Link>
              ))}
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            <Card accent="#059669" style={{ padding:'1.5rem' }}>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#0F172A', marginBottom:'1.25rem' }}>System Health</div>
              {loading ? (
                <div style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Loading...</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                  {[
                    { label:'SLA compliance',  val: s?.total ? Math.round((1-(s.sla_breached||0)/Math.max(s.total,1))*100) : 100, color:'#059669' },
                    { label:'Resolution rate', val: s?.total ? Math.round(((s.resolved||0)/s.total)*100) : 0, color:'#A78BFF' },
                    { label:'Queue load',      val: s?.total ? Math.round(((s.open||0)/s.total)*100) : 0, color:'#D97706' },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
                        <span style={{ fontSize:'0.78rem', color:'#64748B', fontWeight:500 }}>{m.label}</span>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.78rem', color:m.color, fontWeight:700 }}>{m.val}%</span>
                      </div>
                      <div style={{ height:6, background:'#F1F5F9', borderRadius:100, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:100, background:m.color, width:`${m.val}%`, transition:'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card accent="#A78BFF" style={{ padding:'1.5rem' }}>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#0F172A', marginBottom:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                Staff Leaderboard
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.62rem', color:'#94A3B8' }}>RESOLUTION RATE</span>
              </div>
              {loading ? (
                <div style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Loading...</div>
              ) : !data?.top_staff?.length ? (
                <div style={{ color:'#94A3B8', fontSize:'0.82rem', lineHeight:1.6 }}>
                  No staff data yet.
                  {staffList.length > 0 && <span> {staffList.length} staff registered — assign tickets to see leaderboard.</span>}
                </div>
              ) : data.top_staff.map((st, idx) => {
                const initials = st.staff.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
                const rankColors = ['#D97706','#A78BFF','#059669']
                const rc = rankColors[idx] || '#94A3B8'
                return (
                  <div key={st.staff.id} className="staff-row" style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 0', borderBottom:'1px solid #F8FAFC', transition:'background 0.15s' }}>
                    <div style={{ width:22, fontFamily:'JetBrains Mono,monospace', fontSize:'0.72rem', color:rc, fontWeight:700 }}>#{idx+1}</div>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:`${rc}18`, border:`1px solid ${rc}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:rc, flexShrink:0 }}>{initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{st.staff.full_name}</div>
                      <div style={{ fontSize:'0.7rem', color:'#94A3B8' }}>{st.assigned} assigned · {st.resolved} resolved</div>
                    </div>
                    <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:800, color:rc }}>{st.resolution_rate}%</div>
                  </div>
                )
              })}
            </Card>

            <Card accent="#D97706" style={{ padding:'1.5rem' }}>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#0F172A', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Icon name="repeat" size={16} /> Recurring Issues</div>
              {loading ? (
                <div style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Loading...</div>
              ) : !data?.recurring_issues?.length ? (
                <div style={{ color:'#94A3B8', fontSize:'0.82rem', lineHeight:1.6 }}>No recurring patterns yet. More resolved tickets needed.</div>
              ) : data.recurring_issues.map((issue, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 0', borderBottom:'1px solid #F8FAFC' }}>
                  <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#D97706', fontFamily:'JetBrains Mono,monospace', background:'#FFFBEB', border:'1px solid #FDE68A', padding:'0.2rem 0.5rem', borderRadius:6 }}>{issue.frequency}×</div>
                  <span style={{ fontSize:'0.8rem', color:'#475569', flex:1, fontWeight:500 }}>{issue.issue}</span>
                </div>
              ))}
            </Card>

            <Card accent="#059669" style={{ padding:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.75rem' }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'#ECFDF5', border:'1px solid #A7F3D0', color:'#059669', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="cpu" size={16} /></div>
                <div>
                  <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.9rem', fontWeight:700, color:'#0F172A' }}>AI Model</div>
                  <div style={{ fontSize:'0.7rem', color:'#94A3B8' }}>TF-IDF + Logistic Regression</div>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#059669', animation:'pulse2 2s ease-in-out infinite' }} />
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.62rem', color:'#059669', fontWeight:700 }}>ACTIVE</span>
                </div>
              </div>
              <p style={{ fontSize:'0.78rem', color:'#64748B', lineHeight:1.6, marginBottom:'1rem' }}>
                Retrain the classification model on resolved tickets to improve accuracy over time. Requires 20+ resolved tickets.
              </p>
              <button onClick={retrainML} disabled={retraining} style={{ width:'100%', padding:'0.75rem', background:retraining?'#F1F5F9':'#ECFDF5', border:'1.5px solid #A7F3D0', color:'#059669', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.85rem', fontWeight:700, borderRadius:10, cursor:retraining?'not-allowed':'pointer', opacity:retraining?0.6:1, transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
                {retraining ? (
                  <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(5,150,105,0.25)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg> Training in progress...</>
                ) : <><Icon name="refresh" size={15} /> Retrain ML Model</>}
              </button>
              {retrainMsg && (
                <div style={{ marginTop:'0.75rem', fontSize:'0.75rem', color:retrainMsg.includes('fail')||retrainMsg.includes('need')?'#DC2626':'#059669', lineHeight:1.5, padding:'0.5rem 0.75rem', background:'#F8FAFC', borderRadius:8, fontWeight:500 }}>{retrainMsg}</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
