import { useState } from 'react'
import {
  X, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Info, Lock, Clock, RotateCcw,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney } from '../../utils/format.js'

/* ══════════════════════════════════════════════
   Roles que pueden AUTORIZAR reaperturas
══════════════════════════════════════════════ */
const ROLES_AUTORIZADOR = new Set(['head', 'jefe', 'admin'])

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   FORMULARIO — Solo Back Office (solicitar)
══════════════════════════════════════════════ */
function FormSolicitar({ motivo, setMotivo, error }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">
          Esta solicitud quedará pendiente de autorización del <strong>Jefe de Operaciones Centrales</strong> o <strong>Head de Mesa</strong>. Solo si es aprobada, la operación revertirá a <em>En revisión</em>.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Motivo de la solicitud <span className="text-red-400">*</span>
          <span className="ml-1 text-gray-400 font-normal">(mín. 20 caracteres)</span>
        </label>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          rows={4}
          placeholder="Describe el problema detectado que justifica la reapertura: TC incorrecto, cuenta destino equivocada, monto con diferencia, etc."
          className={clsx(
            'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all resize-none',
            error
              ? 'border-red-400 ring-2 ring-red-50'
              : 'border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-50'
          )}
        />
        <div className="flex items-center justify-between mt-1">
          {error ? <p className="text-[11px] text-red-500">{error}</p> : <span />}
          <span className={clsx('text-[11px]', motivo.length >= 20 ? 'text-green-600' : 'text-gray-400')}>
            {motivo.length} / 20 caracteres
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-violet-50 border border-violet-200 rounded-lg">
        <Info size={13} className="text-violet-500 mt-0.5 shrink-0" />
        <p className="text-xs text-violet-700">
          El motivo quedará registrado en el historial de la operación de forma permanente. El autorizador tomará su decisión en base a esta descripción.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   FORMULARIO — Jefe / Head (autorizar o rechazar)
══════════════════════════════════════════════ */
function FormAutorizar({ op, decision, setDecision, motivoRechazo, setMotivoRechazo, error }) {
  return (
    <div className="space-y-5">
      {/* Solicitud del analista */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Solicitud registrada</p>
        <div className="p-4 rounded-xl border border-violet-200 bg-violet-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-800">Analista Back Office</span>
            <span className="text-[11px] text-violet-600">
              {op.solReapertura?.fecha} {op.solReapertura?.hora}
            </span>
          </div>
          <p className="text-sm text-violet-900 leading-relaxed">{op.solReapertura?.motivo}</p>
        </div>
      </div>

      {/* Decisión */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Tu decisión</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDecision('aprobar')}
            className={clsx('p-4 rounded-xl border-2 text-left transition-all',
              decision === 'aprobar' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30')}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className={decision === 'aprobar' ? 'text-green-600' : 'text-gray-400'} />
              <span className={clsx('text-sm font-bold', decision === 'aprobar' ? 'text-green-700' : 'text-gray-600')}>Aprobar</span>
            </div>
            <p className="text-[11px] text-gray-500">La operación revierte a En revisión — Back Office.</p>
          </button>

          <button
            onClick={() => setDecision('rechazar')}
            className={clsx('p-4 rounded-xl border-2 text-left transition-all',
              decision === 'rechazar' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-red-50/30')}>
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className={decision === 'rechazar' ? 'text-red-500' : 'text-gray-400'} />
              <span className={clsx('text-sm font-bold', decision === 'rechazar' ? 'text-red-600' : 'text-gray-600')}>Rechazar</span>
            </div>
            <p className="text-[11px] text-gray-500">La operación permanece en Liquidada.</p>
          </button>
        </div>
      </div>

      {/* Motivo de rechazo */}
      {decision === 'rechazar' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Motivo del rechazo <span className="text-red-400">*</span>
          </label>
          <textarea
            value={motivoRechazo}
            onChange={e => setMotivoRechazo(e.target.value)}
            rows={3}
            placeholder="Indica por qué no procede la reapertura…"
            className={clsx(
              'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all resize-none',
              error ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-50'
            )}
          />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN DRAWER
   modo = 'solicitar' | 'autorizar'
══════════════════════════════════════════════ */
export default function ReaperturaDrawer({ op, modo, role, onSolicitar, onAprobar, onRechazar, onClose }) {
  const [motivo,        setMotivo]        = useState('')
  const [decision,      setDecision]      = useState('')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)

  if (!op) return null

  const esAutorizador = ROLES_AUTORIZADOR.has(role)
  const modoReal = modo === 'autorizar' && esAutorizador ? 'autorizar' : 'solicitar'

  function handleConfirmar() {
    if (modoReal === 'solicitar') {
      if (motivo.trim().length < 20) { setError('El motivo debe tener al menos 20 caracteres.'); return }
      setLoading(true)
      setTimeout(() => { onSolicitar(op.id, motivo.trim()); setLoading(false) }, 700)
      return
    }

    // autorizar
    if (!decision) { setError('Selecciona una decisión.'); return }
    if (decision === 'rechazar' && !motivoRechazo.trim()) { setError('El motivo del rechazo es obligatorio.'); return }
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (decision === 'aprobar') onAprobar(op.id)
      else                        onRechazar(op.id, motivoRechazo.trim())
      setLoading(false)
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
              <RotateCcw size={16} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {modoReal === 'solicitar' ? 'Solicitar reapertura' : 'Autorizar reapertura'}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{op.id} · {op.clienteNombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Resumen de la operación */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Operación liquidada</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: 'Tipo', v: op.tipo?.toUpperCase() },
              { l: 'Monto USD', v: '$ ' + fmtMoney(op.montoUSD) },
              { l: 'TC pactado', v: op.tc?.toFixed(3) },
              { l: 'Ref. transferencia', v: op.refTransferencia ?? '—' },
              { l: 'Trader', v: op.trader },
              { l: 'Fecha liquidación', v: op.fechaLiquidacion ?? op.fecha },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-[10px] text-gray-400 mb-0.5">{l}</p>
                <p className="text-[11px] font-medium text-gray-800 truncate">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 p-6">
          {modoReal === 'solicitar' ? (
            <FormSolicitar motivo={motivo} setMotivo={setMotivo} error={error} />
          ) : (
            <FormAutorizar
              op={op}
              decision={decision}       setDecision={setDecision}
              motivoRechazo={motivoRechazo} setMotivoRechazo={setMotivoRechazo}
              error={error}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
            <ArrowLeft size={14} /> Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={loading || (modoReal === 'solicitar' && motivo.trim().length < 20)}
            className={clsx(
              'flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50',
              modoReal === 'solicitar'
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : decision === 'rechazar'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
            )}
          >
            {loading ? <><Clock size={14} className="animate-spin" /> Procesando…</> :
             modoReal === 'solicitar' ? <><RotateCcw size={14} /> Enviar solicitud</> :
             decision === 'rechazar'  ? <><XCircle size={14} /> Rechazar reapertura</> :
                                        <><CheckCircle2 size={14} /> Aprobar reapertura</>}
          </button>
        </div>
      </div>
    </div>
  )
}


