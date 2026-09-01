export default function StatCard({ label, value, icon, color = 'teal' }) {
  const colors = {
    teal: '#00C9A7',
    indigo: '#6366F1',
    amber: '#F59E0B',
    rose: '#F43F5E',
    green: '#22C55E',
  }
  const accent = colors[color] || colors.teal

  return (
    <div style={{
      background: '#0D1B3E',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s',
      cursor: 'default',
    }}
      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent,
      }} />

      {/* Icon */}
      {icon && (
        <div style={{
          position: 'absolute', top: '1.25rem', right: '1.25rem',
          fontSize: '1.5rem', opacity: 0.2,
        }}>{icon}</div>
      )}

      <div style={{
        fontSize: '0.75rem', color: '#8B9BB4',
        fontWeight: 500, marginBottom: '0.5rem',
      }}>{label}</div>

      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '2rem', fontWeight: 700,
        color: '#F8FAFC', lineHeight: 1,
      }}>{value ?? '—'}</div>
    </div>
  )
}