import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, helpers } from '../../services/api'

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'open', label: '🔴 Open' },
  { value: 'in_progress', label: '🔵 In Progress' },
  { value: 'pending', label: '🟡 Pending' },
  { value: 'resolved', label: '🟢 Resolved' },
  { value: 'closed', label: '⚫ Closed' },
]

export default function ClientTickets() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [searchTimer, setSearchTimer] = useState(null)

  useEffect(() => { loadTickets() }, [status, category, page])

  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer)
    const t = setTimeout(() => { setPage(1); loadTickets() }, 400)
    setSearchTimer(t)
    return () => clearTimeout(t)
  }, [search])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 15 }
      if (status) params.status = status
      if (category) params.category = category
      if (search.trim()) params.search = search.trim()
      const res = await tickets.list(params)
      if (res) setData(res)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const setFilter = (val) => { setStatus(val); setPage(1) }

  return (
    <DashboardLayout>
      <Topbar
        title="My Tickets"
        subtitle={data ? `${data.total} ticket${data.total !== 1 ? 's' : ''} found` : ''}
        actions={
          <Link to="/client/new-ticket" style={{
            padding: '0.55rem 1.1rem', background: '#00C9A7', color: '#0A0F1E',
            borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
          }}>+ New Ticket</Link>
        }
      />

      <div style={{ padding: '2rem' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B9BB4', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
              style={{
                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, color: '#F8FAFC',
                fontSize: '0.9rem', fontFamily: 'Inter,sans-serif', outline: 'none',
              }}
            />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} style={{
            padding: '0.75rem 1rem', width: 160,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: '#F8FAFC',
            fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', outline: 'none',
          }}>
            <option value="" style={{ background: '#0D1B3E' }}>All categories</option>
            <option value="technical" style={{ background: '#0D1B3E' }}>💻 Technical</option>
            <option value="administrative" style={{ background: '#0D1B3E' }}>📋 Administrative</option>
            <option value="billing" style={{ background: '#0D1B3E' }}>💳 Billing</option>
            <option value="infrastructure" style={{ background: '#0D1B3E' }}>🏗️ Infrastructure</option>
            <option value="hr" style={{ background: '#0D1B3E' }}>👥 HR</option>
            <option value="security" style={{ background: '#0D1B3E' }}>🔒 Security</option>
            <option value="general" style={{ background: '#0D1B3E' }}>📌 General</option>
          </select>
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)} style={{
              padding: '0.4rem 0.9rem', borderRadius: 100,
              fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
              border: '1px solid',
              borderColor: status === s.value ? 'rgba(0,201,167,0.35)' : 'rgba(255,255,255,0.08)',
              background: status === s.value ? 'rgba(0,201,167,0.12)' : 'rgba(255,255,255,0.04)',
              color: status === s.value ? '#00C9A7' : '#8B9BB4',
              fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
            }}>{s.label}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '130px 1fr 110px 100px 90px 100px',
            gap: '1rem', padding: '0.75rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.72rem', fontWeight: 600, color: '#8B9BB4',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            <span>Ticket #</span><span>Title</span><span>Category</span>
            <span>Status</span><span>Priority</span><span>Submitted</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8B9BB4' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
              Loading tickets...
            </div>
          ) : !data?.tickets?.length ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#8B9BB4' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🎫</div>
              <div style={{ fontSize: '1rem', color: '#F8FAFC', fontWeight: 600, marginBottom: '0.5rem' }}>No tickets found</div>
              <p style={{ fontSize: '0.875rem', maxWidth: 320, margin: '0 auto 1.5rem' }}>
                {status ? `No ${status} tickets.` : "You haven't submitted any tickets yet."}
              </p>
              <Link to="/client/new-ticket" style={{
                padding: '0.6rem 1.25rem', background: '#00C9A7', color: '#0A0F1E',
                borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem',
              }}>Submit your first ticket</Link>
            </div>
          ) : (
            data.tickets.map(t => (
              <Link key={t.id} to={`/client/tickets/${t.id}`} style={{
                display: 'grid', gridTemplateColumns: '130px 1fr 110px 100px 90px 100px',
                gap: '1rem', alignItems: 'center',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', color: '#F8FAFC',
                transition: 'background 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#8B9BB4', fontFamily: 'monospace' }}>{t.ticket_number}</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4 }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8B9BB4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 380 }}>{t.description}</div>
                </div>
                <span style={{ fontSize: '0.8rem' }}>{helpers.categoryLabel(t.category)}</span>
                <span><StatusBadge status={t.status} /></span>
                <span><PriorityBadge priority={t.priority} /></span>
                <span style={{ fontSize: '0.78rem', color: '#8B9BB4' }}>{helpers.timeAgo(t.created_at)}</span>
              </Link>
            ))
          )}

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.82rem', color: '#8B9BB4',
            }}>
              <span>Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, data.total)} of {data.total}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{
                  width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8B9BB4', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
                }}>←</button>
                {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === data.total_pages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`ellipsis-${p}`} style={{ color: '#8B9BB4', padding: '0 4px' }}>...</span>}
                      <button key={p} onClick={() => setPage(p)} style={{
                        width: 32, height: 32, borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: p === page ? 'rgba(0,201,167,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${p === page ? 'rgba(0,201,167,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        color: p === page ? '#00C9A7' : '#8B9BB4', cursor: 'pointer', fontSize: '0.82rem',
                      }}>{p}</button>
                    </>
                  ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === data.total_pages} style={{
                  width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#8B9BB4', cursor: page === data.total_pages ? 'not-allowed' : 'pointer',
                  opacity: page === data.total_pages ? 0.4 : 1,
                }}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}