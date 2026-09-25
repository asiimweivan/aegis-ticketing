import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets } from '../../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'rocket') return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  if (name === 'lightbulb') return <svg {...common}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.5.5.8 1.2.8 1.5h6.4c0-.3.3-1 .8-1.5A6 6 0 0 0 12 3Z" /></svg>
  return null
}

var CATEGORY_LABELS = {
  technical: 'Technical', administrative: 'Administrative', billing: 'Billing',
  infrastructure: 'Infrastructure', hr: 'HR', security: 'Security', general: 'General',
}
var PRIORITY_COLORS = { critical: '#F87171', high: '#F97316', medium: '#FBBF24', low: '#34D399' }

export default function NewTicket() {
  var navigate = useNavigate()
  var titleArr = useState('')
  var title = titleArr[0]
  var setTitle = titleArr[1]
  var descArr = useState('')
  var description = descArr[0]
  var setDescription = descArr[1]
  var loadingArr = useState(false)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var errorArr = useState('')
  var error = errorArr[0]
  var setError = errorArr[1]
  var resultArr = useState(null)
  var result = resultArr[0]
  var setResult = resultArr[1]

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (title.trim().length < 5) { setError('Please give your ticket a more descriptive title (at least 5 characters).'); return }
    if (description.trim().length < 15) { setError('Please describe the issue in a bit more detail (at least 15 characters) so AI can classify it accurately.'); return }
    setLoading(true)
    tickets.create({ title: title.trim(), description: description.trim() }).then(function (created) {
      if (created) setResult(created)
    }).catch(function (err) {
      setError(err.message || 'Could not submit your ticket. Please try again.')
    }).finally(function () { setLoading(false) })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    @keyframes checkPop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }\n    @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(124,111,238,0.4)} 50%{box-shadow:0 0 0 8px rgba(124,111,238,0)} }\n    .nt-textarea:focus, .nt-input:focus { border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px -4px rgba(232,69,10,0.5); }\n  "

  var inputCss = { width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F1F3F8', fontSize: '0.92rem', fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'all 0.2s' }

  if (result) {
    var pc = PRIORITY_COLORS[result.priority] || '#8A93A6'
    return (
      <DashboardLayout>
        <style>{css}</style>
        <Topbar title="Ticket Submitted" subtitle="AI classification complete" />
        <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 560, width: '100%', textAlign: 'center', animation: 'fadeIn 0.5s ease both' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '2px solid rgba(52,211,153,0.35)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', animation: 'checkPop 0.5s 0.15s ease both', opacity: 0 }}>
              <Icon name="check-circle" size={38} strokeWidth={1.6} />
            </div>

            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#F1F3F8', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>Your ticket is in good hands</h1>
            <p style={{ color: '#8A93A6', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              Ticket <span style={{ fontFamily: 'JetBrains Mono,monospace', color: '#F97316', fontWeight: 700 }}>{result.ticket_number}</span> has been created and classified by AI in real time.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.75rem', textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ color: '#B4ACF9', display: 'flex' }}><Icon name="cpu" size={16} /></span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#F1F3F8' }}>AI Classification Result</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#B4ACF9' }}>{CATEGORY_LABELS[result.category] || result.category}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: pc, textTransform: 'capitalize' }}>{result.priority}</div>
                </div>
                {result.due_date && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.85rem', gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: '#FBBF24', display: 'flex' }}><Icon name="clock" size={15} /></span>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600 }}>SLA Deadline</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F3F8' }}>{new Date(result.due_date).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={'/client/tickets/' + result.id} style={{ flex: 1, padding: '0.9rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(232,69,10,0.35)' }}>
                View Ticket &rarr;
              </Link>
              <Link to="/client" style={{ padding: '0.9rem 1.5rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#D6DCE8', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', fontFamily: "'Inter',sans-serif" }}>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title="New Ticket" subtitle="Describe your issue and AI will handle the rest" />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', maxWidth: 980, margin: '0 auto' }}>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2rem' }}>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1.5px solid rgba(248,113,113,0.3)', color: '#FCA5A5', padding: '0.85rem 1.1rem', borderRadius: 12, fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Icon name="alert" size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#D6DCE8', marginBottom: '0.6rem' }}>What's the issue? *</label>
                <input type="text" value={title} onChange={function (e) { setTitle(e.target.value) }} placeholder="e.g. VPN not connecting from home office" required className="nt-input" style={inputCss} />
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#D6DCE8', marginBottom: '0.6rem' }}>Describe it in detail *</label>
                <textarea value={description} onChange={function (e) { setDescription(e.target.value) }} required rows={9} placeholder="What happened? When did it start? Who's affected? What have you already tried?" className="nt-textarea" style={Object.assign({}, inputCss, { resize: 'vertical', lineHeight: 1.6, fontFamily: "'Inter',sans-serif" })} />
                <div style={{ fontSize: '0.72rem', color: '#5C6478', marginTop: '0.5rem' }}>{description.length} characters &middot; minimum 15</div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn" style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 800, border: 'none', borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 6px 20px rgba(232,69,10,0.35)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                    AI is classifying your ticket...
                  </>
                ) : <><Icon name="rocket" size={17} /> Submit Ticket</>}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg,rgba(124,111,238,0.1),rgba(249,115,22,0.06))', border: '1.5px solid rgba(124,111,238,0.3)', borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,111,238,0.18)', border: '1px solid rgba(124,111,238,0.35)', color: '#B4ACF9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem', animation: loading ? 'pulseGlow 1.5s ease-in-out infinite' : 'none' }}>
                <Icon name="cpu" size={17} />
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.92rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.5rem' }}>AI-powered from the start</div>
              <p style={{ fontSize: '0.8rem', color: '#B0B8C8', lineHeight: 1.7 }}>
                The moment you submit, AI reads your description, assigns a category and priority, calculates the SLA deadline, and routes it to the right team - all in under a second.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                <span style={{ color: '#FBBF24', display: 'flex' }}><Icon name="lightbulb" size={16} /></span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.87rem', fontWeight: 700, color: '#F1F3F8' }}>Tips for a great ticket</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {['Mention when the issue started', 'Say who or how many people are affected', "Note what you've already tried", 'Be specific rather than general'].map(function (tip) {
                  return (
                    <li key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: '#8A93A6', lineHeight: 1.5 }}>
                      <span style={{ color: '#34D399', flexShrink: 0, marginTop: 2 }}><Icon name="check-circle" size={13} /></span>
                      {tip}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}