import { useState, useRef, useEffect } from 'react'
import {
  Search, Plus, Check, X, Filter, ChevronDown,
  ChevronLeft, ChevronRight, ShieldCheck, Shield,
  AlertTriangle, Eye, MapPin, Users, Ban, CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const MOCK_BANCOS = [
  { value: 'BCP',        label: 'BCP — Banco de Crédito del Perú' },
  { value: 'BBVA',       label: 'BBVA Continental' },
  { value: 'Scotiabank', label: 'Scotiabank Perú' },
  { value: 'Interbank',  label: 'Interbank' },
  { value: 'Pichincha',  label: 'Banco Pichincha' },
  { value: 'GNB',        label: 'Banco GNB Perú' },
  { value: 'BCRP',       label: 'BCRP — Banco Central de Reserva del Perú' },
]

const CLIENTES_ACTIVOS = [
  { value: 'CLI-001', label: 'María González Paredes (CLI-001)',        nombre: 'María González Paredes',        doi: '43210987'    },
  { value: 'CLI-002', label: 'Exportaciones Lima S.A.C. (CLI-002)',     nombre: 'Exportaciones Lima S.A.C.',     doi: '20512345678' },
  { value: 'CLI-003', label: 'Banco Americano del Perú S.A. (CLI-003)', nombre: 'Banco Americano del Perú S.A.', doi: '20123456789' },
  { value: 'CLI-004', label: 'Roberto Sánchez Vidal (CLI-004)',         nombre: 'Roberto Sánchez Vidal',         doi: '38765432'    },
  { value: 'CLI-007', label: 'Minera Andina S.A. (CLI-007)',            nombre: 'Minera Andina S.A.',            doi: '20345678901' },
]

/* Clients that have an active agreement/authorization letter (for third-party account rule) */
const CLIENTES_CON_CONVENIO = new Set(['CLI-002', 'CLI-003'])

const MOCK_CUENTAS = [
  { id: 'CTA-001', clienteId: 'CLI-001', clienteNombre: 'María González Paredes',        banco: 'BCP',        tipoCuenta: 'corriente', moneda: 'USD', numeroCuenta: '19312345678901',   cci: '00219300123456789011', plaza: 'lima',  titularidad: 'propia',  nombreTercero: null,                   convenioId: null,      estado: 'activa',   verificacion: 'verificada', registradoPor: 'Marco Quispe L.', fechaRegistro: '16/01/2026', verificadoPor: 'Ana Torres V.', fechaVerificacion: '18/01/2026' },
  { id: 'CTA-002', clienteId: 'CLI-001', clienteNombre: 'María González Paredes',        banco: 'BBVA',       tipoCuenta: 'ahorros',   moneda: 'PEN', numeroCuenta: '0011234567890123',  cci: '01110001123456789012', plaza: 'lima',  titularidad: 'propia',  nombreTercero: null,                   convenioId: null,      estado: 'activa',   verificacion: 'pendiente',  registradoPor: 'Marco Quispe L.', fechaRegistro: '20/01/2026', verificadoPor: null,            fechaVerificacion: null },
  { id: 'CTA-003', clienteId: 'CLI-002', clienteNombre: 'Exportaciones Lima S.A.C.',     banco: 'Scotiabank', tipoCuenta: 'corriente', moneda: 'USD', numeroCuenta: '0000123456789',     cci: null,                  plaza: 'lima',  titularidad: 'propia',  nombreTercero: null,                   convenioId: null,      estado: 'activa',   verificacion: 'verificada', registradoPor: 'Marco Quispe L.', fechaRegistro: '21/01/2026', verificadoPor: 'Ana Torres V.', fechaVerificacion: '23/01/2026' },
  { id: 'CTA-004', clienteId: 'CLI-002', clienteNombre: 'Exportaciones Lima S.A.C.',     banco: 'BCP',        tipoCuenta: 'corriente', moneda: 'PEN', numeroCuenta: '19387654321098',   cci: '00219300876543210981', plaza: 'lima',  titularidad: 'tercero', nombreTercero: 'Proveedor Logístico SAC', convenioId: 'CONV-001', estado: 'activa',   verificacion: 'pendiente',  registradoPor: 'Marco Quispe L.', fechaRegistro: '22/01/2026', verificadoPor: null,            fechaVerificacion: null },
  { id: 'CTA-005', clienteId: 'CLI-003', clienteNombre: 'Banco Americano del Perú S.A.', banco: 'Interbank',  tipoCuenta: 'corriente', moneda: 'USD', numeroCuenta: '2000012345678',     cci: null,                  plaza: 'lima',  titularidad: 'propia',  nombreTercero: null,                   convenioId: null,      estado: 'activa',   verificacion: 'verificada', registradoPor: 'Marco Quispe L.', fechaRegistro: '06/02/2026', verificadoPor: 'Ana Torres V.', fechaVerificacion: '08/02/2026' },
  { id: 'CTA-006', clienteId: 'CLI-004', clienteNombre: 'Roberto Sánchez Vidal',         banco: 'BCP',        tipoCuenta: 'ahorros',   moneda: 'PEN', numeroCuenta: '19365432109876',   cci: null,                  plaza: 'lima',  titularidad: 'propia',  nombreTercero: null,                   convenioId: null,      estado: 'inactiva', verificacion: 'verificada', registradoPor: 'Marco Quispe L.', fechaRegistro: '02/03/2026', verificadoPor: 'Ana Torres V.', fechaVerificacion: '04/03/2026' },
  { id: 'CTA-007', clienteId: 'CLI-007', clienteNombre: 'Minera Andina S.A.',            banco: 'BBVA',       tipoCuenta: 'corriente', moneda: 'USD', numeroCuenta: '0019876543210123', cci: '01100011987654321012', plaza: 'otra',  titularidad: 'propia',  nombreTercero: null,                   convenioId: null,      estado: 'activa',   verificacion: 'pendiente',  registradoPor: 'Marco Quispe L.', fechaRegistro: '26/02/2026', verificadoPor: null,            fechaVerificacion: null },
]

/* ═══════════════════════════════════════════════
   BANCO META — colores e iniciales de cada banco
═══════════════════════════════════════════════ */
const BANK_META = {
  BCP:        { abbr: 'BCP',  bg: '#EB0A1E', color: '#fff' },
  BBVA:       { abbr: 'BBVA', bg: '#004481', color: '#fff' },
  Scotiabank: { abbr: 'SCO',  bg: '#C8102E', color: '#fff' },
  Interbank:  { abbr: 'IB',   bg: '#00A651', color: '#fff' },
  Pichincha:  { abbr: 'PCH',  bg: '#F7A800', color: '#fff' },
  GNB:        { abbr: 'GNB',  bg: '#1A1F6C', color: '#fff' },
  BCRP:       { abbr: 'BCR',  bg: '#1A365D', color: '#fff' },
}

function BankBadge({ banco, size = 'sm' }) {
  const meta = BANK_META[banco] ?? { abbr: (banco ?? '?').slice(0, 3).toUpperCase(), bg: '#9ca3af', color: '#fff' }
  const cls  = size === 'sm' ? 'w-7 h-7 text-[9px]' : 'w-8 h-8 text-[10px]'
  return (
    <div className={clsx('rounded-md flex items-center justify-center font-bold shrink-0 leading-none', cls)}
      style={{ background: meta.bg, color: meta.color }}>
      {meta.abbr}
    </div>
  )
}

/* Normaliza para búsqueda sin acentos ni mayúsculas */
function normalize(str) {
  return (str ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const VERIFICACION_STYLE = {
  verificada: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Verificada',       Icon: ShieldCheck },
  pendiente:  { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Pend. verificación', Icon: Shield     },
}

const ESTADO_CTA_STYLE = {
  activa:   { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Activa'   },
  inactiva: { bg: 'bg-gray-100', text: 'text-gray-500',  dot: 'bg-gray-400',  label: 'Inactiva' },
}

const MONEDA_STYLE = {
  USD: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  PEN: { bg: 'bg-blue-50',   text: 'text-blue-700'    },
}

/* ═══════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════ */
function FilterSelect({ value, onChange, options, placeholder, className = 'w-44' }) {
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
    <div className={clsx('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs text-left transition-all w-full',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300'
        )}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}
      >
        <span className={clsx('flex-1 truncate', selected ? 'text-gray-700' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={11} className={clsx('text-gray-400 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 min-w-max"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
        >
          {options.map(o => (
            <button
              key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3 py-2 text-xs transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {o.label}
              {o.value === value && <Check size={11} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DrawerSelect({ value, onChange, options, placeholder, error }) {
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
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all bg-white',
          error
            ? 'border-red-400 focus:ring-2 focus:ring-red-100'
            : open
              ? 'border-blue-400 ring-2 ring-blue-100'
              : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <span className={clsx('flex-1 truncate text-sm', selected ? 'text-gray-900' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} className={clsx('text-gray-400 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-50 py-1 overflow-auto"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', maxHeight: 220 }}
        >
          {options.map(o => (
            <button
              key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {o.label}
              {o.value === value && <Check size={12} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* Select con búsqueda — sin acentos, sin distinción de mayúsculas */
function SearchableSelect({ value, onChange, options, placeholder, error, renderSelected, renderOption }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const ref      = useRef(null)
  const selected = options.find(o => o.value === value)

  const filtered = query.trim()
    ? options.filter(o => normalize(o.label).includes(normalize(query)) || normalize(o.value).includes(normalize(query)))
    : options

  useEffect(() => {
    if (!open) return
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function handleOpen() {
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  function handleSelect(val) {
    onChange(val)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={handleOpen}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all bg-white',
          error ? 'border-red-400' : open ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
        )}>
        {selected
          ? (renderSelected
              ? <>{renderSelected(selected)}</>
              : <span className="flex-1 truncate text-sm text-gray-900">{selected.label}</span>)
          : <span className="flex-1 truncate text-sm text-gray-400">{placeholder}</span>
        }
        <ChevronDown size={13} className={clsx('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-50 overflow-hidden"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <Search size={12} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
            {query && (
              <button onMouseDown={e => { e.preventDefault(); setQuery('') }}
                className="text-gray-300 hover:text-gray-500 transition-colors">
                <X size={11} />
              </button>
            )}
          </div>
          <div className="py-1 overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-gray-400 text-center">Sin resultados</p>
            ) : filtered.map(o => (
              <button key={o.value} type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(o.value) }}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                  o.value === value ? 'bg-blue-50' : 'hover:bg-gray-50'
                )}>
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {renderOption
                    ? <>{renderOption(o)}</>
                    : (
                      <div className="min-w-0">
                        <p className={clsx('text-sm truncate', o.value === value ? 'text-blue-700 font-medium' : 'text-gray-800')}>{o.label}</p>
                        {o.sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{o.sub}</p>}
                      </div>
                    )
                  }
                </div>
                {o.value === value && <Check size={12} className="text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = err => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white',
  err
    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

function ToggleGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button
          key={o.value} type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            'flex-1 py-2 rounded-lg text-xs font-medium border transition-colors',
            value === o.value
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function PageBtn({ onClick, disabled, active, children }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={clsx('w-7 h-7 flex items-center justify-center rounded text-xs transition-all',
        active   ? 'bg-blue-600 text-white font-semibold' :
        disabled ? 'text-gray-300 cursor-not-allowed' :
                   'text-gray-500 hover:bg-gray-100'
      )}
    >
      {children}
    </button>
  )
}

/* ═══════════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════════ */
function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onCancel} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-80"
        style={{ border: '1px solid var(--color-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}
      >
        <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
        <p className="text-xs text-gray-500 mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors', confirmClass)}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   CUENTA DRAWER
═══════════════════════════════════════════════ */
const EMPTY_FORM = {
  clienteId:    '',
  banco:        '',
  tipoCuenta:   'corriente',
  moneda:       'USD',
  numeroCuenta: '',
  cci:          '',
  plaza:        'lima',
  titularidad:  'propia',
  nombreTercero: '',
  estado:       'activa',
}

function CuentaDrawer({ open, cuenta, cuentas, onClose, onSave, fixedClienteId }) {
  const [form, setForm]           = useState(EMPTY_FORM)
  const [errors, setErrors]       = useState({})
  const [alertConvenio, setAlertConvenio] = useState(false)
  const isEdit = !!cuenta

  useEffect(() => {
    if (open) {
      setForm(cuenta ? {
        clienteId:     cuenta.clienteId,
        banco:         cuenta.banco,
        tipoCuenta:    cuenta.tipoCuenta,
        moneda:        cuenta.moneda,
        numeroCuenta:  cuenta.numeroCuenta,
        cci:           cuenta.cci ?? '',
        plaza:         cuenta.plaza,
        titularidad:   cuenta.titularidad,
        nombreTercero: cuenta.nombreTercero ?? '',
        estado:        cuenta.estado,
      } : { ...EMPTY_FORM, clienteId: fixedClienteId || '' })
      setErrors({})
      setAlertConvenio(false)
    }
  }, [open, cuenta])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
    if (field === 'titularidad' && value === 'propia') setAlertConvenio(false)
  }

  function validate() {
    const e = {}
    if (!form.clienteId)           e.clienteId = 'Selecciona el cliente.'
    if (!form.banco)               e.banco = 'Selecciona el banco.'
    if (!form.numeroCuenta.trim()) e.numeroCuenta = 'El número de cuenta es obligatorio.'
    else {
      const dup = cuentas.find(c =>
        c.clienteId === form.clienteId &&
        c.banco === form.banco &&
        c.moneda === form.moneda &&
        c.numeroCuenta === form.numeroCuenta.trim() &&
        (!isEdit || c.id !== cuenta.id)
      )
      if (dup) e.numeroCuenta = 'Ya existe una cuenta con ese número para este cliente, banco y moneda.'
    }
    if (form.titularidad === 'tercero') {
      if (!form.nombreTercero.trim()) e.nombreTercero = 'El nombre del titular tercero es obligatorio.'
      if (!CLIENTES_CON_CONVENIO.has(form.clienteId)) {
        setErrors(e)
        setAlertConvenio(true)
        return false
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    setAlertConvenio(false)
    if (!validate()) return
    onSave(form)
  }

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{
          width: 480,
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {isEdit ? 'Editar cuenta bancaria' : 'Nueva cuenta bancaria'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit
                ? `ID: ${cuenta.id} — los cambios quedan registrados con tu usuario.`
                : 'La cuenta quedará pendiente de verificación por Back Office.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* AL-GC-03 alert */}
          {alertConvenio && (
            <div className="flex gap-3 p-3 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
              <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">AL-GC-03 — Convenio requerido</p>
                <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">
                  Para registrar una cuenta de tercero, el cliente debe tener un convenio o carta de autorización vigente. Registre el documento en la sección de Documentación antes de continuar.
                </p>
              </div>
            </div>
          )}

          {!fixedClienteId && (
            <Field label="Cliente" required error={errors.clienteId}>
              <SearchableSelect
                value={form.clienteId}
                onChange={v => set('clienteId', v)}
                options={CLIENTES_ACTIVOS}
                placeholder="Buscar cliente..."
                error={errors.clienteId}
              />
            </Field>
          )}

          <Field label="Banco" required error={errors.banco}>
            <SearchableSelect
              value={form.banco}
              onChange={v => set('banco', v)}
              options={MOCK_BANCOS}
              placeholder="Buscar banco..."
              error={errors.banco}
              renderSelected={o => (
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  <BankBadge banco={o.value} size="sm" />
                  <span className="text-sm text-gray-900 truncate">{o.label}</span>
                </span>
              )}
              renderOption={o => (
                <span className="flex items-center gap-2.5 flex-1 min-w-0">
                  <BankBadge banco={o.value} size="sm" />
                  <span className="text-sm text-gray-800 truncate">{o.label}</span>
                </span>
              )}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo de cuenta" required>
              <ToggleGroup
                value={form.tipoCuenta}
                onChange={v => set('tipoCuenta', v)}
                options={[{ value: 'corriente', label: 'Corriente' }, { value: 'ahorros', label: 'Ahorros' }]}
              />
            </Field>
            <Field label="Moneda" required>
              <ToggleGroup
                value={form.moneda}
                onChange={v => set('moneda', v)}
                options={[{ value: 'USD', label: 'USD' }, { value: 'PEN', label: 'PEN' }]}
              />
            </Field>
          </div>

          <Field label="Número de cuenta" required error={errors.numeroCuenta}>
            <input
              type="text" placeholder="Ej. 19312345678901"
              value={form.numeroCuenta}
              onChange={e => set('numeroCuenta', e.target.value)}
              className={inputCls(errors.numeroCuenta)}
            />
          </Field>

          <Field
            label="CCI — Código de Cuenta Interbancario"
            hint="Opcional. Requerido para operaciones interbancarias (plaza distinta a Lima)."
          >
            <input
              type="text" placeholder="Ej. 00219300123456789011"
              value={form.cci}
              onChange={e => set('cci', e.target.value)}
              className={inputCls(false)}
            />
          </Field>

          <Field label="Plaza" required>
            <ToggleGroup
              value={form.plaza}
              onChange={v => set('plaza', v)}
              options={[{ value: 'lima', label: 'Lima' }, { value: 'otra', label: 'Otra plaza' }]}
            />
            {form.plaza === 'otra' && (
              <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertTriangle size={11} /> Puede generar comisiones interbancarias en la operación.
              </p>
            )}
          </Field>

          <Field label="Titularidad" required>
            <ToggleGroup
              value={form.titularidad}
              onChange={v => set('titularidad', v)}
              options={[{ value: 'propia', label: 'Cuenta propia' }, { value: 'tercero', label: 'Cuenta de tercero' }]}
            />
          </Field>

          {form.titularidad === 'tercero' && (
            <Field label="Nombre del titular (tercero)" required error={errors.nombreTercero}
              hint="Se requiere convenio o carta de autorización vigente vinculada al cliente.">
              <input
                type="text" placeholder="Ej. Empresa Proveedora SAC"
                value={form.nombreTercero}
                onChange={e => set('nombreTercero', e.target.value)}
                className={inputCls(errors.nombreTercero)}
              />
            </Field>
          )}

          <Field label="Estado inicial">
            <ToggleGroup
              value={form.estado}
              onChange={v => set('estado', v)}
              options={[{ value: 'activa', label: 'Activa' }, { value: 'inactiva', label: 'Inactiva' }]}
            />
          </Field>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            <Check size={14} />
            {isEdit ? 'Guardar cambios' : 'Registrar cuenta'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   MAIN TAB
═══════════════════════════════════════════════ */
const PAGE_SIZE = 7

const CONFIRM_CONFIG = {
  verify: {
    title: '¿Verificar esta cuenta?',
    message: 'Al verificar, la cuenta quedará habilitada para operaciones de liquidación FX. Esta acción queda registrada con tu usuario y fecha.',
    confirmLabel: 'Sí, verificar',
    confirmClass: 'bg-green-600 hover:bg-green-700',
  },
  inactivar: {
    title: '¿Inactivar esta cuenta?',
    message: 'La cuenta dejará de estar disponible para nuevas operaciones. El historial operativo asociado se mantiene intacto.',
    confirmLabel: 'Sí, inactivar',
    confirmClass: 'bg-gray-700 hover:bg-gray-800',
  },
  activar: {
    title: '¿Activar esta cuenta?',
    message: 'La cuenta estará nuevamente disponible para operaciones de liquidación FX.',
    confirmLabel: 'Sí, activar',
    confirmClass: 'bg-blue-600 hover:bg-blue-700',
  },
}

export default function CuentasBancariasTab({ clienteId, clienteNombre }) {
  const [cuentas,        setCuentas]        = useState(MOCK_CUENTAS)
  const [search,         setSearch]         = useState('')
  const [filterCliente,  setFilterCliente]  = useState('')
  const [filterBanco,    setFilterBanco]    = useState('')
  const [filterMoneda,   setFilterMoneda]   = useState('')
  const [filterEstado,   setFilterEstado]   = useState('')
  const [filterVerif,    setFilterVerif]    = useState('')
  const [page,           setPage]           = useState(1)
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [editingCuenta,  setEditingCuenta]  = useState(null)
  const [confirmAction,  setConfirmAction]  = useState(null)

  const scope = clienteId ? cuentas.filter(c => c.clienteId === clienteId) : cuentas
  const stats = {
    total:       scope.length,
    verificadas: scope.filter(c => c.verificacion === 'verificada').length,
    pendientes:  scope.filter(c => c.verificacion === 'pendiente').length,
    inactivas:   scope.filter(c => c.estado === 'inactiva').length,
  }

  const q = search.trim().toLowerCase()
  const filtered = cuentas.filter(c => {
    if (clienteId && c.clienteId !== clienteId) return false
    if (q) {
      const doi = CLIENTES_ACTIVOS.find(cl => cl.value === c.clienteId)?.doi ?? ''
      if (!c.clienteNombre.toLowerCase().includes(q) && !c.numeroCuenta.includes(q) &&
          !c.id.toLowerCase().includes(q) && !c.banco.toLowerCase().includes(q) &&
          !doi.includes(q)) return false
    }
    if (filterCliente && c.clienteId    !== filterCliente) return false
    if (filterBanco   && c.banco        !== filterBanco)   return false
    if (filterMoneda  && c.moneda       !== filterMoneda)  return false
    if (filterEstado  && c.estado       !== filterEstado)  return false
    if (filterVerif   && c.verificacion !== filterVerif)   return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function resetPage() { setPage(1) }
  const applySearch   = v => { setSearch(v);         resetPage() }
  const applyCliente  = v => { setFilterCliente(v);  resetPage() }
  const applyBanco    = v => { setFilterBanco(v);    resetPage() }
  const applyMoneda   = v => { setFilterMoneda(v);   resetPage() }
  const applyEstado   = v => { setFilterEstado(v);   resetPage() }
  const applyVerif    = v => { setFilterVerif(v);    resetPage() }

  const activeFilters = (clienteId ? [] : [filterCliente]).concat([filterBanco, filterMoneda, filterEstado, filterVerif]).filter(Boolean).length
  function clearFilters() {
    setFilterCliente(''); setFilterBanco(''); setFilterMoneda('')
    setFilterEstado(''); setFilterVerif(''); resetPage()
  }

  function openCreate() { setEditingCuenta(null); setDrawerOpen(true) }
  function openEdit(c)  { setEditingCuenta(c);    setDrawerOpen(true) }

  function handleSave(form) {
    if (editingCuenta) {
      const eraVerificada = editingCuenta.verificacion === 'verificada'
      setCuentas(cs => cs.map(c => c.id === editingCuenta.id
        ? { ...c, banco: form.banco, tipoCuenta: form.tipoCuenta, moneda: form.moneda,
            numeroCuenta: form.numeroCuenta, cci: form.cci || null,
            plaza: form.plaza, titularidad: form.titularidad,
            nombreTercero: form.titularidad === 'tercero' ? form.nombreTercero : null,
            estado: form.estado,
            ...(eraVerificada && { verificacion: 'pendiente', verificadoPor: null, fechaVerificacion: null }) }
        : c
      ))
    } else {
      const clienteData = CLIENTES_ACTIVOS.find(c => c.value === form.clienteId)
      const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      setCuentas(cs => [...cs, {
        id:            `CTA-${String(cs.length + 1).padStart(3, '0')}`,
        clienteId:     form.clienteId,
        clienteNombre: clienteData?.nombre ?? '',
        banco:         form.banco,
        tipoCuenta:    form.tipoCuenta,
        moneda:        form.moneda,
        numeroCuenta:  form.numeroCuenta,
        cci:           form.cci || null,
        plaza:         form.plaza,
        titularidad:   form.titularidad,
        nombreTercero: form.titularidad === 'tercero' ? form.nombreTercero : null,
        convenioId:    form.titularidad === 'tercero' ? 'CONV-AUTO' : null,
        estado:        form.estado,
        verificacion:  'pendiente',
        registradoPor: 'Marco Quispe L.',
        fechaRegistro: today,
        verificadoPor: null,
        fechaVerificacion: null,
      }])
    }
    setDrawerOpen(false)
  }

  function executeConfirm() {
    const { type, cuenta } = confirmAction
    const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    if (type === 'verify') {
      setCuentas(cs => cs.map(c => c.id === cuenta.id
        ? { ...c, verificacion: 'verificada', verificadoPor: 'Ana Torres V.', fechaVerificacion: today }
        : c
      ))
    } else {
      const newEstado = type === 'inactivar' ? 'inactiva' : 'activa'
      setCuentas(cs => cs.map(c => c.id === cuenta.id ? { ...c, estado: newEstado } : c))
    }
    setConfirmAction(null)
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total cuentas',      value: stats.total,       color: 'text-gray-900'  },
          { label: 'Verificadas',        value: stats.verificadas, color: 'text-green-600' },
          { label: 'Pend. verificación', value: stats.pendientes,  color: 'text-amber-600' },
          { label: 'Inactivas',          value: stats.inactivas,   color: 'text-gray-400'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-end mb-3">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={14} /> Nueva cuenta
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-2 mb-3 flex-wrap">

        {!clienteId && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-400 pl-1">Cliente</label>
            <FilterSelect
              value={filterCliente} onChange={applyCliente} className="w-52"
              placeholder="Todos los clientes"
              options={[{ value: '', label: 'Todos los clientes' }, ...CLIENTES_ACTIVOS]}
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Banco</label>
          <FilterSelect
            value={filterBanco} onChange={applyBanco} className="w-36"
            placeholder="Todos"
            options={[{ value: '', label: 'Todos' }, ...MOCK_BANCOS.map(b => ({ value: b.value, label: b.value }))]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Moneda</label>
          <FilterSelect
            value={filterMoneda} onChange={applyMoneda} className="w-28"
            placeholder="Todas"
            options={[{ value: '', label: 'Todas' }, { value: 'USD', label: 'USD' }, { value: 'PEN', label: 'PEN' }]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Estado</label>
          <FilterSelect
            value={filterEstado} onChange={applyEstado} className="w-32"
            placeholder="Todos"
            options={[{ value: '', label: 'Todos' }, { value: 'activa', label: 'Activa' }, { value: 'inactiva', label: 'Inactiva' }]}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Verificación</label>
          <FilterSelect
            value={filterVerif} onChange={applyVerif} className="w-44"
            placeholder="Todas"
            options={[{ value: '', label: 'Todas' }, { value: 'verificada', label: 'Verificada' }, { value: 'pendiente', label: 'Pend. verificación' }]}
          />
        </div>

        {activeFilters > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-transparent">–</label>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Filter size={11} /> Limpiar ({activeFilters})
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1 ml-auto">
          <label className="text-[11px] text-transparent">–</label>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white w-60 transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text" placeholder="Buscar cliente, N° cuenta..."
              value={search} onChange={e => applySearch(e.target.value)}
              className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full"
            />
            {search && (
              <button onClick={() => applySearch('')} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {(clienteId
                ? ['Código', 'Banco / Tipo', 'Moneda', 'N° Cuenta', 'Plaza', 'Titularidad', 'Estado', 'Verificación', '']
                : ['Código', 'Cliente', 'Banco / Tipo', 'Moneda', 'N° Cuenta', 'Plaza', 'Titularidad', 'Estado', 'Verificación', '']
              ).map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
                  No se encontraron cuentas con esos criterios
                </td>
              </tr>
            ) : (
              paginated.map(c => (
                <CuentaRow
                  key={c.id} cuenta={c}
                  showCliente={!clienteId}
                  onVerify={c => setConfirmAction({ type: 'verify',    cuenta: c })}
                  onToggleEstado={c => setConfirmAction({ type: c.estado === 'activa' ? 'inactivar' : 'activar', cuenta: c })}
                  onEdit={openEdit}
                />
              ))
            )}
          </tbody>
        </table>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400">
              Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length} cuentas
            </p>
            <div className="flex items-center gap-1">
              <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}><ChevronLeft size={14} /></PageBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <PageBtn key={n} active={n === safePage} onClick={() => setPage(n)}>{n}</PageBtn>
              ))}
              <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><ChevronRight size={14} /></PageBtn>
            </div>
          </div>
        )}
      </div>

      <CuentaDrawer
        open={drawerOpen}
        cuenta={editingCuenta}
        cuentas={cuentas}
        fixedClienteId={clienteId}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />

      {confirmAction && (
        <ConfirmModal
          open
          {...CONFIRM_CONFIG[confirmAction.type]}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════
   CUENTA ROW
═══════════════════════════════════════════════ */
function CuentaRow({ cuenta: c, showCliente = true, onVerify, onToggleEstado, onEdit }) {
  const vs = VERIFICACION_STYLE[c.verificacion]
  const es = ESTADO_CTA_STYLE[c.estado]
  const ms = MONEDA_STYLE[c.moneda] ?? MONEDA_STYLE.USD

  return (
    <tr
      className="group border-b last:border-0 hover:bg-gray-50/60 transition-colors"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-semibold text-gray-500">{c.id}</span>
      </td>
      {showCliente && (
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{c.clienteNombre}</p>
          <p className="text-[11px] text-gray-400">{c.clienteId}</p>
        </td>
      )}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <BankBadge banco={c.banco} size="sm" />
          <div>
            <p className="text-sm text-gray-700">{c.banco}</p>
            <p className="text-[11px] text-gray-400 capitalize">{c.tipoCuenta}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={clsx('inline-block px-2 py-0.5 rounded text-[11px] font-semibold', ms.bg, ms.text)}>
          {c.moneda}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-700 font-mono">{c.numeroCuenta}</p>
        {c.cci && <p className="text-[10px] text-gray-400 font-mono">{c.cci}</p>}
      </td>
      <td className="px-4 py-3">
        {c.plaza === 'lima' ? (
          <span className="text-xs text-gray-500">Lima</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
            <MapPin size={10} /> Otra
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {c.titularidad === 'propia' ? (
          <span className="text-xs text-gray-500">Propia</span>
        ) : (
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] text-violet-600 font-medium">
              <Users size={10} /> Tercero
            </span>
            {c.nombreTercero && (
              <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[100px]">{c.nombreTercero}</p>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', es.bg, es.text)}>
          <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', es.dot)} />{es.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', vs.bg, vs.text)}>
          <vs.Icon size={11} />{vs.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {c.verificacion === 'pendiente' && (
            <button
              title="Marcar como verificada"
              onClick={() => onVerify(c)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <ShieldCheck size={14} />
            </button>
          )}
          <button
            title={c.estado === 'activa' ? 'Inactivar cuenta' : 'Activar cuenta'}
            onClick={() => onToggleEstado(c)}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              c.estado === 'activa'
                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            )}
          >
            {c.estado === 'activa' ? <Ban size={14} /> : <CheckCircle2 size={14} />}
          </button>
          <button
            title="Ver / editar"
            onClick={() => onEdit(c)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}
