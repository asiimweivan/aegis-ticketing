import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 20
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'key') return <svg {...common}><circle cx="8" cy="14.5" r="4" /><path d="m10.8 11.7 8.7-8.7M17 6l2 2M14.5 8.5l1.5 1.5" /></svg>
  if (name === 'mail-open') return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'arrow-left') return <svg {...common}><path d="M19 12H5M5 12l6-6M5 12l6 6" /></svg>
  if (name === 'mail-footer') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'phone-footer') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'globe-footer') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" /></svg>
  return null
}

var STEPS = { EMAIL: 1, OTP: 2, SUCCESS: 3 }

export default function ForgotPassword() {
  var stepArr = useState(STEPS.EMAIL)
  var step = stepArr[0]
  var setStep = stepArr[1]
  var emailArr = useState('')
  var email = emailArr[0]
  var setEmail = emailArr[1]
  var otpArr = useState(['', '', '', '', '', ''])
  var otp = otpArr[0]
  var setOtp = otpArr[1]
  var loadingArr = useState(false)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var errorArr = useState('')
  var error = errorArr[0]
  var setError = errorArr[1]
  var resendTimerArr = useState(0)
  var resendTimer = resendTimerArr[0]
  var setResendTimer = resendTimerArr[1]
  var inputRefs = useRef([])
  var navigate = useNavigate()

  useEffect(function () {
    if (resendTimer <= 0) return
    var t = setTimeout(function () { setResendTimer(function (r) { return r - 1 }) }, 1000)
    return function () { clearTimeout(t) }
  }, [resendTimer])

  function sendOTP(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    auth.forgotPassword(email).then(function () {
      setStep(STEPS.OTP)
      setResendTimer(60)
    }).catch(function (err) {
      setError(err.message || 'Could not send reset code. Check the email and try again.')
    }).finally(function () { setLoading(false) })
  }

  function resendOTP() {
    if (resendTimer > 0) return
    setError('')
    auth.forgotPassword(email).then(function () {
      setResendTimer(60)
      setOtp(['', '', '', '', '', ''])
      if (inputRefs.current[0]) inputRefs.current[0].focus()
    }).catch(function (err) {
      setError(err.message || 'Could not resend code')
    })
  }

  function handleOtpChange(idx, val) {
    if (val && !/^\d$/.test(val)) return
    var next = otp.slice()
    next[idx] = val
    setOtp(next)
    if (val && idx < 5 && inputRefs.current[idx + 1]) inputRefs.current[idx + 1].focus()
  }

  function handleOtpKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0 && inputRefs.current[idx - 1]) inputRefs.current[idx - 1].focus()
  }

  function handleOtpPaste(e) {
    e.preventDefault()
    var text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    var next = otp.slice()
    text.split('').forEach(function (d, i) { if (i < 6) next[i] = d })
    setOtp(next)
    var idx = Math.min(text.length, 5)
    if (inputRefs.current[idx]) inputRefs.current[idx].focus()
  }

  function verifyOTP(e) {
    e.preventDefault()
    setError('')
    var code = otp.join('')
    if (code.length !== 6) { setError('Enter the full 6-digit code'); return }
    setLoading(true)
    auth.verifyResetOTP(email, code).then(function () {
      navigate('/reset-password', { state: { email: email, code: code } })
    }).catch(function (err) {
      setError(err.message || 'Invalid or expired code. Please try again.')
    }).finally(function () { setLoading(false) })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    body{background:#05070D;color:#E7E9F2;font-family:'Inter',sans-serif}\n    a{text-decoration:none;color:inherit}\n    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}\n    @keyframes spin{to{transform:rotate(360deg)}}\n    @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}\n    .inp{width:100%;padding:0.85rem 1rem 0.85rem 2.85rem;background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;color:#F1F3F8;font-size:0.9rem;font-family:'Inter',sans-serif;outline:none;transition:all 0.2s}\n    .inp:focus{border-color:#F97316;box-shadow:0 0 0 3px rgba(249,115,22,0.15)}\n    .inp::placeholder{color:#5C6478}\n    .submit-btn{width:100%;padding:0.95rem;background:linear-gradient(135deg,#E8450A,#F97316);color:#fff;font-family:'Sora',sans-serif;font-size:0.95rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px -4px rgba(232,69,10,0.5)}\n    .submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px -4px rgba(232,69,10,0.6)}\n    .submit-btn:disabled{opacity:0.6;cursor:not-allowed}\n    .otp-box{width:48px;height:56px;text-align:center;font-size:1.4rem;font-weight:700;background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.1);border-radius:12px;color:#F1F3F8;outline:none;transition:all 0.2s;font-family:'JetBrains Mono',monospace}\n    .otp-box:focus{border-color:#F97316;box-shadow:0 0 0 3px rgba(249,115,22,0.15)}\n    .step-dot{width:8px;height:8px;border-radius:50%;transition:all 0.3s}\n  "

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: '#05070D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 70% 65% at 50% 30%,black 20%,transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.14),transparent 70%)', top: '-100px', right: '-100px', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,111,238,0.12),transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none', filter: 'blur(40px)' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <img src="/aeg_logo.png" alt="AEG" style={{ height: 82, width: 'auto', objectFit: 'contain' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            {[1, 2].map(function (n) {
              return <div key={n} className="step-dot" style={{ background: n <= (step === STEPS.SUCCESS ? 2 : step) ? '#F97316' : 'rgba(255,255,255,0.15)', width: n === step ? 24 : 8 }} />
            })}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2.25rem' }}>

            {step === STEPS.EMAIL && (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(232,69,10,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}><Icon name="key" size={22} /></div>
                <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#F1F3F8' }}>Forgot password?</h1>
                <p style={{ color: '#8A93A6', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                  Enter your account email and we'll send a 6-digit verification code to reset your password.
                </p>

                {error && (
                  <div style={{ background: 'rgba(232,69,10,0.1)', border: '1.5px solid rgba(232,69,10,0.3)', color: '#FDBA74', padding: '0.8rem 1rem', borderRadius: 10, fontSize: '0.83rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Icon name="alert" size={16} />{error}
                  </div>
                )}

                <form onSubmit={sendOTP}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.5rem' }}>Email address</label>
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', display: 'flex' }}><Icon name="mail" size={16} /></span>
                    <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} placeholder="you@aegis.rw" required className="inp" autoFocus />
                  </div>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                        Sending code...
                      </span>
                    ) : 'Send verification code \u2192'}
                  </button>
                </form>
              </>
            )}

            {step === STEPS.OTP && (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}><Icon name="mail-open" size={22} /></div>
                <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#F1F3F8' }}>Enter verification code</h1>
                <p style={{ color: '#8A93A6', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                  We sent a 6-digit code to <strong style={{ color: '#F1F3F8' }}>{email}</strong>. Enter it below to continue.
                </p>

                {error && (
                  <div style={{ background: 'rgba(232,69,10,0.1)', border: '1.5px solid rgba(232,69,10,0.3)', color: '#FDBA74', padding: '0.8rem 1rem', borderRadius: 10, fontSize: '0.83rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', animation: 'shake 0.4s ease' }}>
                    <Icon name="alert" size={16} />{error}
                  </div>
                )}

                <form onSubmit={verifyOTP}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handleOtpPaste}>
                    {otp.map(function (d, i) {
                      return (
                        <input
                          key={i}
                          ref={function (el) { inputRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={function (e) { handleOtpChange(i, e.target.value) }}
                          onKeyDown={function (e) { handleOtpKeyDown(i, e) }}
                          className="otp-box"
                          autoFocus={i === 0}
                        />
                      )
                    })}
                  </div>

                  <button type="submit" disabled={loading} className="submit-btn" style={{ marginBottom: '1.25rem' }}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                        Verifying...
                      </span>
                    ) : 'Verify code \u2192'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#8A93A6' }}>
                  Didn't get a code?{' '}
                  {resendTimer > 0 ? (
                    <span style={{ color: '#5C6478' }}>Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={resendOTP} style={{ background: 'none', border: 'none', color: '#F97316', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Sora,sans-serif' }}>Resend code</button>
                  )}
                </div>

                <button onClick={function () { setStep(STEPS.EMAIL); setOtp(['', '', '', '', '', '']); setError('') }} style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', background: 'none', border: 'none', color: '#5C6478', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Icon name="arrow-left" size={13} /> Use a different email
                </button>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/login" style={{ fontSize: '0.85rem', color: '#8A93A6', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Icon name="arrow-left" size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 6% 2.2rem' }}>
        <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3.2rem', marginBottom: '3.2rem', paddingBottom: '2.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <img src="/aeg_logo.png" alt="AEG" style={{ height: 66, width: 'auto', objectFit: 'contain', marginBottom: '1.1rem', display: 'block' }} />
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

