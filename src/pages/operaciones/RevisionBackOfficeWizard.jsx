import { useState } from 'react'
import {
  ArrowLeft, Check, ChevronRight,
  Eye, FileText, CheckCircle2, XCircle,
  AlertTriangle, Info, Clock, ShieldCheck,
  MessageSquare, Banknote, RefreshCw,
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function fmtMoney(n, m = '') {
  if (!n) return '—'
  return `${m} ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/* ══════════════════════════════════════════════
   STEPS — 4 pasos cuando se aprueba (RF-15)
          3 pasos cuando se observa
══════════════════════════════════════════════ */
const ALL_STEPS = [
  { id: 1, label: 'Revisión'      },
  { id: 2, label: 'Decisión'      },
  { id: 3, label: 'Confirmación'  },
  { id: 4, label: 'Liquidación'   },
]

function StepIndicator({ currentStep, approved, totalSteps }) {
  const steps = ALL_STEPS.slice(0, totalSteps)
  const color  = approved ? 'green' : 'orange'
  return (
    <div className="flex items-start justify-center">
      {steps.map((step, i) => {
        const done   = step.id < currentStep
        const active = step.id === currentStep
        const ringCls = color === 'green' ? 'ring-green-100' : 'ring-orange-100'
        const bgCls   = color === 'green'
          ? done || active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
          : done || active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all', bgCls,
                active && `ring-4 ${ringCls}`)}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={clsx('mt-1.5 text-[11px] font-medium whitespace-nowrap',
                active ? (color === 'green' ? 'text-green-600' : 'text-orange-600')
                : done  ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx('h-px mt-3.5 mx-3 transition-all', done
                ? (color === 'green' ? 'bg-green-400' : 'bg-orange-400')
                : 'bg-gray-200')} style={{ width: 56 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════
   ATOMS
══════════════════════════════════════════════ */
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</p>
}

function InfoCard({ children, bg = 'blue' }) {
  const cls = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    red:    'bg-red-50 border-red-200 text-red-700',
  }
  const Icon = { blue: Info, amber: AlertTriangle, green: CheckCircle2, red: AlertTriangle }[bg]
  return (
    <div className={clsx('flex items-start gap-2.5 p-3 rounded-lg border', cls[bg])}>
      <Icon size={13} className="mt-0.5 shrink-0" />
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 1 — REVISIÓN
══════════════════════════════════════════════ */
function Step1({ op }) {
  const historialObs = (op.historial ?? []).filter(h => h.tipo === 'observacion' || h.tipo === 'subsanacion')

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Revisión de operación</h3>
        <p className="text-xs text-gray-500">
          Revisa los datos de la operación, las cuentas QAPAQ y los comprobantes adjuntos antes de tomar tu decisión.
        </p>
      </div>

      <div>
        <SectionTitle>Datos de la operación</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: 'ID',         v: op.id,              mono: true  },
            { l: 'Cliente',    v: op.clienteNombre               },
            { l: 'Fecha',      v: fmtDate(op.fecha)              },
            { l: 'Tipo',       v: op.tipo?.toUpperCase()         },
            { l: 'Monto USD',  v: fmtMoney(op.montoUSD, '$')     },
            { l: 'TC pactado', v: op.tc?.toFixed(3), mono: true  },
          ].map(({ l, v, mono }) => (
            <div key={l} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 mb-0.5">{l}</p>
              <p className={clsx('text-xs font-bold text-gray-800', mono && 'font-mono')}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Cuentas QAPAQ registradas</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 mb-0.5">Cuenta de ingreso</p>
            <p className="text-xs font-medium text-gray-700">{op.cuentaQpaqIn ?? '—'}</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 mb-0.5">Cuenta de egreso</p>
            <p className="text-xs font-medium text-gray-700">{op.cuentaQpaqOut ?? '—'}</p>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Comprobantes adjuntos ({(op.comprobantes ?? []).length})</SectionTitle>
        {(op.comprobantes ?? []).length === 0 ? (
          <p className="text-xs text-gray-400 italic">Sin comprobantes adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {(op.comprobantes ?? []).map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-500 shrink-0" />
                  <p className="text-xs font-medium text-gray-700">{f.name ?? `Comprobante ${i + 1}`}</p>
                </div>
                <button 
                  onClick={() => onPreviewDoc?.(f.name ?? `Comprobante ${i + 1}`)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye size={12} /> Vista previa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {historialObs.length > 0 && (
        <div>
          <SectionTitle>Historial de observaciones y subsanaciones</SectionTitle>
          <div className="space-y-2">
            {historialObs.map((h, i) => (
              <div key={i} className={clsx('p-3 rounded-lg border text-xs',
                h.tipo === 'observacion' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50')}>
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('font-bold uppercase text-[10px] tracking-wider',
                    h.tipo === 'observacion' ? 'text-amber-700' : 'text-green-700')}>
                    {h.tipo === 'observacion' ? '⚠ Observación' : '✓ Subsanación'}
                  </span>
                  <span className="text-gray-400">{h.fecha} {h.hora}</span>
                </div>
                <p className="text-gray-700">{h.detalle ?? h.causa}</p>
                <p className="text-gray-500 mt-0.5">Por: {h.por}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 2 — DECISIÓN
══════════════════════════════════════════════ */
function Step2({ decision, setDecision, observacion, setObservacion, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Decisión del analista</h3>
        <p className="text-xs text-gray-500">
          Si apruebas, Bank+ recibirá el registro y deberás ingresar la referencia de transferencia bancaria para completar la liquidación. Si observas, la operación regresa al Trader.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setDecision('aprobar')}
          className={clsx('p-5 rounded-2xl border-2 text-left transition-all',
            decision === 'aprobar' ? 'border-green-500 bg-green-50 shadow-md shadow-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30')}>
          <div className="flex items-center gap-3 mb-2">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center',
              decision === 'aprobar' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')}>
              <CheckCircle2 size={18} />
            </div>
            <span className={clsx('text-sm font-bold', decision === 'aprobar' ? 'text-green-700' : 'text-gray-600')}>Aprobar</span>
          </div>
          <p className="text-xs text-gray-500">El abono es correcto. Registrar en Bank+ e ingresar referencia de transferencia.</p>
        </button>

        <button
          onClick={() => setDecision('observar')}
          className={clsx('p-5 rounded-2xl border-2 text-left transition-all',
            decision === 'observar' ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30')}>
          <div className="flex items-center gap-3 mb-2">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center',
              decision === 'observar' ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400')}>
              <MessageSquare size={18} />
            </div>
            <span className={clsx('text-sm font-bold', decision === 'observar' ? 'text-orange-700' : 'text-gray-600')}>Observar</span>
          </div>
          <p className="text-xs text-gray-500">Se detectó un problema. Devolver al Trader con observación escrita.</p>
        </button>
      </div>

      {errors?.decision && <p className="text-[11px] text-red-500">{errors.decision}</p>}

      {decision === 'observar' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Texto de observación <span className="text-red-400">*</span>
            <span className="ml-1 text-gray-400 font-normal">(mín. 10 caracteres)</span>
          </label>
          <textarea
            value={observacion}
            onChange={e => setObservacion(e.target.value)}
            rows={4}
            placeholder="Describe con precisión el problema detectado: comprobante ilegible, monto incorrecto, cuenta errónea, etc."
            className={clsx(
              'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all resize-none',
              errors?.observacion ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-50'
            )}
          />
          <div className="flex items-center justify-between">
            {errors?.observacion ? <p className="text-[11px] text-red-500">{errors.observacion}</p> : <span />}
            <span className={clsx('text-[11px]', observacion.length >= 10 ? 'text-green-600' : 'text-gray-400')}>
              {observacion.length} caracteres
            </span>
          </div>
          <InfoCard bg="amber">La observación quedará registrada de forma permanente y será visible para el Trader.</InfoCard>
        </div>
      )}

      {decision === 'aprobar' && (
        <InfoCard bg="green">
          Al confirmar, el sistema enviará los datos a Bank+. Si el registro es exitoso, deberás ingresar la referencia de transferencia bancaria para completar la liquidación.
        </InfoCard>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 3 — CONFIRMACIÓN
══════════════════════════════════════════════ */
function Step3({ op, decision, observacion }) {
  const isAprob = decision === 'aprobar'
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Confirmar decisión</h3>
        <p className="text-xs text-gray-500">Revisa el resumen antes de confirmar. Esta acción no puede revertirse.</p>
      </div>

      <div className={clsx('p-5 rounded-2xl border-2 space-y-3',
        isAprob ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50')}>
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            isAprob ? 'bg-green-500 text-white' : 'bg-orange-400 text-white')}>
            {isAprob ? <CheckCircle2 size={20} /> : <MessageSquare size={20} />}
          </div>
          <div>
            <p className={clsx('text-sm font-bold', isAprob ? 'text-green-800' : 'text-orange-800')}>
              {isAprob ? 'Aprobar y registrar en Bank+' : 'Devolver con observación'}
            </p>
            <p className={clsx('text-xs', isAprob ? 'text-green-600' : 'text-orange-600')}>
              {isAprob
                ? `La operación ${op.id} iniciará el proceso de liquidación`
                : `La operación ${op.id} regresará al Trader en estado Observada`}
            </p>
          </div>
        </div>
        {!isAprob && observacion && (
          <div className="pt-3 border-t border-orange-200">
            <p className="text-[11px] text-orange-600 font-semibold uppercase tracking-wider mb-1">Observación:</p>
            <p className="text-xs text-orange-800 leading-relaxed">{observacion}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { l: 'Operación', v: op.id, mono: true },
          { l: 'Cliente',   v: op.clienteNombre  },
          { l: 'Monto',     v: fmtMoney(op.montoUSD, '$') + ' USD' },
          { l: isAprob ? 'Siguiente paso' : 'Estado resultante',
            v: isAprob ? 'Ingresar referencia bancaria' : 'Observada',
            highlight: isAprob },
        ].map(({ l, v, mono, highlight }) => (
          <div key={l} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 mb-0.5">{l}</p>
            <p className={clsx('text-xs font-bold', mono ? 'font-mono text-gray-800' : highlight ? 'text-blue-600' : isAprob ? 'text-green-600' : 'text-orange-600')}>{v}</p>
          </div>
        ))}
      </div>

      <InfoCard bg={isAprob ? 'green' : 'amber'}>
        {isAprob
          ? 'Se intentará el registro en Bank+. Si falla, la operación permanece en tu bandeja y podrás reintentar sin devolver la operación al Trader.'
          : 'La observación quedará registrada en el historial de la operación.'}
      </InfoCard>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 4 — LIQUIDACIÓN (RF-15)
   Aparece solo cuando Bank+ acepta la aprobación
══════════════════════════════════════════════ */
function Step4({ op, refTransferencia, setRefTransferencia, fechaLiquidacion, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Ejecución de transferencia y liquidación</h3>
        <p className="text-xs text-gray-500">
          Bank+ ha registrado el asiento contable exitosamente. Ahora ingresa la referencia de la transferencia bancaria ejecutada para completar la liquidación.
        </p>
      </div>

      {/* Confirmación Bank+ */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-800">Bank+ — Registro exitoso</p>
          <p className="text-xs text-green-600">El asiento contable fue registrado. Correlativo: {op.id} · Hora: {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Referencia de transferencia */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Referencia de transferencia bancaria <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={refTransferencia}
          onChange={e => setRefTransferencia(e.target.value)}
          placeholder="Ej: BCP-2026-00412, ITB-9182736, InterOp-00234…"
          className={clsx(
            'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all font-mono',
            errors?.ref
              ? 'border-red-400 ring-2 ring-red-50'
              : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-50'
          )}
        />
        {errors?.ref && <p className="text-[11px] text-red-500 mt-1">{errors.ref}</p>}
        <p className="text-[11px] text-gray-400 mt-1">
          Ingresa el número o código que el sistema bancario generó al ejecutar la transferencia. Este dato queda vinculado permanentemente a la operación.
        </p>
      </div>

      {/* Fecha y hora auto */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Fecha y hora de liquidación</label>
        <div className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 font-mono">{fechaLiquidacion}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Registrada automáticamente. No editable.</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Datos de la liquidación</p>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { l: 'Operación',    v: op.id,                             mono: true },
            { l: 'Cliente',      v: op.clienteNombre                             },
            { l: 'Monto USD',    v: fmtMoney(op.montoUSD, '$')                   },
            { l: 'TC liquidado', v: op.tc?.toFixed(3),                 mono: true },
            { l: 'Cuenta ingreso', v: op.cuentaQpaqIn ?? '—'                     },
            { l: 'Cuenta egreso',  v: op.cuentaQpaqOut ?? '—'                    },
          ].map(({ l, v, mono }) => (
            <div key={l}>
              <p className="text-[11px] text-gray-400 mb-0.5">{l}</p>
              <p className={clsx('text-sm font-medium text-gray-800', mono && 'font-mono')}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      <InfoCard bg="blue">
        Una vez confirmada la liquidación, la operación pasará al estado <strong>Liquidada</strong> y la referencia de transferencia quedará vinculada de forma permanente e inmutable.
      </InfoCard>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════ */
export default function RevisionBackOfficeWizard({ op, onBack, onLiquidar, onObservar, onPreviewDoc, notify }) {
  const [step,             setStep]             = useState(1)
  const [decision,         setDecision]         = useState('')
  const [observacion,      setObservacion]      = useState('')
  const [refTransferencia, setRefTransferencia] = useState('')
  const [errors,           setErrors]           = useState({})
  const [loading,          setLoading]          = useState(false)
  const [bankError,        setBankError]        = useState(false)
  const [bankOkAt,         setBankOkAt]         = useState(null)   // timestamp de aprobación Bank+

  if (!op) return null

  const isAprob   = decision === 'aprobar'
  const totalSteps = isAprob ? 4 : 3

  const fechaLiquidacion = bankOkAt
    ? bankOkAt.toLocaleDateString('es-PE') + ' ' + bankOkAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  function validateStep2() {
    const e = {}
    if (!decision) e.decision = 'Debes seleccionar una acción'
    if (decision === 'observar' && observacion.trim().length < 10)
      e.observacion = 'La observación debe tener al menos 10 caracteres'
    return e
  }

  function validateStep4() {
    const e = {}
    if (!refTransferencia.trim()) e.ref = 'La referencia de transferencia es obligatoria'
    return e
  }

  function handleNext() {
    if (step === 2) {
      const e = validateStep2()
      if (Object.keys(e).length > 0) { setErrors(e); return }
    }
    setErrors({})
    setStep(s => s + 1)
  }

  function handlePrev() {
    setErrors({})
    setBankError(false)
    setStep(s => s - 1)
  }

  // Step 3 → confirmar → si aprobar intentar Bank+, si ok → ir a step 4
  //                    → si observar → llamar onObservar y salir
  function handleConfirmarDecision() {
    if (!isAprob) {
      setLoading(true)
      setTimeout(() => {
        onObservar(op.id, observacion.trim())
        setLoading(false)
        notify?.(`Operación ${op.id} devuelta al Trader con observación.`, 'warning')
      }, 900)
      return
    }

    // Aprobar: simula Bank+ (90% éxito)
    setLoading(true)
    setBankError(false)
    setTimeout(() => {
      const bankOk = Math.random() > 0.1
      if (bankOk) {
        setBankOkAt(new Date())
        setStep(4)
        notify?.('Asiento contable registrado exitosamente en Bank+.')
      } else {
        setBankError(true)
        notify?.('Error al conectar con Bank+. Reinténtelo en unos minutos.', 'error')
      }
      setLoading(false)
    }, 1500)
  }

  // Step 4 → liquidar
  function handleLiquidar() {
    const e = validateStep4()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    setTimeout(() => {
      onLiquidar(op.id, { refTransferencia: refTransferencia.trim(), fechaLiquidacion })
      setLoading(false)
    }, 900)
  }

  // Reintentar Bank+
  function handleRetryBank() {
    setBankError(false)
    setLoading(true)
    setTimeout(() => {
      const bankOk = Math.random() > 0.3  // 70% éxito en reintento
      if (!bankOk) { setBankError(true); setLoading(false); return }
      setBankOkAt(new Date())
      setStep(4)
      setLoading(false)
    }, 1500)
  }

  const canNext2 = !!decision && (decision === 'aprobar' || observacion.trim().length >= 10)
  const isLastStep = step === totalSteps

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* ── Volver ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Bandeja de Revisión
      </button>

      {/* ── Stepper ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
        <StepIndicator currentStep={step} approved={isAprob && step > 1} totalSteps={totalSteps} />
      </div>

      {/* ── Contenido ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
        {step === 1 && <Step1 op={op} />}
        {step === 2 && (
          <Step2
            decision={decision}       setDecision={setDecision}
            observacion={observacion} setObservacion={setObservacion}
            errors={errors}
          />
        )}
        {step === 3 && <Step3 op={op} decision={decision} observacion={observacion} />}
        {step === 4 && (
          <Step4
            op={op}
            refTransferencia={refTransferencia} setRefTransferencia={setRefTransferencia}
            fechaLiquidacion={fechaLiquidacion}
            errors={errors}
          />
        )}

        {/* Error Bank+ */}
        {bankError && (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">
                <strong>Error de integración Bank+:</strong> No se pudo registrar el asiento contable. La operación permanece en tu bandeja. Puedes reintentar cuando Bank+ esté disponible.
              </p>
            </div>
            <button
              onClick={handleRetryBank}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={clsx(loading && 'animate-spin')} />
              Reintentar registro en Bank+
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
        <button
          onClick={step === 1 ? onBack : handlePrev}
          disabled={loading || step === 4}  // No se puede volver desde paso 4 (Bank+ ya procesó)
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-40"
        >
          <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {/* Siguiente — pasos 1 y 2 */}
        {!isLastStep && step < 3 && (
          <button
            onClick={handleNext}
            disabled={step === 2 && !canNext2}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95',
              step === 2 && !canNext2 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900'
            )}
          >
            Siguiente <ChevronRight size={15} />
          </button>
        )}

        {/* Confirmar decisión — paso 3 */}
        {step === 3 && (
          <button
            onClick={handleConfirmarDecision}
            disabled={loading}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-60',
              isAprob ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'
            )}
          >
            {loading
              ? <><Clock size={14} className="animate-spin" /> Procesando…</>
              : isAprob
                ? <><ShieldCheck size={14} /> Confirmar y enviar a Bank+</>
                : <><MessageSquare size={14} /> Confirmar observación</>}
          </button>
        )}

        {/* Liquidar — paso 4 (RF-15) */}
        {step === 4 && (
          <button
            onClick={handleLiquidar}
            disabled={loading || !refTransferencia.trim()}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading
              ? <><Clock size={14} className="animate-spin" /> Liquidando…</>
              : <><Banknote size={14} /> Confirmar liquidación</>}
          </button>
        )}
      </div>
    </div>
  )
}
