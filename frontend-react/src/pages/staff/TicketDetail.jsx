import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'

export default function StaffTicketDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const showToast = useToast()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [audit, setAudit] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({ status: '', priority: '', category: '', assigned_to_id: '' })

  useEffect(() => { loadAll() }, [id])

  const loadAll = async () => {
    try {
      const [t, c, a, s] = await Promise.all([
        tickets.get(id),
        tickets.comments(id),
        tickets.audit(id).catch(() => []),
        users.list({ role: 'staff' }),
      ])
      if (t) {
        setTicket(t)
        setForm({
          status: t.status,
          priority: t.priority,
          category: t.category,
          assigned_to_id: t.assigned_to?.id || '',
        })
      }
      if (c) setComments(c)
      if (a) setAudit(a)
      if (s) setStaffList(s)
    } catch (e) {
      showToast('Failed to load ticket', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateTicket = async () => {
    setUpdating(true)
    try {
      const payload = {
        status: form.status,
        priority: form.priority,
        category: form.category,
      }
      if (form.assigned_to_id) payload.assigned_to_id = parseInt(form.assigned_to_id)
      const updated = await tickets.update(id, payload)
      if (updated) {
        setTicket(updated)
        showToast('Ticket updated successfully')
        const a = await tickets.audit(id).catch(() => [])
        if (a) setAudit(a)
      }
    } catch (e) {
      showToast(e.message || 'Update failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const submitComment = async () => {
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await tickets.addComment(id, { content: comment, is_internal: isInternal })
      setComment('')
      setIsInternal(false)
      const c = await tickets.comments(id)
      if (c) setComments(c)
      showToast(isInternal ? 'Internal note added' : 'Comment sent')
    } catch (e) {
      showToast('Failed to send comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const reclassify = async () => {
    try {
      const updated = await tickets.reclassify(id)
      if (updated) {
        setTicket(updated)
        showToast('AI reclassification complete')
      }
    } catch (e) {
      showToast('Reclassification failed', 'error')
    }
  }

  const selectStyle = {
    width: '100%', padding: '0.65rem 0.85rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#F8FAFC',
    fontSize: '0.85rem', fontFamily: 'Inter,sans-serif', outline: 'none',
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
        Ticket not found. <Link to="/staff/tickets" style={{ color: '#818CF8' }}>Go back</Link>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <Topbar
        title={ticket.ticket_number}
        subtitle={ticket.title}
        actions={
          <Link to="/staff/tickets" style={{
            padding: '0.55rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#8B9BB4', borderRadius: 8, fontSize: '0.82rem', textDecoration: 'none',
          }}>← Back</Link>
        }
      />

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left */}
          <div>
            <div style={{
              background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, overflow: 'hidden', marginBottom: '1rem',
            }}>
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.78rem', color: '#8B9BB4', fontFamily: 'monospace', marginBottom: '0.5rem' }}>{ticket.ticket_number}</div>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>{ticket.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span style={{ fontSize: '0.78rem', color: '#8B9BB4' }}>{helpers.categoryLabel(ticket.category)}</span>
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '0.9rem', color: 'rgba(248,250,252,0.85)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
              </div>

              {/* AI section */}
              {(ticket.ai_summary || ticket.ai_category) && (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  background: 'rgba(0,201,167,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#00C9A7', marginBottom: '0.75rem' }}>🤖 AI Classification</div>
                  {ticket.ai_summary && (
                    <p style={{ fontSize: '0.85rem', color: '#8B9BB4', lineHeight: 1.6, marginBottom: '0.75rem' }}>{ticket.ai_summary}</p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {[
                      { label: 'Category', value: helpers.categoryLabel(ticket.ai_category || ticket.category) },
                      { label: 'Priority', value: ticket.ai_priority || ticket.priority },
                      { label: 'Confidence', value: `${Math.round((ticket.ai_confidence || 0) * 100)}%` },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.6rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#8B9BB4', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{item.label}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {ticket.ai_tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                      {ticket.ai_tags.map(tag => (
                        <span key={tag} style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', padding: '0.15rem 0.5rem', borderRadius: 100, fontSize: '0.72rem' }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <button onClick={reclassify} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    background: 'rgba(0,201,167,0.08)', border: '1px solid rgba(0,201,167,0.2)',
                    borderRadius: 6, fontSize: '0.78rem', color: '#00C9A7',
                    cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                  }}>🔄 Re-run AI classification</button>
                </div>
              )}

              {/* Comments */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💬 Comments
                  <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '0.1rem 0.5rem', fontSize: '0.72rem', color: '#8B9BB4' }}>{comments.length}</span>
                </div>

                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B9BB4', fontSize: '0.85rem' }}>No comments yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {comments.map(c => {
                      const isOwn = c.author.id === user?.id
                      const initials = c.author.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      const avColor = c.author.role === 'client' ? '#00C9A7' : c.author.role === 'staff' ? '#818CF8' : '#FCD34D'
                      const avBg = c.author.role === 'client' ? 'rgba(0,201,167,0.15)' : c.author.role === 'staff' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)'
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                          <div style={{
                            background: c.is_internal ? 'rgba(245,158,11,0.06)' : isOwn ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${c.is_internal ? 'rgba(245,158,11,0.2)' : isOwn ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '0 12px 12px 12px', padding: '0.85rem 1rem', flex: 1,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.author.full_name}</span>
                              {c.is_internal && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'rgba(245,158,11,0.12)', color: '#FCD34D', padding: '0.1rem 0.4rem', borderRadius: 4 }}>🔒 Internal</span>
                              )}
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
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem' }}>
                  <textarea
                    value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment or internal note..."
                    rows={3}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#F8FAFC', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', resize: 'none', outline: 'none', lineHeight: 1.6, minHeight: 80 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#8B9BB4', cursor: 'pointer' }}>
                      <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} style={{ accentColor: '#F59E0B' }} />
                      🔒 Internal note (hidden from client)
                    </label>
                    <button onClick={submitComment} disabled={submitting || !comment.trim()} style={{
                      padding: '0.4rem 0.85rem', background: '#6366F1', color: '#fff',
                      border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      opacity: submitting || !comment.trim() ? 0.6 : 1,
                    }}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            {/* Update form */}
            <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', fontWeight: 600 }}>⚙️ Update Ticket</div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B9BB4', marginBottom: '0.4rem' }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyle}>
                    <option value="open" style={{ background: '#0D1B3E' }}>🔴 Open</option>
                    <option value="in_progress" style={{ background: '#0D1B3E' }}>🔵 In Progress</option>
                    <option value="pending" style={{ background: '#0D1B3E' }}>🟡 Pending</option>
                    <option value="resolved" style={{ background: '#0D1B3E' }}>🟢 Resolved</option>
                    <option value="closed" style={{ background: '#0D1B3E' }}>⚫ Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B9BB4', marginBottom: '0.4rem' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={selectStyle}>
                    <option value="low" style={{ background: '#0D1B3E' }}>🟢 Low</option>
                    <option value="medium" style={{ background: '#0D1B3E' }}>🟡 Medium</option>
                    <option value="high" style={{ background: '#0D1B3E' }}>🟠 High</option>
                    <option value="critical" style={{ background: '#0D1B3E' }}>🔴 Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B9BB4', marginBottom: '0.4rem' }}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={selectStyle}>
                    <option value="technical" style={{ background: '#0D1B3E' }}>💻 Technical</option>
                    <option value="administrative" style={{ background: '#0D1B3E' }}>📋 Administrative</option>
                    <option value="billing" style={{ background: '#0D1B3E' }}>💳 Billing</option>
                    <option value="infrastructure" style={{ background: '#0D1B3E' }}>🏗️ Infrastructure</option>
                    <option value="hr" style={{ background: '#0D1B3E' }}>👥 HR</option>
                    <option value="security" style={{ background: '#0D1B3E' }}>🔒 Security</option>
                    <option value="general" style={{ background: '#0D1B3E' }}>📌 General</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B9BB4', marginBottom: '0.4rem' }}>Assign to staff</label>
                  <select value={form.assigned_to_id} onChange={e => setForm({ ...form, assigned_to_id: e.target.value })} style={selectStyle}>
                    <option value="" style={{ background: '#0D1B3E' }}>Unassigned</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id} style={{ background: '#0D1B3E' }}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={updateTicket} disabled={updating} style={{
                  width: '100%', padding: '0.8rem', background: '#6366F1', color: '#fff',
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.9rem', fontWeight: 700,
                  border: 'none', borderRadius: 10, cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.6 : 1, transition: 'all 0.2s',
                }}>{updating ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>

            {/* SLA warning */}
            {ticket.sla_breached && (
              <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#FB7185', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                ⚠️ SLA deadline has been breached
              </div>
            )}

            {/* Ticket info */}
            <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', fontWeight: 600 }}>📋 Ticket Info</div>
              <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Submitted by', value: ticket.client?.full_name || '—' },
                  { label: 'Submitted', value: helpers.formatDate(ticket.created_at) },
                  { label: 'SLA deadline', value: ticket.due_date ? helpers.formatDate(ticket.due_date) : 'Not set' },
                  { label: 'SLA hours', value: ticket.sla_hours ? `${ticket.sla_hours}h` : '—' },
                  ...(ticket.resolved_at ? [{ label: 'Resolved at', value: helpers.formatDate(ticket.resolved_at) }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8B9BB4' }}>{row.label}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {audit.length > 0 && (
              <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', fontWeight: 600 }}>📅 Activity Timeline</div>
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {audit.slice(0, 8).map((log, i) => (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '1rem', position: 'relative' }}>
                      {i < audit.slice(0, 8).length - 1 && (
                        <div style={{ position: 'absolute', left: 11, top: 22, bottom: 0, width: 1, background: 'rgba(255,255,255,0.08)' }} />
                      )}
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#818CF8', fontWeight: 700, flexShrink: 0 }}>✓</div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{log.description || log.action}</div>
                        <div style={{ fontSize: '0.72rem', color: '#8B9BB4', marginTop: '0.1rem' }}>{helpers.timeAgo(log.created_at)} · {log.user?.full_name || 'System'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}