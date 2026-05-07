import { useState, useRef } from 'react'
import {
  ArrowLeft, Check, ChevronRight,
  AlertTriangle, Upload, FileText, Trash2,
  CheckCircle2, Clock, ShieldCheck, Eye, XCircle,
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   MOCK — Cuentas QAPAQ (shared catalogue)
══════════════════════════════════════════════ */
const CUENTAS_QAPAQ = {
  USD: [
    { id: 'QP-USD-1', banco: 'BCP',       numero: '191-9000001-0-01', moneda: 'USD' },
    { id: 'QP-USD-2', banco: 'Interbank', numero: '200-9000002-001',  moneda: 'USD' },
  ],
  PEN: [
    { id: 'QP-PEN-1', banco: 'BCP',        numero: '191-9000003-0-01', moneda: 'PEN' },
    { id: 'QP-PEN-2', banco: 'Scotiabank', numero: '00-272-9000004',   moneda: 'PEN' },
  ],
}

const STEPS = [
  { id: 1, label: 'Observación'  },
  { id: 2, label: 'Corrección'   },
  { id: 3, label: 'Reenvío'      },
]

/* ══════════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════════ */
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-start justify-center">
      {STEPS.map((step, i) => {
        const done   = step.id < currentStep
        const active = step.id === currentStep
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                done   ? 'bg-amber-500 text-white'
                : active ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                :          'bg-gray-100 text-gray-400'
              )}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={clsx('mt-1.5 text-[11px] font-medium whitespace-nowrap',
                active ? 'text-amber-600' : done ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('h-px mt-3.5 mx-3 transition-all', done ? 'bg-amber-400' : 'bg-gray-200')}
                style={{ width: 56 }} />
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
function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function ResumenRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className={clsx('text-sm font-medium', mono ? 'font-mono text-gray-700' : 'text-gray-800')}>{value || '—'}</p>
    </div>
  )
}

function ResumenCard({ title, accent, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className={clsx('px-4 py-2.5 border-b', accent ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200')}>
        <p className={clsx('text-[11px] font-semibold uppercase tracking-wider', accent ? 'text-amber-700' : 'text-gray-500')}>{title}</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function fmtMoney(n, moneda = '') {
  if (n === undefined || n === null) return '—'
  return `${moneda} ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-PE') + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

/* ══════════════════════════════════════════════
   STEP 1 — OBSERVACIÓN DE BACK OFFICE (solo lectura)
══════════════════════════════════════════════ */
function Step1({ op }) {
  // Última observación vigente
  const obs = op.observacion ?? op.historial?.filter(h => h.tipo === 'observacion').at(-1)

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Observación de Back Office</h3>
        <p className="text-xs text-gray-500">
          Revisa la observación registrada por Back Office. Este campo es de solo lectura. Debes atender el problema indicado antes de reenviar la operación.
        </p>
      </div>

      {/* Observación destacada */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Observación registrada</span>
          </div>
          <span className="text-[11px] text-amber-600 font-medium">
            {obs?.fecha ? fmtDateTime(obs.fecha) : (op.fechaObservacion ?? '—')}
          </span>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed font-medium">
          {obs?.detalle ?? op.textoObservacion ?? 'Sin descripción registrada.'}
        </p>
        <p className="text-[11px] text-amber-600">
          Registrado por: <strong>{obs?.por ?? op.observadoPor ?? 'Back Office'}</strong>
        </p>
      </div>

      {/* Datos de la operación — solo lectura */}
      <ResumenCard title="Datos de la operación (solo lectura)">
        <ResumenRow label="ID Operación"    value={op.id} mono />
        <ResumenRow label="Cliente"         value={op.clienteNombre} />
        <ResumenRow label="Tipo"            value={op.tipo?.toUpperCase()} />
        <ResumenRow label="TC pactado"      value={op.tc?.toFixed(3)} mono />
        <ResumenRow label="Monto USD"       value={fmtMoney(op.montoUSD, '$')} />
        <ResumenRow label="Monto PEN"       value={fmtMoney(op.montoPEN, 'S/')} />
      </ResumenCard>

      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-700">
          <p className="font-medium mb-1">Si la observación requiere cambiar el <strong>tipo de operación</strong> (compra ↔ venta), la operación debe anularse y registrarse nuevamente.</p>
          <p>Para correcciones de monto, TC o cuentas, avanza al siguiente paso.</p>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 2 — CORRECCIÓN (cuentas + docs adicionales)
══════════════════════════════════════════════ */
function Step2({ op, ctaIngreso, setCtaIngreso, ctaEgreso, setCtaEgreso, files, setFiles, errors, editMonto, setEditMonto, editTc, setEditTc, deletedOriginals, setDeletedOriginals, onPreviewDoc }) {
  const fileInputRef = useRef(null)

  const monedaIngreso = op.tipo === 'compra' ? 'PEN' : 'USD'
  const monedaEgreso  = op.tipo === 'compra' ? 'USD' : 'PEN'

  const optsIngreso = (CUENTAS_QAPAQ[monedaIngreso] || []).map(c => ({
    value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})`
  }))
  const optsEgreso = (CUENTAS_QAPAQ[monedaEgreso] || []).map(c => ({
    value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})`
  }))

  const selectCls = (err) => clsx(
    'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all',
    err
      ? 'border-red-400 ring-2 ring-red-50'
      : 'border-gray-200 hover:border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-50'
  )

  // Archivos previos que ya vienen de la operación
  const archivosExistentes = op.comprobantes ?? []
  const archivosActivosCnt = archivosExistentes.filter((_, i) => !deletedOriginals.has(i)).length
  const totalArchivos = archivosActivosCnt + files.length

  function handleFileChange(e) {
    const incoming = Array.from(e.target.files)
    if (totalArchivos + incoming.length > 5) {
      alert(`Límite excedido. Ya hay ${totalArchivos} archivo(s). Máximo 5 en total.`)
      return
    }
    const valid = incoming.filter(f => {
      const ok = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
      const sz = f.size <= 10 * 1024 * 1024
      if (!ok) alert(`Formato no válido: ${f.name}`)
      if (!sz) alert(`Excede 10 MB: ${f.name}`)
      return ok && sz
    })
    setFiles(prev => [...prev, ...valid])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile(idx) { setFiles(prev => prev.filter((_, i) => i !== idx)) }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Corrección de datos editables</h3>
        <p className="text-xs text-gray-500">
          Corrige las cuentas QAPAQ si corresponde y adjunta documentación adicional solicitada por Back Office.
        </p>
      </div>

      {/* Datos de la operación — editables */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos editables de la operación</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monto (USD)" hint="Modifica si el monto observado es incorrecto">
            <input
              type="number" step="0.01" min="0"
              value={editMonto}
              onChange={e => setEditMonto(e.target.value)}
              placeholder="Ej: 50000.00"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-50 font-mono"
            />
          </Field>
          <Field label="TC pactado" hint="Tipo de cambio pactado con el cliente">
            <input
              type="number" step="0.001" min="0"
              value={editTc}
              onChange={e => setEditTc(e.target.value)}
              placeholder="Ej: 3.742"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-50 font-mono"
            />
          </Field>
        </div>
      </div>

      {/* Cuentas QAPAQ */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Cuentas QAPAQ</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cuenta de ingreso" required hint={`Moneda: ${monedaIngreso}`} error={errors?.ctaIngreso}>
            <select value={ctaIngreso} onChange={e => setCtaIngreso(e.target.value)} className={selectCls(errors?.ctaIngreso)}>
              <option value="">Seleccionar cuenta…</option>
              {optsIngreso.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Cuenta de egreso" required hint={`Moneda: ${monedaEgreso}`} error={errors?.ctaEgreso}>
            <select value={ctaEgreso} onChange={e => setCtaEgreso(e.target.value)} className={selectCls(errors?.ctaEgreso)}>
              <option value="">Seleccionar cuenta…</option>
              {optsEgreso.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Documentación adicional */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Documentación adicional
          </p>
          <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full',
            totalArchivos >= 5 ? 'bg-red-50 text-red-500' :
            totalArchivos > 0  ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400')}>
            {totalArchivos} / 5 archivos
          </span>
        </div>

        {/* Archivos pre-existentes */}
        {archivosExistentes.length > 0 && (
          <div className="mb-3 space-y-1">
            <p className="text-[11px] text-gray-400 mb-2">Comprobantes originales (enviados anteriormente):</p>
            {archivosExistentes.map((f, i) => {
              const isDeleted = deletedOriginals.has(i)
              return (
                <div key={i} className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg border transition-all', isDeleted ? 'border-red-200 bg-red-50 opacity-50' : 'border-gray-100 bg-gray-50')}>
                  <FileText size={13} className={clsx('shrink-0', isDeleted ? 'text-red-300' : 'text-gray-400')} />
                  <p className={clsx('text-xs truncate', isDeleted ? 'text-red-400 line-through' : 'text-gray-500')}>{f.name ?? `Comprobante ${i + 1}`}</p>
                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    {!isDeleted && (
                      <button
                        onClick={() => onPreviewDoc?.(f.name ?? `Comprobante ${i + 1}`)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setDeletedOriginals(prev => {
                        const next = new Set(prev)
                        if (next.has(i)) next.delete(i); else next.add(i)
                        return next
                      })}
                      title={isDeleted ? 'Restaurar' : 'Eliminar comprobante'}
                      className={clsx('p-1 rounded transition-colors', isDeleted ? 'hover:bg-red-100 text-red-400' : 'hover:bg-red-50 text-gray-300 hover:text-red-500')}
                    >
                      <Trash2 size={13} />
                    </button>
                    {!isDeleted && <span className="text-[10px] text-gray-400">Original</span>}
                    {isDeleted && <span className="text-[10px] text-red-400">Eliminado</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalArchivos < 5 && (
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-gray-50 hover:bg-amber-50/40 hover:border-amber-300 cursor-pointer transition-all"
          >
            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            <Upload size={20} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Adjuntar comprobante adicional</p>
            <p className="text-xs text-gray-400">PDF, JPG o PNG — máx. 10 MB c/u · Quedan {5 - totalArchivos} espacios</p>
          </div>
        )}

        {totalArchivos >= 5 && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 text-center">
            Límite de 5 archivos alcanzado. No puedes adjuntar más comprobantes.
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] text-gray-400">Nuevos archivos a adjuntar:</p>
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-amber-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-700 truncate">{f.name}</p>
                    <p className="text-[10px] text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => onPreviewDoc?.(f.name)}
                    className="p-1 rounded hover:bg-amber-100 text-amber-500 transition-colors"
                  >
                    <Eye size={13} />
                  </button>
                  <button onClick={() => removeFile(i)} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {errors?.cuentas && <p className="text-[11px] text-red-500 mt-1">{errors.cuentas}</p>}
      </div>

    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 3 — REENVÍO (resumen + confirmación)
══════════════════════════════════════════════ */
function Step3({ op, ctaIngreso, ctaEgreso, files, editMonto, editTc, deletedOriginals }) {
  const monedaIngreso = op.tipo === 'compra' ? 'PEN' : 'USD'
  const monedaEgreso  = op.tipo === 'compra' ? 'USD' : 'PEN'

  const optsIngreso = (CUENTAS_QAPAQ[monedaIngreso] || []).map(c => ({
    value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})`
  }))
  const optsEgreso = (CUENTAS_QAPAQ[monedaEgreso] || []).map(c => ({
    value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})`
  }))

  const ctaIn  = optsIngreso.find(o => o.value === ctaIngreso)?.label
  const ctaOut = optsEgreso.find(o => o.value === ctaEgreso)?.label
  const archivosExistentesActivos = (op.comprobantes ?? []).filter((_, i) => !deletedOriginals.has(i)).length
  const totalArchivos = archivosExistentesActivos + files.length

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Resumen del reenvío a Back Office</h3>
        <p className="text-xs text-gray-500">
          Verifica los cambios antes de confirmar. La operación pasará al estado <strong>Subsanada</strong> y volverá a la bandeja de revisión de Back Office.
        </p>
      </div>

      <ResumenCard title="Operación">
        <ResumenRow label="ID"         value={op.id} mono />
        <ResumenRow label="Cliente"    value={op.clienteNombre} />
        <ResumenRow label="Monto USD"  value={`$ ${parseFloat(editMonto || op.montoUSD).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`} />
        <ResumenRow label="TC pactado" value={parseFloat(editTc || op.tc).toFixed(3)} mono />
      </ResumenCard>

      <ResumenCard title="Cuentas QAPAQ actualizadas" accent>
        <ResumenRow label="Cuenta de ingreso" value={ctaIn} />
        <ResumenRow label="Cuenta de egreso"  value={ctaOut} />
      </ResumenCard>

      <ResumenCard title="Documentación">
        <ResumenRow label="Total archivos adjuntos" value={`${totalArchivos} comprobante${totalArchivos !== 1 ? 's' : ''}`} />
        <ResumenRow label="Estado destino" value="Subsanada → Back Office" />
      </ResumenCard>

      {deletedOriginals.size > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">{deletedOriginals.size} comprobante(s) original(es) marcado(s) para eliminación.</p>
        </div>
      )}

      <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />
        <p className="text-xs text-green-700">
          Al confirmar, la operación saldrá de tu bandeja de observadas y quedará en cola para revisión de Back Office.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════ */
export default function SubsanacionWizard({ op, onBack, onSubsanar, onPreviewDoc, onAnular }) {
  const [step,       setStep]       = useState(1)
  const [ctaIngreso, setCtaIngreso] = useState(op?.cuentaQpaqIn  || '')
  const [ctaEgreso,  setCtaEgreso]  = useState(op?.cuentaQpaqOut || '')
  const [files,      setFiles]      = useState([])
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [deletedOriginals, setDeletedOriginals] = useState(new Set())
  const [editMonto, setEditMonto] = useState(String(op?.montoUSD ?? ''))
  const [editTc,    setEditTc]    = useState(String(op?.tc ?? ''))

  if (!op) return null

  function validateStep2() {
    const e = {}
    if (!ctaIngreso) e.ctaIngreso = 'Selecciona la cuenta de ingreso'
    if (!ctaEgreso)  e.ctaEgreso  = 'Selecciona la cuenta de egreso'
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
    setStep(s => s - 1)
  }

  function handleSubsanar() {
    setLoading(true)
    setTimeout(() => {
      onSubsanar(op.id, {
        ctaIngreso, ctaEgreso, files,
        montoUSD: parseFloat(editMonto) || op.montoUSD,
        tc: parseFloat(editTc) || op.tc,
        deletedOriginals: Array.from(deletedOriginals),
      })
      setLoading(false)
    }, 1000)
  }

  const canNext2 = !!ctaIngreso && !!ctaEgreso

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* ── Volver ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Operaciones Observadas
      </button>

      {/* ── Stepper ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
        <StepIndicator currentStep={step} />
      </div>

      {/* ── Contenido ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
        <div className="mb-4">
          {step === 1 && <Step1 op={op} />}
          {step === 2 && (
            <Step2
              op={op}
              ctaIngreso={ctaIngreso} setCtaIngreso={setCtaIngreso}
              ctaEgreso={ctaEgreso}   setCtaEgreso={setCtaEgreso}
              files={files}           setFiles={setFiles}
              errors={errors}
              editMonto={editMonto}   setEditMonto={setEditMonto}
              editTc={editTc}         setEditTc={setEditTc}
              deletedOriginals={deletedOriginals} setDeletedOriginals={setDeletedOriginals}
              onPreviewDoc={onPreviewDoc}
            />
          )}
          {step === 3 && (
            <Step3
              op={op}
              ctaIngreso={ctaIngreso}
              ctaEgreso={ctaEgreso}
              files={files}
              editMonto={editMonto}
              editTc={editTc}
              deletedOriginals={deletedOriginals}
            />
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
        <button
          onClick={step === 1 ? onBack : handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
        >
          <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {(step === 1 || step === 2) && onAnular && (
          <button
            onClick={() => onAnular(op.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all"
          >
            <XCircle size={14} /> Anular operación
          </button>
        )}

        {step < 3 && (
          <button
            onClick={handleNext}
            disabled={step === 2 && !canNext2}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95',
              step === 2 && !canNext2
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            )}
          >
            Siguiente <ChevronRight size={15} />
          </button>
        )}

        {step === 3 && (
          <button
            onClick={handleSubsanar}
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 shadow-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {loading
              ? <><Clock size={14} className="animate-spin" /> Enviando…</>
              : <><ShieldCheck size={14} /> Confirmar y reenviar</>}
          </button>
        )}
      </div>

    </div>
  )
}
