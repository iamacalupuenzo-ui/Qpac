import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown, Check, X, AlertTriangle, Search,
  Plus, RefreshCw, Shield, Eye, Filter,
  User, Building2, Briefcase, UserCheck,
} from 'lucide-react'
import clsx from 'clsx'

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const MOCK_HEADS = [
  { id: 'HEAD-001', nombre: 'Ing. Fernando Torres', mesa: 'Mesa Alpha' },
  { id: 'HEAD-002', nombre: 'Dra. Patricia Llave',  mesa: 'Mesa Beta'  },
]

const MOCK_TRADERS = [
  { id: 'TRD-001', nombre: 'Andrés Valdivia C.',  headId: 'HEAD-001' },
  { id: 'TRD-002', nombre: 'Karla Mendoza R.',    headId: 'HEAD-001' },
  { id: 'TRD-003', nombre: 'Rodrigo Paredes F.',  headId: 'HEAD-001' },
  { id: 'TRD-004', nombre: 'Sofía Ríos M.',       headId: 'HEAD-002' },
  { id: 'TRD-005', nombre: 'César Huanca P.',     headId: 'HEAD-002' },
]

const MOCK_CLIENTES = [
  { id: 'CLI-001', nombre: 'María González Paredes',        tipo: 'PN',  estado: 'activo'          },
  { id: 'CLI-002', nombre: 'Exportaciones Lima S.A.C.',     tipo: 'PJ',  estado: 'activo'          },
  { id: 'CLI-003', nombre: 'Banco Americano del Perú S.A.', tipo: 'EF',  estado: 'activo'          },
  { id: 'CLI-004', nombre: 'Roberto Sánchez Vidal',         tipo: 'P10', estado: 'activo_proceso'  },
  { id: 'CLI-005', nombre: 'Inversiones Pacífico S.R.L.',   tipo: 'PJ',  estado: 'pendiente_legal' },
  { id: 'CLI-006', nombre: 'Carmen Rivas Huanca',           tipo: 'PN',  estado: 'no_habilitado'   },
  { id: 'CLI-007', nombre: 'Minera Andina S.A.',            tipo: 'PJ',  estado: 'activo'          },
  { id: 'CLI-008', nombre: 'James Wilson Carter',           tipo: 'PN',  estado: 'activo'          },
]

const ASIG_INIT = {
  'CLI-002': { traderPrincipalId: 'TRD-001', tradersBackup: ['TRD-002'], fecha: '15/01/2026', registradoPor: 'Marco Quispe L.' },
  'CLI-003': { traderPrincipalId: 'TRD-004', tradersBackup: [],          fecha: '03/02/2026', registradoPor: 'Marco Quispe L.' },
  'CLI-007': { traderPrincipalId: 'TRD-001', tradersBackup: [],          fecha: '25/02/2026', registradoPor: 'Marco Quispe L.' },
  'CLI-008': { traderPrincipalId: 'TRD-004', tradersBackup: ['TRD-005'], fecha: '08/03/2026', registradoPor: 'Marco Quispe L.' },
  'CLI-001': { traderPrincipalId: 'TRD-002', tradersBackup: [],          fecha: '18/01/2026', registradoPor: 'Marco Quispe L.' },
}

const HIST_GLOBAL_INIT = {
  'CLI-001': [
    { id: 'H-001', traderPrincipalId: 'TRD-002', tradersBackup: [], fechaDesde: '18/01/2026', fechaHasta: null, motivo: 'Asignación inicial.' },
  ],
  'CLI-002': [
    { id: 'H-001', traderPrincipalId: 'TRD-003', tradersBackup: [], fechaDesde: '10/01/2026', fechaHasta: '15/01/2026', motivo: 'Asignación inicial.' },
    { id: 'H-002', traderPrincipalId: 'TRD-001', tradersBackup: ['TRD-002'], fechaDesde: '15/01/2026', fechaHasta: null, motivo: 'Reasignación por reorganización de cartera.' },
  ],
  'CLI-003': [
    { id: 'H-001', traderPrincipalId: 'TRD-004', tradersBackup: [], fechaDesde: '03/02/2026', fechaHasta: null, motivo: 'Asignación inicial.' },
  ],
  'CLI-007': [
    { id: 'H-001', traderPrincipalId: 'TRD-001', tradersBackup: [], fechaDesde: '25/02/2026', fechaHasta: null, motivo: 'Asignación inicial.' },
  ],
  'CLI-008': [
    { id: 'H-001', traderPrincipalId: 'TRD-004', tradersBackup: ['TRD-005'], fechaDesde: '08/03/2026', fechaHasta: null, motivo: 'Asignación inicial.' },
  ],
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const getTrader  = id => MOCK_TRADERS.find(t => t.id === id)
const getHead    = id => MOCK_HEADS.find(h => h.id === id)

function todayDisplay() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

const TIPO_META = {
  PN:  { Icon: User,      bg: 'bg-slate-100',  text: 'text-slate-700'  },
  P10: { Icon: Briefcase, bg: 'bg-sky-100',    text: 'text-sky-700'    },
  PJ:  { Icon: Building2, bg: 'bg-indigo-100', text: 'text-indigo-700' },
  EF:  { Icon: Shield,    bg: 'bg-violet-100', text: 'text-violet-700' },
}

const ESTADO_META = {
  activo:          { dot: 'bg-green-500',  label: 'Activo',           bg: 'bg-green-50',  text: 'text-green-700'  },
  activo_proceso:  { dot: 'bg-amber-400',  label: 'En proceso',       bg: 'bg-amber-50',  text: 'text-amber-700'  },
  pendiente_legal: { dot: 'bg-blue-500',   label: 'Pend. aprobación', bg: 'bg-blue-50',   text: 'text-blue-700'   },
  no_habilitado:   { dot: 'bg-red-400',    label: 'No habilitado',    bg: 'bg-red-50',    text: 'text-red-700'    },
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function normalize(str) {
  return (str ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/* ═══════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════ */

/* Select con búsqueda integrada */
function SearchableSelect({ value, onChange, options, placeholder, error }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const ref      = useRef(null)
  const selected = options.find(o => o.value === value)

  const filtered = query.trim()
    ? options.filter(o => normalize(o.label).includes(normalize(query)) || normalize(o.sub ?? '').includes(normalize(query)))
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
        <span className={clsx('flex-1 truncate text-sm', selected ? 'text-gray-900' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
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
          <div className="py-1 overflow-y-auto" style={{ maxHeight: 216 }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-gray-400 text-center">Sin resultados</p>
            ) : filtered.map(o => (
              <button key={o.value} type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(o.value) }}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                  o.value === value ? 'bg-blue-50' : 'hover:bg-gray-50'
                )}>
                <div className="min-w-0">
                  <p className={clsx('text-sm truncate', o.value === value ? 'text-blue-700 font-medium' : 'text-gray-800')}>{o.label}</p>
                  {o.sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{o.sub}</p>}
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

/* Dropdown para agregar traders de respaldo adicionales */
const MAX_BACKUPS = 5

function AddBackupDropdown({ options, onAdd }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const ref      = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function handleOpen() {
    setOpen(v => !v)
    setQuery('')
    if (!open) setTimeout(() => inputRef.current?.focus(), 30)
  }

  const filtered = query.trim()
    ? options.filter(o => normalize(o.label).includes(normalize(query)) || normalize(o.sub ?? '').includes(normalize(query)))
    : options

  if (options.length === 0) {
    return <p className="text-xs text-gray-400 italic">No hay más traders disponibles para agregar.</p>
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button type="button" onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg">
        <Plus size={11} /> Agregar trader adicional
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg z-50 overflow-hidden"
          style={{ minWidth: 280, border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <Search size={12} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar trader..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
            {query && (
              <button onMouseDown={e => { e.preventDefault(); setQuery('') }}
                className="text-gray-300 hover:text-gray-500 transition-colors">
                <X size={11} />
              </button>
            )}
          </div>
          <div className="py-1 overflow-y-auto" style={{ maxHeight: 200 }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400 text-center">Sin resultados</p>
            ) : filtered.map(o => (
              <button key={o.value} type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  onAdd(o.value)
                  setQuery('')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left">
                <UserCheck size={12} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">{o.label}</p>
                  {o.sub && <p className="text-[11px] text-gray-400">{o.sub}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
      <button type="button" onClick={() => setOpen(v => !v)}
        className={clsx(
          'flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs text-left transition-all w-full',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300'
        )}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}>
        <span className={clsx('flex-1 truncate', selected ? 'text-gray-700' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={11} className={clsx('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 min-w-max"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3 py-2 text-xs transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              )}>
              {o.label}
              {o.value === value && <Check size={11} className="text-blue-600 shrink-0" />}
            </button>
          ))}
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
      {hint  && !error && <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const textareaCls = err => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white resize-none',
  err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

/* ═══════════════════════════════════════════════
   ASIGNACIÓN DRAWER (desde vista global)
═══════════════════════════════════════════════ */
function AsignacionDrawer({ open, onClose, onSave, cliente, asignacionActual }) {
  const esReasignacion = asignacionActual !== null
  const [traderPrincipalId, setTraderPrincipalId] = useState('')
  const [tradersBackup,     setTradersBackup]     = useState([])
  const [motivo,            setMotivo]            = useState('')
  const [errors,            setErrors]            = useState({})

  useEffect(() => {
    if (open) { setTraderPrincipalId(''); setTradersBackup([]); setMotivo(''); setErrors({}) }
  }, [open])

  const traderPrincipalOpts = MOCK_TRADERS.map(t => {
    const h = getHead(t.headId)
    return { value: t.id, label: t.nombre, sub: h?.mesa ?? '' }
  })

  const backupAddOpts = MOCK_TRADERS
    .filter(t => t.id !== traderPrincipalId && !tradersBackup.includes(t.id))
    .map(t => {
      const h = getHead(t.headId)
      return { value: t.id, label: t.nombre, sub: h?.mesa ?? '' }
    })

  function addBackup(id) {
    setTradersBackup(prev => prev.includes(id) ? prev : [...prev, id])
  }

  function removeBackup(id) {
    setTradersBackup(prev => prev.filter(x => x !== id))
  }

  const previewTrader = traderPrincipalId ? getTrader(traderPrincipalId) : null
  const previewHead   = previewTrader ? getHead(previewTrader.headId) : null

  const currentTrader  = asignacionActual ? getTrader(asignacionActual.traderPrincipalId) : null
  const currentHead    = currentTrader ? getHead(currentTrader.headId) : null
  const currentBackups = asignacionActual
    ? (asignacionActual.tradersBackup ?? []).map(getTrader).filter(Boolean)
    : []

  function validate() {
    const e = {}
    if (!traderPrincipalId) e.traderPrincipalId = 'Debes seleccionar un Trader principal.'
    if (esReasignacion && !motivo.trim()) e.motivo = 'El motivo de reasignación es obligatorio.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ traderPrincipalId, tradersBackup, motivo: motivo.trim() || 'Asignación inicial.' })
  }

  return (
    <>
      <div className={clsx('fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{ width: 500, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)', transform: open ? 'translateX(0)' : 'translateX(100%)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {esReasignacion ? 'Reasignar Trader' : 'Asignar Trader'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{cliente?.nombre}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Asignación actual */}
          {esReasignacion && currentTrader && (
            <div className="rounded-lg p-4" style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Asignación actual (será reemplazada)</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-700">{currentTrader.nombre}</span>
                <span className="text-[11px] text-gray-400">· {currentHead?.mesa}</span>
              </div>
              {currentBackups.length > 0 && (
                <p className="text-[11px] text-gray-400">
                  Respaldo{currentBackups.length > 1 ? 's' : ''}: {currentBackups.map(b => b.nombre).join(', ')}
                </p>
              )}
              <p className="text-[11px] text-gray-400 mt-0.5">Desde {asignacionActual.fecha}</p>
            </div>
          )}

          {/* Trader principal */}
          <Field label="Trader principal" required error={errors.traderPrincipalId}>
            <SearchableSelect
              value={traderPrincipalId}
              onChange={v => {
                setTraderPrincipalId(v)
                setTradersBackup(prev => prev.filter(id => id !== v))
                if (errors.traderPrincipalId) setErrors(e => ({ ...e, traderPrincipalId: undefined }))
              }}
              options={traderPrincipalOpts}
              placeholder="Buscar y seleccionar Trader..."
              error={errors.traderPrincipalId}
            />
          </Field>

          {/* Árbol preview */}
          {previewHead && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50" style={{ border: '1px solid #bfdbfe' }}>
              <Shield size={11} className="text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-700">
                Árbol asignado: <span className="font-semibold">{previewHead.mesa}</span> · {previewHead.nombre}
              </p>
            </div>
          )}

          {/* Traders adicionales (respaldo) */}
          <Field
            label={`Traders adicionales (respaldo) — ${tradersBackup.length}/${MAX_BACKUPS}`}
            hint="Opcional. Estos traders también pueden registrar operaciones para este cliente sin activar AL-GC-08.">

            {tradersBackup.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {tradersBackup.map((tid, idx) => {
                  const t = getTrader(tid)
                  const h = t ? getHead(t.headId) : null
                  return (
                    <div key={tid}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <UserCheck size={12} className="text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{t?.nombre}</p>
                          <p className="text-[11px] text-gray-400">{h?.mesa}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-gray-400 font-medium">Respaldo {idx + 1}</span>
                        <button type="button" onClick={() => removeBackup(tid)}
                          className="p-0.5 rounded text-gray-300 hover:text-red-400 transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {tradersBackup.length < MAX_BACKUPS && (
              <AddBackupDropdown options={backupAddOpts} onAdd={addBackup} />
            )}
          </Field>

          {/* Motivo — solo en reasignación */}
          {esReasignacion && (
            <Field label="Motivo de reasignación" required error={errors.motivo}>
              <textarea rows={3} placeholder="Describa el motivo del cambio de Trader asignado..."
                value={motivo}
                onChange={e => { setMotivo(e.target.value); if (errors.motivo) setErrors(v => ({ ...v, motivo: undefined })) }}
                className={textareaCls(errors.motivo)} />
            </Field>
          )}

          <div className="flex items-start gap-3 px-3 py-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
            <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <span className="font-semibold">AL-GC-08:</span> Cualquier Trader distinto al principal o los traders de respaldo que intente registrar una operación FX con este cliente quedará bloqueado por el sistema.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            <Check size={14} /> {esReasignacion ? 'Confirmar reasignación' : 'Confirmar asignación'}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   FICHA CLIENTE DRAWER
═══════════════════════════════════════════════ */
function FichaClienteDrawer({ open, onClose, cliente, asignacion, historial, onVerCliente }) {
  const trader  = asignacion ? getTrader(asignacion.traderPrincipalId) : null
  const head    = trader ? getHead(trader.headId) : null
  const backups = asignacion ? (asignacion.tradersBackup ?? []).map(getTrader).filter(Boolean) : []
  const tm = cliente ? (TIPO_META[cliente.tipo] ?? TIPO_META.PN) : null
  const em = cliente ? (ESTADO_META[cliente.estado] ?? ESTADO_META.activo) : null

  return (
    <>
      <div className={clsx('fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{ width: 500, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)', transform: open ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="min-w-0 flex-1">
            {cliente && (
              <>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h2 className="text-sm font-semibold text-gray-900 truncate">{cliente.nombre}</h2>
                  {tm && (
                    <span className={clsx('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0', tm.bg, tm.text)}>
                      <tm.Icon size={9} />{cliente.tipo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-gray-400">{cliente.id}</span>
                  {em && (
                    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', em.bg, em.text)}>
                      <span className={clsx('w-1 h-1 rounded-full shrink-0', em.dot)} />{em.label}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0 ml-3">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Asignación activa */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Asignación activa</p>
            {asignacion && trader ? (
              <div className="bg-white rounded-lg p-4 space-y-3" style={{ border: '1px solid var(--color-border)' }}>
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Head de Mesa</p>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700">{head?.mesa}</span>
                    <span className="text-xs text-gray-600">{head?.nombre}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Trader principal</p>
                  <p className="text-sm font-medium text-gray-800">
                    {trader.nombre}
                    <span className="ml-1.5 text-[11px] font-mono text-gray-400">{trader.id}</span>
                  </p>
                </div>
                {backups.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1.5">Traders de respaldo ({backups.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {backups.map((b, i) => (
                        <span key={b.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-gray-50 text-gray-700"
                          style={{ border: '1px solid var(--color-border)' }}>
                          <span className="text-[10px] text-gray-400">R{i + 1}</span>{b.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-gray-400">Desde {asignacion.fecha} · {asignacion.registradoPor}</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
                <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">Este cliente no tiene un Trader asignado.</p>
              </div>
            )}
          </div>

          {/* Historial */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Historial de asignaciones</p>
            {historial.length === 0 ? (
              <p className="text-xs text-gray-400">Sin historial registrado.</p>
            ) : (
              <div className="space-y-2">
                {[...historial].reverse().map(entry => {
                  const t  = getTrader(entry.traderPrincipalId)
                  const h  = t ? getHead(t.headId) : null
                  const bs = (entry.tradersBackup ?? []).map(getTrader).filter(Boolean)
                  const isActivo = entry.fechaHasta === null
                  return (
                    <div key={entry.id} className="px-3 py-2.5 rounded-lg"
                      style={{ background: isActivo ? 'var(--color-surface-bg)' : undefined, border: '1px solid var(--color-border)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800">{t?.nombre ?? '—'}</p>
                          {h && <span className="text-[10px] text-violet-600 font-medium">{h.mesa}</span>}
                        </div>
                        {isActivo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 shrink-0">
                            <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />Activo
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 shrink-0">Hasta {entry.fechaHasta}</span>
                        )}
                      </div>
                      {bs.length > 0 && (
                        <p className="text-[11px] text-gray-400 mt-0.5">Respaldo: {bs.map(b => b.nombre).join(', ')}</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-0.5">Desde {entry.fechaDesde} · {entry.motivo}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        {onVerCliente && (
          <div className="px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={onVerCliente}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Eye size={14} /> Ver ficha completa del cliente
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   CLIENT ROW
═══════════════════════════════════════════════ */
function ClienteRow({ cliente, asignacion, onAsignar, onReasignar, onVerFicha }) {
  const tm = TIPO_META[cliente.tipo] ?? TIPO_META.PN
  const em = ESTADO_META[cliente.estado] ?? ESTADO_META.activo
  const TipoIcon = tm.Icon

  const trader  = asignacion ? getTrader(asignacion.traderPrincipalId) : null
  const backups = asignacion ? (asignacion.tradersBackup ?? []).map(getTrader).filter(Boolean) : []
  const head    = trader ? getHead(trader.headId) : null
  const sinAsignar = !asignacion

  return (
    <tr className={clsx('border-b last:border-0 transition-colors', sinAsignar ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-gray-50/60')}
      style={{ borderColor: 'var(--color-border)' }}>

      {/* Cliente */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', em.dot)} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{cliente.nombre}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-mono text-gray-400">{cliente.id}</span>
              <span className={clsx('inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[10px] font-semibold', tm.bg, tm.text)}>
                <TipoIcon size={9} />{cliente.tipo}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Árbol */}
      <td className="px-4 py-3">
        {head ? (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700">
            {head.mesa}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Trader principal */}
      <td className="px-4 py-3">
        {trader ? (
          <div>
            <p className="text-sm text-gray-800">{trader.nombre}</p>
            <p className="text-[11px] font-mono text-gray-400">{trader.id}</p>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700">
            <AlertTriangle size={10} /> Sin asignar
          </span>
        )}
      </td>

      {/* Backup */}
      <td className="px-4 py-3">
        {backups.length > 0 ? (
          <div className="space-y-0.5">
            {backups.map((b, i) => (
              <p key={b.id} className="text-xs text-gray-600">
                <span className="text-[10px] text-gray-400 mr-1">R{i + 1}</span>{b.nombre}
              </p>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Desde */}
      <td className="px-4 py-3 whitespace-nowrap">
        {asignacion ? (
          <p className="text-xs text-gray-500">{asignacion.fecha}</p>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {sinAsignar ? (
            <button onClick={onAsignar}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
              <Plus size={11} /> Asignar
            </button>
          ) : (
            <button onClick={onReasignar}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors">
              <RefreshCw size={11} /> Reasignar
            </button>
          )}
          {onVerFicha && (
            <button onClick={onVerFicha}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Ver ficha del cliente">
              <Eye size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════ */
export default function ArbolTraderGlobalTab({ onVerCliente }) {
  const [asignaciones, setAsignaciones] = useState(ASIG_INIT)
  const [historialMap, setHistorialMap] = useState(HIST_GLOBAL_INIT)
  const [drawerData,   setDrawerData]   = useState(null) // { cliente, asignacion }
  const [fichaCliente, setFichaCliente] = useState(null)
  const [search,       setSearch]       = useState('')
  const [filterEstado, setFilterEstado] = useState('')   // '' | 'asignado' | 'sin_asignar'
  const [filterMesa,   setFilterMesa]   = useState('')
  const [filterTrader, setFilterTrader] = useState('')

  /* Stats */
  const asignadosCount   = Object.keys(asignaciones).length
  const sinAsignarCount  = MOCK_CLIENTES.length - asignadosCount
  const conBackupCount   = Object.values(asignaciones).filter(a => a.tradersBackup?.length > 0).length

  /* Filters */
  const q = search.trim().toLowerCase()
  const filtered = MOCK_CLIENTES.filter(c => {
    if (q && !c.nombre.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false
    const asig = asignaciones[c.id] ?? null
    if (filterEstado === 'asignado'    && !asig) return false
    if (filterEstado === 'sin_asignar' &&  asig) return false
    if (filterMesa || filterTrader) {
      if (!asig) return filterEstado !== 'asignado' // unassigned passes unless filtering only assigned
      const trader = getTrader(asig.traderPrincipalId)
      if (filterMesa   && trader?.headId !== filterMesa)       return false
      if (filterTrader && asig.traderPrincipalId !== filterTrader) return false
    }
    return true
  })

  const activeFilters = [filterEstado, filterMesa, filterTrader].filter(Boolean).length
  function clearFilters() { setFilterEstado(''); setFilterMesa(''); setFilterTrader('') }

  /* Trader options grouped by mesa for filter */
  const traderFilterOpts = [
    { value: '', label: 'Todos los Traders' },
    ...MOCK_TRADERS
      .filter(t => !filterMesa || t.headId === filterMesa)
      .map(t => {
        const h = getHead(t.headId)
        return { value: t.id, label: `${t.nombre} (${h?.mesa})` }
      }),
  ]

  function handleSave({ traderPrincipalId, tradersBackup, motivo }) {
    const clienteId = drawerData.cliente.id
    const today = todayDisplay()
    setHistorialMap(prev => {
      const hist = prev[clienteId] ?? []
      const closed = hist.map((e, i) => i === hist.length - 1 && e.fechaHasta === null ? { ...e, fechaHasta: today } : e)
      return {
        ...prev,
        [clienteId]: [...closed, {
          id: `H-${String(closed.length + 1).padStart(3, '0')}`,
          traderPrincipalId,
          tradersBackup,
          fechaDesde: today,
          fechaHasta: null,
          motivo: motivo || 'Asignación registrada.',
        }],
      }
    })
    setAsignaciones(prev => ({
      ...prev,
      [clienteId]: { traderPrincipalId, tradersBackup, fecha: today, registradoPor: 'Marco Quispe L.' },
    }))
    setDrawerData(null)
  }

  return (
    <>
      <div className="space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total clientes',      value: MOCK_CLIENTES.length, color: 'text-gray-900'   },
            { label: 'Con Trader asignado', value: asignadosCount,       color: 'text-green-600'  },
            { label: 'Sin asignar',         value: sinAsignarCount,      color: 'text-amber-600'  },
            { label: 'Con Trader backup',   value: conBackupCount,       color: 'text-teal-600'   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-end gap-2 flex-wrap">

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-400 pl-1">Estado asignación</label>
            <FilterSelect value={filterEstado} onChange={setFilterEstado} className="w-44"
              placeholder="Todos"
              options={[
                { value: '',             label: 'Todos'              },
                { value: 'asignado',     label: 'Con Trader asignado'},
                { value: 'sin_asignar',  label: 'Sin asignar'        },
              ]} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-400 pl-1">Árbol / Mesa</label>
            <FilterSelect value={filterMesa} onChange={v => { setFilterMesa(v); setFilterTrader('') }} className="w-40"
              placeholder="Todos los árboles"
              options={[
                { value: '', label: 'Todos los árboles' },
                ...MOCK_HEADS.map(h => ({ value: h.id, label: h.mesa })),
              ]} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-400 pl-1">Trader</label>
            <FilterSelect value={filterTrader} onChange={setFilterTrader} className="w-52"
              placeholder="Todos los Traders"
              options={traderFilterOpts} />
          </div>

          {activeFilters > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-transparent">–</label>
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                <Filter size={11} /> Limpiar ({activeFilters})
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1 ml-auto">
            <label className="text-[11px] text-transparent">–</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white w-56 focus-within:ring-2 focus-within:ring-blue-100"
              style={{ border: '1px solid var(--color-border)' }}>
              <Search size={13} className="text-gray-400 shrink-0" />
              <input type="text" placeholder="Buscar cliente..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full" />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
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
                {['Cliente', 'Árbol', 'Trader asignado', 'Trader backup', 'Desde', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No se encontraron clientes con esos criterios
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <ClienteRow
                    key={c.id}
                    cliente={c}
                    asignacion={asignaciones[c.id] ?? null}
                    onAsignar={()   => setDrawerData({ cliente: c, asignacion: null })}
                    onReasignar={() => setDrawerData({ cliente: c, asignacion: asignaciones[c.id] })}
                    onVerFicha={() => setFichaCliente(c)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <AsignacionDrawer
        open={!!drawerData}
        onClose={() => setDrawerData(null)}
        onSave={handleSave}
        cliente={drawerData?.cliente ?? null}
        asignacionActual={drawerData?.asignacion ?? null}
      />

      <FichaClienteDrawer
        open={!!fichaCliente}
        onClose={() => setFichaCliente(null)}
        cliente={fichaCliente}
        asignacion={fichaCliente ? (asignaciones[fichaCliente.id] ?? null) : null}
        historial={fichaCliente ? (historialMap[fichaCliente.id] ?? []) : []}
        onVerCliente={onVerCliente ? () => { setFichaCliente(null); onVerCliente(fichaCliente) } : null}
      />
    </>
  )
}
