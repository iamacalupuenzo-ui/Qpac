import { useState, useRef, useEffect } from 'react'
import {
  Search, X, AlertTriangle, Info, CheckCircle2, ChevronDown,
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Check, ArrowLeft,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney } from '../../utils/format.js'

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const MOCK_CLIENTES = [
  { id: 'CLI-001', nombre: 'Empresa Industrial Inca S.A.C.',   ruc: '20100234567', tipo: 'juridica', trader: 'TRD-001', traderNombre: 'Andrés Valdivia C.' },
  { id: 'CLI-002', nombre: 'Textiles del Sur E.I.R.L.',        ruc: '20234567890', tipo: 'juridica', trader: 'TRD-001', traderNombre: 'Andrés Valdivia C.' },
  { id: 'CLI-003', nombre: 'Grupo Minero Los Andes S.A.',      ruc: '20345678901', tipo: 'juridica', trader: 'TRD-002', traderNombre: 'Karla Mendoza R.'  },
  { id: 'CLI-004', nombre: 'Consorcio Lima Norte S.A.C.',      ruc: '20456789012', tipo: 'juridica', trader: 'TRD-001', traderNombre: 'Andrés Valdivia C.' },
  { id: 'CLI-005', nombre: 'Importadora del Pacífico S.A.',    ruc: '20567890123', tipo: 'juridica', trader: 'TRD-003', traderNombre: 'Rodrigo Paredes F.' },
  { id: 'CLI-006', nombre: 'Carlos Herrera Quispe',            ruc: '10678901234', tipo: 'natural',  trader: 'TRD-001', traderNombre: 'Andrés Valdivia C.' },
  { id: 'CLI-007', nombre: 'María Luz Castillo V.',            ruc: '10789012345', tipo: 'natural',  trader: 'TRD-002', traderNombre: 'Karla Mendoza R.'  },
]

/* Cuentas del cliente mock */
const CUENTAS_CLIENTE = {
  'CLI-001': [
    { id: 'CTA-001', banco: 'BCP',        moneda: 'USD', numero: '191-1234567-0-12', tipo: 'propia',   convenio: true  },
    { id: 'CTA-002', banco: 'Interbank',  moneda: 'PEN', numero: '200-3000123456',   tipo: 'propia',   convenio: true  },
    { id: 'CTA-003', banco: 'Scotiabank', moneda: 'USD', numero: '00-272-123456789', tipo: 'tercero',  convenio: false },
  ],
  'CLI-002': [
    { id: 'CTA-010', banco: 'BBVA',      moneda: 'USD', numero: '0011-0111-11-0100075234', tipo: 'propia',  convenio: true },
    { id: 'CTA-011', banco: 'BCP',       moneda: 'PEN', numero: '191-2345678-0-45',        tipo: 'tercero', convenio: true },
  ],
}

/* Cuentas QAPAQ (origen/destino interno) */
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

/* TC referencial Datatec */
const TC_DATATEC = { compra: 3.739, venta: 3.744 }

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */

let _seq = 9
function nextCorrelativo() {
  _seq += 1
  return `OP-2026-${String(_seq).padStart(3, '0')}`
}

/* ═══════════════════════════════════════════════
   REUSABLE SELECT
═══════════════════════════════════════════════ */
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
      <button type="button" disabled={disabled} onClick={() => setOpen(v => !v)}
        className={clsx(
          'w-full flex items-center gap-2 pl-3 pr-2.5 py-2.5 rounded-lg text-sm text-left transition-all',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300',
        )}
        style={{ border: open ? undefined : '1px solid #e5e7eb' }}>
        <span className={clsx('flex-1 truncate', selected ? 'text-gray-800' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={12} className={clsx('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 min-w-max max-h-52 overflow-y-auto"
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
   ALERT COMPONENTS
═══════════════════════════════════════════════ */
function AlertError({ code, msg }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
      <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
      <div>
        {code && <span className="text-[10px] font-semibold text-red-400 mr-1.5">[{code}]</span>}
        <span className="text-xs text-red-700">{msg}</span>
      </div>
    </div>
  )
}

function AlertWarn({ code, msg }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
      <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
      <div>
        {code && <span className="text-[10px] font-semibold text-amber-500 mr-1.5">[{code}]</span>}
        <span className="text-xs text-amber-700">{msg}</span>
      </div>
    </div>
  )
}

function AlertInfo({ msg }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50 text-xs text-blue-700" style={{ border: '1px solid #bfdbfe' }}>
      <Info size={12} className="shrink-0 mt-0.5" />{msg}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SECTION WRAPPER
═══════════════════════════════════════════════ */
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)', background: '#fafafa' }}>
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════ */
function SuccessScreen({ correlativo, onNueva, onBack }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-5">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-green-600" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-gray-800">Cotización confirmada</p>
        <p className="text-sm text-gray-500">
          Correlativo asignado: <span className="font-mono font-bold text-gray-800">{correlativo}</span>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          La operación ha sido registrada en estado <strong>Reservada</strong> y está disponible en la Bandeja de operaciones.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onNueva}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          Registrar nueva cotización
        </button>
        {onBack && (
          <button onClick={onBack}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Ir a bandeja
          </button>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const TRADER_IDS = {
  trader: 'TRD-001', /* Andrés Valdivia C. — demo */
}

export default function RegistroFXPage({ role = 'trader', onBack }) {

  /* ── Sección 1: Cliente ── */
  const [clienteQuery,  setClienteQuery]  = useState('')
  const [clienteResult, setClienteResult] = useState(null)   // found | null
  const [alertCliente,  setAlertCliente]  = useState(null)   // null | 'AL-FO-01' | 'AL-FO-02'
  const searchRef = useRef(null)

  /* ── Sección 2: Operación ── */
  const [tipoOp,    setTipoOp]    = useState('')       // compra | venta | cruzada
  const [moneda,    setMoneda]    = useState('USD')
  const [monto,     setMonto]     = useState('')
  const [fuenteTC,  setFuenteTC]  = useState('datatec')
  const [tcPactado, setTcPactado] = useState('')
  const [tcPunta,   setTcPunta]   = useState('')
  const [alertSpread, setAlertSpread] = useState(false) // AL-FO-06

  /* ── Sección 3: Cuentas ── */
  const [cuentaDest,    setCuentaDest]    = useState('')
  const [cuentaQpaqOut, setCuentaQpaqOut] = useState('')
  const [cuentaQpaqIn,  setCuentaQpaqIn]  = useState('')
  const [alertConvenio, setAlertConvenio] = useState(false) // AL-FO-04

  /* ── Flujo ── */
  const [submitted,    setSubmitted]    = useState(false)
  const [errors,       setErrors]       = useState({})
  const [correlativo,  setCorrelativo]  = useState(null)

  const cuentasCliente = clienteResult ? (CUENTAS_CLIENTE[clienteResult.id] ?? []) : []
  const monedaOut  = tipoOp === 'compra' ? 'USD' : tipoOp === 'venta' ? 'PEN' : moneda
  const monedaIn   = tipoOp === 'compra' ? 'PEN' : tipoOp === 'venta' ? 'USD' : (moneda === 'USD' ? 'PEN' : 'USD')
  const qpaqOutOpts = (CUENTAS_QAPAQ[monedaOut] ?? []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))
  const qpaqInOpts  = (CUENTAS_QAPAQ[monedaIn]  ?? []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))

  /* TC Datatec auto-fill */
  useEffect(() => {
    if (fuenteTC === 'datatec' && tipoOp) {
      const ref = tipoOp === 'compra' ? TC_DATATEC.compra : TC_DATATEC.venta
      setTcPunta(String(ref))
    }
    if (fuenteTC === 'manual') {
      setTcPunta('')
    }
  }, [fuenteTC, tipoOp])

  /* Spread alert AL-FO-06 */
  useEffect(() => {
    if (!tcPactado || !tcPunta) { setAlertSpread(false); return }
    const spread = Math.abs(parseFloat(tcPactado) - parseFloat(tcPunta))
    setAlertSpread(spread > 0.01)
  }, [tcPactado, tcPunta])

  /* Reset cuentas when cliente changes */
  useEffect(() => {
    setCuentaDest(''); setAlertConvenio(false)
  }, [clienteResult])

  /* Reset QAPAQ cuentas when tipo changes */
  useEffect(() => {
    setCuentaQpaqOut(''); setCuentaQpaqIn('')
  }, [tipoOp, moneda])

  /* Convenio check AL-FO-04 */
  function handleCuentaDest(val) {
    setCuentaDest(val)
    const cta = cuentasCliente.find(c => c.id === val)
    setAlertConvenio(cta?.tipo === 'tercero' && !cta?.convenio)
  }

  /* ── Buscar cliente ── */
  function buscarCliente() {
    const q = clienteQuery.trim().toLowerCase()
    if (!q) return
    const found = MOCK_CLIENTES.find(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.ruc.includes(q) ||
      c.id.toLowerCase() === q
    )
    if (!found) {
      setClienteResult(null)
      setAlertCliente('AL-FO-01')
      return
    }
    /* AL-FO-02: trader can only serve their own clients */
    const myTraderId = TRADER_IDS[role]
    if (myTraderId && found.trader !== myTraderId) {
      setClienteResult(null)
      setAlertCliente('AL-FO-02')
      return
    }
    setClienteResult(found)
    setAlertCliente(null)
  }

  function clearCliente() {
    setClienteQuery(''); setClienteResult(null); setAlertCliente(null)
    setTipoOp(''); setMonto(''); setTcPactado(''); setTcPunta('')
    setCuentaDest(''); setCuentaQpaqOut(''); setCuentaQpaqIn('')
    setErrors({})
  }

  /* ── Validación ── */
  function validate() {
    const e = {}
    if (!clienteResult)         e.cliente   = 'Seleccione un cliente válido.'
    if (!tipoOp)                e.tipoOp    = 'Seleccione el tipo de operación.'
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0)
                                e.monto     = 'Ingrese un monto válido mayor a cero.'
    if (!tcPactado || isNaN(parseFloat(tcPactado)))
                                e.tcPactado = 'Ingrese el TC pactado con el cliente.'
    if (!tcPunta || isNaN(parseFloat(tcPunta)))
                                e.tcPunta   = 'Ingrese el TC de punta.'
    if (alertConvenio)          e.cuentaDest = 'La cuenta de tercero no tiene convenio vigente (AL-FO-04).'
    return e
  }

  /* ── Guardar borrador ── */
  function handleBorrador() {
    /* Sin correlativo, solo validamos cliente */
    if (!clienteResult) { setErrors({ cliente: 'Seleccione un cliente para guardar el borrador.' }); return }
    setErrors({})
    alert('Borrador guardado. El registro no tiene correlativo hasta que se confirme la cotización.')
  }

  /* ── Confirmar cotización ── */
  function handleConfirmar() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    const id = nextCorrelativo()
    setCorrelativo(id)
  }

  /* ── Reset para nueva cotización ── */
  function handleNueva() {
    setClienteQuery(''); setClienteResult(null); setAlertCliente(null)
    setTipoOp(''); setMoneda('USD'); setMonto(''); setFuenteTC('datatec')
    setTcPactado(''); setTcPunta(''); setAlertSpread(false)
    setCuentaDest(''); setCuentaQpaqOut(''); setCuentaQpaqIn(''); setAlertConvenio(false)
    setErrors({}); setCorrelativo(null); setSubmitted(false)
  }

  /* ── Spread calc ── */
  const spread = tcPactado && tcPunta && !isNaN(parseFloat(tcPactado)) && !isNaN(parseFloat(tcPunta))
    ? (parseFloat(tcPactado) - parseFloat(tcPunta)).toFixed(4)
    : null

  /* ── Monto contravalor ── */
  const montoContravalor = monto && tcPactado && !isNaN(parseFloat(monto)) && !isNaN(parseFloat(tcPactado))
    ? (tipoOp === 'compra' || tipoOp === 'cruzada')
      ? parseFloat(monto) * parseFloat(tcPactado)
      : parseFloat(monto) / parseFloat(tcPactado)
    : null

  if (correlativo) return <SuccessScreen correlativo={correlativo} onNueva={handleNueva} onBack={onBack} />

  const cuentasDestinoOpts = [
    { value: 'transitoria', label: 'Cuenta transitoria QAPAQ' },
    ...cuentasCliente.map(c => ({
      value: c.id,
      label: `${c.banco} · ${c.numero} (${c.moneda}) — ${c.tipo === 'tercero' ? 'Tercero' : 'Propia'}`,
    })),
  ]

  return (
    <div className="space-y-4 max-w-3xl">

      {/* Back nav */}
      {onBack && (
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors mb-1">
          <ArrowLeft size={13} /> Volver a bandeja de operaciones
        </button>
      )}

      {/* ── 1. BÚSQUEDA DE CLIENTE ── */}
      <Section title="1. Identificación del cliente">
        <Field label="Buscar por nombre, RUC o código" required>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Ej: Empresa Industrial o 20100234567…"
                value={clienteQuery}
                disabled={!!clienteResult}
                onChange={e => { setClienteQuery(e.target.value); setAlertCliente(null) }}
                onKeyDown={e => e.key === 'Enter' && buscarCliente()}
                className={clsx(
                  'w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-all',
                  clienteResult ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
                )}
              />
            </div>
            {!clienteResult
              ? <button type="button" onClick={buscarCliente}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                  Buscar
                </button>
              : <button type="button" onClick={clearCliente}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                  <X size={13} /> Cambiar
                </button>
            }
          </div>
          {errors.cliente && <p className="text-[11px] text-red-500 mt-1">{errors.cliente}</p>}
        </Field>

        {alertCliente === 'AL-FO-01' && (
          <AlertError code="AL-FO-01" msg="No se encontró ningún cliente registrado con ese nombre, RUC o código. Verifique los datos o registre el cliente en el módulo Clientes." />
        )}
        {alertCliente === 'AL-FO-02' && (
          <AlertError code="AL-FO-02" msg="El cliente encontrado está asignado a otro trader. Solo puede registrar operaciones para los clientes de su cartera." />
        )}

        {clienteResult && (
          <div className="rounded-lg px-4 py-3 bg-green-50 flex items-start justify-between gap-4" style={{ border: '1px solid #86efac' }}>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-green-800">{clienteResult.nombre}</p>
              <p className="text-[11px] text-green-600">
                RUC / DNI: <strong>{clienteResult.ruc}</strong> · Tipo: <strong>{clienteResult.tipo === 'juridica' ? 'Persona Jurídica' : 'Persona Natural'}</strong>
              </p>
              <p className="text-[11px] text-green-600">
                Trader asignado: <strong>{clienteResult.traderNombre}</strong>
              </p>
            </div>
            <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
          </div>
        )}
      </Section>

      {/* ── 2. OPERACIÓN ── */}
      <Section title="2. Datos de la operación">
        <div className="grid grid-cols-2 gap-4">

          <Field label="Tipo de operación" required>
            <AppSelect
              value={tipoOp}
              onChange={setTipoOp}
              placeholder="Seleccionar…"
              disabled={!clienteResult}
              options={[
                { value: 'compra',  label: <span className="flex items-center gap-1.5"><ArrowDownLeft size={12} className="text-emerald-600" /> Compra (cliente entrega USD)</span> },
                { value: 'venta',   label: <span className="flex items-center gap-1.5"><ArrowUpRight  size={12} className="text-blue-600"    /> Venta (cliente recibe USD)</span>  },
                { value: 'cruzada', label: <span className="flex items-center gap-1.5"><ArrowLeftRight size={12} className="text-purple-600"  /> Cruzada (sin PEN)</span>           },
              ]}
            />
            {errors.tipoOp && <p className="text-[11px] text-red-500 mt-1">{errors.tipoOp}</p>}
          </Field>

          <Field label="Moneda operación" required>
            <AppSelect
              value={moneda}
              onChange={setMoneda}
              disabled={!clienteResult || tipoOp === 'compra' || tipoOp === 'venta'}
              options={[
                { value: 'USD', label: 'USD — Dólar estadounidense' },
                { value: 'EUR', label: 'EUR — Euro'                 },
                { value: 'GBP', label: 'GBP — Libra esterlina'      },
              ]}
            />
          </Field>

          <Field label="Monto" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{moneda}</span>
              <input type="number" min="0" step="0.01" placeholder="0.00"
                value={monto} disabled={!clienteResult}
                onChange={e => { setMonto(e.target.value); setErrors(v => ({ ...v, monto: undefined })) }}
                className={clsx(
                  'w-full pl-12 pr-3 py-2.5 rounded-lg border text-sm text-right outline-none transition-all',
                  !clienteResult ? 'bg-gray-50 cursor-not-allowed border-gray-200'
                    : errors.monto ? 'border-red-400'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                )} />
            </div>
            {errors.monto && <p className="text-[11px] text-red-500 mt-1">{errors.monto}</p>}
          </Field>

          <Field label="Fuente de tipo de cambio">
            <AppSelect
              value={fuenteTC}
              onChange={setFuenteTC}
              disabled={!clienteResult}
              options={[
                { value: 'datatec', label: 'Datatec (referencial automático)' },
                { value: 'manual',  label: 'Manual'                           },
              ]}
            />
          </Field>

          <Field label="TC punta (referencial)" required hint={fuenteTC === 'datatec' ? `Referencia Datatec: compra ${TC_DATATEC.compra} / venta ${TC_DATATEC.venta}` : undefined}>
            <input type="number" step="0.001" placeholder="0.000"
              value={tcPunta} disabled={!clienteResult || fuenteTC === 'datatec'}
              onChange={e => { setTcPunta(e.target.value); setErrors(v => ({ ...v, tcPunta: undefined })) }}
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg border text-sm text-right outline-none font-mono transition-all',
                !clienteResult || fuenteTC === 'datatec' ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
                  : errors.tcPunta ? 'border-red-400'
                  : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              )} />
            {errors.tcPunta && <p className="text-[11px] text-red-500 mt-1">{errors.tcPunta}</p>}
          </Field>

          <Field label="TC pactado con el cliente" required>
            <input type="number" step="0.001" placeholder="0.000"
              value={tcPactado} disabled={!clienteResult}
              onChange={e => { setTcPactado(e.target.value); setErrors(v => ({ ...v, tcPactado: undefined })) }}
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg border text-sm text-right outline-none font-mono transition-all',
                !clienteResult ? 'bg-gray-50 cursor-not-allowed border-gray-200'
                  : errors.tcPactado ? 'border-red-400'
                  : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              )} />
            {errors.tcPactado && <p className="text-[11px] text-red-500 mt-1">{errors.tcPactado}</p>}
          </Field>

        </div>

        {/* Spread y contravalor — readonly */}
        {(spread !== null || montoContravalor !== null) && (
          <div className="grid grid-cols-2 gap-4 pt-1">
            {spread !== null && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
                <span className="text-xs text-gray-500">Spread calculado</span>
                <span className="text-sm font-semibold font-mono text-gray-800">{spread}</span>
              </div>
            )}
            {montoContravalor !== null && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
                <span className="text-xs text-gray-500">Contravalor estimado</span>
                <span className="text-sm font-semibold font-mono text-gray-800">
                  {tipoOp === 'compra' ? 'PEN' : 'USD'} {fmtMoney(montoContravalor)}
                </span>
              </div>
            )}
          </div>
        )}

        {alertSpread && (
          <AlertWarn code="AL-FO-06"
            msg="El TC pactado difiere del TC de referencia en más de 0.01. Verifique con el cliente antes de confirmar." />
        )}
      </Section>

      {/* ── 3. CUENTAS ── */}
      <Section title="3. Cuentas bancarias">
        <div className="grid grid-cols-2 gap-4">

          <Field label="Cuenta destino del cliente" required
            hint="Cuenta donde el cliente recibirá los fondos">
            <AppSelect
              value={cuentaDest}
              onChange={handleCuentaDest}
              placeholder="Seleccionar cuenta…"
              disabled={!clienteResult}
              options={cuentasDestinoOpts}
            />
            {errors.cuentaDest && <p className="text-[11px] text-red-500 mt-1">{errors.cuentaDest}</p>}
          </Field>

          <div /> {/* spacer */}

          <Field label="Cuenta QAPAQ origen (entrega fondos)" required>
            <AppSelect
              value={cuentaQpaqOut}
              onChange={setCuentaQpaqOut}
              placeholder="Seleccionar…"
              disabled={!tipoOp}
              options={qpaqOutOpts}
            />
          </Field>

          <Field label="Cuenta QAPAQ destino (recibe fondos)" required>
            <AppSelect
              value={cuentaQpaqIn}
              onChange={setCuentaQpaqIn}
              placeholder="Seleccionar…"
              disabled={!tipoOp}
              options={qpaqInOpts}
            />
          </Field>

        </div>

        {alertConvenio && (
          <AlertError code="AL-FO-04"
            msg="La cuenta de tercero seleccionada no tiene un convenio de pago vigente. No se puede confirmar la cotización hasta regularizar la situación en la ficha del cliente." />
        )}

        {!clienteResult && (
          <AlertInfo msg="Busque y seleccione un cliente para habilitar las opciones de cuentas bancarias." />
        )}
      </Section>

      {/* ── ACTION BAR ── */}
      <div className="flex items-center gap-3 justify-end pt-1 pb-4">
        <button type="button" onClick={handleBorrador}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          Guardar borrador
        </button>
        <button type="button" onClick={handleConfirmar}
          disabled={alertConvenio}
          className={clsx(
            'px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors',
            alertConvenio
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}>
          Confirmar cotización
        </button>
      </div>

    </div>
  )
}

