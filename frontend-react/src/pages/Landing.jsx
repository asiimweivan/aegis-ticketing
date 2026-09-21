import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ================= ICON SYSTEM ================= */
function Icon(props) {
  var name = props.name
  var size = props.size || 20
  var strokeWidth = props.strokeWidth || 1.6
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'brain') return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  if (name === 'bar-chart') return <svg {...common}><path d="M3 20h18" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></svg>
  if (name === 'bell') return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.5 20a1.5 1.5 0 0 0 3 0" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9.5 12 1.8 1.8L15 10" /></svg>
  if (name === 'repeat') return <svg {...common}><path d="M17 2 21 6l-4 4" /><path d="M3 12v-2a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 12v2a4 4 0 0 1-4 4H3" /></svg>
  if (name === 'rocket') return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'laptop') return <svg {...common}><rect x="4.5" y="5" width="15" height="10" rx="1" /><path d="M2.5 19h19" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'target') return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
  if (name === 'refresh') return <svg {...common}><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 21v-5h5" /></svg>
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'phone') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'globe') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" /></svg>
  return null
}

/* ================= SCROLL REVEAL ================= */
function useReveal() {
  var ref = useRef(null)
  var stateArr = useState(false)
  var visible = stateArr[0]
  var setVisible = stateArr[1]
  useEffect(function () {
    var node = ref.current
    if (!node) return
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(node)
    return function () { obs.disconnect() }
  }, [])
  return [ref, visible]
}

function Reveal(props) {
  var arr = useReveal()
  var ref = arr[0]
  var visible = arr[1]
  var delay = props.delay || 0
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) ' + delay + 'ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ' + delay + 'ms',
    }}>
      {props.children}
    </div>
  )
}

function TypeWriter(props) {
  var texts = props.texts
  var speed = props.speed || 55
  var pause = props.pause || 2200
  var displayArr = useState('')
  var display = displayArr[0]
  var setDisplay = displayArr[1]
  var idxArr = useState(0)
  var idx = idxArr[0]
  var setIdx = idxArr[1]
  var charArr = useState(0)
  var charIdx = charArr[0]
  var setCharIdx = charArr[1]
  var delArr = useState(false)
  var deleting = delArr[0]
  var setDeleting = delArr[1]

  useEffect(function () {
    var current = texts[idx]
    if (!deleting && charIdx < current.length) {
      var t = setTimeout(function () { setDisplay(current.slice(0, charIdx + 1)); setCharIdx(charIdx + 1) }, speed)
      return function () { clearTimeout(t) }
    }
    if (!deleting && charIdx === current.length) {
      var t2 = setTimeout(function () { setDeleting(true) }, pause)
      return function () { clearTimeout(t2) }
    }
    if (deleting && charIdx > 0) {
      var t3 = setTimeout(function () { setDisplay(current.slice(0, charIdx - 1)); setCharIdx(charIdx - 1) }, speed / 2)
      return function () { clearTimeout(t3) }
    }
    if (deleting && charIdx === 0) { setDeleting(false); setIdx((idx + 1) % texts.length) }
  }, [charIdx, deleting, idx])

  return <span style={{ background: 'linear-gradient(90deg,#F97316,#E8450A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{display}<span style={{ animation: 'blink 1s step-end infinite', color: '#F97316', WebkitTextFillColor: '#F97316' }}>|</span></span>
}

function Counter(props) {
  var target = props.target
  var suffix = props.suffix || ''
  var duration = props.duration || 2000
  var valArr = useState(0)
  var val = valArr[0]
  var setVal = valArr[1]
  var ref = useRef(null)
  var started = useRef(false)
  useEffect(function () {
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        var start = Date.now()
        function tick() {
          var p = Math.min((Date.now() - start) / duration, 1)
          setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return function () { obs.disconnect() }
  }, [target, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

function MeshBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.28),transparent 68%)', top: '-12%', left: '-6%', filter: 'blur(20px)', animation: 'meshDrift1 16s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,111,238,0.22),transparent 68%)', top: '10%', right: '-8%', filter: 'blur(20px)', animation: 'meshDrift2 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,115,22,0.16),transparent 68%)', bottom: '-14%', left: '30%', filter: 'blur(20px)', animation: 'meshDrift3 18s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%,black 20%,transparent 100%)' }} />
    </div>
  )
}

var FEATURES = [
  { n: '01', icon: 'brain', title: 'Instant Classification', desc: 'Every ticket is read, categorized and prioritized by the model in under a hundred milliseconds - no human triage required.' },
  { n: '02', icon: 'zap', title: 'Precision Routing', desc: 'The right specialist receives the ticket before anyone else has even opened their inbox.' },
  { n: '03', icon: 'bar-chart', title: 'Living Reports', desc: 'Generate detailed, exportable reports by person, team or period - always current, always accurate.' },
  { n: '04', icon: 'bell', title: 'Real-Time Signals', desc: 'Clients are kept informed at every stage, automatically, with nothing left to chase.' },
  { n: '05', icon: 'shield', title: 'Role-Aware Access', desc: 'Three distinct, purpose-built portals - Client, Staff, Admin - each seeing precisely what it needs.' },
  { n: '06', icon: 'repeat', title: 'Continuous Learning', desc: 'The model retrains on resolved tickets, refining its judgement with every case you close.' },
]

var STEPS = [
  { n: '01', t: 'Submit', d: 'Describe the issue in plain language. No categories, no forms to wrestle with.' },
  { n: '02', t: 'Classify', d: 'Category, priority, SLA and tags are assigned in the time it takes to blink.' },
  { n: '03', t: 'Resolve', d: 'Full context arrives with the ticket. Staff collaborate, comment, and act.' },
  { n: '04', t: 'Report', d: 'Instant notification. A report is generated. Feedback is invited.' },
]

export default function Landing() {
  var scrolledArr = useState(false)
  var scrolled = scrolledArr[0]
  var setScrolled = scrolledArr[1]
  var confArr = useState(0)
  var confW = confArr[0]
  var setConfW = confArr[1]

  useEffect(function () {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    var t = setTimeout(function () { setConfW(93) }, 1200)
    return function () { window.removeEventListener('scroll', onScroll); clearTimeout(t) }
  }, [])

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    html{scroll-behavior:smooth}\n    body{background:#05070D;color:#E7E9F2;font-family:'Inter',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}\n    a{text-decoration:none;color:inherit}\n    ::-webkit-scrollbar{width:5px}\n    ::-webkit-scrollbar-thumb{background:#E8450A55;border-radius:4px}\n    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}\n    @keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(1deg)}}\n    @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}\n    @keyframes floatC{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}\n    @keyframes ping{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.4);opacity:0}}\n    @keyframes meshDrift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(6%,4%) scale(1.08)}}\n    @keyframes meshDrift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-5%,6%) scale(1.05)}}\n    @keyframes meshDrift3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(4%,-5%) scale(1.1)}}\n    .nav-link{position:relative;font-size:0.85rem;font-weight:600;color:#B0B8C8;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);font-family:'Sora',sans-serif;padding:0.5rem 1.05rem;border-radius:100px;letter-spacing:0.02em}\n    .nav-link:hover{color:#FFFFFF;background:linear-gradient(135deg,rgba(232,69,10,0.14),rgba(124,111,238,0.1));box-shadow:0 4px 16px -4px rgba(232,69,10,0.25)}\n    .btn-primary{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:0.55rem;padding:0.85rem 1.9rem;border-radius:100px;font-size:0.9rem;font-weight:600;color:#0A0E1A;background:linear-gradient(135deg,#FFFFFF,#E7E9F2);border:none;cursor:pointer;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s;font-family:'Sora',sans-serif;box-shadow:0 8px 24px -6px rgba(255,255,255,0.15)}\n    .btn-primary:hover{transform:translateY(-2px) scale(1.015);box-shadow:0 14px 32px -6px rgba(255,255,255,0.25)}\n    .btn-secondary{display:inline-flex;align-items:center;gap:0.55rem;padding:0.85rem 1.9rem;border-radius:100px;font-size:0.9rem;font-weight:600;color:#E7E9F2;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.12);cursor:pointer;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);font-family:'Sora',sans-serif}\n    .btn-secondary:hover{border-color:rgba(255,255,255,0.24);background:rgba(255,255,255,0.07);transform:translateY(-2px)}\n    .btn-sm{padding:0.6rem 1.4rem;font-size:0.82rem}\n    .badge-pill{display:inline-flex;align-items:center;gap:0.55rem;background:rgba(124,111,238,0.1);border:1px solid rgba(124,111,238,0.28);border-radius:100px;padding:0.4rem 1.1rem 0.4rem 0.6rem;font-size:0.78rem;font-weight:600;color:#B4ACF9}\n    .feat-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:2.1rem 1.9rem;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden;backdrop-filter:blur(6px)}\n    .feat-card::before{content:'';position:absolute;inset:0;background:radial-gradient(500px circle at var(--mx,50%) var(--my,0%),rgba(249,115,22,0.08),transparent 60%);opacity:0;transition:opacity 0.4s}\n    .feat-card:hover::before{opacity:1}\n    .feat-card:hover{border-color:rgba(249,115,22,0.35);box-shadow:0 24px 60px -20px rgba(232,69,10,0.25);transform:translateY(-6px)}\n    .step-num{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.03);border:1.5px solid rgba(249,115,22,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 1.4rem;font-family:'Sora',sans-serif;font-size:1.05rem;color:#F97316;font-weight:700;transition:all 0.4s cubic-bezier(0.16,1,0.3,1)}\n    .step-num:hover{background:linear-gradient(135deg,#E8450A,#F97316);color:#0A0E1A;border-color:transparent;transform:scale(1.08);box-shadow:0 8px 24px -6px rgba(249,115,22,0.5)}\n    .role-card{border-radius:24px;padding:2.4rem;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.025);position:relative;overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);backdrop-filter:blur(6px)}\n    .role-card:hover{transform:translateY(-8px);border-color:rgba(255,255,255,0.16);box-shadow:0 32px 70px -24px rgba(0,0,0,0.5)}\n    .social-icon{transition:all 0.3s cubic-bezier(0.16,1,0.3,1)}\n    .social-icon:hover{background:rgba(249,115,22,0.15)!important;border-color:rgba(249,115,22,0.35)!important;color:#F97316!important;transform:translateY(-3px)}\n    .glass-card{background:rgba(15,18,30,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1)}\n    @media(max-width:900px){\n      .feat-grid{grid-template-columns:repeat(2,1fr)!important}\n      .roles-grid,.steps-row{grid-template-columns:1fr!important}\n      .stats-row{grid-template-columns:repeat(2,1fr)!important}\n      .footer-cols{grid-template-columns:1fr 1fr!important}\n      .nav-center{display:none!important}\n      .ai-2col{grid-template-columns:1fr!important}\n      .hero-2col{grid-template-columns:1fr!important}\n    }\n    @media(max-width:580px){\n      .feat-grid,.stats-row{grid-template-columns:1fr!important}\n      .footer-cols{grid-template-columns:1fr!important}\n      .hero-btns{flex-direction:column!important}\n    }\n  "

  return (
    <>
      <style>{css}</style>

      {/* ================= NAV ================= */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.35rem 6%', background: scrolled ? 'rgba(5,7,13,0.9)' : 'rgba(5,7,13,0.35)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', borderBottom: '1px solid ' + (scrolled ? 'rgba(255,255,255,0.1)' : 'transparent'), transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)', boxShadow: scrolled ? '0 8px 32px -12px rgba(0,0,0,0.5)' : 'none' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/aeg_logo.png" alt="AEG" style={{ height: 88, width: 'auto', objectFit: 'contain' }} />
        </Link>

        <div className="nav-center" style={{ display: 'flex', gap: '0.3rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How it works</a>
          <a href="#ai" className="nav-link">AI Engine</a>
          <a href="#portals" className="nav-link">Portals</a>
          <Link to="/knowledge-base" className="nav-link">Knowledge Base</Link>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link to="/login"><button className="btn-secondary btn-sm">Sign in</button></Link>
          <Link to="/register"><button className="btn-primary btn-sm">Get started</button></Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '9rem 6% 4rem', overflow: 'hidden' }}>
        <MeshBackground />

        <div className="hero-2col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '3.5rem', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 600 }}>
            <Reveal>
              <div className="badge-pill" style={{ marginBottom: '2.2rem' }}>
                <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#7C6FEE', animation: 'ping 1.8s ease-out infinite', opacity: 0.4 }} />
                  <div style={{ position: 'absolute', inset: '25%', borderRadius: '50%', background: '#B4ACF9' }} />
                </div>
                About AEGIS &middot; Adaptive Engineering Group
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 'clamp(2.4rem,4.8vw,3.7rem)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.75rem' }}>
                <span style={{ color: '#5C6478' }}>Every issue,</span><br />
                <TypeWriter texts={['classified instantly', 'routed with intent', 'quietly prioritized', 'resolved with care']} /><br />
                <span style={{ color: '#F1F3F8' }}>by intelligence.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p style={{ fontSize: '1.03rem', color: '#8A93A6', lineHeight: 1.75, marginBottom: '2.6rem', maxWidth: 480, fontWeight: 400 }}>
                Submit a ticket and AEGIS reads it, sets its priority, calculates the SLA, and hands it to the right team - before anyone has even opened their inbox.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="hero-btns" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <Link to="/register"><button className="btn-primary"><Icon name="rocket" size={17} /> Submit your first ticket</button></Link>
                <Link to="/login"><button className="btn-secondary">Sign in to dashboard</button></Link>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex' }}>
                  {['#E8450A', '#7C6FEE', '#059669', '#0EA5E9'].map(function (c, i) {
                    var initials = ['JP', 'RN', 'AD', 'SM']
                    return <div key={c} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: '2.5px solid #05070D', marginLeft: i > 0 ? -11 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>{initials[i]}</div>
                  })}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#8A93A6' }}>
                  <span style={{ color: '#F1F3F8', fontWeight: 700 }}>45+ staff</span> already relying on AEGIS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {[1, 2, 3, 4, 5].map(function (i) { return <span key={i} style={{ color: '#F97316', fontSize: '0.9rem' }}>&#9733;</span> })}
                  <span style={{ fontSize: '0.8rem', color: '#5C6478', marginLeft: '0.25rem' }}>5.0 rating</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right - hero image with floating stat chips */}
          <Reveal delay={200}>
            <div style={{ position: 'relative', width: '100%' }}>
              <img src="/images/hero-team.png" alt="AEGIS engineering team at work" style={{ width: '100%', height: 460, objectFit: 'cover', borderRadius: 26, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7)', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 26, background: 'linear-gradient(180deg,transparent 50%,rgba(5,7,13,0.55) 100%)', pointerEvents: 'none' }} />

              <div style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(15,18,30,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 14, padding: '0.7rem 1rem', animation: 'floatA 5.5s ease-in-out infinite', boxShadow: '0 10px 26px -10px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '0.6rem', color: '#8A93A6', fontWeight: 500, marginBottom: '0.1rem' }}>AI Accuracy</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#F97316' }}>94%</div>
              </div>

              <div style={{ position: 'absolute', bottom: 18, left: 18, background: 'rgba(15,18,30,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 14, padding: '0.7rem 1rem', animation: 'floatB 6.5s ease-in-out infinite', boxShadow: '0 10px 26px -10px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '0.6rem', color: '#8A93A6', fontWeight: 500, marginBottom: '0.1rem' }}>Avg Resolution</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#34D399' }}>6h</div>
              </div>

              <div className="glass-card" style={{ position: 'absolute', bottom: -22, right: 24, borderRadius: 14, padding: '0.8rem 1rem', minWidth: 190, animation: 'floatC 7s ease-in-out infinite', boxShadow: '0 20px 50px -14px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.6rem', color: '#5C6478', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>#TKT-0041</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 100, background: 'rgba(232,69,10,0.15)', color: '#F97316' }}><Icon name="alert" size={9} /> Critical</span>
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#F1F3F8' }}>VPN down - remote staff</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= METRICS BAND ================= */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '3.5rem 6%', position: 'relative' }}>
        <Reveal>
          <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', textAlign: 'center' }} className="stats-row">
            {[{ v: 1240, s: '', l: 'Tickets resolved' }, { v: 94, s: '%', l: 'AI accuracy' }, { v: 6, s: 'h', l: 'Avg resolution' }, { v: 87, s: '', l: 'Active users' }].map(function (m) {
              return (
                <div key={m.l}>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '2.4rem', fontWeight: 700, color: '#F97316', lineHeight: 1 }}>
                    <Counter target={m.v} suffix={m.s} />
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#5C6478', marginTop: '0.5rem', fontWeight: 500 }}>{m.l}</div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>

      {/* ================= FEATURES ================= */}
      <section id="features" style={{ padding: '7.5rem 6%', position: 'relative' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="badge-pill" style={{ marginBottom: '1.4rem' }}>Platform Features</div>
              <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 'clamp(1.9rem,3.8vw,2.7rem)', color: '#F1F3F8', letterSpacing: '-0.015em', marginBottom: '1rem' }}>Intelligence at every step</h2>
              <p style={{ color: '#8A93A6', maxWidth: 480, margin: '0 auto', lineHeight: 1.75, fontSize: '1rem' }}>From the moment a ticket arrives to the moment it closes, the model works quietly in the background.</p>
            </div>
          </Reveal>
          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.4rem' }}>
            {FEATURES.map(function (f, i) {
              return (
                <Reveal key={f.n} delay={i * 80}>
                  <div className="feat-card" onMouseMove={function (e) {
                    var rect = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%')
                    e.currentTarget.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%')
                  }}>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', color: '#3A3F52', letterSpacing: '0.06em', marginBottom: '1.3rem', position: 'relative' }}>{f.n}</div>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(232,69,10,0.12)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', position: 'relative' }}><Icon name={f.icon} size={22} /></div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.1rem', fontWeight: 600, color: '#F1F3F8', marginBottom: '0.6rem', position: 'relative' }}>{f.title}</div>
                    <p style={{ fontSize: '0.88rem', color: '#8A93A6', lineHeight: 1.75, position: 'relative' }}>{f.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" style={{ padding: '7.5rem 6%', background: 'rgba(255,255,255,0.015)', position: 'relative' }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
              <div className="badge-pill" style={{ marginBottom: '1.4rem' }}>The Process</div>
              <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 'clamp(1.9rem,3.8vw,2.7rem)', color: '#F1F3F8', letterSpacing: '-0.015em' }}>From problem to resolved, quietly</h2>
            </div>
          </Reveal>
          <div className="steps-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2.2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg,transparent,#E8450A55,#7C6FEE55,#05966955,transparent)' }} />
            {STEPS.map(function (s, i) {
              return (
                <Reveal key={s.n} delay={i * 100}>
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div className="step-num">{s.n}</div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1rem', fontWeight: 600, color: '#F1F3F8', marginBottom: '0.55rem' }}>{s.t}</div>
                    <p style={{ fontSize: '0.85rem', color: '#8A93A6', lineHeight: 1.7 }}>{s.d}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= AI ENGINE ================= */}
      <section id="ai" style={{ padding: '7.5rem 6%', position: 'relative' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="ai-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5.5rem', alignItems: 'center' }}>
            <Reveal>
              <div>
                <div className="badge-pill" style={{ marginBottom: '1.5rem' }}>AI Engine</div>
                <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem,3vw,2.3rem)', color: '#F1F3F8', letterSpacing: '-0.015em', marginBottom: '1.2rem', lineHeight: 1.25 }}>It learns from every ticket you close</h2>
                <p style={{ color: '#8A93A6', lineHeight: 1.85, marginBottom: '2rem', fontSize: '1rem' }}>TF-IDF vectorisation paired with logistic regression, trained on your own data. Rule-based from day one, fully learned after twenty resolved tickets - and it keeps improving from there.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[['target', 'Under 100ms', 'Category, priority, SLA and tags - set instantly'], ['refresh', 'Retrains on demand', 'A single click refines the model on resolved tickets'], ['repeat', 'Pattern detection', 'Spots recurring issues across departments'], ['file-text', 'Report generation', 'Full reports, by person, team and period']].map(function (item) {
                    var ic = item[0], t = item[1], d = item[2]
                    return (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.1rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)' }}
                        onMouseOver={function (e) { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                        onMouseOut={function (e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateX(0)' }}
                      >
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(232,69,10,0.12)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={19} /></div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.1rem' }}>{t}</div>
                          <div style={{ fontSize: '0.8rem', color: '#8A93A6' }}>{d}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div>
                <img src="/images/ai-engine.png" alt="AI data visualization" style={{ width: '100%', height: 190, objectFit: 'cover', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.2rem', display: 'block', boxShadow: '0 20px 50px -18px rgba(0,0,0,0.6)' }} />
                <div className="glass-card" style={{ borderRadius: 26, padding: '2rem', boxShadow: '0 30px 80px -24px rgba(0,0,0,0.6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.4rem', paddingBottom: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#E8450A', animation: 'ping 1.5s ease-out infinite', opacity: 0.3 }} />
                      <div style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F1F3F8' }}>Live classification output</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#F97316', background: 'rgba(232,69,10,0.12)', padding: '0.18rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>ACTIVE</span>
                  </div>
                  {[['Ticket ID', '#TKT-2026-00041', true, '#F1F3F8', null], ['Category', 'Technical', false, '#B4ACF9', 'laptop'], ['Priority', 'Critical', false, '#F97316', 'alert'], ['SLA deadline', '4 hours', false, '#FBBF24', null], ['Confidence', '93%', false, '#34D399', null], ['Auto-assigned', 'IT Support Team', false, '#34D399', null]].map(function (row) {
                    var k = row[0], v = row[1], mono = row[2], c = row[3], ic = row[4]
                    return (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem' }}>
                        <span style={{ color: '#5C6478', fontWeight: 500 }}>{k}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: c, fontFamily: mono ? 'JetBrains Mono,monospace' : 'inherit', fontSize: mono ? '0.78rem' : '0.88rem' }}>{ic && <Icon name={ic} size={13} />}{v}</span>
                      </div>
                    )
                  })}
                  <div style={{ marginTop: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.45rem' }}>
                      <span style={{ color: '#5C6478', fontWeight: 500 }}>Model confidence</span>
                      <span style={{ color: '#F97316', fontWeight: 700 }}>{confW}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg,#E8450A,#F97316)', width: confW + '%', transition: 'width 2.5s 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['vpn', 'network', 'remote', 'urgent', 'production'].map(function (t) {
                      return <span key={t} style={{ background: 'rgba(232,69,10,0.1)', color: '#FDBA74', padding: '0.22rem 0.65rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600, border: '1px solid rgba(232,69,10,0.25)' }}>{t}</span>
                    })}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= PORTALS ================= */}
      <section id="portals" style={{ padding: '7.5rem 6%', background: 'rgba(255,255,255,0.015)', position: 'relative' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Reveal>
            <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: '3.5rem', height: 260 }}>
              <img src="/images/portals-team.png" alt="AEGIS team collaboration" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,7,13,0.3) 0%,rgba(5,7,13,0.92) 90%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'center', padding: '0 2rem 2rem' }}>
                <div className="badge-pill" style={{ marginBottom: '1.1rem' }}>Three Portals</div>
                <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 'clamp(1.7rem,3.4vw,2.4rem)', color: '#F1F3F8', letterSpacing: '-0.015em', marginBottom: '0.75rem' }}>Built for everyone in the room</h2>
                <p style={{ color: '#B0B8C8', maxWidth: 460, lineHeight: 1.7, fontSize: '0.95rem' }}>Each role receives a purpose-built experience with exactly the tools it needs.</p>
              </div>
            </div>
          </Reveal>
          <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.4rem' }}>
            {[
              { topColor: '#0EA5E9', badgeColor: '#7DD3FC', badgeBg: 'rgba(14,165,233,0.12)', badge: 'Client Portal', title: 'Submit and track your issues', items: ['Submit in plain language', 'Real-time status tracking', 'Comment on tickets', 'Instant notifications', 'Full ticket history', 'Download your reports'], link: '/register', cta: 'Get started' },
              { topColor: '#7C6FEE', badgeColor: '#C4B8FB', badgeBg: 'rgba(124,111,238,0.12)', badge: 'Staff Portal', title: 'Manage your assigned queue', items: ['View assigned tickets', 'Internal notes, hidden', 'Update status and priority', 'SLA deadline tracking', 'Personal performance stats', 'Generate team reports'], link: '/login', cta: 'Sign in' },
              { topColor: '#E8450A', badgeColor: '#FDBA74', badgeBg: 'rgba(232,69,10,0.12)', badge: 'Admin Portal', title: 'Full control and visibility', items: ['Live analytics dashboard', 'User and staff management', 'Every ticket, every team', 'AI model retraining', 'Full audit trail and logs', 'Download all reports'], link: '/login', cta: 'Access portal' },
            ].map(function (r, i) {
              return (
                <Reveal key={r.badge} delay={i * 100}>
                  <div className="role-card">
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: r.topColor }} />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, padding: '0.28rem 0.8rem', borderRadius: 100, marginBottom: '1.4rem', background: r.badgeBg, color: r.badgeColor }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.topColor }} />
                      {r.badge}
                    </div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.2rem', fontWeight: 600, color: '#F1F3F8', marginBottom: '1.2rem', lineHeight: 1.3 }}>{r.title}</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                      {r.items.map(function (item) {
                        return (
                          <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.87rem', color: '#B0B8C8' }}>
                            <div style={{ width: 19, height: 19, borderRadius: '50%', background: r.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: r.topColor }}>
                              <Icon name="check-circle" size={12} strokeWidth={2.2} />
                            </div>
                            {item}
                          </li>
                        )
                      })}
                    </ul>
                    <Link to={r.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 700, color: r.topColor, transition: 'gap 0.3s' }}
                      onMouseOver={function (e) { e.currentTarget.style.gap = '0.75rem' }}
                      onMouseOut={function (e) { e.currentTarget.style.gap = '0.45rem' }}
                    >{r.cta} &rarr;</Link>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL ================= */}
      <div style={{ padding: '6.5rem 6%', textAlign: 'center', position: 'relative' }}>
        <Reveal>
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginBottom: '2rem' }}>
              {[1, 2, 3, 4, 5].map(function (i) { return <span key={i} style={{ color: '#F97316', fontSize: '1.2rem' }}>&#9733;</span> })}
            </div>
            <p style={{ fontFamily: 'Sora,sans-serif', fontWeight: 500, fontSize: 'clamp(1.25rem,2.5vw,1.55rem)', lineHeight: 1.6, color: '#F1F3F8', marginBottom: '2.2rem' }}>
              &ldquo;AEGIS changed how A.E.G handles internal issues. What once took hours now resolves in minutes - the routing alone saves our team half a day every week.&rdquo;
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.9rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#E8450A,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora,sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>AD</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F1F3F8' }}>Administrative Director</div>
                <div style={{ fontSize: '0.82rem', color: '#8A93A6' }}>Adaptive Engineering Group Ltd, Kamembe</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ================= CTA ================= */}
      <section style={{ padding: '8rem 6%', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/cta-corridor.png)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,7,13,0.88) 0%,rgba(5,7,13,0.96) 100%)', zIndex: 0 }} />
        <Reveal>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="badge-pill" style={{ marginBottom: '1.8rem' }}>Ready to begin?</div>
            <h2 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,5vw,3.4rem)', color: '#F1F3F8', letterSpacing: '-0.02em', marginBottom: '1.4rem', lineHeight: 1.15 }}>
              Stop managing issues<br />
              <span style={{ background: 'linear-gradient(90deg,#F97316,#E8450A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>by hand.</span>
            </h2>
            <p style={{ fontSize: '1.02rem', color: '#8A93A6', maxWidth: 440, margin: '0 auto 2.8rem', lineHeight: 1.8 }}>Join the teams at Adaptive Engineering Group already resolving issues faster, and with far less friction.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
              <Link to="/register"><button className="btn-primary">Create your account &rarr;</button></Link>
              <Link to="/login"><button className="btn-secondary">Sign in to dashboard</button></Link>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#5C6478' }}>Free to use &middot; No credit card &middot; Live in under two minutes</div>
          </div>
        </Reveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 6% 2.2rem' }}>
        <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3.2rem', marginBottom: '3.2rem', paddingBottom: '2.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <img src="/aeg_logo.png" alt="AEG" style={{ height: 66, width: 'auto', objectFit: 'contain', marginBottom: '1.1rem', display: 'block' }} />
            <p style={{ fontSize: '0.86rem', color: '#5C6478', lineHeight: 1.75, maxWidth: 270, marginBottom: '1.6rem' }}>AI-powered issue management for Adaptive Engineering Group Ltd. Classify, route, and resolve, faster.</p>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {[['mail', 'Email'], ['phone', 'Phone'], ['globe', 'Website']].map(function (pair) {
                var ic = pair[0], label = pair[1]
                return (
                  <div key={ic} className="social-icon" title={label} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0B8C8', cursor: 'pointer' }}>
                    <Icon name={ic} size={15} />
                  </div>
                )
              })}
            </div>
          </div>
          {[
            { h: 'Product', links: [['#features', 'Features'], ['#how', 'How it works'], ['#ai', 'AI Engine'], ['#portals', 'Portals']] },
            { h: 'Access', links: [['/register', 'Register'], ['/login', 'Sign in'], ['/knowledge-base', 'Knowledge Base']] },
            { h: 'A.E.G Ltd', links: [['#', 'Rusizi, Kamembe'], ['#', 'Rwanda'], ['#', 'Privacy policy'], ['#', 'Terms of service']] },
          ].map(function (col) {
            return (
              <div key={col.h}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '1.1rem', letterSpacing: '0.02em' }}>{col.h}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {col.links.map(function (pair) {
                    var href = pair[0], label = pair[1]
                    var isInternal = href.charAt(0) === '/'
                    if (isInternal) {
                      return <li key={label}><Link to={href} style={{ fontSize: '0.84rem', color: '#5C6478', transition: 'color 0.25s', fontWeight: 500 }} onMouseOver={function (e) { e.target.style.color = '#B0B8C8' }} onMouseOut={function (e) { e.target.style.color = '#5C6478' }}>{label}</Link></li>
                    }
                    return <li key={label}><a href={href} style={{ fontSize: '0.84rem', color: '#5C6478', transition: 'color 0.25s', fontWeight: 500 }} onMouseOver={function (e) { e.target.style.color = '#B0B8C8' }} onMouseOut={function (e) { e.target.style.color = '#5C6478' }}>{label}</a></li>
                  })}
                </ul>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#5C6478', fontWeight: 500 }}>&copy; 2026 Adaptive Engineering Group Ltd &middot; Kamembe, Rwanda &middot; All rights reserved</div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {['v1.0.0', 'AI-Powered', 'Built with AUCA'].map(function (b) {
              return <span key={b} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#5C6478', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.22rem 0.65rem', borderRadius: 5 }}>{b}</span>
            })}
          </div>
        </div>
      </footer>
    </>
  )
}


