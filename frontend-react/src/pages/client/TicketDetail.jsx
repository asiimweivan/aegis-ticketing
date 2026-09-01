import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'

export default function ClientTicketDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const showToast = useToast()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadAll() }, [id])

  const loadAll = async () => {
    try {
      const [t, c] = await Promise.all([
        tickets.get(id),
        tickets.comments(id),
      ])
      if (t) setTicket(t)
      if (c) setComments(c)
    } catch (e) {
      showToast('Failed to load ticket', 'error')
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async () => {
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await tickets.addComment(id, { content: comment, is_internal: false })
      setComment('')
      const c = await tickets.comments(id)
      if (c) setComments(c)
      showToast('Comment added')
    } catch (e) {
      showToast('Failed to add comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '4rem', color: '#8B9BB4' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        Loading ticket...
      </div>
    </DashboardLayout>
  )

  if (!ticket) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '4rem', color: '#8B9BB4' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        Ticket not found. <Link to="/client/tickets" style={{ color: '#00C9A7' }}>Go back</Link>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <Topbar
        title={ticket.ticket_number}
        subtitle={ticket.title}
        actions={
          <Link to="/client/tickets" style={{
            padding: '0.55rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#8B9BB4', borderRadius: 8, fontSize: '0.82rem', textDecoration: 'none',
          }}>← Back</Link>
        }
      />

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left */}
          <div>
            {/* Main card */}
            <div style={{
              background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, overflow: 'hidden', marginBottom: '1rem',
            }}>
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.78rem', color: '#8B9BB4', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                  {ticket.ticket_number}
                </div>
                <h1 style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: '1.25rem', fontWeight: 700,
                  marginBottom: '0.75rem', lineHeight: 1.3,
                }}>{ticket.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span style={{ fontSize: '0.78rem', color: '#8B9BB4' }}>
                    {helpers.categoryLabel(ticket.category)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '0.9rem', color: 'rgba(248,250,252,0.85)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {ticket.description}
                </p>
              </div>

              {/* AI section */}
              {(ticket.ai_summary || ticket.ai_category) && (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  background: 'rgba(0,201,167,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#00C9A7', marginBottom: '0.75rem' }}>
                    🤖 AI Classification
                  </div>
                  {ticket.ai_summary && (
                    <p style={{ fontSize: '0.85rem', color: '#8B9BB4', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      {ticket.ai_summary}
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Category', value: helpers.categoryLabel(ticket.ai_category || ticket.category) },
                      { label: 'Priority', value: ticket.ai_priority || ticket.priority },
                      { label: 'Confidence', value: `${Math.round((ticket.ai_confidence || 0) * 100)}%` },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.6rem',
                      }}>
                        <div style={{ fontSize: '0.68rem', color: '#8B9BB4', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {ticket.ai_tags?.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {ticket.ai_tags.map(tag => (
                        <span key={tag} style={{
                          background: 'rgba(99,102,241,0.12)', color: '#818CF8',
                          padding: '0.15rem 0.5rem', borderRadius: 100, fontSize: '0.72rem',
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Comments */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{
                  fontSize: '0.95rem', fontWeight: 600,
                  fontFamily: "'Space Grotesk',sans-serif",
                  marginBottom: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  💬 Comments
                  <span style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 100, padding: '0.1rem 0.5rem',
                    fontSize: '0.72rem', color: '#8B9BB4',
                  }}>{comments.length}</span>
                </div>

                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B9BB4', fontSize: '0.85rem' }}>
                    No comments yet — add one below
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {comments.map(c => {
                      const isOwn = c.author.id === user?.id
                      const initials = c.author.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      const avColor = c.author.role === 'client' ? '#00C9A7' : c.author.role === 'staff' ? '#818CF8' : '#FCD34D'
                      const avBg = c.author.role === 'client' ? 'rgba(0,201,167,0.15)' : c.author.role === 'staff' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)'
                      return (
                        <div key={c.id} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          flexDirection: isOwn ? 'row-reverse' : 'row',
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: avBg, color: avColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                          }}>{initials}</div>
                          <div style={{
                            background: isOwn ? 'rgba(0,201,167,0.06)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isOwn ? 'rgba(0,201,167,0.15)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: isOwn ? '12px 0 12px 12px' : '0 12px 12px 12px',
                            padding: '0.85rem 1rem', flex: 1,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.author.full_name}</span>
                              <span style={{ fontSize: '0.72rem', color: '#8B9BB4' }}>{helpers.timeAgo(c.created_at)}</span>
                            </div>
                            <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{c.content}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Comment form */}
                {ticket.status !== 'closed' && (
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '1rem',
                  }}>
                    <textarea
                      value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Add a comment or provide more details..."
                      rows={3}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        color: '#F8FAFC', fontSize: '0.875rem',
                        fontFamily: 'Inter,sans-serif', resize: 'none', outline: 'none',
                        lineHeight: 1.6, minHeight: 80,
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button onClick={() => setComment('')} style={{
                        padding: '0.4rem 0.85rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#8B9BB4', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem',
                      }}>Clear</button>
                      <button onClick={submitComment} disabled={submitting || !comment.trim()} style={{
                        padding: '0.4rem 0.85rem', background: '#00C9A7', color: '#0A0F1E',
                        border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                        opacity: submitting || !comment.trim() ? 0.6 : 1,
                      }}>Send comment</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            {/* Ticket info */}
            <div style={{
              background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, overflow: 'hidden', marginBottom: '1rem',
            }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', fontWeight: 600 }}>
                📋 Ticket Info
              </div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Status', value: <StatusBadge status={ticket.status} /> },
                  { label: 'Priority', value: <PriorityBadge priority={ticket.priority} /> },
                  { label: 'Category', value: helpers.categoryLabel(ticket.category) },
                  { label: 'Assigned to', value: ticket.assigned_to?.full_name || 'Unassigned' },
                  { label: 'Submitted', value: helpers.formatDate(ticket.created_at) },
                  { label: 'SLA deadline', value: ticket.due_date ? helpers.formatDate(ticket.due_date) : 'Not set' },
                  ...(ticket.resolved_at ? [{ label: 'Resolved at', value: helpers.formatDate(ticket.resolved_at) }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8B9BB4' }}>{row.label}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA warning */}
            {ticket.sla_breached && (
              <div style={{
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: 10, padding: '0.85rem 1rem',
                fontSize: '0.82rem', color: '#FB7185',
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
              }}>⚠️ This ticket has breached its SLA deadline</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}