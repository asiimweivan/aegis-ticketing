import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { kb, helpers } from '../services/api'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  if (name === 'book-open') return <svg {...common}><path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z" /><path d="M12 6.5v13" /></svg>
  if (name === 'thumbs-up') return <svg {...common}><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" /><path d="M7 11l4-7c1.2 0 2.2 1 2.2 2.2V9H17a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 15.8 19H10a3 3 0 0 1-3-3" /></svg>
  if (name === 'thumbs-down') return <svg {...common}><path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Z" /><path d="M17 13l-4 7c-1.2 0-2.2-1-2.2-2.2V15H7a2 2 0 0 1-2-2.4l1.2-6A2 2 0 0 1 8.2 5H14a3 3 0 0 1 3 3" /></svg>
  if (name === 'heart') return <svg {...common}><path d="M12 20.5s-7.5-4.6-9.8-9.3C.6 7.9 2.4 4.5 6 4c2-.3 3.6.6 6 3 2.4-2.4 4-3.3 6-3 3.6.5 5.4 3.9 3.8 7.2C19.5 15.9 12 20.5 12 20.5Z" /></svg>
  if (name === 'help-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M9.2 9.2a2.8 2.8 0 0 1 5.4.9c0 1.8-2.6 2-2.6 3.6" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  if (name === 'chevron-right') return <svg {...common}><path d="m9 6 6 6-6 6" /></svg>
  if (name === 'arrow-left') return <svg {...common}><path d="M19 12H5M5 12l6-6M5 12l6 6" /></svg>
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'laptop') return <svg {...common}><rect x="4.5" y="5" width="15" height="10" rx="1" /><path d="M2.5 19h19" /></svg>
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /></svg>
  if (name === 'credit-card') return <svg {...common}><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 10h19" /></svg>
  if (name === 'building') return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /></svg>
  if (name === 'users') return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /></svg>
  if (name === 'grid') return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></svg>
  return null
}

var CATEGORIES = [
  { value: '', label: 'All Articles', icon: 'grid' },
  { value: 'technical', label: 'Technical', icon: 'laptop' },
  { value: 'administrative', label: 'Administrative', icon: 'file-text' },
  { value: 'billing', label: 'Billing', icon: 'credit-card' },
  { value: 'infrastructure', label: 'Infrastructure', icon: 'building' },
  { value: 'hr', label: 'HR', icon: 'users' },
  { value: 'security', label: 'Security', icon: 'shield' },
  { value: 'general', label: 'General', icon: 'book-open' },
]

var CATEGORY_COLORS = {
  technical: '#7C6FEE', administrative: '#0EA5E9', billing: '#F59E0B',
  infrastructure: '#EC4899', hr: '#34D399', security: '#F87171', general: '#8A93A6',
}

var REACTIONS = [
  { key: 'helpful', label: 'Helpful', icon: 'thumbs-up', color: '#34D399' },
  { key: 'not_helpful', label: 'Not Helpful', icon: 'thumbs-down', color: '#F87171' },
  { key: 'love', label: 'Love', icon: 'heart', color: '#F97316' },
  { key: 'confused', label: 'Confused', icon: 'help-circle', color: '#FBBF24' },
]

export default function KnowledgeBase() {
  var articlesArr = useState([])
  var articles = articlesArr[0]
  var setArticles = articlesArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var searchArr = useState('')
  var search = searchArr[0]
  var setSearch = searchArr[1]
  var categoryArr = useState('')
  var category = categoryArr[0]
  var setCategory = categoryArr[1]
  var openArticleArr = useState(null)
  var openArticle = openArticleArr[0]
  var setOpenArticle = openArticleArr[1]
  var votedArr = useState(function () {
    try { return JSON.parse(sessionStorage.getItem('kb_voted_v2') || '{}') } catch (e) { return {} }
  })
  var voted = votedArr[0]
  var setVoted = votedArr[1]

  useEffect(function () { loadArticles() }, [category])
  useEffect(function () {
    var t = setTimeout(function () { loadArticles() }, 350)
    return function () { clearTimeout(t) }
  }, [search])

  function loadArticles() {
    setLoading(true)
    var params = { page_size: 50 }
    if (category) params.category = category
    if (search.trim()) params.search = search.trim()
    kb.list(params).then(function (res) {
      if (res) setArticles(res.articles || [])
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function openOne(article) {
    kb.get(article.id).then(function (fresh) {
      setOpenArticle(fresh || article)
    }).catch(function () { setOpenArticle(article) })
  }

  function react(id, reactionType) {
    var articleVotes = voted[id] || []
    if (articleVotes.indexOf(reactionType) !== -1) return
    kb.react(id, reactionType).then(function (updated) {
      if (updated) {
        setOpenArticle(updated)
        setArticles(function (prev) { return prev.map(function (a) { return a.id === id ? updated : a }) })
      }
      var next = Object.assign({}, voted, { [id]: articleVotes.concat([reactionType]) })
      setVoted(next)
      sessionStorage.setItem('kb_voted_v2', JSON.stringify(next))
    }).catch(function (e) { console.error(e) })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    body{background:#05070D;color:#E7E9F2;font-family:'Inter',sans-serif}\n    a{text-decoration:none;color:inherit}\n    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}\n    @keyframes spin{to{transform:rotate(360deg)}}\n    .art-card{transition:all 0.3s cubic-bezier(0.16,1,0.3,1);cursor:pointer}\n    .art-card:hover{border-color:rgba(249,115,22,0.35)!important;box-shadow:0 16px 40px -16px rgba(232,69,10,0.25);transform:translateY(-3px)}\n    .cat-card{transition:all 0.3s cubic-bezier(0.16,1,0.3,1);cursor:pointer}\n    .cat-card:hover{transform:translateY(-4px)}\n    .react-btn{transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}\n    .react-btn:hover:not(:disabled){transform:translateY(-2px)}\n  "

  return (
    <>
      <style>{css}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 5%', background: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/aeg_logo.png" alt="AEG" style={{ height: 46, width: 'auto', objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: '#8A93A6', fontWeight: 500, padding: '0.45rem 0.85rem', borderRadius: 8, fontFamily: 'Sora,sans-serif' }}>&larr; Home</Link>
          <Link to="/login" style={{ padding: '0.5rem 1.15rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E7E9F2', borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Sora,sans-serif' }}>Sign in</Link>
          <Link to="/register"><button style={{ padding: '0.5rem 1.15rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 100, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>Register</button></Link>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', background: '#05070D', paddingTop: '64px' }}>

        <div style={{ position: 'relative', overflow: 'hidden', padding: '4rem 6% 3rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <img src="/images/kb-hero-bg.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,7,13,0.55) 0%,rgba(5,7,13,0.9) 70%,rgba(5,7,13,1) 100%)', zIndex: 1 }} />
          <div style={{ position: 'absolute', width: 560, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,69,10,0.15),transparent 70%)', top: '-30%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,111,238,0.12)', border: '1px solid rgba(124,111,238,0.3)', borderRadius: 100, padding: '0.35rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#B4ACF9', marginBottom: '1.5rem' }}>
              <Icon name="book-open" size={13} /> Knowledge Base
            </div>
            <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 'clamp(1.9rem,3.8vw,2.7rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.85rem', color: '#F1F3F8' }}>
              How can we help?
            </h1>
            <p style={{ color: '#8A93A6', fontSize: '0.98rem', lineHeight: 1.75, marginBottom: '2rem' }}>
              Search common issues and solutions before submitting a ticket - most problems are already answered here.
            </p>
            <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
              <span style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', display: 'flex' }}><Icon name="search" size={17} /></span>
              <input
                type="text" value={search} onChange={function (e) { setSearch(e.target.value) }}
                placeholder="Search articles, e.g. 'reset password', 'VPN'..."
                style={{ width: '100%', padding: '0.95rem 1rem 0.95rem 3.1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 100, color: '#F1F3F8', fontSize: '0.92rem', fontFamily: 'Inter,sans-serif', outline: 'none' }}
                onFocus={function (e) { e.target.style.borderColor = '#F97316' }}
                onBlur={function (e) { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1020, margin: '0 auto', padding: '3rem 6% 4rem' }}>

          {!openArticle && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.85rem', marginBottom: '2.5rem' }}>
              {CATEGORIES.map(function (c) {
                var active = category === c.value
                var color = c.value ? (CATEGORY_COLORS[c.value] || '#8A93A6') : '#F97316'
                return (
                  <div key={c.value || 'all'} className="cat-card" onClick={function () { setCategory(c.value) }} style={{
                    background: active ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: '1.5px solid ' + (active ? color + '55' : 'rgba(255,255,255,0.08)'),
                    borderRadius: 16, padding: '1.1rem 0.75rem', textAlign: 'center',
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '20', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem' }}>
                      <Icon name={c.icon} size={18} />
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: active ? '#F1F3F8' : '#B0B8C8' }}>{c.label}</div>
                  </div>
                )
              })}
            </div>
          )}

          {openArticle ? (
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2.25rem', animation: 'fadeUp 0.3s ease both' }}>
              <button onClick={function () { setOpenArticle(null) }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#8A93A6', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
                <Icon name="arrow-left" size={15} /> Back to all articles
              </button>

              <div style={{ display: 'inline-block', background: (CATEGORY_COLORS[openArticle.category] || '#8A93A6') + '20', border: '1px solid ' + (CATEGORY_COLORS[openArticle.category] || '#8A93A6') + '40', borderRadius: 100, padding: '0.25rem 0.85rem', fontSize: '0.72rem', fontWeight: 600, color: CATEGORY_COLORS[openArticle.category] || '#8A93A6', marginBottom: '1.1rem', textTransform: 'capitalize' }}>
                {openArticle.category}
              </div>

              <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.55rem', fontWeight: 800, color: '#F1F3F8', marginBottom: '1.25rem', lineHeight: 1.3 }}>
                {openArticle.title}
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The problem</div>
                <p style={{ fontSize: '0.92rem', color: '#B0B8C8', lineHeight: 1.8 }}>{openArticle.problem_description}</p>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34D399', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The solution</div>
                <p style={{ fontSize: '0.92rem', color: '#D6DCE8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{openArticle.solution}</p>
              </div>

              {openArticle.tags && openArticle.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem' }}>
                  {openArticle.tags.map(function (t) {
                    return <span key={t} style={{ fontSize: '0.72rem', color: '#8A93A6', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.22rem 0.65rem', borderRadius: 100 }}>#{t}</span>
                  })}
                </div>
              )}

              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: '#5C6478', marginBottom: '1.1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="eye" size={14} /> {openArticle.views} views</span>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8A93A6', marginBottom: '0.75rem' }}>Was this article helpful?</div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {REACTIONS.map(function (r) {
                    var articleVotes = voted[openArticle.id] || []
                    var hasVoted = articleVotes.indexOf(r.key) !== -1
                    var count = openArticle[r.key + '_count'] || 0
                    return (
                      <button
                        key={r.key}
                        className="react-btn"
                        onClick={function () { react(openArticle.id, r.key) }}
                        disabled={hasVoted}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem',
                          background: hasVoted ? r.color + '20' : 'rgba(255,255,255,0.04)',
                          border: '1.5px solid ' + (hasVoted ? r.color + '55' : 'rgba(255,255,255,0.1)'),
                          borderRadius: 100, fontSize: '0.82rem', fontWeight: 600,
                          color: hasVoted ? r.color : '#D6DCE8',
                          cursor: hasVoted ? 'default' : 'pointer', fontFamily: 'Inter,sans-serif',
                        }}
                      >
                        <Icon name={r.icon} size={15} />
                        {r.label}
                        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', opacity: 0.8 }}>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                  <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading articles...</div>
                </div>
              ) : articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 }}>
                  <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="book-open" size={44} strokeWidth={1.4} /></div>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.05rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.5rem' }}>No articles found</div>
                  <p style={{ fontSize: '0.85rem', color: '#8A93A6', marginBottom: '1.5rem' }}>Try a different search term, or submit a ticket and our team will help directly.</p>
                  <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.6rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Sora,sans-serif' }}>
                    <Icon name="ticket" size={15} /> Submit a ticket
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {articles.map(function (a) {
                    var color = CATEGORY_COLORS[a.category] || '#8A93A6'
                    return (
                      <div key={a.id} className="art-card" onClick={function () { openOne(a) }} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.4rem 1.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: color, background: color + '20', padding: '0.15rem 0.55rem', borderRadius: 100, textTransform: 'capitalize' }}>{a.category}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#5C6478' }}><Icon name="eye" size={12} /> {a.views}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#34D399' }}><Icon name="thumbs-up" size={12} /> {a.helpful_count}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#F97316' }}><Icon name="heart" size={12} /> {a.love_count || 0}</span>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.3rem' }}>{a.title}</div>
                            <div style={{ fontSize: '0.82rem', color: '#8A93A6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.problem_description}</div>
                          </div>
                          <div style={{ color: '#3A3F52', flexShrink: 0 }}><Icon name="chevron-right" size={20} /></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3rem 6% 2rem', background: '#05070D' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <img src="/aeg_logo.png" alt="AEG" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
          <div style={{ fontSize: '0.78rem', color: '#5C6478' }}>&copy; 2026 Adaptive Engineering Group Ltd</div>
        </div>
      </footer>
    </>
  )
}