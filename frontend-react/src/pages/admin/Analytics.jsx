import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import StatCard from '../../components/ui/StatCard'
import { analytics } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

const CAT_COLORS = ['#00C9A7','#6366F1','#F59E0B','#F43F5E','#22C55E','#818CF8','#8B9BB4']
const PRI_COLORS = { critical:'#F43F5E', high:'#F97316', medium:'#F59E0B', low:'#8B9BB4' }

export default function AdminAnalytics() {
  const showToast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [retrainMsg, setRetrainMsg] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await analytics.dashboard()
      if (res) setData(res)
    } catch (e) { showToast('Failed to load analytics', 'error') }
    finally { setLoading(false) }
  }

  const retrainML = async () => {
    setRetraining(true)
    setRetrainMsg('')
    try {
      const res = await analytics.retrainML()
      setRetrainMsg(res.message)
      showToast(res.message)
    } catch (e) {
      setRetrainMsg('Retraining failed.')
      showToast('Retraining failed', 'error')
    } finally { setRetraining(false) }
  }

  const renderTrend = (trend, color) => {
    if (!trend?.length) return <div style={{ color: '#8B9BB4', fontSize: '0.85rem', padding: '1rem 0' }}>No data yet</div>
    const vals = trend.map(t => t.count)
    const maxV = Math.max(...vals, 1)
    const W = 400, H = 120, pad = 20
    const n = vals.length
    const xStep = (W - pad * 2) / Math.max(n - 1, 1)
    const points = vals.map((v, i) => ({
      x: pad + i * xStep,
      y: H - pad - ((v / maxV) * (H - pad * 2)),
      count: v,
      date: trend[i].date,
    }))
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaD = `M${points[0].x},${H - pad} ${points.map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${H - pad} Z`

    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={color} stroke="#0D1B3E" strokeWidth="1.5" />
            {n <= 10 && (
              <>
                <text x={p.x} y={H - 4} textAnchor="middle" fill="#6B7A99" fontSize="9" fontFamily="Inter,sans-serif">{p.date.slice(5)}</text>
                <text x={p.x} y={p.y - 6} textAnchor="middle" fill="#EEF2FF" fontSize="9" fontFamily="Inter,sans-serif">{p.count}</text>
              </>
            )}
          </g>
        ))}
      </svg>
    )
  }

  const s = data?.stats

  return (
    <DashboardLayout>
      <Topbar
        title="Analytics"
        subtitle="System performance and AI insights"
        actions={
          <button onClick={loadData} style={{
            padding: '0.55rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#8B9BB4', borderRadius: 8, fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'Inter,sans-serif',
          }}>🔄 Refresh</button>
        }
      />

      <div style={{ padding: '2rem' }}>
        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Total Tickets" value={s?.total ?? '—'} icon="🎫" color="teal" />
          <StatCard label="Open" value={s?.open ?? '—'} icon="🔴" color="indigo" />
          <StatCard label="In Progress" value={s?.in_progress ?? '—'} icon="🔄" color="amber" />
          <StatCard label="SLA Breached" value={s?.sla_breached ?? '—'} icon="⚠️" color="rose" />
          <StatCard label="Resolved" value={s?.resolved ?? '—'} icon="✅" color="green" />
          <StatCard label="Avg Resolution" value={s?.avg_resolution_hours ? `${s.avg_resolution_hours}h` : '—'} icon="⚡" color="amber" />
        </div>

        {/* AI Retrain banner */}
        <div style={{
          background: 'rgba(0,201,167,0.04)', border: '1px solid rgba(0,201,167,0.15)',
          borderRadius: 14, padding: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '0.3rem' }}>
              🤖 AI Classification Model
            </div>
            <p style={{ fontSize: '0.82rem', color: '#8B9BB4', maxWidth: 480, lineHeight: 1.5 }}>
              Retrain the ML model on all resolved tickets to continuously improve classification accuracy. Requires at least 20 resolved tickets.
            </p>
            {retrainMsg && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: retrainMsg.includes('success') ? '#00C9A7' : '#FCD34D' }}>{retrainMsg}</div>
            )}
          </div>
          <button onClick={retrainML} disabled={retraining} style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.25)',
            color: '#00C9A7', fontFamily: "'Space Grotesk',sans-serif",
            fontSize: '0.9rem', fontWeight: 600,
            borderRadius: 10, cursor: retraining ? 'not-allowed' : 'pointer',
            opacity: retraining ? 0.6 : 1, whiteSpace: 'nowrap',
          }}>{retraining ? '⏳ Training...' : '🔄 Retrain ML Model'}</button>
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          {/* Category */}
          <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Tickets by Category
              <span style={{ fontSize: '0.75rem', color: '#8B9BB4' }}>All time</span>
            </div>
            {!data?.category_breakdown?.length ? (
              <div style={{ color: '#8B9BB4', fontSize: '0.85rem' }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.category_breakdown.map((d, i) => {
                  const max = Math.max(...data.category_breakdown.map(x => x.count))
                  return (
                    <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#8B9BB4', width: 110, flexShrink: 0, textAlign: 'right', textTransform: 'capitalize' }}>{d.category}</span>
                      <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 100, background: CAT_COLORS[i % CAT_COLORS.length], width: `${max > 0 ? (d.count / max * 100) : 0}%`, transition: 'width 1.2s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: CAT_COLORS[i % CAT_COLORS.length], width: 24, textAlign: 'right' }}>{d.count}</span>
                      <span style={{ fontSize: '0.72rem', color: '#8B9BB4', width: 36 }}>{d.percentage}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Priority donut */}
          <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1.25rem' }}>
              Tickets by Priority
            </div>
            {!data?.priority_breakdown?.length ? (
              <div style={{ color: '#8B9BB4', fontSize: '0.85rem' }}>No data yet</div>
            ) : (() => {
              const total = data.priority_breakdown.reduce((a, d) => a + d.count, 0)
              const r = 55, cx = 70, cy = 70, stroke = 22
              const circ = 2 * Math.PI * r
              let offset = 0
              const paths = data.priority_breakdown.map(d => {
                const pct = d.count / (total || 1)
                const dash = pct * circ
                const color = PRI_COLORS[d.priority] || '#8B9BB4'
                const el = (
                  <circle key={d.priority} cx={cx} cy={cy} r={r}
                    fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeDashoffset={-offset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                  />
                )
                offset += dash
                return el
              })
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
                    {paths}
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#EEF2FF" fontSize="18" fontWeight="700" fontFamily="Space Grotesk,sans-serif">{total}</text>
                    <text x={cx} y={cy + 18} textAnchor="middle" fill="#6B7A99" fontSize="10" fontFamily="Inter,sans-serif">tickets</text>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                    {data.priority_breakdown.map(d => (
                      <div key={d.priority} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: PRI_COLORS[d.priority] || '#8B9BB4', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.78rem', color: '#8B9BB4', textTransform: 'capitalize' }}>{d.priority}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{d.count} <span style={{ color: '#6B7A99', fontWeight: 400 }}>({d.percentage}%)</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Charts row 2 — Trends */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Weekly Ticket Trend
              <span style={{ fontSize: '0.75rem', color: '#8B9BB4' }}>Last 7 days</span>
            </div>
            {renderTrend(data?.weekly_trend, '#00C9A7')}
          </div>
          <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Monthly Ticket Trend
              <span style={{ fontSize: '0.75rem', color: '#8B9BB4' }}>Last 30 days</span>
            </div>
            {renderTrend(data?.monthly_trend, '#6366F1')}
          </div>
        </div>

        {/* Staff performance table */}
        <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Staff Performance
            <span style={{ fontSize: '0.75rem', color: '#8B9BB4' }}>Ranked by resolved tickets</span>
          </div>
          {!data?.top_staff?.length ? (
            <div style={{ color: '#8B9BB4', fontSize: '0.85rem', padding: '1rem 0' }}>No staff data yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Staff member', 'Assigned', 'Resolved', 'Avg time', 'Resolution rate'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.85rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#8B9BB4', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.top_staff.map(s => {
                  const initials = s.staff.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={s.staff.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.staff.full_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#8B9BB4' }}>{s.staff.department || s.staff.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: 600 }}>{s.assigned}</td>
                      <td style={{ padding: '0.85rem', color: '#4ADE80', fontWeight: 600 }}>{s.resolved}</td>
                      <td style={{ padding: '0.85rem', color: '#8B9BB4' }}>{s.avg_resolution_hours ? `${s.avg_resolution_hours}h` : '—'}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 100, background: '#00C9A7', width: `${s.resolution_rate}%` }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#00C9A7', minWidth: 36 }}>{s.resolution_rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recurring issues */}
        <div style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1.25rem' }}>
            🔁 Recurring Issues
            <span style={{ fontSize: '0.75rem', color: '#8B9BB4', fontWeight: 400, marginLeft: '0.5rem' }}>Last 30 days</span>
          </div>
          {!data?.recurring_issues?.length ? (
            <div style={{ color: '#8B9BB4', fontSize: '0.85rem' }}>No recurring issues detected yet. Submit more tickets to enable pattern detection.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem' }}>
              {data.recurring_issues.map((issue, i) => (
                <div key={i} style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#FB7185', lineHeight: 1 }}>{issue.frequency}x</div>
                  <div style={{ fontSize: '0.78rem', color: '#8B9BB4', marginTop: '0.35rem', lineHeight: 1.4 }}>{issue.issue}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}