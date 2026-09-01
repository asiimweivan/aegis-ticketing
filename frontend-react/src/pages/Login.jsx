import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/api'
import useAuthStore from '../stores/authStore'

/* ── ICON SYSTEM — matches Landing.jsx, no emoji ── */
function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'brain':
      return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
    case 'zap':
      return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
    case 'file-text':
      return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
    case 'shield':
      return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9.5 12 1.8 1.8L15 10" /></svg>
    case 'cpu':
      return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
    case 'alert':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
    case 'mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
    case 'lock':
      return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'eye-off':
      return <svg {...common}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.9 17.9 0 0 1-3.4 4.3" /><path d="M6.7 6.7C4 8.5 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.5-.7" /><path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" /></svg>
    case 'check-circle':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
    default:
      return null
  }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(true)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await auth.login(email, password)
      if (data) {
        login(data.user, data.access_token, data.refresh_token)
        if (data.user.role === 'admin') navigate('/admin')
        else if (data.user.role === 'staff') navigate('/staff')
        else navigate('/client')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #F8FAFC; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; }
    a { text-decoration: none; color: inherit; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes ping   { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.2);opacity:0} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    .inp {
      width:100%; padding:0.85rem 1rem 0.85rem 2.85rem;
      background:#FFFFFF; border:1.5px solid #E2E8F0;
      border-radius:10px; color:#0F172A;
      font-size:0.9rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none;
      transition:all 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.04);
    }
    .inp:focus { border-color:#E8450A; box-shadow:0 0 0 3px rgba(232,69,10,0.1); }
    .inp::placeholder { color:#94A3B8; }
    .inp-pass { padding-right:3rem; }
    .submit-btn {
      width:100%; padding:0.95rem;
      background:#E8450A; color:#fff;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-size:0.95rem; font-weight:700;
      border:none; border-radius:10px;
      cursor:pointer; transition:all 0.2s;
      box-shadow:0 4px 14px rgba(232,69,10,0.3);
    }
    .submit-btn:hover:not(:disabled) { background:#C93A08; transform:translateY(-1px); box-shadow:0 6px 20px rgba(232,69,10,0.4); }
    .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
    .chk { width:16px; height:16px; border-radius:5px; border:1.5px solid #E2E8F0; cursor:pointer; accent-color:#E8450A; }
    .eye-btn { transition: color 0.2s; }
    @media(max-width:768px){
      .login-left { display:none !important; }
      .login-right { padding:2rem 1.5rem !important; }
    }
  `

  const features = [
    { icon: 'brain', label: 'AI classifies your ticket instantly' },
    { icon: 'zap', label: 'Real-time status updates & notifications' },
    { icon: 'file-text', label: 'Generate & download reports anytime' },
    { icon: 'shield', label: 'Role-based access — Client, Staff, Admin' },
  ]

  return (
    <>
      {/* ── TOP NAV ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 5%', background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid #F1F5F9', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <img src="/aeg_logo.png" alt="AEG" style={{ height:36, width:'auto', objectFit:'contain' }} />
          <div>
            <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.88rem', fontWeight:800, color:'#0F172A', lineHeight:1 }}>AEGIS</div>
            <div style={{ fontSize:'0.58rem', color:'#94A3B8', fontWeight:500 }}>Adaptive Eng. Group</div>
          </div>
        </Link>
        <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
          <Link to="/" style={{ fontSize:'0.82rem', color:'#64748B', fontWeight:500, padding:'0.45rem 0.85rem', borderRadius:8, transition:'all 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.color='#0F172A'}
            onMouseOut={e=>e.currentTarget.style.color='#64748B'}
          >← Home</Link>
          <Link to="/register"><button style={{ padding:'0.45rem 1rem', background:'#E8450A', color:'#fff', border:'none', borderRadius:8, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>Register</button></Link>
        </div>
      </nav>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'#F8FAFC', paddingTop:'64px' }}>

        {/* ── LEFT PANEL ── */}
        <div className="login-left" style={{ position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'3rem', background:'#FFFFFF', borderRight:'1.5px solid #F1F5F9' }}>

          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize:'40px 40px', maskImage:'radial-gradient(ellipse 80% 80% at 20% 50%,black,transparent)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,69,10,0.07),transparent 70%)', top:'-60px', left:'-60px', pointerEvents:'none', filter:'blur(40px)' }} />

          {/* Logo lives in the top nav — this spacer preserves the space-between layout */}
          <div style={{ height:1 }} />

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#FFF5F2', border:'1px solid #FED7C8', borderRadius:100, padding:'0.3rem 0.85rem 0.3rem 0.5rem', fontSize:'0.72rem', fontWeight:600, color:'#E8450A', marginBottom:'1.75rem' }}>
              <div style={{ position:'relative', width:16, height:16 }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#E8450A', animation:'ping 1.8s ease-out infinite', opacity:0.4 }} />
                <div style={{ position:'absolute', inset:'25%', borderRadius:'50%', background:'#E8450A' }} />
              </div>
              AI-Powered Issue Management
            </div>

            <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'clamp(1.7rem,3vw,2.5rem)', fontWeight:800, lineHeight:1.15, letterSpacing:'-0.025em', marginBottom:'0.85rem', color:'#0F172A' }}>
              Welcome back.<br />
              <span style={{ color:'#E8450A' }}>Let's get to work.</span>
            </h2>
            <p style={{ color:'#64748B', fontSize:'0.93rem', lineHeight:1.75, maxWidth:360, marginBottom:'2rem' }}>
              Your tickets are classified, prioritized, and routed by AI — the right team gets to work before you even finish submitting.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem', marginBottom:'2.5rem' }}>
              {features.map(f => (
                <div key={f.label} style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.7rem 0.9rem', background:'#F8FAFC', border:'1.5px solid #F1F5F9', borderRadius:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:'#FFF5F2', border:'1px solid #FED7C8', color:'#E8450A', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name={f.icon} size={16} /></div>
                  <span style={{ fontSize:'0.84rem', color:'#475569', fontWeight:500 }}>{f.label}</span>
                </div>
              ))}
            </div>

            <div style={{ background:'#FFFFFF', border:'1.5px solid #FED7C8', borderRadius:14, padding:'1rem 1.25rem', animation:'float 5s ease-in-out infinite', boxShadow:'0 8px 24px rgba(232,69,10,0.08)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.55rem' }}>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.62rem', color:'#94A3B8', background:'#F8FAFC', padding:'0.1rem 0.4rem', borderRadius:4, border:'1px solid #F1F5F9' }}>#TKT-0041</span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', fontSize:'0.62rem', fontWeight:700, padding:'0.12rem 0.45rem', borderRadius:100, background:'#FFF1F0', color:'#E8450A' }}><Icon name="alert" size={10} /> Critical</span>
                <span style={{ marginLeft:'auto', fontSize:'0.6rem', color:'#94A3B8', fontFamily:'JetBrains Mono,monospace' }}>just now</span>
              </div>
              <div style={{ fontSize:'0.82rem', fontWeight:600, color:'#0F172A', marginBottom:'0.5rem', lineHeight:1.35 }}>VPN access down — all remote staff affected</div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', fontSize:'0.65rem', color:'#E8450A', fontWeight:600 }}><Icon name="cpu" size={11} /> Technical · SLA: 4h</span>
                <div style={{ flex:1, height:3, background:'#F1F5F9', borderRadius:100, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:'92%', background:'linear-gradient(90deg,#E8450A,#F97316)', borderRadius:100 }} />
                </div>
                <span style={{ fontSize:'0.62rem', color:'#94A3B8', fontFamily:'JetBrains Mono,monospace' }}>92%</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize:'0.75rem', color:'#94A3B8', position:'relative', zIndex:1, fontWeight:500 }}>
            © 2026 Adaptive Engineering Group Ltd · Kamembe, Rwanda
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 2.5rem', background:'#F8FAFC', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize:'40px 40px', opacity:0.5, pointerEvents:'none' }} />

          <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1, animation:'fadeUp 0.6s ease both' }}>

            <div style={{ marginBottom:'2rem' }}>
              <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.025em', marginBottom:'0.4rem', color:'#0F172A' }}>Sign in</h1>
              <p style={{ color:'#64748B', fontSize:'0.9rem', lineHeight:1.6, fontWeight:500 }}>
                Enter your credentials to access your dashboard
              </p>
            </div>

            {error && (
              <div style={{ background:'#FFF1F0', border:'1.5px solid #FED7C8', color:'#C2410C', padding:'0.85rem 1rem', borderRadius:10, fontSize:'0.84rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
                <Icon name="alert" size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'1.1rem' }}>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.5rem', letterSpacing:'0.01em' }}>Email address</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="mail" size={16} /></span>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@aegis.rw" required className="inp" />
                </div>
              </div>

              <div style={{ marginBottom:'0.85rem' }}>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.5rem' }}>Password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="lock" size={16} /></span>
                  <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required className="inp inp-pass" />
                  <button type="button" onClick={()=>setShowPass(!showPass)} className="eye-btn" style={{ position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', padding:0, display:'flex' }}
                    onMouseOver={e=>e.currentTarget.style.color='#475569'}
                    onMouseOut={e=>e.currentTarget.style.color='#94A3B8'}
                  ><Icon name={showPass?'eye-off':'eye'} size={17} /></button>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.82rem', color:'#475569', fontWeight:500, cursor:'pointer' }}>
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="chk" />
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize:'0.82rem', color:'#E8450A', fontWeight:600, transition:'opacity 0.2s' }}
                  onMouseOver={e=>e.currentTarget.style.opacity='0.7'}
                  onMouseOut={e=>e.currentTarget.style.opacity='1'}
                >Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in →'}
              </button>
            </form>

            <div style={{ display:'flex', alignItems:'center', gap:'1rem', margin:'1.5rem 0' }}>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
              <span style={{ fontSize:'0.75rem', color:'#94A3B8', whiteSpace:'nowrap', fontWeight:500 }}>New to AEGIS?</span>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
            </div>

            <Link to="/register" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.875rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:'0.9rem', fontWeight:600, color:'#374151', transition:'all 0.2s', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor='#FED7C8'; e.currentTarget.style.color='#E8450A'; e.currentTarget.style.background='#FFF5F2' }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color='#374151'; e.currentTarget.style.background='#FFFFFF' }}
            >Create a client account →</Link>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginTop:'1.5rem', padding:'0.75rem', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, color:'#166534' }}>
              <Icon name="check-circle" size={15} />
              <span style={{ fontSize:'0.78rem', fontWeight:500 }}>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
