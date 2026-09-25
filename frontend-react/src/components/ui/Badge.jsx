import { helpers } from '../../services/api'

export function StatusBadge(props) {
  var s = helpers.statusBadge(props.status)
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '0.2rem 0.65rem', borderRadius: '100px',
      fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Inter',sans-serif",
    }}>{s.label}</span>
  )
}

export function PriorityBadge(props) {
  var p = helpers.priorityBadge(props.priority)
  return (
    <span style={{
      background: p.bg, color: p.color,
      padding: '0.2rem 0.65rem', borderRadius: '100px',
      fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Inter',sans-serif",
    }}>{p.label}</span>
  )
}

export function RoleBadge(props) {
  var map = {
    client: { bg: 'rgba(52,211,153,0.12)', color: '#34D399' },
    staff: { bg: 'rgba(124,111,238,0.12)', color: '#B4ACF9' },
    admin: { bg: 'rgba(232,69,10,0.12)', color: '#F97316' },
  }
  var s = map[props.role] || map.client
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '0.2rem 0.65rem', borderRadius: '100px',
      fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Inter',sans-serif",
      textTransform: 'capitalize',
    }}>{props.role}</span>
  )
}