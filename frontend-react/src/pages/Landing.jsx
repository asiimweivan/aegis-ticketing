import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ── ICON SYSTEM — consistent line icons, currentColor, no emoji ── */
function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'brain':
      return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
    case 'zap':
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
    case 'bar-chart':
      return <svg {...common}><path d="M3 20h18" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></svg>
    case 'bell':
      return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
    case 'shield':
      return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9.5 12 1.8 1.8L15 10" /></svg>
    case 'repeat':
      return <svg {...common}><path d="M17 2 21 6l-4 4" /><path d="M3 12v-2a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 12v2a4 4 0 0 1-4 4H3" /></svg>
    case 'rocket':
      return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
    case 'cpu':
      return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
    case 'check-circle':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
    case 'laptop':
      return <svg {...common}><rect x="4.5" y="5" width="15" height="10" rx="1" /><path d="M2.5 19h19" /></svg>
    case 'alert':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
    case 'target':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
    case 'refresh':
      return <svg {...common}><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></svg>
    case 'file-text':
      return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
    case 'mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
    case 'phone':
      return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
    case 'globe':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" /></svg>
    case 'lock':
      return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
    default:
      return null
  }
}

function TypeWriter({ texts, speed = 60, pause = 2400 }) {
  const [display, setDisplay] = useState('')
  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const current = texts[idx]
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => { setDisplay(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, speed)
      return () => clearTimeout(t)
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => { setDisplay(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }, speed / 2)
      return () => clearTimeout(t)
    }
    if (deleting && charIdx === 0) { setDeleting(false); setIdx(i => (i + 1) % texts.length) }
  }, [charIdx, deleting, idx])
  return <span style={{ color: '#E8450A' }}>{display}<span style={{ animation: 'blink 1s step-end infinite', color: '#E8450A' }}>|</span></span>
}

function Counter({ target, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1)
          setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

const FEATURES = [
  { n: '01', icon: 'brain', title: 'AI Classification', desc: 'NLP + ML classifies every ticket by category, priority & SLA in under 100ms — automatically, no human needed.' },
  { n: '02', icon: 'zap', title: 'Instant Routing', desc: 'The right team receives the ticket before anyone has read it. Zero manual triage, zero delay.' },
  { n: '03', icon: 'bar-chart', title: 'Analytics & Reports', desc: 'Generate and download detailed reports — per user, per team, per period. Full visibility at every level.' },
  { n: '04', icon: 'bell', title: 'Live Status Updates', desc: 'Real-time notifications keep clients informed at every stage. No more chasing emails.' },
  { n: '05', icon: 'shield', title: 'Role-Based Portals', desc: 'Three purpose-built dashboards — Client, Staff, Admin — each seeing exactly what they need.' },
  { n: '06', icon: 'repeat', title: 'Self-Learning Model', desc: 'The AI retrains on resolved tickets automatically. Accuracy improves with every closure.' },
]

const STEPS = [
  { n: '1', t: 'Submit', d: 'Describe your issue in plain language — no forms, no categories required.' },
  { n: '2', t: 'AI classifies', d: 'Category, priority, SLA and tags are set in milliseconds.' },
  { n: '3', t: 'Staff resolves', d: 'Full context delivered. Collaboration, notes, real-time updates.' },
  { n: '4', t: 'Resolved & reported', d: 'Instant notification. Report generated. Feedback collected.' },
]

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [confW, setConfW] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    setTimeout(() => setConfW(93), 1400)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:#FFFFFF;color:#0F172A;font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden}
    a{text-decoration:none;color:inherit}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:#E8450A44;border-radius:4px}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes ping{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.2);opacity:0}}
    @keyframes orbit{from{transform:rotate(0deg) translateX(150px) rotate(0deg)}to{transform:rotate(360deg) translateX(150px) rotate(-360deg)}}
    @keyframes orbit2{from{transform:rotate(180deg) translateX(195px) rotate(-180deg)}to{transform:rotate(540deg) translateX(195px) rotate(-540deg)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .nav-link{font-size:0.875rem;font-weight:500;color:#475569;transition:color 0.2s}
    .nav-link:hover{color:#0F172A}
    .btn-primary{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.6rem;border-radius:10px;font-size:0.9rem;font-weight:600;color:#FFFFFF;background:#E8450A;border:none;cursor:pointer;transition:all 0.2s;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:0 4px 14px rgba(232,69,10,0.35)}
    .btn-primary:hover{background:#C93A08;transform:translateY(-1px);box-shadow:0 6px 20px rgba(232,69,10,0.45)}
    .btn-secondary{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.6rem;border-radius:10px;font-size:0.9rem;font-weight:600;color:#0F172A;background:#FFFFFF;border:1.5px solid #E2E8F0;cursor:pointer;transition:all 0.2s;font-family:'Plus Jakarta Sans',sans-serif}
    .btn-secondary:hover{border-color:#CBD5E1;background:#F8FAFC;transform:translateY(-1px)}
    .btn-sm{padding:0.55rem 1.25rem;font-size:0.82rem;border-radius:8px}
    .feat-card{background:#FFFFFF;border:1.5px solid #F1F5F9;border-radius:16px;padding:1.75rem;transition:all 0.25s;cursor:default;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
    .feat-card:hover{border-color:#E8450A22;box-shadow:0 8px 24px rgba(232,69,10,0.08);transform:translateY(-3px)}
    .step-num{width:48px;height:48px;border-radius:50%;background:#FFF5F2;border:2px solid #FED7C8;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:#E8450A;font-weight:700;transition:all 0.25s}
    .step-num:hover{background:#FED7C8;box-shadow:0 0 0 4px rgba(232,69,10,0.1)}
    .role-card{border-radius:16px;padding:2rem;border:1.5px solid #F1F5F9;background:#FFFFFF;position:relative;overflow:hidden;transition:all 0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
    .role-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.08)}
    .social-icon{transition:all 0.2s}
    .social-icon:hover{background:rgba(232,69,10,0.15)!important;border-color:rgba(232,69,10,0.3)!important;color:#F97316!important}
    @media(max-width:900px){
      .hero-viz{display:none!important}
      .feat-grid{grid-template-columns:repeat(2,1fr)!important}
      .roles-grid,.steps-row{grid-template-columns:1fr!important}
      .stats-row{grid-template-columns:repeat(2,1fr)!important}
      .footer-cols{grid-template-columns:1fr 1fr!important}
      .nav-center{display:none!important}
      .ai-2col{grid-template-columns:1fr!important}
    }
    @media(max-width:580px){
      .feat-grid,.stats-row{grid-template-columns:1fr!important}
      .footer-cols{grid-template-columns:1fr!important}
      .hero-btns{flex-direction:column!important}
    }
  `

  return (
    <>
      <style>{css}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 6%', background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${scrolled ? '#E2E8F0' : 'transparent'}`, transition: 'all 0.3s' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
         <img src="/aeg_logo.png" alt="AEG" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>AEGIS</div>
            <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 500, lineHeight: 1, letterSpacing: '0.02em' }}>Adaptive Eng. Group</div>
          </div>
        </Link>

        <div className="nav-center" style={{ display: 'flex', gap: '2rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {[['#features','Features'],['#how','How it works'],['#ai','AI Engine'],['#portals','Portals']].map(([h,l]) => (
            <a key={h} href={h} className="nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link to="/login"><button className="btn-secondary btn-sm">Sign in</button></Link>
          <Link to="/register"><button className="btn-primary btn-sm">Get started →</button></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '8rem 6% 4rem', background: 'linear-gradient(180deg,#FFFAF8 0%,#FFFFFF 100%)', overflow: 'hidden' }}>
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%,black 40%,transparent 100%)', pointerEvents: 'none' }} />

        {/* Left */}
        <div style={{ flex: 1, maxWidth: 580, animation: 'fadeUp 0.8s ease both', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFF5F2', border: '1px solid #FED7C8', borderRadius: 100, padding: '0.3rem 1rem 0.3rem 0.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#E8450A', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#E8450A', animation: 'ping 1.8s ease-out infinite', opacity: 0.4 }} />
              <div style={{ position: 'absolute', inset: '25%', borderRadius: '50%', background: '#E8450A' }} />
            </div>
            AI-Powered · Built for A.E.G Ltd · Kamembe, Rwanda
          </div>

          <h1 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 'clamp(2.6rem,5.5vw,4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0F172A', marginBottom: '1.5rem' }}>
            Every issue,<br />
            <TypeWriter texts={['classified instantly', 'routed perfectly', 'AI-prioritized', 'resolved faster']} /><br />
            <span style={{ color: '#E8450A' }}>by intelligence.</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 480 }}>
            Submit a ticket and AEGIS AI classifies it, sets priority, calculates SLA, and routes it to the right team — automatically, before anyone even reads it.
          </p>

          <div className="hero-btns" style={{ display: 'flex', gap: '0.85rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <Link to="/register"><button className="btn-primary"><Icon name="rocket" size={17} /> Submit your first ticket</button></Link>
            <Link to="/login"><button className="btn-secondary">Sign in to dashboard</button></Link>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['#E8450A','#6460FF','#059669','#0EA5E9'].map((c, i) => (
                <div key={c} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.12)' }}>{['JP','RN','AD','SM'][i]}</div>
              ))}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
              <span style={{ color: '#0F172A', fontWeight: 700 }}>45+ staff</span> already using AEGIS at A.E.G Ltd
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#F59E0B', fontSize: '0.85rem' }}>★</span>)}
              <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '0.2rem' }}>5.0 rating</span>
            </div>
          </div>
        </div>

        {/* Right — visual */}
        <div className="hero-viz" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 540, zIndex: 1 }}>
          {/* Rings */}
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid #FED7C8' }} />
          <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '1px dashed #F1F5F9' }} />

          {/* Central brain */}
          <div style={{ position: 'relative', zIndex: 5, width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg,#E8450A,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 20px 60px rgba(232,69,10,0.3), 0 0 0 8px rgba(232,69,10,0.08)' }}><Icon name="brain" size={34} strokeWidth={1.6} /></div>

          {/* Orbiting cards */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', animation: 'orbit 14s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7C8', borderRadius: 12, padding: '0.85rem 1rem', minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#94A3B8', background: '#F8FAFC', padding: '0.1rem 0.4rem', borderRadius: 4 }}>#TKT-0041</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 100, background: '#FFF1F0', color: '#E8450A' }}><Icon name="alert" size={10} /> Critical</span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.35, marginBottom: '0.4rem' }}>VPN down — all remote staff</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', color: '#E8450A', fontWeight: 500 }}><Icon name="cpu" size={11} /> Technical</span>
                <div style={{ marginLeft: 'auto', height: 3, width: 50, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '92%', background: 'linear-gradient(90deg,#E8450A,#F97316)', borderRadius: 100 }} />
                </div>
                <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>92%</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', width: '100%', height: '100%', animation: 'orbit2 20s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #C7D7FE', borderRadius: 12, padding: '0.85rem 1rem', minWidth: 185, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.45rem' }}>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#94A3B8', background: '#F8FAFC', padding: '0.1rem 0.4rem', borderRadius: 4 }}>#TKT-0038</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 100, background: '#ECFDF5', color: '#059669' }}><Icon name="check-circle" size={10} /> Resolved</span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.35, marginBottom: '0.35rem' }}>Invoice mismatch on Q2</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', color: '#059669', fontWeight: 500 }}><Icon name="cpu" size={11} /> Billing · SLA met</div>
            </div>
          </div>

          {/* Stat badges */}
          <div style={{ position: 'absolute', top: '8%', right: '4%', background: '#FFFFFF', border: '1.5px solid #FDE68A', borderRadius: 12, padding: '0.75rem 1rem', animation: 'floatA 5s ease-in-out infinite', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.62rem', color: '#92400E', fontWeight: 500, marginBottom: '0.15rem' }}>AI Accuracy</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#D97706' }}>94%</div>
          </div>
          <div style={{ position: 'absolute', bottom: '12%', right: '6%', background: '#FFFFFF', border: '1.5px solid #A7F3D0', borderRadius: 12, padding: '0.75rem 1rem', animation: 'floatB 7s ease-in-out infinite', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.62rem', color: '#065F46', fontWeight: 500, marginBottom: '0.15rem' }}>Avg Resolution</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>6h</div>
          </div>
          <div style={{ position: 'absolute', bottom: '18%', left: '4%', background: '#FFFFFF', border: '1.5px solid #C7D7FE', borderRadius: 12, padding: '0.75rem 1rem', animation: 'floatA 6s ease-in-out infinite', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.62rem', color: '#3730A3', fontWeight: 500, marginBottom: '0.15rem' }}>Tickets Today</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#6460FF' }}>24</div>
          </div>
        </div>
      </section>

      {/* ── METRICS BAND ── */}
      <div style={{ background: '#0F172A', padding: '3rem 6%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', textAlign: 'center' }} className="stats-row">
          {[{v:1240,s:'',l:'Tickets resolved'},{v:94,s:'%',l:'AI accuracy'},{v:6,s:'h',l:'Avg resolution'},{v:87,s:'',l:'Active users'}].map(m => (
            <div key={m.l}>
              <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '2.2rem', fontWeight: 800, color: '#E8450A', lineHeight: 1 }}>
                <Counter target={m.v} suffix={m.s} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.35rem', fontWeight: 500 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '6rem 6%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: '#FFF5F2', border: '1px solid #FED7C8', borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#E8450A', marginBottom: '1rem' }}>Platform Features</div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Intelligence at every step</h2>
            <p style={{ color: '#64748B', maxWidth: 460, margin: '0 auto', lineHeight: 1.75, fontSize: '0.95rem' }}>From the moment a ticket arrives to the moment it's closed, AI works in the background.</p>
          </div>
          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {FEATURES.map(f => (
              <div key={f.n} className="feat-card">
                <div style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono,monospace', color: '#CBD5E1', letterSpacing: '0.06em', marginBottom: '1rem' }}>{f.n}</div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF5F2', color: '#E8450A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><Icon name={f.icon} size={22} /></div>
                <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>{f.title}</div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '6rem 6%', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: '#FFF5F2', border: '1px solid #FED7C8', borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#E8450A', marginBottom: '1rem' }}>The Process</div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>From problem to resolved in minutes</h2>
          </div>
          <div className="steps-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 24, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg,#E8450A,#F97316,#F59E0B,#059669)', opacity: 0.25, borderRadius: 100 }} />
            {STEPS.map(s => (
              <div key={s.n} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div className="step-num">{s.n}</div>
                <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.45rem' }}>{s.t}</div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ENGINE ── */}
      <section id="ai" style={{ padding: '6rem 6%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="ai-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-block', background: '#FFF5F2', border: '1px solid #FED7C8', borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#E8450A', marginBottom: '1.25rem' }}>AI Engine</div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 'clamp(1.7rem,3vw,2.2rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.2 }}>Learns from every ticket you close</h2>
              <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1.75rem', fontSize: '0.95rem' }}>TF-IDF vectorization + Logistic Regression, trained on your data. Rule-based on day one, full ML after 20 resolved tickets. Improves automatically — no retraining needed.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[['target','Under 100ms','Category, priority, SLA & tags set instantly'],['refresh','Self-improving','Retrains on your closed tickets automatically'],['repeat','Pattern detection','Spots recurring issues across departments'],['file-text','Report generation','Full reports per user, team, and period']].map(([ic,t,d]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem', background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: 12, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#FED7C8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(232,69,10,0.08)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFF5F2', color: '#E8450A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={18} /></div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.1rem' }}>{t}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Classification card */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: '1.75rem', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#E8450A', animation: 'ping 1.5s ease-out infinite', opacity: 0.3 }} />
                  <div style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#E8450A' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Live classification output</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#E8450A', background: '#FFF5F2', padding: '0.15rem 0.5rem', borderRadius: 6, fontWeight: 600 }}>● ACTIVE</span>
              </div>
              {[['Ticket ID','#TKT-2026-00041',true,'#0F172A',null],['Category','Technical',false,'#6460FF','laptop'],['Priority','Critical',false,'#E8450A','alert'],['SLA deadline','4 hours',false,'#D97706',null],['Confidence','93%',false,'#059669',null],['Auto-assigned','IT Support Team',false,'#059669',null]].map(([k,v,mono,c,ic]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #F8FAFC', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94A3B8', fontWeight: 500 }}>{k}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: c, fontFamily: mono ? 'JetBrains Mono,monospace' : 'inherit', fontSize: mono ? '0.78rem' : '0.85rem' }}>{ic && <Icon name={ic} size={13} />}{v}</span>
                </div>
              ))}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94A3B8', fontWeight: 500 }}>Model confidence</span>
                  <span style={{ color: '#E8450A', fontWeight: 700 }}>{confW}%</span>
                </div>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#E8450A,#F97316)', width: `${confW}%`, transition: 'width 2.5s 0.5s ease' }} />
                </div>
              </div>
              <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {['vpn','network','remote','urgent','production'].map(t => (
                  <span key={t} style={{ background: '#FFF5F2', color: '#C2410C', padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600, border: '1px solid #FED7C8' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTALS ── */}
      <section id="portals" style={{ padding: '6rem 6%', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: '#FFF5F2', border: '1px solid #FED7C8', borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#E8450A', marginBottom: '1rem' }}>Three Portals</div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Built for everyone in the process</h2>
            <p style={{ color: '#64748B', maxWidth: 440, margin: '0 auto', lineHeight: 1.75, fontSize: '0.95rem' }}>Each role gets a purpose-built experience with exactly the tools they need.</p>
          </div>
          <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {[
              { topColor: '#0EA5E9', bg: '#F0F9FF', badgeColor: '#0369A1', badgeBg: '#E0F2FE', badge: 'Client Portal', title: 'Submit & track your issues', items: ['Submit in plain language','Real-time status tracking','Comment on tickets','Instant notifications','Full ticket history','Download your reports'], link: '/register', cta: 'Get started →', ck: '#0EA5E9' },
              { topColor: '#6460FF', bg: '#F5F3FF', badgeColor: '#5B21B6', badgeBg: '#EDE9FE', badge: 'Staff Portal', title: 'Manage your assigned queue', items: ['View assigned tickets','Internal notes (hidden)','Update status & priority','SLA deadline tracking','Personal performance stats','Generate team reports'], link: '/login', cta: 'Sign in →', ck: '#6460FF' },
              { topColor: '#E8450A', bg: '#FFF5F2', badgeColor: '#C2410C', badgeBg: '#FFF1EE', badge: 'Admin Portal', title: 'Full control & visibility', items: ['Live analytics dashboard','User & staff management','All tickets, all teams','AI model retraining','Full audit trail & logs','Download all reports'], link: '/login', cta: 'Access portal →', ck: '#E8450A' },
            ].map(r => (
              <div key={r.badge} className="role-card">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: r.topColor, borderRadius: '16px 16px 0 0' }} />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 100, marginBottom: '1.25rem', background: r.badgeBg, color: r.badgeColor }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.topColor }} />
                  {r.badge}
                </div>
                <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', lineHeight: 1.25 }}>{r.title}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.75rem' }}>
                  {r.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: '#475569' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: r.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: r.topColor }}>
                        <Icon name="check-circle" size={12} strokeWidth={2.2} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to={r.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 700, color: r.topColor, transition: 'gap 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.gap = '0.7rem'}
                  onMouseOut={e => e.currentTarget.style.gap = '0.4rem'}
                >{r.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <div style={{ padding: '5rem 6%', background: '#F8FAFC', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#F59E0B', fontSize: '1.1rem' }}>★</span>)}
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 'clamp(1.1rem,2.3vw,1.4rem)', fontWeight: 700, lineHeight: 1.55, color: '#0F172A', marginBottom: '2rem' }}>
            "AEGIS transformed how A.E.G handles internal issues. What used to take hours now resolves in minutes — the AI routing saves our team half a day every week."
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#E8450A,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>AD</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Administrative Director</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Adaptive Engineering Group Ltd, Kamembe</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section style={{ padding: '7rem 6%', textAlign: 'center', background: '#0F172A', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 350, background: 'radial-gradient(ellipse,rgba(232,69,10,0.15),transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(232,69,10,0.15)', border: '1px solid rgba(232,69,10,0.3)', borderRadius: 100, padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#F97316', marginBottom: '1.5rem' }}>Ready to start?</div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
            Stop managing issues<br />
            <span style={{ color: '#E8450A' }}>manually.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#94A3B8', maxWidth: 420, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>Join the teams at Adaptive Engineering Group already resolving issues faster and smarter with AEGIS.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Link to="/register"><button className="btn-primary">Create your account →</button></Link>
            <Link to="/login"><button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.6rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, color: '#CBD5E1', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', transition: 'all 0.2s' }}>Sign in to dashboard</button></Link>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569' }}>Free to use · No credit card · Set up in under 2 minutes</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3.5rem 6% 2rem' }}>
        <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#E8450A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>AE</div>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC' }}>AEGIS</div>
                <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 500 }}>Adaptive Engineering Group</div>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.7, maxWidth: 260, marginBottom: '1.5rem' }}>AI-powered issue management for Adaptive Engineering Group Ltd. Classify, route, and resolve faster.</p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {[['mail','Email'],['phone','Phone'],['globe','Website']].map(([ic,label]) => (
                <div key={ic} className="social-icon" title={label} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', cursor: 'pointer' }}>
                  <Icon name={ic} size={15} />
                </div>
              ))}
            </div>
          </div>
          {[
            { h: 'Product', links: [['#features','Features'],['#how','How it works'],['#ai','AI Engine'],['#portals','Portals']] },
            { h: 'Access', links: [['/register','Register'],['/login','Sign in'],['/login','Staff portal'],['/login','Admin portal']] },
            { h: 'A.E.G Ltd', links: [['#','Rusizi — Kamembe'],['#','Rwanda'],['#','Privacy policy'],['#','Terms of service']] },
          ].map(col => (
            <div key={col.h}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1rem', letterSpacing: '0.02em' }}>{col.h}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {col.links.map(([href, label]) => (
                  <li key={label}><a href={href} style={{ fontSize: '0.82rem', color: '#475569', transition: 'color 0.2s', fontWeight: 500 }}
                    onMouseOver={e => e.target.style.color = '#CBD5E1'}
                    onMouseOut={e => e.target.style.color = '#475569'}
                  >{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 500 }}>© 2026 Adaptive Engineering Group Ltd · Kamembe, Rwanda · All rights reserved</div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {['v1.0.0','AI-Powered','Built with AUCA'].map(b => (
              <span key={b} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#475569', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: 5 }}>{b}</span>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
