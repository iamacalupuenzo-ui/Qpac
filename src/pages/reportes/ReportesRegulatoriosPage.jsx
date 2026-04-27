import { useState } from 'react'
import {
  FileText, Search, Download, Eye, AlertCircle,
  CheckCircle2, Clock, Calendar, ArrowLeft,
  Calculator, ShieldCheck, Info,
} from 'lucide-react'
import clsx from 'clsx'

function fmtMoney(n, m = '') {
  if (!n) return '—'
  return `${m}${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const REPORT_TYPES = {
  bcrp_adelantado: {
    label: 'BCRP Adelantado (Diario)',
    desc:  'Envío antes de las 5:00 PM. Corte dinámico.',
    code:  'RPT-BCRP-A',
  },
  bcrp_definitivo: {
    label: 'BCRP Definitivo (Diario)',
    desc:  'Envío antes de las 11:00 AM (D+1). Corte al cierre.',
    code:  'RPT-BCRP-D',
  },
  ro_sbs: {
    label: 'Registro de Operaciones (RO) SBS',
    desc:  'Reporte mensual de participantes y PEPs.',
    code:  'RPT-SBS-RO',
  },
}

export default function ReportesRegulatoriosPage({ activeTab, ops = [], tcSbsHistory = [], onExport }) {
  const [step,          setStep]          = useState('config')
  const [selectedDate,  setSelectedDate]  = useState(new Date().toISOString().split('T')[0])
  const [loading,       setLoading]       = useState(false)
  const [previewData,   setPreviewData]   = useState([])
  const [aggregates,    setAggregates]    = useState({})
  const [feedback,      setFeedback]      = useState(null)

  const reportMeta    = REPORT_TYPES[activeTab] || REPORT_TYPES.bcrp_adelantado
  const todayISO      = new Date().toISOString().split('T')[0]
  const currentTcSbs  = tcSbsHistory.find(h => h.fecha === selectedDate)
  const isDefinitivo  = activeTab === 'bcrp_definitivo'
  const hasPrereq     = !isDefinitivo || (currentTcSbs && currentTcSbs.tMinus1)

  function handleGeneratePreview() {
    if (!hasPrereq) return
    setLoading(true)
    setTimeout(() => {
      const filtered = ops.filter(o =>
        o.fecha === selectedDate && ['liquidada', 'cerrada'].includes(o.estado)
      )
      setPreviewData(filtered.map(o => ({ ...o, _adj: 0 })))
      const totalUSD = filtered.reduce((acc, o) => acc + o.montoUSD, 0)
      setAggregates({ totalUSD, count: filtered.length })
      setLoading(false)
      setStep('preview')
    }, 1000)
  }

  function handleAdjustDecimal(id, val) {
    setPreviewData(prev => prev.map(o => o.id === id ? { ...o, _adj: val } : o))
  }

  function handleFinalExport() {
    setLoading(true)
    setTimeout(() => {
      onExport?.({
        tipo:      activeTab,
        periodo:   selectedDate,
        usuario:   'Marco Quispe L.',
        timestamp: new Date().toISOString(),
        ajustes:   previewData.filter(o => o._adj !== 0).map(o => ({ id: o.id, adj: o._adj })),
      })
      setLoading(false)
      setFeedback({ type: 'success', msg: `Archivo ${reportMeta.code}_${selectedDate}.txt generado correctamente.` })
      setTimeout(() => {
        setFeedback(null)
        setStep('config')
      }, 3000)
    }, 1200)
  }

  /* Stats */
  const stats = [
    { label: 'Tipo de reporte',     value: reportMeta.code,                         color: 'text-gray-900'  },
    { label: 'Período seleccionado',value: fmtDate(selectedDate),                   color: 'text-blue-600'  },
    { label: 'Ops. consolidadas',   value: step === 'preview' ? aggregates.count ?? 0 : '—', color: 'text-gray-900' },
    { label: 'Monto total USD',     value: step === 'preview' && aggregates.totalUSD ? `$ ${fmtMoney(aggregates.totalUSD)}` : '—', color: 'text-blue-600' },
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

      {/* ── Config ── */}
      {step === 'config' && (
        <div className="grid grid-cols-3 gap-4">

          {/* Panel configuración — 2/3 */}
          <div className="col-span-2 bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
              <div>
                <p className="text-sm font-semibold text-gray-900">{reportMeta.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{reportMeta.desc}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-500">{reportMeta.code}</span>
            </div>

            <div className="px-5 py-5 space-y-5">

              {/* Selector de período */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" /> Selección del Período
                </label>
                <div className="relative w-48">
                  <input
                    type={activeTab === 'ro_sbs' ? 'month' : 'date'}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {activeTab === 'ro_sbs'
                    ? 'Se consolidarán todas las operaciones del mes seleccionado.'
                    : 'Se consolidarán las operaciones liquidadas hasta el corte dinámico.'}
                </p>
              </div>

              {/* Prerequisito faltante */}
              {!hasPrereq && (
                <div className="flex gap-3 p-3 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-800">Prerequisito Faltante: TC SBS T-1</p>
                    <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                      El reporte BCRP Definitivo requiere el tipo de cambio T-1 registrado en Tesorería.
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <ShieldCheck size={13} className="text-blue-400" />
                  Se genera una vista previa antes de la exportación final
                </div>
                <button
                  disabled={!hasPrereq || loading}
                  onClick={handleGeneratePreview}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40"
                >
                  {loading ? <Clock size={14} className="animate-spin" /> : <Eye size={14} />}
                  {loading ? 'Consolidando...' : 'Generar Vista Previa'}
                </button>
              </div>
            </div>
          </div>

          {/* Panel lateral — 1/3 */}
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
                    'Descarga el archivo estructurado (TXT/CSV).',
                    'Sube el archivo al portal regulador correspondiente.',
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
              <Calculator size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Ajuste de decimales:</strong> En la vista previa podrás corregir diferencias de redondeo. Los ajustes son trazados pero no modifican la operación original.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview ── */}
      {step === 'preview' && (
        <div className="space-y-4">

          {/* Header preview */}
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('config')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <ArrowLeft size={15} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Vista Previa: {reportMeta.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(selectedDate)} · {previewData.length} operaciones consolidadas</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] text-gray-400">Monto Total USD</p>
                  <p className="text-lg font-bold font-mono text-blue-600">{fmtMoney(aggregates.totalUSD, '$ ')}</p>
                </div>
                {feedback?.type === 'success' ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold" style={{ border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={13} /> {feedback.msg}
                  </div>
                ) : (
                  <button
                    onClick={handleFinalExport}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40"
                  >
                    {loading ? <Clock size={14} className="animate-spin" /> : <Download size={14} />}
                    {loading ? 'Generando...' : 'Exportar Archivo Final'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabla preview */}
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">ID Operación</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Tipo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Monto USD</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">TC Pactado</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">TC SBS {isDefinitivo ? '(T-1)' : '(Ref)'}</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Ajuste Decimal</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map(o => (
                    <tr key={o.id} className="border-b hover:bg-gray-50/60 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-3 text-xs font-mono font-bold text-gray-800">{o.id}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={clsx('font-bold', o.tipo === 'compra' ? 'text-blue-600' : 'text-orange-600')}>
                          {o.tipo?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-700">{fmtMoney(o.montoUSD, '$ ')}</td>
                      <td className="px-4 py-3 text-xs font-mono font-bold text-gray-800">{o.tc?.toFixed(3)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">
                        {isDefinitivo ? currentTcSbs?.tMinus1?.toFixed(3) : currentTcSbs?.t?.toFixed(3) || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number" step="0.01"
                            value={o._adj}
                            onChange={e => handleAdjustDecimal(o.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-[11px] font-bold text-center outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                          />
                          {o._adj !== 0 && <CheckCircle2 size={12} className="text-green-500" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-gray-300">
                <Search size={40} className="mb-3" />
                <p className="text-sm font-medium text-gray-400">No se encontraron operaciones liquidadas para esta fecha</p>
              </div>
            )}
          </div>

          {/* Nota */}
          <div className="flex gap-3 px-4 py-3.5 rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Los ajustes de decimales son opcionales y quedan registrados en la trazabilidad. No modifican el monto original de la operación.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
