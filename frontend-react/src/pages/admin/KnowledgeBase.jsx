import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { kb } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

/* ── ICON SYSTEM — matches the rest of the app, no emoji ── */
function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case 'edit':
      return <svg {...common}><path d="M4 20h4l10.5-10.5a2 2 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
    case 'trash':
      return <svg {...common}><path d="M4 7h16" /><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /><path d="M8 7v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" /><path d="M10 11v6M14 11v6" /></svg>
    case 'x':
      return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
    case 'eye':
      return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    case 'thumbs-up':
      return <svg {...common}><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" /><path d="M7 11l4-7c1.2 0 2.2 1 2.2 2.2V9H17a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 15.8 19H10a3 3 0 0 1-3-3" /></svg>
    case 'book-open':
      return <svg {...common}><path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z" /><path d="M12 6.5v13" /></svg>
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
    default:
      return null
  }
}

const CATEGORIES = ['technical','administrative','billing','infrastructure','hr','security','general']

const emptyForm = { title:'', problem_description:'', solution:'', category:'technical', tags:'' }

export default function AdminKnowledgeBase() {
  const showToast = useToast()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => { loadArticles() }, [category])
  useEffect(() => {
    const t = setTimeout(() => loadArticles(), 350)
    return () => clearTimeout(t)
  }, [search])

  const loadArticles = async () => {
    setLoading(true)
    try {
      const params = { page_size: 100 }
      if (category) params.category = category
      if (search.trim()) params.search = search.trim()
      const res = await kb.list(params)
      if (res) setArticles(res.articles || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (article) => {
    setEditingId(article.id)
    setForm({
      title: article.title,
      problem_description: article.problem_description,
      solution: article.solution,
      category: article.category,
      tags: (article.tags || []).join(', '),
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        problem_description: form.problem_description,
        solution: form.solution,
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      if (editingId) {
        await kb.update(editingId, payload)
        showToast('Article updated')
      } else {
        await kb.create(payload)
        showToast('Article created')
      }
      closeModal()
      loadArticles()
    } catch (err) {
      showToast(err.message || 'Failed to save article', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await kb.delete(id)
      showToast('Article deleted')
      setDeleteConfirmId(null)
      loadArticles()
    } catch (err) {
      showToast(err.message || 'Failed to delete article', 'error')
    }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes popIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
    .kb-row:hover { background:#F8FAFC !important; }
    .cat-chip { transition:all 0.15s; }
    .icon-btn { transition:all 0.15s; }
    .icon-btn:hover { background:#F1F5F9 !important; }
    .icon-btn.danger:hover { background:#FEF2F2 !important; color:#DC2626 !important; }
    .modal-inp { width:100%; padding:0.7rem 0.9rem; background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:10px; color:#0F172A; font-size:0.88rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:all 0.2s; }
    .modal-inp:focus { border-color:#E8450A; box-shadow:0 0 0 3px rgba(232,69,10,0.1); }
  `

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Knowledge Base"
        subtitle={loading ? 'Loading...' : `${articles.length} articles`}
        actions={
          <button onClick={openCreate} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.6rem 1.2rem', background:'#E8450A', color:'#fff', border:'none', borderRadius:8, fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 2px 8px rgba(232,69,10,0.25)' }}>
            <Icon name="plus" size={15} /> New Article
          </button>
        }
      />

      <div style={{ padding:'2rem', fontFamily:'Plus Jakarta Sans,sans-serif', background:'#F8FAFC', minHeight:'100%', animation:'fadeIn 0.4s ease both' }}>

        {/* Filters */}
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:240 }}>
            <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', display:'flex' }}><Icon name="search" size={15} /></span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles..."
              style={{ width:'100%', padding:'0.7rem 1rem 0.7rem 2.6rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', borderRadius:10, color:'#0F172A', fontSize:'0.875rem', fontFamily:'Plus Jakarta Sans,sans-serif', outline:'none', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}
            />
          </div>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{ padding:'0.7rem 1rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', borderRadius:10, color:'#0F172A', fontSize:'0.85rem', fontFamily:'Plus Jakarta Sans,sans-serif', outline:'none', cursor:'pointer' }}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 130px 90px 90px 140px', gap:'0.75rem', padding:'0.75rem 1.5rem', background:'#F8FAFC', borderBottom:'1px solid #F1F5F9' }}>
            {['Title','Category','Views','Helpful','Actions'].map(h => (
              <span key={h} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.62rem', color:'#94A3B8', letterSpacing:'0.06em', textTransform:'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:'3rem', textAlign:'center' }}>
              <div style={{ width:32, height:32, border:'3px solid #FED7C8', borderTopColor:'#E8450A', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 0.75rem' }} />
              <div style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Loading articles...</div>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ padding:'4rem 2rem', textAlign:'center' }}>
              <div style={{ color:'#CBD5E1', marginBottom:'1rem', display:'flex', justifyContent:'center' }}><Icon name="book-open" size={40} strokeWidth={1.4} /></div>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1rem', fontWeight:700, color:'#0F172A', marginBottom:'0.4rem' }}>No articles yet</div>
              <p style={{ fontSize:'0.85rem', color:'#94A3B8', marginBottom:'1.5rem' }}>Create your first Knowledge Base article to help clients self-serve.</p>
              <button onClick={openCreate} style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.7rem 1.5rem', background:'#E8450A', color:'#fff', border:'none', borderRadius:100, fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                <Icon name="plus" size={15} /> New Article
              </button>
            </div>
          ) : articles.map(a => (
            <div key={a.id} className="kb-row" style={{ display:'grid', gridTemplateColumns:'1fr 130px 90px 90px 140px', gap:'0.75rem', alignItems:'center', padding:'0.9rem 1.5rem', borderBottom:'1px solid #F8FAFC' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.title}</div>
                <div style={{ fontSize:'0.72rem', color:'#94A3B8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.problem_description}</div>
              </div>
              <span style={{ fontSize:'0.72rem', fontWeight:600, color:'#E8450A', background:'#FFF5F2', padding:'0.2rem 0.6rem', borderRadius:100, textTransform:'capitalize', width:'fit-content' }}>{a.category}</span>
              <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.78rem', color:'#64748B' }}><Icon name="eye" size={13} /> {a.views}</span>
              <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.78rem', color:'#059669' }}><Icon name="thumbs-up" size={13} /> {a.helpful_count}</span>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                <button className="icon-btn" onClick={()=>openEdit(a)} title="Edit" style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFC', border:'1px solid #F1F5F9', borderRadius:8, cursor:'pointer', color:'#475569' }}>
                  <Icon name="edit" size={14} />
                </button>
                <button className="icon-btn danger" onClick={()=>setDeleteConfirmId(a.id)} title="Delete" style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFC', border:'1px solid #F1F5F9', borderRadius:8, cursor:'pointer', color:'#94A3B8' }}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
          onClick={e=>e.target===e.currentTarget && closeModal()}>
          <div style={{ background:'#FFFFFF', borderRadius:20, padding:'2rem', width:'100%', maxWidth:560, maxHeight:'88vh', overflowY:'auto', animation:'popIn 0.2s ease', boxShadow:'0 30px 80px rgba(15,23,42,0.25)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.15rem', fontWeight:800, color:'#0F172A' }}>{editingId ? 'Edit Article' : 'New Article'}</div>
              <button onClick={closeModal} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748B' }}>
                <Icon name="x" size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.4rem' }}>Title *</label>
                <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="modal-inp" placeholder="e.g. How do I reset my password?" />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.4rem' }}>Category *</label>
                <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="modal-inp" style={{ cursor:'pointer' }}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform:'capitalize' }}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.4rem' }}>Problem description *</label>
                <textarea required value={form.problem_description} onChange={e=>setForm({...form,problem_description:e.target.value})} className="modal-inp" rows={3} placeholder="Describe the issue this article addresses..." style={{ resize:'vertical', fontFamily:'Plus Jakarta Sans,sans-serif' }} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.4rem' }}>Solution *</label>
                <textarea required value={form.solution} onChange={e=>setForm({...form,solution:e.target.value})} className="modal-inp" rows={5} placeholder="Step-by-step solution..." style={{ resize:'vertical', fontFamily:'Plus Jakarta Sans,sans-serif' }} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'#374151', marginBottom:'0.4rem' }}>Tags (comma-separated)</label>
                <input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className="modal-inp" placeholder="password, login, vpn" />
              </div>

              <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
                <button type="button" onClick={closeModal} style={{ flex:1, padding:'0.8rem', background:'#F8FAFC', border:'1.5px solid #E2E8F0', color:'#374151', borderRadius:10, fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex:1, padding:'0.8rem', background:'#E8450A', color:'#fff', border:'none', borderRadius:10, fontSize:'0.85rem', fontWeight:700, cursor:saving?'not-allowed':'pointer', opacity:saving?0.6:1, fontFamily:'Plus Jakarta Sans,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
                  {saving ? (
                    <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> Saving...</>
                  ) : editingId ? 'Save Changes' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
          onClick={e=>e.target===e.currentTarget && setDeleteConfirmId(null)}>
          <div style={{ background:'#FFFFFF', borderRadius:16, padding:'1.75rem', width:'100%', maxWidth:380, animation:'popIn 0.2s ease' }}>
            <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.05rem', fontWeight:800, color:'#0F172A', marginBottom:'0.6rem' }}>Delete this article?</div>
            <p style={{ fontSize:'0.85rem', color:'#64748B', lineHeight:1.6, marginBottom:'1.5rem' }}>This can't be undone. The article will be permanently removed from the Knowledge Base.</p>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={()=>setDeleteConfirmId(null)} style={{ flex:1, padding:'0.75rem', background:'#F8FAFC', border:'1.5px solid #E2E8F0', color:'#374151', borderRadius:10, fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>Cancel</button>
              <button onClick={()=>handleDelete(deleteConfirmId)} style={{ flex:1, padding:'0.75rem', background:'#DC2626', color:'#fff', border:'none', borderRadius:10, fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
