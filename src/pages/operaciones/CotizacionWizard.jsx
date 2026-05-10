import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, Check, Search, X, AlertTriangle, Info,
  AlertCircle, ChevronRight, ArrowDownLeft, ArrowUpRight, CheckCircle2, Plus,
  ArrowLeftRight,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney, parseMoney } from '../../utils/format.js'

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
  { id: 'CLI-007', nombre: 'Farmacéutica Andina S.A.',        ruc: '20789012345', tipo: 'juridica', traderNombre: 'Rodrigo Paredes F.', mesa: 'Mesa Alpha' },
]

const CUENTAS_CLIENTE = {
  'CLI-001': [
    { id: 'CTA-001', banco: 'BCP',       moneda: 'USD', numero: '191-1234567-0-12',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-002', banco: 'Interbank', moneda: 'PEN', numero: '200-3000123456',             tipo: 'propia',  convenio: true  },
    { id: 'CTA-003', banco: 'Scotia',    moneda: 'USD', numero: '00-272-123456789',           tipo: 'tercero', convenio: false },
    { id: 'CTA-004', banco: 'BBVA',      moneda: 'EUR', numero: '0011-0111-11-0100001234',   tipo: 'propia',  convenio: true  },
  ],
  'CLI-002': [
    { id: 'CTA-010', banco: 'BBVA',      moneda: 'USD', numero: '0011-0111-11-0100075234',   tipo: 'propia',  convenio: true  },
    { id: 'CTA-011', banco: 'BCP',       moneda: 'PEN', numero: '191-2345678-0-45',          tipo: 'tercero', convenio: true  },
  ],
  'CLI-003': [
    { id: 'CTA-030', banco: 'BCP',       moneda: 'USD', numero: '191-3000001-0-55',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-031', banco: 'BCP',       moneda: 'PEN', numero: '191-3000002-0-11',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-032', banco: 'Interbank', moneda: 'USD', numero: '200-3100099-001',            tipo: 'tercero', convenio: true  },
  ],
  'CLI-004': [
    { id: 'CTA-040', banco: 'Scotiabank',moneda: 'PEN', numero: '00-272-4000001',            tipo: 'propia',  convenio: true  },
    { id: 'CTA-041', banco: 'BBVA',      moneda: 'USD', numero: '0011-0444-44-0100044001',   tipo: 'propia',  convenio: true  },
  ],
  'CLI-005': [
    { id: 'CTA-050', banco: 'BCP',       moneda: 'PEN', numero: '191-5000001-0-88',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-051', banco: 'BBVA',      moneda: 'USD', numero: '0011-0222-22-0100088001',   tipo: 'propia',  convenio: true  },
    { id: 'CTA-052', banco: 'Interbank', moneda: 'PEN', numero: '200-5000099-001',            tipo: 'tercero', convenio: false },
  ],
  'CLI-006': [
    { id: 'CTA-060', banco: 'BCP',       moneda: 'PEN', numero: '191-6000001-0-22',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-061', banco: 'Interbank', moneda: 'USD', numero: '200-6000012-001',            tipo: 'propia',  convenio: true  },
  ],
  'CLI-007': [
    { id: 'CTA-070', banco: 'BCP',       moneda: 'USD', numero: '191-7000001-0-33',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-071', banco: 'BBVA',      moneda: 'PEN', numero: '0011-0777-77-0100077001',   tipo: 'propia',  convenio: true  },
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
  EUR: [
    { id: 'QP-EUR-1', banco: 'BCP',  numero: '191-9000005-0-01', moneda: 'EUR' },
    { id: 'QP-EUR-2', banco: 'BBVA', numero: '0011-9000006-0-01', moneda: 'EUR' },
  ],
  GBP: [
    { id: 'QP-GBP-1', banco: 'BCP',  numero: '191-9000007-0-01', moneda: 'GBP' },
  ],
}

const TC_SBS     = { compra: 3.735, venta: 3.740 }

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
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
function Step2({ formData, onChange, errors, marketData, ops }) {
  const { datatec, pizarra, status, mode } = marketData

  const nowTime      = new Date()
  const isPostCutoff = nowTime.getHours() > 13 || (nowTime.getHours() === 13 && nowTime.getMinutes() >= 33)
  const currentMode  = isPostCutoff ? 'manual' : mode

  const tipoOp       = formData.tipoOp        ?? ''
  const monedaCruz   = formData.monedaCruzada  ?? 'PEN'
  const monto        = formData.monto          ?? ''
  const fuenteTC     = formData.fuenteTC       ?? 'datatec'
  const tcPunta      = formData.tcPunta        ?? ''
  const tcPactado    = formData.tcPactado      ?? ''
  const isCruzada    = tipoOp === 'cruzada'

  // Auto-fill TC Punta desde Datatec (solo cuando la fuente es datatec)
  useEffect(() => {
    if (fuenteTC !== 'datatec' || !tipoOp) return
    const refB = currentMode === 'manual' ? pizarra.compra : datatec.compra
    const refV = currentMode === 'manual' ? pizarra.venta  : datatec.venta
    if (tipoOp === 'compra') onChange('tcPunta', String(refB))
    else if (tipoOp === 'venta') onChange('tcPunta', String(refV))
    else if (isCruzada) onChange('tcPunta', String(monedaCruz === 'PEN' ? refB : refV))
  }, [fuenteTC, tipoOp, monedaCruz, datatec, pizarra, currentMode])

  const tcPuntaNum   = parseFloat(tcPunta)
  const tcPactadoNum = parseFloat(tcPactado)
  const montoNum     = parseMoney(monto)

  // Spread: compra = punta−pactado; venta = pactado−punta; cruzada = |pactado−punta| siempre positivo
  const spread = !isNaN(tcPuntaNum) && tcPuntaNum > 0 && !isNaN(tcPactadoNum) && tcPactadoNum > 0
    ? (isCruzada
        ? Math.abs(tcPactadoNum - tcPuntaNum)
        : tipoOp === 'compra' ? tcPuntaNum - tcPactadoNum : tcPactadoNum - tcPuntaNum)
    : null
  const spreadNegativo = spread !== null && spread < 0

  // Contravalor:
  //   compra  → monto USD × tcPactado  = PEN
  //   venta   → monto PEN / tcPactado  = USD
  //   cruzada → monto × min(TC) / max(TC)  (misma moneda, flujo por banco distinto)
  const contravalor = !isNaN(montoNum) && montoNum > 0 && !isNaN(tcPactadoNum) && tcPactadoNum > 0
    ? isCruzada
      ? (() => {
          if (isNaN(tcPuntaNum) || tcPuntaNum <= 0) return null
          return montoNum * Math.min(tcPactadoNum, tcPuntaNum) / Math.max(tcPactadoNum, tcPuntaNum)
        })()
      : tipoOp === 'compra' ? montoNum * tcPactadoNum : montoNum / tcPactadoNum
    : null

  const fee = isCruzada && contravalor !== null ? montoNum - contravalor : null

  const montoLabel    = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'USD' : 'PEN'
  const contraLabel   = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'PEN' : 'USD'

  const todayIso      = new Date().toISOString().split('T')[0]
  const clienteNombre = formData.clienteResult?.nombre ?? ''
  const similar = (ops ?? []).filter(o =>
    o.clienteNombre === clienteNombre && o.fecha === todayIso &&
    !isNaN(montoNum) && Math.abs(montoNum - o.montoUSD) < 0.01 &&
    !isNaN(tcPactadoNum) && Math.abs(tcPactadoNum - o.tc) < 0.0001
  )

  const inputTC = (hasErr, disabled) => clsx(
    'w-full px-3 py-2.5 rounded-lg border text-sm text-right font-mono outline-none transition-all',
    disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
    : hasErr  ? 'border-red-400 ring-2 ring-red-50'
    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
  )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Datos de la operación</h3>
        <p className="text-xs text-gray-500">Ingresa el tipo, monto y tipo de cambio pactado con el cliente.</p>
      </div>

      {/* Tipo de operación */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Tipo de operación</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'compra', label: 'Compra', desc: 'El cliente entrega USD · recibe PEN', Icon: ArrowDownLeft, color: 'emerald' },
            { value: 'venta',  label: 'Venta',  desc: 'El cliente entrega PEN · recibe USD', Icon: ArrowUpRight,  color: 'blue'    },
          ].map(({ value, label, desc, Icon, color }) => {
            const sel    = tipoOp === value
            const active = color === 'emerald' ? 'border-emerald-500 bg-emerald-50' : 'border-blue-500 bg-blue-50'
            const iconBg = color === 'emerald' ? 'bg-emerald-100 text-emerald-600'  : 'bg-blue-100 text-blue-600'
            const titleCl= color === 'emerald' ? 'text-emerald-900'                 : 'text-blue-900'
            return (
              <button key={value} type="button"
                onClick={() => { onChange('tipoOp', value); onChange('tcPunta', ''); onChange('tcPactado', '') }}
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
                  {sel && <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5"><Check size={11} className="text-white" /></div>}
                </div>
              </button>
            )
          })}

          {/* Cruzada — ocupa ambas columnas */}
          <button type="button"
            onClick={() => { onChange('tipoOp', 'cruzada'); onChange('tcPunta', ''); onChange('tcPactado', ''); onChange('fuenteTC', 'datatec') }}
            className={clsx('col-span-2 text-left p-4 rounded-xl border-2 transition-all',
              isCruzada ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50')}>
            <div className="flex items-start gap-3">
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                isCruzada ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500')}>
                <ArrowLeftRight size={18} />
              </div>
              <div className="flex-1">
                <p className={clsx('text-sm font-semibold', isCruzada ? 'text-purple-900' : 'text-gray-800')}>Cruzada</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  El cliente entrega fondos en un banco y recibe la misma moneda en otro banco con un fee · genera 2 registros BCRP
                </p>
              </div>
              {isCruzada && <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5"><Check size={11} className="text-white" /></div>}
            </div>
          </button>
        </div>
        {errors?.tipoOp && (
          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={10} strokeWidth={2.5} />{errors.tipoOp}</p>
        )}
      </div>

      {/* Selector de moneda para cruzada */}
      {isCruzada && (
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Moneda de la operación cruzada</p>
          <div className="flex gap-3">
            {[
              { value: 'PEN', label: 'Soles (PEN)', desc: 'Cruzada soles' },
              { value: 'USD', label: 'Dólares (USD)', desc: 'Cruzada dólares' },
            ].map(({ value, label, desc }) => (
              <button key={value} type="button"
                onClick={() => { onChange('monedaCruzada', value); onChange('tcPunta', ''); onChange('tcPactado', '') }}
                className={clsx('flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all',
                  monedaCruz === value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300')}>
                <p className={clsx('text-sm font-semibold', monedaCruz === value ? 'text-purple-900' : 'text-gray-800')}>{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monto y tipo de cambio */}
      {tipoOp && (
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Monto y tipo de cambio</p>

          {similar.length > 0 && (
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-amber-50 border border-amber-200 mb-3">
              <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800">
                <strong>Posible duplicado:</strong> hay {similar.length === 1 ? 'una operación similar' : `${similar.length} operaciones similares`} registrada{similar.length > 1 ? 's' : ''} hoy para este cliente con el mismo monto y TC ({similar.map(s => s.id).join(', ')}).
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Monto */}
            <Field label={isCruzada ? `Monto a ingresar (flujo entrada)` : 'Monto'} required error={errors?.monto}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{montoLabel}</span>
                <input type="text" inputMode="numeric" placeholder="0.00"
                  value={monto}
                  onChange={e => onChange('monto', e.target.value.replace(/[^0-9.,]/g, ''))}
                  onBlur={() => { const n = parseMoney(monto); if (!isNaN(n) && n > 0) onChange('monto', fmtMoney(n)) }}
                  onFocus={() => onChange('monto', monto.replace(/,/g, ''))}
                  className={clsx('w-full pl-12 pr-3 py-2.5 rounded-lg border text-sm text-right outline-none transition-all',
                    errors?.monto ? 'border-red-400 ring-2 ring-red-50'
                    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50')} />
              </div>
            </Field>

            {/* Fuente TC */}
            <Field label="Fuente de tipo de cambio">
              <AppSelect value={fuenteTC} onChange={v => onChange('fuenteTC', v)}
                options={[
                  { value: 'datatec', label: 'Datatec (referencial automático)' },
                  { value: 'manual',  label: 'Manual'                           },
                ]} />
            </Field>

            {/* TC punta */}
            <Field
              label="TC punta (referencia)"
              required error={errors?.tcPunta}
              hint={fuenteTC === 'datatec' && tipoOp
                ? `Ref. ${isPostCutoff ? 'Pizarra' : 'Datatec'}: C ${(isPostCutoff ? pizarra.compra : datatec.compra).toFixed(3)} / V ${(isPostCutoff ? pizarra.venta : datatec.venta).toFixed(3)}`
                : undefined}>
              <div className="relative">
                <input type="text" inputMode="decimal" placeholder="0.0000"
                  value={tcPunta}
                  disabled={fuenteTC === 'datatec'}
                  onChange={e => onChange('tcPunta', e.target.value.replace(',', '.'))}
                  className={inputTC(!!errors?.tcPunta, fuenteTC === 'datatec')} />
                {fuenteTC === 'datatec' && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <div className={clsx('w-1.5 h-1.5 rounded-full', status === 'connected' && !isPostCutoff ? 'bg-green-500 animate-pulse' : 'bg-amber-500')} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {isPostCutoff ? 'Pre.Pizarra' : status === 'connected' ? 'LIVE' : 'Caché'}
                    </span>
                  </div>
                )}
              </div>
            </Field>

            {/* TC pactado */}
            <Field label="TC pactado con el cliente" required error={errors?.tcPactado}>
              <input type="text" inputMode="decimal" placeholder="0.0000"
                value={tcPactado}
                onChange={e => onChange('tcPactado', e.target.value.replace(',', '.'))}
                className={inputTC(!!errors?.tcPactado, false)} />
            </Field>
          </div>

          {/* Resultados calculados */}
          {isCruzada && contravalor !== null && (() => {
            // Intermedio USD: para soles = monto / tcPactado; para dólares = monto * tcPactado (en PEN)
            const tcMax = Math.max(tcPactadoNum, tcPuntaNum)
            const intermedio = monedaCruz === 'PEN'
              ? montoNum / tcMax           // soles → USD intermedio
              : montoNum * tcPuntaNum      // dólares → PEN intermedio
            const intermedioLabel = monedaCruz === 'PEN' ? 'USD' : 'PEN'
            return (
              <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-purple-100">
                  <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider">Flujo de la operación cruzada</p>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {/* Fila ingreso */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 text-xs">Flujo ingreso (cliente entrega)</span>
                    <span className="font-mono font-semibold text-gray-800">{monedaCruz} {fmtMoney(montoNum)}</span>
                  </div>
                  {/* Intermedio */}
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-purple-100 pt-2">
                    <span>
                      {monedaCruz === 'PEN'
                        ? `Pata 1 — QAPAQ vende S/ a TC pactado ${tcPactadoNum.toFixed(4)}`
                        : `Pata 1 — QAPAQ compra USD a TC pactado ${tcPactadoNum.toFixed(4)}`}
                    </span>
                    <span className="font-mono">{intermedioLabel} {fmtMoney(intermedio)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {monedaCruz === 'PEN'
                        ? `Pata 2 — QAPAQ compra USD a TC punta ${tcPuntaNum.toFixed(4)}`
                        : `Pata 2 — QAPAQ vende USD a TC punta ${tcPuntaNum.toFixed(4)}`}
                    </span>
                    <span className="font-mono">{intermedioLabel} {fmtMoney(intermedio)}</span>
                  </div>
                  {/* Salida */}
                  <div className="flex items-center justify-between text-sm border-t border-purple-100 pt-2">
                    <span className="text-gray-500 text-xs">Flujo salida (cliente recibe)</span>
                    <span className="font-mono font-semibold text-gray-800">{monedaCruz} {fmtMoney(contravalor)}</span>
                  </div>
                  {/* Fee */}
                  <div className="flex items-center justify-between text-xs border-t border-purple-100 pt-2">
                    <span className="text-purple-600 font-medium">Fee QAPAQ</span>
                    <span className="font-mono font-semibold text-purple-700">{monedaCruz} {fmtMoney(fee)}</span>
                  </div>
                </div>
                {/* Aviso si los TCs están en el orden incorrecto */}
                {(() => {
                  const ordenCorrecto = monedaCruz === 'PEN'
                    ? tcPactadoNum > tcPuntaNum   // soles: pactado > punta
                    : tcPactadoNum < tcPuntaNum   // dólares: pactado < punta
                  return !ordenCorrecto ? (
                    <div className="flex items-start gap-2 px-4 py-2.5 border-t border-amber-200 bg-amber-50">
                      <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700">
                        {monedaCruz === 'PEN'
                          ? 'Cruzada soles: TC pactado debería ser mayor que TC punta. Verifique los valores ingresados.'
                          : 'Cruzada dólares: TC pactado debería ser menor que TC punta. Verifique los valores ingresados.'
                        }
                      </p>
                    </div>
                  ) : null
                })()}
              </div>
            )
          })()}

          {!isCruzada && spread !== null && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg px-4 py-3 bg-gray-50 border border-gray-200">
                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Spread calculado</p>
                <p className={clsx('text-lg font-bold font-mono', spreadNegativo ? 'text-red-500' : 'text-emerald-600')}>
                  {spread.toFixed(4)}
                </p>
              </div>
              <div className="rounded-lg px-4 py-3 bg-gray-50 border border-gray-200">
                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Contravalor estimado</p>
                <p className="text-lg font-bold font-mono text-gray-700">
                  {contravalor !== null ? `${contraLabel} ${fmtMoney(contravalor)}` : '—'}
                </p>
              </div>
            </div>
          )}

          {spreadNegativo && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-3">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>Atención:</strong> El TC pactado difiere del TC de referencia. Verifique antes de continuar.
              </p>
            </div>
          )}
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
  const cliente       = formData.clienteResult
  const tipoOp        = formData.tipoOp ?? ''
  const cuentasDest = formData.cuentasDest ?? [{ cuentaId: '', monto: '' }]

  const monedaCruz  = formData.monedaCruzada ?? 'PEN'
  const isCruzada   = tipoOp === 'cruzada'
  const cuentasCli  = cliente ? (CUENTAS_CLIENTE[cliente.id] ?? []) : []
  // cruzada: misma moneda entrada y salida; el cliente recibe en la misma moneda que entrega
  const monedaDest  = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'PEN' : 'USD'
  const monedaOut   = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'USD' : 'PEN'
  const monedaIn    = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'PEN' : 'USD'
  const qpaqOutOpts = (CUENTAS_QAPAQ[monedaOut] ?? []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))
  const qpaqInOpts  = (CUENTAS_QAPAQ[monedaIn]  ?? []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))

  // Monto total que el cliente recibirá (en monedaDest)
  const inputVal  = parseMoney(formData.monto)     || 0
  const tcPact    = parseFloat(formData.tcPactado) || 0
  const tcRef     = parseFloat(formData.tcPunta)   || 0
  const montoTotal = isCruzada
    ? (inputVal > 0 && tcPact > 0 && tcRef > 0
        ? Math.round(inputVal * Math.min(tcPact, tcRef) / Math.max(tcPact, tcRef) * 100) / 100
        : null)
    : tipoOp === 'compra'
      ? (inputVal > 0 && tcPact > 0 ? Math.round(inputVal * tcPact * 100) / 100 : null)
      : (inputVal > 0 && tcPact > 0 ? Math.round(inputVal / tcPact * 100) / 100 : null)

  // Solo cuentas del cliente cuya moneda coincide con la que recibirá el cliente
  const destOpts = cuentasCli
    .filter(c => !tipoOp || c.moneda === monedaDest)
    .map(c => ({
      value: c.id,
      label: `${c.banco} · ${c.numero} (${c.moneda}) — ${c.tipo === 'tercero' ? 'Tercero' : 'Propia'}`,
    }))

  // Pre-rellenar monto de la primera fila con el total cuando está vacío
  useEffect(() => {
    if (montoTotal !== null && (formData.cuentasDest ?? [{ cuentaId: '', monto: '' }])[0]?.monto === '') {
      const updated = (formData.cuentasDest ?? [{ cuentaId: '', monto: '' }]).map((row, i) =>
        i === 0 ? { ...row, monto: fmtMoney(montoTotal) } : row
      )
      onChange('cuentasDest', updated)
    }
  }, [montoTotal]) // eslint-disable-line

  function syncRows(updated) {
    const anyAlert = updated.some(row => {
      const cta = cuentasCli.find(c => c.id === row.cuentaId)
      return cta?.tipo === 'tercero' && !cta?.convenio
    })
    onChange('cuentasDest', updated)
    onChange('convAlert', anyAlert)
  }

  function handleCuentaChange(idx, val) {
    syncRows(cuentasDest.map((row, i) => i === idx ? { ...row, cuentaId: val } : row))
  }

  function handleMontoChange(idx, val) {
    syncRows(cuentasDest.map((row, i) => i === idx ? { ...row, monto: val } : row))
  }

  function addRow() {
    syncRows([...cuentasDest, { cuentaId: '', monto: '' }])
  }

  function removeRow(idx) {
    if (cuentasDest.length <= 1) return
    syncRows(cuentasDest.filter((_, i) => i !== idx))
  }

  const convAlert  = formData.convAlert
  const sumaMontos = cuentasDest.reduce((acc, row) => acc + (parseMoney(row.monto) || 0), 0)
  const diferencia = montoTotal !== null ? montoTotal - sumaMontos : null
  const showDif    = diferencia !== null && Math.abs(diferencia) > 0.005

  // QAPAQ cuentas con montos
  const qpaqEgreso  = formData.cuentasQpaqEgreso  ?? [{ cuentaId: '', monto: '' }]
  const qpaqIngreso = formData.cuentasQpaqIngreso ?? [{ cuentaId: '', monto: '' }]

  const montoEgresoEsperado  = inputVal > 0 ? inputVal : null
  const montoIngresoEsperado = montoTotal

  const sumaEgreso  = qpaqEgreso.reduce((acc, r) => acc + (parseMoney(r.monto) || 0), 0)
  const sumaIngreso = qpaqIngreso.reduce((acc, r) => acc + (parseMoney(r.monto) || 0), 0)
  const egresoDif   = montoEgresoEsperado !== null ? montoEgresoEsperado - sumaEgreso : null
  const ingresoDif  = montoIngresoEsperado !== null ? montoIngresoEsperado - sumaIngreso : null

  // Pre-rellenar primer monto QAPAQ egreso/ingreso
  useEffect(() => {
    if (montoEgresoEsperado !== null && qpaqEgreso[0]?.monto === '') {
      onChange('cuentasQpaqEgreso', qpaqEgreso.map((r, i) => i === 0 ? { ...r, monto: fmtMoney(montoEgresoEsperado) } : r))
    }
  }, [montoEgresoEsperado, inputVal]) // eslint-disable-line
  useEffect(() => {
    if (montoIngresoEsperado !== null && qpaqIngreso[0]?.monto === '') {
      onChange('cuentasQpaqIngreso', qpaqIngreso.map((r, i) => i === 0 ? { ...r, monto: fmtMoney(montoIngresoEsperado) } : r))
    }
  }, [montoIngresoEsperado, montoTotal]) // eslint-disable-line

  function handleQpaqEgresoBlur(idx, val) {
    onChange('cuentasQpaqEgreso', qpaqEgreso.map((r, i) => i === idx ? { ...r, monto: val } : r))
  }
  function handleQpaqIngresoBlur(idx, val) {
    onChange('cuentasQpaqIngreso', qpaqIngreso.map((r, i) => i === idx ? { ...r, monto: val } : r))
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Cuentas bancarias</h3>
        <p className="text-xs text-gray-500">Selecciona las cuentas involucradas en la operación: destino del cliente y las cuentas QAPAQ de flujo.</p>
      </div>

      {/* Cuentas destino del cliente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cuenta del cliente</p>
          <button type="button" onClick={addRow}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            <Plus size={13} /> Agregar cuenta
          </button>
        </div>

        <div className="space-y-3">
          {cuentasDest.map((row, idx) => {
            const ctaDest  = cuentasCli.find(c => c.id === row.cuentaId)
            const rowAlert = ctaDest?.tipo === 'tercero' && !ctaDest?.convenio
            const montoNum = parseMoney(row.monto)
            return (
              <div key={idx} className={clsx('rounded-xl border p-4 space-y-3',
                rowAlert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white')}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-600">
                    {idx === 0 ? 'Cuenta principal' : `Cuenta adicional ${idx}`}
                  </p>
                  {cuentasDest.length > 1 && (
                    <button type="button" onClick={() => removeRow(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cuenta destino" required={idx === 0}
                    error={idx === 0 ? errors?.cuentaDest : undefined}
                    hint="Cuenta donde el cliente recibirá los fondos">
                    <AppSelect value={row.cuentaId} onChange={v => handleCuentaChange(idx, v)}
                      placeholder="Seleccionar cuenta…" options={destOpts} />
                  </Field>

                  <Field label={`Monto a abonar (${monedaDest})`}
                    hint={idx === 0 && montoTotal ? `Total operación: ${monedaDest} ${fmtMoney(montoTotal)}` : undefined}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{monedaDest}</span>
                      <input type="text" inputMode="numeric" placeholder="0.00"
                        value={row.monto}
                        onChange={e => handleMontoChange(idx, e.target.value.replace(/[^0-9.,]/g, ''))}
                        onBlur={() => { const n = parseMoney(row.monto); if (!isNaN(n) && n > 0) handleMontoChange(idx, fmtMoney(n)) }}
                        onFocus={() => handleMontoChange(idx, row.monto.replace(/,/g, ''))}
                        className="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-right outline-none transition-all hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                    </div>
                  </Field>
                </div>

                {rowAlert && (
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <AlertTriangle size={12} className="shrink-0 text-red-500" />
                    <span>Cuenta de tercero sin convenio vigente (AL-FO-04).</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Diferencia cuando hay múltiples cuentas */}
        {showDif && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-3">
            <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800">
              La suma de los montos ({monedaDest} {fmtMoney(sumaMontos)}) difiere del total ({monedaDest} {fmtMoney(montoTotal)}).
              Diferencia: {fmtMoney(Math.abs(diferencia))}.
            </p>
          </div>
        )}
      </div>

      {/* QAPAQ Egreso e Ingreso — secciones con múltiples cuentas y montos */}
      <div className="space-y-4">
        {/* Egreso */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Cuenta QAPAQ – Egreso
              {monedaOut && <span className="ml-1 font-normal normal-case text-gray-300">({monedaOut})</span>}
            </p>
            <button type="button" disabled={!tipoOp}
              onClick={() => onChange('cuentasQpaqEgreso', [...qpaqEgreso, { cuentaId: '', monto: '' }])}
              className={clsx('flex items-center gap-1 text-xs font-medium transition-colors',
                tipoOp ? 'text-blue-600 hover:text-blue-800' : 'text-gray-300 cursor-not-allowed')}>
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {qpaqEgreso.map((row, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {idx === 0 ? 'Cuenta egreso principal' : `Cuenta egreso adicional ${idx}`}
                  </p>
                  {qpaqEgreso.length > 1 && (
                    <button type="button"
                      onClick={() => onChange('cuentasQpaqEgreso', qpaqEgreso.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AppSelect value={row.cuentaId} onChange={v => {
                    const updated = qpaqEgreso.map((x, i) => i === idx ? { ...x, cuentaId: v } : x)
                    onChange('cuentasQpaqEgreso', updated)
                  }} placeholder="Seleccionar cuenta…" disabled={!tipoOp} options={qpaqOutOpts} />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{monedaOut}</span>
                    <input type="text" inputMode="numeric" placeholder="0.00"
                      value={row.monto}
                      onChange={e => {
                        const updated = qpaqEgreso.map((x, i) => i === idx ? { ...x, monto: e.target.value.replace(/[^0-9.,]/g, '') } : x)
                        onChange('cuentasQpaqEgreso', updated)
                      }}
                      onBlur={() => { const n = parseMoney(row.monto); if (!isNaN(n) && n > 0) handleQpaqEgresoBlur(idx, fmtMoney(n)) }}
                      onFocus={() => {
                        const updated = qpaqEgreso.map((x, i) => i === idx ? { ...x, monto: x.monto.replace(/,/g, '') } : x)
                        onChange('cuentasQpaqEgreso', updated)
                      }}
                      className="w-full pl-12 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-right outline-none transition-all hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {egresoDif !== null && Math.abs(egresoDif) > 0.005 && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg mt-2">
              <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800">
                La suma de egresos ({monedaOut} {fmtMoney(sumaEgreso)}) difiere del total esperado ({monedaOut} {fmtMoney(montoEgresoEsperado)}).
                Diferencia: {fmtMoney(Math.abs(egresoDif))}.
              </p>
            </div>
          )}
        </div>

        {/* Ingreso */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Cuenta QAPAQ – Ingreso
              {monedaIn && <span className="ml-1 font-normal normal-case text-gray-300">({monedaIn})</span>}
            </p>
            <button type="button" disabled={!tipoOp}
              onClick={() => onChange('cuentasQpaqIngreso', [...qpaqIngreso, { cuentaId: '', monto: '' }])}
              className={clsx('flex items-center gap-1 text-xs font-medium transition-colors',
                tipoOp ? 'text-blue-600 hover:text-blue-800' : 'text-gray-300 cursor-not-allowed')}>
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {qpaqIngreso.map((row, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {idx === 0 ? 'Cuenta ingreso principal' : `Cuenta ingreso adicional ${idx}`}
                  </p>
                  {qpaqIngreso.length > 1 && (
                    <button type="button"
                      onClick={() => onChange('cuentasQpaqIngreso', qpaqIngreso.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AppSelect value={row.cuentaId} onChange={v => {
                    const updated = qpaqIngreso.map((x, i) => i === idx ? { ...x, cuentaId: v } : x)
                    onChange('cuentasQpaqIngreso', updated)
                  }} placeholder="Seleccionar cuenta…" disabled={!tipoOp} options={qpaqInOpts} />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{monedaIn}</span>
                    <input type="text" inputMode="numeric" placeholder="0.00"
                      value={row.monto}
                      onChange={e => {
                        const updated = qpaqIngreso.map((x, i) => i === idx ? { ...x, monto: e.target.value.replace(/[^0-9.,]/g, '') } : x)
                        onChange('cuentasQpaqIngreso', updated)
                      }}
                      onBlur={() => { const n = parseMoney(row.monto); if (!isNaN(n) && n > 0) handleQpaqIngresoBlur(idx, fmtMoney(n)) }}
                      onFocus={() => {
                        const updated = qpaqIngreso.map((x, i) => i === idx ? { ...x, monto: x.monto.replace(/,/g, '') } : x)
                        onChange('cuentasQpaqIngreso', updated)
                      }}
                      className="w-full pl-12 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-right outline-none transition-all hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {ingresoDif !== null && Math.abs(ingresoDif) > 0.005 && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg mt-2">
              <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800">
                La suma de ingresos ({monedaIn} {fmtMoney(sumaIngreso)}) difiere del total esperado ({monedaIn} {fmtMoney(montoIngresoEsperado)}).
                Diferencia: {fmtMoney(Math.abs(ingresoDif))}.
              </p>
            </div>
          )}
        </div>
      </div>

      {convAlert && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">
            <strong>AL-FO-04:</strong> Una o más cuentas de tercero no tienen convenio de pago vigente. No se puede confirmar la cotización. Regularice la situación en la ficha del cliente.
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

function Step4({ formData, onConfirmar, confirmed, correlativo, onBack }) {
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
        <p className="text-xs text-gray-400 max-w-xs mb-8">La operación queda en estado <strong>Reservada</strong>. Puedes consultarla en la bandeja de operaciones.</p>
        <button
          onClick={onBack}
          className="px-8 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95"
        >
          Volver a la bandeja
        </button>
      </div>
    )
  }

  const cliente     = formData.clienteResult
  const tipoOp      = formData.tipoOp         ?? ''
  const monedaCruz  = formData.monedaCruzada   ?? 'PEN'
  const monto       = formData.monto           ?? ''
  const tcPactado   = formData.tcPactado       ?? ''
  const tcPunta     = formData.tcPunta         ?? ''
  const cuentasDest = formData.cuentasDest     ?? []
  const isCruzada   = tipoOp === 'cruzada'
  const monedaMonto = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'USD' : 'PEN'
  const monedaDest  = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'PEN' : 'USD'
  const tcPuntaN    = parseFloat(tcPunta)
  const tcPactadoN  = parseFloat(tcPactado)
  const montoN      = parseFloat(monto)
  const spreadVal   = !isNaN(tcPuntaN) && !isNaN(tcPactadoN)
    ? (isCruzada
        ? Math.abs(tcPactadoN - tcPuntaN)
        : tipoOp === 'compra' ? tcPuntaN - tcPactadoN : tcPactadoN - tcPuntaN)
    : null
  const spreadAlert = spreadVal !== null && spreadVal < 0
  const contravalor = !isNaN(montoN) && montoN > 0 && !isNaN(tcPactadoN) && tcPactadoN > 0
    ? isCruzada
      ? (!isNaN(tcPuntaN) && tcPuntaN > 0
          ? montoN * Math.min(tcPactadoN, tcPuntaN) / Math.max(tcPactadoN, tcPuntaN)
          : null)
      : tipoOp === 'compra' ? montoN * tcPactadoN : montoN / tcPactadoN
    : null
  const fee = isCruzada && contravalor !== null ? montoN - contravalor : null

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
              : tipoOp === 'venta'
                ? <span className="inline-flex items-center gap-1 text-blue-700 font-medium"><ArrowUpRight size={12} /> Venta</span>
                : <span className="inline-flex items-center gap-1 text-purple-700 font-medium"><ArrowLeftRight size={12} /> Cruzada {monedaCruz === 'PEN' ? 'soles' : 'dólares'}</span>
            }
          />
          <ResumenRow label={isCruzada ? `Flujo ingreso (${monedaMonto})` : `Monto ${monedaMonto}`}
            value={monto ? `${monedaMonto} ${fmtMoney(+monto)}` : '—'} />
          <ResumenRow label="TC pactado" value={tcPactado ? (+tcPactado).toFixed(4) : '—'} />
          <ResumenRow label="TC punta" value={tcPunta ? (+tcPunta).toFixed(4) : '—'} />
          <ResumenRow label={isCruzada ? `Flujo salida (${monedaDest})` : `Contravalor ${monedaDest}`}
            value={contravalor !== null ? `${monedaDest} ${fmtMoney(contravalor)}` : '—'}
          />
          {isCruzada && fee !== null
            ? <ResumenRow label="Fee QAPAQ"
                value={<span className="text-purple-700 font-semibold">{monedaCruz} {fmtMoney(fee)}</span>}
              />
            : <ResumenRow label="Spread"
                value={spreadVal !== null
                  ? <span className={clsx('font-mono', spreadAlert && 'text-amber-600 font-semibold')}>{spreadVal.toFixed(4)}</span>
                  : '—'}
              />
          }
          {isCruzada && (
            <ResumenRow label="Registros BCRP"
              value={<span className="text-purple-700 font-medium">2 registros (compra + venta)</span>}
            />
          )}
        </ResumenCard>

        {cuentasDest.some(r => r.cuentaId || r.monto) && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cuentas destino del cliente</p>
            </div>
            <div className="divide-y divide-gray-100">
              {cuentasDest.map((row, idx) => (
                <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 shrink-0">
                    {idx === 0 ? 'Principal' : `Adicional ${idx}`}
                  </p>
                  <p className="text-sm text-gray-800 font-medium flex-1 text-right">
                    {row.cuentaId || '—'}
                  </p>
                  <p className="text-sm font-mono text-gray-700 shrink-0">
                    {row.monto ? `${monedaDest} ${fmtMoney(+row.monto)}` : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QAPAQ cuentas en resumen */}
        {(() => {
          const eq = formData.cuentasQpaqEgreso ?? []
          const iq = formData.cuentasQpaqIngreso ?? []
          const hasEgreso = eq.some(r => r.cuentaId || r.monto)
          const hasIngreso = iq.some(r => r.cuentaId || r.monto)
          if (!hasEgreso && !hasIngreso) return null
          const monedaOut = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'USD' : 'PEN'
          const monedaIn = isCruzada ? monedaCruz : tipoOp === 'compra' ? 'PEN' : 'USD'
          return (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cuentas QAPAQ</p>
              </div>
              <div className="divide-y divide-gray-100">
                {hasEgreso && (
                  <div className="px-4 py-2.5 bg-gray-50/50">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Egreso ({monedaOut})</p>
                    {eq.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-1.5">
                        <p className="text-xs text-gray-500">{row.cuentaId || '—'}</p>
                        <p className="text-sm font-mono text-gray-700">{row.monto ? `${monedaOut} ${fmtMoney(+row.monto)}` : '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
                {hasIngreso && (
                  <div className="px-4 py-2.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingreso ({monedaIn})</p>
                    {iq.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-1.5">
                        <p className="text-xs text-gray-500">{row.cuentaId || '—'}</p>
                        <p className="text-sm font-mono text-gray-700">{row.monto ? `${monedaIn} ${fmtMoney(+row.monto)}` : '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {spreadAlert && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              <strong>Atención:</strong> El TC pactado difiere del TC de referencia en más de 0.01. Verifique con el cliente antes de confirmar.
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
    const m = parseMoney(formData.monto)
    const t = parseFloat(formData.tcPactado)
    if (!formData.monto || isNaN(m) || m <= 0) e.monto = formData.tipoOp === 'compra' ? 'Ingresa el monto en USD.' : 'Ingresa el monto en PEN.'
    if (!formData.tcPactado || isNaN(t) || t <= 0) e.tcPactado = 'Ingresa el TC pactado con el cliente.'
    if (!formData.tcPunta || isNaN(parseFloat(formData.tcPunta))) e.tcPunta = 'Ingresa el TC de referencia.'
  }
  if (step === 3) {
    if (formData.convAlert) e.cuentaDest = 'Una o más cuentas de tercero no tienen convenio vigente (AL-FO-04). Regulariza antes de continuar.'
  }
  return e
}

/* ═══════════════════════════════════════════════
   INITIAL STATE
═══════════════════════════════════════════════ */
const INITIAL_FORM = {
  clienteQuery:   '',
  clienteResult:  null,
  tipoOp:         '',
  monedaCruzada:  'PEN',
  monto:          '',
  montoPen:       '',
  fuenteTC:       'datatec',
  tcPunta:       '',
  tcPactado:     '',
  cuentasDest:       [{ cuentaId: '', monto: '' }],
  cuentasQpaqEgreso: [{ cuentaId: '', monto: '' }],
  cuentasQpaqIngreso:[{ cuentaId: '', monto: '' }],
  convAlert:         false,
}

/* ═══════════════════════════════════════════════
   MAIN WIZARD
═══════════════════════════════════════════════ */
export default function CotizacionWizard({ onBack, onCreada, marketData, ops }) {
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
    const cliente    = formData.clienteResult
    const isCruzada  = formData.tipoOp === 'cruzada'
    const tc         = parseFloat(formData.tcPactado)
    const tcRef      = parseFloat(formData.tcPunta) || undefined
    const inputVal   = parseMoney(formData.monto)
    const montoUSD   = isCruzada || formData.tipoOp === 'compra'
      ? inputVal
      : Math.round(inputVal / tc * 100) / 100
    const montoPEN   = isCruzada
      ? null
      : formData.tipoOp === 'compra'
        ? Math.round(inputVal * tc * 100) / 100
        : inputVal
    const montoContravalor = isCruzada && tcRef
      ? Math.round(inputVal * Math.min(tc, tcRef) / Math.max(tc, tcRef) * 100) / 100
      : null

    const newOp = {
      id,
      clienteNombre: cliente.nombre,
      tipo:     formData.tipoOp,
      ...(isCruzada && { monedaCruzada: formData.monedaCruzada ?? 'PEN', montoContravalor }),
      montoUSD,
      tc,
      montoPEN,
      tcRef,
      tcFuente: formData.fuenteTC === 'datatec' ? 'Datatec' : 'Manual',
      estado:   'reservada',
      fecha:    todayStr(),
      hora,
      trader:   cliente.traderNombre,
      mesa:     cliente.mesa,
      cuentasDest:       formData.cuentasDest       ?? [],
      cuentasQpaqEgreso: formData.cuentasQpaqEgreso ?? [],
      cuentasQpaqIngreso:formData.cuentasQpaqIngreso ?? [],
      backOffice: null,
      solAnulacion: null,
      historial: [],
      fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
    }

    setCorrelativo(id)
    setConfirmed(true)
    onCreada?.(newOp)
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* ── Volver — enlace simple, sin card ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Bandeja de Operaciones
      </button>

      {/* Stepper indicator */}
      {!confirmed && (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
          <StepIndicator currentStep={step} />
        </div>
      )}

      {/* Main Form Content */}
      <div className={clsx('bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6', confirmed && 'text-center')}>
        <div className="mb-4">
          {step === 1 && <Step1 formData={formData} onChange={handleChange} errors={errors} />}
          {step === 2 && <Step2 formData={formData} onChange={handleChange} errors={errors} marketData={marketData} ops={ops} />}
          {step === 3 && <Step3 formData={formData} onChange={handleChange} errors={errors} />}
          {step === 4 && <Step4 formData={formData} onConfirmar={handleConfirmar} confirmed={confirmed} correlativo={correlativo} onBack={onBack} />}
        </div>
      </div>

      {/* ── Footer de navegación ── */}
      {!confirmed && (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
          <button
            onClick={step === 1 ? onBack : handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>

          {step < 4 && (
            <button
              onClick={handleNext}
              disabled={step === 1 && !formData.clienteResult}
              className={clsx(
                'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95',
                step === 1 && !formData.clienteResult
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              Siguiente <ChevronRight size={15} />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleConfirmar}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            >
              Confirmar cotización <ChevronRight size={15} />
            </button>
          )}
        </div>
      )}

      {/* Final step action */}
      {confirmed && (
        <div className="flex justify-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            <ArrowLeft size={16} /> Volver a Bandeja de Operaciones
          </button>
        </div>
      )}
    </div>
  )
}
