import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import StatCard from '../../components/ui/StatCard'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { tickets, analytics, notifications, helpers } from '../../services/api'
import useAuthStore from '../../stores/authStore'

export default function StaffDashboard() {
  const { user } = useAuthStore()
  const [allTickets, setAllTickets] = useState([])
  const [filtered, setFiltered] = useState([])
  const [stats, setStats] = useState(null)
  const [notifs, setNotifs] = useState([])
  const [priorityFilter, setPriorityFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [ticketData, statsData, notifData] = await Promise.all([
        tickets.list({ page_size: 100, status: 'open' }),
        analytics.myStats(),
        notifications.list(),
      ])
      if (ticketData) {
        setAllTickets(ticketData.tickets)
        setFiltered(ticketData.tickets)
      }
      if (statsData) setStats(statsData)
      if (notifData) setNotifs(notifData.slice(0, 5))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filterByPriority = (p) => {
    setPriorityFilter(p)
    setFiltered(p ? allTickets.filter(t => t.priority === p) : allTickets)
  }

  const getSLA = (t) => {
    if (!t.due_date) return { label: 'No SLA', color: '#4ADE80' }
    const diff = new Date(t.due_date) - Date.now()
    const hours = diff / 3600000
    if (diff < 0) return { label: 'Breached', color: '#FB7185' }
    if (hours < 4) return { label: `${Math.round(hours)}h left`, color: '#FB7185' }
    if (hours < 12) return { label: `${Math.round(hours)}h left`, color: '#FCD34D' }
    return { label: `${Math.round(hours)}h left`, color: '#4ADE80' }
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <DashboardLayout>
      <Topbar
        title="Staff Dashboard"
        subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={
          <Link to="/staff/tickets" style={{
            padding: '0.55rem 1.1rem', background: '#6366F1', color: '#fff',
            borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
          }}>All tickets</Link>
        }
      />

      <div style={{ padding: '2rem' }}>
        {/* Welcome */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(0,201,167,0.06))',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14, padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '0.2rem' }}>
              Welcome back, {firstName} 👋
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8B9BB4' }}>Here's your support queue for today</div>
          </div>
          <Link to="/staff/tickets?assigned=me" style={{
            padding: '0.6rem 1.25rem', background: '#6366F1', color: '#fff',
            borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
          }}>My queue →</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Assigned to Me" value={stats?.total_assigned ?? '—'} icon="📌" color="indigo" />
          <StatCard label="In Progress" value={stats?.in_progress ?? '—'} icon="🔄" color="teal" />
          <StatCard label="Resolved" value={stats?.resolved ?? '—'} icon="✅" color="green" />
          <StatCard label="Resolution Rate" value={stats ? `${stats.resolution_rate}%` : '—'} icon="📈" color="amber" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>

          {/* Queue */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>
                Open Ticket Queue
              </h2>
              <Link to="/staff/tickets" style={{ fontSize: '0.82rem', color: '#818CF8' }}>View all →</Link>
            </div>

            {/* Priority filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {[
                { v: '', l: 'All' },
                { v: 'critical', l: '🔴 Critical' },
                { v: 'high', l: '🟠 High' },
                { v: 'medium', l: '🟡 Medium' },
              ].map(f => (
                <button key={f.v} onClick={() => filterByPriority(f.v)} style={{
                  padding: '0.3rem 0.75rem', borderRadius: 100,
                  fontSize: '0.74rem', fontWeight: 500, cursor: 'pointer',
                  border: '1px solid',
                  borderColor: priorityFilter === f.v ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)',
                  background: priorityFilter === f.v ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                  color: priorityFilter === f.v ? '#818CF8' : '#8B9BB4',
                  fontFamily: 'Inter,sans-serif',
                }}>{f.l}</button>
              ))}
            </div>

            <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '105px 1fr 90px 80px 75px',
                gap: '0.6rem', padding: '0.6rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.67rem', fontWeight: 600, color: '#8B9BB4',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                <span>Ticket #</span><span>Title</span>
                <span>Status</span><span>Priority</span><span>SLA</span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#8B9BB4' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>⏳</div>
                  Loading queue...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#8B9BB4' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontWeight: 600, color: '#F8FAFC', marginBottom: '0.3rem' }}>Queue is clear</div>
                  <p style={{ fontSize: '0.85rem' }}>No open tickets matching this filter.</p>
                </div>
              ) : (
                filtered.slice(0, 15).map(t => {
                  const sla = getSLA(t)
                  return (
                    <Link key={t.id} to={`/staff/tickets/${t.id}`} style={{
                      display: 'grid', gridTemplateColumns: '105px 1fr 90px 80px 75px',
                      gap: '0.6rem', alignItems: 'center',
                      padding: '0.8rem 1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      textDecoration: 'none', color: '#F8FAFC',
                      transition: 'background 0.15s',
                    }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8B9BB4', fontFamily: 'monospace' }}>{t.ticket_number}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#8B9BB4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
                      </div>
                      <span><StatusBadge status={t.status} /></span>
                      <span><PriorityBadge priority={t.priority} /></span>
                      <span style={{ fontSize: '0.67rem', fontWeight: 600, color: sla.color }}>{sla.label}</span>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Performance */}
            <div style={{ marginBottom: '0.85rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>My Performance</h2>
            </div>
            <div style={{
              background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '1.1rem', marginBottom: '1.25rem',
            }}>
              {[
                { label: 'Total assigned', value: stats?.total_assigned ?? '—' },
                { label: 'Resolved', value: stats?.resolved ?? '—', color: '#22C55E' },
                { label: 'Open', value: stats?.open ?? '—', color: '#818CF8' },
                { label: 'In progress', value: stats?.in_progress ?? '—', color: '#00C9A7' },
                { label: 'Resolution rate', value: stats ? `${stats.resolution_rate}%` : '—', color: '#00C9A7' },
                { label: 'Avg resolution', value: stats?.avg_resolution_hours ? `${stats.avg_resolution_hours}h` : '—' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#8B9BB4' }}>{row.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", color: row.color || '#F8FAFC' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>Notifications</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8B9BB4', fontSize: '0.82rem' }}>No notifications</div>
              ) : notifs.map(n => (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  padding: '0.7rem',
                  background: n.is_read ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
                  border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.2)'}`,
                  borderRadius: 8, cursor: 'pointer',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                    background: n.is_read ? 'transparent' : '#6366F1',
                    border: n.is_read ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }} />
                  <div>
                    <div style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8B9BB4', marginTop: '0.15rem' }}>{helpers.timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}