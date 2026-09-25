import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge } from '../../components/ui/Badge'
import { tickets, users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

var STATUSES = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]
var STATUS_COLORS = {
  '': ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.04)', '#D6DCE8'],
  open: ['rgba(248,113,113,0.4)', 'rgba(248,113,113,0.1)', '#F87171'],
  in_progress: ['rgba(124,111,238,0.4)', 'rgba(124,111,238,0.1)', '#B4ACF9'],
  pending: ['rgba(251,191,36,0.4)', 'rgba(251,191,36,0.1)', '#FBBF24'],
  resolved: ['rgba(52,211,153,0.4)', 'rgba(52,211,153,0.1)', '#34D399'],
  closed: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.04)', '#8A93A6'],
}
var PRI_DOT = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#8A93A6' }
var PRI_BORDER = { critical: 'rgba(248,113,113,0.35)', high: 'rgba(249,115,22,0.35)', medium: 'rgba(251,191,36,0.35)', low: 'rgba(255,255,255,0.12)' }

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'x') return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  if (name === 'check') return <svg {...common}><path d="M4 12.5 9 18l11-13" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  if (name === 'grid') return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></svg>
  if (name === 'list') return <svg {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
  if (name === 'download') return <svg {...common}><path d="M12 3v13" /><path d="m6.5 11 5.5 5.5L17.5 11" /><path d="M4 20h16" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  return null
}

function scoreStaffForTicket(staff, ticket, allTickets) {
  var staffTickets = allTickets.filter(function (t) { return t.assigned_to && t.assigned_to.id === staff.id })
  var resolvedInCategory = staffTickets.filter(function (t) { return t.category === ticket.category && ['resolved', 'closed'].indexOf(t.status) !== -1 })
  var totalInCategory = staffTickets.filter(function (t) { return t.category === ticket.category })
  var currentOpen = staffTickets.filter(function (t) { return ['resolved', 'closed'].indexOf(t.status) === -1 })
  var currentCriticalHigh = currentOpen.filter(function (t) { return ['critical', 'high'].indexOf(t.priority) !== -1 })

  var categoryScore = 0
  if (totalInCategory.length > 0) {
    categoryScore = (resolvedInCategory.length / totalInCategory.length) * 40
  } else {
    categoryScore = 15
  }

  var maxReasonableLoad = 12
  var workloadScore = Math.max(0, 30 * (1 - Math.min(currentOpen.length, maxReasonableLoad) / maxReasonableLoad))
  var urgencyPenalty = Math.max(0, 20 * (1 - Math.min(currentCriticalHigh.length, 5) / 5))
  var deptScore = (staff.department && ticket.category && staff.department.toLowerCase().indexOf(ticket.category.toLowerCase()) !== -1) ? 10 : 0

  var total = Math.round(categoryScore + workloadScore + urgencyPenalty + deptScore)

  var reasons = []
  if (resolvedInCategory.length > 0) reasons.push('Resolved ' + resolvedInCategory.length + ' ' + ticket.category + ' ticket' + (resolvedInCategory.length > 1 ? 's' : '') + ' before')
  if (currentOpen.length === 0) reasons.push('Currently has zero open tickets')
  else if (currentOpen.length <= 2) reasons.push('Light workload (' + currentOpen.length + ' open)')
  else if (currentOpen.length >= 8) reasons.push('Heavy workload (' + currentOpen.length + ' open) - deprioritized')
  if (currentCriticalHigh.length === 0 && ['critical', 'high'].indexOf(ticket.priority) !== -1) reasons.push('No urgent tickets currently assigned')
  if (deptScore > 0) reasons.push('Department matches category')
  if (reasons.length === 0) reasons.push('No prior history - neutral candidate')

  return { staff: staff, score: Math.min(100, Math.max(0, total)), reasons: reasons, openCount: currentOpen.length }
}

function rankStaffForTicket(ticket, staffList, allTickets) {
  return staffList.map(function (s) { return scoreStaffForTicket(s, ticket, allTickets) }).sort(function (a, b) { return b.score - a.score })
}

function AISuggestPopover(props) {
  var ticket = props.ticket, staffList = props.staffList, allTickets = props.allTickets, onAssign = props.onAssign, onClose = props.onClose
  var ref = useRef(null)
  var assigningArr = useState(false)
  var assigning = assigningArr[0]
  var setAssigning = assigningArr[1]
  var ranked = useMemo(function () { return rankStaffForTicket(ticket, staffList, allTickets) }, [ticket, staffList, allTickets])
  var top = ranked.slice(0, 3)

  useEffect(function () {
    function fn(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    setTimeout(function () { document.addEventListener('mousedown', fn) }, 0)
    return function () { document.removeEventListener('mousedown', fn) }
  }, [onClose])

  function assign(staffId, staffName) {
    setAssigning(true)
    onAssign(ticket.id, staffId, staffName).finally(function () { setAssigning(false) })
  }

  function scoreColor(score) { return score >= 75 ? '#34D399' : score >= 50 ? '#FBBF24' : '#F97316' }

  return (
    <div ref={ref} style={{ position: 'absolute', right: 0, top: '110%', zIndex: 300, background: '#0B0E17', border: '1.5px solid rgba(124,111,238,0.3)', borderRadius: 14, padding: '0.85rem', minWidth: 300, boxShadow: '0 20px 50px rgba(0,0,0,0.6)', animation: 'popIn 0.15s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
        <Icon name="cpu" size={14} strokeWidth={2} />
        <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono,monospace', color: '#B4ACF9', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>AI Recommendations</span>
      </div>

      {top.length === 0 ? (
        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.78rem', color: '#5C6478' }}>No staff registered</div>
      ) : top.map(function (r, idx) {
        return (
          <button key={r.staff.id} onClick={function () { assign(r.staff.id, r.staff.full_name) }} disabled={assigning} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.65rem 0.7rem', width: '100%', background: idx === 0 ? 'rgba(124,111,238,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (idx === 0 ? 'rgba(124,111,238,0.3)' : 'rgba(255,255,255,0.08)'), borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter',sans-serif", marginBottom: '0.4rem', textAlign: 'left', transition: 'all 0.15s' }}
            onMouseOver={function (e) { e.currentTarget.style.background = 'rgba(124,111,238,0.16)' }}
            onMouseOut={function (e) { e.currentTarget.style.background = idx === 0 ? 'rgba(124,111,238,0.1)' : 'rgba(255,255,255,0.03)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {idx === 0 && <span style={{ fontSize: '0.65rem', background: 'rgba(124,111,238,0.2)', color: '#B4ACF9', padding: '0.1rem 0.4rem', borderRadius: 5, fontWeight: 700 }}>BEST MATCH</span>}
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(124,111,238,0.2)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 700, flexShrink: 0 }}>
                {r.staff.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F1F3F8', flex: 1 }}>{r.staff.full_name}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: scoreColor(r.score), fontFamily: 'JetBrains Mono,monospace' }}>{r.score}%</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#8A93A6', paddingLeft: '2rem', lineHeight: 1.5 }}>
              {r.reasons.slice(0, 2).join(' \u00b7 ')}
            </div>
          </button>
        )
      })}

      <div style={{ marginTop: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.65rem', color: '#5C6478', textAlign: 'center' }}>
        Scored on category history &middot; workload &middot; urgency
      </div>
    </div>
  )
}

function AssignPopover(props) {
  var ticket = props.ticket, staffList = props.staffList, onAssign = props.onAssign, onClose = props.onClose
  var ref = useRef(null)
  var assigningArr = useState(false)
  var assigning = assigningArr[0]
  var setAssigning = assigningArr[1]

  useEffect(function () {
    function fn(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    setTimeout(function () { document.addEventListener('mousedown', fn) }, 0)
    return function () { document.removeEventListener('mousedown', fn) }
  }, [onClose])

  function assign(staffId, staffName) {
    setAssigning(true)
    onAssign(ticket.id, staffId, staffName).finally(function () { setAssigning(false) })
  }

  return (
    <div ref={ref} style={{ position: 'absolute', right: 0, top: '110%', zIndex: 300, background: '#0B0E17', border: '1.5px solid rgba(251,191,36,0.3)', borderRadius: 14, padding: '0.75rem', minWidth: 240, boxShadow: '0 20px 50px rgba(0,0,0,0.6)', animation: 'popIn 0.15s ease' }}>
      <div style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono,monospace', color: '#5C6478', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.6rem', padding: '0 0.25rem' }}>
        Assign manually
      </div>
      {ticket.assigned_to && (
        <div style={{ padding: '0.5rem 0.6rem', marginBottom: '0.4rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 9, fontSize: '0.75rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <Icon name="check" size={12} /> Currently: {ticket.assigned_to.full_name}
        </div>
      )}
      {ticket.assigned_to && (
        <button onClick={function () { assign(null, 'Unassigned') }} disabled={assigning} style={{ width: '100%', padding: '0.5rem 0.6rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 9, color: '#F87171', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif", marginBottom: '0.4rem', textAlign: 'left', fontWeight: 500 }}>
          Remove assignment
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 200, overflowY: 'auto' }}>
        {staffList.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.78rem', color: '#5C6478' }}>No staff registered</div>
        ) : staffList.map(function (st) {
          var initials = st.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
          var isCurrent = ticket.assigned_to && ticket.assigned_to.id === st.id
          return (
            <button key={st.id} onClick={function () { if (!isCurrent) assign(st.id, st.full_name) }} disabled={assigning || isCurrent} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.6rem', background: isCurrent ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (isCurrent ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'), borderRadius: 9, cursor: isCurrent ? 'default' : 'pointer', fontFamily: "'Inter',sans-serif", textAlign: 'left' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,111,238,0.2)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F1F3F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.full_name}</div>
                {st.department && <div style={{ fontSize: '0.68rem', color: '#5C6478' }}>{st.department}</div>}
              </div>
              {isCurrent && <Icon name="check" size={12} strokeWidth={2.5} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AutoAssignModal(props) {
  var unassignedTickets = props.unassignedTickets, staffList = props.staffList, allTickets = props.allTickets, onConfirm = props.onConfirm, onClose = props.onClose
  var runningArr = useState(false)
  var running = runningArr[0]
  var setRunning = runningArr[1]
  var doneArr = useState(false)
  var done = doneArr[0]
  var setDone = doneArr[1]
  var assignmentsArr = useState([])
  var assignments = assignmentsArr[0]
  var setAssignments = assignmentsArr[1]

  var proposals = useMemo(function () {
    return unassignedTickets.map(function (t) {
      var ranked = rankStaffForTicket(t, staffList, allTickets)
      return { ticket: t, best: ranked[0] || null }
    })
  }, [unassignedTickets, staffList, allTickets])

  function runAutoAssign() {
    setRunning(true)
    var results = []
    var chain = Promise.resolve()
    proposals.forEach(function (p) {
      chain = chain.then(function () {
        if (p.best) {
          return onConfirm(p.ticket.id, p.best.staff.id).then(function () {
            results.push({ ticket: p.ticket, staff: p.best.staff, success: true })
          }).catch(function () {
            results.push({ ticket: p.ticket, staff: p.best.staff, success: false })
          })
        }
      })
    })
    chain.then(function () {
      setAssignments(results)
      setRunning(false)
      setDone(true)
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={function (e) { if (e.target === e.currentTarget && !running) onClose() }}>
      <div style={{ background: '#0B0E17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#7C6FEE,transparent)', borderRadius: '20px 20px 0 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,111,238,0.15)', border: '1px solid rgba(124,111,238,0.3)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cpu" size={20} /></div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F8' }}>AI Auto-Assignment</div>
            <div style={{ fontSize: '0.78rem', color: '#8A93A6' }}>{unassignedTickets.length} unassigned tickets found</div>
          </div>
          {!running && (
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#8A93A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={14} /></button>
          )}
        </div>

        {!done ? (
          <>
            <div style={{ background: 'rgba(124,111,238,0.08)', border: '1px solid rgba(124,111,238,0.25)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#B4ACF9', lineHeight: 1.6 }}>
              AI will analyze each unassigned ticket and match it to the best-fit staff member based on category history, current workload, and urgency. Review proposals below before confirming.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', maxHeight: 280, overflowY: 'auto' }}>
              {proposals.map(function (p) {
                return (
                  <div key={p.ticket.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F1F3F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.ticket.title}</div>
                      <div style={{ fontSize: '0.68rem', color: '#5C6478' }}>{p.ticket.ticket_number} &middot; {p.ticket.priority}</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#5C6478' }}>&rarr;</span>
                    {p.best ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(124,111,238,0.12)', padding: '0.3rem 0.6rem', borderRadius: 8 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#B4ACF9' }}>{p.best.staff.full_name.split(' ')[0]}</span>
                        <span style={{ fontSize: '0.68rem', color: '#B4ACF9', opacity: 0.7 }}>{p.best.score}%</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#5C6478' }}>No staff available</span>
                    )}
                  </div>
                )
              })}
            </div>

            <button onClick={runAutoAssign} disabled={running} style={{ width: '100%', padding: '0.9rem', background: running ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#6D5EF0,#7C6FEE)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: running ? 'none' : '0 8px 20px rgba(124,111,238,0.35)' }}>
              {running ? (
                <><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg> Assigning {proposals.length} tickets...</>
              ) : <><Icon name="cpu" size={15} /> Confirm & Auto-Assign {proposals.filter(function (p) { return p.best }).length} Tickets</>}
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem' }}>
              <div style={{ color: '#34D399', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}><Icon name="check-circle" size={40} strokeWidth={1.5} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.3rem' }}>
                {assignments.filter(function (a) { return a.success }).length} tickets assigned successfully
              </div>
              {assignments.some(function (a) { return !a.success }) && (
                <div style={{ fontSize: '0.78rem', color: '#F87171' }}>{assignments.filter(function (a) { return !a.success }).length} failed - try manually</div>
              )}
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F3F8', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminTickets() {
  var showToast = useToast()
  var dataArr = useState(null)
  var data = dataArr[0]
  var setData = dataArr[1]
  var allTicketsFullArr = useState([])
  var allTicketsFull = allTicketsFullArr[0]
  var setAllTicketsFull = allTicketsFullArr[1]
  var staffListArr = useState([])
  var staffList = staffListArr[0]
  var setStaffList = staffListArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var searchArr = useState('')
  var search = searchArr[0]
  var setSearch = searchArr[1]
  var statusArr = useState('')
  var status = statusArr[0]
  var setStatus = statusArr[1]
  var categoryArr = useState('')
  var category = categoryArr[0]
  var setCategory = categoryArr[1]
  var priorityArr = useState('')
  var priority = priorityArr[0]
  var setPriority = priorityArr[1]
  var pageArr = useState(1)
  var page = pageArr[0]
  var setPage = pageArr[1]
  var searchTimerArr = useState(null)
  var searchTimer = searchTimerArr[0]
  var setSearchTimer = searchTimerArr[1]
  var cachedTicketsArr = useState([])
  var cachedTickets = cachedTicketsArr[0]
  var setCachedTickets = cachedTicketsArr[1]
  var viewModeArr = useState('table')
  var viewMode = viewModeArr[0]
  var setViewMode = viewModeArr[1]
  var activePopoverArr = useState(null)
  var activePopover = activePopoverArr[0]
  var setActivePopover = activePopoverArr[1]
  var activeAIPopoverArr = useState(null)
  var activeAIPopover = activeAIPopoverArr[0]
  var setActiveAIPopover = activeAIPopoverArr[1]
  var showAutoAssignArr = useState(false)
  var showAutoAssign = showAutoAssignArr[0]
  var setShowAutoAssign = showAutoAssignArr[1]

  useEffect(function () { loadTickets(); loadStaff(); loadAllTicketsForAI() }, [])
  useEffect(function () { loadTickets() }, [status, category, priority, page])
  useEffect(function () {
    if (searchTimer) clearTimeout(searchTimer)
    var t = setTimeout(function () { setPage(1); loadTickets() }, 400)
    setSearchTimer(t)
    return function () { clearTimeout(t) }
  }, [search])

  function loadTickets() {
    setLoading(true)
    var params = { page: page, page_size: 20 }
    if (status) params.status = status
    if (category) params.category = category
    if (priority) params.priority = priority
    if (search.trim()) params.search = search.trim()
    tickets.list(params).then(function (res) {
      if (res) { setData(res); setCachedTickets(res.tickets) }
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function loadStaff() {
    users.list({ role: 'staff' }).then(function (res) {
      if (res) setStaffList(Array.isArray(res) ? res : res.users || [])
    }).catch(function (e) { console.error(e) })
  }

  function loadAllTicketsForAI() {
    var all = []
    var p = 1
    function loop() {
      return tickets.list({ page: p, page_size: 100 }).catch(function () { return null }).then(function (res) {
        if (!res || !res.tickets || !res.tickets.length) return
        all = all.concat(res.tickets)
        if (res.tickets.length < 100 || all.length >= (res.total || all.length)) return
        p++
        if (p > 15) return
        return loop()
      })
    }
    loop().then(function () { setAllTicketsFull(all) }).catch(function (e) { console.error('AI data load error:', e) })
  }

  function handleAssign(ticketId, staffId, staffName) {
    var payload = staffId ? { assigned_to_id: staffId, status: 'in_progress' } : { assigned_to_id: null }
    return tickets.update(ticketId, payload).then(function () {
      showToast(staffId ? 'Assigned to ' + staffName : 'Assignment removed')
      setActivePopover(null)
      setActiveAIPopover(null)
      loadTickets()
      loadAllTicketsForAI()
    }).catch(function (e) {
      showToast(e.message || 'Assignment failed', 'error')
      throw e
    })
  }

  function handleBulkAssign(ticketId, staffId) {
    return tickets.update(ticketId, { assigned_to_id: staffId, status: 'in_progress' })
  }

  function getSLA(t) {
    if (!t.due_date) return { label: 'No SLA', color: '#5C6478', urgent: false }
    var diff = new Date(t.due_date) - Date.now()
    var hours = diff / 3600000
    if (diff < 0) return { label: 'Breached', color: '#F87171', urgent: true }
    if (hours < 4) return { label: Math.round(hours) + 'h left', color: '#F87171', urgent: true }
    if (hours < 12) return { label: Math.round(hours) + 'h left', color: '#FBBF24', urgent: false }
    return { label: Math.round(hours) + 'h left', color: '#34D399', urgent: false }
  }

  function exportCSV() {
    if (!cachedTickets.length) { showToast('No tickets to export', 'error'); return }
    var headers = ['Ticket #', 'Title', 'Category', 'Status', 'Priority', 'Client', 'Assigned To', 'SLA', 'Created']
    var rows = cachedTickets.map(function (t) {
      return [
        t.ticket_number, '"' + t.title.replace(/"/g, '""') + '"',
        t.category, t.status, t.priority,
        (t.client && t.client.full_name) || '',
        (t.assigned_to && t.assigned_to.full_name) || 'Unassigned',
        getSLA(t).label,
        helpers.formatDate(t.created_at),
      ]
    })
    var csv = [headers].concat(rows).map(function (r) { return r.join(',') }).join('\n')
    var blob = new Blob([csv], { type: 'text/csv' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a'); a.href = url
    a.download = 'aegis-tickets-' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click(); URL.revokeObjectURL(url)
    showToast('Exported successfully')
  }

  var unassignedCount = useMemo(function () {
    return allTicketsFull.filter(function (t) { return !t.assigned_to && ['resolved', 'closed'].indexOf(t.status) === -1 }).length
  }, [allTicketsFull])

  var unassignedTicketsList = useMemo(function () {
    return allTicketsFull.filter(function (t) { return !t.assigned_to && ['resolved', 'closed'].indexOf(t.status) === -1 })
  }, [allTicketsFull])

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin   { to{transform:rotate(360deg)} }\n    @keyframes popIn  { from{opacity:0;transform:scale(0.92) translateY(-6px)} to{opacity:1;transform:scale(1) translateY(0)} }\n    @keyframes glowPulse { 0%,100%{box-shadow:0 4px 16px rgba(124,111,238,0.15)} 50%{box-shadow:0 4px 24px rgba(124,111,238,0.3)} }\n    .tkt-row { transition: background 0.15s; }\n    .tkt-row:hover { background: rgba(255,255,255,0.03) !important; }\n    .filter-select { padding:0.7rem 1rem; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.1); border-radius:10px; color:#F1F3F8; font-size:0.85rem; font-family:'Inter',sans-serif; outline:none; cursor:pointer; transition:all 0.2s; }\n    .filter-select:focus { border-color:#F97316; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .assign-btn { transition: all 0.2s; }\n    .assign-btn:hover { background: rgba(124,111,238,0.15) !important; border-color: rgba(124,111,238,0.35) !important; color: #B4ACF9 !important; }\n    .ai-btn:hover { background: rgba(124,111,238,0.2) !important; border-color: rgba(124,111,238,0.4) !important; }\n    .unassigned-btn:hover { background: rgba(248,113,113,0.12) !important; border-color: rgba(248,113,113,0.3) !important; color: #F87171 !important; }\n    .tkt-card:hover { border-color:rgba(249,115,22,0.3) !important; transform:translateY(-3px); box-shadow:0 12px 28px rgba(232,69,10,0.15); }\n    .page-btn:hover:not(:disabled) { border-color:rgba(249,115,22,0.3) !important; color:#F97316 !important; }\n    .auto-assign-banner { animation: glowPulse 3s ease-in-out infinite; }\n    .export-btn:hover { background:rgba(249,115,22,0.18) !important; }\n    .view-toggle-btn:hover { background: rgba(255,255,255,0.06) !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="All Tickets"
        subtitle={data ? data.total.toLocaleString() + ' tickets \u00b7 ' + staffList.length + ' staff available' : 'Loading...'}
        actions={
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
              {[['table', 'list'], ['cards', 'grid']].map(function (pair) {
                var v = pair[0], ic = pair[1]
                return <button key={v} className="view-toggle-btn" onClick={function () { setViewMode(v) }} style={{ width: 34, height: 32, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: viewMode === v ? 'rgba(249,115,22,0.15)' : 'transparent', color: viewMode === v ? '#F97316' : '#5C6478', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={14} /></button>
              })}
            </div>
            <button className="export-btn" onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#FDBA74', cursor: 'pointer', fontFamily: "'Sora',sans-serif", transition: 'all 0.2s' }}><Icon name="download" size={14} /> Export</button>
          </div>
        }
      />

      <div style={{ padding: '2rem', animation: 'fadeIn 0.4s ease both', background: '#05070D', minHeight: '100%', fontFamily: "'Inter',sans-serif" }}>

        {unassignedCount > 0 && (
          <div className="auto-assign-banner" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', background: 'linear-gradient(135deg,rgba(124,111,238,0.1),rgba(124,111,238,0.06))', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 14, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#B4ACF9' }}><Icon name="cpu" size={18} /></div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8' }}>{unassignedCount} unassigned ticket{unassignedCount > 1 ? 's' : ''} need attention</div>
              <div style={{ fontSize: '0.75rem', color: '#8A93A6' }}>Let AI analyze workload and category fit to assign them automatically</div>
            </div>
            <button onClick={function () { setShowAutoAssign(true) }} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg,#6D5EF0,#7C6FEE)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(124,111,238,0.35)' }}>
              <Icon name="cpu" size={15} /> Let AI Assign All
            </button>
          </div>
        )}

        {staffList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 12, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#8A93A6', fontWeight: 600 }}>Available staff:</span>
            {staffList.map(function (st) {
              var initials = st.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
              var load = allTicketsFull.filter(function (t) { return t.assigned_to && t.assigned_to.id === st.id && ['resolved', 'closed'].indexOf(t.status) === -1 }).length
              return (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(124,111,238,0.1)', border: '1px solid rgba(124,111,238,0.25)', borderRadius: 100, padding: '0.2rem 0.65rem 0.2rem 0.3rem' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,111,238,0.2)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>{initials}</div>
                  <span style={{ fontSize: '0.72rem', color: '#B4ACF9', fontWeight: 600 }}>{st.full_name.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.65rem', color: '#8A93A6' }}>&middot; {load} open</span>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {STATUSES.map(function (s) {
            var colors = STATUS_COLORS[s.value]
            var bc = colors[0], bg = colors[1], c = colors[2]
            var isActive = status === s.value
            return (
              <button key={s.value} onClick={function () { setStatus(s.value); setPage(1) }} style={{ padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid ' + (isActive ? bc : 'rgba(255,255,255,0.1)'), background: isActive ? bg : 'rgba(255,255,255,0.03)', color: isActive ? c : '#8A93A6', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}>
                {s.label}{isActive && data && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', opacity: 0.8 }}>({data.total})</span>}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="search" size={15} /></span>
            <input type="text" value={search} onChange={function (e) { setSearch(e.target.value) }} placeholder="Search tickets, IDs, descriptions..."
              style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none' }}
            />
          </div>
          <select value={category} onChange={function (e) { setCategory(e.target.value); setPage(1) }} className="filter-select" style={{ width: 155 }}>
            <option value="">All categories</option>
            <option value="technical">Technical</option>
            <option value="administrative">Administrative</option>
            <option value="billing">Billing</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="hr">HR</option>
            <option value="security">Security</option>
            <option value="general">General</option>
          </select>
          <select value={priority} onChange={function (e) { setPriority(e.target.value); setPage(1) }} className="filter-select" style={{ width: 140 }}>
            <option value="">All priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {(search || status || category || priority) && (
            <button onClick={function () { setSearch(''); setStatus(''); setCategory(''); setPriority(''); setPage(1) }} style={{ padding: '0.7rem 1rem', background: 'rgba(248,113,113,0.1)', border: '1.5px solid rgba(248,113,113,0.3)', borderRadius: 10, color: '#F87171', fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Icon name="x" size={13} /> Clear
            </button>
          )}
        </div>

        {viewMode === 'table' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#F97316,transparent)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr 90px 75px 75px 95px 200px', gap: '0.6rem', padding: '0.85rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Ticket #', 'Title', 'Status', 'Priority', 'SLA', 'Client', 'Assign'].map(function (h) {
                return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.6rem', color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
              })}
            </div>

            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ width: 38, height: 38, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading tickets...</div>
              </div>
            ) : !(data && data.tickets && data.tickets.length) ? (
              <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="ticket" size={48} strokeWidth={1.3} /></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.4rem' }}>No tickets found</div>
                <p style={{ fontSize: '0.85rem', color: '#5C6478' }}>Try adjusting your filters.</p>
              </div>
            ) : data.tickets.map(function (t) {
              var sla = getSLA(t)
              var pc = PRI_DOT[t.priority] || '#8A93A6'
              var isOpen = activePopover === t.id
              var isAIOpen = activeAIPopover === t.id

              return (
                <div key={t.id} className="tkt-row" style={{ display: 'grid', gridTemplateColumns: '105px 1fr 90px 75px 75px 95px 200px', gap: '0.6rem', alignItems: 'center', padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#F1F3F8' }}>

                  <Link to={'/staff/tickets/' + t.id} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.68rem', color: '#5C6478', textDecoration: 'none' }}>{t.ticket_number}</Link>

                  <Link to={'/staff/tickets/' + t.id} style={{ textDecoration: 'none', color: '#F1F3F8', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {sla.urgent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171', flexShrink: 0, boxShadow: '0 0 6px rgba(248,113,113,0.6)' }} />}
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                    </div>
                  </Link>

                  <span><StatusBadge status={t.status} /></span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: pc, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.7rem', color: pc, fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</span>
                  </div>

                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.65rem', fontWeight: 600, color: sla.color }}>{sla.label}</span>

                  <div style={{ fontSize: '0.74rem', fontWeight: 500 }}>{(t.client && t.client.full_name) || '\u2014'}</div>

                  <div style={{ position: 'relative', display: 'flex', gap: '0.35rem' }}>
                    {t.assigned_to ? (
                      <button className="assign-btn" onClick={function () { setActivePopover(isOpen ? null : t.id) }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 9, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.72rem', color: '#B4ACF9', fontWeight: 600, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(124,111,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.52rem', fontWeight: 700, flexShrink: 0 }}>
                          {t.assigned_to.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.assigned_to.full_name.split(' ')[0]}</span>
                      </button>
                    ) : (
                      <>
                        <button className="ai-btn" onClick={function () { setActiveAIPopover(isAIOpen ? null : t.id) }} title="AI suggest" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 0.55rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 9, cursor: 'pointer', color: '#B4ACF9', flexShrink: 0 }}>
                          <Icon name="cpu" size={13} />
                        </button>
                        <button className={'assign-btn' + (t.priority === 'critical' || t.priority === 'high' ? ' unassigned-btn' : '')} onClick={function () { setActivePopover(isOpen ? null : t.id) }} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.6rem', background: t.priority === 'critical' ? 'rgba(248,113,113,0.1)' : t.priority === 'high' ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (PRI_BORDER[t.priority] || 'rgba(255,255,255,0.1)'), borderRadius: 9, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.68rem', color: t.priority === 'critical' ? '#F87171' : t.priority === 'high' ? '#F97316' : '#8A93A6', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Unassigned</span>
                        </button>
                      </>
                    )}

                    {isOpen && (
                      <AssignPopover ticket={t} staffList={staffList} onAssign={handleAssign} onClose={function () { setActivePopover(null) }} />
                    )}
                    {isAIOpen && (
                      <AISuggestPopover ticket={t} staffList={staffList} allTickets={allTicketsFull} onAssign={handleAssign} onClose={function () { setActiveAIPopover(null) }} />
                    )}
                  </div>
                </div>
              )
            })}

            {data && data.total_pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: '#5C6478', fontFamily: 'JetBrains Mono,monospace' }}>{(page - 1) * 20 + 1}\u2013{Math.min(page * 20, data.total)} of {data.total}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={function () { setPage(function (p) { return p - 1 }) }} disabled={page === 1} className="page-btn" style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#8A93A6', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>&larr;</button>
                  {Array.from({ length: Math.min(data.total_pages, 5) }, function (_, i) { var p = data.total_pages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, data.total_pages - 4)) + i; return <button key={p} onClick={function () { setPage(p) }} style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: p === page ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', border: '1.5px solid ' + (p === page ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)'), color: p === page ? '#F97316' : '#8A93A6', cursor: 'pointer', fontSize: '0.78rem', fontWeight: p === page ? 700 : 400 }}>{p}</button> })}
                  <button onClick={function () { setPage(function (p) { return p + 1 }) }} disabled={page === data.total_pages} className="page-btn" style={{ width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#8A93A6', cursor: page === data.total_pages ? 'not-allowed' : 'pointer', opacity: page === data.total_pages ? 0.4 : 1 }}>&rarr;</button>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '1rem' }}>
            {!(data && data.tickets && data.tickets.length) ? (
              <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: '#5C6478' }}>No tickets found</div>
            ) : data.tickets.map(function (t) {
              var sla = getSLA(t)
              var pc = PRI_DOT[t.priority] || '#8A93A6'
              var isOpen = activePopover === t.id
              var isAIOpen = activeAIPopover === t.id
              return (
                <div key={t.id} className="tkt-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', color: '#F1F3F8', position: 'relative', overflow: 'visible', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,' + pc + ',' + pc + '44)', borderRadius: '14px 14px 0 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#5C6478', background: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.45rem', borderRadius: 5 }}>{t.ticket_number}</span>
                    <StatusBadge status={t.status} />
                    <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.65rem', color: sla.color, fontWeight: 600 }}>{sla.label}</span>
                  </div>
                  <Link to={'/staff/tickets/' + t.id} style={{ textDecoration: 'none', color: '#F1F3F8' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.4rem' }}>{t.title}</div>
                  </Link>
                  <div style={{ fontSize: '0.72rem', color: '#8A93A6', lineHeight: 1.5, marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: pc }} />
                      <span style={{ fontSize: '0.7rem', color: pc, fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</span>
                    </div>
                    {t.client && t.client.full_name && <span style={{ fontSize: '0.7rem', color: '#8A93A6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icon name="user" size={11} /> {t.client.full_name}</span>}
                  </div>
                  <div style={{ position: 'relative', marginTop: '0.85rem', display: 'flex', gap: '0.4rem' }}>
                    {t.assigned_to ? (
                      <button className="assign-btn" onClick={function () { setActivePopover(isOpen ? null : t.id) }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.75rem', color: '#B4ACF9', fontWeight: 500 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,111,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>{t.assigned_to.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)}</div>
                        <span>{t.assigned_to.full_name}</span>
                      </button>
                    ) : (
                      <>
                        <button className="ai-btn" onClick={function () { setActiveAIPopover(isAIOpen ? null : t.id) }} style={{ padding: '0.5rem 0.75rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 10, cursor: 'pointer', color: '#B4ACF9', display: 'flex', alignItems: 'center' }}><Icon name="cpu" size={14} /></button>
                        <button className="assign-btn" onClick={function () { setActivePopover(isOpen ? null : t.id) }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid ' + (PRI_BORDER[t.priority] || 'rgba(255,255,255,0.1)'), borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.75rem', color: '#8A93A6' }}>
                          <Icon name="user" size={13} /><span>Assign manually</span>
                        </button>
                      </>
                    )}
                    {isOpen && <AssignPopover ticket={t} staffList={staffList} onAssign={handleAssign} onClose={function () { setActivePopover(null) }} />}
                    {isAIOpen && <AISuggestPopover ticket={t} staffList={staffList} allTickets={allTicketsFull} onAssign={handleAssign} onClose={function () { setActiveAIPopover(null) }} />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAutoAssign && (
        <AutoAssignModal
          unassignedTickets={unassignedTicketsList}
          staffList={staffList}
          allTickets={allTicketsFull}
          onConfirm={handleBulkAssign}
          onClose={function () { setShowAutoAssign(false); loadTickets(); loadAllTicketsForAI() }}
        />
      )}
    </DashboardLayout>
  )
}