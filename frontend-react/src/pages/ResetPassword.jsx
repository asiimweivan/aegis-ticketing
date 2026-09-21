import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 20
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'lock') return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
  if (name === 'key') return <svg {...common}><circle cx="8" cy="14.5" r="4" /><path d="m10.8 11.7 8.7-8.7M17 6l2 2M14.5 8.5l1.5 1.5" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  if (name === 'eye-off') return <svg {...common}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.9 17.9 0 0 1-3.4 4.3" /><path d="M6.7 6.7C4 8.5 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.5-.7" /><path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'check') return <svg {...common}><path d="M4 12.5 9 18l11-13" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'mail-footer') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'phone-footer') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'globe-footer') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" /></svg>
  return null
}

export default function ResetPassword() {
  var navigate = useNavigate()
  var location = useLocation()
  var state = location.state || {}
  var email = state.email
  var code = state.code

  var passwordArr = useState('')
  var password = passwordArr[0]
  var setPassword = passwordArr[1]
  var confirmPasswordArr = useState('')
  var confirmPassword = confirmPasswordArr[0]
  var setConfirmPassword = confirmPasswordArr[1]
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

  var strength = function (p) {
    var s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  var s = strength(password)
  var sColors = ['', '#F87171', '#FBBF24', '#34D399', '#34D399']
  var sLabels = ['', 'Weak', 'Fair', 'Strong', 'Very strong']

  if (!email || !code) {
    return (
      <div style={{ minHeight: '100vh', background: '#05070D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter,sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ color: '#F87171', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="alert" size={40} strokeWidth={1.5} /></div>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.2rem', fontWeight: 800, color: '#F1F3F8', marginBottom: '0.5rem' }}>Session expired</h2>
          <p style={{ color: '#8A93A6', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Please restart the password reset process.</p>
          <Link to="/forgot-password" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 100, fontWeight: 700, fontSize: '0.88rem', fontFamily: 'Sora,sans-serif' }}>Start over &rarr;</Link>
        </div>
      </div>
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    auth.resetPassword(email, code, password).then(function () {
      setSuccess(true)
      setTimeout(function () { navigate('/login') }, 2500)
    }).catch(function (err) {
      setError(err.message || 'Could not reset password. The code may have expired.')
    }).finally(function () { setLoading(false) })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    body{background:#05070D;color:#E7E9F2;font-family:'Inter',sans-serif}\n    a{text-decoration:none;color:inherit}\n    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}\n    @keyframes spin{to{transform:rotate(360deg)}}\n    @keyframes checkPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}\n    .inp{width:100%;padding:0.85rem 1rem 0.85rem 2.85rem;background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;color:#F1F3F8;font-size:0.9rem;font-family:'Inter',sans-serif;outline:none;transition:all 0.2s}\n    .inp:focus{border-color:#F97316;box-shadow:0 0 0 3px rgba(249,115,22,0.15)}\n    .inp::placeholder{color:#5C6478}\n    .inp-r{padding-right:3rem}\n    .submit-btn{width:100%;padding:0.95rem;background:linear-gradient(135deg,#E8450A,#F97316);color:#fff;font-family:'Sora',sans-serif;font-size:0.95rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px -4px rgba(232,69,10,0.5)}\n    .submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px -4px rgba(232,69,10,0.6)}\n    .submit-btn:disabled{opacity:0.6;cursor:not-allowed}\n    .eye-btn{transition:color 0.2s}\n  "

  if (success) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: '100vh', background: '#05070D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,0.15),transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ textAlign: 'center', maxWidth: 420, animation: 'fadeUp 0.5s ease both', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '2px solid rgba(52,211,153,0.35)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', animation: 'checkPop 0.5s 0.15s ease both', opacity: 0 }}><Icon name="check-circle" size={36} strokeWidth={1.6} /></div>
            <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#F1F3F8', marginBottom: '0.6rem' }}>Password reset!</h2>
            <p style={{ color: '#8A93A6', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>Your password has been changed successfully.</p>
            <p style={{ color: '#5C6478', fontSize: '0.82rem' }}>Redirecting you to sign in...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: '#05070D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 70% 65% at 50% 30%,black 20%,transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.14),transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,111,238,0.12),transparent 70%)', top: '-100px', right: '-100px', pointerEvents: 'none', filter: 'blur(40px)' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <img src="/aeg_logo.png" alt="AEG" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
          </Link>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2.25rem' }}>

            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(232,69,10,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}><Icon name="lock" size={22} /></div>
            <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#F1F3F8' }}>Create new password</h1>
            <p style={{ color: '#8A93A6', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              Choose a strong password for <strong style={{ color: '#F1F3F8' }}>{email}</strong>
            </p>

            {error && (
              <div style={{ background: 'rgba(232,69,10,0.1)', border: '1.5px solid rgba(232,69,10,0.3)', color: '#FDBA74', padding: '0.8rem 1rem', borderRadius: 10, fontSize: '0.83rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Icon name="alert" size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.5rem' }}>New password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', display: 'flex' }}><Icon name="key" size={16} /></span>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={function (e) { setPassword(e.target.value) }} placeholder="Min. 8 characters" required className="inp inp-r" autoFocus />
                  <button type="button" onClick={function () { setShowPass(!showPass) }} className="eye-btn" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5C6478', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <Icon name={showPass ? 'eye-off' : 'eye'} size={16} />
                  </button>
                </div>
                {password && (
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.5rem' }}>Confirm new password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', display: 'flex' }}><Icon name="lock" size={16} /></span>
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={function (e) { setConfirmPassword(e.target.value) }} placeholder="Repeat your password" required className="inp inp-r"
                    style={{ borderColor: confirmPassword && confirmPassword !== password ? '#F87171' : undefined }} />
                  <button type="button" onClick={function () { setShowConfirm(!showConfirm) }} className="eye-btn" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5C6478', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <Icon name={showConfirm ? 'eye-off' : 'eye'} size={16} />
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#F87171', marginTop: '0.3rem', fontWeight: 500 }}><Icon name="alert" size={12} /> Passwords do not match</div>
                )}
                {confirmPassword && confirmPassword === password && password.length >= 8 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#34D399', marginTop: '0.3rem', fontWeight: 600 }}><Icon name="check" size={12} /> Passwords match</div>
                )}
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                    Resetting password...
                  </span>
                ) : 'Reset password \u2192'}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/login" style={{ fontSize: '0.85rem', color: '#8A93A6', fontWeight: 500 }}>&larr; Back to sign in</Link>
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