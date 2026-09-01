import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const colors = {
    success: { bg: 'rgba(0,201,167,0.12)', border: 'rgba(0,201,167,0.3)', color: '#00C9A7' },
    error: { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', color: '#FB7185' },
    info: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: '#818CF8' },
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}>
        {toasts.map(toast => {
          const c = colors[toast.type] || colors.success
          return (
            <div key={toast.id} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              color: c.color, padding: '0.85rem 1.25rem',
              borderRadius: 10, fontSize: '0.875rem', fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              animation: 'slideIn 0.3s ease',
              backdropFilter: 'blur(10px)',
              maxWidth: 320,
            }}>
              {toast.message}
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}