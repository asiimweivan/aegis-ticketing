import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

var STATUS_CONFIG = {
  open: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label: 'Open' },
  in_progress: { color: '#B4ACF9', bg: 'rgba(124,111,238,0.1)', border: 'rgba(124,111,238,0.3)', label: 'In Progress' },
  pending: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', label: 'Pending' },
  resolved: { color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', label: 'Resolved' },
  closed: { color: '#8A93A6', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', label: 'Closed' },
}
var PRI_CONFIG = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#34D399' }

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
  return null
}

export default function ClientTicketDetail() {
  var params = useParams()
  var id = params.id
  var showToast = useToast()
  var ticketArr = useState(null)
  var ticket = ticketArr[0]
  var setTicket = ticketArr[1]
  var commentsArr = useState([])
  var comments = commentsArr[0]
  var setComments = commentsArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var newCommentArr = useState('')
  var newComment = newCommentArr[0]
  var setNewComment = newCommentArr[1]
  var sendingArr = useState(false)
  var sending = sendingArr[0]
  var setSending = sendingArr[1]

  useEffect(function () { loadTicket() }, [id])

  function loadTicket() {
    setLoading(true)
    Promise.all([
      tickets.get(id),
      tickets.comments(id).catch(function () { return [] }),
    ]).then(function (results) {
      var t = results[0], c = results[1]
      if (t) setTicket(t)
      setComments(Array.isArray(c) ? c : (c && c.comments) || [])
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSending(true)
    tickets.addComment(id, { content: newComment.trim(), is_internal: false }).then(function (c) {
      if (c) setComments(function (prev) { return prev.concat([c]) })
      setNewComment('')
    }).catch(function (err) {
      showToast(err.message || 'Could not post comment', 'error')
    }).finally(function () { setSending(false) })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .comment-inp:focus { border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .send-btn:hover:not(:disabled) { transform:translateY(-1px); }\n  "

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
          <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="alert" size={44} strokeWidth={1.4} /></div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.5rem' }}>Ticket not found</div>
          <Link to="/client/tickets" style={{ color: '#F97316', fontSize: '0.85rem', fontWeight: 600 }}>&larr; Back to my tickets</Link>
        </div>
      </DashboardLayout>
    )
  }

  var sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
  var pc = PRI_CONFIG[ticket.priority] || '#8A93A6'
  var slaText = null, slaColor = '#8A93A6'
  if (ticket.due_date) {
    var diff = new Date(ticket.due_date) - Date.now()
    var hours = diff / 3600000
    if (['resolved', 'closed'].indexOf(ticket.status) !== -1) { slaText = 'Resolved'; slaColor = '#34D399' }
    else if (diff < 0) { slaText = 'SLA breached'; slaColor = '#F87171' }
    else if (hours < 4) { slaText = Math.round(hours) + 'h remaining'; slaColor = '#F87171' }
    else if (hours < 12) { slaText = Math.round(hours) + 'h remaining'; slaColor = '#FBBF24' }
    else { slaText = Math.round(hours) + 'h remaining'; slaColor = '#34D399' }
  }

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title={ticket.ticket_number} subtitle={ticket.title} />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>
        <Link to="/client/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#8A93A6', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <Icon name="arrow-left" size={14} /> Back to my tickets
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', color: '#5C6478', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>{ticket.ticket_number}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: sc.color, background: sc.bg, border: '1px solid ' + sc.border, padding: '0.2rem 0.65rem', borderRadius: 100 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color }} /> {sc.label}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: pc, textTransform: 'capitalize' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc }} /> {ticket.priority} priority
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
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ color: '#F97316', display: 'flex' }}><Icon name="message-circle" size={17} /></span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8' }}>Comments</span>
                <span style={{ fontSize: '0.75rem', color: '#5C6478' }}>({comments.length})</span>
              </div>

              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#5C6478', fontSize: '0.85rem' }}>No comments yet. Be the first to add an update.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {comments.map(function (c) {
                    var initials = c.author && c.author.full_name ? c.author.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2) : '??'
                    var isStaff = c.author && (c.author.role === 'staff' || c.author.role === 'admin')
                    return (
                      <div key={c.id} style={{ display: 'flex', gap: '0.85rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: isStaff ? 'rgba(124,111,238,0.15)' : 'rgba(52,211,153,0.15)', color: isStaff ? '#B4ACF9' : '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F3F8' }}>{(c.author && c.author.full_name) || 'Unknown'}</span>
                            {isStaff && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#B4ACF9', background: 'rgba(124,111,238,0.15)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>STAFF</span>}
                            <span style={{ fontSize: '0.7rem', color: '#5C6478', marginLeft: 'auto' }}>{helpers.timeAgo(c.created_at)}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#D6DCE8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.6rem' }}>
                <input type="text" value={newComment} onChange={function (e) { setNewComment(e.target.value) }} placeholder="Add an update or ask a question..." className="comment-inp"
                  style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.85rem', fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'all 0.2s' }}
                />
                <button type="submit" disabled={sending || !newComment.trim()} className="send-btn" style={{ padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: sending || !newComment.trim() ? 'not-allowed' : 'pointer', opacity: sending || !newComment.trim() ? 0.5 : 1, fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}>
                  <Icon name="send" size={14} /> {sending ? 'Sending...' : 'Send'}
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
                  <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Assigned To</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D6DCE8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {ticket.assigned_to ? (
                      <><Icon name="user" size={13} /> {ticket.assigned_to.full_name}</>
                    ) : <span style={{ color: '#5C6478', fontWeight: 500 }}>Not yet assigned</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Submitted</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D6DCE8' }}>{new Date(ticket.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {slaText && (
                  <div style={{ paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>SLA Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: slaColor }}>
                      <Icon name="clock" size={14} /> {slaText}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {ticket.ai_confidence != null && (
              <div style={{ background: 'linear-gradient(135deg,rgba(124,111,238,0.1),rgba(249,115,22,0.06))', border: '1.5px solid rgba(124,111,238,0.3)', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <span style={{ color: '#B4ACF9', display: 'flex' }}><Icon name="cpu" size={16} /></span>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8' }}>AI Confidence</span>
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#B4ACF9', lineHeight: 1, marginBottom: '0.6rem' }}>{Math.round(ticket.ai_confidence * 100)}%</div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#7C6FEE,#F97316)', width: Math.round(ticket.ai_confidence * 100) + '%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}