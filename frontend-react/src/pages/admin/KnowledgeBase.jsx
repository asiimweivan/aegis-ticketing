import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { kb } from '../../services/api'
import { useToast } from '../../components/ui/Toast'

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
  if (name === 'edit') return <svg {...common}><path d="M4 20h4l10.5-10.5a2 2 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
  if (name === 'trash') return <svg {...common}><path d="M4 7h16" /><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /><path d="M8 7v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" /><path d="M10 11v6M14 11v6" /></svg>
  if (name === 'x') return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  if (name === 'thumbs-up') return <svg {...common}><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" /><path d="M7 11l4-7c1.2 0 2.2 1 2.2 2.2V9H17a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 15.8 19H10a3 3 0 0 1-3-3" /></svg>
  if (name === 'thumbs-down') return <svg {...common}><path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Z" /><path d="M17 13l-4 7c-1.2 0-2.2-1-2.2-2.2V15H7a2 2 0 0 1-2-2.4l1.2-6A2 2 0 0 1 8.2 5H14a3 3 0 0 1 3 3" /></svg>
  if (name === 'heart') return <svg {...common}><path d="M12 20.5s-7.5-4.6-9.8-9.3C.6 7.9 2.4 4.5 6 4c2-.3 3.6.6 6 3 2.4-2.4 4-3.3 6-3 3.6.5 5.4 3.9 3.8 7.2C19.5 15.9 12 20.5 12 20.5Z" /></svg>
  if (name === 'help-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M9.2 9.2a2.8 2.8 0 0 1 5.4.9c0 1.8-2.6 2-2.6 3.6" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'book-open') return <svg {...common}><path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5Z" /><path d="M12 6.5v13" /></svg>
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  return null
}

var CATEGORIES = ['technical', 'administrative', 'billing', 'infrastructure', 'hr', 'security', 'general']
var CAT_COLORS = { technical: '#7C6FEE', administrative: '#0EA5E9', billing: '#FBBF24', infrastructure: '#F87171', hr: '#34D399', security: '#F97316', general: '#8A93A6' }
var emptyForm = { title: '', problem_description: '', solution: '', category: 'technical', tags: '' }

export default function AdminKnowledgeBase() {
  var showToast = useToast()
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
  var showModalArr = useState(false)
  var showModal = showModalArr[0]
  var setShowModal = showModalArr[1]
  var editingIdArr = useState(null)
  var editingId = editingIdArr[0]
  var setEditingId = editingIdArr[1]
  var formArr = useState(emptyForm)
  var form = formArr[0]
  var setForm = formArr[1]
  var savingArr = useState(false)
  var saving = savingArr[0]
  var setSaving = savingArr[1]
  var deleteConfirmIdArr = useState(null)
  var deleteConfirmId = deleteConfirmIdArr[0]
  var setDeleteConfirmId = deleteConfirmIdArr[1]

  useEffect(function () { loadArticles() }, [category])
  useEffect(function () {
    var t = setTimeout(function () { loadArticles() }, 350)
    return function () { clearTimeout(t) }
  }, [search])

  function loadArticles() {
    setLoading(true)
    var params = { page_size: 100 }
    if (category) params.category = category
    if (search.trim()) params.search = search.trim()
    kb.list(params).then(function (res) {
      if (res) setArticles(res.articles || [])
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(article) {
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

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    var payload = {
      title: form.title,
      problem_description: form.problem_description,
      solution: form.solution,
      category: form.category,
      tags: form.tags.split(',').map(function (t) { return t.trim() }).filter(Boolean),
    }
    var action = editingId ? kb.update(editingId, payload) : kb.create(payload)
    action.then(function () {
      showToast(editingId ? 'Article updated' : 'Article created')
      closeModal()
      loadArticles()
    }).catch(function (err) {
      showToast(err.message || 'Failed to save article', 'error')
    }).finally(function () { setSaving(false) })
  }

  function handleDelete(id) {
    kb.delete(id).then(function () {
      showToast('Article deleted')
      setDeleteConfirmId(null)
      loadArticles()
    }).catch(function (err) {
      showToast(err.message || 'Failed to delete article', 'error')
    })
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    @keyframes popIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }\n    .kb-row:hover { background:rgba(255,255,255,0.03) !important; }\n    .icon-btn { transition:all 0.15s; }\n    .icon-btn:hover { background:rgba(255,255,255,0.08) !important; }\n    .icon-btn.danger:hover { background:rgba(248,113,113,0.12) !important; color:#F87171 !important; }\n    .modal-inp { width:100%; padding:0.7rem 0.9rem; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.1); border-radius:10px; color:#F1F3F8; font-size:0.88rem; font-family:'Inter',sans-serif; outline:none; transition:all 0.2s; }\n    .modal-inp:focus { border-color:#F97316; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    select { color-scheme: dark; }\n    select option { background:#0B0E17; color:#F1F3F8; }\n    .kb-cat-select { transition:all 0.2s; }\n    .kb-cat-select:hover, .kb-cat-select:focus { border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .kb-search-inp:focus { border-color:#F97316 !important; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Knowledge Base"
        subtitle={loading ? 'Loading...' : articles.length + ' articles'}
        actions={
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 14px rgba(232,69,10,0.35)' }}>
            <Icon name="plus" size={15} /> New Article
          </button>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>
          Manage Articles
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', display: 'flex' }}><Icon name="search" size={15} /></span>
            <input type="text" value={search} onChange={function (e) { setSearch(e.target.value) }} placeholder="Search articles..." className="kb-search-inp"
              style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none' }}
            />
          </div>
          <select value={category} onChange={function (e) { setCategory(e.target.value) }} className="kb-cat-select" style={{ padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F8', fontSize: '0.85rem', fontFamily: "'Inter',sans-serif", outline: 'none', cursor: 'pointer' }}>
            <option value="">All categories</option>
            {CATEGORIES.map(function (c) { return <option key={c} value={c}>{c}</option> })}
          </select>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 70px 70px 70px 70px 130px', gap: '0.6rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Title', 'Category', 'Views', 'Helpful', 'Not Helpful', 'Love', 'Actions'].map(function (h) {
              return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.6rem', color: '#5C6478', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</span>
            })}
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
              <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading articles...</div>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="book-open" size={40} strokeWidth={1.4} /></div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.4rem' }}>No articles yet</div>
              <p style={{ fontSize: '0.85rem', color: '#5C6478', marginBottom: '1.5rem' }}>Create your first Knowledge Base article to help clients self-serve.</p>
              <button onClick={openCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>
                <Icon name="plus" size={15} /> New Article
              </button>
            </div>
          ) : articles.map(function (a) {
            var color = CAT_COLORS[a.category] || '#8A93A6'
            return (
              <div key={a.id} className="kb-row" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 70px 70px 70px 70px 130px', gap: '0.6rem', alignItems: 'center', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F3F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#5C6478', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.problem_description}</div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: color, background: color + '20', padding: '0.2rem 0.55rem', borderRadius: 100, textTransform: 'capitalize', width: 'fit-content' }}>{a.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.76rem', color: '#8A93A6' }}><Icon name="eye" size={12} /> {a.views}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.76rem', color: '#34D399' }}><Icon name="thumbs-up" size={12} /> {a.helpful_count}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.76rem', color: '#F87171' }}><Icon name="thumbs-down" size={12} /> {a.not_helpful_count || 0}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.76rem', color: '#F97316' }}><Icon name="heart" size={12} /> {a.love_count || 0}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="icon-btn" onClick={function () { openEdit(a) }} title="Edit" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', color: '#D6DCE8' }}>
                    <Icon name="edit" size={14} />
                  </button>
                  <button className="icon-btn danger" onClick={function () { setDeleteConfirmId(a.id) }} title="Delete" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', color: '#5C6478' }}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={function (e) { if (e.target === e.currentTarget) closeModal() }}>
          <div style={{ background: '#0B0E17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', animation: 'popIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.01em' }}>{editingId ? 'Edit Article' : 'New Article'}</div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A93A6' }}>
                <Icon name="x" size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.4rem' }}>Title *</label>
                <input required value={form.title} onChange={function (e) { setForm(Object.assign({}, form, { title: e.target.value })) }} className="modal-inp" placeholder="e.g. How do I reset my password?" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.4rem' }}>Category *</label>
                <select required value={form.category} onChange={function (e) { setForm(Object.assign({}, form, { category: e.target.value })) }} className="modal-inp" style={{ cursor: 'pointer' }}>
                  {CATEGORIES.map(function (c) { return <option key={c} value={c}>{c}</option> })}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.4rem' }}>Problem description *</label>
                <textarea required value={form.problem_description} onChange={function (e) { setForm(Object.assign({}, form, { problem_description: e.target.value })) }} className="modal-inp" rows={3} placeholder="Describe the issue this article addresses..." style={{ resize: 'vertical', fontFamily: "'Inter',sans-serif" }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.4rem' }}>Solution *</label>
                <textarea required value={form.solution} onChange={function (e) { setForm(Object.assign({}, form, { solution: e.target.value })) }} className="modal-inp" rows={5} placeholder="Step-by-step solution..." style={{ resize: 'vertical', fontFamily: "'Inter',sans-serif" }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#B0B8C8', marginBottom: '0.4rem' }}>Tags (comma-separated)</label>
                <input value={form.tags} onChange={function (e) { setForm(Object.assign({}, form, { tags: e.target.value })) }} className="modal-inp" placeholder="password, login, vpn" />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#D6DCE8', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.8rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {saving ? (
                    <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg> Saving...</>
                  ) : editingId ? 'Save Changes' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={function (e) { if (e.target === e.currentTarget) setDeleteConfirmId(null) }}>
          <div style={{ background: '#0B0E17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 380, animation: 'popIn 0.2s ease' }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.01em', marginBottom: '0.6rem' }}>Delete this article?</div>
            <p style={{ fontSize: '0.85rem', color: '#8A93A6', lineHeight: 1.6, marginBottom: '1.5rem' }}>This can't be undone. The article will be permanently removed from the Knowledge Base.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={function () { setDeleteConfirmId(null) }} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#D6DCE8', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>Cancel</button>
              <button onClick={function () { handleDelete(deleteConfirmId) }} style={{ flex: 1, padding: '0.75rem', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}