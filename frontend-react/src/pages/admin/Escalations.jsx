import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, helpers } from '../../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'arrow-right-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m10 8 4 4-4 4" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'alert-triangle') return <svg {...common}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  return null
}

var FILTERS = [
  { value: '', label: 'All' },
  { value: 'sla_breach_escalated', label: 'Automatic (SLA)' },
  { value: 'manually_escalated', label: 'Manual (Staff)' },
]

export default function Escalations() {
  var itemsArr = useState([])
  var items = itemsArr[0]
  var setItems = itemsArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var filterArr = useState('')
  var filter = filterArr[0]
  var setFilter = filterArr[1]

  useEffect(function () { loadData() }, [])

  function loadData() {
    setLoading(true)
    tickets.escalations().then(function (res) {
      if (res) setItems(res)
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  var filtered = filter ? items.filter(function (i) { return i.action === filter }) : items
  var autoCount = items.filter(function (i) { return i.action === 'sla_breach_escalated' }).length
  var manualCount = items.filter(function (i) { return i.action === 'manually_escalated' }).length

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .esc-row:hover { background:rgba(255,255,255,0.03) !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title="Escalations" subtitle={loading ? 'Loading...' : items.length + ' total escalations'} />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Escalations', value: items.length, icon: 'arrow-right-circle', accent: '#F97316' },
            { label: 'Automatic (SLA)', value: autoCount, icon: 'clock', accent: '#F87171' },
            { label: 'Manual (Staff)', value: manualCount, icon: 'user', accent: '#7C6FEE' },
          ].map(function (s) {
            return (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.accent }} />
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.accent + '1A', color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}><Icon name={s.icon} size={18} /></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.7rem', fontWeight: 800, color: '#F1F3F8', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A93A6', marginTop: '0.3rem', fontWeight: 600 }}>{s.label}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {FILTERS.map(function (f) {
            var active = filter === f.value
            return (
              <button key={f.value} onClick={function () { setFilter(f.value) }} style={{ padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid ' + (active ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)'), background: active ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)', color: active ? '#F97316' : '#8A93A6', fontFamily: "'Inter',sans-serif" }}>{f.label}</button>
            )
          })}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading escalations...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="arrow-right-circle" size={48} strokeWidth={1.3} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8' }}>No escalations {filter ? 'of this type' : 'yet'}</div>
              <p style={{ fontSize: '0.85rem', color: '#5C6478', marginTop: '0.4rem' }}>Escalated tickets - automatic or manual - will appear here.</p>
            </div>
          ) : filtered.map(function (e) {
            var isAuto = e.action === 'sla_breach_escalated'
            return (
              <div key={e.id} className="esc-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: isAuto ? 'rgba(248,113,113,0.12)' : 'rgba(124,111,238,0.12)', color: isAuto ? '#F87171' : '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={isAuto ? 'alert-triangle' : 'arrow-right-circle'} size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isAuto ? '#F87171' : '#B4ACF9', background: isAuto ? 'rgba(248,113,113,0.12)' : 'rgba(124,111,238,0.12)', padding: '0.15rem 0.55rem', borderRadius: 100 }}>{isAuto ? 'AUTOMATIC' : 'MANUAL'}</span>
                    <Link to={'/staff/tickets/' + e.ticket.id} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.7rem', color: '#5C6478', textDecoration: 'none' }}>{e.ticket.ticket_number}</Link>
                    <StatusBadge status={e.ticket.status} />
                    <PriorityBadge priority={e.ticket.priority} />
                    <span style={{ fontSize: '0.7rem', color: '#5C6478', marginLeft: 'auto' }}>{helpers.timeAgo(e.created_at)}</span>
                  </div>
                  <Link to={'/staff/tickets/' + e.ticket.id} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F1F3F8', textDecoration: 'none' }}>{e.ticket.title}</Link>
                  <p style={{ fontSize: '0.8rem', color: '#8A93A6', lineHeight: 1.6, marginTop: '0.35rem' }}>{e.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}