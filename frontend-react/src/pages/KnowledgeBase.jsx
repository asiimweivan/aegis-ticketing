import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { kb, helpers } from '../services/api'

/* ── ICON SYSTEM — matches Login/Register/Landing, no emoji ── */
function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
    case 'book-open':
      return <svg {...common}><path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z" /><path d="M12 6.5v13" /></svg>
    case 'thumbs-up':
      return <svg {...common}><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" /><path d="M7 11l4-7c1.2 0 2.2 1 2.2 2.2V9H17a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 15.8 19H10a3 3 0 0 1-3-3" /></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'chevron-right':
      return <svg {...common}><path d="m9 6 6 6-6 6" /></svg>
    case 'arrow-left':
      return <svg {...common}><path d="M19 12H5M5 12l6-6M5 12l6 6" /></svg>
    case 'ticket':
      return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M10 6.5v11" strokeDasharray="2 2" /></svg>
    default:
      return null
  }
}

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'technical', label: 'Technical' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'billing', label: 'Billing' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'hr', label: 'HR' },
  { value: 'security', label: 'Security' },
  { value: 'general', label: 'General' },
]

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [openArticle, setOpenArticle] = useState(null)
  const [votedIds, setVotedIds] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('kb_voted') || '[]') } catch { return [] }
  })

  useEffect(() => { loadArticles() }, [category])

  useEffect(() => {
    const t = setTimeout(() => loadArticles(), 350)
    return () => clearTimeout(t)
  }, [search])

  const loadArticles = async () => {
    setLoading(true)
    try {
      const params = { page_size: 50 }
      if (category) params.category = category
      if (search.trim()) params.search = search.trim()
      const res = await kb.list(params)
      if (res) setArticles(res.articles || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openOne = async (article) => {
    try {
      const fresh = await kb.get(article.id)
      setOpenArticle(fresh || article)
    } catch {
      setOpenArticle(article)
    }
  }

  const voteHelpful = async (id) => {
    if (votedIds.includes(id)) return
    try {
      const updated = await kb.markHelpful(id)
      if (updated) {
        setOpenArticle(updated)
        setArticles(prev => prev.map(a => a.id === id ? updated : a))
      }
      const next = [...votedIds, id]
      setVotedIds(next)
      sessionStorage.setItem('kb_voted', JSON.stringify(next))
    } catch (e) { console.error(e) }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#F8FAFC;color:#0F172A;font-family:'Plus Jakarta Sans',sans-serif}
    a{text-decoration:none;color:inherit}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .art-card{transition:all 0.2s;cursor:pointer}
    .art-card:hover{border-color:#FED7C8!important;box-shadow:0 8px 24px rgba(232,69,10,0.08);transform:translateY(-2px)}
    .cat-chip{transition:all 0.15s}
    .vote-btn{transition:all 0.2s}
    .vote-btn:hover:not(:disabled){background:#ECFDF5!important;border-color:#A7F3D0!important;color:#059669!important}
  `

  return (
    <>
      <style>{css}</style>

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
          <Link to="/" style={{ fontSize:'0.82rem', color:'#64748B', fontWeight:500, padding:'0.45rem 0.85rem', borderRadius:8 }}>← Home</Link>
          <Link to="/login" style={{ padding:'0.45rem 1rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', color:'#374151', borderRadius:8, fontSize:'0.82rem', fontWeight:600 }}>Sign in</Link>
          <Link to="/register"><button style={{ padding:'0.45rem 1rem', background:'#E8450A', color:'#fff', border:'none', borderRadius:8, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>Register</button></Link>
        </div>
      </nav>

      <div style={{ minHeight:'100vh', background:'#F8FAFC', paddingTop:'64px' }}>

        {/* ── HERO ── */}
        <div style={{ background:'linear-gradient(180deg,#FFFAF8 0%,#F8FAFC 100%)', borderBottom:'1.5px solid #F1F5F9', padding:'3rem 6% 2.5rem' }}>
          <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center', animation:'fadeUp 0.5s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#FFF5F2', border:'1px solid #FED7C8', borderRadius:100, padding:'0.3rem 1rem', fontSize:'0.75rem', fontWeight:600, color:'#E8450A', marginBottom:'1.25rem' }}>
              <Icon name="book-open" size={13} /> Knowledge Base
            </div>
            <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'clamp(1.7rem,3.5vw,2.4rem)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'0.75rem', color:'#0F172A' }}>
              How can we help?
            </h1>
            <p style={{ color:'#64748B', fontSize:'0.95rem', lineHeight:1.7, marginBottom:'1.75rem' }}>
              Search common issues and solutions before submitting a ticket — most problems are already answered here.
            </p>

            <div style={{ position:'relative', maxWidth:480, margin:'0 auto' }}>
              <span style={{ position:'absolute', left:'1.1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', display:'flex' }}><Icon name="search" size={17} /></span>
              <input
                type="text" value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search articles, e.g. 'reset password', 'VPN'..."
                style={{ width:'100%', padding:'0.9rem 1rem 0.9rem 3rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', borderRadius:12, color:'#0F172A', fontSize:'0.9rem', fontFamily:'Plus Jakarta Sans,sans-serif', outline:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.05)' }}
                onFocus={e=>e.target.style.borderColor='#E8450A'}
                onBlur={e=>e.target.style.borderColor='#E2E8F0'}
              />
            </div>
          </div>
        </div>

        <div style={{ maxWidth:900, margin:'0 auto', padding:'2rem 6% 4rem' }}>

          {/* Category chips */}
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.75rem' }}>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={()=>setCategory(c.value)} className="cat-chip" style={{
                padding:'0.4rem 1rem', borderRadius:100, fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
                border:`1.5px solid ${category===c.value ? '#FED7C8' : '#E2E8F0'}`,
                background: category===c.value ? '#FFF5F2' : '#FFFFFF',
                color: category===c.value ? '#E8450A' : '#64748B',
                fontFamily:'Plus Jakarta Sans,sans-serif',
              }}>{c.label}</button>
            ))}
          </div>

          {/* Article list or detail */}
          {openArticle ? (
            <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:18, padding:'2rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', animation:'fadeUp 0.3s ease both' }}>
              <button onClick={()=>setOpenArticle(null)} style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'none', border:'none', color:'#64748B', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', marginBottom:'1.5rem', padding:0, fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                <Icon name="arrow-left" size={15} /> Back to all articles
              </button>

              <div style={{ display:'inline-block', background:'#FFF5F2', border:'1px solid #FED7C8', borderRadius:100, padding:'0.2rem 0.75rem', fontSize:'0.7rem', fontWeight:600, color:'#E8450A', marginBottom:'1rem', textTransform:'capitalize' }}>
                {openArticle.category}
              </div>

              <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'#0F172A', marginBottom:'1rem', lineHeight:1.3 }}>
                {openArticle.title}
              </h2>

              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#94A3B8', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'0.5rem' }}>The problem</div>
                <p style={{ fontSize:'0.9rem', color:'#475569', lineHeight:1.75 }}>{openArticle.problem_description}</p>
              </div>

              <div style={{ marginBottom:'1.75rem' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#059669', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'0.5rem' }}>The solution</div>
                <p style={{ fontSize:'0.9rem', color:'#334155', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{openArticle.solution}</p>
              </div>

              {openArticle.tags?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1.75rem' }}>
                  {openArticle.tags.map(t => (
                    <span key={t} style={{ fontSize:'0.7rem', color:'#64748B', background:'#F8FAFC', border:'1px solid #F1F5F9', padding:'0.2rem 0.6rem', borderRadius:100 }}>#{t}</span>
                  ))}
                </div>
              )}

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'1.5rem', borderTop:'1px solid #F1F5F9', flexWrap:'wrap', gap:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', fontSize:'0.78rem', color:'#94A3B8' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}><Icon name="eye" size={14} /> {openArticle.views} views</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}><Icon name="thumbs-up" size={14} /> {openArticle.helpful_count} found helpful</span>
                </div>
                <button
                  className="vote-btn"
                  onClick={()=>voteHelpful(openArticle.id)}
                  disabled={votedIds.includes(openArticle.id)}
                  style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1rem', background: votedIds.includes(openArticle.id) ? '#ECFDF5' : '#F8FAFC', border:`1.5px solid ${votedIds.includes(openArticle.id) ? '#A7F3D0' : '#E2E8F0'}`, borderRadius:10, fontSize:'0.82rem', fontWeight:600, color: votedIds.includes(openArticle.id) ? '#059669' : '#475569', cursor: votedIds.includes(openArticle.id) ? 'default' : 'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}
                >
                  <Icon name="thumbs-up" size={14} /> {votedIds.includes(openArticle.id) ? 'Thanks for your feedback' : 'This was helpful'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div style={{ padding:'4rem', textAlign:'center' }}>
                  <div style={{ width:36, height:36, border:'3px solid #FED7C8', borderTopColor:'#E8450A', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }} />
                  <div style={{ color:'#94A3B8', fontSize:'0.85rem' }}>Loading articles...</div>
                </div>
              ) : articles.length === 0 ? (
                <div style={{ textAlign:'center', padding:'4rem 2rem', background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:18 }}>
                  <div style={{ color:'#CBD5E1', marginBottom:'1rem', display:'flex', justifyContent:'center' }}><Icon name="book-open" size={44} strokeWidth={1.4} /></div>
                  <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.05rem', fontWeight:700, color:'#0F172A', marginBottom:'0.5rem' }}>No articles found</div>
                  <p style={{ fontSize:'0.85rem', color:'#94A3B8', marginBottom:'1.5rem' }}>Try a different search term, or submit a ticket and our team will help directly.</p>
                  <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.7rem 1.5rem', background:'#E8450A', color:'#fff', borderRadius:100, fontSize:'0.85rem', fontWeight:700, fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                    <Icon name="ticket" size={15} /> Submit a ticket
                  </Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  {articles.map(a => (
                    <div key={a.id} className="art-card" onClick={()=>openOne(a)} style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:14, padding:'1.25rem 1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.4rem' }}>
                            <span style={{ fontSize:'0.68rem', fontWeight:600, color:'#E8450A', background:'#FFF5F2', padding:'0.15rem 0.55rem', borderRadius:100, textTransform:'capitalize' }}>{a.category}</span>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.7rem', color:'#94A3B8' }}><Icon name="eye" size={12} /> {a.views}</span>
                            <span style={{ display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.7rem', color:'#94A3B8' }}><Icon name="thumbs-up" size={12} /> {a.helpful_count}</span>
                          </div>
                          <div style={{ fontSize:'0.92rem', fontWeight:700, color:'#0F172A', marginBottom:'0.3rem' }}>{a.title}</div>
                          <div style={{ fontSize:'0.8rem', color:'#64748B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.problem_description}</div>
                        </div>
                        <div style={{ color:'#CBD5E1', flexShrink:0 }}><Icon name="chevron-right" size={20} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
