import { useState } from 'react'
import {
  Calendar, CheckCircle2, AlertCircle,
  FileSpreadsheet, ShieldCheck, Clock,
  Save, Info,
} from 'lucide-react'
import clsx from 'clsx'

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function ConciliacionPage({ role }) {
  const [fecha,      setFecha]      = useState('2026-04-23')
  const [estadoDia,  setEstadoDia]  = useState('pendiente') // 'pendiente' | 'cerrada' | 'diferencia'
  const [quadA,      setQuadA]      = useState({ valor: '', desc: '' })
  const [quadB,      setQuadB]      = useState({ valor: '', desc: '' })
  const [feedback,   setFeedback]   = useState(null) // { type: 'success'|'error'|'warning', msg: string }
  const [loading,    setLoading]    = useState(false)

  const isDiferenciaA = quadA.valor !== '' && parseFloat(quadA.valor) !== 0
  const isDiferenciaB = quadB.valor !== '' && parseFloat(quadB.valor) !== 0
  const bothFilled    = quadA.valor !== '' && quadB.valor !== ''
  const isPerfect     = bothFilled && !isDiferenciaA && !isDiferenciaB

  const canSave = bothFilled &&
    (!isDiferenciaA || quadA.desc.length >= 20) &&
    (!isDiferenciaB || quadB.desc.length >= 20)

  function handleGuardar() {
    if (!canSave) {
      setFeedback({ type: 'error', msg: 'Debe proporcionar una descripción de al menos 20 caracteres para cada diferencia detectada.' })
      return
    }
    setLoading(true)
    setTimeout(() => {
      if (isPerfect) {
        setEstadoDia('cerrada')
        setFeedback({ type: 'success', msg: 'Conciliación completada exitosamente. El día ha sido cerrado.' })
      } else {
        setEstadoDia('diferencia')
        setFeedback({ type: 'warning', msg: 'AL-RI-04: Las diferencias han sido reportadas. Cuenta con 1 día hábil para resolución antes de escalamiento.' })
      }
      setLoading(false)
    }, 800)
  }

  /* ── Stats ── */
  const stats = [
    {
      label: 'Estado del día',
      value: estadoDia === 'cerrada' ? 'Cerrada' : estadoDia === 'diferencia' ? 'Con diferencia' : 'Pendiente',
      color: estadoDia === 'cerrada' ? 'text-green-600' : estadoDia === 'diferencia' ? 'text-red-600' : 'text-amber-600',
    },
    {
      label: 'Cuadratura A',
      value: quadA.valor !== '' ? (isDiferenciaA ? `Δ ${parseFloat(quadA.valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'OK') : '—',
      color: isDiferenciaA ? 'text-amber-600' : quadA.valor !== '' ? 'text-green-600' : 'text-gray-400',
    },
    {
      label: 'Cuadratura B',
      value: quadB.valor !== '' ? (isDiferenciaB ? `Δ ${parseFloat(quadB.valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'OK') : '—',
      color: isDiferenciaB ? 'text-amber-600' : quadB.valor !== '' ? 'text-green-600' : 'text-gray-400',
    },
    {
      label: 'Fecha conciliada',
      value: fmtDate(fecha),
      color: 'text-gray-900',
    },
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

      {/* Header card */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
          <div>
            <p className="text-sm font-semibold text-gray-900">Conciliación Bancaria</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Cuadre de movimientos del sistema vs Bank+</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600">Día a conciliar</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              />
            </div>
            <span className={clsx(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
              estadoDia === 'cerrada'    ? 'bg-green-50 text-green-700' :
              estadoDia === 'diferencia' ? 'bg-red-50 text-red-700' :
                                          'bg-amber-50 text-amber-700 animate-pulse'
            )}>
              <span className={clsx('w-1.5 h-1.5 rounded-full',
                estadoDia === 'cerrada'    ? 'bg-green-500' :
                estadoDia === 'diferencia' ? 'bg-red-400' :
                                            'bg-amber-400'
              )} />
              {estadoDia === 'cerrada' ? 'Cerrada' : estadoDia === 'diferencia' ? 'Con diferencia' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>

      {/* Cuadraturas */}
      <div className="grid grid-cols-2 gap-4">

        {/* Cuadratura A */}
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">A</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Mayores Bancos vs EECC</p>
              <p className="text-[11px] text-gray-400">Estados de Cuenta vs Bank+</p>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Diferencia Total <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number" step="0.01"
                  value={quadA.valor}
                  onChange={e => setQuadA({ ...quadA, valor: e.target.value })}
                  placeholder="0.00"
                  className={clsx(
                    'w-full pl-4 pr-14 py-3 rounded-lg border text-xl font-mono font-bold outline-none transition-all bg-white',
                    isDiferenciaA
                      ? 'border-amber-400 bg-amber-50 text-amber-700 focus:ring-2 focus:ring-amber-100'
                      : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">PEN</span>
              </div>
              {!isDiferenciaA && quadA.valor !== '' && (
                <p className="flex items-center gap-1 text-[11px] text-green-600 mt-1"><CheckCircle2 size={11} /> Sin diferencia</p>
              )}
            </div>

            {isDiferenciaA && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Descripción de la diferencia <span className="text-red-400">*</span>
                    </label>
                    <span className={clsx('text-[11px] font-medium', quadA.desc.length >= 20 ? 'text-green-600' : 'text-gray-400')}>
                      {quadA.desc.length}/20
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={quadA.desc}
                    onChange={e => setQuadA({ ...quadA, desc: e.target.value })}
                    placeholder="Describe el origen de esta diferencia contable..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none bg-white"
                  />
                </div>
                {/* Upload de imagen para evidencia */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Imagen de evidencia <span className="text-gray-400 font-normal">(opcional — PNG, JPG)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={() => {}}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Adjunta captura del estado de cuenta o comprobante que explique la diferencia.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cuadratura B */}
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center shrink-0">B</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Reporte Diario vs Cuentas de Orden</p>
              <p className="text-[11px] text-gray-400">Sistema QAPAQ vs Bank+</p>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Diferencia Total <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number" step="0.01"
                  value={quadB.valor}
                  onChange={e => setQuadB({ ...quadB, valor: e.target.value })}
                  placeholder="0.00"
                  className={clsx(
                    'w-full pl-4 pr-14 py-3 rounded-lg border text-xl font-mono font-bold outline-none transition-all bg-white',
                    isDiferenciaB
                      ? 'border-amber-400 bg-amber-50 text-amber-700 focus:ring-2 focus:ring-amber-100'
                      : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">PEN</span>
              </div>
              {!isDiferenciaB && quadB.valor !== '' && (
                <p className="flex items-center gap-1 text-[11px] text-green-600 mt-1"><CheckCircle2 size={11} /> Sin diferencia</p>
              )}
            </div>

            {isDiferenciaB && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Descripción de la diferencia <span className="text-red-400">*</span>
                    </label>
                    <span className={clsx('text-[11px] font-medium', quadB.desc.length >= 20 ? 'text-green-600' : 'text-gray-400')}>
                      {quadB.desc.length}/20
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={quadB.desc}
                    onChange={e => setQuadB({ ...quadB, desc: e.target.value })}
                    placeholder="Describe el origen de esta diferencia contable..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none bg-white"
                  />
                </div>
                {/* Upload de imagen para evidencia */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Imagen de evidencia <span className="text-gray-400 font-normal">(opcional — PNG, JPG)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={() => {}}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Adjunta captura del estado de cuenta o comprobante que explique la diferencia.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="px-5 py-4 flex items-center justify-between">

          {/* Feedback inline */}
          <div className="flex items-center gap-2 text-sm">
            {feedback?.type === 'success' ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 size={15} className="text-green-500" />
                <span className="text-xs font-semibold">{feedback.msg}</span>
              </div>
            ) : feedback?.type === 'warning' ? (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle size={15} className="text-amber-500" />
                <span className="text-xs font-semibold">{feedback.msg}</span>
              </div>
            ) : feedback?.type === 'error' ? (
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={15} className="text-red-500" />
                <span className="text-xs font-semibold">{feedback.msg}</span>
              </div>
            ) : isPerfect ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 size={15} className="text-green-500" />
                <span className="text-xs font-semibold">Cuadratura perfecta. Lista para cierre.</span>
              </div>
            ) : !bothFilled ? (
              <div className="flex items-center gap-2 text-gray-400">
                <FileSpreadsheet size={15} />
                <span className="text-xs font-medium">Ingrese los valores de cuadratura Bank+</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle size={15} className="text-amber-500" />
                <span className="text-xs font-semibold">AL-RI-04: Discrepancias detectadas. Será escalado a Tesorería y Contaduría.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck size={13} className="text-blue-400" />
              Registro con trazabilidad completa
            </div>
            <button
              onClick={handleGuardar}
              disabled={!canSave || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              {loading ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
              {estadoDia === 'cerrada' ? 'Actualizar Cierre' : 'Registrar Conciliación'}
            </button>
          </div>
        </div>
      </div>

      {/* Nota */}
      <div className="flex gap-3 px-4 py-3.5 rounded-lg bg-blue-50" style={{ border: '1px solid #bfdbfe' }}>
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed space-y-1">
          <p><strong>Regla de negocio:</strong> Ante cualquier diferencia (AL-RI-04), el sistema notifica automáticamente a Tesorería y Contaduría. La diferencia debe resolverse dentro de 1 día hábil antes de ser escalada.</p>
          <p>El cierre de conciliación es un prerequisito para la apertura del siguiente día operativo.</p>
        </div>
      </div>
    </div>
  )
}
