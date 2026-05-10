import { useState } from 'react'
import {
  Info, AlertTriangle, CheckCircle2, History,
  ArrowRight, Save, ShieldCheck, Clock, User,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtDate } from '../../utils/format.js'


export default function TcSbsPage({ history = [], onUpdate, role, notify }) {
  const latest      = history[0] || {}
  const todayISO    = new Date().toISOString().split('T')[0]
  const isTodayReg  = latest.fecha === todayISO

  const [t,           setT]           = useState(isTodayReg ? latest.t        : '')
  const [tm1,         setTm1]         = useState(isTodayReg ? latest.tMinus1  : (latest.t || ''))
  const [loading,     setLoading]     = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [success,     setSuccess]     = useState(false)

  const MIN_TC = 3.600
  const MAX_TC = 3.900
  const isAtypical = val => val && (val < MIN_TC || val > MAX_TC)
  const canEdit    = role === 'tesoreria' || role === 'head' || role === 'admin'

  function handleSave(force = false) {
    const valT   = parseFloat(t)
    const valTm1 = parseFloat(tm1)
    if (isNaN(valT) || valT <= 0 || isNaN(valTm1) || valTm1 <= 0) return
    if (!force && (isAtypical(valT) || isAtypical(valTm1))) { setShowWarning(true); return }
    setLoading(true)
    setShowWarning(false)
    setTimeout(() => {
      onUpdate({ fecha: todayISO, t: valT, tMinus1: valTm1, usuario: 'Marco Quispe L.', timestamp: new Date().toISOString() })
      setLoading(false)
      setSuccess(true)
      notify?.(`TC SBS para el ${fmtDate(todayISO)} registrado exitosamente.`)
      setTimeout(() => setSuccess(false), 3000)
    }, 800)
  }

  /* ── Stats ── */
  const stats = [
    {
      label: 'Estado del día',
      value: isTodayReg ? 'Registrado' : 'Pendiente',
      color: isTodayReg ? 'text-green-600' : 'text-amber-600',
    },
    {
      label: 'TC SBS — T (hoy)',
      value: isTodayReg ? latest.t?.toFixed(3) : '—',
      color: 'text-blue-600',
    },
    {
      label: 'TC SBS — T-1 (ayer)',
      value: isTodayReg ? latest.tMinus1?.toFixed(3) : '—',
      color: 'text-gray-900',
    },
    {
      label: 'Rango válido',
      value: `${MIN_TC} – ${MAX_TC}`,
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

      {/* Main layout */}
      <div className="grid grid-cols-3 gap-4">

        {/* Formulario — 2/3 */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
              <div>
                <p className="text-sm font-semibold text-gray-900">Ingreso de TC SBS — {fmtDate(todayISO)}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Valores oficiales publicados por la Superintendencia de Banca y Seguros</p>
              </div>
              <span className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                isTodayReg ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700 animate-pulse'
              )}>
                <span className={clsx('w-1.5 h-1.5 rounded-full', isTodayReg ? 'bg-green-500' : 'bg-amber-400')} />
                {isTodayReg ? 'Registrado' : 'Pendiente'}
              </span>
            </div>

            <div className="px-5 py-5 space-y-5">

              {isTodayReg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 mb-2">
                  <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">TC SBS registrado para hoy. No se permiten modificaciones.</p>
                </div>
              )}

              {/* Campos T y T-1 */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    TC SBS del día (T) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number" step="0.001"
                      disabled={!canEdit || loading || isTodayReg}
                      value={t}
                      onChange={e => setT(e.target.value)}
                      placeholder="3.742"
                      className={clsx(
                        'w-full pl-4 pr-14 py-3 rounded-lg border text-xl font-mono font-bold outline-none transition-all bg-white',
                        isTodayReg   ? 'border-gray-200 text-gray-700 bg-gray-50' :
                        isAtypical(parseFloat(t)) ? 'border-amber-400 text-amber-700 focus:ring-2 focus:ring-amber-100' :
                        'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">USD</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Valor publicado por la SBS para hoy.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    TC SBS día anterior (T-1) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number" step="0.001"
                      disabled={!canEdit || loading || isTodayReg}
                      value={tm1}
                      onChange={e => setTm1(e.target.value)}
                      placeholder="3.738"
                      className={clsx(
                        'w-full pl-4 pr-14 py-3 rounded-lg border text-xl font-mono font-bold outline-none transition-all bg-white',
                        isTodayReg   ? 'border-gray-200 text-gray-700 bg-gray-50' :
                        isAtypical(parseFloat(tm1)) ? 'border-amber-400 text-amber-700 focus:ring-2 focus:ring-amber-100' :
                        'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">USD</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Requerido para reportes regulatorios BCRP y SBS.</p>
                </div>
              </div>

              {/* Warning valor atípico */}
              {showWarning && (
                <div className="flex gap-3 p-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
                  <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      <strong>Valor atípico detectado:</strong> Uno de los valores está fuera del rango habitual ({MIN_TC} – {MAX_TC}). Verifica que el dato sea correcto antes de continuar.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors">
                        Sí, el valor es correcto
                      </button>
                      <button onClick={() => setShowWarning(false)}
                        className="px-3 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors">
                        Corregir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              {canEdit && (
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <ShieldCheck size={13} className="text-blue-400" />
                    Registro con trazabilidad completa
                  </div>
                  <button
                    disabled={loading || !t || !tm1 || isTodayReg}
                    onClick={() => handleSave()}
                    className={clsx(
                      'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40',
                      loading  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                      success  ? 'bg-green-600 text-white' :
                      'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {loading ? <Clock size={14} className="animate-spin" /> :
                     success  ? <CheckCircle2 size={14} /> : <Save size={14} />}
                    {'Confirmar e ingresar'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nota de negocio */}
          <div className="flex gap-3 px-4 py-3.5 rounded-lg bg-blue-50" style={{ border: '1px solid #bfdbfe' }}>
            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 leading-relaxed space-y-1">
              <p><strong>Regla de negocio:</strong> El TC SBS es un prerequisito bloqueante para el cierre diario. Ninguna consolidación puede ejecutarse sin este valor.</p>
              <p>Al inicio de un nuevo día hábil, el sistema precompleta T-1 con el valor de T del día anterior automáticamente.</p>
            </div>
          </div>
        </div>

        {/* Historial reciente — 1/3 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <History size={14} className="text-gray-400" /> Historial de registros
              </h4>
            </div>
            <div className="px-5 py-4 space-y-4">
              {history.slice(0, 6).map((h, i) => (
                <div key={i} className="relative pl-4 border-l-2 pb-1" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-300" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-gray-700">{fmtDate(h.fecha)}</span>
                    <span className="text-[10px] text-gray-400">{h.timestamp?.split('T')[1].substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="text-center">
                      <p className="text-[9px] text-gray-400 uppercase font-semibold">T</p>
                      <p className="text-sm font-mono font-bold text-blue-600">{h.t.toFixed(3)}</p>
                    </div>
                    <ArrowRight size={10} className="text-gray-300" />
                    <div className="text-center">
                      <p className="text-[9px] text-gray-400 uppercase font-semibold">T-1</p>
                      <p className="text-sm font-mono font-bold text-gray-600">{h.tMinus1.toFixed(3)}</p>
                    </div>
                  </div>
                  <p className="flex items-center gap-1 text-[10px] text-gray-400">
                    <User size={9} /> {h.usuario}
                  </p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">No hay registros previos</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 px-4 py-3.5 rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-500 leading-relaxed">
              Cada ingreso es inmutable en el log de auditoría. Utilizado en los Anexos 5, 25, 26 y 28 de la SBS/BCRP.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

