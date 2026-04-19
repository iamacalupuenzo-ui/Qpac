import { useState, useRef, useEffect } from 'react'
import {
  Plus, X, Check, ChevronDown, Pencil, PowerOff, Power,
  AlertTriangle, Shield, Users, UserCheck,
} from 'lucide-react'
import clsx from 'clsx'

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const MOCK_HEADS = [
  { id: 'HEAD-001', nombre: 'Ing. Fernando Torres', email: 'f.torres@qpac.pe'  },
  { id: 'HEAD-002', nombre: 'Dra. Patricia Llave',  email: 'p.llave@qpac.pe'   },
  { id: 'HEAD-003', nombre: 'Carlos Méndez S.',     email: 'c.mendez@qpac.pe'  },
  { id: 'HEAD-004', nombre: 'Mg. Sandra Quispe V.', email: 's.quispe@qpac.pe'  },
]

const MOCK_TRADERS = [
  { id: 'TRD-001', nombre: 'Andrés Valdivia C.' },
  { id: 'TRD-002', nombre: 'Karla Mendoza R.'   },
  { id: 'TRD-003', nombre: 'Rodrigo Paredes F.' },
  { id: 'TRD-004', nombre: 'Sofía Ríos M.'      },
  { id: 'TRD-005', nombre: 'César Huanca P.'    },
  { id: 'TRD-006', nombre: 'Luis Fernández A.'  },
  { id: 'TRD-007', nombre: 'Rosa Mamani T.'     },
  { id: 'TRD-008', nombre: 'Julio Castro B.'    },
]

const MESAS_INIT = [
  { id: 'MESA-001', nombre: 'Mesa Alpha', headId: 'HEAD-001', estado: 'activa',   fechaCreacion: '10/01/2026' },
  { id: 'MESA-002', nombre: 'Mesa Beta',  headId: 'HEAD-002', estado: 'activa',   fechaCreacion: '15/01/2026' },
  { id: 'MESA-003', nombre: 'Mesa Gamma', headId: 'HEAD-003', estado: 'activa',   fechaCreacion: '20/01/2026' },
  { id: 'MESA-004', nombre: 'Mesa Delta', headId: 'HEAD-004', estado: 'inactiva', fechaCreacion: '25/01/2026' },
]

/* traderId → mesaId | null */
const TRADER_MESAS_INIT = {
  'TRD-001': 'MESA-001',
  'TRD-002': 'MESA-001',
  'TRD-003': 'MESA-001',
  'TRD-004': 'MESA-002',
  'TRD-005': 'MESA-002',
  'TRD-006': 'MESA-003',
  'TRD-007': 'MESA-003',
  'TRD-008': 'MESA-004',
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const getHead   = id => MOCK_HEADS.find(h => h.id === id)
const getTrader = id => MOCK_TRADERS.find(t => t.id === id)

let _mesaSeq = 5
function newMesaId() { return `MESA-${String(++_mesaSeq).padStart(3, '0')}` }

function mesaCountLabel(n) {
  if (n === 0) return 'Sin mesas asignadas'
  if (n === 1) return '1 mesa asignada'
  return `${n} mesas asignadas`
}

/* ═══════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════ */
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
      <button type="button" onClick={() => setOpen(v => !v)}
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-50 py-1 overflow-auto"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', maxHeight: 240 }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              )}>
              <div className="min-w-0">
                <p className="text-sm truncate">{o.label}</p>
                {o.sub && (
                  <p className={clsx(
                    'text-[11px] mt-0.5',
                    o.count > 0 ? 'text-violet-600 font-medium' : 'text-gray-400'
                  )}>{o.sub}</p>
                )}
              </div>
              {o.value === value && <Check size={12} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = err => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white',
  err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

function ConfirmModal({ open, title, message, confirmLabel, confirmClass = 'bg-red-600 hover:bg-red-700', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-80"
        style={{ border: '1px solid var(--color-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
        <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors', confirmClass)}>
            {confirmLabel}
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   ADD TRADER DROPDOWN (inline en la card)
═══════════════════════════════════════════════ */
function AddTraderDropdown({ available, onAdd }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const noDisponibles = available.length === 0

  return (
    <div className="relative inline-block" ref={ref}>
      <button type="button"
        onClick={() => !noDisponibles && setOpen(v => !v)}
        disabled={noDisponibles}
        className={clsx(
          'flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-lg border',
          noDisponibles
            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
            : 'text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100'
        )}>
        <Plus size={11} />
        {noDisponibles ? 'Sin Traders disponibles' : 'Agregar Trader'}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg z-30 py-1"
          style={{ minWidth: 220, border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Traders sin mesa asignada
          </p>
          {available.map(t => (
            <button key={t.id} type="button"
              onClick={() => { onAdd(t.id); setOpen(false) }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-800">{t.nombre}</p>
              <span className="text-[11px] font-mono text-gray-400 shrink-0">{t.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MESA CARD
═══════════════════════════════════════════════ */
function MesaCard({ mesa, mesaTraders, availableTraders, onEdit, onToggleEstado, onAddTrader, onRemoveTrader }) {
  const head     = getHead(mesa.headId)
  const inactiva = mesa.estado === 'inactiva'

  return (
    <div className={clsx('bg-white rounded-lg overflow-hidden', inactiva && 'opacity-60')}
      style={{ border: '1px solid var(--color-border)' }}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 truncate max-w-[120px]">
            {mesa.nombre}
          </span>
          <span className={clsx(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
            inactiva ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
          )}>
            <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', inactiva ? 'bg-gray-400' : 'bg-green-500')} />
            {inactiva ? 'Inactiva' : 'Activa'}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onEdit}
            className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Editar mesa">
            <Pencil size={12} />
          </button>
          <button onClick={onToggleEstado}
            className={clsx(
              'p-1 rounded-lg transition-colors',
              inactiva
                ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            )}
            title={inactiva ? 'Activar mesa' : 'Desactivar mesa'}>
            {inactiva ? <Power size={12} /> : <PowerOff size={12} />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* Head de Mesa */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Head de Mesa</p>
          {head ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Shield size={11} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{head.nombre}</p>
                <p className="text-[10px] text-gray-400 truncate">{head.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-600">Sin Head de Mesa asignado</p>
          )}
        </div>

        {/* Traders */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Traders ({mesaTraders.length})
          </p>

          {mesaTraders.length === 0 ? (
            <p className="text-[11px] text-gray-400 mb-2">Sin Traders asignados.</p>
          ) : (
            <div className="space-y-1 mb-2">
              {mesaTraders.map(t => (
                <div key={t.id}
                  className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <UserCheck size={11} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-800 truncate">{t.nombre}</span>
                  </div>
                  {!inactiva && (
                    <button onClick={() => onRemoveTrader(t.id)}
                      className="p-0.5 rounded text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      title="Quitar de la mesa">
                      <X size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!inactiva && (
            <AddTraderDropdown available={availableTraders} onAdd={onAddTrader} />
          )}
        </div>

        {/* Fecha creación */}
        <p className="text-[10px] text-gray-400">Creada el {mesa.fechaCreacion}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MESA DRAWER (crear / editar)
═══════════════════════════════════════════════ */
function MesaDrawer({ open, onClose, onSave, mesa, headMesaCounts }) {
  const isEdit = !!mesa
  const [nombre, setNombre] = useState('')
  const [headId, setHeadId] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setNombre(mesa?.nombre ?? '')
      setHeadId(mesa?.headId ?? '')
      setErrors({})
    }
  }, [open, mesa])

  /* Todos los heads disponibles, con conteo de mesas activas que gestionan */
  const headOpts = MOCK_HEADS.map(h => {
    const count = headMesaCounts[h.id] || 0
    return {
      value: h.id,
      label: h.nombre,
      sub:   `${h.email} · ${mesaCountLabel(count)}`,
      count,
    }
  })

  function validate() {
    const e = {}
    if (!nombre.trim())  e.nombre = 'El nombre de la mesa es obligatorio.'
    if (!headId)         e.headId = 'Debes asignar un Head de Mesa.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ nombre: nombre.trim(), headId })
  }

  return (
    <>
      <div className={clsx('fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{ width: 440, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)', transform: open ? 'translateX(0)' : 'translateX(100%)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{isEdit ? 'Editar Mesa' : 'Nueva Mesa de Dinero'}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? 'Modifica el nombre o el Head de Mesa asignado.' : 'Los Traders se asignan desde la tarjeta de la mesa una vez creada.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <Field label="Nombre de la mesa" required error={errors.nombre}>
            <input
              type="text" placeholder="Ej: Mesa Alpha, Mesa Derivados..."
              value={nombre}
              onChange={e => { setNombre(e.target.value); if (errors.nombre) setErrors(v => ({ ...v, nombre: undefined })) }}
              className={inputCls(errors.nombre)}
            />
          </Field>

          <Field label="Head de Mesa" required error={errors.headId}>
            <DrawerSelect
              value={headId}
              onChange={v => { setHeadId(v); if (errors.headId) setErrors(v2 => ({ ...v2, headId: undefined })) }}
              options={headOpts}
              placeholder="Seleccionar Head de Mesa..."
              error={errors.headId}
            />
          </Field>

          <div className="flex items-start gap-3 px-3 py-3 rounded-lg bg-blue-50" style={{ border: '1px solid #bfdbfe' }}>
            <Shield size={13} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Un Head de Mesa puede gestionar múltiples mesas simultáneamente. El conteo de mesas activas se muestra en el selector. Los Traders se agregan desde la tarjeta de la mesa después de crearla.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            <Check size={14} /> {isEdit ? 'Guardar cambios' : 'Crear mesa'}
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
export default function MesasDineroPage() {
  const [mesas,       setMesas]       = useState(MESAS_INIT)
  const [traderMesas, setTraderMesas] = useState(TRADER_MESAS_INIT)
  const [drawerMesa,  setDrawerMesa]  = useState(null)  // null | 'new' | mesa object (edit)
  const [confirm,     setConfirm]     = useState(null)  // { mesa }

  /* ── Computed ── */
  const activaCount    = mesas.filter(m => m.estado === 'activa').length
  const asignadosCount = Object.values(traderMesas).filter(Boolean).length
  const sinMesaCount   = MOCK_TRADERS.length - asignadosCount
  const headsActivos   = new Set(mesas.filter(m => m.estado === 'activa').map(m => m.headId)).size

  function getMesaTraders(mesaId) {
    return Object.entries(traderMesas)
      .filter(([, mid]) => mid === mesaId)
      .map(([tid]) => getTrader(tid))
      .filter(Boolean)
  }

  function getAvailableTraders() {
    return MOCK_TRADERS.filter(t => !traderMesas[t.id])
  }

  /* Conteo de mesas activas por head (excluyendo la mesa que se está editando) */
  function getHeadMesaCounts(excludeMesaId = null) {
    const counts = {}
    mesas
      .filter(m => m.estado === 'activa' && m.id !== excludeMesaId)
      .forEach(m => { counts[m.headId] = (counts[m.headId] || 0) + 1 })
    return counts
  }

  /* ── Actions ── */
  function handleSaveMesa({ nombre, headId }) {
    if (drawerMesa === 'new') {
      const id = newMesaId()
      const today = new Date()
      const fecha = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`
      setMesas(ms => [...ms, { id, nombre, headId, estado: 'activa', fechaCreacion: fecha }])
    } else {
      setMesas(ms => ms.map(m => m.id === drawerMesa.id ? { ...m, nombre, headId } : m))
    }
    setDrawerMesa(null)
  }

  function handleToggleEstado(mesa) {
    if (mesa.estado === 'activa') {
      setConfirm({ mesa })
    } else {
      setMesas(ms => ms.map(m => m.id === mesa.id ? { ...m, estado: 'activa' } : m))
    }
  }

  function executeDesactivar() {
    setMesas(ms => ms.map(m => m.id === confirm.mesa.id ? { ...m, estado: 'inactiva' } : m))
    setConfirm(null)
  }

  function handleAddTrader(mesaId, traderId) {
    setTraderMesas(tm => ({ ...tm, [traderId]: mesaId }))
  }

  function handleRemoveTrader(traderId) {
    setTraderMesas(tm => ({ ...tm, [traderId]: null }))
  }

  const drawerMesaObj   = drawerMesa !== 'new' ? drawerMesa : null
  const headMesaCounts  = getHeadMesaCounts(drawerMesaObj?.id)
  const availableTraders = getAvailableTraders()

  return (
    <>
      <div className="space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Mesas activas',       value: activaCount,    color: 'text-gray-900'   },
            { label: 'Heads de Mesa',        value: headsActivos,   color: 'text-violet-600' },
            { label: 'Traders asignados',    value: asignadosCount, color: 'text-blue-600'   },
            { label: 'Traders sin mesa',     value: sinMesaCount,   color: 'text-amber-600'  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex justify-end">
          <button onClick={() => setDrawerMesa('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            <Plus size={14} /> Nueva Mesa
          </button>
        </div>

        {/* Traders sin mesa — alerta si hay */}
        {sinMesaCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              <span className="font-semibold">{sinMesaCount} Trader{sinMesaCount > 1 ? 's' : ''} sin mesa asignada:</span>{' '}
              {getAvailableTraders().map(t => t.nombre).join(', ')}.
              {' '}Asígnalos a una mesa para que puedan operar.
            </p>
          </div>
        )}

        {/* Mesa cards */}
        <div className="grid grid-cols-4 gap-3">
          {mesas.map(mesa => (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              mesaTraders={getMesaTraders(mesa.id)}
              availableTraders={availableTraders}
              onEdit={() => setDrawerMesa(mesa)}
              onToggleEstado={() => handleToggleEstado(mesa)}
              onAddTrader={traderId => handleAddTrader(mesa.id, traderId)}
              onRemoveTrader={handleRemoveTrader}
            />
          ))}
        </div>

        {mesas.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">No hay mesas configuradas</p>
              <p className="text-xs text-gray-300 mt-1">Crea la primera mesa con el botón "Nueva Mesa"</p>
            </div>
          </div>
        )}
      </div>

      <MesaDrawer
        open={!!drawerMesa}
        onClose={() => setDrawerMesa(null)}
        onSave={handleSaveMesa}
        mesa={drawerMesaObj}
        headMesaCounts={headMesaCounts}
      />

      <ConfirmModal
        open={!!confirm}
        title="¿Desactivar esta mesa?"
        message={`La mesa "${confirm?.mesa?.nombre}" quedará inactiva. Los Traders asignados no podrán ser vinculados a nuevas operaciones hasta que se reactive.`}
        confirmLabel="Sí, desactivar"
        onConfirm={executeDesactivar}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}
