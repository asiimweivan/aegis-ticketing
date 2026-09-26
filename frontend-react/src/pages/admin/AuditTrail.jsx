import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets, helpers } from '../../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
  if (name === 'plus-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v8M8 12h8" /></svg>
  if (name === 'edit') return <svg {...common}><path d="M4 20h4l10.5-10.5a2 2 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'arrow-right-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m10 8 4 4-4 4" /></svg>
  if (name === 'alert-triangle') return <svg {...common}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  if (name === 'list') return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="0.9" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="0.9" fill="currentColor" stroke="none" /></svg>
  return null
}

function actionMeta(action) {
  if (action === 'ticket_created') return { label: 'Created', icon: 'plus-circle', color: '#34D399' }
  if (action === 'manually_escalated') return { label: 'Escalated (Manual)', icon: 'arrow-right-circle', color: '#7C6FEE' }
  if (action === 'sla_breach_escalated') return { label: 'Escalated (SLA)', icon: 'alert-triangle', color: '#F87171' }
  if (action === 'reclassified') return { label: 'AI Reclassified', icon: 'cpu', color: '#B4ACF9' }
  if (action.indexOf('_changed') !== -1) return { label: action.replace('_changed', '').replace(/_/g, ' ') + ' changed', icon: 'edit', color: '#FBBF24' }
  return { label: action.replace(/_/g, ' '), icon: 'file-text', color: '#8A93A6' }
}

var FILTERS = [
  { value: '', label: 'All Activity' },
  { value: 'ticket_created', label: 'Created' },
  { value: 'status_changed', label: 'Status Changes' },
  { value: 'priority_changed', label: 'Priority Changes' },
  { value: 'assigned_to_id_changed', label: 'Reassignments' },
  { value: 'manually_escalated', label: 'Manual Escalations' },
  { value: 'sla_breach_escalated', label: 'SLA Escalations' },
  { value: 'reclassified', label: 'AI Reclassifications' },
]

export default function AuditTrail() {
  var itemsArr = useState([])
  var items = itemsArr[0]
  var setItems = itemsArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var filterArr = useState('')
  var filter = filterArr[0]
  var setFilter = filterArr[1]
  var searchArr = useState('')
  var search = searchArr[0]
  var setSearch = searchArr[1]

  useEffect(function () { loadData() }, [filter])

  function loadData() {
    setLoading(true)
    tickets.auditTrail(filter).then(function (res) {
      if (res) setItems(res)
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  var filtered = search.trim()
    ? items.filter(function (i) {
      var s = search.toLowerCase()
      return i.ticket.ticket_number.toLowerCase().indexOf(s) !== -1 ||
        i.ticket.title.toLowerCase().indexOf(s) !== -1 ||
        (i.user && i.user.full_name.toLowerCase().indexOf(s) !== -1)
    })
    : items

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .trail-row:hover { background:rgba(255,255,255,0.03) !important; }\n    .search-inp:focus { border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    select { color-scheme: dark; }\n    select option { background:#0B0E17; color:#F1F3F8; }\n    .filter-select:hover, .filter-select:focus { border-color:#F97316 !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title="Audit Trail" subtitle={loading ? 'Loading...' : items.length + ' recent activity entries (max 300)'} />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="search" size={15} /></span>
            <input type="text" value={search} onChange={function (e) { setSearch(e.target.value) }} placeholder="Search by ticket number, title, or staff member..." className="search-inp"
              style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'all 0.2s' }}
            />
          </div>
          <select value={filter} onChange={function (e) { setFilter(e.target.value) }} className="filter-select" style={{ padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.85rem', fontFamily: "'Inter',sans-serif", outline: 'none', cursor: 'pointer', width: 220, transition: 'all 0.2s' }}>
            {FILTERS.map(function (f) { return <option key={f.value} value={f.value}>{f.label}</option> })}
          </select>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 130px 150px', gap: '0.75rem', padding: '0.85rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Action', 'Details', 'Performed By', 'When'].map(function (h) {
              return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.6rem', color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            })}
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading audit trail...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="list" size={48} strokeWidth={1.3} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8' }}>No activity found</div>
              <p style={{ fontSize: '0.85rem', color: '#5C6478', marginTop: '0.4rem' }}>Try a different filter or search term.</p>
            </div>
          ) : filtered.map(function (entry) {
            var meta = actionMeta(entry.action)
            return (
              <div key={entry.id} className="trail-row" style={{ display: 'grid', gridTemplateColumns: '180px 1fr 130px 150px', gap: '0.75rem', alignItems: 'center', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: meta.color + '1A', color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={meta.icon} size={13} /></div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: meta.color, textTransform: 'capitalize' }}>{meta.label}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <Link to={'/staff/tickets/' + entry.ticket.id} style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F1F3F8', textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#5C6478', marginRight: '0.5rem' }}>{entry.ticket.ticket_number}</span>
                    {entry.ticket.title}
                  </Link>
                  {entry.description && <div style={{ fontSize: '0.76rem', color: '#8A93A6', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description}</div>}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#D6DCE8', fontWeight: 500 }}>{(entry.user && entry.user.full_name) || 'System'}</div>
                <div style={{ fontSize: '0.75rem', color: '#5C6478' }}>{helpers.timeAgo(entry.created_at)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}