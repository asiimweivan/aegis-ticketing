import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../services/api'

const STEPS = { EMAIL: 1, OTP: 2, SUCCESS: 3 }

export default function ForgotPassword() {
  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const sendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.forgotPassword(email)
      setStep(STEPS.OTP)
      setResendTimer(60)
    } catch (err) {
      setError(err.message || 'Could not send reset code. Check the email and try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    if (resendTimer > 0) return
    setError('')
    try {
      await auth.forgotPassword(email)
      setResendTimer(60)
      setOtp(['','','','','',''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message || 'Could not resend code')
    }
  }

  const handleOtpChange = (idx, val) => {
    if (val && !/^\d$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) inputRefs.current[idx+1]?.focus()
  }

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx-1]?.focus()
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (!text) return
    const next = [...otp]
    text.split('').forEach((d,i) => { if (i < 6) next[i] = d })
    setOtp(next)
    inputRefs.current[Math.min(text.length, 5)]?.focus()
  }

  const verifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    const code = otp.join('')
    if (code.length !== 6) { setError('Enter the full 6-digit code'); return }
    setLoading(true)
    try {
      await auth.verifyResetOTP(email, code)
      // Move to actual reset password page, carrying email + code via state
      navigate('/reset-password', { state: { email, code } })
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#F8FAFC;color:#0F172A;font-family:'Plus Jakarta Sans',sans-serif}
    a{text-decoration:none;color:inherit}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes checkPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
    @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
    .inp{width:100%;padding:0.85rem 1rem 0.85rem 2.85rem;background:#FFFFFF;border:1.5px solid #E2E8F0;border-radius:10px;color:#0F172A;font-size:0.9rem;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
    .inp:focus{border-color:#E8450A;box-shadow:0 0 0 3px rgba(232,69,10,0.1)}
    .inp::placeholder{color:#94A3B8}
    .submit-btn{width:100%;padding:0.95rem;background:#E8450A;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.95rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(232,69,10,0.3)}
    .submit-btn:hover:not(:disabled){background:#C93A08;transform:translateY(-1px);box-shadow:0 6px 20px rgba(232,69,10,0.4)}
    .submit-btn:disabled{opacity:0.6;cursor:not-allowed}
    .otp-box{width:48px;height:56px;text-align:center;font-size:1.4rem;font-weight:700;background:#FFFFFF;border:1.5px solid #E2E8F0;border-radius:12px;color:#0F172A;outline:none;transition:all 0.2s;font-family:'JetBrains Mono',monospace}
    .otp-box:focus{border-color:#E8450A;box-shadow:0 0 0 3px rgba(232,69,10,0.1)}
    .step-dot{width:8px;height:8px;border-radius:50%;transition:all 0.3s}
  `

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize:'40px 40px', opacity:0.5, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,69,10,0.06),transparent 70%)', top:'-100px', right:'-100px', pointerEvents:'none', filter:'blur(50px)' }} />

        <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1, animation:'fadeUp 0.5s ease both' }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', marginBottom:'2rem' }}>
            <img src="/aeg_logo.png" alt="AEG" style={{ height:34, width:'auto', objectFit:'contain' }} />
            <div>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.92rem', fontWeight:800, color:'#0F172A', lineHeight:1 }}>AEGIS</div>
              <div style={{ fontSize:'0.58rem', color:'#94A3B8', fontWeight:500 }}>Adaptive Eng. Group</div>
            </div>
          </Link>

          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginBottom:'2rem' }}>
            {[1,2].map(s => (
              <div key={s} className="step-dot" style={{ background: s <= (step===STEPS.SUCCESS?2:step) ? '#E8450A' : '#E2E8F0', width: s===step?24:8 }} />
            ))}
          </div>

          <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:20, padding:'2.25rem', boxShadow:'0 8px 32px rgba(0,0,0,0.06)' }}>

            {/* ── STEP 1: EMAIL ── */}
            {step === STEPS.EMAIL && (
              <>
                <div style={{ width:52, height:52, borderRadius:14, background:'#FFF5F2', border:'1px solid #FED7C8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', marginBottom:'1.25rem' }}>🔑</div>
                <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'0.5rem', color:'#0F172A' }}>Forgot password?</h1>
                <p style={{ color:'#64748B', fontSize:'0.88rem', lineHeight:1.65, marginBottom:'1.75rem' }}>
                  Enter your account email and we'll send a 6-digit verification code to reset your password.
                </p>

                {error && (
                  <div style={{ background:'#FFF1F0', border:'1.5px solid #FED7C8', color:'#C2410C', padding:'0.8rem 1rem', borderRadius:10, fontSize:'0.83rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
                    <span>⚠️</span>{error}
                  </div>
                )}

                <form onSubmit={sendOTP}>
                  <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.5rem' }}>Email address</label>
                  <div style={{ position:'relative', marginBottom:'1.5rem' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', fontSize:'0.85rem', opacity:0.45 }}>✉️</span>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@aegis.rw" required className="inp" autoFocus />
                  </div>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? (
                      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                        Sending code...
                      </span>
                    ) : 'Send verification code →'}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === STEPS.OTP && (
              <>
                <div style={{ width:52, height:52, borderRadius:14, background:'#F0FDF4', border:'1px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', marginBottom:'1.25rem' }}>📩</div>
                <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'0.5rem', color:'#0F172A' }}>Enter verification code</h1>
                <p style={{ color:'#64748B', fontSize:'0.88rem', lineHeight:1.65, marginBottom:'1.75rem' }}>
                  We sent a 6-digit code to <strong style={{ color:'#0F172A' }}>{email}</strong>. Enter it below to continue.
                </p>

                {error && (
                  <div style={{ background:'#FFF1F0', border:'1.5px solid #FED7C8', color:'#C2410C', padding:'0.8rem 1rem', borderRadius:10, fontSize:'0.83rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.6rem', animation:'shake 0.4s ease' }}>
                    <span>⚠️</span>{error}
                  </div>
                )}

                <form onSubmit={verifyOTP}>
                  <div style={{ display:'flex', gap:'0.5rem', justifyContent:'center', marginBottom:'1.5rem' }} onPaste={handleOtpPaste}>
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={el => inputRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="otp-box"
                        autoFocus={i===0}
                      />
                    ))}
                  </div>

                  <button type="submit" disabled={loading} className="submit-btn" style={{ marginBottom:'1.25rem' }}>
                    {loading ? (
                      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                        Verifying...
                      </span>
                    ) : 'Verify code →'}
                  </button>
                </form>

                <div style={{ textAlign:'center', fontSize:'0.82rem', color:'#64748B' }}>
                  Didn't get a code?{' '}
                  {resendTimer > 0 ? (
                    <span style={{ color:'#94A3B8' }}>Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={resendOTP} style={{ background:'none', border:'none', color:'#E8450A', fontWeight:700, cursor:'pointer', fontSize:'0.82rem', fontFamily:'Plus Jakarta Sans,sans-serif' }}>Resend code</button>
                  )}
                </div>

                <button onClick={() => { setStep(STEPS.EMAIL); setOtp(['','','','','','']); setError('') }} style={{ width:'100%', marginTop:'1rem', padding:'0.6rem', background:'none', border:'none', color:'#94A3B8', fontSize:'0.8rem', cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                  ← Use a different email
                </button>
              </>
            )}
          </div>

          <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <Link to="/login" style={{ fontSize:'0.85rem', color:'#64748B', fontWeight:500, display:'inline-flex', alignItems:'center', gap:'0.4rem' }}
              onMouseOver={e=>e.currentTarget.style.color='#0F172A'}
              onMouseOut={e=>e.currentTarget.style.color='#64748B'}
            >← Back to sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}