import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'

var STATUSES = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]
var PRI_DOT = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#8A93A6' }

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  if (name === 'x') return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'bookmark') return <svg {...common}><path d="M6 4h12v16l-6-4-6 4Z" /></svg>
  return null
}

export default function StaffTickets() {
  var authStore = useAuthStore()
  var user = authStore.user
  var showToast = useToast()
  var searchParamsArr = useSearchParams()
  var searchParams = searchParamsArr[0]
  var assignedFilter = searchParams.get('assigned') === 'me'

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
  var assigningIdArr = useState(null)
  var assigningId = assigningIdArr[0]
  var setAssigningId = assigningIdArr[1]

  useEffect(function () { loadTickets() }, [status, page, assignedFilter])
  useEffect(function () {
    var t = setTimeout(function () { setPage(1); loadTickets() }, 400)
    return function () { clearTimeout(t) }
  }, [search])

  function loadTickets() {
    setLoading(true)
    var params = { page: page, page_size: 20 }
    if (status) params.status = status
    if (search.trim()) params.search = search.trim()
    if (assignedFilter) params.assigned_to_me = true
    tickets.list(params).then(function (res) {
      if (res) setData(res)
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function assignToMe(ticketId) {
    setAssigningId(ticketId)
    tickets.update(ticketId, { assigned_to_id: user.id, status: 'in_progress' }).then(function () {
      showToast('Assigned to you')
      loadTickets()
    }).catch(function (err) {
      showToast(err.message || 'Could not assign ticket', 'error')
    }).finally(function () { setAssigningId(null) })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .tkt-row:hover { background: rgba(255,255,255,0.03) !important; }\n    .search-inp:focus { border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .assign-me-btn:hover { background: rgba(52,211,153,0.18) !important; }\n    .page-btn:hover:not(:disabled) { border-color:rgba(249,115,22,0.35) !important; color:#F97316 !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title={assignedFilter ? 'My Queue' : 'All Tickets'}
        subtitle={data ? data.total.toLocaleString() + ' tickets' : 'Loading...'}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/staff/tickets" style={{ padding: '0.5rem 1rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', background: !assignedFilter ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)', color: !assignedFilter ? '#F97316' : '#8A93A6', border: '1.5px solid ' + (!assignedFilter ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)') }}>All Tickets</Link>
            <Link to="/staff/tickets?assigned=me" style={{ padding: '0.5rem 1rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', background: assignedFilter ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)', color: assignedFilter ? '#F97316' : '#8A93A6', border: '1.5px solid ' + (assignedFilter ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)') }}>My Queue</Link>
          </div>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {STATUSES.map(function (s) {
            var isActive = status === s.value
            return (
              <button key={s.value} onClick={function () { setStatus(s.value); setPage(1) }} style={{ padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid ' + (isActive ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)'), background: isActive ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)', color: isActive ? '#F97316' : '#8A93A6', fontFamily: "'Inter',sans-serif" }}>
                {s.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="search" size={15} /></span>
            <input type="text" value={search} onChange={function (e) { setSearch(e.target.value) }} placeholder="Search tickets..." className="search-inp"
              style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'all 0.2s' }}
            />
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr 90px 75px 130px 130px', gap: '0.6rem', padding: '0.85rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Ticket #', 'Title', 'Status', 'Priority', 'Client', 'Assigned'].map(function (h) {
              return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.6rem', color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            })}
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading tickets...</div>
            </div>
          ) : !(data && data.tickets && data.tickets.length) ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="ticket" size={48} strokeWidth={1.3} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8' }}>No tickets found</div>
            </div>
          ) : data.tickets.map(function (t) {
            var pc = PRI_DOT[t.priority] || '#8A93A6'
            var isMine = t.assigned_to && user && t.assigned_to.id === user.id
            return (
              <div key={t.id} className="tkt-row" style={{ display: 'grid', gridTemplateColumns: '105px 1fr 90px 75px 130px 130px', gap: '0.6rem', alignItems: 'center', padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Link to={'/staff/tickets/' + t.id} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#5C6478', textDecoration: 'none' }}>{t.ticket_number}</Link>
                <Link to={'/staff/tickets/' + t.id} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F3F8', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Link>
                <span><StatusBadge status={t.status} /></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc }} />
                  <span style={{ fontSize: '0.7rem', color: pc, fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</span>
                </span>
                <span style={{ fontSize: '0.76rem', color: '#8A93A6' }}>{(t.client && t.client.full_name) || '\u2014'}</span>
                {t.assigned_to ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: isMine ? '#34D399' : '#8A93A6', fontWeight: isMine ? 700 : 500 }}>
                    <Icon name={isMine ? 'bookmark' : 'user'} size={12} /> {isMine ? 'You' : t.assigned_to.full_name.split(' ')[0]}
                  </span>
                ) : (
                  <button onClick={function () { assignToMe(t.id) }} disabled={assigningId === t.id} className="assign-me-btn" style={{ padding: '0.3rem 0.7rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399', borderRadius: 100, fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", width: 'fit-content' }}>
                    {assigningId === t.id ? '...' : 'Assign to me'}
                  </button>
                )}
              </div>
            )
          })}

          {data && data.total_pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '0.75rem', color: '#5C6478', fontFamily: 'JetBrains Mono,monospace' }}>{(page - 1) * 20 + 1}\u2013{Math.min(page * 20, data.total)} of {data.total}</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={function () { setPage(function (p) { return p - 1 }) }} disabled={page === 1} className="page-btn" style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#8A93A6', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>&larr;</button>
                <button onClick={function () { setPage(function (p) { return p + 1 }) }} disabled={page === data.total_pages} className="page-btn" style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#8A93A6', cursor: page === data.total_pages ? 'not-allowed' : 'pointer', opacity: page === data.total_pages ? 0.4 : 1 }}>&rarr;</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
