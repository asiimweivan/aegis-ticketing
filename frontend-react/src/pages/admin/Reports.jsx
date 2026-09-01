import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets, users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const STATUS_OPTS   = ['open','in_progress','pending','resolved','closed']
const PRIORITY_OPTS = ['critical','high','medium','low']
const CATEGORY_OPTS = ['technical','administrative','billing','infrastructure','hr','security','general']

const PRESET_RANGES = [
  { v:'all',     label:'All time' },
  { v:'today',   label:'Today' },
  { v:'week',    label:'This week' },
  { v:'month',   label:'This month' },
  { v:'year',    label:'This year' },
  { v:'custom',  label:'Custom range' },
]

const STATUS_C = { open:'#DC2626', in_progress:'#6460FF', pending:'#D97706', resolved:'#059669', closed:'#64748B' }
const PRI_C    = { critical:'#DC2626', high:'#D97706', medium:'#6B7280', low:'#94A3B8' }

function rangeToDates(preset, customFrom, customTo) {
  const now = new Date()
  let from = null, to = null
  if (preset === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59)
  } else if (preset === 'week') {
    const day = now.getDay() || 7
    from = new Date(now); from.setDate(now.getDate() - day + 1); from.setHours(0,0,0,0)
    to = new Date(from); to.setDate(from.getDate()+6); to.setHours(23,59,59,999)
  } else if (preset === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
    to = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59)
  } else if (preset === 'year') {
    from = new Date(now.getFullYear(), 0, 1)
    to = new Date(now.getFullYear(), 11, 31, 23,59,59)
  } else if (preset === 'custom') {
    from = customFrom ? new Date(customFrom) : null
    to = customTo ? new Date(customTo + 'T23:59:59') : null
  }
  return { from, to }
}

function Chip({ active, children, onClick, color = '#E8450A' }) {
  return (
    <button onClick={onClick} style={{
      padding:'0.4rem 0.9rem', borderRadius:100, fontSize:'0.78rem', fontWeight:600, cursor:'pointer',
      border:`1.5px solid ${active ? color : '#E2E8F0'}`,
      background: active ? `${color}15` : '#FFFFFF',
      color: active ? color : '#64748B',
      fontFamily:'Plus Jakarta Sans,sans-serif', transition:'all 0.15s',
    }}>{children}</button>
  )
}

export default function AdminReports() {
  const { user } = useAuthStore()
  const showToast = useToast()
  const [allTickets, setAllTickets] = useState([])
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState([])      // multi-select
  const [priorityFilter, setPriorityFilter] = useState([])  // multi-select
  const [categoryFilter, setCategoryFilter] = useState([])  // multi-select
  const [staffFilter, setStaffFilter] = useState('')        // single
  const [rangePreset, setRangePreset] = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [reportTitle, setReportTitle] = useState('Issue Ticket Report')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [uRes] = await Promise.all([
        users.list().catch(e => { console.error(e); return null }),
      ])
      if (uRes) setStaffList((Array.isArray(uRes) ? uRes : uRes.users || []).filter(u => u.role === 'staff'))

      // Paginate through all tickets using a safe page_size
      let all = []
      let page = 1
      const pageSize = 100
      while (true) {
        const res = await tickets.list({ page, page_size: pageSize }).catch(e => { console.error('Tickets fetch error:', e); return null })
        if (!res || !res.tickets?.length) break
        all = all.concat(res.tickets)
        if (res.tickets.length < pageSize || all.length >= (res.total || all.length)) break
        page++
        if (page > 20) break // safety cap
      }
      setAllTickets(all)
    } finally { setLoading(false) }
  }

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  // ── Apply all filters ──
  const filtered = useMemo(() => {
    const { from, to } = rangeToDates(rangePreset, customFrom, customTo)
    return allTickets.filter(t => {
      if (statusFilter.length && !statusFilter.includes(t.status)) return false
      if (priorityFilter.length && !priorityFilter.includes(t.priority)) return false
      if (categoryFilter.length && !categoryFilter.includes(t.category)) return false
      if (staffFilter && t.assigned_to?.id !== staffFilter) return false
      if (from || to) {
        const created = new Date(t.created_at)
        if (from && created < from) return false
        if (to && created > to) return false
      }
      return true
    })
  }, [allTickets, statusFilter, priorityFilter, categoryFilter, staffFilter, rangePreset, customFrom, customTo])

  const stats = useMemo(() => {
    const total = filtered.length
    const resolved = filtered.filter(t => t.status === 'resolved').length
    const open = filtered.filter(t => t.status === 'open').length
    const inProgress = filtered.filter(t => t.status === 'in_progress').length
    const pending = filtered.filter(t => t.status === 'pending').length
    const critical = filtered.filter(t => t.priority === 'critical').length
    const slaBreached = filtered.filter(t => {
      if (!t.due_date) return false
      const due = new Date(t.due_date)
      return due < new Date() && !['resolved','closed'].includes(t.status)
    }).length
    return { total, resolved, open, inProgress, pending, critical, slaBreached, slaMet: total - slaBreached }
  }, [filtered])

  const { from: rangeFrom, to: rangeTo } = rangeToDates(rangePreset, customFrom, customTo)
  const periodLabel = rangePreset === 'all'
    ? 'All time'
    : rangePreset === 'custom' && rangeFrom && rangeTo
      ? `${rangeFrom.toLocaleDateString('en-GB')} — ${rangeTo.toLocaleDateString('en-GB')}`
      : rangeFrom && rangeTo
        ? `${rangeFrom.toLocaleDateString('en-GB')} — ${rangeTo.toLocaleDateString('en-GB')}`
        : 'All time'

  const clearFilters = () => {
    setStatusFilter([]); setPriorityFilter([]); setCategoryFilter([]); setStaffFilter(''); setRangePreset('all')
    setCustomFrom(''); setCustomTo('')
  }

  const activeFilterCount = statusFilter.length + priorityFilter.length + categoryFilter.length + (staffFilter?1:0) + (rangePreset!=='all'?1:0)

  // ── PDF GENERATION (bundled jsPDF + jspdf-autotable, no CDN dependency) ──
  const generatePDF = async () => {
    if (!filtered.length) { showToast('No tickets match these filters', 'error'); return }
    setGenerating(true)
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = doc.internal.pageSize.getWidth()
      const H = doc.internal.pageSize.getHeight()

      const NAVY = [13, 27, 42]
      const ORANGE = [232, 69, 10]
      const GRAY = [100, 116, 139]
      const LGRAY = [248, 250, 252]

      const now = new Date()
      const generatedOn = now.toLocaleString('en-GB')
      const generatedBy = user?.email || 'admin'

      // Try to load logo
      let logoData = null
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          img.src = '/aeg_logo.png'
        })
        if (img.complete && img.naturalWidth > 0) {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          logoData = canvas.toDataURL('image/png')
        }
      } catch(e) { /* no logo, continue without */ }

      const addHeaderFooter = (pageNum) => {
        // Header
        doc.setFillColor(...NAVY)
        doc.rect(0, 0, W, 16, 'F')
        doc.setFillColor(...ORANGE)
        doc.rect(0, 16, W, 1.2, 'F')
        if (logoData) {
          try { doc.addImage(logoData, 'PNG', 8, 2.5, 26, 10, undefined, 'FAST') } catch(e) {}
        }
        doc.setTextColor(255,255,255)
        doc.setFont('helvetica','bold')
        doc.setFontSize(11)
        doc.text(reportTitle, W - 8, 7, { align:'right' })
        doc.setFontSize(7.5)
        doc.setTextColor(180,190,205)
        doc.setFont('helvetica','normal')
        doc.text('Adaptive Engineering Group Ltd  ·  AEGIS v1.0.0', W - 8, 12, { align:'right' })

        // Footer
        doc.setFillColor(...ORANGE)
        doc.rect(0, H-9, W, 0.6, 'F')
        doc.setFillColor(...NAVY)
        doc.rect(0, H-8.4, W, 8.4, 'F')
        doc.setFontSize(6)
        doc.setTextColor(170,180,195)
        doc.text(`Generated on: ${generatedOn}  |  Generated by: ${generatedBy}  |  © 2026 Adaptive Engineering Group Ltd. Confidential.`, W/2, H-4, { align:'center' })
        doc.setFontSize(7)
        doc.setTextColor(255,255,255)
        doc.setFont('helvetica','bold')
        doc.text(`Page ${pageNum}`, W-8, H-4, { align:'right' })
      }

      addHeaderFooter(1)

      // Title block
      let y = 24
      doc.setTextColor(...NAVY)
      doc.setFont('helvetica','bold')
      doc.setFontSize(16)
      doc.text(reportTitle, 8, y)

      doc.setFontSize(7)
      doc.setTextColor(...GRAY)
      doc.setFont('helvetica','bold')
      doc.text('REPORT PERIOD', W-8, y-3, { align:'right' })
      doc.setFontSize(10)
      doc.setTextColor(...ORANGE)
      doc.text(periodLabel, W-8, y+2, { align:'right' })

      y += 4
      doc.setDrawColor(...ORANGE)
      doc.setLineWidth(0.6)
      doc.line(8, y, W-8, y)
      y += 6

      // Meta + filter summary box
      doc.setFillColor(...LGRAY)
      doc.setDrawColor(226,232,240)
      doc.roundedRect(8, y, W-16, 14, 1, 1, 'FD')
      doc.setFontSize(7.5)
      doc.setTextColor(...NAVY)
      doc.setFont('helvetica','normal')
      const filterParts = []
      if (statusFilter.length) filterParts.push(`Status: ${statusFilter.join(', ')}`)
      if (priorityFilter.length) filterParts.push(`Priority: ${priorityFilter.join(', ')}`)
      if (categoryFilter.length) filterParts.push(`Category: ${categoryFilter.join(', ')}`)
      if (staffFilter) filterParts.push(`Staff: ${staffList.find(s=>s.id===staffFilter)?.full_name || ''}`)
      const filterText = filterParts.length ? filterParts.join('   |   ') : 'No filters applied — showing all tickets'
      doc.text(`Filters: ${filterText}`, 12, y+5.5)
      doc.text(`Prepared by: System Administrator   |   Organization: Adaptive Engineering Group Ltd, Kamembe, Rwanda`, 12, y+10.5)
      y += 18

      // Summary stat boxes
      const statBoxes = [
        ['Total', stats.total, NAVY],
        ['Resolved', stats.resolved, [5,150,105]],
        ['Open', stats.open, ORANGE],
        ['In Progress', stats.inProgress, [100,96,255]],
        ['Pending', stats.pending, [217,119,6]],
        ['Critical', stats.critical, [220,38,38]],
        ['SLA Met', `${stats.slaMet}/${stats.total}`, [5,150,105]],
      ]
      const boxW = (W-16) / statBoxes.length
      statBoxes.forEach(([label, val, color], i) => {
        const x = 8 + i*boxW
        doc.setDrawColor(226,232,240)
        doc.setLineWidth(0.3)
        doc.rect(x, y, boxW, 14)
        doc.setFont('helvetica','bold')
        doc.setFontSize(13)
        doc.setTextColor(...color)
        doc.text(String(val), x + boxW/2, y+7, { align:'center' })
        doc.setFont('helvetica','normal')
        doc.setFontSize(6.5)
        doc.setTextColor(...GRAY)
        doc.text(label, x + boxW/2, y+11.5, { align:'center' })
      })
      y += 18

      // Table
      const tableRows = filtered.map((t, i) => [
        String(i+1),
        t.ticket_number || '',
        (t.title || '').slice(0, 50),
        t.category || '',
        (t.status || '').replace('_',' '),
        t.priority || '',
        t.client?.full_name || '—',
        t.assigned_to?.full_name || 'Unassigned',
        t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : 'No SLA',
        t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '',
        t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('en-GB') : '—',
      ])

      autoTable(doc, {
        startY: y,
        head: [['#','Ticket No.','Title','Category','Status','Priority','Client','Assigned','SLA Due','Created','Resolved']],
        body: tableRows,
        margin: { left:8, right:8, bottom:13 },
        styles: { fontSize:6.5, cellPadding:1.6, textColor:NAVY, lineColor:[226,232,240], lineWidth:0.2 },
        headStyles: { fillColor:NAVY, textColor:255, fontStyle:'bold', fontSize:6.8, halign:'center' },
        alternateRowStyles: { fillColor: LGRAY },
        columnStyles: {
          0: { halign:'center', cellWidth:6 },
          1: { cellWidth:20 },
          2: { cellWidth:58 },
          3: { cellWidth:20 },
          4: { halign:'center', cellWidth:18 },
          5: { halign:'center', cellWidth:15 },
          6: { cellWidth:22 },
          7: { cellWidth:22 },
          8: { halign:'center', cellWidth:18 },
          9: { halign:'center', cellWidth:18 },
          10:{ halign:'center', cellWidth:18 },
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            if (data.column.index === 4) {
              const status = filtered[data.row.index]?.status
              const c = { open:[220,38,38], in_progress:[100,96,255], pending:[217,119,6], resolved:[5,150,105], closed:[100,116,139] }[status]
              if (c) { data.cell.styles.textColor = c; data.cell.styles.fontStyle = 'bold' }
            }
            if (data.column.index === 5) {
              const pri = filtered[data.row.index]?.priority
              const c = { critical:[220,38,38], high:[217,119,6], medium:[107,114,128], low:[148,163,184] }[pri]
              if (c) { data.cell.styles.textColor = c; data.cell.styles.fontStyle = 'bold' }
            }
          }
        },
        didDrawPage: (data) => {
          addHeaderFooter(doc.internal.getNumberOfPages())
        },
      })

      // Signature block on last page
      let finalY = doc.lastAutoTable.finalY + 10
      if (finalY > H - 35) { doc.addPage(); addHeaderFooter(doc.internal.getNumberOfPages()); finalY = 28 }

      doc.setDrawColor(226,232,240)
      doc.setLineWidth(0.3)
      doc.line(8, finalY, W-8, finalY)
      finalY += 6

      doc.setFontSize(8)
      doc.setFont('helvetica','bold')
      doc.setTextColor(...ORANGE)
      const sigCols = [8, 8 + (W-16)/3, 8 + 2*(W-16)/3]
      const sigLabels = ['Prepared by', 'Reviewed by', 'Approved by']
      const sigRoles = ['System Administrator', 'Department Head', 'Authorized Officer']
      sigCols.forEach((x, i) => {
        doc.setTextColor(...ORANGE)
        doc.setFont('helvetica','bold')
        doc.text(sigLabels[i], x, finalY)
        doc.setDrawColor(150,150,150)
        doc.line(x, finalY+12, x+70, finalY+12)
        doc.setFont('helvetica','normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...NAVY)
        doc.text(sigRoles[i], x, finalY+16)
        doc.setTextColor(...GRAY)
        doc.text('Adaptive Engineering Group Ltd', x, finalY+20)
      })

      const filename = `AEG_Report_${rangePreset}_${now.toISOString().slice(0,10)}.pdf`
      doc.save(filename)
      showToast(`Report downloaded — ${filtered.length} tickets`)
    } catch (e) {
      console.error('PDF generation error:', e)
      showToast('Failed to generate PDF: ' + (e.message || 'unknown error'), 'error')
    } finally {
      setGenerating(false)
    }
  }

  const exportCSV = () => {
    if (!filtered.length) { showToast('No tickets match these filters', 'error'); return }
    const headers = ['Ticket #','Title','Category','Status','Priority','Client','Assigned To','SLA Due','Created','Resolved']
    const rows = filtered.map(t => [
      t.ticket_number, `"${(t.title||'').replace(/"/g,'""')}"`, t.category, t.status, t.priority,
      t.client?.full_name||'', t.assigned_to?.full_name||'Unassigned',
      t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : 'No SLA',
      t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '',
      t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('en-GB') : '—',
    ])
    const csv = [headers, ...rows].map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `AEG_Report_${rangePreset}_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .filter-section { background:#FFFFFF; border:1.5px solid #F1F5F9; border-radius:16px; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
    .date-input { padding:0.6rem 0.85rem; background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:8px; color:#0F172A; font-size:0.82rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; }
    .date-input:focus { border-color:#E8450A; box-shadow:0 0 0 3px rgba(232,69,10,0.08); }
    .gen-btn:hover:not(:disabled) { background:#C93A08 !important; transform:translateY(-1px); }
    .csv-btn:hover:not(:disabled) { background:#F1F5F9 !important; }
  `

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Reports"
        subtitle="Generate flexible, filtered ticket reports"
        actions={
          <Link to="/admin" style={{ padding:'0.55rem 1.1rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', color:'#475569', borderRadius:8, fontSize:'0.82rem', fontWeight:600, textDecoration:'none' }}>← Dashboard</Link>
        }
      />

      <div style={{ padding:'2rem', fontFamily:'Plus Jakarta Sans,sans-serif', background:'#F8FAFC', minHeight:'100%', animation:'fadeIn 0.4s ease both' }}>

        <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:'1.5rem', alignItems:'start' }}>

          {/* ── LEFT: FILTERS ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Report title */}
            <div className="filter-section">
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'#374151', marginBottom:'0.5rem' }}>Report Title</label>
              <input type="text" value={reportTitle} onChange={e=>setReportTitle(e.target.value)} className="date-input" style={{ width:'100%' }} />
            </div>

            {/* Date range */}
            <div className="filter-section">
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0F172A', marginBottom:'0.85rem' }}>📅 Date Range</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom: rangePreset==='custom' ? '0.85rem' : 0 }}>
                {PRESET_RANGES.map(r => (
                  <Chip key={r.v} active={rangePreset===r.v} onClick={()=>setRangePreset(r.v)} color="#6460FF">{r.label}</Chip>
                ))}
              </div>
              {rangePreset === 'custom' && (
                <div style={{ display:'flex', gap:'0.6rem' }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:'0.68rem', color:'#94A3B8', fontWeight:600, display:'block', marginBottom:'0.3rem' }}>From</label>
                    <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="date-input" style={{ width:'100%' }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:'0.68rem', color:'#94A3B8', fontWeight:600, display:'block', marginBottom:'0.3rem' }}>To</label>
                    <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="date-input" style={{ width:'100%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="filter-section">
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0F172A', marginBottom:'0.85rem' }}>🔘 Status</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                {STATUS_OPTS.map(s => (
                  <Chip key={s} active={statusFilter.includes(s)} onClick={()=>toggle(statusFilter,setStatusFilter,s)} color={STATUS_C[s]}>
                    {s.replace('_',' ')}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="filter-section">
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0F172A', marginBottom:'0.85rem' }}>🎯 Priority</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                {PRIORITY_OPTS.map(p => (
                  <Chip key={p} active={priorityFilter.includes(p)} onClick={()=>toggle(priorityFilter,setPriorityFilter,p)} color={PRI_C[p]}>
                    {p}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="filter-section">
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0F172A', marginBottom:'0.85rem' }}>📂 Category</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                {CATEGORY_OPTS.map(c => (
                  <Chip key={c} active={categoryFilter.includes(c)} onClick={()=>toggle(categoryFilter,setCategoryFilter,c)} color="#E8450A">
                    {c}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Staff */}
            <div className="filter-section">
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#0F172A', marginBottom:'0.85rem' }}>👤 Assigned Staff</div>
              <select value={staffFilter} onChange={e=>setStaffFilter(e.target.value)} className="date-input" style={{ width:'100%', cursor:'pointer' }}>
                <option value="">All staff</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ padding:'0.7rem', background:'#FEF2F2', border:'1.5px solid #FECACA', color:'#DC2626', borderRadius:10, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                ✕ Clear all filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* ── RIGHT: PREVIEW + GENERATE ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Preview summary */}
            <div style={{ background:'linear-gradient(135deg,#FFF5F2 0%,#FFFBEB 50%,#F5F3FF 100%)', border:'1.5px solid #FED7C8', borderRadius:18, padding:'1.75rem 2rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'1rem' }}>
                <div>
                  <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.1rem', fontWeight:800, color:'#0F172A' }}>{reportTitle}</div>
                  <div style={{ fontSize:'0.8rem', color:'#64748B', marginTop:'0.2rem' }}>{periodLabel} · {loading ? 'Loading...' : `${filtered.length} matching tickets`}</div>
                </div>
                <div style={{ display:'flex', gap:'0.6rem' }}>
                  <button onClick={exportCSV} disabled={loading || !filtered.length} className="csv-btn" style={{ padding:'0.7rem 1.1rem', background:'#FFFFFF', border:'1.5px solid #E2E8F0', color:'#475569', borderRadius:10, fontSize:'0.82rem', fontWeight:600, cursor: loading||!filtered.length ?'not-allowed':'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', transition:'all 0.2s' }}>
                    📊 Export CSV
                  </button>
                  <button onClick={generatePDF} disabled={generating || loading || !filtered.length} className="gen-btn" style={{ padding:'0.7rem 1.4rem', background:'#E8450A', color:'#fff', border:'none', borderRadius:10, fontSize:'0.85rem', fontWeight:700, cursor: generating||loading||!filtered.length ?'not-allowed':'pointer', fontFamily:'Plus Jakarta Sans,sans-serif', boxShadow:'0 4px 14px rgba(232,69,10,0.3)', display:'flex', alignItems:'center', gap:'0.5rem', opacity: generating||loading||!filtered.length ? 0.6 : 1, transition:'all 0.2s' }}>
                    {generating ? (
                      <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> Generating...</>
                    ) : '📄 Download PDF Report →'}
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'0.6rem' }}>
                {[
                  ['Total', stats.total, '#0F172A'],
                  ['Resolved', stats.resolved, '#059669'],
                  ['Open', stats.open, '#DC2626'],
                  ['In Progress', stats.inProgress, '#6460FF'],
                  ['Pending', stats.pending, '#D97706'],
                  ['Critical', stats.critical, '#DC2626'],
                  ['SLA Met', `${stats.slaMet}/${stats.total||0}`, '#059669'],
                ].map(([label,val,c]) => (
                  <div key={label} style={{ background:'#FFFFFF', border:'1px solid #FED7C8', borderRadius:10, padding:'0.65rem 0.5rem', textAlign:'center' }}>
                    <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'1.15rem', fontWeight:800, color:c }}>{val}</div>
                    <div style={{ fontSize:'0.62rem', color:'#94A3B8', fontWeight:600, marginTop:'0.1rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket preview table */}
            <div style={{ background:'#FFFFFF', border:'1.5px solid #F1F5F9', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'0.9rem', fontWeight:700, color:'#0F172A' }}>Preview — Tickets Included in Report</div>
                {filtered.length > 50 && <span style={{ fontSize:'0.72rem', color:'#94A3B8' }}>Showing first 50 of {filtered.length}</span>}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'110px 1fr 100px 90px 90px 110px', gap:'0.75rem', padding:'0.6rem 1.5rem', background:'#F8FAFC', borderBottom:'1px solid #F1F5F9' }}>
                {['Ticket #','Title','Category','Status','Priority','Created'].map(h => (
                  <span key={h} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.62rem', color:'#94A3B8', letterSpacing:'0.06em', textTransform:'uppercase' }}>{h}</span>
                ))}
              </div>

              <div style={{ maxHeight:480, overflowY:'auto' }}>
                {loading ? (
                  <div style={{ padding:'3rem', textAlign:'center' }}>
                    <div style={{ width:32, height:32, border:'3px solid #FED7C8', borderTopColor:'#E8450A', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 0.75rem' }} />
                    <div style={{ color:'#94A3B8', fontSize:'0.82rem' }}>Loading tickets...</div>
                  </div>
                ) : !filtered.length ? (
                  <div style={{ padding:'3.5rem 2rem', textAlign:'center' }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:'0.85rem', opacity:0.3 }}>📭</div>
                    <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:700, color:'#0F172A', marginBottom:'0.3rem' }}>No tickets match these filters</div>
                    <div style={{ fontSize:'0.82rem', color:'#94A3B8' }}>Try adjusting your filters above</div>
                  </div>
                ) : filtered.slice(0, 50).map(t => (
                  <div key={t.id} style={{ display:'grid', gridTemplateColumns:'110px 1fr 100px 90px 90px 110px', gap:'0.75rem', alignItems:'center', padding:'0.75rem 1.5rem', borderBottom:'1px solid #F8FAFC' }}>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.7rem', color:'#94A3B8' }}>{t.ticket_number}</span>
                    <span style={{ fontSize:'0.82rem', fontWeight:600, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</span>
                    <span style={{ fontSize:'0.76rem', color:'#64748B', textTransform:'capitalize' }}>{t.category}</span>
                    <span style={{ fontSize:'0.74rem', fontWeight:700, color: STATUS_C[t.status]||'#64748B', textTransform:'capitalize' }}>{(t.status||'').replace('_',' ')}</span>
                    <span style={{ fontSize:'0.74rem', fontWeight:700, color: PRI_C[t.priority]||'#64748B', textTransform:'capitalize' }}>{t.priority}</span>
                    <span style={{ fontSize:'0.74rem', color:'#94A3B8' }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}