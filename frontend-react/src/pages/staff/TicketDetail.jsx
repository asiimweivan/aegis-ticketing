import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets, users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'

var STATUS_CONFIG = {
  open: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label: 'Open' },
  in_progress: { color: '#B4ACF9', bg: 'rgba(124,111,238,0.1)', border: 'rgba(124,111,238,0.3)', label: 'In Progress' },
  pending: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', label: 'Pending' },
  resolved: { color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', label: 'Resolved' },
  closed: { color: '#8A93A6', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', label: 'Closed' },
}
var PRI_CONFIG = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#34D399' }

var RESPONSE_TEMPLATES = {
  technical: 'Thank you for reporting this technical issue. Our team is investigating and will resolve it as quickly as possible. We will update you as soon as we have more information.',
  administrative: 'Thank you for your request. We have received it and are processing it through the appropriate administrative channels. We will follow up with next steps shortly.',
  billing: 'Thank you for reaching out regarding this billing matter. We are reviewing your account and will provide clarification or a resolution shortly.',
  infrastructure: 'Thank you for flagging this infrastructure issue. Our team has been notified and will assess the situation on-site if needed. We will keep you updated on progress.',
  hr: 'Thank you for your inquiry. We have forwarded this to the appropriate department and will respond with the information you need soon.',
  security: 'Thank you for reporting this. Security matters are treated with the highest priority - our team is reviewing this immediately and will follow up shortly.',
  general: 'Thank you for reaching out. We have received your message and will get back to you with a full response shortly.',
}

function Icon(props) {
  var name = props.name
  var size = props.size || 16
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'arrow-left') return <svg {...common}><path d="M19 12H5M5 12l6-6M5 12l6 6" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'send') return <svg {...common}><path d="m3 3 18 9-18 9 4-9-4-9Z" /></svg>
  if (name === 'message-circle') return <svg {...common}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.4 0-2.7-.3-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'sparkles') return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
  if (name === 'arrow-right-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m10 8 4 4-4 4" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  return null
}

export default function StaffTicketDetail() {
  var params = useParams()
  var id = params.id
  var showToast = useToast()
  var authStore = useAuthStore()
  var currentUser = authStore.user

  var ticketArr = useState(null)
  var ticket = ticketArr[0]
  var setTicket = ticketArr[1]
  var commentsArr = useState([])
  var comments = commentsArr[0]
  var setComments = commentsArr[1]
  var staffListArr = useState([])
  var staffList = staffListArr[0]
  var setStaffList = staffListArr[1]
  var clientHistoryArr = useState([])
  var clientHistory = clientHistoryArr[0]
  var setClientHistory = clientHistoryArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var newCommentArr = useState('')
  var newComment = newCommentArr[0]
  var setNewComment = newCommentArr[1]
  var isInternalArr = useState(false)
  var isInternal = isInternalArr[0]
  var setIsInternal = isInternalArr[1]
  var sendingArr = useState(false)
  var sending = sendingArr[0]
  var setSending = sendingArr[1]
  var updatingArr = useState(false)
  var updating = updatingArr[0]
  var setUpdating = updatingArr[1]
  var showEscalateArr = useState(false)
  var showEscalate = showEscalateArr[0]
  var setShowEscalate = showEscalateArr[1]
  var escalateToArr = useState('')
  var escalateTo = escalateToArr[0]
  var setEscalateTo = escalateToArr[1]
  var escalateReasonArr = useState('')
  var escalateReason = escalateReasonArr[0]
  var setEscalateReason = escalateReasonArr[1]
  var escalatingArr = useState(false)
  var escalating = escalatingArr[0]
  var setEscalating = escalatingArr[1]

  useEffect(function () { loadTicket() }, [id])

  function loadTicket() {
    setLoading(true)
    Promise.all([
      tickets.get(id),
      tickets.comments(id).catch(function () { return [] }),
      users.list({ role: 'staff' }).catch(function () { return [] }),
    ]).then(function (results) {
      var t = results[0], c = results[1], s = results[2]
      if (t) {
        setTicket(t)
        if (t.client && t.client.id) {
          tickets.list({ page_size: 50 }).then(function (res) {
            var all = (res && res.tickets) || []
            setClientHistory(all.filter(function (x) { return x.client && x.client.id === t.client.id && x.id !== t.id }).slice(0, 5))
          }).catch(function () { })
        }
      }
      setComments(Array.isArray(c) ? c : (c && c.comments) || [])
      setStaffList(Array.isArray(s) ? s : (s && s.users) || [])
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function updateField(field, value) {
    setUpdating(true)
    var payload = {}
    payload[field] = value
    tickets.update(id, payload).then(function (updated) {
      if (updated) setTicket(updated)
      showToast('Ticket updated')
    }).catch(function (err) {
      showToast(err.message || 'Update failed', 'error')
    }).finally(function () { setUpdating(false) })
  }

  function handleEscalate(e) {
    e.preventDefault()
    if (!escalateTo || !escalateReason.trim()) return
    setEscalating(true)
    tickets.escalate(id, { to_user_id: parseInt(escalateTo, 10), reason: escalateReason.trim() }).then(function (updated) {
      if (updated) setTicket(updated)
      showToast('Ticket escalated successfully')
      setShowEscalate(false)
      setEscalateTo('')
      setEscalateReason('')
    }).catch(function (err) {
      showToast(err.message || 'Could not escalate ticket', 'error')
    }).finally(function () { setEscalating(false) })
  }

  function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSending(true)
    tickets.addComment(id, { content: newComment.trim(), is_internal: isInternal }).then(function (c) {
      if (c) setComments(function (prev) { return prev.concat([c]) })
      setNewComment('')
      setIsInternal(false)
    }).catch(function (err) {
      showToast(err.message || 'Could not post comment', 'error')
    }).finally(function () { setSending(false) })
  }

  function insertTemplate() {
    if (!ticket) return
    var template = RESPONSE_TEMPLATES[ticket.category] || RESPONSE_TEMPLATES.general
    var clientName = (ticket.client && ticket.client.full_name) || 'there'
    var text = 'Hi ' + clientName.split(' ')[0] + ',\n\n' + template + '\n\nRegarding ticket ' + ticket.ticket_number + '.\n\nBest regards,\nAEG Support Team'
    setNewComment(text)
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .comment-inp:focus { border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .field-select { padding:0.5rem 0.75rem; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.1); border-radius:8px; color:#F1F3F8; font-size:0.8rem; font-family:'Inter',sans-serif; outline:none; cursor:pointer; }\n    select { color-scheme: dark; }\n    select option { background:#0B0E17; color:#F1F3F8; }\n    .history-row:hover { background:rgba(255,255,255,0.04) !important; }\n    .template-btn:hover { background:rgba(124,111,238,0.18) !important; }\n  "

  if (loading) {
    return (
      <DashboardLayout>
        <style>{css}</style>
        <Topbar title="Loading..." />
        <div style={{ padding: '4rem', textAlign: 'center', background: '#05070D', minHeight: '100%' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading ticket...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <style>{css}</style>
        <Topbar title="Not found" />
        <div style={{ padding: '4rem', textAlign: 'center', background: '#05070D', minHeight: '100%', fontFamily: "'Inter',sans-serif" }}>
          <Link to="/staff/tickets" style={{ color: '#F97316', fontSize: '0.85rem', fontWeight: 600 }}>&larr; Back to tickets</Link>
        </div>
      </DashboardLayout>
    )
  }

  var sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
  var pc = PRI_CONFIG[ticket.priority] || '#8A93A6'

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title={ticket.ticket_number} subtitle={ticket.title} />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>
        <Link to="/staff/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#8A93A6', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <Icon name="arrow-left" size={14} /> Back to tickets
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', color: '#5C6478', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>{ticket.ticket_number}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: sc.color, background: sc.bg, border: '1px solid ' + sc.border, padding: '0.2rem 0.65rem', borderRadius: 100 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color }} /> {sc.label}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.01em', marginBottom: '1.25rem', lineHeight: 1.35 }}>{ticket.title}</h1>
              <p style={{ fontSize: '0.9rem', color: '#B0B8C8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>

              {ticket.ai_summary && (
                <div style={{ marginTop: '1.5rem', background: 'rgba(124,111,238,0.08)', border: '1px solid rgba(124,111,238,0.25)', borderRadius: 12, padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#B4ACF9', display: 'flex' }}><Icon name="cpu" size={14} /></span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B4ACF9', letterSpacing: '0.04em', textTransform: 'uppercase' }}>AI Summary</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#D6DCE8', lineHeight: 1.7 }}>{ticket.ai_summary}</p>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#5C6478', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Status</label>
                  <select className="field-select" value={ticket.status} onChange={function (e) { updateField('status', e.target.value) }} disabled={updating}>
                    {Object.keys(STATUS_CONFIG).map(function (s) { return <option key={s} value={s}>{STATUS_CONFIG[s].label}</option> })}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#5C6478', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Priority</label>
                  <select className="field-select" value={ticket.priority} onChange={function (e) { updateField('priority', e.target.value) }} disabled={updating}>
                    {Object.keys(PRI_CONFIG).map(function (p) { return <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option> })}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#5C6478', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Assigned To</label>
                  <select className="field-select" value={(ticket.assigned_to && ticket.assigned_to.id) || ''} onChange={function (e) { updateField('assigned_to_id', e.target.value ? parseInt(e.target.value, 10) : null) }} disabled={updating}>
                    <option value="">Unassigned</option>
                    {staffList.map(function (s) { return <option key={s.id} value={s.id}>{s.full_name}</option> })}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={function () { setShowEscalate(true) }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', background: 'rgba(248,113,113,0.1)', border: '1.5px solid rgba(248,113,113,0.3)', color: '#F87171', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                    <Icon name="arrow-right-circle" size={14} /> Escalate
                  </button>
                </div>
              </div>
            </div>

            {showEscalate && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
                onClick={function (e) { if (e.target === e.currentTarget) setShowEscalate(false) }}>
                <div style={{ background: '#0B0E17', border: '1.5px solid rgba(248,113,113,0.3)', borderRadius: 18, padding: '1.75rem', width: '100%', maxWidth: 440 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(248,113,113,0.12)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow-right-circle" size={18} /></div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.05rem', fontWeight: 800, color: '#F1F3F8' }}>Escalate Ticket</div>
                  </div>
                  <form onSubmit={handleEscalate}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.5rem' }}>Escalate to</label>
                    <select value={escalateTo} onChange={function (e) { setEscalateTo(e.target.value) }} required className="field-select" style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem' }}>
                      <option value="">Select a colleague...</option>
                      {staffList.filter(function (s) { return !currentUser || s.id !== currentUser.id }).map(function (s) { return <option key={s.id} value={s.id}>{s.full_name}</option> })}
                    </select>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.5rem' }}>Reason for escalation</label>
                    <textarea value={escalateReason} onChange={function (e) { setEscalateReason(e.target.value) }} required rows={4} placeholder="Explain why you're escalating this ticket..." style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.85rem', fontFamily: "'Inter',sans-serif", outline: 'none', resize: 'vertical', marginBottom: '1.25rem' }} />
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" onClick={function () { setShowEscalate(false) }} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#8A93A6', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Cancel</button>
                      <button type="submit" disabled={escalating || !escalateTo || !escalateReason.trim()} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg,#DC2626,#F87171)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: escalating ? 'not-allowed' : 'pointer', opacity: escalating || !escalateTo || !escalateReason.trim() ? 0.6 : 1, fontFamily: "'Sora',sans-serif" }}>
                        {escalating ? 'Escalating...' : 'Confirm Escalation'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ color: '#F97316', display: 'flex' }}><Icon name="message-circle" size={17} /></span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8' }}>Comments</span>
                <span style={{ fontSize: '0.75rem', color: '#5C6478' }}>({comments.length})</span>
              </div>

              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#5C6478', fontSize: '0.85rem' }}>No comments yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {comments.map(function (c) {
                    var initials = c.author && c.author.full_name ? c.author.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2) : '??'
                    var isStaff = c.author && (c.author.role === 'staff' || c.author.role === 'admin')
                    return (
                      <div key={c.id} style={{ display: 'flex', gap: '0.85rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: isStaff ? 'rgba(124,111,238,0.15)' : 'rgba(52,211,153,0.15)', color: isStaff ? '#B4ACF9' : '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0, background: c.is_internal ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (c.is_internal ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)'), borderRadius: 12, padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F3F8' }}>{(c.author && c.author.full_name) || 'Unknown'}</span>
                            {c.is_internal && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#FBBF24', background: 'rgba(251,191,36,0.15)', padding: '0.1rem 0.4rem', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Icon name="lock" size={9} /> INTERNAL</span>}
                            <span style={{ fontSize: '0.7rem', color: '#5C6478', marginLeft: 'auto' }}>{helpers.timeAgo(c.created_at)}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#D6DCE8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button type="button" onClick={insertTemplate} className="template-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', color: '#B4ACF9', borderRadius: 100, fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}>
                  <Icon name="sparkles" size={12} /> Insert suggested response
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#8A93A6', cursor: 'pointer', marginLeft: 'auto' }}>
                  <input type="checkbox" checked={isInternal} onChange={function (e) { setIsInternal(e.target.checked) }} style={{ accentColor: '#FBBF24' }} />
                  Internal note
                </label>
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <textarea value={newComment} onChange={function (e) { setNewComment(e.target.value) }} placeholder="Add an update, response, or internal note..." rows={4} className="comment-inp"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: isInternal ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.04)', border: '1.5px solid ' + (isInternal ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.1)'), borderRadius: 10, color: '#F1F3F8', fontSize: '0.85rem', fontFamily: "'Inter',sans-serif", outline: 'none', resize: 'vertical', transition: 'all 0.2s' }}
                />
                <button type="submit" disabled={sending || !newComment.trim()} style={{ alignSelf: 'flex-end', padding: '0.7rem 1.4rem', background: isInternal ? 'linear-gradient(135deg,#D97706,#FBBF24)' : 'linear-gradient(135deg,#E8450A,#F97316)', color: isInternal ? '#0A0F1E' : '#fff', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: sending || !newComment.trim() ? 'not-allowed' : 'pointer', opacity: sending || !newComment.trim() ? 0.5 : 1, fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon name="send" size={14} /> {sending ? 'Sending...' : isInternal ? 'Add Internal Note' : 'Send Response'}
                </button>
              </form>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.88rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.1rem' }}>Ticket Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Category</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D6DCE8', textTransform: 'capitalize' }}>{ticket.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Submitted by</div>
                  {ticket.client ? (
                    <Link to={'/staff/clients/' + ticket.client.id} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F97316', textDecoration: 'none' }}>{ticket.client.full_name}</Link>
                  ) : <span style={{ fontSize: '0.85rem', color: '#5C6478' }}>Unknown</span>}
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Submitted</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D6DCE8' }}>{new Date(ticket.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {ticket.due_date && (
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>SLA Deadline</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#FBBF24' }}><Icon name="clock" size={13} /> {new Date(ticket.due_date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                )}
              </div>
            </div>

            {clientHistory.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.88rem', fontWeight: 700, color: '#F1F3F8' }}>Client History</div>
                  {ticket.client && <Link to={'/staff/clients/' + ticket.client.id} style={{ fontSize: '0.7rem', color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>Full profile &rarr;</Link>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {clientHistory.map(function (t) {
                    var s = STATUS_CONFIG[t.status] || STATUS_CONFIG.open
                    return (
                      <Link key={t.id} to={'/staff/tickets/' + t.id} className="history-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.6rem', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.78rem', color: '#D6DCE8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}