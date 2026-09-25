import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets, helpers } from '../../services/api'

var STATUSES = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

var STATUS_CONFIG = {
  '': { color: '#8A93A6', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.15)' },
  open: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.35)' },
  in_progress: { color: '#B4ACF9', bg: 'rgba(124,111,238,0.1)', border: 'rgba(124,111,238,0.35)' },
  pending: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.35)' },
  resolved: { color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.35)' },
  closed: { color: '#8A93A6', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.15)' },
}

var PRI_DOT = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#8A93A6' }

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  if (name === 'x') return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'rocket') return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  return null
}

export default function ClientTickets() {
  var dataArr = useState(null)
  var data = dataArr[0]
  var setData = dataArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var searchArr = useState('')
  var search = searchArr[0]
  var setSearch = searchArr[1]
  var statusArr = useState('')
  var status = statusArr[0]
  var setStatus = statusArr[1]
  var pageArr = useState(1)
  var page = pageArr[0]
  var setPage = pageArr[1]

  useEffect(function () { loadTickets() }, [status, page])
  useEffect(function () {
    var t = setTimeout(function () { setPage(1); loadTickets() }, 400)
    return function () { clearTimeout(t) }
  }, [search])

  function loadTickets() {
    setLoading(true)
    var params = { page: page, page_size: 15 }
    if (status) params.status = status
    if (search.trim()) params.search = search.trim()
    tickets.list(params).then(function (res) {
      if (res) setData(res)
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .tkt-row { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }\n    .tkt-row:hover { background: rgba(255,255,255,0.03) !important; border-color: rgba(249,115,22,0.3) !important; transform: translateX(2px); }\n    .search-inp:focus { border-color: #F97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }\n    .page-btn:hover:not(:disabled) { border-color: rgba(249,115,22,0.35) !important; color: #F97316 !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="My Tickets"
        subtitle={data ? data.total.toLocaleString() + ' tickets' : 'Loading...'}
        actions={
          <Link to="/client/new-ticket" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 14px rgba(232,69,10,0.35)' }}>
            + New Ticket
          </Link>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {STATUSES.map(function (s) {
            var c = STATUS_CONFIG[s.value]
            var isActive = status === s.value
            return (
              <button key={s.value} onClick={function () { setStatus(s.value); setPage(1) }} style={{ padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid ' + (isActive ? c.border : 'rgba(255,255,255,0.1)'), background: isActive ? c.bg : 'rgba(255,255,255,0.03)', color: isActive ? c.color : '#8A93A6', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}>
                {s.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="search" size={15} /></span>
            <input type="text" value={search} onChange={function (e) { setSearch(e.target.value) }} placeholder="Search your tickets..." className="search-inp"
              style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'all 0.2s' }}
            />
          </div>
          {(search || status) && (
            <button onClick={function () { setSearch(''); setStatus(''); setPage(1) }} style={{ padding: '0.7rem 1rem', background: 'rgba(248,113,113,0.1)', border: '1.5px solid rgba(248,113,113,0.3)', borderRadius: 10, color: '#F87171', fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
              <Icon name="x" size={13} /> Clear
            </button>
          )}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#F97316,transparent)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 90px 120px 110px', gap: '0.6rem', padding: '0.85rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Ticket #', 'Title', 'Status', 'Priority', 'Assigned', 'Created'].map(function (h) {
              return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.6rem', color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            })}
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading your tickets...</div>
            </div>
          ) : !(data && data.tickets && data.tickets.length) ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="ticket" size={48} strokeWidth={1.3} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.5rem' }}>
                {search || status ? 'No matching tickets' : "You haven't submitted any tickets yet"}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#5C6478', marginBottom: '1.5rem' }}>
                {search || status ? 'Try adjusting your search or filter.' : 'Submit your first ticket and our AI will handle the rest.'}
              </p>
              {!search && !status && (
                <Link to="/client/new-ticket" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.6rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif" }}>
                  <Icon name="rocket" size={15} /> Submit a ticket
                </Link>
              )}
            </div>
          ) : data.tickets.map(function (t) {
            var sc = STATUS_CONFIG[t.status] || STATUS_CONFIG['']
            var pc = PRI_DOT[t.priority] || '#8A93A6'
            return (
              <Link key={t.id} to={'/client/tickets/' + t.id} className="tkt-row" style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 90px 120px 110px', gap: '0.6rem', alignItems: 'center', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', color: '#F1F3F8', borderLeft: '3px solid transparent' }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#5C6478' }}>{t.ticket_number}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: sc.color, background: sc.bg, border: '1px solid ' + sc.border, padding: '0.15rem 0.55rem', borderRadius: 100, width: 'fit-content' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color }} />
                  {helpers.statusLabel ? helpers.statusLabel(t.status) : t.status.replace('_', ' ')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc }} />
                  <span style={{ fontSize: '0.72rem', color: pc, fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8A93A6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {t.assigned_to ? (
                    <>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(124,111,238,0.15)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, flexShrink: 0 }}>
                        {t.assigned_to.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)}
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.assigned_to.full_name.split(' ')[0]}</span>
                    </>
                  ) : (
                    <span style={{ color: '#5C6478' }}>Unassigned</span>
                  )}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#5C6478' }}>{helpers.formatDate ? helpers.formatDate(t.created_at) : new Date(t.created_at).toLocaleDateString('en-GB')}</span>
              </Link>
            )
          })}

          {data && data.total_pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '0.75rem', color: '#5C6478', fontFamily: 'JetBrains Mono,monospace' }}>
                {(page - 1) * 15 + 1}\u2013{Math.min(page * 15, data.total)} of {data.total}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={function () { setPage(function (p) { return p - 1 }) }} disabled={page === 1} className="page-btn" style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#8A93A6', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>&larr;</button>
                {Array.from({ length: Math.min(data.total_pages, 5) }, function (_, i) {
                  var p = data.total_pages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, data.total_pages - 4)) + i
                  return (
                    <button key={p} onClick={function () { setPage(p) }} style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: p === page ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', border: '1.5px solid ' + (p === page ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)'), color: p === page ? '#F97316' : '#8A93A6', cursor: 'pointer', fontSize: '0.78rem', fontWeight: p === page ? 700 : 400 }}>{p}</button>
                  )
                })}
                <button onClick={function () { setPage(function (p) { return p + 1 }) }} disabled={page === data.total_pages} className="page-btn" style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#8A93A6', cursor: page === data.total_pages ? 'not-allowed' : 'pointer', opacity: page === data.total_pages ? 0.4 : 1 }}>&rarr;</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}