import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../services/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, code } = location.state || {}

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = (p) => {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const s = strength(password)
  const sColors = ['','#EF4444','#F59E0B','#059669','#059669']
  const sLabels = ['','Weak','Fair','Strong','Very strong']

  // No email/code in state — user landed here directly, redirect to start
  if (!email || !code) {
    return (
      <div style={{ minHeight:'100vh', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
        <div style={{ textAlign:'center', maxWidth:380 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>⚠️</div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'#0F172A', marginBottom:'0.5rem' }}>Session expired</h2>
          <p style={{ color:'#64748B', fontSize:'0.88rem', marginBottom:'1.5rem', lineHeight:1.6 }}>Please restart the password reset process.</p>
          <Link to="/forgot-password" style={{ display:'inline-block', padding:'0.75rem 1.5rem', background:'#E8450A', color:'#fff', borderRadius:10, fontWeight:700, fontSize:'0.88rem' }}>Start over →</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await auth.resetPassword(email, code, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.message || 'Could not reset password. The code may have expired.')
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
    .inp{width:100%;padding:0.85rem 1rem 0.85rem 2.85rem;background:#FFFFFF;border:1.5px solid #E2E8F0;border-radius:10px;color:#0F172A;font-size:0.9rem;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
    .inp:focus{border-color:#E8450A;box-shadow:0 0 0 3px rgba(232,69,10,0.1)}
    .inp::placeholder{color:#94A3B8}
    .inp-r{padding-right:3rem}
    .submit-btn{width:100%;padding:0.95rem;background:#E8450A;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.95rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(232,69,10,0.3)}
    .submit-btn:hover:not(:disabled){background:#C93A08;transform:translateY(-1px);box-shadow:0 6px 20px rgba(232,69,10,0.4)}
    .submit-btn:disabled{opacity:0.6;cursor:not-allowed}
  `

  if (success) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#F0FDF4 0%,#F8FAFC 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
          <div style={{ textAlign:'center', maxWidth:420, animation:'fadeUp 0.5s ease both' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'#F0FDF4', border:'2px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.2rem', margin:'0 auto 1.75rem', animation:'checkPop 0.5s 0.15s ease both', opacity:0 }}>✅</div>
            <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.6rem', fontWeight:800, color:'#0F172A', marginBottom:'0.6rem' }}>Password reset!</h2>
            <p style={{ color:'#64748B', fontSize:'0.9rem', lineHeight:1.7, marginBottom:'0.5rem' }}>Your password has been changed successfully.</p>
            <p style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Redirecting you to sign in...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize:'40px 40px', opacity:0.5, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,69,10,0.06),transparent 70%)', bottom:'-100px', left:'-100px', pointerEvents:'none', filter:'blur(50px)' }} />

        <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1, animation:'fadeUp 0.5s ease both' }}>

          <Link to="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', marginBottom:'2rem' }}>
            <img src="/aeg_logo.png" alt="AEG" style={{ height:34, width:'auto', objectFit:'contain' }} />
            <div>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.92rem', fontWeight:800, color:'#0F172A', lineHeight:1 }}>AEGIS</div>
              <div style={{ fontSize:'0.58rem', color:'#94A3B8', fontWeight:500 }}>Adaptive Eng. Group</div>
            </div>
          </Link>

          <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:20, padding:'2.25rem', boxShadow:'0 8px 32px rgba(0,0,0,0.06)' }}>

            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'#FFF5F2', border:'1px solid #FED7C8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>🔐</div>
            </div>
            <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'0.5rem', color:'#0F172A' }}>Create new password</h1>
            <p style={{ color:'#64748B', fontSize:'0.88rem', lineHeight:1.65, marginBottom:'1.75rem' }}>
              Choose a strong password for <strong style={{ color:'#0F172A' }}>{email}</strong>
            </p>

            {error && (
              <div style={{ background:'#FFF1F0', border:'1.5px solid #FED7C8', color:'#C2410C', padding:'0.8rem 1rem', borderRadius:10, fontSize:'0.83rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
                <span>⚠️</span>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'1.1rem' }}>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.5rem' }}>New password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', fontSize:'0.85rem', opacity:0.45 }}>🔑</span>
                  <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters" required className="inp inp-r" autoFocus />
                  <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', fontSize:'1rem', padding:0 }}>{showPass?'🙈':'👁️'}</button>
                </div>
                {password && (
                  <div style={{ marginTop:'0.5rem' }}>
                    <div style={{ display:'flex', gap:3, marginBottom:'0.3rem' }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:100, background:i<=s?sColors[s]:'#E2E8F0', transition:'background 0.3s' }} />)}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:sColors[s], fontWeight:600 }}>{sLabels[s]}</div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.5rem' }}>Confirm new password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', fontSize:'0.85rem', opacity:0.45 }}>🔒</span>
                  <input type={showConfirm?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repeat your password" required className="inp inp-r"
                    style={{ borderColor: confirmPassword && confirmPassword!==password ? '#FCA5A5' : undefined }} />
                  <button type="button" onClick={()=>setShowConfirm(!showConfirm)} style={{ position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', fontSize:'1rem', padding:0 }}>{showConfirm?'🙈':'👁️'}</button>
                </div>
                {confirmPassword && confirmPassword !== password && <div style={{ fontSize:'0.72rem', color:'#DC2626', marginTop:'0.3rem', fontWeight:500 }}>⚠ Passwords do not match</div>}
                {confirmPassword && confirmPassword === password && password.length >= 8 && <div style={{ fontSize:'0.72rem', color:'#059669', marginTop:'0.3rem', fontWeight:600 }}>✓ Passwords match</div>}
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    Resetting password...
                  </span>
                ) : 'Reset password →'}
              </button>
            </form>
          </div>

          <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <Link to="/login" style={{ fontSize:'0.85rem', color:'#64748B', fontWeight:500 }}>← Back to sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}