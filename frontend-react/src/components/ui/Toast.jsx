import { useState, createContext, useContext, useCallback } from 'react'

var ToastContext = createContext(null)

export function ToastProvider(props) {
  var toastsArr = useState([])
  var toasts = toastsArr[0]
  var setToasts = toastsArr[1]

  var showToast = useCallback(function (message, type) {
    type = type || 'success'
    var id = Date.now()
    setToasts(function (prev) { return prev.concat([{ id: id, message: message, type: type }]) })
    setTimeout(function () {
      setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id }) })
    }, 3500)
  }, [])

  var colors = {
    success: { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', color: '#34D399' },
    error: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#F87171' },
    info: { bg: 'rgba(124,111,238,0.12)', border: 'rgba(124,111,238,0.3)', color: '#B4ACF9' },
  }

  return (
    <ToastContext.Provider value={showToast}>
      {props.children}
      <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}>
        {toasts.map(function (toast) {
          var c = colors[toast.type] || colors.success
          return (
            <div key={toast.id} style={{
              background: c.bg, border: '1px solid ' + c.border,
              color: c.color, padding: '0.85rem 1.25rem',
              borderRadius: 10, fontSize: '0.875rem', fontWeight: 500,
              fontFamily: "'Inter',sans-serif",
              animation: 'toastSlideIn 0.3s ease',
              backdropFilter: 'blur(10px)',
              maxWidth: 320,
            }}>
              {toast.message}
            </div>
          )
        })}
      </div>
      <style>{"@keyframes toastSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }"}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  var ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}