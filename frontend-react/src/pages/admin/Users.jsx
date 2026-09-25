import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'

var ROLE_CONFIG = {
  client: { color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', label: 'Client', av: { bg: 'rgba(52,211,153,0.15)', color: '#34D399' } },
  staff: { color: '#B4ACF9', bg: 'rgba(124,111,238,0.12)', border: 'rgba(124,111,238,0.3)', label: 'Staff', av: { bg: 'rgba(124,111,238,0.15)', color: '#B4ACF9' } },
  admin: { color: '#F97316', bg: 'rgba(232,69,10,0.12)', border: 'rgba(249,115,22,0.3)', label: 'Admin', av: { bg: 'rgba(232,69,10,0.15)', color: '#F97316' } },
}

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'x') return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /></svg>
  if (name === 'building') return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 8h4v13h-4M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" /></svg>
  if (name === 'phone') return <svg {...common}><path d="M6.5 3.5c1 0 1.9.7 2.2 1.7l.7 2.3a2.3 2.3 0 0 1-.6 2.3l-1 1a13 13 0 0 0 5.4 5.4l1-1a2.3 2.3 0 0 1 2.3-.6l2.3.7c1 .3 1.7 1.2 1.7 2.2v1.8c0 1.3-1.1 2.4-2.5 2.2C10.7 20.4 3.6 13.3 2.5 6.5A2.4 2.4 0 0 1 4.7 4h1.8Z" /></svg>
  if (name === 'lock') return <svg {...common}><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  if (name === 'eye-off') return <svg {...common}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.9 17.9 0 0 1-3.4 4.3" /><path d="M6.7 6.7C4 8.5 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.5-.7" /><path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'edit') return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  if (name === 'users') return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /><path d="M16 8.5a3 3 0 1 1 0-5.9" /><path d="M14.5 14.3c2.7.3 4.5 2.6 4.5 5.7" /></svg>
  if (name === 'save') return <svg {...common}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M7 3v5h9V3M7 21v-8h10v8" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  return null
}

function Modal(props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={function (e) { if (e.target === e.currentTarget) props.onClose() }}>
      <div style={{ background: '#0B0E17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 500, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#F97316,transparent)', borderRadius: '20px 20px 0 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F8' }}>{props.title}</div>
          <button onClick={props.onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A93A6', transition: 'all 0.2s' }}
            onMouseOver={function (e) { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.color = '#F87171' }}
            onMouseOut={function (e) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#8A93A6' }}
          ><Icon name="x" size={14} /></button>
        </div>
        {props.children}
      </div>
    </div>
  )
}

function FormField(props) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 600, color: '#5C6478', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {props.icon && <Icon name={props.icon} size={12} />}{props.label}{props.required && <span style={{ color: '#F87171' }}>*</span>}
      </label>
      {props.children}
    </div>
  )
}

var inputCss = { width: '100%', padding: '0.82rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: '#F1F3F8', fontSize: '0.88rem', fontFamily: "'Inter',sans-serif", outline: 'none', transition: 'all 0.2s' }
function inputFocus(e) { e.target.style.borderColor = 'rgba(249,115,22,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)' }
function inputBlur(e) { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }

export default function AdminUsers() {
  var authStore = useAuthStore()
  var currentUser = authStore.user
  var showToast = useToast()
  var allUsersArr = useState([])
  var allUsers = allUsersArr[0]
  var setAllUsers = allUsersArr[1]
  var filteredArr = useState([])
  var filtered = filteredArr[0]
  var setFiltered = filteredArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var roleFilterArr = useState('')
  var roleFilter = roleFilterArr[0]
  var setRoleFilter = roleFilterArr[1]
  var searchArr = useState('')
  var search = searchArr[0]
  var setSearch = searchArr[1]
  var showCreateArr = useState(false)
  var showCreate = showCreateArr[0]
  var setShowCreate = showCreateArr[1]
  var editUserArr = useState(null)
  var editUser = editUserArr[0]
  var setEditUser = editUserArr[1]
  var showConfirmArr = useState(null)
  var showConfirm = showConfirmArr[0]
  var setShowConfirm = showConfirmArr[1]
  var creatingArr = useState(false)
  var creating = creatingArr[0]
  var setCreating = creatingArr[1]
  var savingArr = useState(false)
  var saving = savingArr[0]
  var setSaving = savingArr[1]
  var showPassArr = useState(false)
  var showPass = showPassArr[0]
  var setShowPass = showPassArr[1]
  var formErrorArr = useState('')
  var formError = formErrorArr[0]
  var setFormError = formErrorArr[1]
  var editErrorArr = useState('')
  var editError = editErrorArr[0]
  var setEditError = editErrorArr[1]

  var formArr = useState({ full_name: '', email: '', password: '', role: 'client', department: '', phone: '' })
  var form = formArr[0]
  var setForm = formArr[1]
  var editFormArr = useState({ full_name: '', email: '', role: 'client', department: '', phone: '', is_active: true })
  var editForm = editFormArr[0]
  var setEditForm = editFormArr[1]

  useEffect(function () { loadUsers() }, [])
  useEffect(function () {
    var r = allUsers
    if (roleFilter) r = r.filter(function (u) { return u.role === roleFilter })
    if (search.trim()) {
      var s = search.toLowerCase()
      r = r.filter(function (u) { return u.full_name.toLowerCase().indexOf(s) !== -1 || u.email.toLowerCase().indexOf(s) !== -1 || ((u.department || '').toLowerCase().indexOf(s) !== -1) })
    }
    setFiltered(r)
  }, [search, roleFilter, allUsers])

  function loadUsers() {
    users.list().then(function (res) {
      if (res) { setAllUsers(res); setFiltered(res) }
    }).catch(function (e) { console.error(e) }).finally(function () { setLoading(false) })
  }

  function createUser(e) {
    e.preventDefault(); setFormError(''); setCreating(true)
    users.create({ full_name: form.full_name, email: form.email, password: form.password, role: form.role, department: form.department || null, phone: form.phone || null }).then(function () {
      setShowCreate(false)
      setForm({ full_name: '', email: '', password: '', role: 'client', department: '', phone: '' })
      showToast(form.full_name + ' created successfully')
      loadUsers()
    }).catch(function (err) { setFormError(err.message || 'Failed to create user') }).finally(function () { setCreating(false) })
  }

  function openEdit(u) {
    setEditUser(u)
    setEditForm({ full_name: u.full_name, email: u.email, role: u.role, department: u.department || '', phone: u.phone || '', is_active: u.is_active })
    setEditError('')
  }

  function saveEdit(e) {
    e.preventDefault(); setEditError(''); setSaving(true)
    users.update(editUser.id, { full_name: editForm.full_name, email: editForm.email, role: editForm.role, department: editForm.department || null, phone: editForm.phone || null, is_active: editForm.is_active }).then(function () {
      showToast(editForm.full_name + ' updated successfully')
      setEditUser(null)
      loadUsers()
    }).catch(function (err) { setEditError(err.message || 'Failed to update user') }).finally(function () { setSaving(false) })
  }

  function deactivateUser(id) {
    users.deactivate(id).then(function () { showToast('User deactivated'); setShowConfirm(null); loadUsers() })
      .catch(function (e) { showToast(e.message || 'Failed to deactivate', 'error'); setShowConfirm(null) })
  }

  function reactivate(id) {
    users.update(id, { is_active: true }).then(function () { showToast('User reactivated'); loadUsers() })
      .catch(function (e) { showToast(e.message || 'Failed to reactivate', 'error') })
  }

  var counts = { total: allUsers.length, clients: allUsers.filter(function (u) { return u.role === 'client' }).length, staff: allUsers.filter(function (u) { return u.role === 'staff' }).length, admins: allUsers.filter(function (u) { return u.role === 'admin' }).length }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .user-card { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }\n    .user-card:hover { transform: translateY(-4px); border-color: rgba(249,115,22,0.25) !important; }\n    .role-tab:hover { opacity: 0.85; }\n    select option { background: #0B0E17; }\n  "

  var selectStyle = Object.assign({}, inputCss, { cursor: 'pointer' })

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="User Management"
        subtitle={counts.total + ' users registered'}
        actions={
          <button onClick={function () { setShowCreate(true) }} style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 100, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora',sans-serif", boxShadow: '0 4px 14px rgba(232,69,10,0.35)', transition: 'all 0.2s' }}
            onMouseOver={function (e) { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={function (e) { e.currentTarget.style.transform = 'translateY(0)' }}
          >+ Add User</button>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", animation: 'fadeIn 0.5s ease both', background: '#05070D', minHeight: '100%' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Users', value: counts.total, accent: '#F97316', icon: 'users' },
            { label: 'Clients', value: counts.clients, accent: '#34D399', icon: 'user' },
            { label: 'Staff', value: counts.staff, accent: '#B4ACF9', icon: 'shield' },
            { label: 'Admins', value: counts.admins, accent: '#FBBF24', icon: 'shield' },
          ].map(function (s) {
            return (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.accent }} />
                <div style={{ width: 34, height: 34, borderRadius: 9, background: s.accent + '1A', color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}><Icon name={s.icon} size={16} /></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A93A6', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#5C6478', pointerEvents: 'none', display: 'flex' }}><Icon name="search" size={15} /></span>
            <input type="text" value={search} onChange={function (e) { setSearch(e.target.value) }} placeholder="Search by name, email, department..."
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: '#F1F3F8', fontSize: '0.875rem', fontFamily: "'Inter',sans-serif", outline: 'none' }}
              onFocus={inputFocus} onBlur={inputBlur}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {[['', 'All Users', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.03)', '#8A93A6'], ['client', 'Clients', 'rgba(52,211,153,0.35)', 'rgba(52,211,153,0.1)', '#34D399'], ['staff', 'Staff', 'rgba(124,111,238,0.35)', 'rgba(124,111,238,0.1)', '#B4ACF9'], ['admin', 'Admins', 'rgba(249,115,22,0.35)', 'rgba(249,115,22,0.1)', '#F97316']].map(function (pair) {
            var v = pair[0], l = pair[1], bc = pair[2], bg = pair[3], c = pair[4]
            return <button key={v} className="role-tab" onClick={function () { setRoleFilter(v) }} style={{ padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1px solid ' + (roleFilter === v ? bc : 'rgba(255,255,255,0.08)'), background: roleFilter === v ? bg : 'rgba(255,255,255,0.03)', color: roleFilter === v ? c : '#8A93A6', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}>{l}</button>
          })}
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(249,115,22,0.2)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ color: '#5C6478', fontSize: '0.85rem' }}>Loading users...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ color: '#3A3F52', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Icon name="users" size={48} strokeWidth={1.3} /></div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.5rem' }}>No users found</div>
            <p style={{ fontSize: '0.85rem', color: '#5C6478' }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '1rem' }}>
            {filtered.map(function (u) {
              var rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.client
              var initials = u.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
              var isSelf = u.id === (currentUser && currentUser.id)

              return (
                <div key={u.id} className="user-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.5rem', position: 'relative', overflow: 'hidden', opacity: u.is_active ? 1 : 0.55 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: rc.color }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.1rem' }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: rc.av.bg, color: rc.av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 800, flexShrink: 0, fontFamily: "'Sora',sans-serif", border: '2px solid ' + rc.color + '30' }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F1F3F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.15rem' }}>
                        {u.full_name} {isSelf && <span style={{ fontSize: '0.65rem', color: '#F97316', background: 'rgba(249,115,22,0.12)', padding: '0.1rem 0.4rem', borderRadius: 4, marginLeft: '0.3rem' }}>You</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#5C6478', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 100, background: rc.bg, color: rc.color, border: '1px solid ' + rc.border, whiteSpace: 'nowrap', flexShrink: 0 }}>{rc.label}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.1rem', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                    {u.department && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#8A93A6' }}><Icon name="building" size={12} />{u.department}</div>}
                    {u.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#8A93A6' }}><Icon name="phone" size={12} />{u.phone}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#8A93A6' }}><Icon name="calendar" size={12} />Joined {helpers.timeAgo(u.created_at)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#8A93A6' }}><Icon name="clock" size={12} />Last login: {u.last_login ? helpers.timeAgo(u.last_login) : 'Never'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: u.is_active ? '#34D399' : '#F87171' }}>
                      <Icon name={u.is_active ? 'check-circle' : 'x'} size={12} />{u.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={function () { openEdit(u) }} style={{ flex: 1, padding: '0.55rem 0', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#FDBA74', borderRadius: 10, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                      onMouseOver={function (e) { e.currentTarget.style.background = 'rgba(249,115,22,0.18)' }}
                      onMouseOut={function (e) { e.currentTarget.style.background = 'rgba(249,115,22,0.1)' }}
                    ><Icon name="edit" size={13} /> Edit</button>
                    {!isSelf && u.is_active && (
                      <button onClick={function () { setShowConfirm(u) }} style={{ padding: '0.55rem 0.85rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', borderRadius: 10, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}
                        onMouseOver={function (e) { e.currentTarget.style.background = 'rgba(248,113,113,0.18)' }}
                        onMouseOut={function (e) { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                      >Deactivate</button>
                    )}
                    {!u.is_active && (
                      <button onClick={function () { reactivate(u.id) }} style={{ padding: '0.55rem 0.85rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399', borderRadius: 10, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s' }}
                        onMouseOver={function (e) { e.currentTarget.style.background = 'rgba(52,211,153,0.18)' }}
                        onMouseOut={function (e) { e.currentTarget.style.background = 'rgba(52,211,153,0.1)' }}
                      >Reactivate</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="Add New User" onClose={function () { setShowCreate(false) }}>
          {formError && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#FCA5A5', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.83rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="alert" size={14} /> {formError}
            </div>
          )}
          <form onSubmit={createUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Full name" icon="user" required>
                  <input type="text" value={form.full_name} onChange={function (e) { setForm(Object.assign({}, form, { full_name: e.target.value })) }} placeholder="Jean Pierre Habimana" required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Email" icon="mail" required>
                  <input type="email" value={form.email} onChange={function (e) { setForm(Object.assign({}, form, { email: e.target.value })) }} placeholder="user@aegis.rw" required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <FormField label="Role" icon="shield" required>
                <select value={form.role} onChange={function (e) { setForm(Object.assign({}, form, { role: e.target.value })) }} style={selectStyle} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              <FormField label="Department" icon="building">
                <input type="text" value={form.department} onChange={function (e) { setForm(Object.assign({}, form, { department: e.target.value })) }} placeholder="Engineering" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
              </FormField>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Phone" icon="phone">
                  <input type="tel" value={form.phone} onChange={function (e) { setForm(Object.assign({}, form, { phone: e.target.value })) }} placeholder="+250 7XX XXX XXX" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Password" icon="lock" required>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={function (e) { setForm(Object.assign({}, form, { password: e.target.value })) }} placeholder="Min. 8 characters" required style={Object.assign({}, inputCss, { paddingRight: '3rem' })} onFocus={inputFocus} onBlur={inputBlur} />
                    <button type="button" onClick={function () { setShowPass(!showPass) }} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5C6478', padding: 0, display: 'flex' }}><Icon name={showPass ? 'eye-off' : 'eye'} size={15} /></button>
                  </div>
                </FormField>
              </div>
            </div>
            <button type="submit" disabled={creating} style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 800, border: 'none', borderRadius: 12, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1, boxShadow: '0 4px 20px rgba(232,69,10,0.3)' }}>
              {creating ? 'Creating user...' : 'Create User \u2192'}
            </button>
          </form>
        </Modal>
      )}

      {editUser && (
        <Modal title={'Edit \u2014 ' + editUser.full_name} onClose={function () { setEditUser(null) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, marginBottom: '1.5rem' }}>
            {(function () {
              var rc = ROLE_CONFIG[editUser.role] || ROLE_CONFIG.client
              var initials = editUser.full_name.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
              return (
                <>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: rc.av.bg, color: rc.av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, flexShrink: 0, fontFamily: "'Sora',sans-serif" }}>{initials}</div>
                  <div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#F1F3F8' }}>{editUser.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#5C6478' }}>{editUser.email} &middot; Joined {helpers.timeAgo(editUser.created_at)}</div>
                  </div>
                </>
              )
            })()}
          </div>

          {editError && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#FCA5A5', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.83rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="alert" size={14} /> {editError}
            </div>
          )}

          <form onSubmit={saveEdit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Full name" icon="user" required>
                  <input type="text" value={editForm.full_name} onChange={function (e) { setEditForm(Object.assign({}, editForm, { full_name: e.target.value })) }} required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Email" icon="mail" required>
                  <input type="email" value={editForm.email} onChange={function (e) { setEditForm(Object.assign({}, editForm, { email: e.target.value })) }} required style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <FormField label="Role" icon="shield" required>
                <select value={editForm.role} onChange={function (e) { setEditForm(Object.assign({}, editForm, { role: e.target.value })) }} style={selectStyle} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="client">Client</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              <FormField label="Department" icon="building">
                <input type="text" value={editForm.department} onChange={function (e) { setEditForm(Object.assign({}, editForm, { department: e.target.value })) }} placeholder="Engineering" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
              </FormField>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Phone" icon="phone">
                  <input type="tel" value={editForm.phone} onChange={function (e) { setEditForm(Object.assign({}, editForm, { phone: e.target.value })) }} placeholder="+250 7XX XXX XXX" style={inputCss} onFocus={inputFocus} onBlur={inputBlur} />
                </FormField>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Account status">
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {[true, false].map(function (val) {
                      return (
                        <button key={String(val)} type="button" onClick={function () { setEditForm(Object.assign({}, editForm, { is_active: val })) }} style={{ flex: 1, padding: '0.75rem', borderRadius: 11, border: '1px solid ' + (editForm.is_active === val ? (val ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)') : 'rgba(255,255,255,0.08)'), background: editForm.is_active === val ? (val ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)') : 'rgba(255,255,255,0.03)', color: editForm.is_active === val ? (val ? '#34D399' : '#F87171') : '#5C6478', fontFamily: "'Inter',sans-serif", fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <Icon name={val ? 'check-circle' : 'x'} size={13} /> {val ? 'Active' : 'Inactive'}
                        </button>
                      )
                    })}
                  </div>
                </FormField>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={function () { setEditUser(null) }} style={{ flex: 1, padding: '0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#8A93A6', borderRadius: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.9rem' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.9rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 800, border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Icon name="save" size={15} /> {saving ? 'Saving changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={function (e) { if (e.target === e.currentTarget) setShowConfirm(null) }}>
          <div style={{ background: '#0B0E17', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 20, padding: '2.25rem', width: '100%', maxWidth: 380, textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#F87171,transparent)', borderRadius: '20px 20px 0 0' }} />
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#F87171' }}><Icon name="alert" size={26} /></div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#F1F3F8', marginBottom: '0.6rem' }}>Deactivate user?</div>
            <p style={{ color: '#8A93A6', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              <strong style={{ color: '#F1F3F8' }}>{showConfirm.full_name}</strong> will immediately lose access to AEGIS. You can reactivate them at any time.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={function () { setShowConfirm(null) }} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#8A93A6', borderRadius: 11, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.875rem' }}>Cancel</button>
              <button onClick={function () { deactivateUser(showConfirm.id) }} style={{ flex: 1, padding: '0.75rem', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171', borderRadius: 11, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: '0.875rem', fontWeight: 600 }}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}