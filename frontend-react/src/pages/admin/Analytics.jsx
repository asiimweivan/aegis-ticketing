import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import StatCard from '../../components/ui/StatCard'
import { analytics } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

var CAT_COLORS = ['#F97316', '#7C6FEE', '#FBBF24', '#F87171', '#34D399', '#0EA5E9', '#8A93A6']
var PRI_COLORS = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#7C6FEE' }

function Icon(props) {
  var name = props.name
  var size = props.size || 16
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'refresh') return <svg {...common}><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'repeat') return <svg {...common}><path d="M17 2 21 6l-4 4" /><path d="M3 12v-2a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 12v2a4 4 0 0 1-4 4H3" /></svg>
  return null
}

export default function AdminAnalytics() {
  var showToast = useToast()
  var dataArr = useState(null)
  var data = dataArr[0]
  var setData = dataArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var retrainingArr = useState(false)
  var retraining = retrainingArr[0]
  var setRetraining = retrainingArr[1]
  var retrainMsgArr = useState('')
  var retrainMsg = retrainMsgArr[0]
  var setRetrainMsg = retrainMsgArr[1]

  useEffect(function () { loadData() }, [])

  function loadData() {
    setLoading(true)
    analytics.dashboard().then(function (res) {
      if (res) setData(res)
    }).catch(function () { showToast('Failed to load analytics', 'error') })
      .finally(function () { setLoading(false) })
  }

  function retrainML() {
    setRetraining(true)
    setRetrainMsg('')
    analytics.retrainML().then(function (res) {
      setRetrainMsg(res.message)
      showToast(res.message)
    }).catch(function () {
      setRetrainMsg('Retraining failed.')
      showToast('Retraining failed', 'error')
    }).finally(function () { setRetraining(false) })
  }

  function renderTrend(trend, color) {
    if (!trend || !trend.length) return <div style={{ color: '#5C6478', fontSize: '0.85rem', padding: '1rem 0' }}>No data yet</div>
    var vals = trend.map(function (t) { return t.count })
    var maxV = Math.max.apply(null, vals.concat([1]))
    var W = 400, H = 120, pad = 20
    var n = vals.length
    var xStep = (W - pad * 2) / Math.max(n - 1, 1)
    var points = vals.map(function (v, i) {
      return {
        x: pad + i * xStep,
        y: H - pad - ((v / maxV) * (H - pad * 2)),
        count: v,
        date: trend[i].date,
      }
    })
    var pathD = points.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y }).join(' ')
    var areaD = 'M' + points[0].x + ',' + (H - pad) + ' ' + points.map(function (p) { return 'L' + p.x + ',' + p.y }).join(' ') + ' L' + points[points.length - 1].x + ',' + (H - pad) + ' Z'
    var gradId = 'grad-' + color.replace('#', '')

    return (
      <svg width="100%" viewBox={'0 0 ' + W + ' ' + H} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={'url(#' + gradId + ')'} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map(function (p, i) {
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill={color} stroke="#0B0E17" strokeWidth="2" />
              {n <= 10 && (
                <>
                  <text x={p.x} y={H - 4} textAnchor="middle" fill="#5C6478" fontSize="9" fontFamily="Inter,sans-serif">{p.date.slice(5)}</text>
                  <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#F1F3F8" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">{p.count}</text>
                </>
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  var s = data && data.stats
  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes spin { to{transform:rotate(360deg)} }\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    .analytics-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.5rem; }\n    .staff-row:hover { background: rgba(255,255,255,0.03); }\n    .refresh-btn:hover { background: rgba(255,255,255,0.07) !important; color: #D6DCE8 !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Analytics"
        subtitle="System performance and AI insights"
        actions={
          <button onClick={loadData} className="refresh-btn" style={{
            padding: '0.55rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#8A93A6', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem',
            transition: 'all 0.2s',
          }}><Icon name="refresh" size={14} /> Refresh</button>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        {/* KPI cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(function (i) {
              return <div key={i} style={{ height: 110, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard label="Total Tickets" value={s ? s.total : '\u2014'} icon="ticket" color="orange" />
            <StatCard label="Open" value={s ? s.open : '\u2014'} icon="alert-triangle" color="red" />
            <StatCard label="In Progress" value={s ? s.in_progress : '\u2014'} icon="zap" color="violet" />
            <StatCard label="SLA Breached" value={s ? s.sla_breached : '\u2014'} icon="alert-triangle" color="amber" />
            <StatCard label="Resolved" value={s ? s.resolved : '\u2014'} icon="check-circle" color="green" />
            <StatCard label="Avg Resolution" value={s && s.avg_resolution_hours ? s.avg_resolution_hours + 'h' : '\u2014'} icon="clock" color="blue" />
          </div>
        )}

        {/* AI Retrain banner */}
        <div style={{
          background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 16, padding: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#F1F3F8', marginBottom: '0.4rem' }}>
              <Icon name="cpu" size={17} /> AI Classification Model
            </div>
            <p style={{ fontSize: '0.82rem', color: '#8A93A6', maxWidth: 480, lineHeight: 1.6 }}>
              Retrain the ML model on all resolved tickets to continuously improve classification accuracy. Requires at least 20 resolved tickets.
            </p>
            {retrainMsg && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: retrainMsg.indexOf('success') !== -1 ? '#34D399' : '#FBBF24' }}>{retrainMsg}</div>
            )}
          </div>
          <button onClick={retrainML} disabled={retraining} style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
            color: '#34D399', fontFamily: "'Sora',sans-serif",
            fontSize: '0.9rem', fontWeight: 700,
            borderRadius: 10, cursor: retraining ? 'not-allowed' : 'pointer',
            opacity: retraining ? 0.6 : 1, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {retraining ? (
              <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(52,211,153,0.25)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#34D399" strokeWidth="2" strokeLinecap="round" /></svg> Training...</>
            ) : <><Icon name="refresh" size={15} /> Retrain ML Model</>}
          </button>
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="analytics-card">
            <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#F1F3F8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Tickets by Category
              <span style={{ fontSize: '0.72rem', color: '#5C6478', fontWeight: 500 }}>All time</span>
            </div>
            {!(data && data.category_breakdown && data.category_breakdown.length) ? (
              <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {data.category_breakdown.map(function (d, i) {
                  var max = Math.max.apply(null, data.category_breakdown.map(function (x) { return x.count }))
                  var c = CAT_COLORS[i % CAT_COLORS.length]
                  return (
                    <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#D6DCE8', width: 110, flexShrink: 0, textAlign: 'right', textTransform: 'capitalize', fontWeight: 500 }}>{d.category}</span>
                      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 100, background: c, width: (max > 0 ? (d.count / max * 100) : 0) + '%', transition: 'width 1.2s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: c, width: 24, textAlign: 'right' }}>{d.count}</span>
                      <span style={{ fontSize: '0.7rem', color: '#5C6478', width: 36 }}>{d.percentage}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="analytics-card">
            <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#F1F3F8', marginBottom: '1.25rem' }}>
              Tickets by Priority
            </div>
            {!(data && data.priority_breakdown && data.priority_breakdown.length) ? (
              <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>No data yet</div>
            ) : (function () {
              var total = data.priority_breakdown.reduce(function (a, d) { return a + d.count }, 0)
              var r = 55, cx = 70, cy = 70, stroke = 20
              var circ = 2 * Math.PI * r
              var offset = 0
              var paths = data.priority_breakdown.map(function (d) {
                var pct = d.count / (total || 1)
                var dash = pct * circ
                var color = PRI_COLORS[d.priority] || '#8A93A6'
                var el = (
                  <circle key={d.priority} cx={cx} cy={cy} r={r}
                    fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={dash + ' ' + circ}
                    strokeDashoffset={-offset}
                    transform={'rotate(-90 ' + cx + ' ' + cy + ')'}
                    strokeLinecap="round"
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
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#F1F3F8" fontSize="20" fontWeight="800" fontFamily="Sora,sans-serif">{total}</text>
                    <text x={cx} y={cy + 18} textAnchor="middle" fill="#5C6478" fontSize="10" fontFamily="Inter,sans-serif">tickets</text>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                    {data.priority_breakdown.map(function (d) {
                      return (
                        <div key={d.priority} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: PRI_COLORS[d.priority] || '#8A93A6', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.78rem', color: '#D6DCE8', textTransform: 'capitalize', fontWeight: 500 }}>{d.priority}</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F1F3F8' }}>{d.count} <span style={{ color: '#5C6478', fontWeight: 400 }}>({d.percentage}%)</span></span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Charts row 2 - Trends */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="analytics-card">
            <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#F1F3F8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Weekly Ticket Trend
              <span style={{ fontSize: '0.72rem', color: '#5C6478', fontWeight: 500 }}>Last 7 days</span>
            </div>
            {renderTrend(data && data.weekly_trend, '#F97316')}
          </div>
          <div className="analytics-card">
            <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#F1F3F8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Monthly Ticket Trend
              <span style={{ fontSize: '0.72rem', color: '#5C6478', fontWeight: 500 }}>Last 30 days</span>
            </div>
            {renderTrend(data && data.monthly_trend, '#7C6FEE')}
          </div>
        </div>

        {/* Staff performance table */}
        <div className="analytics-card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#F1F3F8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Staff Performance
            <span style={{ fontSize: '0.72rem', color: '#5C6478', fontWeight: 500 }}>Ranked by resolved tickets</span>
          </div>
          {!(data && data.top_staff && data.top_staff.length) ? (
            <div style={{ color: '#5C6478', fontSize: '0.85rem', padding: '1rem 0' }}>No staff data yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Staff member', 'Assigned', 'Resolved', 'Avg time', 'Resolution rate'].map(function (h) {
                    return <th key={h} style={{ padding: '0.6rem 0.85rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {data.top_staff.map(function (st) {
                  var initials = st.staff.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={st.staff.id} className="staff-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,111,238,0.15)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F3F8' }}>{st.staff.full_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#5C6478' }}>{st.staff.department || st.staff.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: 600, color: '#D6DCE8' }}>{st.assigned}</td>
                      <td style={{ padding: '0.85rem', color: '#34D399', fontWeight: 700 }}>{st.resolved}</td>
                      <td style={{ padding: '0.85rem', color: '#8A93A6' }}>{st.avg_resolution_hours ? st.avg_resolution_hours + 'h' : '\u2014'}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 100, background: '#34D399', width: st.resolution_rate + '%' }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34D399', minWidth: 36 }}>{st.resolution_rate}%</span>
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
        <div className="analytics-card">
          <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#F1F3F8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="repeat" size={16} /> Recurring Issues
            <span style={{ fontSize: '0.72rem', color: '#5C6478', fontWeight: 400, marginLeft: '0.3rem' }}>Last 30 days</span>
          </div>
          {!(data && data.recurring_issues && data.recurring_issues.length) ? (
            <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>No recurring issues detected yet. Submit more tickets to enable pattern detection.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem' }}>
              {data.recurring_issues.map(function (issue, i) {
                return (
                  <div key={i} style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#F87171', lineHeight: 1 }}>{issue.frequency}\u00d7</div>
                    <div style={{ fontSize: '0.78rem', color: '#8A93A6', marginTop: '0.4rem', lineHeight: 1.4 }}>{issue.issue}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}