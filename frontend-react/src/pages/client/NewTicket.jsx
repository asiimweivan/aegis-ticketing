import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

const CATEGORY_KEYWORDS = {
  technical: ['server','network','software','hardware','bug','error','crash','system','computer','laptop','internet','wifi','database','application','install','update','code','api','website','printer'],
  administrative: ['document','form','approval','request','procedure','policy','office','meeting','schedule','permit','certificate','registration','contract','signature','report'],
  billing: ['invoice','payment','billing','charge','fee','refund','receipt','subscription','cost','price','salary','budget','finance','transaction','money','bank'],
  infrastructure: ['building','electricity','power','water','elevator','air conditioning','hvac','generator','maintenance','facility','room','cable','plumbing','door','light'],
  hr: ['leave','vacation','sick','employee','hiring','resignation','performance','training','onboarding','hr','human resources','complaint','promotion','attendance'],
  security: ['security','access','password','login','breach','hack','unauthorized','permission','firewall','vpn','authentication','threat','malware','phishing','suspicious'],
}
const PRIORITY_KEYWORDS = {
  critical: ['urgent','critical','emergency','immediately','system down','outage','cannot work','blocked','asap','all users','failure','data loss'],
  high: ['important','high priority','major','cannot','unable','not working','broken','serious','deadline'],
  medium: ['sometimes','intermittent','slow','delayed','occasional','partial','workaround'],
  low: ['minor','low','whenever','small','suggestion','enhancement','eventually','no rush'],
}
const SLA_HOURS = { critical: 4, high: 12, medium: 48, low: 120 }
const CAT_LABELS = {
  technical: '💻 Technical', administrative: '📋 Administrative',
  billing: '💳 Billing', infrastructure: '🏗️ Infrastructure',
  hr: '👥 HR', security: '🔒 Security', general: '📌 General',
}
const PRI_COLORS = { critical: '#F43F5E', high: '#F97316', medium: '#F59E0B', low: '#8B9BB4' }

function previewClassify(text) {
  const t = text.toLowerCase()
  const catScores = {}
  Object.keys(CATEGORY_KEYWORDS).forEach(cat => {
    catScores[cat] = CATEGORY_KEYWORDS[cat].filter(k => t.includes(k)).length
  })
  const priScores = {}
  Object.keys(PRIORITY_KEYWORDS).forEach(p => {
    priScores[p] = PRIORITY_KEYWORDS[p].filter(k => t.includes(k)).length
  })
  const bestCat = Object.entries(catScores).sort((a, b) => b[1] - a[1])[0]
  const bestPri = Object.entries(priScores).sort((a, b) => b[1] - a[1])[0]
  const category = bestCat[1] > 0 ? bestCat[0] : 'general'
  const priority = bestPri[1] > 0 ? bestPri[0] : 'medium'
  const catTotal = Object.values(catScores).reduce((a, b) => a + b, 0)
  const priTotal = Object.values(priScores).reduce((a, b) => a + b, 0)
  const catConf = catTotal > 0 ? bestCat[1] / catTotal : 0.3
  const priConf = priTotal > 0 ? bestPri[1] / priTotal : 0.4
  const confidence = Math.min(Math.round(((catConf + priConf) / 2) * 100), 92)
  const allTags = [...Object.values(CATEGORY_KEYWORDS).flat()]
  const tags = allTags.filter(k => t.includes(k)).slice(0, 6)
  return { category, priority, confidence, tags, sla: SLA_HOURS[priority] }
}

export default function NewTicket() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const timerRef = useRef(null)
  const showToast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (title.length < 5 && description.length < 10) { setAiResult(null); return }
    timerRef.current = setTimeout(() => {
      setAiResult(previewClassify(`${title} ${description}`))
    }, 600)
    return () => clearTimeout(timerRef.current)
  }, [title, description])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { title, description }
      if (category) payload.category = category
      if (priority) payload.priority = priority
      const ticket = await tickets.create(payload)
      if (ticket) {
        setSuccess(ticket)
        showToast('Ticket submitted successfully!')
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <DashboardLayout>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh', padding: '2rem',
      }}>
        <div style={{
          background: '#0D1B3E', border: '1px solid rgba(0,201,167,0.3)',
          borderRadius: 20, padding: '3rem 2.5rem',
          textAlign: 'center', maxWidth: 440, width: '100%',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(0,201,167,0.12)',
            border: '2px solid rgba(0,201,167,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 1.5rem',
          }}>✓</div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Ticket submitted!
          </h2>
          <p style={{ color: '#8B9BB4', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            Your ticket has been received and classified by AI.
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)',
            color: '#00C9A7', fontWeight: 700, padding: '0.3rem 1rem',
            borderRadius: 100, fontSize: '0.9rem', margin: '0.75rem 0 1.5rem',
          }}>{success.ticket_number}</div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/client/tickets" style={{
              padding: '0.75rem 1.5rem', background: '#00C9A7', color: '#0A0F1E',
              borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem',
            }}>View my tickets</Link>
            <button onClick={() => { setSuccess(null); setTitle(''); setDescription(''); setAiResult(null) }} style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#8B9BB4', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem',
            }}>Submit another</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <Topbar
        title="Submit a Ticket"
        subtitle="Describe your issue — AI will classify it instantly"
        actions={
          <Link to="/client/tickets" style={{
            padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#8B9BB4', borderRadius: 8, fontSize: '0.82rem', textDecoration: 'none',
          }}>← My tickets</Link>
        }
      />

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Form */}
          <div style={{
            background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '2rem',
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8B9BB4', marginBottom: '0.5rem' }}>
                  Title *
                </label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Brief summary of your issue..." maxLength={255} required
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, color: '#F8FAFC',
                    fontSize: '0.9rem', fontFamily: 'Inter,sans-serif', outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#8B9BB4', textAlign: 'right', marginTop: '0.3rem' }}>
                  {title.length} / 255
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8B9BB4', marginBottom: '0.5rem' }}>
                  Description *
                </label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail. Include when it started, what you've tried, and who is affected..."
                  maxLength={2000} required rows={7}
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, color: '#F8FAFC',
                    fontSize: '0.9rem', fontFamily: 'Inter,sans-serif', outline: 'none',
                    resize: 'vertical', minHeight: 160,
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: description.length > 1800 ? '#F59E0B' : '#8B9BB4', textAlign: 'right', marginTop: '0.3rem' }}>
                  {description.length} / 2000
                </div>
              </div>

              {/* Override */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '1rem', marginBottom: '1.25rem',
              }}>
                <div style={{ fontSize: '0.78rem', color: '#8B9BB4', fontWeight: 500, marginBottom: '0.75rem' }}>
                  ⚙️ Override AI classification (optional)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B9BB4', marginBottom: '0.4rem' }}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={{
                      width: '100%', padding: '0.65rem 0.85rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, color: '#F8FAFC',
                      fontSize: '0.85rem', fontFamily: 'Inter,sans-serif', outline: 'none',
                    }}>
                      <option value="">Let AI decide</option>
                      {Object.entries(CAT_LABELS).map(([v, l]) => (
                        <option key={v} value={v} style={{ background: '#0D1B3E' }}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B9BB4', marginBottom: '0.4rem' }}>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)} style={{
                      width: '100%', padding: '0.65rem 0.85rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, color: '#F8FAFC',
                      fontSize: '0.85rem', fontFamily: 'Inter,sans-serif', outline: 'none',
                    }}>
                      <option value="">Let AI decide</option>
                      <option value="low" style={{ background: '#0D1B3E' }}>🟢 Low</option>
                      <option value="medium" style={{ background: '#0D1B3E' }}>🟡 Medium</option>
                      <option value="high" style={{ background: '#0D1B3E' }}>🟠 High</option>
                      <option value="critical" style={{ background: '#0D1B3E' }}>🔴 Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '1rem',
                background: '#00C9A7', color: '#0A0F1E',
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: '1rem', fontWeight: 700,
                border: 'none', borderRadius: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
              }}>
                {loading ? '⏳ Submitting...' : '🚀 Submit Ticket'}
              </button>
            </form>
          </div>

          {/* AI Panel */}
          <div style={{
            background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '1.5rem',
            position: 'sticky', top: '5rem',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              marginBottom: '1.25rem', paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>🤖</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>AI Classification</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#00C9A7', fontWeight: 600 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C9A7', animation: 'pulse 2s infinite' }} />
                LIVE
              </div>
            </div>

            {!aiResult ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#8B9BB4', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>🧠</div>
                Start typing your issue title and description — AI will analyze it in real time.
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8B9BB4', marginBottom: '0.4rem' }}>Category</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{CAT_LABELS[aiResult.category] || aiResult.category}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8B9BB4', marginBottom: '0.4rem' }}>Priority</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: PRI_COLORS[aiResult.priority], textTransform: 'capitalize' }}>{aiResult.priority}</div>
                </div>
                {aiResult.tags.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8B9BB4', marginBottom: '0.4rem' }}>Tags detected</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {aiResult.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 100,
                          background: 'rgba(99,102,241,0.12)', color: '#818CF8', fontWeight: 500,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#8B9BB4' }}>AI Confidence</span>
                    <span style={{ color: '#00C9A7', fontWeight: 600 }}>{aiResult.confidence}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#00C9A7,#6366F1)', width: `${aiResult.confidence}%`, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                <div style={{
                  marginTop: '0.75rem',
                  background: 'rgba(0,201,167,0.06)',
                  border: '1px solid rgba(0,201,167,0.15)',
                  borderRadius: 8, padding: '0.75rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  fontSize: '0.82rem',
                }}>
                  <span>⏱️</span>
                  <div style={{ color: '#8B9BB4' }}>
                    SLA: <strong style={{ color: '#00C9A7' }}>{aiResult.sla} hours</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </DashboardLayout>
  )
}