import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/api'

/* ── ICON SYSTEM — matches Login.jsx / Landing.jsx, no emoji ── */
function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'check-circle':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
    case 'rocket':
      return <svg {...common}><path d="M14.5 9.5 21 3c-6.5 0-11 2.5-14.5 8-1 1.6-2 3.5-2.5 5.5 2-.5 3.9-1.5 5.5-2.5 5.5-3.5 8-8 8-14.5Z" /><path d="M9 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><circle cx="15" cy="9" r="1.4" /></svg>
    case 'brain':
      return <svg {...common}><path d="M9 4a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 4.5 10 2.5 2.5 0 0 0 6 14.2V16a3 3 0 0 0 3 3" /><path d="M15 4a3 3 0 0 1 3 3v.5A2.5 2.5 0 0 1 19.5 10 2.5 2.5 0 0 1 18 14.2V16a3 3 0 0 1-3 3" /><path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" /><path d="M15 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" /></svg>
    case 'map-pin':
      return <svg {...common}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.4" /></svg>
    case 'alert':
      return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
    case 'mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
    case 'building':
      return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 8h4v13h-4M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" /></svg>
    case 'phone':
      return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
    case 'lock':
      return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'eye-off':
      return <svg {...common}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.9 17.9 0 0 1-3.4 4.3" /><path d="M6.7 6.7C4 8.5 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.5-.7" /><path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" /></svg>
    case 'check':
      return <svg {...common}><path d="M4 12.5 9 18l11-13" /></svg>
    default:
      return null
  }
}

export default function Register() {
  const [form, setForm] = useState({ full_name:'', email:'', password:'', confirmPassword:'', department:'', phone:'' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const strength = (p) => {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const s = strength(form.password)
  const sColors = ['','#EF4444','#F59E0B','#059669','#059669']
  const sLabels = ['','Weak','Fair','Strong','Very strong']

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await auth.register({ full_name:form.full_name, email:form.email, password:form.password, role:'client', department:form.department||null, phone:form.phone||null })
      setSuccess(true)
    } catch (err) { setError(err.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#F8FAFC;color:#0F172A;font-family:'Plus Jakarta Sans',sans-serif}
    a{text-decoration:none;color:inherit}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes ping{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2.2);opacity:0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes checkPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .inp{width:100%;padding:0.85rem 1rem 0.85rem 2.85rem;background:#FFFFFF;border:1.5px solid #E2E8F0;border-radius:10px;color:#0F172A;font-size:0.9rem;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
    .inp:focus{border-color:#E8450A;box-shadow:0 0 0 3px rgba(232,69,10,0.1)}
    .inp::placeholder{color:#94A3B8}
    .inp-sm{padding-left:1rem}
    .inp-r{padding-right:3rem}
    .submit-btn{width:100%;padding:0.95rem;background:#E8450A;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.95rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(232,69,10,0.3)}
    .submit-btn:hover:not(:disabled){background:#C93A08;transform:translateY(-1px);box-shadow:0 6px 20px rgba(232,69,10,0.4)}
    .submit-btn:disabled{opacity:0.6;cursor:not-allowed}
    .eye-btn{transition:color 0.2s}
    @media(max-width:768px){.reg-left{display:none!important}.reg-right{padding:2rem 1.5rem!important}}
  `

  if (success) return (
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
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#FFF5F2 0%,#F8FAFC 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ textAlign:'center', maxWidth:480, animation:'fadeUp 0.6s ease both' }}>
          <div style={{ width:88, height:88, borderRadius:'50%', background:'#FFF5F2', border:'2px solid #FED7C8', color:'#E8450A', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 2rem', animation:'checkPop 0.5s 0.2s ease both', opacity:0 }}><Icon name="check-circle" size={40} strokeWidth={1.6} /></div>
          <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'2rem', fontWeight:800, letterSpacing:'-0.025em', marginBottom:'0.75rem', color:'#0F172A' }}>Account created!</h2>
          <p style={{ color:'#64748B', fontSize:'0.95rem', lineHeight:1.7, marginBottom:'2rem' }}>
            Welcome to AEG, <strong style={{ color:'#0F172A' }}>{form.full_name.split(' ')[0]}</strong>! Your client account is ready. Submit and track your tickets in real time.
          </p>
          <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:14, padding:'1.25rem', marginBottom:'2rem', display:'flex', flexDirection:'column', gap:'0.65rem', boxShadow:'0 4px 12px rgba(0,0,0,0.04)', textAlign:'left' }}>
            {[['rocket','Submit your first ticket','Describe your issue in plain language'],['brain','AI classifies instantly','Category, priority & SLA set automatically'],['map-pin','Track to resolution','Real-time updates the whole way']].map(([ic,t,d]) => (
              <div key={t} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'#FFF5F2', border:'1px solid #FED7C8', color:'#E8450A', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name={ic} size={15} /></div>
                <div>
                  <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0F172A' }}>{t}</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748B' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/login')} className="submit-btn">Sign in to get started →</button>
        </div>
      </div>
    </>
  )

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

        {/* ── LEFT ── */}
        <div className="reg-left" style={{ position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'3rem', background:'#FFFFFF', borderRight:'1.5px solid #F1F5F9' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize:'40px 40px', maskImage:'radial-gradient(ellipse 80% 80% at 20% 50%,black,transparent)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,69,10,0.07),transparent 70%)', top:'-80px', right:'-80px', pointerEvents:'none', filter:'blur(50px)' }} />

          {/* Logo now lives only in the top nav — this spacer keeps the flex layout (logo / center / footer) intact */}
          <div style={{ height:1 }} />

          {/* Center */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#FFF5F2', border:'1px solid #FED7C8', borderRadius:100, padding:'0.3rem 0.85rem 0.3rem 0.5rem', fontSize:'0.72rem', fontWeight:600, color:'#E8450A', marginBottom:'1.75rem' }}>
              <div style={{ position:'relative', width:16, height:16 }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#E8450A', animation:'ping 1.8s ease-out infinite', opacity:0.4 }} />
                <div style={{ position:'absolute', inset:'25%', borderRadius:'50%', background:'#E8450A' }} />
              </div>
              Client Portal Registration
            </div>

            <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'clamp(1.7rem,3vw,2.4rem)', fontWeight:800, lineHeight:1.15, letterSpacing:'-0.025em', marginBottom:'0.85rem', color:'#0F172A' }}>
              Start resolving issues<br />
              <span style={{ color:'#E8450A' }}>the smart way.</span>
            </h2>
            <p style={{ color:'#64748B', fontSize:'0.93rem', lineHeight:1.75, maxWidth:360, marginBottom:'2rem' }}>
              Create your account in under 2 minutes. AI handles classification, routing, and SLA tracking — automatically.
            </p>

            {/* Steps */}
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[
                { n:'1', t:'Create your account',      s:'Takes less than 2 minutes',                 c:'#E8450A' },
                { n:'2', t:'Submit your first ticket',  s:'Describe your issue in plain language',      c:'#F97316' },
                { n:'3', t:'AI classifies instantly',   s:'Category, priority & SLA set automatically', c:'#D97706' },
                { n:'4', t:'Track to resolution',       s:'Real-time updates until your issue is closed',c:'#059669' },
              ].map((st, i) => (
                <div key={st.n} style={{ display:'flex', gap:'1rem', paddingBottom:i<3?'1.1rem':0, position:'relative' }}>
                  {i<3 && <div style={{ position:'absolute', left:13, top:28, bottom:0, width:1, background:'#F1F5F9' }} />}
                  <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background:`${st.c}15`, border:`1.5px solid ${st.c}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:800, color:st.c, position:'relative', zIndex:1 }}>{st.n}</div>
                  <div style={{ paddingTop:'0.1rem' }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#0F172A', marginBottom:'0.1rem' }}>{st.t}</div>
                    <div style={{ fontSize:'0.78rem', color:'#64748B' }}>{st.s}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'2rem', flexWrap:'wrap' }}>
              {[['1,240+','Tickets resolved'],['94%','AI accuracy'],['< 2min','To get started']].map(([v,l]) => (
                <div key={l} style={{ background:'#F8FAFC', border:'1.5px solid #F1F5F9', borderRadius:12, padding:'0.75rem 1rem', flex:1, minWidth:90 }}>
                  <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.1rem', fontWeight:800, color:'#E8450A', lineHeight:1 }}>{v}</div>
                  <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:'0.2rem', fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize:'0.75rem', color:'#94A3B8', position:'relative', zIndex:1, fontWeight:500 }}>
            © 2026 Adaptive Engineering Group Ltd · Kamembe, Rwanda
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="reg-right" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'2.5rem 2.5rem', overflowY:'auto', background:'#F8FAFC', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#F1F5F9 1px,transparent 1px),linear-gradient(90deg,#F1F5F9 1px,transparent 1px)', backgroundSize:'40px 40px', opacity:0.5, pointerEvents:'none' }} />

          <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1, animation:'fadeUp 0.6s ease both' }}>

            <div style={{ marginBottom:'1.75rem' }}>
              <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.85rem', fontWeight:800, letterSpacing:'-0.025em', marginBottom:'0.4rem', color:'#0F172A' }}>Create account</h1>
              <p style={{ color:'#64748B', fontSize:'0.88rem', lineHeight:1.6, fontWeight:500 }}>Client accounts only — staff accounts are created by your admin</p>
            </div>

            {error && (
              <div style={{ background:'#FFF1F0', border:'1.5px solid #FED7C8', color:'#C2410C', padding:'0.85rem 1rem', borderRadius:10, fontSize:'0.84rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
                <Icon name="alert" size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem' }}>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.45rem' }}>Full name *</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="user" size={15} /></span>
                    <input type="text" value={form.full_name} required onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Jean Pierre Habimana" className="inp" />
                  </div>
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.45rem' }}>Email address *</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="mail" size={15} /></span>
                    <input type="email" value={form.email} required onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@aegis.rw" className="inp" />
                  </div>
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.45rem' }}>Department</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="building" size={15} /></span>
                    <input type="text" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Engineering" className="inp" />
                  </div>
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.45rem' }}>Phone</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="phone" size={15} /></span>
                    <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+250 7XX XXX XXX" className="inp" />
                  </div>
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.45rem' }}>Password *</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="lock" size={15} /></span>
                    <input type={showPass?'text':'password'} value={form.password} required onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min. 8 characters" className="inp inp-r" />
                    <button type="button" onClick={()=>setShowPass(!showPass)} className="eye-btn" style={{ position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', padding:0, display:'flex' }}
                      onMouseOver={e=>e.currentTarget.style.color='#475569'}
                      onMouseOut={e=>e.currentTarget.style.color='#94A3B8'}
                    ><Icon name={showPass?'eye-off':'eye'} size={16} /></button>
                  </div>
                  {form.password && (
                    <div style={{ marginTop:'0.5rem' }}>
                      <div style={{ display:'flex', gap:3, marginBottom:'0.3rem' }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex:1, height:4, borderRadius:100, background:i<=s?sColors[s]:'#E2E8F0', transition:'background 0.3s' }} />
                        ))}
                      </div>
                      <div style={{ fontSize:'0.72rem', color:sColors[s], fontWeight:600 }}>{sLabels[s]}</div>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.45rem' }}>Confirm password *</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', pointerEvents:'none', display:'flex' }}><Icon name="lock" size={15} /></span>
                    <input type={showConfirm?'text':'password'} value={form.confirmPassword} required onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="Repeat your password" className="inp inp-r"
                      style={{ borderColor:form.confirmPassword&&form.confirmPassword!==form.password?'#FCA5A5':undefined }}
                    />
                    <button type="button" onClick={()=>setShowConfirm(!showConfirm)} className="eye-btn" style={{ position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', padding:0, display:'flex' }}
                      onMouseOver={e=>e.currentTarget.style.color='#475569'}
                      onMouseOut={e=>e.currentTarget.style.color='#94A3B8'}
                    ><Icon name={showConfirm?'eye-off':'eye'} size={16} /></button>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.72rem', color:'#DC2626', marginTop:'0.3rem', fontWeight:500 }}><Icon name="alert" size={12} /> Passwords do not match</div>
                  )}
                  {form.confirmPassword && form.confirmPassword === form.password && form.password.length >= 8 && (
                    <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.72rem', color:'#059669', marginTop:'0.3rem', fontWeight:600 }}><Icon name="check" size={12} /> Passwords match</div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop:'1.25rem' }}>
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Creating your account...
                  </span>
                ) : 'Create account →'}
              </button>
            </form>

            <div style={{ display:'flex', alignItems:'center', gap:'1rem', margin:'1.25rem 0' }}>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
              <span style={{ fontSize:'0.75rem', color:'#94A3B8', whiteSpace:'nowrap', fontWeight:500 }}>Already registered?</span>
              <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
            </div>

            <Link to="/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.875rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:'0.9rem', fontWeight:600, color:'#374151', transition:'all 0.2s', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor='#FED7C8'; e.currentTarget.style.color='#E8450A'; e.currentTarget.style.background='#FFF5F2' }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color='#374151'; e.currentTarget.style.background='#FFFFFF' }}
            >Sign in to your account →</Link>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginTop:'1.1rem', padding:'0.7rem', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, color:'#166534' }}>
              <Icon name="lock" size={14} />
              <span style={{ fontSize:'0.78rem', fontWeight:500 }}>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
