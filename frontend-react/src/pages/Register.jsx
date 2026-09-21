import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'rocket') return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
  if (name === 'brain') return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
  if (name === 'map-pin') return <svg {...common}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.4" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'building') return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 8h4v13h-4M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" /></svg>
  if (name === 'phone') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  if (name === 'eye-off') return <svg {...common}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.9 17.9 0 0 1-3.4 4.3" /><path d="M6.7 6.7C4 8.5 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.5-.7" /><path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" /></svg>
  if (name === 'check') return <svg {...common}><path d="M4 12.5 9 18l11-13" /></svg>
  if (name === 'mail-footer') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'phone-footer') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'globe-footer') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" /></svg>
  if (name === 'mail-footer') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'globe') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" /></svg>
  return null
}

export default function Register() {
  var formArr = useState({ full_name: '', email: '', password: '', confirmPassword: '', department: '', phone: '' })
  var form = formArr[0]
  var setForm = formArr[1]
  var showPassArr = useState(false)
  var showPass = showPassArr[0]
  var setShowPass = showPassArr[1]
  var showConfirmArr = useState(false)
  var showConfirm = showConfirmArr[0]
  var setShowConfirm = showConfirmArr[1]
  var loadingArr = useState(false)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var errorArr = useState('')
  var error = errorArr[0]
  var setError = errorArr[1]
  var successArr = useState(false)
  var success = successArr[0]
  var setSuccess = successArr[1]
  var navigate = useNavigate()

  var strength = function (p) {
    var s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  var s = strength(form.password)
  var sColors = ['', '#F87171', '#FBBF24', '#34D399', '#34D399']
  var sLabels = ['', 'Weak', 'Fair', 'Strong', 'Very strong']

  var handleSubmit = function (e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    auth.register({ full_name: form.full_name, email: form.email, password: form.password, role: 'client', department: form.department || null, phone: form.phone || null }).then(function () {
      setSuccess(true)
    }).catch(function (err) {
      setError(err.message || 'Registration failed')
    }).finally(function () {
      setLoading(false)
    })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    body{background:#05070D;color:#E7E9F2;font-family:'Inter',sans-serif}\n    a{text-decoration:none;color:inherit}\n    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}\n    @keyframes ping{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2.2);opacity:0}}\n    @keyframes spin{to{transform:rotate(360deg)}}\n    @keyframes checkPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}\n    .inp{width:100%;padding:0.85rem 1rem 0.85rem 2.85rem;background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;color:#F1F3F8;font-size:0.9rem;font-family:'Inter',sans-serif;outline:none;transition:all 0.2s}\n    .inp:focus{border-color:#F97316;box-shadow:0 0 0 3px rgba(249,115,22,0.15)}\n    .inp::placeholder{color:#5C6478}\n    .inp-sm{padding-left:1rem}\n    .inp-r{padding-right:3rem}\n    .submit-btn{width:100%;padding:0.95rem;background:linear-gradient(135deg,#E8450A,#F97316);color:#fff;font-family:'Sora',sans-serif;font-size:0.95rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px -4px rgba(232,69,10,0.5)}\n    .submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px -4px rgba(232,69,10,0.6)}\n    .submit-btn:disabled{opacity:0.6;cursor:not-allowed}\n    .eye-btn{transition:color 0.2s}\n    @media(max-width:768px){.reg-left{display:none!important}.reg-right{padding:2rem 1.5rem!important}}\n  "

  var TopNav = function () {
    return (
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 5%', background: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/aeg_logo.png" alt="AEG" style={{ height: 46, width: 'auto', objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: '#8A93A6', fontWeight: 500, padding: '0.45rem 0.85rem', borderRadius: 8, fontFamily: 'Sora,sans-serif' }}>&larr; Home</Link>
          <Link to="/login"><button style={{ padding: '0.5rem 1.15rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 100, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>Sign in</button></Link>
        </div>
      </nav>
    )
  }

  if (success) return (
    <>
      <style>{css}</style>
      <TopNav />
      <div style={{ minHeight: '100vh', background: '#05070D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.15),transparent 70%)', top: '20%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
        <div style={{ textAlign: 'center', maxWidth: 480, animation: 'fadeUp 0.6s ease both', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(232,69,10,0.12)', border: '2px solid rgba(249,115,22,0.35)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', animation: 'checkPop 0.5s 0.2s ease both', opacity: 0 }}><Icon name="check-circle" size={40} strokeWidth={1.6} /></div>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem', color: '#F1F3F8' }}>Account created!</h2>
          <p style={{ color: '#8A93A6', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Welcome to AEG, <strong style={{ color: '#F1F3F8' }}>{form.full_name.split(' ')[0]}</strong>! Your client account is ready. Submit and track your tickets in real time.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left' }}>
            {[['rocket', 'Submit your first ticket', 'Describe your issue in plain language'], ['brain', 'AI classifies instantly', 'Category, priority and SLA set automatically'], ['map-pin', 'Track to resolution', 'Real-time updates the whole way']].map(function (item) {
              var ic = item[0], t = item[1], d = item[2]
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(232,69,10,0.15)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={15} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8' }}>{t}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8A93A6' }}>{d}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={function () { navigate('/login') }} className="submit-btn">Sign in to get started &rarr;</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{css}</style>
      <TopNav />
      <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#05070D', paddingTop: '64px' }}>

        {/* LEFT */}
        <div className="reg-left" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem' }}>
          <img src="/images/register-hero.png" alt="Join AEGIS" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,7,13,0.3) 0%,rgba(5,7,13,0.88) 70%,rgba(5,7,13,0.97) 100%)', zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(5,7,13,0.85) 0%,rgba(5,7,13,0.45) 55%,transparent 90%)', zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 80% 80% at 20% 50%,black,transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,111,238,0.15),transparent 70%)', top: '-80px', right: '-80px', pointerEvents: 'none', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.14),transparent 70%)', bottom: '-60px', left: '-60px', pointerEvents: 'none', filter: 'blur(30px)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 100, padding: '0.3rem 0.85rem 0.3rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, color: '#B4ACF9', marginBottom: '1.75rem' }}>
              <div style={{ position: 'relative', width: 16, height: 16 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#7C6FEE', animation: 'ping 1.8s ease-out infinite', opacity: 0.4 }} />
                <div style={{ position: 'absolute', inset: '25%', borderRadius: '50%', background: '#B4ACF9' }} />
              </div>
              Client Portal Registration
            </div>

            <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: 'clamp(1.7rem,3vw,2.4rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '0.85rem', color: '#F1F3F8', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              Start resolving issues<br />
              <span style={{ background: 'linear-gradient(90deg,#F97316,#E8450A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>the smart way.</span>
            </h2>
            <p style={{ color: '#D6DCE8', fontSize: '0.93rem', lineHeight: 1.75, maxWidth: 380, marginBottom: '2rem', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              Create your account in under 2 minutes. AI handles classification, routing, and SLA tracking - automatically.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { n: '1', t: 'Create your account', s: 'Takes less than 2 minutes', c: '#F97316' },
                { n: '2', t: 'Submit your first ticket', s: 'Describe your issue in plain language', c: '#FB923C' },
                { n: '3', t: 'AI classifies instantly', s: 'Category, priority and SLA set automatically', c: '#B4ACF9' },
                { n: '4', t: 'Track to resolution', s: 'Real-time updates until your issue is closed', c: '#34D399' },
              ].map(function (st, i) {
                return (
                  <div key={st.n} style={{ display: 'flex', gap: '1rem', paddingBottom: i < 3 ? '1.1rem' : 0, position: 'relative' }}>
                    {i < 3 && <div style={{ position: 'absolute', left: 13, top: 28, bottom: 0, width: 1, background: 'rgba(255,255,255,0.08)' }} />}
                    <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: st.c + '22', border: '1.5px solid ' + st.c + '55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: st.c, position: 'relative', zIndex: 1 }}>{st.n}</div>
                    <div style={{ paddingTop: '0.1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.1rem' }}>{st.t}</div>
                      <div style={{ fontSize: '0.78rem', color: '#8A93A6' }}>{st.s}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {[['1,240+', 'Tickets resolved'], ['94%', 'AI accuracy'], ['< 2min', 'To get started']].map(function (pair) {
                var v = pair[0], l = pair[1]
                return (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem 1rem', flex: 1, minWidth: 90 }}>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#F97316', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: '0.7rem', color: '#5C6478', marginTop: '0.2rem', fontWeight: 500 }}>{l}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="reg-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 2.5rem', overflowY: 'auto', position: 'relative' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.08),transparent 70%)', top: '10%', right: '-10%', filter: 'blur(20px)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>

            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem', color: '#F1F3F8' }}>Create account</h1>
              <p style={{ color: '#8A93A6', fontSize: '0.88rem', lineHeight: 1.6, fontWeight: 500 }}>Client accounts only - staff accounts are created by your admin</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(232,69,10,0.1)', border: '1.5px solid rgba(232,69,10,0.3)', color: '#FDBA74', padding: '0.85rem 1rem', borderRadius: 10, fontSize: '0.84rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Icon name="alert" size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.45rem' }}>Full name *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="user" size={15} /></span>
                    <input type="text" value={form.full_name} required onChange={function (e) { setForm(Object.assign({}, form, { full_name: e.target.value })) }} placeholder="Jean Pierre Habimana" className="inp" />
                  </div>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.45rem' }}>Email address *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="mail" size={15} /></span>
                    <input type="email" value={form.email} required onChange={function (e) { setForm(Object.assign({}, form, { email: e.target.value })) }} placeholder="you@aegis.rw" className="inp" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.45rem' }}>Department</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="building" size={15} /></span>
                    <input type="text" value={form.department} onChange={function (e) { setForm(Object.assign({}, form, { department: e.target.value })) }} placeholder="Engineering" className="inp" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.45rem' }}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="phone" size={15} /></span>
                    <input type="tel" value={form.phone} onChange={function (e) { setForm(Object.assign({}, form, { phone: e.target.value })) }} placeholder="+250 7XX XXX XXX" className="inp" />
                  </div>
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.45rem' }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="lock" size={15} /></span>
                    <input type={showPass ? 'text' : 'password'} value={form.password} required onChange={function (e) { setForm(Object.assign({}, form, { password: e.target.value })) }} placeholder="Min. 8 characters" className="inp inp-r" />
                    <button type="button" onClick={function () { setShowPass(!showPass) }} className="eye-btn" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5C6478', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <Icon name={showPass ? 'eye-off' : 'eye'} size={16} />
                    </button>
                  </div>
                  {form.password && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: 3, marginBottom: '0.3rem' }}>
                        {[1, 2, 3, 4].map(function (i) {
                          return <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i <= s ? sColors[s] : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                        })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: sColors[s], fontWeight: 600 }}>{sLabels[s]}</div>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.45rem' }}>Confirm password *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="lock" size={15} /></span>
                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} required onChange={function (e) { setForm(Object.assign({}, form, { confirmPassword: e.target.value })) }} placeholder="Repeat your password" className="inp inp-r"
                      style={{ borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#F87171' : undefined }}
                    />
                    <button type="button" onClick={function () { setShowConfirm(!showConfirm) }} className="eye-btn" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5C6478', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <Icon name={showConfirm ? 'eye-off' : 'eye'} size={16} />
                    </button>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#F87171', marginTop: '0.3rem', fontWeight: 500 }}><Icon name="alert" size={12} /> Passwords do not match</div>
                  )}
                  {form.confirmPassword && form.confirmPassword === form.password && form.password.length >= 8 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#34D399', marginTop: '0.3rem', fontWeight: 600 }}><Icon name="check" size={12} /> Passwords match</div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '1.25rem' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Creating your account...
                  </span>
                ) : 'Create account \u2192'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.75rem', color: '#5C6478', whiteSpace: 'nowrap', fontWeight: 500 }}>Already registered?</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, color: '#E7E9F2' }}>
              Sign in to your account &rarr;
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.1rem', padding: '0.7rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#4ADE80' }}>
              <Icon name="lock" size={14} />
              <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 6% 2.2rem' }}>
        <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3.2rem', marginBottom: '3.2rem', paddingBottom: '2.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <img src="/aeg_logo.png" alt="AEG" style={{ height: 42, width: 'auto', objectFit: 'contain', marginBottom: '1.1rem', display: 'block' }} />
            <p style={{ fontSize: '0.86rem', color: '#5C6478', lineHeight: 1.75, maxWidth: 270, marginBottom: '1.6rem' }}>AI-powered issue management for Adaptive Engineering Group Ltd. Classify, route, and resolve, faster.</p>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {[['mail-footer', 'Email'], ['phone-footer', 'Phone'], ['globe-footer', 'Website']].map(function (pair) {
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
            { h: 'Product', links: [['/', 'Home'], ['/login', 'Sign in'], ['/register', 'Register'], ['/knowledge-base', 'Knowledge Base']] },
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
        </div>
      </footer>

    </>
  )
}


