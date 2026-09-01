import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'

const ROLE_CONFIG = {
  client: { color: '#4ECDC4', bg: 'rgba(78,205,196,0.12)',  border: 'rgba(78,205,196,0.25)',  label: '🙋 Client',  av: { bg: 'rgba(78,205,196,0.15)',  color: '#4ECDC4' } },
  staff:  { color: '#A78BFF', bg: 'rgba(167,139,255,0.12)', border: 'rgba(167,139,255,0.25)', label: '👷 Staff',   av: { bg: 'rgba(167,139,255,0.15)', color: '#A78BFF' } },
  admin:  { color: '#FFD93D', bg: 'rgba(255,211,61,0.12)',  border: 'rgba(255,211,61,0.25)',  label: '⚙️ Admin',  av: { bg: 'rgba(255,211,61,0.15)',  color: '#FFD93D' } },
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#0B1525', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'2rem', width:'100%', maxWidth:500, position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#FFD93D,transparent)', borderRadius:'20px 20px 0 0' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem', fontWeight:800, color:'#F0F0FF' }}>{title}</div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(240,240,255,0.55)', fontSize:'1rem', transition:'all 0.2s' }}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(255,107,107,0.12)';e.currentTarget.style.color='#FF8E8E'}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(240,240,255,0.55)'}}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, icon, required, children }) {
  return (
    <div>
      <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.72rem', fontWeight:600, color:'rgba(240,240,255,0.4)', marginBottom:'0.5rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>
        {icon && <span>{icon}</span>}{label}{required && <span style={{ color:'#FF6B6B' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCss = { width:'100%', padding:'0.82rem 1rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:11, color:'#F0F0FF', fontSize:'0.88rem', fontFamily:'Inter,sans-serif', outline:'none', transition:'all 0.2s' }
const inputFocus = e => { e.target.style.borderColor='rgba(255,211,61,0.4)'; e.target.style.boxShadow='0 0 0 3px rgba(255,211,61,0.08)'; e.target.style.background='rgba(255,211,61,0.03)' }
const inputBlur  = e => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.04)' }

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore()
  const showToast = useToast()
  const [allUsers, setAllUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [showConfirm, setShowConfirm] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [formError, setFormError] = useState('')
  const [editError, setEditError] = useState('')

  const [form, setForm] = useState({ full_name:'', email:'', password:'', role:'client', department:'', phone:'' })
  const [editForm, setEditForm] = useState({ full_name:'', email:'', role:'client', department:'', phone:'', is_active:true })

  useEffect(() => { loadUsers() }, [])
  useEffect(() => {
    let r = allUsers
    if (roleFilter) r = r.filter(u => u.role === roleFilter)
    if (search.trim()) {
      const s = search.toLowerCase()
      r = r.filter(u => u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.department||'').toLowerCase().includes(s))
    }
    setFiltered(r)
  }, [search, roleFilter, allUsers])

  const loadUsers = async () => {
    try {
      const res = await users.list()
      if (res) { setAllUsers(res); setFiltered(res) }
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const createUser = async (e) => {
    e.preventDefault(); setFormError(''); setCreating(true)
    try {
      await users.create({ full_name:form.full_name, email:form.email, password:form.password, role:form.role, department:form.department||null, phone:form.phone||null })
      setShowCreate(false)
      setForm({ full_name:'', email:'', password:'', role:'client', department:'', phone:'' })
      showToast(`${form.full_name} created successfully`)
      loadUsers()
    } catch(err) { setFormError(err.message||'Failed to create user') }
    finally { setCreating(false) }
  }

  const openEdit = (u) => {
    setEditUser(u)
    setEditForm({ full_name:u.full_name, email:u.email, role:u.role, department:u.department||'', phone:u.phone||'', is_active:u.is_active })
    setEditError('')
  }

  const saveEdit = async (e) => {
    e.preventDefault(); setEditError(''); setSaving(true)
    try {
      await users.update(editUser.id, { full_name:editForm.full_name, email:editForm.email, role:editForm.role, department:editForm.department||null, phone:editForm.phone||null, is_active:editForm.is_active })
      showToast(`${editForm.full_name} updated successfully`)
      setEditUser(null)
      loadUsers()
    } catch(err) { setEditError(err.message||'Failed to update user') }
    finally { setSaving(false) }
  }

  const deactivateUser = async (id) => {
    try { await users.deactivate(id); showToast('User deactivated'); setShowConfirm(null); loadUsers() }
    catch(e) { showToast(e.message||'Failed to deactivate','error'); setShowConfirm(null) }
  }

  const reactivate = async (id) => {
    try { await users.update(id,{is_active:true}); showToast('User reactivated'); loadUsers() }
    catch(e) { showToast(e.message||'Failed to reactivate','error') }
  }

  const counts = { total:allUsers.length, clients:allUsers.filter(u=>u.role==='client').length, staff:allUsers.filter(u=>u.role==='staff').length, admins:allUsers.filter(u=>u.role==='admin').length }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .user-card { transition: all 0.25s; }
    .user-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.35) !important; }
    .role-tab:hover { opacity: 0.85; }
    select option { background: #0B1525; }
  `

  const selectStyle = { ...inputCss, cursor:'pointer' }

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="User Management"
        subtitle={`${counts.total} users registered`}
        actions={
          <button onClick={() => setShowCreate(true)} style={{ padding:'0.6rem 1.25rem', background:'linear-gradient(135deg,#FFD93D,#FF8E53)', color:'#04050F', border:'none', borderRadius:100, fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'Syne,sans-serif', boxShadow:'0 0 20px rgba(255,211,61,0.3)', transition:'all 0.2s' }}
            onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 0 30px rgba(255,211,61,0.45)'}}
            onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 0 20px rgba(255,211,61,0.3)'}}
          >+ Add User</button>
        }
      />

      <div style={{ padding:'2rem', fontFamily:'Inter,sans-serif', animation:'fadeIn 0.5s ease both' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { label:'Total Users', value:counts.total,   accent:'#FFD93D', icon:'👥' },
            { label:'Clients',     value:counts.clients, accent:'#4ECDC4', icon:'🙋' },
            { label:'Staff',       value:counts.staff,   accent:'#A78BFF', icon:'👷' },
            { label:'Admins',      value:counts.admins,  accent:'#FF8E53', icon:'⚙️' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'1.25rem', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:s.accent }} />
              <div style={{ fontSize:'1.3rem', marginBottom:'0.6rem' }}>{s.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, color:'#F0F0FF', letterSpacing:'-0.03em', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:'0.75rem', color:'rgba(240,240,255,0.4)', marginTop:'0.3rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:240 }}>
            <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', fontSize:'0.85rem', opacity:0.35, pointerEvents:'none' }}>🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, department..."
              style={{ width:'100%', padding:'0.75rem 1rem 0.75rem 2.6rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:11, color:'#F0F0FF', fontSize:'0.875rem', fontFamily:'Inter,sans-serif', outline:'none', transition:'all 0.2s' }}
              onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>
        </div>

        {/* Role tabs */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.75rem', flexWrap:'wrap' }}>
          {[['','All Users','rgba(255,255,255,0.07)','rgba(255,255,255,0.03)','rgba(240,240,255,0.5)'],['client','Clients','rgba(78,205,196,0.35)','rgba(78,205,196,0.1)','#4ECDC4'],['staff','Staff','rgba(167,139,255,0.35)','rgba(167,139,255,0.1)','#A78BFF'],['admin','Admins','rgba(255,211,61,0.35)','rgba(255,211,61,0.1)','#FFD93D']].map(([v,l,bc,bg,c]) => (
            <button key={v} className="role-tab" onClick={() => setRoleFilter(v)} style={{ padding:'0.4rem 1rem', borderRadius:100, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', border:`1px solid ${roleFilter===v?bc:'rgba(255,255,255,0.07)'}`, background:roleFilter===v?bg:'rgba(255,255,255,0.03)', color:roleFilter===v?c:'rgba(240,240,255,0.4)', fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}>{l}</button>
          ))}
        </div>

        {/* Users grid */}
        {loading ? (
          <div style={{ padding:'4rem', textAlign:'center' }}>
            <div style={{ width:36, height:36, border:'3px solid rgba(255,211,61,0.2)', borderTopColor:'#FFD93D', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }} />
            <div style={{ color:'rgba(240,240,255,0.35)', fontSize:'0.85rem' }}>Loading users...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'5rem 2rem', textAlign:'center' }}>
            <div style={{ fontSize:'3.5rem', marginBottom:'1rem', opacity:0.3 }}>👥</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem', fontWeight:700, color:'#F0F0FF', marginBottom:'0.5rem' }}>No users found</div>
            <p style={{ fontSize:'0.85rem', color:'rgba(240,240,255,0.4)' }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:'1rem' }}>
            {filtered.map(u => {
              const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.client
              const initials = u.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
              const isSelf = u.id === currentUser?.id

              return (
                <div key={u.id} className="user-card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:'1.5rem', position:'relative', overflow:'hidden', opacity:u.is_active?1:0.55 }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:rc.color }} />

                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'0.85rem', marginBottom:'1.1rem' }}>
                    <div style={{ width:46, height:46, borderRadius:'50%', background:rc.av.bg, color:rc.av.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.95rem', fontWeight:800, flexShrink:0, fontFamily:'Syne,sans-serif', border:`2px solid ${rc.color}30` }}>{initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.92rem', fontWeight:700, color:'#F0F0FF', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:'0.15rem' }}>
                        {u.full_name} {isSelf && <span style={{ fontSize:'0.65rem', color:'#FFD93D', background:'rgba(255,211,61,0.12)', padding:'0.1rem 0.4rem', borderRadius:4, marginLeft:'0.3rem' }}>You</span>}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'rgba(240,240,255,0.4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.email}</div>
                    </div>
                    <span style={{ fontSize:'0.65rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:100, background:rc.bg, color:rc.color, border:`1px solid ${rc.border}`, whiteSpace:'nowrap', flexShrink:0 }}>{rc.label}</span>
                  </div>

                  {/* Details */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'1.1rem', padding:'0.85rem', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
                    {u.department && <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'rgba(240,240,255,0.5)' }}><span>🏢</span>{u.department}</div>}
                    {u.phone     && <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'rgba(240,240,255,0.5)' }}><span>📱</span>{u.phone}</div>}
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'rgba(240,240,255,0.5)' }}><span>📅</span>Joined {helpers.timeAgo(u.created_at)}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'rgba(240,240,255,0.5)' }}><span>🕐</span>Last login: {u.last_login ? helpers.timeAgo(u.last_login) : 'Never'}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color: u.is_active?'#4ECDC4':'#FF8E8E' }}>
                      <span>{u.is_active?'✅':'❌'}</span>{u.is_active?'Active':'Inactive'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button onClick={() => openEdit(u)} style={{ flex:1, padding:'0.55rem 0', background:'rgba(255,211,61,0.08)', border:'1px solid rgba(255,211,61,0.2)', color:'#FFD93D', borderRadius:10, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'Inter,sans-serif', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}
                      onMouseOver={e=>{e.currentTarget.style.background='rgba(255,211,61,0.15)'}}
                      onMouseOut={e=>{e.currentTarget.style.background='rgba(255,211,61,0.08)'}}
                    >✏️ Edit</button>
                    {!isSelf && u.is_active && (
                      <button onClick={() => setShowConfirm(u)} style={{ padding:'0.55rem 0.85rem', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', color:'#FF8E8E', borderRadius:10, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}
                        onMouseOver={e=>{e.currentTarget.style.background='rgba(255,107,107,0.15)'}}
                        onMouseOut={e=>{e.currentTarget.style.background='rgba(255,107,107,0.08)'}}
                      >Deactivate</button>
                    )}
                    {!u.is_active && (
                      <button onClick={() => reactivate(u.id)} style={{ padding:'0.55rem 0.85rem', background:'rgba(78,205,196,0.08)', border:'1px solid rgba(78,205,196,0.2)', color:'#4ECDC4', borderRadius:10, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}
                        onMouseOver={e=>{e.currentTarget.style.background='rgba(78,205,196,0.15)'}}
                        onMouseOut={e=>{e.currentTarget.style.background='rgba(78,205,196,0.08)'}}
                      >Reactivate</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── CREATE USER MODAL ── */}
      {showCreate && (
        <Modal title="Add New User" onClose={() => setShowCreate(false)}>
          {formError && (
            <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.25)', color:'#FF8E8E', padding:'0.75rem 1rem', borderRadius:10, fontSize:'0.83rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              ⚠️ {formError}
            </div>
          )}
          <form onSubmit={createUser}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Full name" icon="👤" required>
                  <input type="text" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Jean Pierre Habimana" required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Email" icon="✉️" required>
                  <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="user@aegis.rw" required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <FormField label="Role" icon="🎭" required>
                <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={selectStyle} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="client">🙋 Client</option>
                  <option value="staff">👷 Staff</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
              </FormField>
              <FormField label="Department" icon="🏢">
                <input type="text" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Engineering" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
              </FormField>
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Phone" icon="📱">
                  <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+250 7XX XXX XXX" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Password" icon="🔑" required>
                  <div style={{ position:'relative' }}>
                    <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min. 8 characters" required style={{...inputCss,paddingRight:'3rem'}} onFocus={inputFocus} onBlur={inputBlur} />
                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'rgba(240,240,255,0.35)', padding:0 }}>{showPass?'🙈':'👁️'}</button>
                  </div>
                </FormField>
              </div>
            </div>
            <button type="submit" disabled={creating} style={{ width:'100%', padding:'1rem', marginTop:'1.5rem', background:'linear-gradient(135deg,#FFD93D,#FF8E53)', color:'#04050F', fontFamily:'Syne,sans-serif', fontSize:'0.95rem', fontWeight:800, border:'none', borderRadius:12, cursor:creating?'not-allowed':'pointer', opacity:creating?0.6:1, transition:'all 0.2s', boxShadow:'0 0 24px rgba(255,211,61,0.25)' }}>
              {creating ? 'Creating user...' : 'Create User →'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editUser && (
        <Modal title={`Edit — ${editUser.full_name}`} onClose={() => setEditUser(null)}>
          {/* User avatar header */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, marginBottom:'1.5rem' }}>
            {(() => {
              const rc = ROLE_CONFIG[editUser.role] || ROLE_CONFIG.client
              const initials = editUser.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
              return (
                <>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:rc.av.bg, color:rc.av.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:800, flexShrink:0, fontFamily:'Syne,sans-serif' }}>{initials}</div>
                  <div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:'0.95rem', fontWeight:700, color:'#F0F0FF' }}>{editUser.full_name}</div>
                    <div style={{ fontSize:'0.75rem', color:'rgba(240,240,255,0.4)' }}>{editUser.email} · Joined {helpers.timeAgo(editUser.created_at)}</div>
                  </div>
                </>
              )
            })()}
          </div>

          {editError && (
            <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.25)', color:'#FF8E8E', padding:'0.75rem 1rem', borderRadius:10, fontSize:'0.83rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              ⚠️ {editError}
            </div>
          )}

          <form onSubmit={saveEdit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Full name" icon="👤" required>
                  <input type="text" value={editForm.full_name} onChange={e=>setEditForm({...editForm,full_name:e.target.value})} required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Email" icon="✉️" required>
                  <input type="email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <FormField label="Role" icon="🎭" required>
                <select value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})} style={selectStyle} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="client">🙋 Client</option>
                  <option value="staff">👷 Staff</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
              </FormField>
              <FormField label="Department" icon="🏢">
                <input type="text" value={editForm.department} onChange={e=>setEditForm({...editForm,department:e.target.value})} placeholder="Engineering" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
              </FormField>
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Phone" icon="📱">
                  <input type="tel" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})} placeholder="+250 7XX XXX XXX" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              {/* Status toggle */}
              <div style={{ gridColumn:'1/-1' }}>
                <FormField label="Account status" icon="🔘">
                  <div style={{ display:'flex', gap:'0.75rem' }}>
                    {[true,false].map(val => (
                      <button key={String(val)} type="button" onClick={()=>setEditForm({...editForm,is_active:val})} style={{ flex:1, padding:'0.75rem', borderRadius:11, border:`1px solid ${editForm.is_active===val?(val?'rgba(78,205,196,0.4)':'rgba(255,107,107,0.4)'):'rgba(255,255,255,0.07)'}`, background:editForm.is_active===val?(val?'rgba(78,205,196,0.1)':'rgba(255,107,107,0.1)'):'rgba(255,255,255,0.03)', color:editForm.is_active===val?(val?'#4ECDC4':'#FF8E8E'):'rgba(240,240,255,0.35)', fontFamily:'Inter,sans-serif', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
                        {val ? '✅ Active' : '❌ Inactive'}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
            </div>

            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
              <button type="button" onClick={() => setEditUser(null)} style={{ flex:1, padding:'0.9rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(240,240,255,0.55)', borderRadius:12, cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.9rem', transition:'all 0.2s' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ flex:2, padding:'0.9rem', background:'linear-gradient(135deg,#FFD93D,#FF8E53)', color:'#04050F', fontFamily:'Syne,sans-serif', fontSize:'0.95rem', fontWeight:800, border:'none', borderRadius:12, cursor:saving?'not-allowed':'pointer', opacity:saving?0.6:1, transition:'all 0.2s' }}>
                {saving ? 'Saving changes...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CONFIRM DEACTIVATE ── */}
      {showConfirm && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
          onClick={e=>e.target===e.currentTarget&&setShowConfirm(null)}>
          <div style={{ background:'#0B1525', border:'1px solid rgba(255,107,107,0.2)', borderRadius:20, padding:'2.25rem', width:'100%', maxWidth:380, textAlign:'center', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#FF5F7E,transparent)', borderRadius:'20px 20px 0 0' }} />
            <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem', margin:'0 auto 1.25rem' }}>⚠️</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.15rem', fontWeight:800, color:'#F0F0FF', marginBottom:'0.6rem' }}>Deactivate user?</div>
            <p style={{ color:'rgba(240,240,255,0.45)', fontSize:'0.875rem', lineHeight:1.65, marginBottom:'1.75rem' }}>
              <strong style={{ color:'#F0F0FF' }}>{showConfirm.full_name}</strong> will immediately lose access to AEGIS. You can reactivate them at any time.
            </p>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={()=>setShowConfirm(null)} style={{ flex:1, padding:'0.75rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(240,240,255,0.55)', borderRadius:11, cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.875rem', transition:'all 0.2s' }}>Cancel</button>
              <button onClick={()=>deactivateUser(showConfirm.id)} style={{ flex:1, padding:'0.75rem', background:'rgba(255,107,107,0.12)', border:'1px solid rgba(255,107,107,0.3)', color:'#FF8E8E', borderRadius:11, cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.875rem', fontWeight:600, transition:'all 0.2s' }}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}