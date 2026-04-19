import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, Check, Search, X, AlertTriangle, Info,
  AlertCircle, ChevronRight, ArrowDownLeft, ArrowUpRight, CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'

/* ═══════════════════════════════════════════════
   STEPS
═══════════════════════════════════════════════ */
const STEPS = [
  { id: 1, label: 'Cliente'      },
  { id: 2, label: 'Operación'    },
  { id: 3, label: 'Cuentas'      },
  { id: 4, label: 'Confirmación' },
]

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const MOCK_CLIENTES = [
  { id: 'CLI-001', nombre: 'Empresa Industrial Inca S.A.C.',   ruc: '20100234567', tipo: 'juridica', traderNombre: 'Andrés Valdivia C.', mesa: 'Mesa Alpha' },
  { id: 'CLI-002', nombre: 'Textiles del Sur E.I.R.L.',        ruc: '20234567890', tipo: 'juridica', traderNombre: 'Andrés Valdivia C.', mesa: 'Mesa Alpha' },
  { id: 'CLI-003', nombre: 'Grupo Minero Los Andes S.A.',      ruc: '20345678901', tipo: 'juridica', traderNombre: 'Karla Mendoza R.',   mesa: 'Mesa Beta'  },
  { id: 'CLI-004', nombre: 'Consorcio Lima Norte S.A.C.',      ruc: '20456789012', tipo: 'juridica', traderNombre: 'Andrés Valdivia C.', mesa: 'Mesa Alpha' },
  { id: 'CLI-005', nombre: 'Importadora del Pacífico S.A.',    ruc: '20567890123', tipo: 'juridica', traderNombre: 'Rodrigo Paredes F.', mesa: 'Mesa Beta'  },
  { id: 'CLI-006', nombre: 'Carlos Herrera Quispe',            ruc: '10678901234', tipo: 'natural',  traderNombre: 'Andrés Valdivia C.', mesa: 'Mesa Alpha' },
]

const CUENTAS_CLIENTE = {
  'CLI-001': [
    { id: 'CTA-001', banco: 'BCP',       moneda: 'USD', numero: '191-1234567-0-12', tipo: 'propia',  convenio: true  },
    { id: 'CTA-002', banco: 'Interbank', moneda: 'PEN', numero: '200-3000123456',   tipo: 'propia',  convenio: true  },
    { id: 'CTA-003', banco: 'Scotia',    moneda: 'USD', numero: '00-272-123456789', tipo: 'tercero', convenio: false },
  ],
  'CLI-002': [
    { id: 'CTA-010', banco: 'BBVA', moneda: 'USD', numero: '0011-0111-11-0100075234', tipo: 'propia',  convenio: true },
    { id: 'CTA-011', banco: 'BCP',  moneda: 'PEN', numero: '191-2345678-0-45',        tipo: 'tercero', convenio: true },
  ],
}

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

const TC_DATATEC = { compra: 3.739, venta: 3.744 }

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function fmtMoney(n) {
  if (!n && n !== 0) return ''
  return parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

let _seq = 9
function nextCorrelativo() { _seq++; return `OP-2026-${String(_seq).padStart(3, '0')}` }

function todayStr() { return new Date().toISOString().split('T')[0] }

/* ═══════════════════════════════════════════════
   FORM ATOMS — mismo estilo que ClienteWizard
═══════════════════════════════════════════════ */
const inputCls = (err) => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all',
  err
    ? 'border-red-400 ring-2 ring-red-50'
    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
)

function Field({ label, required, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} strokeWidth={2.5} />{error}</p>}
    </div>
  )
}

function AppSelect({ value, onChange, options, placeholder, disabled }) {
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
    <div className="relative" ref={ref}>
      <button type="button" disabled={disabled} onClick={() => !disabled && setOpen(v => !v)}
        className={clsx(
          'w-full flex items-center gap-2 pl-3 pr-2.5 py-2.5 rounded-lg border text-sm text-left transition-all',
          disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
            : open
              ? 'border-blue-400 ring-2 ring-blue-50 bg-white'
              : 'bg-white border-gray-200 hover:border-gray-300'
        )}>
        <span className={clsx('flex-1 truncate', selected ? 'text-gray-800' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={clsx('w-3 h-3 text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 max-h-52 overflow-y-auto"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx('w-full flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50')}>
              {o.label}
              {o.value === value && <Check size={11} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP INDICATOR — idéntico a ClienteWizard
═══════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════
   STEP 1 — IDENTIFICACIÓN DEL CLIENTE
═══════════════════════════════════════════════ */
function Step1({ formData, onChange, errors }) {
  const wrapperRef  = useRef(null)
  const inputRef    = useRef(null)
  const [open, setOpen] = useState(false)

  const query    = formData.clienteQuery ?? ''
  const cliente  = formData.clienteResult

  const sugerencias = query.trim().length >= 1
    ? MOCK_CLIENTES.filter(c =>
        c.nombre.toLowerCase().includes(query.toLowerCase()) ||
        c.ruc.includes(query) ||
        c.id.toLowerCase().includes(query.toLowerCase())
      )
    : []

  /* cierra el dropdown al hacer click fuera */
  useEffect(() => {
    if (!open) return
    const h = e => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function handleQueryChange(e) {
    onChange('clienteQuery', e.target.value)
    onChange('clienteResult', null)
    setOpen(true)
  }

  function seleccionarCliente(c) {
    onChange('clienteResult', c)
    onChange('clienteQuery', c.nombre)
    setOpen(false)
  }

  function clearCliente() {
    onChange('clienteQuery', '')
    onChange('clienteResult', null)
    setOpen(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const sinResultados = query.trim().length >= 2 && sugerencias.length === 0

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Identificación del cliente</h3>
        <p className="text-xs text-gray-500">Busca al cliente por nombre, RUC o código. Solo puedes registrar operaciones para clientes de tu cartera.</p>
      </div>

      <Field label="Buscar por nombre, RUC o código" required error={errors?.clienteResult}>
        <div className="relative" ref={wrapperRef}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ej: Empresa Industrial o 20100234567…"
            value={query}
            disabled={!!cliente}
            onChange={handleQueryChange}
            onFocus={() => { if (!cliente && query.trim().length >= 1) setOpen(true) }}
            className={clsx(
              'w-full pl-9 py-2.5 rounded-lg border text-sm outline-none transition-all',
              cliente
                ? 'pr-24 bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
                : errors?.clienteResult
                  ? 'pr-3 border-red-400 ring-2 ring-red-50'
                  : open
                    ? 'pr-3 border-blue-400 ring-2 ring-blue-50'
                    : 'pr-3 border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
            )}
          />
          {cliente && (
            <button type="button" onClick={clearCliente}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded px-2 py-1 transition-colors">
              <X size={11} /> Cambiar
            </button>
          )}

          {/* Dropdown de sugerencias */}
          {open && !cliente && (sugerencias.length > 0 || sinResultados) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-40 py-1 max-h-56 overflow-y-auto"
              style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              {sinResultados ? (
                <div className="px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  Sin resultados. Verifica el nombre o RUC, o regístralo en el módulo Clientes.
                </div>
              ) : sugerencias.map(c => (
                <button key={c.id} type="button"
                  onMouseDown={e => { e.preventDefault(); seleccionarCliente(c) }}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.nombre}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {c.ruc} · {c.tipo === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'} · {c.mesa}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>

      {cliente && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-green-800">{cliente.nombre}</p>
            <p className="text-xs text-green-700">
              RUC/DNI: <strong>{cliente.ruc}</strong> ·{' '}
              {cliente.tipo === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'}
            </p>
            <p className="text-xs text-green-700">
              Trader: <strong>{cliente.traderNombre}</strong> · Mesa: <strong>{cliente.mesa}</strong>
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center shrink-0 mt-0.5">
            <Check size={15} className="text-green-700" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 2 — DATOS DE LA OPERACIÓN
═══════════════════════════════════════════════ */
function Step2({ formData, onChange, errors }) {
  const tipoOp    = formData.tipoOp    ?? ''
  const monto     = formData.monto     ?? ''
  const fuenteTC  = formData.fuenteTC  ?? 'datatec'
  const tcPunta   = formData.tcPunta   ?? ''
  const tcPactado = formData.tcPactado ?? ''

  const spread = tcPactado && tcPunta && !isNaN(+tcPactado) && !isNaN(+tcPunta)
    ? (+tcPactado - +tcPunta).toFixed(4) : null
  const contravalor = monto && tcPactado && !isNaN(+monto) && !isNaN(+tcPactado) && tipoOp
    ? tipoOp === 'compra' ? +monto * +tcPactado : +monto / +tcPactado : null
  const spreadAlert = spread !== null && Math.abs(+spread) > 0.01

  useEffect(() => {
    if (fuenteTC === 'datatec' && tipoOp) {
      onChange('tcPunta', String(tipoOp === 'compra' ? TC_DATATEC.compra : TC_DATATEC.venta))
    }
    if (fuenteTC === 'manual') onChange('tcPunta', '')
  }, [fuenteTC, tipoOp])

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Datos de la operación</h3>
        <p className="text-xs text-gray-500">Ingresa el tipo, monto y tipo de cambio pactado con el cliente.</p>
      </div>

      {/* Tipo */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Tipo de operación</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'compra', label: 'Compra',  desc: 'El cliente entrega USD · recibe PEN', Icon: ArrowDownLeft, color: 'emerald' },
            { value: 'venta',  label: 'Venta',   desc: 'El cliente entrega PEN · recibe USD', Icon: ArrowUpRight,  color: 'blue'    },
          ].map(({ value, label, desc, Icon, color }) => {
            const sel = tipoOp === value
            const active = color === 'emerald'
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-blue-500 bg-blue-50'
            const iconBg  = color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            const titleCl = color === 'emerald' ? 'text-emerald-900' : 'text-blue-900'
            return (
              <button key={value} type="button" onClick={() => { onChange('tipoOp', value); onChange('tcPunta', ''); onChange('tcPactado', '') }}
                className={clsx('text-left p-4 rounded-xl border-2 transition-all',
                  sel ? active : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50')}>
                <div className="flex items-start gap-3">
                  <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', sel ? iconBg : 'bg-gray-100 text-gray-500')}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={clsx('text-sm font-semibold', sel ? titleCl : 'text-gray-800')}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  {sel && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {errors?.tipoOp && (
          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={10} strokeWidth={2.5} />{errors.tipoOp}</p>
        )}
      </div>

      {/* Monto + TC */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Monto y tipo de cambio</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monto" required error={errors?.monto}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">USD</span>
              <input type="number" min="0" step="0.01" placeholder="0.00"
                value={monto} disabled={!tipoOp}
                onChange={e => { onChange('monto', e.target.value) }}
                className={clsx(
                  'w-full pl-12 pr-3 py-2.5 rounded-lg border text-sm text-right outline-none transition-all',
                  !tipoOp ? 'bg-gray-50 cursor-not-allowed border-gray-200'
                    : errors?.monto ? 'border-red-400 ring-2 ring-red-50'
                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
                )} />
            </div>
          </Field>

          <Field label="Fuente de tipo de cambio">
            <AppSelect value={fuenteTC} onChange={v => onChange('fuenteTC', v)} disabled={!tipoOp}
              options={[
                { value: 'datatec', label: 'Datatec (referencial automático)' },
                { value: 'manual',  label: 'Manual'                           },
              ]} />
          </Field>

          <Field label="TC de referencia (punta)" required error={errors?.tcPunta}
            hint={fuenteTC === 'datatec' && tipoOp ? `Datatec: compra ${TC_DATATEC.compra} / venta ${TC_DATATEC.venta}` : undefined}>
            <input type="number" step="0.001" placeholder="0.000"
              value={tcPunta} disabled={!tipoOp || fuenteTC === 'datatec'}
              onChange={e => onChange('tcPunta', e.target.value)}
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg border text-sm text-right font-mono outline-none transition-all',
                !tipoOp || fuenteTC === 'datatec' ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
                  : errors?.tcPunta ? 'border-red-400 ring-2 ring-red-50'
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
              )} />
          </Field>

          <Field label="TC pactado con el cliente" required error={errors?.tcPactado}>
            <input type="number" step="0.001" placeholder="0.000"
              value={tcPactado} disabled={!tipoOp}
              onChange={e => onChange('tcPactado', e.target.value)}
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg border text-sm text-right font-mono outline-none transition-all',
                !tipoOp ? 'bg-gray-50 cursor-not-allowed border-gray-200'
                  : errors?.tcPactado ? 'border-red-400 ring-2 ring-red-50'
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
              )} />
          </Field>
        </div>
      </div>

      {/* Spread + Contravalor */}
      {(spread !== null || contravalor !== null) && (
        <div className="grid grid-cols-2 gap-3">
          {spread !== null && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-500">Spread calculado</span>
              <span className={clsx('text-sm font-semibold font-mono', spreadAlert ? 'text-amber-600' : 'text-gray-800')}>{spread}</span>
            </div>
          )}
          {contravalor !== null && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-500">Contravalor estimado</span>
              <span className="text-sm font-semibold font-mono text-gray-800">
                {tipoOp === 'compra' ? 'PEN' : 'USD'} {fmtMoney(contravalor)}
              </span>
            </div>
          )}
        </div>
      )}

      {spreadAlert && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            <strong>Atención:</strong> El TC pactado difiere del TC de referencia en más de 0.01. Verifique con el cliente antes de continuar.
          </p>
        </div>
      )}

      {!tipoOp && (
        <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">Seleccione el tipo de operación para habilitar los campos de monto y tipo de cambio.</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 3 — CUENTAS BANCARIAS
═══════════════════════════════════════════════ */
function Step3({ formData, onChange, errors }) {
  const cliente     = formData.clienteResult
  const tipoOp      = formData.tipoOp ?? ''
  const cuentaDest  = formData.cuentaDest  ?? ''
  const cuentaQpaqOut = formData.cuentaQpaqOut ?? ''
  const cuentaQpaqIn  = formData.cuentaQpaqIn  ?? ''

  const cuentasCli  = cliente ? (CUENTAS_CLIENTE[cliente.id] ?? []) : []
  const monedaOut   = tipoOp === 'compra' ? 'USD' : 'PEN'
  const monedaIn    = tipoOp === 'compra' ? 'PEN' : 'USD'
  const qpaqOutOpts = (CUENTAS_QAPAQ[monedaOut] ?? []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))
  const qpaqInOpts  = (CUENTAS_QAPAQ[monedaIn]  ?? []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))

  const destOpts = [
    { value: 'transitoria', label: 'Cuenta transitoria QAPAQ' },
    ...cuentasCli.map(c => ({
      value: c.id,
      label: `${c.banco} · ${c.numero} (${c.moneda}) — ${c.tipo === 'tercero' ? 'Tercero' : 'Propia'}`,
    })),
  ]

  const ctaDest   = cuentasCli.find(c => c.id === cuentaDest)
  const convAlert = ctaDest?.tipo === 'tercero' && !ctaDest?.convenio

  function handleCuentaDest(val) {
    onChange('cuentaDest', val)
    const cta = cuentasCli.find(c => c.id === val)
    onChange('convAlert', cta?.tipo === 'tercero' && !cta?.convenio ? true : false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Cuentas bancarias</h3>
        <p className="text-xs text-gray-500">Selecciona las cuentas involucradas en la operación: destino del cliente y las cuentas QAPAQ de flujo.</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Cuenta del cliente</p>
        <Field label="Cuenta destino del cliente" required error={errors?.cuentaDest}
          hint="Cuenta donde el cliente recibirá los fondos de la operación">
          <AppSelect value={cuentaDest} onChange={handleCuentaDest}
            placeholder="Seleccionar cuenta…" options={destOpts} />
        </Field>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Cuentas QAPAQ</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cuenta QAPAQ — entrega fondos"
            hint={`Moneda: ${monedaOut || '—'}`}>
            <AppSelect value={cuentaQpaqOut} onChange={v => onChange('cuentaQpaqOut', v)}
              placeholder="Seleccionar…" disabled={!tipoOp} options={qpaqOutOpts} />
          </Field>
          <Field label="Cuenta QAPAQ — recibe fondos"
            hint={`Moneda: ${monedaIn || '—'}`}>
            <AppSelect value={cuentaQpaqIn} onChange={v => onChange('cuentaQpaqIn', v)}
              placeholder="Seleccionar…" disabled={!tipoOp} options={qpaqInOpts} />
          </Field>
        </div>
      </div>

      {convAlert && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">
            <strong>AL-FO-04:</strong> La cuenta de tercero seleccionada no tiene convenio de pago vigente. No se puede confirmar la cotización. Regularice la situación en la ficha del cliente.
          </p>
        </div>
      )}

      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Las cuentas QAPAQ son opcionales en esta etapa. Pueden completarse posteriormente desde la bandeja de operaciones.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 4 — CONFIRMACIÓN
═══════════════════════════════════════════════ */
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

function Step4({ formData, onConfirmar, confirmed, correlativo }) {
  if (confirmed) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Cotización confirmada</h3>
        <p className="text-sm text-gray-500 mb-6">La operación ha sido registrada y está disponible en la bandeja.</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-10 py-4 mb-3">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Correlativo asignado</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight font-mono">{correlativo}</p>
        </div>
        <p className="text-xs text-gray-400 max-w-xs">La operación queda en estado <strong>Reservada</strong>. Puedes consultarla en la bandeja de operaciones.</p>
      </div>
    )
  }

  const cliente    = formData.clienteResult
  const tipoOp     = formData.tipoOp ?? ''
  const monto      = formData.monto ?? ''
  const tcPactado  = formData.tcPactado ?? ''
  const tcPunta    = formData.tcPunta ?? ''
  const spread     = tcPactado && tcPunta ? (+tcPactado - +tcPunta).toFixed(4) : null
  const spreadAlert = spread !== null && Math.abs(+spread) > 0.01
  const contravalor = monto && tcPactado && tipoOp
    ? tipoOp === 'compra' ? +monto * +tcPactado : +monto / +tcPactado : null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Resumen de la cotización</h3>
      <p className="text-xs text-gray-500 mb-5">Revisa los datos antes de confirmar el registro de la operación.</p>

      <div className="space-y-3">
        <ResumenCard title="Cliente">
          <ResumenRow label="Nombre / Razón Social" value={cliente?.nombre} />
          <ResumenRow label="RUC / DNI" value={cliente?.ruc} />
          <ResumenRow label="Trader" value={cliente?.traderNombre} />
          <ResumenRow label="Mesa" value={cliente?.mesa} />
        </ResumenCard>

        <ResumenCard title="Operación">
          <ResumenRow label="Tipo"
            value={tipoOp === 'compra'
              ? <span className="inline-flex items-center gap-1 text-emerald-700 font-medium"><ArrowDownLeft size={12} /> Compra</span>
              : <span className="inline-flex items-center gap-1 text-blue-700 font-medium"><ArrowUpRight size={12} /> Venta</span>
            }
          />
          <ResumenRow label="Monto USD" value={monto ? `USD ${fmtMoney(+monto)}` : '—'} />
          <ResumenRow label="TC pactado" value={tcPactado ? (+tcPactado).toFixed(3) : '—'} />
          <ResumenRow label="Contravalor PEN" value={contravalor ? `PEN ${fmtMoney(contravalor)}` : '—'} />
          <ResumenRow label="Spread"
            value={spread
              ? <span className={clsx('font-mono', spreadAlert && 'text-amber-600 font-semibold')}>{spread}</span>
              : '—'
            }
          />
        </ResumenCard>

        {spreadAlert && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>Recuerde:</strong> El spread supera 0.01. Confirme que el TC fue acordado con el cliente.
            </p>
          </div>
        )}

        {/* Confirmar */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 mb-0.5">Estado al confirmar</p>
            <p className="text-base font-bold text-blue-700">Reservada</p>
            <p className="text-xs text-blue-600 mt-0.5">Se generará el correlativo y la operación quedará disponible en la bandeja.</p>
          </div>
          <button onClick={onConfirmar}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm whitespace-nowrap">
            Confirmar cotización
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   VALIDACIÓN POR PASO
═══════════════════════════════════════════════ */
function validateStep(step, formData) {
  const e = {}
  if (step === 1) {
    if (!formData.clienteResult) e.clienteResult = 'Selecciona un cliente válido para continuar.'
  }
  if (step === 2) {
    if (!formData.tipoOp) e.tipoOp = 'Selecciona el tipo de operación.'
    const m = parseFloat(formData.monto)
    if (!formData.monto || isNaN(m) || m <= 0) e.monto = 'Ingresa un monto válido mayor a cero.'
    if (!formData.tcPactado || isNaN(parseFloat(formData.tcPactado))) e.tcPactado = 'Ingresa el TC pactado con el cliente.'
    if (!formData.tcPunta   || isNaN(parseFloat(formData.tcPunta)))   e.tcPunta   = 'Ingresa el TC de referencia.'
  }
  if (step === 3) {
    if (formData.convAlert) e.cuentaDest = 'La cuenta de tercero no tiene convenio vigente (AL-FO-04). Regulariza antes de continuar.'
  }
  return e
}

/* ═══════════════════════════════════════════════
   INITIAL STATE
═══════════════════════════════════════════════ */
const INITIAL_FORM = {
  clienteQuery:  '',
  clienteResult: null,
  tipoOp:        '',
  monto:         '',
  fuenteTC:      'datatec',
  tcPunta:       '',
  tcPactado:     '',
  cuentaDest:    '',
  cuentaQpaqOut: '',
  cuentaQpaqIn:  '',
  convAlert:     false,
}

/* ═══════════════════════════════════════════════
   MAIN WIZARD
═══════════════════════════════════════════════ */
export default function CotizacionWizard({ onBack, onCreada }) {
  const [step,       setStep]       = useState(1)
  const [formData,   setFormData]   = useState(INITIAL_FORM)
  const [errors,     setErrors]     = useState({})
  const [confirmed,  setConfirmed]  = useState(false)
  const [correlativo, setCorrelativo] = useState(null)

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function handleNext() {
    const e = validateStep(step, formData)
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  function handlePrev() {
    setErrors({})
    setStep(s => s - 1)
  }

  function handleConfirmar() {
    const id  = nextCorrelativo()
    const now = new Date()
    const hora = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const cliente = formData.clienteResult
    const monto   = parseFloat(formData.monto)
    const tc      = parseFloat(formData.tcPactado)
    const montoPEN = formData.tipoOp === 'compra' ? Math.round(monto * tc * 100) / 100 : Math.round((monto / tc) * 100) / 100

    const newOp = {
      id,
      clienteNombre: cliente.nombre,
      tipo:     formData.tipoOp,
      montoUSD: monto,
      tc,
      montoPEN,
      estado: 'reservada',
      fecha:  todayStr(),
      hora,
      trader: cliente.traderNombre,
      mesa:   cliente.mesa,
      solAnulacion: null,
      historial: [],
      fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
    }

    setCorrelativo(id)
    setConfirmed(true)
    onCreada?.(newOp)
  }

  return (
    <div className="max-w-3xl mx-auto pb-8">

      {/* Back link */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5">
        <ArrowLeft size={15} />
        Volver a Bandeja de operaciones
      </button>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-4">
        <StepIndicator currentStep={step} />
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        {step === 1 && <Step1 formData={formData} onChange={handleChange} errors={errors} />}
        {step === 2 && <Step2 formData={formData} onChange={handleChange} errors={errors} />}
        {step === 3 && <Step3 formData={formData} onChange={handleChange} errors={errors} />}
        {step === 4 && <Step4 formData={formData} onConfirmar={handleConfirmar} confirmed={confirmed} correlativo={correlativo} />}
      </div>

      {/* Navigation */}
      {!confirmed ? (
        <div className="flex items-center justify-between">
          <button onClick={step === 1 ? onBack : handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <ArrowLeft size={14} />
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>
          {step < 4 && (
            <button onClick={handleNext}
              disabled={step === 1 && !formData.clienteResult}
              className={clsx(
                'flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all',
                step === 1 && !formData.clienteResult
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              )}>
              Siguiente <ChevronRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
            <ArrowLeft size={14} />
            Volver a Bandeja de operaciones
          </button>
        </div>
      )}
    </div>
  )
}
