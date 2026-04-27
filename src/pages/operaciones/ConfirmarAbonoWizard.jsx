import { useState, useRef } from 'react'
import {
  ArrowLeft, Check, ChevronRight,
  AlertTriangle, Info, Upload, FileText, Trash2,
  CheckCircle2, Clock, ShieldCheck, Eye,
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   MOCK — Cuentas QAPAQ
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

/* ══════════════════════════════════════════════
   CONFIG PASOS
══════════════════════════════════════════════ */
const STEPS = [
  { id: 1, label: 'Verificación'  },
  { id: 2, label: 'Documentación' },
  { id: 3, label: 'Confirmación'  },
]

/* ══════════════════════════════════════════════
   STEP INDICATOR — replica exacta de CotizacionWizard
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
                done   ? 'bg-blue-600 text-white'
                : active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                :          'bg-gray-100 text-gray-400'
              )}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={clsx('mt-1.5 text-[11px] font-medium whitespace-nowrap',
                active ? 'text-blue-600' : done ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('h-px mt-3.5 mx-3 transition-all', done ? 'bg-blue-400' : 'bg-gray-200')}
                style={{ width: 56 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════
   ATOMS — Form helpers
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

function ResumenRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
    </div>
  )
}

function ResumenCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function fmtMoney(n, moneda = '') {
  if (n === undefined || n === null) return '—'
  return `${moneda} ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

/* ══════════════════════════════════════════════
   STEP 1 — VERIFICACIÓN DE DATOS
══════════════════════════════════════════════ */
function Step1({ op }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Verificación de datos pactados</h3>
        <p className="text-xs text-gray-500">
          Revisa con atención los valores de esta operación. Estos datos son de solo lectura; si hay un error, cancela y solicita la corrección a Middle Office.
        </p>
      </div>

      <ResumenCard title="Identificación">
        <ResumenRow label="ID Operación"    value={op.id} />
        <ResumenRow label="Cliente"         value={op.clienteNombre} />
        <ResumenRow label="Trader"          value={op.trader} />
        <ResumenRow label="Mesa"            value={op.mesa} />
      </ResumenCard>

      <ResumenCard title="Condiciones pactadas">
        <ResumenRow label="Tipo de operación" value={op.tipo?.toUpperCase()} />
        <ResumenRow label="TC pactado"        value={op.tc?.toFixed(3)} />
        <ResumenRow label="Monto USD"         value={fmtMoney(op.montoUSD, '$')} />
        <ResumenRow label="Monto PEN"         value={fmtMoney(op.montoPEN, 'S/')} />
      </ResumenCard>

      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>AL-FX-01:</strong> Si detectas alguna discrepancia, NO procedas. Cancela y coordina la corrección con el área de Middle Office.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 2 — DOCUMENTACIÓN
══════════════════════════════════════════════ */
function Step2({ op, ctaIngreso, setCtaIngreso, ctaEgreso, setCtaEgreso, files, setFiles, errors }) {
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
      : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
  )

  function handleFileChange(e) {
    const incoming = Array.from(e.target.files)
    if (files.length + incoming.length > 5) { alert('Máximo 5 archivos.'); return }
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
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Cuentas QAPAQ y comprobantes</h3>
        <p className="text-xs text-gray-500">Define las cuentas definitivas del flujo y adjunta el voucher de abono del cliente.</p>
      </div>

      {/* Cuentas */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Cuentas QAPAQ</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cuenta de ingreso" required hint={`Moneda: ${op.tipo === 'compra' ? 'PEN' : 'USD'}`} error={errors?.ctaIngreso}>
            <select value={ctaIngreso} onChange={e => setCtaIngreso(e.target.value)} className={selectCls(errors?.ctaIngreso)}>
              <option value="">Seleccionar cuenta…</option>
              {optsIngreso.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Cuenta de egreso" required hint={`Moneda: ${op.tipo === 'compra' ? 'USD' : 'PEN'}`} error={errors?.ctaEgreso}>
            <select value={ctaEgreso} onChange={e => setCtaEgreso(e.target.value)} className={selectCls(errors?.ctaEgreso)}>
              <option value="">Seleccionar cuenta…</option>
              {optsEgreso.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Vouchers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Voucher de abono</p>
          <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full',
            files.length > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500')}>
            {files.length} / 5 archivos
          </span>
        </div>

        <div
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-gray-50 hover:bg-blue-50/40 hover:border-blue-300 cursor-pointer transition-all"
        >
          <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
          <Upload size={20} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Haz clic o arrastra el comprobante</p>
          <p className="text-xs text-gray-400">PDF, JPG o PNG — máx. 10 MB c/u</p>
        </div>

        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-blue-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-700 truncate">{f.name}</p>
                    <p className="text-[10px] text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => onPreviewDoc?.(f.name)}
                    className="p-1 rounded hover:bg-blue-50 text-blue-500 transition-colors"
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

        {errors?.files && <p className="text-[11px] text-red-500 mt-1">{errors.files}</p>}
      </div>

      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Una vez enviada la operación a Back Office, no podrás modificar las cuentas ni los archivos adjuntos.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 3 — CONFIRMACIÓN FINAL
══════════════════════════════════════════════ */
function Step3({ op, ctaIngreso, ctaEgreso, files, onConfirmar, loading }) {
  const monedaIngreso = op.tipo === 'compra' ? 'PEN' : 'USD'
  const monedaEgreso  = op.tipo === 'compra' ? 'USD' : 'PEN'

  const optsIngreso = (CUENTAS_QAPAQ[monedaIngreso] || []).map(c => ({
    value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})`
  }))
  const optsEgreso = (CUENTAS_QAPAQ[monedaEgreso] || []).map(c => ({
    value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})`
  }))

  const ctaIn = optsIngreso.find(o => o.value === ctaIngreso)?.label
  const ctaOut = optsEgreso.find(o => o.value === ctaEgreso)?.label

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Resumen del envío a Back Office</h3>
        <p className="text-xs text-gray-500">
          Verifica que todos los datos sean correctos. Al confirmar, la operación pasará a estado <strong>En revisión — Back Office</strong> y ya no podrás editarla.
        </p>
      </div>

      <ResumenCard title="Operación">
        <ResumenRow label="ID"              value={op.id} />
        <ResumenRow label="Cliente"         value={op.clienteNombre} />
        <ResumenRow label="Monto USD"       value={fmtMoney(op.montoUSD, '$')} />
        <ResumenRow label="TC pactado"      value={op.tc?.toFixed(3)} />
      </ResumenCard>

      <ResumenCard title="Cuentas QAPAQ">
        <ResumenRow label="Cuenta de ingreso" value={ctaIn} />
        <ResumenRow label="Cuenta de egreso"  value={ctaOut} />
      </ResumenCard>

      <ResumenCard title="Documentación">
        <ResumenRow label="Vouchers adjuntos" value={`${files.length} archivo${files.length !== 1 ? 's' : ''}`} />
        <ResumenRow label="Estado destino"    value="En revisión — Back Office" />
      </ResumenCard>

      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Todo en orden. Usa el botón <strong>"Confirmar y enviar"</strong> para completar el proceso.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════ */
export default function ConfirmarAbonoWizard({ op, onBack, onConfirmar, onPreviewDoc }) {
  const [step,       setStep]       = useState(1)
  const [ctaIngreso, setCtaIngreso] = useState(op?.cuentaQpaqIn  || '')
  const [ctaEgreso,  setCtaEgreso]  = useState(op?.cuentaQpaqOut || '')
  const [files,      setFiles]      = useState([])
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)

  if (!op) return null

  function validateStep2() {
    const e = {}
    if (!ctaIngreso) e.ctaIngreso = 'Selecciona la cuenta de ingreso'
    if (!ctaEgreso)  e.ctaEgreso  = 'Selecciona la cuenta de egreso'
    if (files.length === 0) e.files = 'Adjunta al menos un comprobante de abono'
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

  function handleConfirmar() {
    setLoading(true)
    setTimeout(() => {
      onConfirmar(op.id, { ctaIngreso, ctaEgreso, files })
      setLoading(false)
    }, 1000)
  }

  const canNextStep2 = files.length > 0 && !!ctaIngreso && !!ctaEgreso

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* ── Volver — enlace simple, sin card ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Pendientes de Abono
      </button>

      {/* ── Stepper ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
        <StepIndicator currentStep={step} />
      </div>

      {/* ── Contenido principal ── */}
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
            />
          )}
          {step === 3 && (
            <Step3
              op={op}
              ctaIngreso={ctaIngreso}
              ctaEgreso={ctaEgreso}
              files={files}
              onConfirmar={handleConfirmar}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* ── Footer de navegación ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
        <button
          onClick={step === 1 ? onBack : handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
        >
          <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {step < 3 && (
          <button
            onClick={handleNext}
            disabled={step === 2 && !canNextStep2}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95',
              step === 2 && !canNextStep2
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            Siguiente <ChevronRight size={15} />
          </button>
        )}

        {step === 3 && (
          <button
            onClick={handleConfirmar}
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {loading
              ? <><Clock size={14} className="animate-spin" /> Enviando…</>
              : <><ShieldCheck size={14} /> Confirmar y enviar</>}
          </button>
        )}
      </div>

    </div>
  )
}
