import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { analytics, tickets, users, helpers } from '../../services/api'
import useAuthStore from '../../stores/authStore'

var CAT_COLORS = ['#F97316', '#7C6FEE', '#34D399', '#FBBF24', '#0EA5E9', '#F87171', '#8A93A6']

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'download') return <svg {...common}><path d="M12 3v13" /><path d="m6.5 11 5.5 5.5L17.5 11" /><path d="M4 20h16" /></svg>
  if (name === 'bar-chart') return <svg {...common}><path d="M3 20h18" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></svg>
  if (name === 'users') return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /><path d="M16 8.5a3 3 0 1 1 0-5.9" /><path d="M14.5 14.3c2.7.3 4.5 2.6 4.5 5.7" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9.5 12 1.8 1.8L15 10" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'circle-dot') return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  if (name === 'refresh') return <svg {...common}><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'repeat') return <svg {...common}><path d="M17 2 21 6l-4 4" /><path d="M3 12v-2a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 12v2a4 4 0 0 1-4 4H3" /></svg>
  if (name === 'x') return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  return null
}

function Card(props) {
  var accent = props.accent || '#F97316'
  var style = props.style || {}
  return (
    <div style={Object.assign({ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, position: 'relative', overflow: 'hidden' }, style)}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      {props.children}
    </div>
  )
}

function BigStatCard(props) {
  var label = props.label, value = props.value, sub = props.sub, icon = props.icon, accent = props.accent, trend = props.trend
  return (
    <Card accent={accent} style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: accent + '1A', border: '1px solid ' + accent + '40', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={19} /></div>
        {trend !== undefined && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: trend >= 0 ? '#34D399' : '#F87171', background: trend >= 0 ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', padding: '0.2rem 0.5rem', borderRadius: 100 }}>
            {trend >= 0 ? '\u2191' : '\u2193'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '2rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.3rem' }}>{value != null ? value : '\u2014'}</div>
      <div style={{ fontSize: '0.78rem', color: '#8A93A6', fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: accent, marginTop: '0.3rem', fontWeight: 600 }}>{sub}</div>}
    </Card>
  )
}

export default function AdminDashboard() {
  var authStore = useAuthStore()
  var user = authStore.user
  var dataArr = useState(null)
  var data = dataArr[0]
  var setData = dataArr[1]
  var recentTicketsArr = useState([])
  var recentTickets = recentTicketsArr[0]
  var setRecentTickets = recentTicketsArr[1]
  var staffListArr = useState([])
  var staffList = staffListArr[0]
  var setStaffList = staffListArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var retrainingArr = useState(false)
  var retraining = retrainingArr[0]
  var setRetraining = retrainingArr[1]
  var retrainMsgArr = useState('')
  var retrainMsg = retrainMsgArr[0]
  var setRetrainMsg = retrainMsgArr[1]
  var downloadingArr = useState(false)
  var downloading = downloadingArr[0]
  var setDownloading = downloadingArr[1]
  var downloadErrorArr = useState('')
  var downloadError = downloadErrorArr[0]
  var setDownloadError = downloadErrorArr[1]
  var activeTabArr = useState('overview')
  var activeTab = activeTabArr[0]
  var setActiveTab = activeTabArr[1]

  useEffect(function () { loadData() }, [])

  function loadData() {
    setLoading(true)
    Promise.all([
      analytics.dashboard().catch(function (e) { console.error('Analytics error:', e); return null }),
      tickets.list({ page_size: 10 }).catch(function (e) { console.error('Tickets error:', e); return null }),
      users.list().catch(function (e) { console.error('Users error:', e); return null }),
    ]).then(function (results) {
      var dash = results[0], ticketData = results[1], staffData = results[2]
      if (dash) setData(dash)
      if (ticketData) setRecentTickets(ticketData.tickets || [])
      if (staffData) setStaffList((Array.isArray(staffData) ? staffData : staffData.users || []).filter(function (u) { return u.role === 'staff' }))
    }).catch(function (e) { console.error('Dashboard load error:', e) }).finally(function () { setLoading(false) })
  }

  function retrainML() {
    setRetraining(true); setRetrainMsg('')
    analytics.retrainML().then(function (res) {
      setRetrainMsg((res && res.message) || 'Model retrained successfully')
    }).catch(function () { setRetrainMsg('Retraining failed - need at least 20 resolved tickets.') })
      .finally(function () { setRetraining(false) })
  }

  function downloadReport() {
    setDownloading(true)
    setDownloadError('')
    tickets.list({ page_size: 100 }).then(function (res) {
      var all = (res && res.tickets) || []

      if (!all.length) {
        setDownloadError('No tickets found to export yet.')
        setDownloading(false)
        return
      }

      var now2 = new Date()
      var headers = ['Ticket #', 'Title', 'Category', 'Status', 'Priority', 'Client', 'Assigned To', 'SLA Due', 'AI Confidence', 'Created', 'Resolved']
      var rows = all.map(function (t) {
        return [
          t.ticket_number || '',
          '"' + (t.title || '').replace(/"/g, '""') + '"',
          t.category || '',
          t.status || '',
          t.priority || '',
          (t.client && t.client.full_name) || '',
          (t.assigned_to && t.assigned_to.full_name) || 'Unassigned',
          t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : 'No SLA',
          t.ai_confidence ? Math.round(t.ai_confidence * 100) + '%' : '\u2014',
          t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '',
          t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('en-GB') : '\u2014',
        ]
      })

      var csvLines = [
        'AEGIS Issue Ticket Report',
        'Generated: ' + now2.toLocaleString('en-GB'),
        'By: ' + ((user && user.email) || 'admin'),
        'Total tickets: ' + all.length,
        '',
        headers.join(','),
      ].concat(rows.map(function (r) { return r.join(',') }))
      var csv = csvLines.join('\n')

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      var url = URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = url
      a.download = 'AEG_Ticket_Report_' + now2.toISOString().slice(0, 10) + '.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }).catch(function (e) {
      console.error('Download report error:', e)
      setDownloadError((e && e.message) || 'Could not generate report. Check your connection and try again.')
    }).finally(function () { setDownloading(false) })
  }

  var firstName = (user && user.full_name && user.full_name.split(' ')[0]) || 'Admin'
  var s = data && data.stats
  var now = new Date()
  var hour = now.getHours()
  var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.4} }\n    @keyframes spin   { to{transform:rotate(360deg)} }\n    .admin-tab { padding:0.45rem 1rem; border-radius:8px; font-size:0.82rem; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }\n    .admin-tab.active { background:rgba(249,115,22,0.12); color:#F97316; }\n    .admin-tab:not(.active) { background:transparent; color:#8A93A6; }\n    .admin-tab:not(.active):hover { color:#D6DCE8; }\n    .ticket-row:hover { background:rgba(255,255,255,0.03) !important; }\n    .quick-action:hover { border-color:rgba(249,115,22,0.3) !important; background:rgba(249,115,22,0.04) !important; transform:translateY(-3px); }\n    .staff-row:hover { background:rgba(255,255,255,0.03) !important; }\n    .dl-btn:hover:not(:disabled) { background:rgba(249,115,22,0.18) !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Command Center"
        subtitle={now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={downloadReport} disabled={downloading} className="dl-btn" style={{ padding: '0.55rem 1.1rem', background: 'rgba(249,115,22,0.1)', border: '1.5px solid rgba(249,115,22,0.3)', color: '#FDBA74', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', fontFamily: "'Sora',sans-serif" }}>
              {downloading ? (
                <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(249,115,22,0.25)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#F97316" strokeWidth="2" strokeLinecap="round" /></svg> Generating...</>
              ) : <><Icon name="download" size={14} /> Download Report</>}
            </button>
            <Link to="/admin/analytics" style={{ padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 14px rgba(232,69,10,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Icon name="bar-chart" size={14} /> Analytics</Link>
            <Link to="/admin/users" style={{ padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#D6DCE8', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Icon name="users" size={14} /> Users</Link>
          </div>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.5s ease both' }}>

        {downloadError && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1.5px solid rgba(248,113,113,0.3)', color: '#FCA5A5', padding: '0.85rem 1.25rem', borderRadius: 12, fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 500 }}>
            <Icon name="alert" size={16} /> {downloadError}
            <button onClick={function () { setDownloadError('') }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#FCA5A5', display: 'flex' }}><Icon name="x" size={15} /></button>
          </div>
        )}

        {/* WELCOME BANNER */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(232,69,10,0.1) 0%,rgba(124,111,238,0.08) 100%)', border: '1.5px solid rgba(249,115,22,0.25)', borderRadius: 20, padding: '2rem 2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(232,69,10,0.4)' }}><Icon name="shield" size={21} /></div>
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em' }}>{greeting}, {firstName}</div>
                <div style={{ fontSize: '0.8rem', color: '#8A93A6', fontWeight: 500 }}>
                  Full system visibility &middot; {loading ? '...' : ((s && s.total) || 0)} tickets &middot; {staffList.length} staff registered
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Link to="/admin/tickets" style={{ padding: '0.65rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(248,113,113,0.3)', color: '#FCA5A5', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Icon name="circle-dot" size={14} /> {loading ? '...' : ((s && s.open) || 0)} open tickets
            </Link>
            <button onClick={downloadReport} disabled={downloading} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 14px rgba(232,69,10,0.35)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {downloading ? (
                <><svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg> Generating...</>
              ) : <><Icon name="download" size={14} /> Download Report \u2192</>}
            </button>
          </div>
        </div>

        {/* KPI GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[1, 2, 3, 4, 5, 6].map(function (i) {
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.5rem', height: 120 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.05)', marginBottom: '1rem' }} />
                  <div style={{ height: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: '0.5rem', width: '60%' }} />
                  <div style={{ height: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 4, width: '80%' }} />
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <BigStatCard label="Total Tickets" value={(s && s.total) || 0} icon="ticket" accent="#F97316" trend={12} sub="All time" />
            <BigStatCard label="Open Now" value={(s && s.open) || 0} icon="circle-dot" accent="#F87171" sub="Needs attention" />
            <BigStatCard label="In Progress" value={(s && s.in_progress) || 0} icon="zap" accent="#7C6FEE" sub="Being worked on" />
            <BigStatCard label="Resolved" value={(s && s.resolved) || 0} icon="check-circle" accent="#34D399" trend={8} sub="Total resolved" />
            <BigStatCard label="SLA Breached" value={(s && s.sla_breached) || 0} icon="alert" accent="#FBBF24" sub={s && s.sla_breached > 0 ? 'Needs review' : 'All on track'} />
            <BigStatCard label="Avg Resolution" value={s && s.avg_resolution_hours ? s.avg_resolution_hours + 'h' : '\u2014'} icon="clock" accent="#B4ACF9" sub="Per ticket" />
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.3rem', width: 'fit-content' }}>
          {[['overview', 'Overview'], ['tickets', 'Recent Tickets'], ['staff', 'Staff Performance']].map(function (pair) {
            var v = pair[0], l = pair[1]
            return <button key={v} className={'admin-tab' + (activeTab === v ? ' active' : '')} onClick={function () { setActiveTab(v) }}>{l}</button>
          })}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { to: '/admin/tickets', icon: 'ticket', label: 'All Tickets', color: '#F97316' },
            { to: '/admin/users', icon: 'users', label: 'Manage Users', color: '#34D399' },
            { to: '/admin/analytics', icon: 'bar-chart', label: 'Analytics', color: '#B4ACF9' },
            { to: '/admin/tickets?status=open', icon: 'circle-dot', label: 'Open Issues', color: '#F87171' },
          ].map(function (a) {
            return (
              <Link key={a.to} to={a.to} className="quick-action" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', textAlign: 'center', textDecoration: 'none', color: '#F1F3F8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: a.color + '1A', border: '1px solid ' + a.color + '40', color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={a.icon} size={20} /></div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#D6DCE8' }}>{a.label}</div>
              </Link>
            )
          })}
        </div>

        {/* MAIN 2-COL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {(activeTab === 'overview' || activeTab === 'tickets') && (
              <Card accent="#F97316" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8' }}>Tickets by Category</div>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.65rem', color: '#5C6478' }}>ALL TIME</span>
                </div>
                {loading ? (
                  <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading...</div>
                ) : !(data && data.category_breakdown && data.category_breakdown.length) ? (
                  <div style={{ color: '#5C6478', fontSize: '0.85rem', padding: '1rem 0', textAlign: 'center' }}>
                    <div style={{ color: '#3A3F52', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><Icon name="bar-chart" size={32} strokeWidth={1.4} /></div>
                    No data yet - submit some tickets first
                  </div>
                ) : data.category_breakdown.map(function (d, i) {
                  var max = Math.max.apply(null, data.category_breakdown.map(function (x) { return x.count }))
                  var c = CAT_COLORS[i % CAT_COLORS.length]
                  return (
                    <div key={d.category} style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#D6DCE8', fontWeight: 600, textTransform: 'capitalize' }}>{d.category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', color: c, fontWeight: 700 }}>{d.count}</span>
                          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#5C6478' }}>{d.percentage}%</span>
                        </div>
                      </div>
                      <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 100, background: c, width: (max > 0 ? (d.count / max * 100) : 0) + '%', transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
                      </div>
                    </div>
                  )
                })}
              </Card>
            )}

            <Card accent="#7C6FEE">
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8' }}>Recent Tickets</div>
                <Link to="/admin/tickets" style={{ fontSize: '0.78rem', color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>View all \u2192</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 85px 85px', gap: '0.75rem', padding: '0.65rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['ID', 'Title', 'Status', 'Priority', 'Time'].map(function (h) {
                  return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#5C6478', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
                })}
              </div>
              {loading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
                  <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading tickets...</div>
                </div>
              ) : !recentTickets.length ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#5C6478', fontSize: '0.85rem' }}>No tickets yet</div>
              ) : recentTickets.map(function (t) {
                return (
                  <Link key={t.id} to={'/staff/tickets/' + t.id} className="ticket-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 85px 85px', gap: '0.75rem', alignItems: 'center', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', color: '#F1F3F8', transition: 'background 0.15s' }}>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.7rem', color: '#5C6478' }}>{t.ticket_number}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                    <span><StatusBadge status={t.status} /></span>
                    <span><PriorityBadge priority={t.priority} /></span>
                    <span style={{ fontSize: '0.72rem', color: '#5C6478' }}>{helpers.timeAgo(t.created_at)}</span>
                  </Link>
                )
              })}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <Card accent="#34D399" style={{ padding: '1.5rem' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.25rem' }}>System Health</div>
              {loading ? (
                <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { label: 'SLA compliance', val: s && s.total ? Math.round((1 - (s.sla_breached || 0) / Math.max(s.total, 1)) * 100) : 100, color: '#34D399' },
                    { label: 'Resolution rate', val: s && s.total ? Math.round(((s.resolved || 0) / s.total) * 100) : 0, color: '#B4ACF9' },
                    { label: 'Queue load', val: s && s.total ? Math.round(((s.open || 0) / s.total) * 100) : 0, color: '#FBBF24' },
                  ].map(function (m) {
                    return (
                      <div key={m.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#8A93A6', fontWeight: 500 }}>{m.label}</span>
                          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: m.color, fontWeight: 700 }}>{m.val}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 100, background: m.color, width: m.val + '%', transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card accent="#B4ACF9" style={{ padding: '1.5rem' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Staff Leaderboard
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#5C6478' }}>RESOLUTION RATE</span>
              </div>
              {loading ? (
                <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading...</div>
              ) : !(data && data.top_staff && data.top_staff.length) ? (
                <div style={{ color: '#5C6478', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  No staff data yet.
                  {staffList.length > 0 && <span> {staffList.length} staff registered - assign tickets to see leaderboard.</span>}
                </div>
              ) : data.top_staff.map(function (st, idx) {
                var initials = st.staff.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
                var rankColors = ['#FBBF24', '#B4ACF9', '#34D399']
                var rc = rankColors[idx] || '#5C6478'
                return (
                  <div key={st.staff.id} className="staff-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                    <div style={{ width: 22, fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', color: rc, fontWeight: 700 }}>#{idx + 1}</div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: rc + '1A', border: '1px solid ' + rc + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: rc, flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F3F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.staff.full_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#5C6478' }}>{st.assigned} assigned &middot; {st.resolved} resolved</div>
                    </div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 800, color: rc }}>{st.resolution_rate}%</div>
                  </div>
                )
              })}
            </Card>

            <Card accent="#FBBF24" style={{ padding: '1.5rem' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="repeat" size={16} /> Recurring Issues</div>
              {loading ? (
                <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading...</div>
              ) : !(data && data.recurring_issues && data.recurring_issues.length) ? (
                <div style={{ color: '#5C6478', fontSize: '0.82rem', lineHeight: 1.6 }}>No recurring patterns yet. More resolved tickets needed.</div>
              ) : data.recurring_issues.map(function (issue, i) {
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FBBF24', fontFamily: 'JetBrains Mono,monospace', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>{issue.frequency}\u00d7</div>
                    <span style={{ fontSize: '0.8rem', color: '#D6DCE8', flex: 1, fontWeight: 500 }}>{issue.issue}</span>
                  </div>
                )
              })}
            </Card>

            <Card accent="#34D399" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cpu" size={16} /></div>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#F1F3F8' }}>AI Model</div>
                  <div style={{ fontSize: '0.7rem', color: '#5C6478' }}>TF-IDF + Logistic Regression</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', animation: 'pulse2 2s ease-in-out infinite' }} />
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#34D399', fontWeight: 700 }}>ACTIVE</span>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#8A93A6', lineHeight: 1.6, marginBottom: '1rem' }}>
                Retrain the classification model on resolved tickets to improve accuracy over time. Requires 20+ resolved tickets.
              </p>
              <button onClick={retrainML} disabled={retraining} style={{ width: '100%', padding: '0.75rem', background: retraining ? 'rgba(255,255,255,0.05)' : 'rgba(52,211,153,0.1)', border: '1.5px solid rgba(52,211,153,0.3)', color: '#34D399', fontFamily: "'Sora',sans-serif", fontSize: '0.85rem', fontWeight: 700, borderRadius: 10, cursor: retraining ? 'not-allowed' : 'pointer', opacity: retraining ? 0.6 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {retraining ? (
                  <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(52,211,153,0.25)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#34D399" strokeWidth="2" strokeLinecap="round" /></svg> Training in progress...</>
                ) : <><Icon name="refresh" size={15} /> Retrain ML Model</>}
              </button>
              {retrainMsg && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: retrainMsg.includes('fail') || retrainMsg.includes('need') ? '#F87171' : '#34D399', lineHeight: 1.5, padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontWeight: 500 }}>{retrainMsg}</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}