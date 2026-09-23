import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Topbar from '../components/layout/Topbar'
import { auth } from '../services/api'
import { useToast } from '../components/ui/Toast'
import useAuthStore from '../stores/authStore'

function Icon(props) {
  var name = props.name
  var size = props.size || 18
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'shield-check') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9.3 12 1.9 1.9L15 10" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /></svg>
  if (name === 'smartphone') return <svg {...common}><rect x="6" y="2.5" width="12" height="19" rx="2" /><path d="M11 18.5h2" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6.5 8 6 8-6" /></svg>
  if (name === 'alert') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 8v5" /><circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'arrow-left') return <svg {...common}><path d="M19 12H5M5 12l6-6M5 12l6 6" /></svg>
  if (name === 'external-link') return <svg {...common}><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></svg>
  return null
}

var VIEWS = { IDLE: 'idle', CHOOSE: 'choose', SCAN: 'scan', EMAIL_CODE: 'email_code' }

export default function Settings() {
  var showToast = useToast()
  var authStore = useAuthStore()
  var user = authStore.user
  var updateUser = authStore.updateUser

  var viewArr = useState(VIEWS.IDLE)
  var view = viewArr[0]
  var setView = viewArr[1]
  var qrArr = useState(null)
  var qrData = qrArr[0]
  var setQrData = qrArr[1]
  var codeArr = useState('')
  var code = codeArr[0]
  var setCode = codeArr[1]
  var loadingArr = useState(false)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var errorArr = useState('')
  var error = errorArr[0]
  var setError = errorArr[1]
  var disableCodeArr = useState('')
  var disableCode = disableCodeArr[0]
  var setDisableCode = disableCodeArr[1]
  var showDisableArr = useState(false)
  var showDisable = showDisableArr[0]
  var setShowDisable = showDisableArr[1]
  var disableSentArr = useState(false)
  var disableEmailSent = disableSentArr[0]
  var setDisableEmailSent = disableSentArr[1]

  var mfaEnabled = user && user.mfa_enabled
  var mfaMethod = user && user.mfa_method

  function resetFlow() {
    setView(VIEWS.IDLE)
    setQrData(null)
    setCode('')
    setError('')
  }

  function startTotpSetup() {
    setError('')
    setLoading(true)
    auth.mfaSetup().then(function (data) {
      if (data) { setQrData(data); setView(VIEWS.SCAN) }
    }).catch(function (err) {
      showToast(err.message || 'Could not start MFA setup', 'error')
    }).finally(function () { setLoading(false) })
  }

  function startEmailSetup() {
    setError('')
    setLoading(true)
    auth.mfaSetupEmail().then(function () {
      setView(VIEWS.EMAIL_CODE)
      showToast('Verification code sent to your email')
    }).catch(function (err) {
      showToast(err.message || 'Could not send verification email', 'error')
    }).finally(function () { setLoading(false) })
  }

  function confirmTotpSetup(e) {
    e.preventDefault()
    setError('')
    if (code.length !== 6) { setError('Enter the full 6-digit code'); return }
    setLoading(true)
    auth.mfaVerifySetup(code).then(function () {
      showToast('Two-factor authentication enabled')
      resetFlow()
      if (updateUser && user) updateUser(Object.assign({}, user, { mfa_enabled: true, mfa_method: 'totp' }))
    }).catch(function (err) {
      setError(err.message || 'Invalid code, please try again')
    }).finally(function () { setLoading(false) })
  }

  function confirmEmailSetup(e) {
    e.preventDefault()
    setError('')
    if (code.length !== 6) { setError('Enter the full 6-digit code'); return }
    setLoading(true)
    auth.mfaVerifySetupEmail(code).then(function () {
      showToast('Two-factor authentication enabled')
      resetFlow()
      if (updateUser && user) updateUser(Object.assign({}, user, { mfa_enabled: true, mfa_method: 'email' }))
    }).catch(function (err) {
      setError(err.message || 'Invalid or expired code')
    }).finally(function () { setLoading(false) })
  }

  function openDisable() {
    setShowDisable(true)
    setError('')
    setDisableEmailSent(false)
    if (mfaMethod === 'email') {
      setLoading(true)
      auth.mfaRequestDisableEmailCode().then(function () {
        setDisableEmailSent(true)
        showToast('A code has been sent to your email')
      }).catch(function (err) {
        showToast(err.message || 'Could not send code', 'error')
      }).finally(function () { setLoading(false) })
    }
  }

  function confirmDisable(e) {
    e.preventDefault()
    setError('')
    if (disableCode.length !== 6) { setError('Enter the full 6-digit code'); return }
    setLoading(true)
    auth.mfaDisable(disableCode).then(function () {
      showToast('Two-factor authentication disabled')
      setShowDisable(false)
      setDisableCode('')
      if (updateUser && user) updateUser(Object.assign({}, user, { mfa_enabled: false, mfa_method: null }))
    }).catch(function (err) {
      setError(err.message || 'Invalid code, please try again')
    }).finally(function () { setLoading(false) })
  }

  var css = "\n    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }\n    .otp-box-sm{width:100%;padding:0.85rem 1rem;text-align:center;font-size:1.3rem;font-weight:700;background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;color:#F8FAFC;outline:none;letter-spacing:0.4em;font-family:'JetBrains Mono',monospace;transition:all 0.2s}\n    .otp-box-sm:focus{border-color:#6366F1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}\n    .settings-btn{padding:0.7rem 1.4rem;border-radius:10px;font-size:0.85rem;font-weight:700;cursor:pointer;border:none;transition:all 0.2s;font-family:inherit}\n    .settings-btn:disabled{opacity:0.6;cursor:not-allowed}\n    .method-card{transition:all 0.2s;cursor:pointer}\n    .method-card:hover{border-color:rgba(99,102,241,0.4)!important;background:rgba(99,102,241,0.06)!important}\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title="Settings" subtitle="Manage your account security" />

      <div style={{ padding: '2rem', maxWidth: 640, fontFamily: 'Inter,sans-serif' }}>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.75rem', animation: 'fadeIn 0.4s ease both' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: (view !== VIEWS.IDLE || showDisable) ? '1.75rem' : 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: mfaEnabled ? 'rgba(52,211,153,0.12)' : 'rgba(99,102,241,0.12)', color: mfaEnabled ? '#34D399' : '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={mfaEnabled ? 'shield-check' : 'shield'} size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>Two-Factor Authentication</span>
                {mfaEnabled && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34D399', background: 'rgba(52,211,153,0.12)', padding: '0.15rem 0.55rem', borderRadius: 100 }}>
                    ENABLED &middot; {mfaMethod === 'email' ? 'Email' : 'Authenticator App'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#8B9BB4', lineHeight: 1.6, marginBottom: view === VIEWS.IDLE && !showDisable ? '1rem' : 0 }}>
                Add an extra layer of security to your account. You'll need a second code each time you sign in.
              </p>

              {view === VIEWS.IDLE && !mfaEnabled && (
                <button onClick={startEmailSetup} disabled={loading} className="settings-btn" style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', color: '#fff' }}>
                  {loading ? 'Sending code...' : 'Enable Two-Factor Authentication'}
                </button>
              )}

              {view === VIEWS.IDLE && mfaEnabled && !showDisable && (
                <button onClick={openDisable} className="settings-btn" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#FB7185' }}>
                  Disable Two-Factor Authentication
                </button>
              )}
            </div>
          </div>

          {view === VIEWS.CHOOSE && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1rem' }}>Choose a verification method</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="method-card" onClick={startTotpSetup} style={{ border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.12)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}><Icon name="smartphone" size={19} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.3rem' }}>Authenticator App</div>
                  <p style={{ fontSize: '0.75rem', color: '#8B9BB4', lineHeight: 1.5 }}>Scan a QR code with Google Authenticator, Authy, or similar. Works offline.</p>
                </div>
                <div className="method-card" onClick={startEmailSetup} style={{ border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.12)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}><Icon name="mail" size={19} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.3rem' }}>Email Code</div>
                  <p style={{ fontSize: '0.75rem', color: '#8B9BB4', lineHeight: 1.5 }}>Get a code sent to your email every time you sign in. No app needed.</p>
                </div>
              </div>
              {loading && <div style={{ fontSize: '0.82rem', color: '#8B9BB4' }}>Loading...</div>}
              <button onClick={resetFlow} className="settings-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#8B9BB4' }}>Cancel</button>
            </div>
          )}

          {view === VIEWS.SCAN && qrData && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem' }}>
              <button onClick={function () { setView(VIEWS.CHOOSE) }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#8B9BB4', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '1.25rem', padding: 0 }}>
                <Icon name="arrow-left" size={13} /> Choose a different method
              </button>
              <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1rem', borderRadius: 12, flexShrink: 0 }}>
                  <img src={qrData.qr_code} alt="Scan with your authenticator app" style={{ width: 160, height: 160, display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                    <Icon name="smartphone" size={16} /> Step 1: Scan this QR code
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#8B9BB4', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Open Google Authenticator, Authy, or any TOTP app on your phone, tap "+", and scan the code.
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#8B9BB4', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Icon name="external-link" size={12} />
                    Don't have an app? Search "Google Authenticator" or "Authy" free on your phone's app store.
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8B9BB4', marginBottom: '0.4rem' }}>Can't scan? Enter this key manually:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                    <code style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.78rem', color: '#F8FAFC', wordBreak: 'break-all', flex: 1 }}>{qrData.secret}</code>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>Step 2: Enter the 6-digit code</div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#FB7185', padding: '0.7rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <Icon name="alert" size={14} />{error}
                </div>
              )}

              <form onSubmit={confirmTotpSetup} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code}
                  onChange={function (e) { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }}
                  placeholder="000000"
                  autoFocus
                  className="otp-box-sm"
                  style={{ maxWidth: 160 }}
                />
                <button type="submit" disabled={loading} className="settings-btn" style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', color: '#fff' }}>
                  {loading ? 'Verifying...' : 'Confirm & Enable'}
                </button>
                <button type="button" onClick={resetFlow} className="settings-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#8B9BB4' }}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {view === VIEWS.EMAIL_CODE && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem' }}>
              <button onClick={function () { setView(VIEWS.CHOOSE) }} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#8B9BB4', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '1.25rem', padding: 0 }}>
                <Icon name="arrow-left" size={13} /> Choose a different method
              </button>
              <p style={{ fontSize: '0.85rem', color: '#8B9BB4', marginBottom: '1rem' }}>We sent a 6-digit code to <strong style={{ color: '#F8FAFC' }}>{user && user.email}</strong>. Enter it below.</p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#FB7185', padding: '0.7rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <Icon name="alert" size={14} />{error}
                </div>
              )}

              <form onSubmit={confirmEmailSetup} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code}
                  onChange={function (e) { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }}
                  placeholder="000000"
                  autoFocus
                  className="otp-box-sm"
                  style={{ maxWidth: 160 }}
                />
                <button type="submit" disabled={loading} className="settings-btn" style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', color: '#fff' }}>
                  {loading ? 'Verifying...' : 'Confirm & Enable'}
                </button>
                <button type="button" onClick={resetFlow} className="settings-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#8B9BB4' }}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {showDisable && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#8B9BB4', marginBottom: '1rem' }}>
                {mfaMethod === 'email'
                  ? (disableEmailSent ? 'Enter the code we just sent to your email to confirm.' : 'Sending a verification code to your email...')
                  : 'Enter a current code from your authenticator app to confirm disabling two-factor authentication.'}
              </p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#FB7185', padding: '0.7rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <Icon name="alert" size={14} />{error}
                </div>
              )}

              <form onSubmit={confirmDisable} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={disableCode}
                  onChange={function (e) { setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }}
                  placeholder="000000"
                  autoFocus
                  className="otp-box-sm"
                  style={{ maxWidth: 160 }}
                />
                <button type="submit" disabled={loading} className="settings-btn" style={{ background: '#DC2626', color: '#fff' }}>
                  {loading ? 'Disabling...' : 'Confirm Disable'}
                </button>
                <button type="button" onClick={function () { setShowDisable(false); setDisableCode(''); setError('') }} className="settings-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#8B9BB4' }}>
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
