import { helpers } from '../../services/api'

export function StatusBadge({ status }) {
  const s = helpers.statusBadge(status)
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '0.2rem 0.65rem', borderRadius: '100px',
      fontSize: '0.72rem', fontWeight: 600,
    }}>{s.label}</span>
  )
}

export function PriorityBadge({ priority }) {
  const p = helpers.priorityBadge(priority)
  return (
    <span style={{
      background: p.bg, color: p.color,
      padding: '0.2rem 0.65rem', borderRadius: '100px',
      fontSize: '0.72rem', fontWeight: 600,
    }}>{p.label}</span>
  )
}

export function RoleBadge({ role }) {
  const map = {
    client: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7' },
    staff: { bg: 'rgba(99,102,241,0.12)', color: '#818CF8' },
    admin: { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D' },
  }
  const s = map[role] || map.client
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '0.2rem 0.65rem', borderRadius: '100px',
      fontSize: '0.72rem', fontWeight: 600,
      textTransform: 'capitalize',
    }}>{role}</span>
  )
}