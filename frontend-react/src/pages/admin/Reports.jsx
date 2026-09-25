import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Topbar from '../../components/layout/Topbar'
import { tickets, users, helpers } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import useAuthStore from '../../stores/authStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

var STATUS_OPTS = ['open', 'in_progress', 'pending', 'resolved', 'closed']
var PRIORITY_OPTS = ['critical', 'high', 'medium', 'low']
var CATEGORY_OPTS = ['technical', 'administrative', 'billing', 'infrastructure', 'hr', 'security', 'general']

var PRESET_RANGES = [
  { v: 'all', label: 'All time' },
  { v: 'today', label: 'Today' },
  { v: 'week', label: 'This week' },
  { v: 'month', label: 'This month' },
  { v: 'year', label: 'This year' },
  { v: 'custom', label: 'Custom range' },
]

var STATUS_C = { open: '#F87171', in_progress: '#7C6FEE', pending: '#FBBF24', resolved: '#34D399', closed: '#8A93A6' }
var PRI_C = { critical: '#F87171', high: '#F97316', medium: '#8A93A6', low: '#5C6478' }

function Icon(props) {
  var name = props.name
  var size = props.size || 15
  var strokeWidth = props.strokeWidth || 1.8
  var common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
  if (name === 'circle-dot') return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" /></svg>
  if (name === 'target') return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
  if (name === 'folder') return <svg {...common}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" /></svg>
  if (name === 'x') return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  if (name === 'bar-chart') return <svg {...common}><path d="M3 20h18" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></svg>
  if (name === 'file-text') return <svg {...common}><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9.5 13h5M9.5 16.5h5" /></svg>
  if (name === 'inbox') return <svg {...common}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" /></svg>
  return null
}

function rangeToDates(preset, customFrom, customTo) {
  var now = new Date()
  var from = null, to = null
  if (preset === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  } else if (preset === 'week') {
    var day = now.getDay() || 7
    from = new Date(now); from.setDate(now.getDate() - day + 1); from.setHours(0, 0, 0, 0)
    to = new Date(from); to.setDate(from.getDate() + 6); to.setHours(23, 59, 59, 999)
  } else if (preset === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  } else if (preset === 'year') {
    from = new Date(now.getFullYear(), 0, 1)
    to = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
  } else if (preset === 'custom') {
    from = customFrom ? new Date(customFrom) : null
    to = customTo ? new Date(customTo + 'T23:59:59') : null
  }
  return { from: from, to: to }
}

function Chip(props) {
  var active = props.active, color = props.color || '#F97316'
  return (
    <button onClick={props.onClick} style={{
      padding: '0.4rem 0.9rem', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
      border: '1.5px solid ' + (active ? color : 'rgba(255,255,255,0.1)'),
      background: active ? color + '1F' : 'rgba(255,255,255,0.03)',
      color: active ? color : '#8A93A6',
      fontFamily: "'Inter',sans-serif", transition: 'all 0.15s',
    }}>{props.children}</button>
  )
}

export default function AdminReports() {
  var authStore = useAuthStore()
  var user = authStore.user
  var showToast = useToast()
  var allTicketsArr = useState([])
  var allTickets = allTicketsArr[0]
  var setAllTickets = allTicketsArr[1]
  var staffListArr = useState([])
  var staffList = staffListArr[0]
  var setStaffList = staffListArr[1]
  var loadingArr = useState(true)
  var loading = loadingArr[0]
  var setLoading = loadingArr[1]
  var generatingArr = useState(false)
  var generating = generatingArr[0]
  var setGenerating = generatingArr[1]

  var statusFilterArr = useState([])
  var statusFilter = statusFilterArr[0]
  var setStatusFilter = statusFilterArr[1]
  var priorityFilterArr = useState([])
  var priorityFilter = priorityFilterArr[0]
  var setPriorityFilter = priorityFilterArr[1]
  var categoryFilterArr = useState([])
  var categoryFilter = categoryFilterArr[0]
  var setCategoryFilter = categoryFilterArr[1]
  var staffFilterArr = useState('')
  var staffFilter = staffFilterArr[0]
  var setStaffFilter = staffFilterArr[1]
  var rangePresetArr = useState('month')
  var rangePreset = rangePresetArr[0]
  var setRangePreset = rangePresetArr[1]
  var customFromArr = useState('')
  var customFrom = customFromArr[0]
  var setCustomFrom = customFromArr[1]
  var customToArr = useState('')
  var customTo = customToArr[0]
  var setCustomTo = customToArr[1]
  var reportTitleArr = useState('Issue Ticket Report')
  var reportTitle = reportTitleArr[0]
  var setReportTitle = reportTitleArr[1]

  useEffect(function () { loadData() }, [])

  function loadData() {
    setLoading(true)
    users.list().catch(function (e) { console.error(e); return null }).then(function (uRes) {
      if (uRes) setStaffList((Array.isArray(uRes) ? uRes : uRes.users || []).filter(function (u) { return u.role === 'staff' }))

      var all = []
      var page = 1
      var pageSize = 100
      function loop() {
        return tickets.list({ page: page, page_size: pageSize }).catch(function (e) { console.error('Tickets fetch error:', e); return null }).then(function (res) {
          if (!res || !res.tickets || !res.tickets.length) return
          all = all.concat(res.tickets)
          if (res.tickets.length < pageSize || all.length >= (res.total || all.length)) return
          page++
          if (page > 20) return
          return loop()
        })
      }
      return loop().then(function () { setAllTickets(all) })
    }).finally(function () { setLoading(false) })
  }

  function toggle(arr, setArr, val) {
    setArr(arr.indexOf(val) !== -1 ? arr.filter(function (x) { return x !== val }) : arr.concat([val]))
  }

  var filtered = useMemo(function () {
    var range = rangeToDates(rangePreset, customFrom, customTo)
    var from = range.from, to = range.to
    return allTickets.filter(function (t) {
      if (statusFilter.length && statusFilter.indexOf(t.status) === -1) return false
      if (priorityFilter.length && priorityFilter.indexOf(t.priority) === -1) return false
      if (categoryFilter.length && categoryFilter.indexOf(t.category) === -1) return false
      if (staffFilter && (!t.assigned_to || t.assigned_to.id !== staffFilter)) return false
      if (from || to) {
        var created = new Date(t.created_at)
        if (from && created < from) return false
        if (to && created > to) return false
      }
      return true
    })
  }, [allTickets, statusFilter, priorityFilter, categoryFilter, staffFilter, rangePreset, customFrom, customTo])

  var stats = useMemo(function () {
    var total = filtered.length
    var resolved = filtered.filter(function (t) { return t.status === 'resolved' }).length
    var open = filtered.filter(function (t) { return t.status === 'open' }).length
    var inProgress = filtered.filter(function (t) { return t.status === 'in_progress' }).length
    var pending = filtered.filter(function (t) { return t.status === 'pending' }).length
    var critical = filtered.filter(function (t) { return t.priority === 'critical' }).length
    var slaBreached = filtered.filter(function (t) {
      if (!t.due_date) return false
      var due = new Date(t.due_date)
      return due < new Date() && ['resolved', 'closed'].indexOf(t.status) === -1
    }).length
    return { total: total, resolved: resolved, open: open, inProgress: inProgress, pending: pending, critical: critical, slaBreached: slaBreached, slaMet: total - slaBreached }
  }, [filtered])

  var rangeDates = rangeToDates(rangePreset, customFrom, customTo)
  var rangeFrom = rangeDates.from, rangeTo = rangeDates.to
  var periodLabel = rangePreset === 'all'
    ? 'All time'
    : rangeFrom && rangeTo
      ? rangeFrom.toLocaleDateString('en-GB') + ' \u2014 ' + rangeTo.toLocaleDateString('en-GB')
      : 'All time'

  function clearFilters() {
    setStatusFilter([]); setPriorityFilter([]); setCategoryFilter([]); setStaffFilter(''); setRangePreset('all')
    setCustomFrom(''); setCustomTo('')
  }

  var activeFilterCount = statusFilter.length + priorityFilter.length + categoryFilter.length + (staffFilter ? 1 : 0) + (rangePreset !== 'all' ? 1 : 0)

  function generatePDF() {
    if (!filtered.length) { showToast('No tickets match these filters', 'error'); return }
    setGenerating(true)

    var doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    var W = doc.internal.pageSize.getWidth()
    var H = doc.internal.pageSize.getHeight()

    var NAVY = [13, 27, 42]
    var ORANGE = [232, 69, 10]
    var GRAY = [100, 116, 139]
    var LGRAY = [248, 250, 252]

    var now = new Date()
    var generatedOn = now.toLocaleString('en-GB')
    var generatedBy = (user && user.email) || 'admin'

    function loadLogo() {
      return new Promise(function (resolve) {
        var img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = function () {
          try {
            var canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
            var ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          } catch (e) { resolve(null) }
        }
        img.onerror = function () { resolve(null) }
        img.src = '/aeg_logo.png'
      })
    }

    loadLogo().then(function (logoData) {
      function addHeaderFooter(pageNum) {
        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2])
        doc.rect(0, 0, W, 16, 'F')
        doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2])
        doc.rect(0, 16, W, 1.2, 'F')
        if (logoData) {
          try { doc.addImage(logoData, 'PNG', 8, 2.5, 26, 10, undefined, 'FAST') } catch (e) { }
        }
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text(reportTitle, W - 8, 7, { align: 'right' })
        doc.setFontSize(7.5)
        doc.setTextColor(180, 190, 205)
        doc.setFont('helvetica', 'normal')
        doc.text('Adaptive Engineering Group Ltd  \u00b7  AEGIS v1.0.0', W - 8, 12, { align: 'right' })

        doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2])
        doc.rect(0, H - 9, W, 0.6, 'F')
        doc.setFillColor(NAVY[0], NAVY[1], NAVY[2])
        doc.rect(0, H - 8.4, W, 8.4, 'F')
        doc.setFontSize(6)
        doc.setTextColor(170, 180, 195)
        doc.text('Generated on: ' + generatedOn + '  |  Generated by: ' + generatedBy + '  |  \u00a9 2026 Adaptive Engineering Group Ltd. Confidential.', W / 2, H - 4, { align: 'center' })
        doc.setFontSize(7)
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.text('Page ' + pageNum, W - 8, H - 4, { align: 'right' })
      }

      addHeaderFooter(1)

      var y = 24
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text(reportTitle, 8, y)

      doc.setFontSize(7)
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
      doc.setFont('helvetica', 'bold')
      doc.text('REPORT PERIOD', W - 8, y - 3, { align: 'right' })
      doc.setFontSize(10)
      doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
      doc.text(periodLabel, W - 8, y + 2, { align: 'right' })

      y += 4
      doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2])
      doc.setLineWidth(0.6)
      doc.line(8, y, W - 8, y)
      y += 6

      doc.setFillColor(LGRAY[0], LGRAY[1], LGRAY[2])
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(8, y, W - 16, 14, 1, 1, 'FD')
      doc.setFontSize(7.5)
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
      doc.setFont('helvetica', 'normal')
      var filterParts = []
      if (statusFilter.length) filterParts.push('Status: ' + statusFilter.join(', '))
      if (priorityFilter.length) filterParts.push('Priority: ' + priorityFilter.join(', '))
      if (categoryFilter.length) filterParts.push('Category: ' + categoryFilter.join(', '))
      if (staffFilter) {
        var sf = staffList.find(function (s) { return s.id === staffFilter })
        filterParts.push('Staff: ' + (sf ? sf.full_name : ''))
      }
      var filterText = filterParts.length ? filterParts.join('   |   ') : 'No filters applied - showing all tickets'
      doc.text('Filters: ' + filterText, 12, y + 5.5)
      doc.text('Prepared by: System Administrator   |   Organization: Adaptive Engineering Group Ltd, Kamembe, Rwanda', 12, y + 10.5)
      y += 18

      var statBoxes = [
        ['Total', stats.total, NAVY],
        ['Resolved', stats.resolved, [5, 150, 105]],
        ['Open', stats.open, ORANGE],
        ['In Progress', stats.inProgress, [100, 96, 255]],
        ['Pending', stats.pending, [217, 119, 6]],
        ['Critical', stats.critical, [220, 38, 38]],
        ['SLA Met', stats.slaMet + '/' + stats.total, [5, 150, 105]],
      ]
      var boxW = (W - 16) / statBoxes.length
      statBoxes.forEach(function (box, i) {
        var label = box[0], val = box[1], color = box[2]
        var x = 8 + i * boxW
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.3)
        doc.rect(x, y, boxW, 14)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.setTextColor(color[0], color[1], color[2])
        doc.text(String(val), x + boxW / 2, y + 7, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
        doc.text(label, x + boxW / 2, y + 11.5, { align: 'center' })
      })
      y += 18

      var tableRows = filtered.map(function (t, i) {
        return [
          String(i + 1),
          t.ticket_number || '',
          (t.title || '').slice(0, 50),
          t.category || '',
          (t.status || '').replace('_', ' '),
          t.priority || '',
          (t.client && t.client.full_name) || '\u2014',
          (t.assigned_to && t.assigned_to.full_name) || 'Unassigned',
          t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : 'No SLA',
          t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '',
          t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('en-GB') : '\u2014',
        ]
      })

      autoTable(doc, {
        startY: y,
        head: [['#', 'Ticket No.', 'Title', 'Category', 'Status', 'Priority', 'Client', 'Assigned', 'SLA Due', 'Created', 'Resolved']],
        body: tableRows,
        margin: { left: 8, right: 8, bottom: 13 },
        styles: { fontSize: 6.5, cellPadding: 1.6, textColor: NAVY, lineColor: [226, 232, 240], lineWidth: 0.2 },
        headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', fontSize: 6.8, halign: 'center' },
        alternateRowStyles: { fillColor: LGRAY },
        columnStyles: {
          0: { halign: 'center', cellWidth: 6 },
          1: { cellWidth: 20 },
          2: { cellWidth: 58 },
          3: { cellWidth: 20 },
          4: { halign: 'center', cellWidth: 18 },
          5: { halign: 'center', cellWidth: 15 },
          6: { cellWidth: 22 },
          7: { cellWidth: 22 },
          8: { halign: 'center', cellWidth: 18 },
          9: { halign: 'center', cellWidth: 18 },
          10: { halign: 'center', cellWidth: 18 },
        },
        didParseCell: function (data) {
          if (data.section === 'body') {
            if (data.column.index === 4) {
              var status = filtered[data.row.index] && filtered[data.row.index].status
              var c = { open: [220, 38, 38], in_progress: [100, 96, 255], pending: [217, 119, 6], resolved: [5, 150, 105], closed: [100, 116, 139] }[status]
              if (c) { data.cell.styles.textColor = c; data.cell.styles.fontStyle = 'bold' }
            }
            if (data.column.index === 5) {
              var pri = filtered[data.row.index] && filtered[data.row.index].priority
              var c2 = { critical: [220, 38, 38], high: [217, 119, 6], medium: [107, 114, 128], low: [148, 163, 184] }[pri]
              if (c2) { data.cell.styles.textColor = c2; data.cell.styles.fontStyle = 'bold' }
            }
          }
        },
        didDrawPage: function () {
          addHeaderFooter(doc.internal.getNumberOfPages())
        },
      })

      var finalY = doc.lastAutoTable.finalY + 10
      if (finalY > H - 35) { doc.addPage(); addHeaderFooter(doc.internal.getNumberOfPages()); finalY = 28 }

      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.3)
      doc.line(8, finalY, W - 8, finalY)
      finalY += 6

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
      var sigCols = [8, 8 + (W - 16) / 3, 8 + 2 * (W - 16) / 3]
      var sigLabels = ['Prepared by', 'Reviewed by', 'Approved by']
      var sigRoles = ['System Administrator', 'Department Head', 'Authorized Officer']
      sigCols.forEach(function (x, i) {
        doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2])
        doc.setFont('helvetica', 'bold')
        doc.text(sigLabels[i], x, finalY)
        doc.setDrawColor(150, 150, 150)
        doc.line(x, finalY + 12, x + 70, finalY + 12)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
        doc.text(sigRoles[i], x, finalY + 16)
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
        doc.text('Adaptive Engineering Group Ltd', x, finalY + 20)
      })

      var filename = 'AEG_Report_' + rangePreset + '_' + now.toISOString().slice(0, 10) + '.pdf'
      doc.save(filename)
      showToast('Report downloaded - ' + filtered.length + ' tickets')
      setGenerating(false)
    }).catch(function (e) {
      console.error('PDF generation error:', e)
      showToast('Failed to generate PDF: ' + (e.message || 'unknown error'), 'error')
      setGenerating(false)
    })
  }

  function exportCSV() {
    if (!filtered.length) { showToast('No tickets match these filters', 'error'); return }
    var headers = ['Ticket #', 'Title', 'Category', 'Status', 'Priority', 'Client', 'Assigned To', 'SLA Due', 'Created', 'Resolved']
    var rows = filtered.map(function (t) {
      return [
        t.ticket_number, '"' + (t.title || '').replace(/"/g, '""') + '"', t.category, t.status, t.priority,
        (t.client && t.client.full_name) || '', (t.assigned_to && t.assigned_to.full_name) || 'Unassigned',
        t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : 'No SLA',
        t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '',
        t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('en-GB') : '\u2014',
      ]
    })
    var csv = [headers].concat(rows).map(function (r) { return r.join(',') }).join('\n')
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a'); a.href = url
    a.download = 'AEG_Report_' + rangePreset + '_' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click(); URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');\n    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }\n    @keyframes spin { to{transform:rotate(360deg)} }\n    .filter-section { background:rgba(255,255,255,0.03); border:1.5px solid rgba(255,255,255,0.08); border-radius:16px; padding:1.5rem; }\n    .date-input { padding:0.6rem 0.85rem; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.1); border-radius:8px; color:#F1F3F8; font-size:0.82rem; font-family:'Inter',sans-serif; outline:none; }\n    .date-input:focus { border-color:#F97316; box-shadow:0 0 0 3px rgba(249,115,22,0.15); }\n    .gen-btn:hover:not(:disabled) { transform:translateY(-1px); }\n    .csv-btn:hover:not(:disabled) { background:rgba(255,255,255,0.07) !important; }\n  "

  return (
    <DashboardLayout>
      <style>{css}</style>
      <Topbar
        title="Reports"
        subtitle="Generate flexible, filtered ticket reports"
        actions={
          <Link to="/admin" style={{ padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#D6DCE8', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>&larr; Dashboard</Link>
        }
      />

      <div style={{ padding: '2rem', fontFamily: "'Inter',sans-serif", background: '#05070D', minHeight: '100%', animation: 'fadeIn 0.4s ease both' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="filter-section">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#8A93A6', marginBottom: '0.5rem' }}>Report Title</label>
              <input type="text" value={reportTitle} onChange={function (e) { setReportTitle(e.target.value) }} className="date-input" style={{ width: '100%' }} />
            </div>

            <div className="filter-section">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="calendar" size={15} /> Date Range</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: rangePreset === 'custom' ? '0.85rem' : 0 }}>
                {PRESET_RANGES.map(function (r) {
                  return <Chip key={r.v} active={rangePreset === r.v} onClick={function () { setRangePreset(r.v) }} color="#7C6FEE">{r.label}</Chip>
                })}
              </div>
              {rangePreset === 'custom' && (
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>From</label>
                    <input type="date" value={customFrom} onChange={function (e) { setCustomFrom(e.target.value) }} className="date-input" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: '#5C6478', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>To</label>
                    <input type="date" value={customTo} onChange={function (e) { setCustomTo(e.target.value) }} className="date-input" style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="filter-section">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="circle-dot" size={15} /> Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {STATUS_OPTS.map(function (s) {
                  return <Chip key={s} active={statusFilter.indexOf(s) !== -1} onClick={function () { toggle(statusFilter, setStatusFilter, s) }} color={STATUS_C[s]}>{s.replace('_', ' ')}</Chip>
                })}
              </div>
            </div>

            <div className="filter-section">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="target" size={15} /> Priority</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PRIORITY_OPTS.map(function (p) {
                  return <Chip key={p} active={priorityFilter.indexOf(p) !== -1} onClick={function () { toggle(priorityFilter, setPriorityFilter, p) }} color={PRI_C[p]}>{p}</Chip>
                })}
              </div>
            </div>

            <div className="filter-section">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="folder" size={15} /> Category</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {CATEGORY_OPTS.map(function (c) {
                  return <Chip key={c} active={categoryFilter.indexOf(c) !== -1} onClick={function () { toggle(categoryFilter, setCategoryFilter, c) }} color="#F97316">{c}</Chip>
                })}
              </div>
            </div>

            <div className="filter-section">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F1F3F8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="user" size={15} /> Assigned Staff</div>
              <select value={staffFilter} onChange={function (e) { setStaffFilter(e.target.value) }} className="date-input" style={{ width: '100%', cursor: 'pointer' }}>
                <option value="">All staff</option>
                {staffList.map(function (s) { return <option key={s.id} value={s.id}>{s.full_name}</option> })}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ padding: '0.7rem', background: 'rgba(248,113,113,0.1)', border: '1.5px solid rgba(248,113,113,0.3)', color: '#F87171', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Icon name="x" size={14} /> Clear all filters ({activeFilterCount})
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ background: 'linear-gradient(135deg,rgba(232,69,10,0.1) 0%,rgba(124,111,238,0.08) 100%)', border: '1.5px solid rgba(249,115,22,0.25)', borderRadius: 18, padding: '1.75rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#F1F3F8' }}>{reportTitle}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8A93A6', marginTop: '0.2rem' }}>{periodLabel} &middot; {loading ? 'Loading...' : filtered.length + ' matching tickets'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={exportCSV} disabled={loading || !filtered.length} className="csv-btn" style={{ padding: '0.7rem 1.1rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#D6DCE8', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, cursor: loading || !filtered.length ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon name="bar-chart" size={14} /> Export CSV
                  </button>
                  <button onClick={generatePDF} disabled={generating || loading || !filtered.length} className="gen-btn" style={{ padding: '0.7rem 1.4rem', background: 'linear-gradient(135deg,#E8450A,#F97316)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: generating || loading || !filtered.length ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", boxShadow: '0 4px 14px rgba(232,69,10,0.35)', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: generating || loading || !filtered.length ? 0.6 : 1, transition: 'all 0.2s' }}>
                    {generating ? (
                      <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg> Generating...</>
                    ) : <><Icon name="file-text" size={15} /> Download PDF Report \u2192</>}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.6rem' }}>
                {[
                  ['Total', stats.total, '#F1F3F8'],
                  ['Resolved', stats.resolved, '#34D399'],
                  ['Open', stats.open, '#F87171'],
                  ['In Progress', stats.inProgress, '#B4ACF9'],
                  ['Pending', stats.pending, '#FBBF24'],
                  ['Critical', stats.critical, '#F87171'],
                  ['SLA Met', stats.slaMet + '/' + (stats.total || 0), '#34D399'],
                ].map(function (arr) {
                  var label = arr[0], val = arr[1], c = arr[2]
                  return (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.15rem', fontWeight: 800, color: c }}>{val}</div>
                      <div style={{ fontSize: '0.62rem', color: '#8A93A6', fontWeight: 600, marginTop: '0.1rem' }}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#F1F3F8' }}>Preview - Tickets Included in Report</div>
                {filtered.length > 50 && <span style={{ fontSize: '0.72rem', color: '#5C6478' }}>Showing first 50 of {filtered.length}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 90px 90px 110px', gap: '0.75rem', padding: '0.6rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Ticket #', 'Title', 'Category', 'Status', 'Priority', 'Created'].map(function (h) {
                  return <span key={h} style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.62rem', color: '#5C6478', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                })}
              </div>

              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
                    <div style={{ color: '#5C6478', fontSize: '0.82rem' }}>Loading tickets...</div>
                  </div>
                ) : !filtered.length ? (
                  <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                    <div style={{ color: '#3A3F52', marginBottom: '0.85rem', display: 'flex', justifyContent: 'center' }}><Icon name="inbox" size={40} strokeWidth={1.4} /></div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#F1F3F8', marginBottom: '0.3rem' }}>No tickets match these filters</div>
                    <div style={{ fontSize: '0.82rem', color: '#5C6478' }}>Try adjusting your filters above</div>
                  </div>
                ) : filtered.slice(0, 50).map(function (t) {
                  return (
                    <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 90px 90px 110px', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.7rem', color: '#5C6478' }}>{t.ticket_number}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F1F3F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                      <span style={{ fontSize: '0.76rem', color: '#8A93A6', textTransform: 'capitalize' }}>{t.category}</span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: STATUS_C[t.status] || '#8A93A6', textTransform: 'capitalize' }}>{(t.status || '').replace('_', ' ')}</span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: PRI_C[t.priority] || '#8A93A6', textTransform: 'capitalize' }}>{t.priority}</span>
                      <span style={{ fontSize: '0.74rem', color: '#5C6478' }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}