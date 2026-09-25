import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'

function Icon(props) {
  var name = props.name
  var size = props.size || 20
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'laptop') return <svg {...common}><rect x="4.5" y="5" width="15" height="10" rx="1" /><path d="M2.5 19h19" /></svg>
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /></svg>
  if (name === 'credit-card') return <svg {...common}><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 10h19" /></svg>
  if (name === 'building') return <svg {...common}><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 8h4v13h-4" /></svg>
  if (name === 'users') return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" /></svg>
  if (name === 'shield') return <svg {...common}><path d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" /></svg>
  if (name === 'zap') return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  if (name === 'arrow-right') return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  return null
}

var SERVICES = [
  { category: 'technical', icon: 'laptop', color: '#7C6FEE', title: 'Technical Support', desc: 'Hardware, software, network connectivity, VPN access, and general IT troubleshooting.', examples: ['VPN not connecting', 'Software installation', 'Network outages', 'Printer issues'] },
  { category: 'infrastructure', icon: 'building', color: '#F87171', title: 'Infrastructure & Maintenance', desc: 'Physical equipment, facilities, servers, and engineering infrastructure requests.', examples: ['Server maintenance', 'Equipment repair', 'Site installation', 'Power/electrical issues'] },
  { category: 'security', icon: 'shield', color: '#F97316', title: 'Security', desc: 'Access control, account security, and reporting suspicious activity.', examples: ['Locked account', 'Suspicious login', 'Access request', 'Security policy question'] },
  { category: 'billing', icon: 'credit-card', color: '#FBBF24', title: 'Billing & Invoicing', desc: 'Questions about invoices, payments, and service charges.', examples: ['Invoice discrepancy', 'Payment confirmation', 'Billing cycle question'] },
  { category: 'hr', icon: 'users', color: '#34D399', title: 'HR & Administrative', desc: 'Personnel-related requests and administrative support.', examples: ['Document requests', 'Policy questions', 'Onboarding support'] },
  { category: 'general', icon: 'file-text', color: '#0EA5E9', title: 'General Inquiry', desc: "Anything that doesn't fit the categories above - we'll route it correctly.", examples: ['General questions', 'Feedback', 'Other requests'] },
]

export default function ServiceCatalog() {
  var navigate = useNavigate()

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    .svc-card { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); cursor:pointer; }\n    .svc-card:hover { transform: translateY(-4px); }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar title="Service Catalog" subtitle="Browse AEG's support services and request one directly" />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <p style={{ fontSize: '0.88rem', color: '#8A93A6', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 640 }}>
          Adaptive Engineering Group provides support across these areas. Pick the one that matches your need, or just submit a ticket directly - our AI classifies it automatically either way.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
          {SERVICES.map(function (s) {
            return (
              <div key={s.category} className="svc-card" onClick={function () { navigate('/client/new-ticket') }} style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '1.75rem', position: 'relative', overflow: 'hidden' }}
                onMouseOver={function (e) { e.currentTarget.style.borderColor = s.color + '55' }}
                onMouseOut={function (e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                <div style={{ width: 46, height: 46, borderRadius: 13, background: s.color + '1A', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><Icon name={s.icon} size={21} /></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.5rem' }}>{s.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#8A93A6', lineHeight: 1.6, marginBottom: '1.1rem' }}>{s.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {s.examples.map(function (ex) {
                    return <span key={ex} style={{ fontSize: '0.68rem', color: '#8A93A6', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: 100 }}>{ex}</span>
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: s.color }}>
                  Request this service <Icon name="arrow-right" size={14} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
