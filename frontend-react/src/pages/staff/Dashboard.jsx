import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, helpers } from '../../services/api'
import useAuthStore from '../../stores/authStore'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'bookmark') return <svg {...common}><path d="M6 4h12v16l-6-4-6 4Z" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'alert-triangle') return <svg {...common}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  if (name === 'list') return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="0.9" fill="currentColor" stroke="none" /></svg>
  return null
}

var PRI_COLOR = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#34D399' }

export default function StaffDashboard() {
  var authStore = useAuthStore()
  var user = authStore.user
  var myTicketsArr = useState([])
  var myTickets = myTicketsArr[0]
  var setMyTickets = myTicketsArr[1]
  var statsArr = useState({ assigned: 0, open: 0, in_progress: 0, resolved: 0, urgent: 0 })
  var stats = statsArr[0]
  var setStats = statsArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]

  useEffect(function () { loadData() }, [])

  function loadData() {
    tickets.list({ page_size: 100, assigned_to_me: true }).then(function (res) {
      if (res) {
        var all = res.tickets || []
        setMyTickets(all.slice(0, 8))
        setStats({
          assigned: res.total || all.length,
          open: all.filter(function (t) { return t.status === 'open' }).length,
          in_progress: all.filter(function (t) { return t.status === 'in_progress' }).length,
          resolved: all.filter(function (t) { return ['resolved', 'closed'].indexOf(t.status) !== -1 }).length,
          urgent: all.filter(function (t) { return ['critical', 'high'].indexOf(t.priority) !== -1 && ['resolved', 'closed'].indexOf(t.status) === -1 }).length,
        })
      }
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  var firstName = (user && user.full_name && user.full_name.split(' ')[0]) || 'there'
  var hour = new Date().getHours()
  var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .stat-card { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }\n    .stat-card:hover { transform: translateY(-3px); }\n    .tkt-row:hover { background: rgba(255,255,255,0.03) !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title="My Queue" subtitle={greeting + ', ' + firstName} />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Assigned to me', value: stats.assigned, icon: 'bookmark', accent: '#7C6FEE' },
            { label: 'Open', value: stats.open, icon: 'ticket', accent: '#F87171' },
            { label: 'In Progress', value: stats.in_progress, icon: 'zap', accent: '#FBBF24' },
            { label: 'Resolved', value: stats.resolved, icon: 'check-circle', accent: '#34D399' },
            { label: 'Urgent', value: stats.urgent, icon: 'alert-triangle', accent: '#F97316' },
          ].map(function (c) {
            return (
              <div key={c.label} className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.accent }} />
                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.accent + '1A', color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}><Icon name={c.icon} size={18} /></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.7rem', fontWeight: 800, color: '#F1F3F8', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A93A6', marginTop: '0.3rem', fontWeight: 600 }}>{c.label}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#F1F3F8' }}>My Assigned Tickets</div>
          <Link to="/staff/tickets?assigned=me" style={{ fontSize: '0.78rem', color: '#F97316', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="list" size={14} /> View all &rarr;</Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 90px 100px', gap: '0.6rem', padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Ticket #', 'Title', 'Status', 'Priority', 'SLA'].map(function (h) {
              return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.6rem', color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            })}
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
              <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading your queue...</div>
            </div>
          ) : myTickets.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ color: '#3A3F52', marginBottom: '0.85rem', display: 'flex', justifyContent: 'center' }}><Icon name="bookmark" size={40} strokeWidth={1.4} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#F1F3F8', marginBottom: '0.3rem' }}>No tickets assigned yet</div>
              <div style={{ fontSize: '0.82rem', color: '#5C6478' }}>Check the full ticket list to pick some up</div>
            </div>
          ) : myTickets.map(function (t) {
            var pc = PRI_COLOR[t.priority] || '#8A93A6'
            var slaLabel = '\u2014', slaColor = '#5C6478'
            if (t.due_date && ['resolved', 'closed'].indexOf(t.status) === -1) {
              var hours = (new Date(t.due_date) - Date.now()) / 3600000
              if (hours < 0) { slaLabel = 'Breached'; slaColor = '#F87171' }
              else { slaLabel = Math.round(hours) + 'h left'; slaColor = hours < 4 ? '#F87171' : hours < 12 ? '#FBBF24' : '#34D399' }
            }
            return (
              <Link key={t.id} to={'/staff/tickets/' + t.id} className="tkt-row" style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 90px 100px', gap: '0.6rem', alignItems: 'center', padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', color: '#F1F3F8' }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#5C6478' }}>{t.ticket_number}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                <span><StatusBadge status={t.status} /></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc }} />
                  <span style={{ fontSize: '0.72rem', color: pc, fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</span>
                </span>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.7rem', color: slaColor, fontWeight: 600 }}>{slaLabel}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
