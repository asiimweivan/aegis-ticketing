import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge } from '../../components/ui/Badge'
import { tickets, users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

const STATUSES = [
  { value:'', label:'All' },
  { value:'open', label:'Open' },
  { value:'in_progress', label:'In Progress' },
  { value:'pending', label:'Pending' },
  { value:'resolved', label:'Resolved' },
  { value:'closed', label:'Closed' },
]
const STATUS_COLORS = {
  '':['#E2E8F0','#F8FAFC','#475569'],
  open:['#FECACA','#FEF2F2','#DC2626'],
  in_progress:['#DDD6FE','#F5F3FF','#7C3AED'],
  pending:['#FDE68A','#FFFBEB','#D97706'],
  resolved:['#A7F3D0','#ECFDF5','#059669'],
  closed:['#E2E8F0','#F8FAFC','#64748B'],
}
const PRI_DOT = { critical:'#DC2626', high:'#EA580C', medium:'#D97706', low:'#94A3B8' }
const PRI_BORDER = { critical:'#FECACA', high:'#FED7AA', medium:'#FDE68A', low:'#E2E8F0' }
const PRI_WEIGHT = { critical:4, high:3, medium:2, low:1 }

// ── AI Scoring Engine ──
// Scores each staff member 0-100 for a given ticket based on:
// - category match history (40%)
// - inverse current workload (30%)
// - resolution speed for category (20%)
// - department match (10%)
function scoreStaffForTicket(staff, ticket, allTickets) {
  const staffTickets = allTickets.filter(t => t.assigned_to?.id === staff.id)
  const resolvedInCategory = staffTickets.filter(t => t.category === ticket.category && ['resolved','closed'].includes(t.status))
  const totalInCategory = staffTickets.filter(t => t.category === ticket.category)
  const currentOpen = staffTickets.filter(t => !['resolved','closed'].includes(t.status))
  const currentCriticalHigh = currentOpen.filter(t => ['critical','high'].includes(t.priority))

  // 1. Category expertise (40 pts) — resolution rate in this category
  let categoryScore = 0
  if (totalInCategory.length > 0) {
    categoryScore = (resolvedInCategory.length / totalInCategory.length) * 40
  } else {
    categoryScore = 15 // neutral baseline if no history
  }

  // 2. Workload (30 pts) — fewer open tickets = higher score
  const maxReasonableLoad = 12
  const workloadScore = Math.max(0, 30 * (1 - Math.min(currentOpen.length, maxReasonableLoad) / maxReasonableLoad))

  // 3. Critical/high load penalty (20 pts) — avoid stacking urgent tickets on one person
  const urgencyPenalty = Math.max(0, 20 * (1 - Math.min(currentCriticalHigh.length, 5) / 5))

  // 4. Department match (10 pts)
  const deptScore = (staff.department && ticket.category &&
    staff.department.toLowerCase().includes(ticket.category.toLowerCase())) ? 10 : 0

  const total = Math.round(categoryScore + workloadScore + urgencyPenalty + deptScore)

  const reasons = []
  if (resolvedInCategory.length > 0) reasons.push(`Resolved ${resolvedInCategory.length} ${ticket.category} ticket${resolvedInCategory.length>1?'s':''} before`)
  if (currentOpen.length === 0) reasons.push('Currently has zero open tickets')
  else if (currentOpen.length <= 2) reasons.push(`Light workload (${currentOpen.length} open)`)
  else if (currentOpen.length >= 8) reasons.push(`Heavy workload (${currentOpen.length} open) — deprioritized`)
  if (currentCriticalHigh.length === 0 && ['critical','high'].includes(ticket.priority)) reasons.push('No urgent tickets currently assigned')
  if (deptScore > 0) reasons.push(`Department matches category`)
  if (reasons.length === 0) reasons.push('No prior history — neutral candidate')

  return { staff, score: Math.min(100, Math.max(0, total)), reasons, openCount: currentOpen.length }
}

function rankStaffForTicket(ticket, staffList, allTickets) {
  return staffList
    .map(s => scoreStaffForTicket(s, ticket, allTickets))
    .sort((a,b) => b.score - a.score)
}

// ── AI Suggestion Popover ──
function AISuggestPopover({ ticket, staffList, allTickets, onAssign, onClose }) {
  const ref = useRef(null)
  const [assigning, setAssigning] = useState(false)
  const ranked = useMemo(() => rankStaffForTicket(ticket, staffList, allTickets), [ticket, staffList, allTickets])
  const top = ranked.slice(0, 3)

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    setTimeout(() => document.addEventListener('mousedown', fn), 0)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose])

  const assign = async (staffId, staffName) => {
    setAssigning(true)
    try { await onAssign(ticket.id, staffId, staffName) }
    finally { setAssigning(false) }
  }

  const scoreColor = (score) => score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#EA580C'

  return (
    <div ref={ref} style={{ position:'absolute', right:0, top:'110%', zIndex:300, background:'#FFFFFF', border:'1.5px solid #DDD6FE', borderRadius:14, padding:'0.85rem', minWidth:300, boxShadow:'0 20px 50px rgba(15,23,42,0.14)', animation:'popIn 0.15s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.75rem', padding:'0 0.25rem' }}>
        <span style={{ fontSize:'0.9rem' }}>🤖</span>
        <span style={{ fontSize:'0.72rem', fontFamily:'JetBrains Mono,monospace', color:'#7C3AED', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700 }}>AI Recommendations</span>
      </div>

      {top.length === 0 ? (
        <div style={{ padding:'1rem', textAlign:'center', fontSize:'0.78rem', color:'#94A3B8' }}>No staff registered</div>
      ) : top.map((r, idx) => (
        <button key={r.staff.id} onClick={() => assign(r.staff.id, r.staff.full_name)} disabled={assigning} style={{ display:'flex', flexDirection:'column', gap:'0.35rem', padding:'0.65rem 0.7rem', width:'100%', background: idx===0 ? '#F5F3FF' : '#F8FAFC', border:`1px solid ${idx===0 ? '#DDD6FE' : '#F1F5F9'}`, borderRadius:10, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', marginBottom:'0.4rem', textAlign:'left', transition:'all 0.15s' }}
          onMouseOver={e=>e.currentTarget.style.background='#EDE9FE'}
          onMouseOut={e=>e.currentTarget.style.background= idx===0 ? '#F5F3FF' : '#F8FAFC'}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
            {idx===0 && <span style={{ fontSize:'0.65rem', background:'#EDE9FE', color:'#7C3AED', padding:'0.1rem 0.4rem', borderRadius:5, fontWeight:700 }}>BEST MATCH</span>}
            <div style={{ width:26, height:26, borderRadius:'50%', background:'#EDE9FE', color:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', fontWeight:700, flexShrink:0 }}>
              {r.staff.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <span style={{ fontSize:'0.82rem', fontWeight:600, color:'#0F172A', flex:1 }}>{r.staff.full_name}</span>
            <span style={{ fontSize:'0.85rem', fontWeight:800, color:scoreColor(r.score), fontFamily:'JetBrains Mono,monospace' }}>{r.score}%</span>
          </div>
          <div style={{ fontSize:'0.68rem', color:'#64748B', paddingLeft:'2rem', lineHeight:1.5 }}>
            {r.reasons.slice(0,2).join(' · ')}
          </div>
        </button>
      ))}

      <div style={{ marginTop:'0.4rem', paddingTop:'0.5rem', borderTop:'1px solid #F1F5F9', fontSize:'0.65rem', color:'#94A3B8', textAlign:'center' }}>
        Scored on category history · workload · urgency
      </div>
    </div>
  )
}

// ── Manual Assign Popover ──
function AssignPopover({ ticket, staffList, onAssign, onClose }) {
  const ref = useRef(null)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    setTimeout(() => document.addEventListener('mousedown', fn), 0)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose])

  const assign = async (staffId, staffName) => {
    setAssigning(true)
    try { await onAssign(ticket.id, staffId, staffName) }
    finally { setAssigning(false) }
  }

  return (
    <div ref={ref} style={{ position:'absolute', right:0, top:'110%', zIndex:300, background:'#FFFFFF', border:'1.5px solid #FDE68A', borderRadius:14, padding:'0.75rem', minWidth:240, boxShadow:'0 20px 50px rgba(15,23,42,0.14)', animation:'popIn 0.15s ease' }}>
      <div style={{ fontSize:'0.68rem', fontFamily:'JetBrains Mono,monospace', color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.6rem', padding:'0 0.25rem' }}>
        Assign manually
      </div>
      {ticket.assigned_to && (
        <div style={{ padding:'0.5rem 0.6rem', marginBottom:'0.4rem', background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:9, fontSize:'0.75rem', color:'#059669', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:500 }}>
          <span>✓</span> Currently: {ticket.assigned_to.full_name}
        </div>
      )}
      {ticket.assigned_to && (
        <button onClick={() => assign(null, 'Unassigned')} disabled={assigning} style={{ width:'100%', padding:'0.5rem 0.6rem', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:9, color:'#DC2626', fontSize:'0.78rem', cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', marginBottom:'0.4rem', textAlign:'left', fontWeight:500 }}>
          🚫 Remove assignment
        </button>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', maxHeight:200, overflowY:'auto' }}>
        {staffList.length === 0 ? (
          <div style={{ padding:'1rem', textAlign:'center', fontSize:'0.78rem', color:'#94A3B8' }}>No staff registered</div>
        ) : staffList.map(st => {
          const initials = st.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
          const isCurrent = ticket.assigned_to?.id === st.id
          return (
            <button key={st.id} onClick={() => !isCurrent && assign(st.id, st.full_name)} disabled={assigning || isCurrent} style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.55rem 0.6rem', background:isCurrent?'#ECFDF5':'#F8FAFC', border:`1px solid ${isCurrent?'#A7F3D0':'#F1F5F9'}`, borderRadius:9, cursor:isCurrent?'default':'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', textAlign:'left' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#EDE9FE', color:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700, flexShrink:0 }}>{initials}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{st.full_name}</div>
                {st.department && <div style={{ fontSize:'0.68rem', color:'#94A3B8' }}>{st.department}</div>}
              </div>
              {isCurrent && <span style={{ fontSize:'0.65rem', color:'#059669' }}>✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Bulk AI Auto-Assign Modal ──
function AutoAssignModal({ unassignedTickets, staffList, allTickets, onConfirm, onClose }) {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [assignments, setAssignments] = useState([])

  const proposals = useMemo(() => {
    return unassignedTickets.map(t => {
      const ranked = rankStaffForTicket(t, staffList, allTickets)
      return { ticket: t, best: ranked[0] || null }
    })
  }, [unassignedTickets, staffList, allTickets])

  const runAutoAssign = async () => {
    setRunning(true)
    const results = []
    for (const p of proposals) {
      if (p.best) {
        try {
          await onConfirm(p.ticket.id, p.best.staff.id)
          results.push({ ticket: p.ticket, staff: p.best.staff, success: true })
        } catch(e) {
          results.push({ ticket: p.ticket, staff: p.best.staff, success: false })
        }
      }
    }
    setAssignments(results)
    setRunning(false)
    setDone(true)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
      onClick={e=>e.target===e.currentTarget && !running && onClose()}>
      <div style={{ background:'#FFFFFF', border:'1px solid #F1F5F9', borderRadius:20, padding:'2rem', width:'100%', maxWidth:560, maxHeight:'85vh', overflowY:'auto', position:'relative', boxShadow:'0 30px 80px rgba(15,23,42,0.25)' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#7C3AED,transparent)', borderRadius:'20px 20px 0 0' }} />

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'#F5F3FF', border:'1px solid #DDD6FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>🤖</div>
          <div>
            <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.1rem', fontWeight:800, color:'#0F172A' }}>AI Auto-Assignment</div>
            <div style={{ fontSize:'0.78rem', color:'#64748B' }}>{unassignedTickets.length} unassigned tickets found</div>
          </div>
          {!running && (
            <button onClick={onClose} style={{ marginLeft:'auto', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, width:32, height:32, cursor:'pointer', color:'#64748B' }}>✕</button>
          )}
        </div>

        {!done ? (
          <>
            <div style={{ background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:12, padding:'1rem', marginBottom:'1.25rem', fontSize:'0.82rem', color:'#5B21B6', lineHeight:1.6 }}>
              AI will analyze each unassigned ticket and match it to the best-fit staff member based on category history, current workload, and urgency. Review proposals below before confirming.
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.5rem', maxHeight:280, overflowY:'auto' }}>
              {proposals.map(p => (
                <div key={p.ticket.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'#F8FAFC', border:'1px solid #F1F5F9', borderRadius:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.78rem', fontWeight:600, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.ticket.title}</div>
                    <div style={{ fontSize:'0.68rem', color:'#94A3B8' }}>{p.ticket.ticket_number} · {p.ticket.priority}</div>
                  </div>
                  <span style={{ fontSize:'0.85rem', color:'#CBD5E1' }}>→</span>
                  {p.best ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'#F5F3FF', padding:'0.3rem 0.6rem', borderRadius:8 }}>
                      <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#7C3AED' }}>{p.best.staff.full_name.split(' ')[0]}</span>
                      <span style={{ fontSize:'0.68rem', color:'#7C3AED', opacity:0.7 }}>{p.best.score}%</span>
                    </div>
                  ) : (
                    <span style={{ fontSize:'0.72rem', color:'#94A3B8' }}>No staff available</span>
                  )}
                </div>
              ))}
            </div>

            <button onClick={runAutoAssign} disabled={running} style={{ width:'100%', padding:'0.9rem', background: running ? '#E2E8F0' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color:'#fff', border:'none', borderRadius:12, fontSize:'0.9rem', fontWeight:700, cursor:running?'not-allowed':'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', boxShadow: running ? 'none' : '0 8px 20px rgba(124,58,237,0.3)' }}>
              {running ? (
                <><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(100,116,139,0.3)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/></svg> Assigning {proposals.length} tickets...</>
              ) : `🤖 Confirm & Auto-Assign ${proposals.filter(p=>p.best).length} Tickets`}
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign:'center', padding:'1rem 0 1.5rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>✅</div>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.1rem', fontWeight:700, color:'#0F172A', marginBottom:'0.3rem' }}>
                {assignments.filter(a=>a.success).length} tickets assigned successfully
              </div>
              {assignments.some(a=>!a.success) && (
                <div style={{ fontSize:'0.78rem', color:'#DC2626' }}>{assignments.filter(a=>!a.success).length} failed — try manually</div>
              )}
            </div>
            <button onClick={onClose} style={{ width:'100%', padding:'0.85rem', background:'#F8FAFC', border:'1px solid #E2E8F0', color:'#0F172A', borderRadius:12, fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminTickets() {
  const showToast = useToast()
  const [data, setData] = useState(null)
  const [allTicketsFull, setAllTicketsFull] = useState([]) // for AI scoring history
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)
  const [searchTimer, setSearchTimer] = useState(null)
  const [cachedTickets, setCachedTickets] = useState([])
  const [viewMode, setViewMode] = useState('table')
  const [activePopover, setActivePopover] = useState(null)
  const [activeAIPopover, setActiveAIPopover] = useState(null)
  const [showAutoAssign, setShowAutoAssign] = useState(false)

  useEffect(() => { loadTickets(); loadStaff(); loadAllTicketsForAI() }, [])
  useEffect(() => { loadTickets() }, [status, category, priority, page])
  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer)
    const t = setTimeout(() => { setPage(1); loadTickets() }, 400)
    setSearchTimer(t)
    return () => clearTimeout(t)
  }, [search])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 20 }
      if (status) params.status = status
      if (category) params.category = category
      if (priority) params.priority = priority
      if (search.trim()) params.search = search.trim()
      const res = await tickets.list(params)
      if (res) { setData(res); setCachedTickets(res.tickets) }
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadStaff = async () => {
    try {
      const res = await users.list({ role:'staff' })
      if (res) setStaffList(Array.isArray(res) ? res : res.users || [])
    } catch(e) { console.error(e) }
  }

  // Load full ticket history for AI scoring (paginated, safe page_size)
  const loadAllTicketsForAI = async () => {
    try {
      let all = []
      let p = 1
      while (true) {
        const res = await tickets.list({ page:p, page_size:100 }).catch(() => null)
        if (!res || !res.tickets?.length) break
        all = all.concat(res.tickets)
        if (res.tickets.length < 100 || all.length >= (res.total || all.length)) break
        p++
        if (p > 15) break
      }
      setAllTicketsFull(all)
    } catch(e) { console.error('AI data load error:', e) }
  }

  const handleAssign = async (ticketId, staffId, staffName) => {
    try {
      const payload = staffId ? { assigned_to_id: staffId, status: 'in_progress' } : { assigned_to_id: null }
      await tickets.update(ticketId, payload)
      showToast(staffId ? `Assigned to ${staffName}` : 'Assignment removed')
      setActivePopover(null)
      setActiveAIPopover(null)
      loadTickets()
      loadAllTicketsForAI()
    } catch(e) {
      showToast(e.message || 'Assignment failed', 'error')
      throw e
    }
  }

  const handleBulkAssign = async (ticketId, staffId) => {
    await tickets.update(ticketId, { assigned_to_id: staffId, status: 'in_progress' })
  }

  const getSLA = (t) => {
    if (!t.due_date) return { label:'No SLA', color:'#94A3B8', urgent:false }
    const diff = new Date(t.due_date) - Date.now()
    const hours = diff / 3600000
    if (diff < 0) return { label:'Breached', color:'#DC2626', urgent:true }
    if (hours < 4)  return { label:`${Math.round(hours)}h left`, color:'#DC2626', urgent:true }
    if (hours < 12) return { label:`${Math.round(hours)}h left`, color:'#D97706', urgent:false }
    return { label:`${Math.round(hours)}h left`, color:'#059669', urgent:false }
  }

  const exportCSV = () => {
    if (!cachedTickets.length) { showToast('No tickets to export','error'); return }
    const headers = ['Ticket #','Title','Category','Status','Priority','Client','Assigned To','SLA','Created']
    const rows = cachedTickets.map(t => [
      t.ticket_number, `"${t.title.replace(/"/g,'""')}"`,
      t.category, t.status, t.priority,
      t.client?.full_name||'',
      t.assigned_to?.full_name||'Unassigned',
      getSLA(t).label,
      helpers.formatDate(t.created_at),
    ])
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url
    a.download=`aegis-tickets-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    showToast('Exported successfully')
  }

  const unassignedCount = useMemo(() =>
    allTicketsFull.filter(t => !t.assigned_to && !['resolved','closed'].includes(t.status)).length
  , [allTicketsFull])

  const unassignedTicketsList = useMemo(() =>
    allTicketsFull.filter(t => !t.assigned_to && !['resolved','closed'].includes(t.status))
  , [allTicketsFull])

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes popIn  { from{opacity:0;transform:scale(0.92) translateY(-6px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes glowPulse { 0%,100%{box-shadow:0 4px 16px rgba(124,58,237,0.12)} 50%{box-shadow:0 4px 24px rgba(124,58,237,0.22)} }
    .tkt-row { transition: background 0.15s; }
    .tkt-row:hover { background: #FFF9F2 !important; }
    .filter-select { padding:0.7rem 1rem; background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:10px; color:#0F172A; font-size:0.85rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; cursor:pointer; transition:all 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.03); }
    .filter-select:focus { border-color:#E8450A; box-shadow:0 0 0 3px rgba(232,69,10,0.1); }
    .assign-btn { transition: all 0.2s; }
    .assign-btn:hover { background: #F5F3FF !important; border-color: #DDD6FE !important; color: #7C3AED !important; }
    .ai-btn:hover { background: #EDE9FE !important; border-color: #C4B5FD !important; }
    .unassigned-btn:hover { background: #FEF2F2 !important; border-color: #FECACA !important; color: #DC2626 !important; }
    .tkt-card:hover { border-color:#FED7C8 !important; transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,69,10,0.08); }
    .page-btn:hover:not(:disabled) { border-color:#FED7C8 !important; color:#E8450A !important; }
    .auto-assign-banner { animation: glowPulse 3s ease-in-out infinite; }
    .export-btn:hover { background:#FFE8D9 !important; }
  `

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="All Tickets"
        subtitle={data ? `${data.total.toLocaleString()} tickets · ${staffList.length} staff available` : 'Loading...'}
        actions={
          <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
            <div style={{ display:'flex', background:'#FFFFFF', border:'1.5px solid #E2E8F0', borderRadius:8, overflow:'hidden' }}>
              {[['table','⊞'],['cards','⊟']].map(([v,ic]) => (
                <button key={v} onClick={()=>setViewMode(v)} style={{ width:34, height:32, border:'none', cursor:'pointer', fontSize:'0.9rem', transition:'all 0.2s', background:viewMode===v?'#FFF5F2':'transparent', color:viewMode===v?'#E8450A':'#94A3B8' }}>{ic}</button>
              ))}
            </div>
            <button className="export-btn" onClick={exportCSV} style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1rem', borderRadius:8, fontSize:'0.8rem', fontWeight:600, background:'#FFF5F2', border:'1px solid #FED7C8', color:'#E8450A', cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', transition:'all 0.2s' }}>📥 Export</button>
          </div>
        }
      />

      <div style={{ padding:'2rem', animation:'fadeIn 0.4s ease both', background:'#F8FAFC', minHeight:'100%' }}>

        {/* AI Auto-Assign Banner */}
        {unassignedCount > 0 && (
          <div className="auto-assign-banner" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.5rem', background:'linear-gradient(135deg,#F5F3FF,#EDE9FE)', border:'1px solid #DDD6FE', borderRadius:14, marginBottom:'1.25rem', flexWrap:'wrap' }}>
            <div style={{ width:40, height:40, borderRadius:11, background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0, boxShadow:'0 2px 8px rgba(124,58,237,0.15)' }}>🤖</div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0F172A' }}>{unassignedCount} unassigned ticket{unassignedCount>1?'s':''} need attention</div>
              <div style={{ fontSize:'0.75rem', color:'#64748B' }}>Let AI analyze workload and category fit to assign them automatically</div>
            </div>
            <button onClick={() => setShowAutoAssign(true)} style={{ padding:'0.65rem 1.25rem', background:'linear-gradient(135deg,#7C3AED,#6D28D9)', color:'#fff', border:'none', borderRadius:10, fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', display:'flex', alignItems:'center', gap:'0.4rem', boxShadow:'0 4px 14px rgba(124,58,237,0.3)' }}>
              🤖 Let AI Assign All
            </button>
          </div>
        )}

        {/* Staff availability banner */}
        {staffList.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem 1.25rem', background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:12, marginBottom:'1.25rem', flexWrap:'wrap', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize:'0.78rem', color:'#64748B', fontWeight:600 }}>Available staff:</span>
            {staffList.map(st => {
              const initials = st.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
              const load = allTicketsFull.filter(t => t.assigned_to?.id === st.id && !['resolved','closed'].includes(t.status)).length
              return (
                <div key={st.id} style={{ display:'flex', alignItems:'center', gap:'0.35rem', background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:100, padding:'0.2rem 0.65rem 0.2rem 0.3rem' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'#EDE9FE', color:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', fontWeight:700 }}>{initials}</div>
                  <span style={{ fontSize:'0.72rem', color:'#7C3AED', fontWeight:600 }}>{st.full_name.split(' ')[0]}</span>
                  <span style={{ fontSize:'0.65rem', color:'#8B5CF6' }}>· {load} open</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Status tabs */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
          {STATUSES.map(s => {
            const [bc,bg,c] = STATUS_COLORS[s.value]
            const isActive = status === s.value
            return (
              <button key={s.value} onClick={()=>{ setStatus(s.value); setPage(1) }} style={{ padding:'0.4rem 1rem', borderRadius:100, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', border:`1.5px solid ${isActive?bc:'#E2E8F0'}`, background:isActive?bg:'#FFFFFF', color:isActive?c:'#64748B', fontFamily:'Plus Jakarta Sans,sans-serif', transition:'all 0.2s' }}>
                {s.label}{isActive && data && <span style={{ marginLeft:'0.4rem', fontSize:'0.7rem', opacity:0.8 }}>({data.total})</span>}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:240 }}>
            <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', fontSize:'0.85rem', opacity:0.4, pointerEvents:'none' }}>🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets, IDs, descriptions..."
              style={{ width:'100%', padding:'0.7rem 1rem 0.7rem 2.6rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', borderRadius:10, color:'#0F172A', fontSize:'0.875rem', fontFamily:'Plus Jakarta Sans,sans-serif', outline:'none', boxShadow:'0 1px 2px rgba(0,0,0,0.03)' }}
            />
          </div>
          <select value={category} onChange={e=>{ setCategory(e.target.value); setPage(1) }} className="filter-select" style={{ width:155 }}>
            <option value="">All categories</option>
            <option value="technical">💻 Technical</option>
            <option value="administrative">📋 Administrative</option>
            <option value="billing">💳 Billing</option>
            <option value="infrastructure">🏗️ Infrastructure</option>
            <option value="hr">👥 HR</option>
            <option value="security">🔒 Security</option>
            <option value="general">📌 General</option>
          </select>
          <select value={priority} onChange={e=>{ setPriority(e.target.value); setPage(1) }} className="filter-select" style={{ width:140 }}>
            <option value="">All priorities</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          {(search||status||category||priority) && (
            <button onClick={()=>{ setSearch(''); setStatus(''); setCategory(''); setPriority(''); setPage(1) }} style={{ padding:'0.7rem 1rem', background:'#FEF2F2', border:'1.5px solid #FECACA', borderRadius:10, color:'#DC2626', fontSize:'0.82rem', cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', whiteSpace:'nowrap', fontWeight:500 }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:16, overflow:'hidden', position:'relative', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#E8450A,transparent)' }} />

            <div style={{ display:'grid', gridTemplateColumns:'105px 1fr 90px 75px 75px 95px 200px', gap:'0.6rem', padding:'0.85rem 1.5rem', background:'#F8FAFC', borderBottom:'1px solid #F1F5F9' }}>
              {['Ticket #','Title','Status','Priority','SLA','Client','Assign'].map(h => (
                <span key={h} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.6rem', color:'#94A3B8', letterSpacing:'0.06em', textTransform:'uppercase' }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding:'4rem', textAlign:'center' }}>
                <div style={{ width:38, height:38, border:'3px solid #FED7C8', borderTopColor:'#E8450A', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }} />
                <div style={{ color:'#94A3B8', fontSize:'0.85rem' }}>Loading tickets...</div>
              </div>
            ) : !data?.tickets?.length ? (
              <div style={{ padding:'5rem 2rem', textAlign:'center' }}>
                <div style={{ fontSize:'3.5rem', marginBottom:'1rem', opacity:0.25 }}>🎫</div>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.1rem', fontWeight:700, color:'#0F172A', marginBottom:'0.4rem' }}>No tickets found</div>
                <p style={{ fontSize:'0.85rem', color:'#94A3B8' }}>Try adjusting your filters.</p>
              </div>
            ) : data.tickets.map(t => {
              const sla = getSLA(t)
              const pc = PRI_DOT[t.priority] || '#94A3B8'
              const isOpen = activePopover === t.id
              const isAIOpen = activeAIPopover === t.id

              return (
                <div key={t.id} className="tkt-row" style={{ display:'grid', gridTemplateColumns:'105px 1fr 90px 75px 75px 95px 200px', gap:'0.6rem', alignItems:'center', padding:'0.85rem 1.5rem', borderBottom:'1px solid #F1F5F9', color:'#0F172A' }}>

                  <Link to={`/staff/tickets/${t.id}`} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.68rem', color:'#94A3B8', textDecoration:'none' }}>{t.ticket_number}</Link>

                  <Link to={`/staff/tickets/${t.id}`} style={{ textDecoration:'none', color:'#0F172A', minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      {sla.urgent && <span style={{ width:6, height:6, borderRadius:'50%', background:'#DC2626', flexShrink:0, boxShadow:'0 0 6px rgba(220,38,38,0.5)' }} />}
                      <span style={{ fontSize:'0.82rem', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</span>
                    </div>
                  </Link>

                  <span><StatusBadge status={t.status} /></span>

                  <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:pc, flexShrink:0 }} />
                    <span style={{ fontSize:'0.7rem', color:pc, fontWeight:600, textTransform:'capitalize' }}>{t.priority}</span>
                  </div>

                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.65rem', fontWeight:600, color:sla.color }}>{sla.label}</span>

                  <div style={{ fontSize:'0.74rem', fontWeight:500 }}>{t.client?.full_name||'—'}</div>

                  {/* ── DUAL ASSIGN BUTTONS: AI + Manual ── */}
                  <div style={{ position:'relative', display:'flex', gap:'0.35rem' }}>
                    {t.assigned_to ? (
                      <button className="assign-btn" onClick={()=>setActivePopover(isOpen?null:t.id)} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.4rem 0.6rem', background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:9, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.72rem', color:'#7C3AED', fontWeight:600, flex:1, transition:'all 0.2s', minWidth:0 }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.52rem', fontWeight:700, flexShrink:0 }}>
                          {t.assigned_to.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.assigned_to.full_name.split(' ')[0]}</span>
                      </button>
                    ) : (
                      <>
                        <button className="ai-btn" onClick={()=>setActiveAIPopover(isAIOpen?null:t.id)} title="AI suggest" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'0.4rem 0.55rem', background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:9, cursor:'pointer', fontSize:'0.78rem', transition:'all 0.2s', flexShrink:0 }}>
                          🤖
                        </button>
                        <button className={`assign-btn ${t.priority==='critical'||t.priority==='high'?'unassigned-btn':''}`} onClick={()=>setActivePopover(isOpen?null:t.id)} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.4rem 0.6rem', background: t.priority==='critical'?'#FEF2F2':t.priority==='high'?'#FFF7ED':'#F8FAFC', border:`1px solid ${PRI_BORDER[t.priority]||'#E2E8F0'}`, borderRadius:9, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.68rem', color:t.priority==='critical'?'#DC2626':t.priority==='high'?'#EA580C':'#94A3B8', fontWeight:500, flex:1, transition:'all 0.2s', minWidth:0, overflow:'hidden' }}>
                          <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Unassigned</span>
                        </button>
                      </>
                    )}

                    {isOpen && (
                      <AssignPopover ticket={t} staffList={staffList} onAssign={handleAssign} onClose={() => setActivePopover(null)} />
                    )}
                    {isAIOpen && (
                      <AISuggestPopover ticket={t} staffList={staffList} allTickets={allTicketsFull} onAssign={handleAssign} onClose={() => setActiveAIPopover(null)} />
                    )}
                  </div>
                </div>
              )
            })}

            {data && data.total_pages > 1 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.5rem', borderTop:'1px solid #F1F5F9', background:'#F8FAFC' }}>
                <span style={{ fontSize:'0.75rem', color:'#94A3B8', fontFamily:'JetBrains Mono,monospace' }}>{(page-1)*20+1}–{Math.min(page*20,data.total)} of {data.total}</span>
                <div style={{ display:'flex', gap:'0.4rem' }}>
                  <button onClick={()=>setPage(p=>p-1)} disabled={page===1} className="page-btn" style={{ width:32, height:32, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'#FFFFFF', border:'1.5px solid #E2E8F0', color:'#64748B', cursor:page===1?'not-allowed':'pointer', opacity:page===1?0.4:1 }}>←</button>
                  {Array.from({length:Math.min(data.total_pages,5)},(_,i)=>{ const p=data.total_pages<=5?i+1:Math.max(1,Math.min(page-2,data.total_pages-4))+i; return <button key={p} onClick={()=>setPage(p)} style={{ width:32, height:32, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:p===page?'#FFF5F2':'#FFFFFF', border:`1.5px solid ${p===page?'#FED7C8':'#E2E8F0'}`, color:p===page?'#E8450A':'#64748B', cursor:'pointer', fontSize:'0.78rem', fontWeight:p===page?700:400 }}>{p}</button> })}
                  <button onClick={()=>setPage(p=>p+1)} disabled={page===data.total_pages} className="page-btn" style={{ width:32, height:32, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'#FFFFFF', border:'1.5px solid #E2E8F0', color:'#64748B', cursor:page===data.total_pages?'not-allowed':'pointer', opacity:page===data.total_pages?0.4:1 }}>→</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CARD VIEW */}
        {viewMode === 'cards' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:'1rem' }}>
            {!data?.tickets?.length ? (
              <div style={{ gridColumn:'1/-1', padding:'4rem', textAlign:'center', color:'#94A3B8' }}>No tickets found</div>
            ) : data.tickets.map(t => {
              const sla = getSLA(t)
              const pc = PRI_DOT[t.priority]||'#94A3B8'
              const isOpen = activePopover === t.id
              const isAIOpen = activeAIPopover === t.id
              return (
                <div key={t.id} className="tkt-card" style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:14, padding:'1.25rem', color:'#0F172A', position:'relative', overflow:'visible', transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${pc},${pc}44)`, borderRadius:'14px 14px 0 0' }} />
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.62rem', color:'#94A3B8', background:'#F8FAFC', padding:'0.15rem 0.45rem', borderRadius:5 }}>{t.ticket_number}</span>
                    <StatusBadge status={t.status} />
                    <span style={{ marginLeft:'auto', fontFamily:'JetBrains Mono,monospace', fontSize:'0.65rem', color:sla.color, fontWeight:600 }}>{sla.label}</span>
                  </div>
                  <Link to={`/staff/tickets/${t.id}`} style={{ textDecoration:'none', color:'#0F172A' }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, lineHeight:1.4, marginBottom:'0.4rem' }}>{t.title}</div>
                  </Link>
                  <div style={{ fontSize:'0.72rem', color:'#64748B', lineHeight:1.5, marginBottom:'0.85rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{t.description}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', paddingBottom:'0.85rem', borderBottom:'1px solid #F1F5F9' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:pc }} />
                      <span style={{ fontSize:'0.7rem', color:pc, fontWeight:600, textTransform:'capitalize' }}>{t.priority}</span>
                    </div>
                    {t.client?.full_name && <span style={{ fontSize:'0.7rem', color:'#64748B' }}>👤 {t.client.full_name}</span>}
                  </div>
                  <div style={{ position:'relative', marginTop:'0.85rem', display:'flex', gap:'0.4rem' }}>
                    {t.assigned_to ? (
                      <button className="assign-btn" onClick={()=>setActivePopover(isOpen?null:t.id)} style={{ flex:1, display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.75rem', background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:10, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.75rem', color:'#7C3AED', fontWeight:500 }}>
                        <div style={{ width:20, height:20, borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', fontWeight:700 }}>{t.assigned_to.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}</div>
                        <span>{t.assigned_to.full_name}</span>
                      </button>
                    ) : (
                      <>
                        <button className="ai-btn" onClick={()=>setActiveAIPopover(isAIOpen?null:t.id)} style={{ padding:'0.5rem 0.75rem', background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:10, cursor:'pointer', fontSize:'0.85rem' }}>🤖</button>
                        <button className="assign-btn" onClick={()=>setActivePopover(isOpen?null:t.id)} style={{ flex:1, display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.75rem', background:'#F8FAFC', border:`1px solid ${PRI_BORDER[t.priority]||'#E2E8F0'}`, borderRadius:10, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.75rem', color:'#64748B' }}>
                          <span>👤 Assign manually</span>
                        </button>
                      </>
                    )}
                    {isOpen && <AssignPopover ticket={t} staffList={staffList} onAssign={handleAssign} onClose={()=>setActivePopover(null)} />}
                    {isAIOpen && <AISuggestPopover ticket={t} staffList={staffList} allTickets={allTicketsFull} onAssign={handleAssign} onClose={()=>setActiveAIPopover(null)} />}
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
          onClose={() => { setShowAutoAssign(false); loadTickets(); loadAllTicketsForAI() }}
        />
      )}
    </DashboardLayout>
  )
}