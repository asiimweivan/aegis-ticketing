function Icon(props) {
  var name = props.name
  var size = props.size || 20
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'ticket') return <svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" /></svg>
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="M12 7v5l3.2 2" /></svg>
  if (name === 'check-circle') return <svg {...common}><circle cx="12" cy="12" r="9.5" /><path d="m8.3 12.3 2.4 2.4 5-5" /></svg>
  if (name === 'alert-triangle') return <svg {...common}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'users') return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /><path d="M16 8.5a3 3 0 1 1 0-5.9" /><path d="M14.5 14.3c2.7.3 4.5 2.6 4.5 5.7" /></svg>
  if (name === 'trending-up') return <svg {...common}><path d="m3 17 6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  return null
}

var COLOR_MAP = {
  teal: '#34D399',
  green: '#34D399',
  indigo: '#7C6FEE',
  violet: '#7C6FEE',
  amber: '#FBBF24',
  orange: '#F97316',
  rose: '#F87171',
  red: '#F87171',
  blue: '#0EA5E9',
}

export default function StatCard(props) {
  var label = props.label
  var value = props.value
  var icon = props.icon
  var color = props.color || 'orange'
  var accent = COLOR_MAP[color] || COLOR_MAP.orange

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '1.4rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      cursor: 'default',
      fontFamily: "'Inter',sans-serif",
    }}
      onMouseOver={function (e) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = accent + '55' }}
      onMouseOut={function (e) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent,
      }} />

      {icon && (
        <div style={{
          position: 'absolute', top: '1.3rem', right: '1.3rem',
          width: 34, height: 34, borderRadius: 9,
          background: accent + '1A', color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name={icon} size={17} /></div>
      )}

      <div style={{
        fontSize: '0.78rem', color: '#8A93A6',
        fontWeight: 600, marginBottom: '0.6rem',
      }}>{label}</div>

      <div style={{
        fontFamily: "'Sora',sans-serif",
        fontSize: '2rem', fontWeight: 800,
        color: '#F1F3F8', lineHeight: 1,
      }}>{value != null ? value : '\u2014'}</div>
    </div>
  )
}