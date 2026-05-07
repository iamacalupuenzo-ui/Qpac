import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown, Check, X, AlertTriangle,
  Plus, RefreshCw, Shield, History, UserCheck, Search,
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

const ASIG_INIT = {
  'CLI-002': { traderPrincipalId: 'TRD-001', tradersBackup: ['TRD-002'], fechaAsignacion: '15/01/2026', registradoPor: 'Marco Quispe L.' },
  'CLI-003': { traderPrincipalId: 'TRD-004', tradersBackup: [],          fechaAsignacion: '03/02/2026', registradoPor: 'Marco Quispe L.' },
}

const HIST_INIT = {
  'CLI-002': [
    { id: 'H-001', traderPrincipalId: 'TRD-003', tradersBackup: [],          fechaDesde: '10/01/2026', fechaHasta: '15/01/2026', hora: '10:02', motivo: 'Asignación inicial al aperturar la ficha.', registradoPor: 'Marco Quispe L.' },
    { id: 'H-002', traderPrincipalId: 'TRD-001', tradersBackup: ['TRD-002'], fechaDesde: '15/01/2026', fechaHasta: null,          hora: '09:14', motivo: 'Reasignación por reorganización de cartera — aprobado por Head de Mesa.', registradoPor: 'Marco Quispe L.' },
  ],
  'CLI-003': [
    { id: 'H-001', traderPrincipalId: 'TRD-004', tradersBackup: [],          fechaDesde: '03/02/2026', fechaHasta: null,          hora: '11:22', motivo: 'Asignación inicial.', registradoPor: 'Marco Quispe L.' },
  ],
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const getTrader = id => MOCK_TRADERS.find(t => t.id === id)
const getHead   = id => MOCK_HEADS.find(h => h.id === id)

function todayDisplay() {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}
function nowHour() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

/* Normaliza para búsqueda sin acentos ni mayúsculas */
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

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const textareaCls = err => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white resize-none',
  err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

/* ═══════════════════════════════════════════════
   ADD BACKUP DROPDOWN — búsqueda, queda abierto al seleccionar
═══════════════════════════════════════════════ */
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
                  /* dropdown queda abierto para seguir agregando */
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

/* ═══════════════════════════════════════════════
   ASIGNACIÓN CARD (ficha del cliente)
═══════════════════════════════════════════════ */
function AsignacionCard({ asignacion, onAsignar, onReasignar }) {
  if (!asignacion) {
    return (
      <div className="bg-white rounded-lg p-6 flex flex-col items-center text-center gap-4"
        style={{ border: '1px solid var(--color-border)' }}>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Sin Trader asignado</p>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Este cliente no tiene un Trader asignado. Asigna uno para habilitarlo en el flujo de operaciones FX y en el cálculo de posición por árbol.
          </p>
        </div>
        <button onClick={onAsignar}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          <Plus size={14} /> Asignar Trader
        </button>
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 text-left w-full max-w-sm" style={{ border: '1px solid #fcd34d' }}>
          <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Sin asignación, cualquier Trader que intente operar con este cliente recibirá la alerta <span className="font-semibold">AL-GC-08</span> y la operación será bloqueada.
          </p>
        </div>
      </div>
    )
  }

  const trader  = getTrader(asignacion.traderPrincipalId)
  const head    = trader ? getHead(trader.headId) : null
  const backups = (asignacion.tradersBackup ?? []).map(getTrader).filter(Boolean)

  return (
    <div className="bg-white rounded-lg p-5" style={{ border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Asignación activa</p>
        <button onClick={onReasignar}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw size={11} /> Reasignar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-4">
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5">Head de Mesa</p>
          <p className="text-sm font-medium text-gray-800">
            <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700 mr-1.5">{head?.mesa}</span>
            {head?.nombre}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-400 mb-0.5">Trader principal</p>
          <p className="text-sm font-medium text-gray-800">
            {trader?.nombre}
            <span className="ml-1.5 text-[11px] font-mono text-gray-400">{trader?.id}</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Desde {asignacion.fechaAsignacion} · {asignacion.registradoPor}</p>
        </div>

        <div className="col-span-2">
          <p className="text-[11px] text-gray-400 mb-1.5">
            Traders adicionales (respaldo) — {backups.length === 0 ? 'ninguno' : backups.length}
          </p>
          {backups.length === 0 ? (
            <p className="text-xs text-gray-400">Sin traders de respaldo configurados.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {backups.map((b, i) => (
                <span key={b.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-700"
                  style={{ border: '1px solid var(--color-border)' }}>
                  <UserCheck size={11} className="text-gray-400" />
                  <span className="text-[11px] text-gray-400 font-normal">Respaldo {i + 1}:</span>
                  {b.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50" style={{ border: '1px solid #bbf7d0' }}>
        <Shield size={11} className="text-green-600 shrink-0" />
        <p className="text-[11px] text-green-700 leading-relaxed">
          Operaciones habilitadas para <span className="font-semibold">{trader?.nombre}</span>
          {backups.length > 0 && (
            <> y {backups.map((b, i) => (
              <span key={b.id}><span className="font-semibold">{b.nombre}</span>{i < backups.length - 1 ? ', ' : ''}</span>
            ))} (respaldo)</>
          )}.
          {' '}Cualquier otro Trader activa <span className="font-semibold">AL-GC-08</span>.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   HISTORIAL TABLE
═══════════════════════════════════════════════ */
function HistorialTable({ historial }) {
  if (historial.length === 0) {
    return (
      <div className="bg-white rounded-lg flex items-center justify-center py-10" style={{ border: '1px solid var(--color-border)' }}>
        <p className="text-sm text-gray-400">Sin historial de asignaciones registrado</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
            {['Fecha / Hora', 'Trader principal', 'Respaldos', 'Árbol', 'Estado', 'Motivo', 'Registrado por'].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...historial].reverse().map(entry => {
            const trader   = getTrader(entry.traderPrincipalId)
            const backups  = (entry.tradersBackup ?? []).map(getTrader).filter(Boolean)
            const head     = trader ? getHead(trader.headId) : null
            const isActivo = entry.fechaHasta === null

            return (
              <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50/60 transition-colors"
                style={{ borderColor: 'var(--color-border)' }}>

                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-xs font-medium text-gray-700">{entry.fechaDesde}</p>
                  <p className="text-[11px] text-gray-400">{entry.hora}</p>
                </td>

                <td className="px-4 py-3">
                  <p className="text-sm text-gray-800">{trader?.nombre ?? '—'}</p>
                  <p className="text-[11px] font-mono text-gray-400">{trader?.id}</p>
                </td>

                <td className="px-4 py-3" style={{ maxWidth: 180 }}>
                  {backups.length === 0
                    ? <span className="text-xs text-gray-300">—</span>
                    : (
                      <div className="space-y-0.5">
                        {backups.map((b, i) => (
                          <p key={b.id} className="text-xs text-gray-600">
                            <span className="text-[10px] text-gray-400 mr-1">R{i + 1}</span>{b.nombre}
                          </p>
                        ))}
                      </div>
                    )
                  }
                </td>

                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-violet-50 text-violet-700">
                    {head?.mesa ?? '—'}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {isActivo ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />Hasta {entry.fechaHasta}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3" style={{ maxWidth: 220 }}>
                  <p className="text-xs text-gray-600 leading-relaxed">{entry.motivo}</p>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-xs text-gray-500">{entry.registradoPor}</p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ASIGNACIÓN DRAWER
═══════════════════════════════════════════════ */
function AsignacionDrawer({ open, onClose, onSave, asignacionActual }) {
  const esReasignacion = asignacionActual !== null
  const [traderPrincipalId, setTraderPrincipalId] = useState('')
  const [tradersBackup,     setTradersBackup]     = useState([])
  const [motivo,            setMotivo]            = useState('')
  const [errors,            setErrors]            = useState({})

  useEffect(() => {
    if (open) {
      setTraderPrincipalId('')
      setTradersBackup([])
      setMotivo('')
      setErrors({})
    }
  }, [open])

  const previewTrader = traderPrincipalId ? getTrader(traderPrincipalId) : null
  const previewHead   = previewTrader ? getHead(previewTrader.headId) : null

  const currentTrader  = asignacionActual ? getTrader(asignacionActual.traderPrincipalId) : null
  const currentHead    = currentTrader ? getHead(currentTrader.headId) : null

  const mesaActual    = currentHead?.mesa ?? null
  const mesaPrincipal = traderPrincipalId ? getHead(getTrader(traderPrincipalId)?.headId)?.mesa : null

  const traderPrincipalOpts = MOCK_TRADERS
    .filter(t => !esReasignacion || !mesaActual || getHead(t.headId)?.mesa === mesaActual)
    .map(t => {
      const h = getHead(t.headId)
      return { value: t.id, label: t.nombre, sub: h?.mesa ?? '' }
    })

  const backupAddOpts = MOCK_TRADERS
    .filter(t => t.id !== traderPrincipalId && !tradersBackup.includes(t.id) &&
      (!mesaPrincipal || getHead(t.headId)?.mesa === mesaPrincipal))
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
            <p className="text-[11px] text-gray-400 mt-0.5">
              {esReasignacion
                ? 'El cambio quedará registrado con usuario, fecha, hora y motivo.'
                : 'Primera asignación. El cliente se vinculará al árbol del Trader seleccionado.'}
            </p>
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
              <p className="text-[11px] text-gray-400 mt-0.5">Desde {asignacionActual.fechaAsignacion}</p>
            </div>
          )}

          {/* Aviso de restricción de mesa */}
          {esReasignacion && mesaActual && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <AlertTriangle size={12} className="shrink-0" />
              Solo se muestran traders de <strong className="ml-0.5">{mesaActual}</strong>. No se puede reasignar entre mesas distintas.
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
            hint="Opcional. Estos traders también pueden registrar operaciones para este cliente sin activar AL-GC-08. Haz clic en 'Agregar' y busca traders; el panel queda abierto para agregar varios seguidos.">

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
              <textarea
                rows={3}
                placeholder="Describa el motivo del cambio de Trader asignado..."
                value={motivo}
                onChange={e => { setMotivo(e.target.value); if (errors.motivo) setErrors(v => ({ ...v, motivo: undefined })) }}
                className={textareaCls(errors.motivo)}
              />
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
   MAIN EXPORT
═══════════════════════════════════════════════ */
export default function ArbolTraderTab({ clienteId, clienteNombre }) {
  const [asignacion, setAsignacion] = useState(() => ASIG_INIT[clienteId] ?? null)
  const [historial,  setHistorial]  = useState(() => HIST_INIT[clienteId] ?? [])
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleSave({ traderPrincipalId, tradersBackup, motivo }) {
    const today = todayDisplay()
    const hora  = nowHour()

    setHistorial(h => {
      const base = asignacion
        ? h.map((e, i) => i === h.length - 1 ? { ...e, fechaHasta: today } : e)
        : h
      return [...base, {
        id: `H-${String(base.length + 1).padStart(3, '0')}`,
        traderPrincipalId, tradersBackup,
        fechaDesde: today, fechaHasta: null,
        hora, motivo,
        registradoPor: 'Marco Quispe L.',
      }]
    })

    setAsignacion({ traderPrincipalId, tradersBackup, fechaAsignacion: today, registradoPor: 'Marco Quispe L.' })
    setDrawerOpen(false)
  }

  return (
    <>
      <div className="space-y-4">
        <AsignacionCard
          asignacion={asignacion}
          onAsignar={() => setDrawerOpen(true)}
          onReasignar={() => setDrawerOpen(true)}
        />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <History size={13} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Historial de asignaciones</p>
          </div>
          <HistorialTable historial={historial} />
        </div>
      </div>

      <AsignacionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        asignacionActual={asignacion}
      />
    </>
  )
}
