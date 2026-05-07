import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Search, Plus, Building2, User, Briefcase, Shield,
  ChevronLeft, ChevronRight, Eye, Ban, AlertTriangle,
  Check, X, Filter, ChevronDown, UserCheck,
} from 'lucide-react'
import clsx from 'clsx'
import CuentasBancariasTab from './CuentasBancariasTab'
import ConveniosTab from './ConveniosTab'
import ArbolTraderGlobalTab from './ArbolTraderGlobalTab'

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   BADGES
═══════════════════════════════════════════════ */
const TIPO_STYLE = {
  PN:  { bg: 'bg-slate-100',  text: 'text-slate-700',  Icon: User      },
  P10: { bg: 'bg-sky-100',    text: 'text-sky-700',    Icon: Briefcase },
  PJ:  { bg: 'bg-indigo-100', text: 'text-indigo-700', Icon: Building2 },
  EF:  { bg: 'bg-violet-100', text: 'text-violet-700', Icon: Shield    },
}

const ESTADO_STYLE = {
  activo:          { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500',  label: 'Activo'                 },
  activo_proceso:  { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400',  label: 'Activo en proceso'       },
  pendiente_legal: { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-500',   label: 'Pendiente de aprobación' },
  no_habilitado:   { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-400',    label: 'No habilitado'           },
}

const RIESGO_STYLE = {
  estandar: { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Estándar'  },
  rf:       { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Reg. Ref.' },
}

function TipoBadge({ tipo }) {
  const s = TIPO_STYLE[tipo] ?? TIPO_STYLE.PN
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold', s.bg, s.text)}>
      <s.Icon size={10} />{tipo}
    </span>
  )
}

function EstadoBadge({ estado }) {
  const s = ESTADO_STYLE[estado] ?? ESTADO_STYLE.activo
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', s.bg, s.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />{s.label}
    </span>
  )
}

/* ═══════════════════════════════════════════════
   FILTER SELECT — mismo patrón que UsersPage
═══════════════════════════════════════════════ */
function FilterSelect({ value, onChange, options, placeholder }) {
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

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const PAGE_SIZE = 6

function parseFecha(str) {
  if (!str) return new Date(0)
  const [d, m, y] = str.split('/')
  return new Date(+y, +m - 1, +d)
}

export default function ClientesPage({ onNuevoCliente, onVerCliente, activeTab, clientes, setClientes }) {
  const [search,       setSearch]       = useState('')
  const [filterTipo,   setFilterTipo]   = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [page,         setPage]         = useState(1)
  const [confirmInhabilitar, setConfirmInhabilitar] = useState(null)
  const [confirmHabilitar,   setConfirmHabilitar]   = useState(null)

  function handleConfirmarInhabilitar() {
    if (!confirmInhabilitar) return
    setClientes(prev => prev.map(c =>
      c.id === confirmInhabilitar.id ? { ...c, estado: 'no_habilitado' } : c
    ))
    setConfirmInhabilitar(null)
  }

  function handleConfirmarHabilitar() {
    if (!confirmHabilitar) return
    setClientes(prev => prev.map(c =>
      c.id === confirmHabilitar.id ? { ...c, estado: 'activo' } : c
    ))
    setConfirmHabilitar(null)
  }

  /* Stats */
  const stats = [
    { label: 'Total clientes',       value: clientes.length,                                            color: 'text-gray-900'  },
    { label: 'Activos',              value: clientes.filter(c => c.estado === 'activo').length,          color: 'text-green-600' },
    { label: 'Activo en proceso',    value: clientes.filter(c => c.estado === 'activo_proceso').length,  color: 'text-amber-600' },
    { label: 'Pendiente aprobación', value: clientes.filter(c => c.estado === 'pendiente_legal').length, color: 'text-blue-600'  },
    { label: 'No habilitados',       value: clientes.filter(c => c.estado === 'no_habilitado').length,   color: 'text-red-500'   },
  ]

  function parseDate(str) {
    if (!str) return null
    const [d, m, y] = str.split('/')
    return new Date(+y, +m - 1, +d)
  }

  /* Filtered & paginated */
  const q = search.trim().toLowerCase()
  const filtered = clientes.filter(c => {
    if (q && !c.nombre.toLowerCase().includes(q) && !c.doi.includes(q) && !c.id.toLowerCase().includes(q)) return false
    if (filterTipo   && c.tipo   !== filterTipo)   return false
    if (filterEstado && c.estado !== filterEstado) return false
    if (dateFrom || dateTo) {
      const created = parseDate(c.fecha)
      if (dateFrom && created < new Date(dateFrom)) return false
      if (dateTo) { const to = new Date(dateTo); to.setHours(23, 59, 59); if (created > to) return false }
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function resetPage() { setPage(1) }
  function applySearch(v)  { setSearch(v);       resetPage() }
  function applyTipo(v)    { setFilterTipo(v);   resetPage() }
  function applyEstado(v)  { setFilterEstado(v); resetPage() }
  function applyFrom(v)    { setDateFrom(v);     resetPage() }
  function applyTo(v)      { setDateTo(v);       resetPage() }

  const activeFilters = [filterTipo, filterEstado, dateFrom, dateTo].filter(Boolean).length
  function clearFilters() { setFilterTipo(''); setFilterEstado(''); setDateFrom(''); setDateTo(''); resetPage() }

  if (activeTab === 'cuentas_bancarias') return <CuentasBancariasTab />
  if (activeTab === 'convenios')         return <ConveniosTab />
  if (activeTab === 'arbol_trader')      return <ArbolTraderGlobalTab clientes={clientes} onVerCliente={onVerCliente} />

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar — botón solo, alineado a la derecha */}
      <div className="flex justify-end mb-3">
        <button
          onClick={onNuevoCliente}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={14} /> Nuevo cliente
        </button>
      </div>

      {/* Filtros + buscador */}
      <div className="flex items-end gap-2 mb-3">

        {/* Tipo de persona */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Tipo</label>
          <div className="w-40">
            <FilterSelect
              value={filterTipo}
              onChange={applyTipo}
              placeholder="Todos los tipos"
              options={[
                { value: '',    label: 'Todos los tipos' },
                { value: 'PN',  label: 'Persona Natural (PN)' },
                { value: 'P10', label: 'Pers. Natural c/ Negocio (P10)' },
                { value: 'PJ',  label: 'Persona Jurídica (PJ)' },
                { value: 'EF',  label: 'Entidad Financiera (EF)' },
              ]}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Estado</label>
          <div className="w-44">
            <FilterSelect
              value={filterEstado}
              onChange={applyEstado}
              placeholder="Todos los estados"
              options={[
                { value: '',                label: 'Todos los estados'       },
                { value: 'activo',          label: 'Activo'                  },
                { value: 'activo_proceso',  label: 'Activo en proceso'       },
                { value: 'pendiente_legal', label: 'Pendiente de aprobación' },
                { value: 'no_habilitado',   label: 'No habilitado'           },
              ]}
            />
          </div>
        </div>

        {/* Desde */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Desde</label>
          <div className="flex items-center bg-white rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}>
            <input type="date" value={dateFrom} onChange={e => applyFrom(e.target.value)}
              className="pl-3 pr-2 py-2 rounded-lg text-xs bg-transparent text-gray-700 outline-none cursor-pointer w-36" />
          </div>
        </div>

        {/* Hasta */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Hasta</label>
          <div className="flex items-center bg-white rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}>
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => applyTo(e.target.value)}
              className="pl-3 pr-2 py-2 rounded-lg text-xs bg-transparent text-gray-700 outline-none cursor-pointer w-36" />
          </div>
        </div>

        {/* Limpiar — solo si hay filtros activos */}
        {activeFilters > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-transparent">–</label>
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
              <Filter size={11} /> Limpiar ({activeFilters})
            </button>
          </div>
        )}

        {/* Buscador — extremo derecho */}
        <div className="flex flex-col gap-1 ml-auto">
          <label className="text-[11px] text-transparent">–</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white w-60 transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}>
            <Search size={13} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Buscar nombre, DOI o código..."
              value={search} onChange={e => applySearch(e.target.value)}
              className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full" />
            {search && (
              <button onClick={() => applySearch('')} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['Código', 'Cliente', 'Documento', 'Riesgo', 'Estado', 'Registrado por', 'Fecha', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  No se encontraron clientes con esos criterios
                </td>
              </tr>
            ) : (
              paginated.map(c => (
                <ClienteRow
                  key={c.id}
                  cliente={c}
                  onVer={onVerCliente}
                  onInhabilitar={c.estado !== 'no_habilitado' ? () => setConfirmInhabilitar(c) : null}
                  onHabilitar={c.estado === 'no_habilitado'   ? () => setConfirmHabilitar(c)   : null}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400">
              Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length} clientes
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

      {/* Modal confirmación habilitar */}
      {confirmHabilitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmHabilitar(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-96" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-50 shrink-0">
                <UserCheck size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Habilitar cliente</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ¿Confirmas habilitar a <span className="font-semibold text-gray-700">{confirmHabilitar.nombre}</span>? El cliente volverá al estado <span className="font-semibold">Activo</span> y podrá operar con normalidad.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 mb-5" style={{ border: '1px solid #93c5fd' }}>
              <AlertTriangle size={12} className="text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-700">Esta acción quedará registrada en el historial de auditoría.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmarHabilitar}
                className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                Confirmar habilitación
              </button>
              <button
                onClick={() => setConfirmHabilitar(null)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación inhabilitar */}
      {confirmInhabilitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmInhabilitar(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-96" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-50 shrink-0">
                <Ban size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Inhabilitar cliente</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ¿Confirmas inhabilitar a <span className="font-semibold text-gray-700">{confirmInhabilitar.nombre}</span>? El cliente quedará con estado <span className="font-semibold">No habilitado</span> y no podrá operar hasta ser reactivado.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 mb-5" style={{ border: '1px solid #fcd34d' }}>
              <AlertTriangle size={12} className="text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-700">Esta acción quedará registrada en el historial de auditoría.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmarInhabilitar}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                Confirmar inhabilitación
              </button>
              <button
                onClick={() => setConfirmInhabilitar(null)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══ ROW ══════════════════════════════════════════════════ */
function ClienteRow({ cliente: c, onVer, onInhabilitar, onHabilitar }) {
  return (
    <tr className="group border-b last:border-0 hover:bg-gray-50/60 transition-colors"
      style={{ borderColor: 'var(--color-border)' }}>
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-semibold text-gray-500">{c.id}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{c.nombre}</p>
          <TipoBadge tipo={c.tipo} />
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-700 font-mono">{c.doi}</p>
        <p className="text-[11px] text-gray-400">{c.tipoDoc}</p>
      </td>
      <td className="px-4 py-3">
        <span className={clsx('inline-block px-2 py-0.5 rounded text-[11px] font-medium',
          RIESGO_STYLE[c.riesgo]?.bg, RIESGO_STYLE[c.riesgo]?.text)}>
          {RIESGO_STYLE[c.riesgo]?.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div>
          <EstadoBadge estado={c.estado} />
          {c.docsPendientes && (
            <p className="text-[10px] text-amber-600 mt-1">{c.docsPendientes} docs pendientes</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-gray-600">{c.registradoPor}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-gray-500 whitespace-nowrap">{c.fecha}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button title="Ver ficha" onClick={() => onVer?.(c)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Eye size={14} />
          </button>
          {onHabilitar ? (
            <button title="Habilitar cliente" onClick={onHabilitar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
              <UserCheck size={14} />
            </button>
          ) : (
            <button title="Inhabilitar cliente" onClick={onInhabilitar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Ban size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function PageBtn({ onClick, disabled, active, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={clsx('w-7 h-7 flex items-center justify-center rounded text-xs transition-all',
        active   ? 'bg-blue-600 text-white font-semibold' :
        disabled ? 'text-gray-300 cursor-not-allowed' :
                   'text-gray-500 hover:bg-gray-100')}>
      {children}
    </button>
  )
}
