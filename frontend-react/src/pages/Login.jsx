import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/api'
import useAuthStore from '../stores/authStore'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'brain') return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9.5 12 1.8 1.8L15 10" /></svg>
  if (name === 'cpu') return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  if (name === 'eye-off') return <svg {...common}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.9 17.9 0 0 1-3.4 4.3" /><path d="M6.7 6.7C4 8.5 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.5-.7" /><path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'phone') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'globe') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" /></svg>
  return null
}

export default function Login() {
  var emailArr = useState('')
  var email = emailArr[0]
  var setEmail = emailArr[1]
  var passArr = useState('')
  var password = passArr[0]
  var setPassword = passArr[1]
  var showPassArr = useState(false)
  var showPass = showPassArr[0]
  var setShowPass = showPassArr[1]
  var loadingArr = useState(false)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var errorArr = useState('')
  var error = errorArr[0]
  var setError = errorArr[1]
  var rememberArr = useState(true)
  var remember = rememberArr[0]
  var setRemember = rememberArr[1]
  var authStore = useAuthStore()
  var login = authStore.login
  var navigate = useNavigate()

  var handleSubmit = function (e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    auth.login(email, password).then(function (data) {
      if (data) {
        login(data.user, data.access_token)
        if (data.user.role === 'admin') navigate('/admin')
        else if (data.user.role === 'staff') navigate('/staff')
        else navigate('/client')
      }
    }).catch(function (err) {
      setError(err.message || 'Invalid email or password')
    }).finally(function () {
      setLoading(false)
    })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n    body { background: #05070D; color: #E7E9F2; font-family: 'Inter', sans-serif; }\n    a { text-decoration: none; color: inherit; }\n    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }\n    @keyframes ping   { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.2);opacity:0} }\n    @keyframes spin   { to{transform:rotate(360deg)} }\n    .inp {\n      width:100%; padding:0.85rem 1rem 0.85rem 2.85rem;\n      background:rgba(255,255,255,0.03); border:1.5px solid rgba(255,255,255,0.1);\n      border-radius:10px; color:#F1F3F8;\n      font-size:0.9rem; font-family:'Inter',sans-serif; outline:none;\n      transition:all 0.2s;\n    }\n    .inp:focus { border-color:#F97316; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .inp::placeholder { color:#5C6478; }\n    .inp-pass { padding-right:3rem; }\n    .submit-btn {\n      width:100%; padding:0.95rem;\n      background:linear-gradient(135deg,#E8450A,#F97316); color:#fff;\n      font-family:'Sora',sans-serif;\n      font-size:0.95rem; font-weight:700;\n      border:none; border-radius:10px;\n      cursor:pointer; transition:all 0.2s;\n      box-shadow:0 4px 20px -4px rgba(232,69,10,0.5);\n    }\n    .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px -4px rgba(232,69,10,0.6); }\n    .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }\n    .chk { width:16px; height:16px; border-radius:5px; border:1.5px solid rgba(255,255,255,0.2); cursor:pointer; accent-color:#F97316; }\n    .eye-btn { transition: color 0.2s; }\n    @media(max-width:768px){\n      .login-left { display:none !important; }\n      .login-right { padding:2rem 1.5rem !important; }\n    }\n  "

  var features = [
    { icon: 'brain', label: 'AI classifies your ticket instantly' },
    { icon: 'zap', label: 'Real-time status updates and notifications' },
    { icon: 'file-text', label: 'Generate and download reports anytime' },
    { icon: 'shield', label: 'Role-based access - Client, Staff, Admin' },
  ]

  return (
    <>
      <style>{css}</style>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 5%', background: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/aeg_logo.png" alt="AEG" style={{ height: 46, width: 'auto', objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: '#8A93A6', fontWeight: 500, padding: '0.45rem 0.85rem', borderRadius: 8, fontFamily: 'Sora,sans-serif' }}>&larr; Home</Link>
          <Link to="/register"><button style={{ padding: '0.5rem 1.15rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 100, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>Register</button></Link>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#05070D', paddingTop: '64px' }}>

        {/* LEFT PANEL */}
        <div className="login-left" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2.5rem' }}>
          <img src="/images/login-hero.png" alt="AEGIS support engineer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,7,13,0.2) 0%,rgba(5,7,13,0.85) 75%,rgba(5,7,13,0.97) 100%)', zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 100, padding: '0.3rem 0.85rem 0.3rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, color: '#B4ACF9', marginBottom: '1.75rem' }}>
              <div style={{ position: 'relative', width: 16, height: 16 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#7C6FEE', animation: 'ping 1.8s ease-out infinite', opacity: 0.4 }} />
                <div style={{ position: 'absolute', inset: '25%', borderRadius: '50%', background: '#B4ACF9' }} />
              </div>
              AI-Powered Issue Management
            </div>

            <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: 'clamp(1.7rem,3vw,2.4rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '0.85rem', color: '#F1F3F8' }}>
              Welcome back.<br />
              <span style={{ background: 'linear-gradient(90deg,#F97316,#E8450A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Let's get to work.</span>
            </h2>
            <p style={{ color: '#B0B8C8', fontSize: '0.93rem', lineHeight: 1.75, maxWidth: 400, marginBottom: '1.75rem' }}>
              Your tickets are classified, prioritized, and routed by AI - the right team gets to work before you even finish submitting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {features.map(function (f) {
                return (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, backdropFilter: 'blur(8px)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(232,69,10,0.15)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={f.icon} size={15} /></div>
                    <span style={{ fontSize: '0.83rem', color: '#D6DCE8', fontWeight: 500 }}>{f.label}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#5C6478', fontWeight: 500 }}>
              &copy; 2026 Adaptive Engineering Group Ltd &middot; Kamembe, Rwanda
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.1),transparent 70%)', top: '10%', right: '-10%', filter: 'blur(20px)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>

            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: '#F1F3F8' }}>Sign in</h1>
              <p style={{ color: '#8A93A6', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                Enter your credentials to access your dashboard
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(232,69,10,0.1)', border: '1.5px solid rgba(232,69,10,0.3)', color: '#FDBA74', padding: '0.85rem 1rem', borderRadius: 10, fontSize: '0.84rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Icon name="alert" size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="mail" size={16} /></span>
                  <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} placeholder="you@aegis.rw" required className="inp" />
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="lock" size={16} /></span>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={function (e) { setPassword(e.target.value) }} placeholder="Enter your password" required className="inp inp-pass" />
                  <button type="button" onClick={function () { setShowPass(!showPass) }} className="eye-btn" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5C6478', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <Icon name={showPass ? 'eye-off' : 'eye'} size={17} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#B0B8C8', fontWeight: 500, cursor: 'pointer' }}>
                  <input type="checkbox" checked={remember} onChange={function (e) { setRemember(e.target.checked) }} className="chk" />
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#F97316', fontWeight: 600 }}>Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in \u2192'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.75rem', color: '#5C6478', whiteSpace: 'nowrap', fontWeight: 500 }}>New to AEGIS?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <Link to="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, color: '#E7E9F2' }}>
              Create a client account &rarr;
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#4ADE80' }}>
              <Icon name="check-circle" size={15} />
              <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
      {/* ================= FOOTER ================= */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 6% 2.2rem' }}>
        <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3.2rem', marginBottom: '3.2rem', paddingBottom: '2.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <img src="/aeg_logo.png" alt="AEG" style={{ height: 42, width: 'auto', objectFit: 'contain', marginBottom: '1.1rem', display: 'block' }} />
            <p style={{ fontSize: '0.86rem', color: '#5C6478', lineHeight: 1.75, maxWidth: 270, marginBottom: '1.6rem' }}>AI-powered issue management for Adaptive Engineering Group Ltd. Classify, route, and resolve, faster.</p>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {[['mail', 'Email'], ['phone', 'Phone'], ['globe', 'Website']].map(function (pair) {
                var ic = pair[0], label = pair[1]
                return (
                  <div key={ic} title={label} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0B8C8', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}
                    onMouseOver={function (e) { e.currentTarget.style.background = 'linear-gradient(135deg,#E8450A,#F97316)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(232,69,10,0.5)' }}
                    onMouseOut={function (e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#B0B8C8'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
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
                      return <li key={label}><Link to={href} style={{ fontSize: '0.84rem', color: '#5C6478', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} onMouseOver={function (e) { e.currentTarget.style.color = '#F97316'; e.currentTarget.style.gap = '0.5rem' }} onMouseOut={function (e) { e.currentTarget.style.color = '#5C6478'; e.currentTarget.style.gap = '0.3rem' }}>{label}</Link></li>
                    }
                    return <li key={label}><a href={href} style={{ fontSize: '0.84rem', color: '#5C6478', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} onMouseOver={function (e) { e.currentTarget.style.color = '#F97316'; e.currentTarget.style.gap = '0.5rem' }} onMouseOut={function (e) { e.currentTarget.style.color = '#5C6478'; e.currentTarget.style.gap = '0.3rem' }}>{label}</a></li>
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



