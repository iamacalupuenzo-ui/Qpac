import { useState, useRef, useEffect } from 'react'
import {
  FileText, Download, Calendar, FileSpreadsheet,
  ListTodo, AlertTriangle, Building2, BadgeDollarSign,
  Filter, CheckCircle2, ShieldCheck, Info,
  Search, X, ChevronLeft, ChevronRight, ChevronDown, Check,
} from 'lucide-react'
import clsx from 'clsx'
import ReportesRegulatoriosPage from './ReportesRegulatoriosPage'

/* ══════════════════════════════════════════════
   CATÁLOGO
══════════════════════════════════════════════ */
const REPORTES_CATALOGO = [
  { id: 'diario_fx',      name: 'Reporte Diario de Operaciones FX',       roles: ['back', 'tesoreria', 'head'],        icon: ListTodo       },
  { id: 'op_cliente',     name: 'Operaciones por Cliente',                 roles: ['middle', 'back'],                   icon: Building2      },
  { id: 'op_trader',      name: 'Operaciones por Trader',                  roles: ['head', 'tesoreria'],                icon: BadgeDollarSign },
  { id: 'op_moneda',      name: 'Operaciones por Moneda',                  roles: ['tesoreria', 'contab'],              icon: BadgeDollarSign },
  { id: 'op_tipo',        name: 'Operaciones por Tipo',                    roles: ['tesoreria'],                        icon: FileText       },
  { id: 'pos_diaria',     name: 'Posición Diaria',                         roles: ['tesoreria', 'contab'],              icon: FileSpreadsheet},
  { id: 'flujo_saldos',   name: 'Flujo de Saldos Bancarios',               roles: ['tesoreria', 'head'],                icon: FileSpreadsheet},
  { id: 'conciliacion',   name: 'Conciliación Bancaria',                   roles: ['back', 'contab'],                   icon: FileSpreadsheet},
  { id: 'control_bo',     name: 'Control de Operaciones BO',               roles: ['back'],                             icon: ListTodo       },
  { id: 'excepciones',    name: 'Excepciones Documentarias',               roles: ['middle', 'back'],                   icon: AlertTriangle  },
  { id: 'trama_contable', name: 'Trama de Asientos Contables (Bank+)',     roles: ['contab', 'tesoreria'],              icon: FileSpreadsheet},
  { id: 'utilidad',       name: 'Reporte de Utilidad',                     roles: ['gerente'],                          icon: BadgeDollarSign},
  { id: 'errores',        name: 'Reporte de Errores',                      roles: ['back'],                             icon: AlertTriangle  },
]

/* ══════════════════════════════════════════════
   MOCK DATA POR REPORTE
══════════════════════════════════════════════ */
const REPORT_DEFS = {
  diario_fx: {
    cols: ['ID Operación', 'Cliente', 'Tipo', 'Monto USD', 'TC Pactado', 'Equiv. PEN', 'Estado', 'Hora'],
    rows: [
      ['OP-20260426-001', 'Inversiones ABC SAC',  'COMPRA', '$ 50,000.00',  '3.742', 'S/ 187,100.00', 'Liquidada', '09:14'],
      ['OP-20260426-002', 'García López, María',  'VENTA',  '$ 12,500.00',  '3.738', 'S/ 46,725.00',  'Liquidada', '10:31'],
      ['OP-20260426-003', 'Empresa Delta SRL',    'COMPRA', '$ 85,000.00',  '3.745', 'S/ 318,325.00', 'Cerrada',   '11:02'],
      ['OP-20260426-004', 'Torres Ruiz, Carlos',  'VENTA',  '$ 8,200.00',   '3.736', 'S/ 30,635.20',  'Liquidada', '12:18'],
      ['OP-20260426-005', 'Comercial Norte SAC',  'COMPRA', '$ 125,000.00', '3.744', 'S/ 468,000.00', 'Liquidada', '13:45'],
      ['OP-20260426-006', 'Pérez Quispe, Juan',   'VENTA',  '$ 4,000.00',   '3.737', 'S/ 14,948.00',  'Liquidada', '14:20'],
      ['OP-20260426-007', 'Global Trade SAC',     'COMPRA', '$ 200,000.00', '3.741', 'S/ 748,200.00', 'Cerrada',   '15:03'],
    ],
  },
  op_cliente: {
    cols: ['Cliente', 'RUC / DNI', 'Compras USD', 'Ventas USD', 'Total Ops', 'Última Op.'],
    rows: [
      ['Inversiones ABC SAC',  '20501234567', '$ 450,000.00', '$ 120,000.00', '18', '26/04/2026'],
      ['García López, María',  '10234567890', '$ 8,000.00',   '$ 45,500.00',  '7',  '25/04/2026'],
      ['Empresa Delta SRL',    '20609876543', '$ 320,000.00', '$ 80,000.00',  '12', '26/04/2026'],
      ['Torres Ruiz, Carlos',  '10876543210', '$ 2,500.00',   '$ 18,200.00',  '4',  '24/04/2026'],
      ['Comercial Norte SAC',  '20345678901', '$ 680,000.00', '$ 210,000.00', '31', '26/04/2026'],
      ['Global Trade SAC',     '20412345678', '$ 1,240,000.00','$ 380,000.00','54', '26/04/2026'],
    ],
  },
  op_trader: {
    cols: ['Trader', 'Compra (Ops)', 'Venta (Ops)', 'Total USD', 'Spread Prom.'],
    rows: [
      ['Marco Quispe L.', '14 ops – $ 820,000', '8 ops – $ 320,000',  '$ 1,140,000', '0.0042'],
      ['Ana Torres V.',   '9 ops – $ 450,000',  '11 ops – $ 480,000', '$ 930,000',   '0.0038'],
      ['Luis Mendoza R.', '6 ops – $ 210,000',  '7 ops – $ 190,000',  '$ 400,000',   '0.0035'],
    ],
  },
  op_moneda: {
    cols: ['Moneda', 'Ops Compra', 'Ops Venta', 'Total Compra', 'Total Venta'],
    rows: [
      ['USD', '29', '26', '$ 1,480,000.00', '$ 990,000.00'],
      ['EUR', '4',  '3',  '€ 48,000.00',   '€ 32,000.00'],
    ],
  },
  op_tipo: {
    cols: ['Tipo de Operación', 'Cantidad', 'Monto USD', '% del Total'],
    rows: [
      ['Compra spot', '33', '$ 1,480,000.00', '59.9 %'],
      ['Venta spot',  '29', '$ 990,000.00',   '40.1 %'],
    ],
  },
  pos_diaria: {
    cols: ['Cuenta', 'Moneda', 'Saldo Contable', 'TC SBS', 'Equiv. USD'],
    rows: [
      ['BCP – 123456789',    'USD', '$ 980,240.00',   '—',     '$ 980,240.00'],
      ['BCP – 987654321',    'PEN', 'S/ 1,240,500.00','3.742', '$ 331,505.88'],
      ['Scotiabank – 55501', 'USD', '$ 412,000.00',   '—',     '$ 412,000.00'],
      ['Interbank – 88823',  'PEN', 'S/ 650,000.00',  '3.742', '$ 173,703.37'],
    ],
  },
  flujo_saldos: {
    cols: ['Banco', 'Cuenta', 'Saldo Inicial', 'Ingresos', 'Salidas', 'Saldo Final'],
    rows: [
      ['BCP',       '123456789', '$ 900,000.00',   '$ 320,000.00', '$ 239,760.00', '$ 980,240.00'],
      ['Scotiabank','55501',     '$ 380,000.00',   '$ 120,000.00', '$ 88,000.00',  '$ 412,000.00'],
      ['Interbank', '88823',     'S/ 600,000.00',  'S/ 280,000.00','S/ 230,000.00','S/ 650,000.00'],
    ],
  },
  conciliacion: {
    cols: ['Fecha', 'Cuadratura A', 'Cuadratura B', 'Estado', 'Usuario'],
    rows: [
      ['26/04/2026', 'OK (Δ 0.00)', 'OK (Δ 0.00)', 'Cerrada',        'Marco Q.'],
      ['25/04/2026', 'OK (Δ 0.00)', 'OK (Δ 0.00)', 'Cerrada',        'Marco Q.'],
      ['24/04/2026', 'OK (Δ 0.00)', 'OK (Δ 0.00)', 'Cerrada',        'Ana T.'],
      ['23/04/2026', 'Δ 120.50',    'OK (Δ 0.00)', 'Con diferencia', 'Ana T.'],
    ],
  },
  control_bo: {
    cols: ['ID Operación', 'Tipo', 'Cliente', 'Estado BO', 'Analista', 'Fecha Rev.'],
    rows: [
      ['OP-20260426-001', 'COMPRA', 'Inversiones ABC SAC',  'Aprobado', 'Ana T.',  '26/04/2026'],
      ['OP-20260426-002', 'VENTA',  'García López, M.',     'Aprobado', 'Ana T.',  '26/04/2026'],
      ['OP-20260425-015', 'COMPRA', 'Empresa Delta SRL',    'Observado','Luis M.', '25/04/2026'],
      ['OP-20260424-008', 'VENTA',  'Comercial Norte SAC',  'Aprobado', 'Luis M.', '24/04/2026'],
    ],
  },
  excepciones: {
    cols: ['ID Operación', 'Cliente', 'Tipo Excepción', 'Estado', 'Días Pend.'],
    rows: [
      ['OP-20260423-008', 'Comercial Norte SAC', 'Documentación incompleta', 'En revisión', '3'],
      ['OP-20260422-012', 'Torres Ruiz, C.',     'Límite cliente excedido',  'Escalado',    '4'],
    ],
  },
  trama_contable: {
    cols: ['ID Asiento', 'Cuenta Contable', 'Debe PEN', 'Haber PEN', 'Ref. Op.'],
    rows: [
      ['AST-20260426-001', '101001 – Caja USD',    'S/ 187,100.00', '—',             'OP-001'],
      ['AST-20260426-002', '401001 – Ingreso FX',  '—',             'S/ 187,100.00', 'OP-001'],
      ['AST-20260426-003', '101001 – Caja USD',    'S/ 46,725.00',  '—',             'OP-002'],
      ['AST-20260426-004', '401001 – Ingreso FX',  '—',             'S/ 46,725.00',  'OP-002'],
    ],
  },
  utilidad: {
    cols: ['Período', 'Compras USD', 'Ventas USD', 'Spread Prom.', 'Utilidad PEN'],
    rows: [
      ['Abril 2026 (MTD)', '$ 8,240,000.00', '$ 6,180,000.00', '0.0040', 'S/ 58,240.00'],
      ['Marzo 2026',       '$ 9,120,000.00', '$ 7,450,000.00', '0.0038', 'S/ 61,180.00'],
      ['Febrero 2026',     '$ 7,800,000.00', '$ 6,100,000.00', '0.0041', 'S/ 53,460.00'],
    ],
  },
  errores: {
    cols: ['Fecha', 'Módulo', 'Descripción', 'Usuario', 'Estado'],
    rows: [
      ['24/04 11:23', 'Cotización', 'Validación TC fuera de rango', 'Luis M.', 'Resuelto'],
      ['23/04 09:45', 'Tesorería',  'TC SBS no registrado',         'Sistema', 'Resuelto'],
    ],
  },
}

/* ══════════════════════════════════════════════
   ROUTER PRINCIPAL
══════════════════════════════════════════════ */
export default function ReportesPage({ activeTab, role }) {
  if (['bcrp_adelantado', 'bcrp_definitivo', 'ro_sbs'].includes(activeTab)) {
    return <ReportesRegulatoriosPage activeTab={activeTab} role={role} />
  }
  if (activeTab === 'anexo5_sbs') return <Anexo5SBSPage role={role} />
  return <ReportesInternos role={role} />
}

/* ══════════════════════════════════════════════
   REPORTES INTERNOS (RF-29)
══════════════════════════════════════════════ */
/* ── Shared FilterSelect for pageSize ── */
function PgSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)
  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div className="relative w-16" ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={clsx('flex items-center gap-1 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-white text-xs w-full',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300')}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}>
        <span className="flex-1 text-gray-700">{selected?.label}</span>
        <ChevronDown size={10} className={clsx('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx('w-full flex items-center justify-between px-2.5 py-1.5 text-xs',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50')}>
              {o.label}
              {o.value === value && <Check size={10} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ReportesInternos({ role }) {
  const catalogoPermitido = REPORTES_CATALOGO.filter(
    r => role === 'admin' || r.roles.includes(role)
  )

  const [selectedReport, setSelectedReport] = useState(
    catalogoPermitido[0] || null
  )
  const [dateRange,   setDateRange]   = useState({ start: '2026-04-01', end: '2026-04-26' })
  const [feedback,    setFeedback]    = useState(null)
  const [searchTable, setSearchTable] = useState('')
  const [page,        setPage]        = useState(1)
  const [pageSize,    setPageSize]    = useState(10)

  const def = REPORT_DEFS[selectedReport?.id] || { cols: [], rows: [] }

  const filteredRows = def.rows.filter(row =>
    !searchTable || row.some(cell =>
      cell.toString().toLowerCase().includes(searchTable.toLowerCase())
    )
  )
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const pagedRows  = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  function resetPage() { setPage(1) }

  function handleSelectReport(rep) {
    setSelectedReport(rep)
    setSearchTable('')
    resetPage()
  }

  function handleDownload(format) {
    if (!selectedReport) return
    setFeedback({ type: 'success', msg: `${selectedReport.name} exportado en formato ${format}. Descarga iniciada.` })
    setTimeout(() => setFeedback(null), 4000)
  }

  /* Stats */
  const stats = [
    { label: 'Reportes disponibles', value: catalogoPermitido.length, color: 'text-blue-600' },
    { label: 'Reporte activo',        value: selectedReport ? filteredRows.length + ' registros' : '—', color: 'text-gray-900' },
    { label: 'Período',               value: dateRange.start && dateRange.end ? `${dateRange.start.slice(8)}/${dateRange.start.slice(5,7)} – ${dateRange.end.slice(8)}/${dateRange.end.slice(5,7)}` : '—', color: 'text-gray-900' },
    { label: 'Estado',                value: selectedReport ? 'Listo' : 'Selecciona reporte', color: selectedReport ? 'text-green-600' : 'text-amber-600' },
  ]

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-start">

        {/* Sidebar catálogo */}
        <div className="w-60 shrink-0 bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <p className="text-xs font-semibold text-gray-900">Catálogo de Reportes</p>
          </div>
          <div className="p-2 space-y-0.5">
            {catalogoPermitido.map(rep => {
              const Icon = rep.icon
              return (
                <button
                  key={rep.id}
                  onClick={() => handleSelectReport(rep)}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors',
                    selectedReport?.id === rep.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon size={13} className={selectedReport?.id === rep.id ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="leading-tight">{rep.name}</span>
                </button>
              )
            })}
            {catalogoPermitido.length === 0 && (
              <p className="text-xs text-gray-400 px-3 py-2">No hay reportes asignados a tu rol.</p>
            )}
          </div>
        </div>

        {/* Panel principal */}
        <div className="flex-1 min-w-0 space-y-3">

          {selectedReport ? (
            <>
              {/* Barra de filtros + acciones */}
              <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedReport.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{filteredRows.length} de {def.rows.length} registros</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="date" value={dateRange.start}
                        onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                      />
                    </div>
                    <span className="text-xs text-gray-400">–</span>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="date" value={dateRange.end}
                        onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                      />
                    </div>
                    {/* Buscador */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white w-44 transition-all focus-within:ring-2 focus-within:ring-blue-100"
                      style={{ border: '1px solid var(--color-border)' }}>
                      <Search size={12} className="text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Buscar en tabla..."
                        value={searchTable}
                        onChange={e => { setSearchTable(e.target.value); resetPage() }}
                        className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full"
                      />
                      {searchTable && (
                        <button onClick={() => { setSearchTable(''); resetPage() }} className="text-gray-300 hover:text-gray-500 shrink-0">
                          <X size={11} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownload('Excel')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                    >
                      <Download size={12} /> Excel
                    </button>
                    <button
                      onClick={() => handleDownload('CSV')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <Download size={12} /> CSV
                    </button>
                  </div>
                </div>

                {/* Feedback inline */}
                {feedback && (
                  <div className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 border-b text-xs font-semibold',
                    feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  )} style={{ borderColor: 'var(--color-border)' }}>
                    <CheckCircle2 size={13} />
                    {feedback.msg}
                  </div>
                )}
              </div>

              {/* Tabla */}
              <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        {def.cols.map(col => (
                          <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50/60 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                          {row.map((cell, j) => (
                            <td key={j} className={clsx(
                              'px-4 py-3 text-xs whitespace-nowrap',
                              j === 0 ? 'font-mono font-bold text-gray-800' :
                              cell === 'COMPRA' ? 'font-bold text-blue-600' :
                              cell === 'VENTA'  ? 'font-bold text-orange-600' :
                              cell === 'Liquidada' || cell === 'Cerrada' || cell === 'Aprobado' ? 'text-green-700' :
                              cell === 'Observado' || cell === 'Escalado' ? 'text-amber-700' :
                              'text-gray-700'
                            )}>
                              {(cell === 'Liquidada' || cell === 'Cerrada' || cell === 'Aprobado') ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{cell}
                                </span>
                              ) : cell === 'Observado' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{cell}
                                </span>
                              ) : cell === 'Escalado' || cell === 'En revisión' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />{cell}
                                </span>
                              ) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {filteredRows.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Mostrar</span>
                      <PgSelect
                        value={String(pageSize)}
                        onChange={v => { setPageSize(Number(v)); resetPage() }}
                        options={[5, 10, 25, 50].map(n => ({ value: String(n), label: String(n) }))}
                      />
                      <span>por página · <span className="font-medium text-gray-700">{filteredRows.length}</span> registro{filteredRows.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                        .reduce((acc, n, idx, arr) => {
                          if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                          acc.push(n)
                          return acc
                        }, [])
                        .map((n, idx) =>
                          n === '…' ? (
                            <span key={`e-${idx}`} className="px-1.5 text-xs text-gray-400">…</span>
                          ) : (
                            <button key={n} onClick={() => setPage(n)}
                              className={clsx('min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium transition-colors',
                                n === safePage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>
                              {n}
                            </button>
                          )
                        )}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Nota auditoría */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
                <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                <p className="text-[11px] text-gray-500">Al exportar, esta acción queda registrada en el módulo de auditoría (RF-32).</p>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg flex flex-col items-center justify-center py-20 text-center" style={{ border: '1px solid var(--color-border)' }}>
              <FileSpreadsheet size={40} className="mb-3 text-gray-200" />
              <p className="text-sm font-semibold text-gray-500">No hay reportes disponibles para tu rol</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ANEXO 5 SBS (RF-28)
══════════════════════════════════════════════ */
function Anexo5SBSPage({ role }) {
  const [fecha,      setFecha]      = useState('2026-04-26')
  const [loading,    setLoading]    = useState(false)
  const [vistaPrevia,setVistaPrevia]= useState(null)
  const [feedback,   setFeedback]   = useState(null)

  function handlePrevisualizar() {
    setLoading(true)
    setTimeout(() => {
      setVistaPrevia({
        comprasUsd:  '450,000.00',
        ventasUsd:   '320,000.00',
        tcpCompra:   '3.7551',
        tcpVenta:    '3.7612',
        numOps:      '15',
        ventanilla:  '13:30h (día anterior) – 13:30h (actual)',
      })
      setLoading(false)
    }, 1000)
  }

  function handleDescargar() {
    setFeedback({ type: 'success', msg: `Anexo 5 (${fecha}) generado en formato SBS. Registro añadido a trazabilidad.` })
    setTimeout(() => setFeedback(null), 4000)
  }

  const stats = [
    { label: 'Período',         value: fecha || '—',                                      color: 'text-gray-900'  },
    { label: 'Compra USD',      value: vistaPrevia ? `$ ${vistaPrevia.comprasUsd}` : '—', color: 'text-blue-600'  },
    { label: 'Venta USD',       value: vistaPrevia ? `$ ${vistaPrevia.ventasUsd}`  : '—', color: 'text-orange-600'},
    { label: 'Ops. validadas',  value: vistaPrevia ? vistaPrevia.numOps : '—',            color: 'text-gray-900'  },
  ]

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Panel configuración — 2/3 */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
              <div>
                <p className="text-sm font-semibold text-gray-900">Anexo 5 SBS</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Cotización promedio ponderada USD · Ventana 13:30 – 13:30</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-500">RPT-SBS-A5</span>
            </div>

            <div className="px-5 py-5 space-y-5">
              <div className="flex items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Fecha del Reporte</label>
                  <div className="relative">
                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date" value={fecha}
                      onChange={e => setFecha(e.target.value)}
                      className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePrevisualizar}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40"
                >
                  {loading ? <Filter size={14} className="animate-spin" /> : <Filter size={14} />}
                  {loading ? 'Consolidando...' : 'Vista Previa'}
                </button>
              </div>

              {/* Vista previa resultados */}
              {vistaPrevia && (
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
                    <p className="text-xs font-semibold text-gray-700">Previsualización Consolidada</p>
                    <p className="text-[11px] text-gray-400">Ventana: {vistaPrevia.ventanilla}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-0">
                    {[
                      { label: 'Monto transado Compras USD',    value: `$ ${vistaPrevia.comprasUsd}`, color: 'text-blue-600'   },
                      { label: 'Monto transado Ventas USD',     value: `$ ${vistaPrevia.ventasUsd}`,  color: 'text-orange-600' },
                      { label: 'TC Promedio Ponderado Compra',  value: vistaPrevia.tcpCompra,          color: 'text-blue-600'   },
                      { label: 'TC Promedio Ponderado Venta',   value: vistaPrevia.tcpVenta,           color: 'text-orange-600' },
                    ].map((item, i) => (
                      <div key={i} className={clsx('px-5 py-4', i % 2 === 0 && 'border-r')} style={{ borderColor: 'var(--color-border)' }}>
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className={clsx('text-xl font-bold font-mono', item.color)}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
                    <p className="text-xs text-gray-500">Total de operaciones validadas: <strong className="text-gray-700">{vistaPrevia.numOps}</strong></p>
                    <button
                      onClick={handleDescargar}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Download size={13} /> Exportar Formato SBS
                    </button>
                  </div>
                </div>
              )}

              {!vistaPrevia && !loading && (
                <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed text-gray-400" style={{ borderColor: 'var(--color-border)' }}>
                  <Filter size={28} className="mb-2 text-gray-300" />
                  <p className="text-xs font-medium">Seleccione una fecha y genere la vista previa</p>
                </div>
              )}

              {feedback && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-xs font-semibold" style={{ border: '1px solid #bbf7d0' }}>
                  <CheckCircle2 size={13} /> {feedback.msg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral instrucciones — 1/3 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
              <p className="text-xs font-semibold text-gray-900">Instrucciones de Envío</p>
            </div>
            <div className="px-5 py-4">
              <ol className="space-y-3">
                {[
                  'Verifica que todas las operaciones del período estén en estado Liquidada.',
                  'Revisa los decimales y montos totales en la vista previa.',
                  'Descarga el archivo estructurado (TXT).',
                  'Sube el archivo al portal regulador de la SBS.',
                ].map((txt, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-gray-500 leading-relaxed">{txt}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="flex gap-3 px-4 py-3.5 rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Cada exportación es inmutable en el log de auditoría. Aplica a Anexos 5, 25, 26 y 28 de la SBS/BCRP.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
