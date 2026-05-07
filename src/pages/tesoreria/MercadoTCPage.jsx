import { useState, useMemo, useRef, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Minus, Activity, Clock, Sliders, Save,
  RefreshCw, Wifi, WifiOff, AlertCircle, Info,
  ChevronRight, ChevronLeft, Check, DollarSign, ArrowDownLeft, ArrowUpRight, Eye,
  FileSpreadsheet, FileText, Search, X, Filter, ChevronDown
} from 'lucide-react'
import clsx from 'clsx'

/* ── UI Helpers ── */
const inputCls = (err) => clsx(
  'w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white font-mono',
  err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-700">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-400 font-normal">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function InputIcon({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      {children}
    </div>
  )
}

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
      <button type="button" onClick={() => setOpen(v => !v)}
        className={clsx('flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs text-left transition-all w-full', open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300')}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}
      >
        <span className={clsx('flex-1 truncate', selected ? 'text-gray-700' : 'text-gray-400')}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={11} className={clsx('text-gray-400 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 min-w-max border border-gray-100 shadow-lg" style={{ border: '1px solid var(--color-border)' }}>
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx('w-full flex items-center justify-between gap-3 px-3 py-2 text-xs transition-colors text-left', o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50')}
            >
              {o.label}{o.value === value && <Check size={11} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, children, className, action }) {
  return (
    <div className={clsx('bg-white rounded-lg overflow-hidden', className)} style={{ border: '1px solid var(--color-border)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

function TrendBadge({ current, previous }) {
  if (previous == null) return null
  const delta = current - previous
  const isUp   = delta > 0.00001
  const isDown = delta < -0.00001
  const sign   = isUp ? '+' : ''
  const Icon   = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const cls    = isUp
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : isDown
    ? 'text-red-500 bg-red-50 border-red-200'
    : 'text-gray-400 bg-gray-50 border-gray-200'
  return (
    <div className={clsx('flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold font-mono', cls)}>
      <Icon size={11} />
      {sign}{delta.toFixed(4)}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   HISTORIAL TAB (Correct Consistency)
═══════════════════════════════════════════════ */
function HistorialTab({ history }) {
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [dateFrom, setFrom]   = useState('')
  const [dateTo, setTo]       = useState('')
  const [page, setPage]       = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = history.filter(h => {
    if (search && !h.motivo.toLowerCase().includes(search.toLowerCase()) && !h.usuario.toLowerCase().includes(search.toLowerCase())) return false
    if (filterUser && h.usuario !== filterUser) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <div className="space-y-4">
      {/* Toolbar / Export */}
      <div className="flex justify-end gap-2 mb-3">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          <FileSpreadsheet size={14} className="text-emerald-500" /> Descargar Excel
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100">
          <FileText size={14} /> Descargar PDF
        </button>
      </div>

      {/* Filtros row */}
      <div className="flex items-end gap-2 mb-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Usuario</label>
          <div className="w-48">
            <FilterSelect 
              value={filterUser} onChange={setFilterUser} placeholder="Todos los usuarios"
              options={[{ value: '', label: 'Todos los usuarios' }, ...Array.from(new Set(history.map(h=>h.usuario))).map(u=>({ value:u, label:u }))]} 
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Desde</label>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 w-36 overflow-hidden">
             <input type="date" value={dateFrom} onChange={e => setFrom(e.target.value)} className="w-full px-3 py-2 text-xs outline-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Hasta</label>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 w-36 overflow-hidden">
             <input type="date" value={dateTo} onChange={e => setTo(e.target.value)} className="w-full px-3 py-2 text-xs outline-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1 ml-auto">
          <label className="text-[11px] text-transparent">–</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all" style={{ border: '1px solid var(--color-border)' }}>
            <Search size={13} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Buscar por usuario o motivo..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent outline-none text-xs text-gray-700 w-full" />
          </div>
        </div>
      </div>

      {/* Standard Table with Footer Paginator */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['Fecha / Hora', 'Usuario responsable', 'TC Compra', 'TC Venta', 'Justificación del cambio'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400 font-medium">No se encontraron registros de cambios</td></tr>
            )}
            {paged.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                   24/04/2026<br/><span className="text-[11px] text-gray-400">{item.hora}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-semibold text-blue-700 shrink-0 border border-blue-200">
                      {item.usuario.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 leading-none">{item.usuario}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Mesa de Dinero</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-emerald-600 font-mono tracking-tight">{item.compra.toFixed(3)}</td>
                <td className="px-4 py-3 text-xs font-bold text-blue-600 font-mono tracking-tight">{item.venta.toFixed(3)}</td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-500 max-w-sm italic leading-relaxed truncate group-hover:whitespace-normal" title={item.motivo}>
                    {item.motivo}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación Standard Qpac */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/30" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Mostrar</span>
              <div className="w-16">
                <FilterSelect value={String(pageSize)} onChange={v => { setPageSize(Number(v)); setPage(1) }} placeholder="" options={[5, 10, 20, 50].map(n=>({value:String(n), label:String(n)}))} />
              </div>
              <span>registros por página · <span className="font-medium text-gray-700">{filtered.length}</span> resultados</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p=>Math.max(1, p-1))} disabled={safePage === 1} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} className={clsx('min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium', n === safePage ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' : 'text-gray-600 hover:bg-gray-100')}>{n}</button>
              ))}
              <button onClick={() => setPage(p=>Math.min(totalPages, p+1))} disabled={safePage === totalPages} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   PIZARRA TAB
═══════════════════════════════════════════════ */
function PizarraTab({ marketData, onUpdatePizarra, onVerHistorial }) {
  const { datatec, pizarra, status, mode, history } = marketData
  const [b_input, setB] = useState(pizarra.compra.toString())
  const [o_input, setO] = useState(pizarra.venta.toString())
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isDatatecActive = mode === 'datatec'
  const prevEntry = history[0] ?? null

  function handleSave() {
    setError(''); const b = parseFloat(b_input); const o = parseFloat(o_input)
    if (isNaN(b) || isNaN(o) || b <= 0 || o <= 0) { setError('Valores no válidos.'); return }
    if (b >= o) { setError('Compra < Venta.'); return }
    if (!motivo.trim()) { setError('Indique motivo.'); return }
    setLoading(true)
    setTimeout(() => {
      onUpdatePizarra({ compra: b, venta: o, hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), usuario: 'Alfonso Reyes (Tesorería)', motivo })
      setMotivo(''); setLoading(false)
    }, 600)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
            <div className={clsx('w-2 h-2 rounded-full', status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
            {status === 'connected' ? <span className="text-green-600">Datatec Online</span> : <span className="text-red-600">Desconectado</span>}
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
            <Activity size={14} className={isDatatecActive ? 'text-blue-500' : 'text-amber-500'} />
            Fuente: {isDatatecActive ? <span className="text-blue-600">Datatec</span> : <span className="text-amber-600">Pizarra Manual</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">Cierre de mercado: <span className="text-gray-600">13:33 h</span></div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-6">
          <Section title="Evolución Datatec (Live)" icon={TrendingUp}>
            <div className="space-y-4">
              <div className="px-4 py-3.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Compra</p>
                  <TrendBadge current={datatec.compra} previous={prevEntry?.compra} />
                </div>
                <p className="text-3xl font-bold text-gray-800 font-mono tracking-tighter">{datatec.compra.toFixed(4)}</p>
              </div>
              <div className="px-4 py-3.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Venta</p>
                  <TrendBadge current={datatec.venta} previous={prevEntry?.venta} />
                </div>
                <p className="text-3xl font-bold text-gray-800 font-mono tracking-tighter">{datatec.venta.toFixed(4)}</p>
              </div>
            </div>
          </Section>
        </div>
        <Section title="Actualizar TC Pizarra" icon={Sliders}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pizarra Compra" required hint="Sugerido"><InputIcon icon={DollarSign}><input type="number" step="0.001" value={b_input} onChange={e => setB(e.target.value)} className={inputCls()} /></InputIcon></Field>
              <Field label="Pizarra Venta" required hint="Sugerido"><InputIcon icon={DollarSign}><input type="number" step="0.001" value={o_input} onChange={e => setO(e.target.value)} className={inputCls()} /></InputIcon></Field>
            </div>
            <Field label="Justificación" required error={error}><textarea value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-blue-500 min-h-[80px] resize-none bg-gray-50/30" /></Field>
            <button onClick={handleSave} disabled={loading} className={clsx("w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all", loading ? "bg-gray-100 text-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white")}>{loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Actualizar Pizarra</button>
          </div>
        </Section>
        <Section title="Últimos Cambios" icon={Clock} action={<button onClick={onVerHistorial} className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-full"><Eye size={12} /> Ver historial</button>}>
          <div className="space-y-5">
            {history.slice(0, 5).map((item, j) => (
              <div key={j} className="relative pl-5 border-l-2 border-gray-100 pb-2 last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />
                <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-gray-800">{item.usuario}</span><span className="text-[10px] text-gray-400 font-mono">{item.hora}</span></div>
                <div className="flex gap-2"><span className="text-[10px] font-mono text-emerald-600 font-bold">C: {item.compra.toFixed(3)}</span><span className="text-[10px] font-mono text-blue-600 font-bold">V: {item.venta.toFixed(3)}</span></div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function MercadoTCPage({ activeTab = 'pizarra', onTabChange, marketData, onUpdatePizarra }) {
  return (
    <div className="animate-in fade-in duration-300">
      {activeTab === 'pizarra' && (
        <PizarraTab 
          marketData={marketData} 
          onUpdatePizarra={onUpdatePizarra} 
          onVerHistorial={() => onTabChange('historial')} 
        />
      )}
      {activeTab === 'historial' && (
        <HistorialTab history={marketData.history} />
      )}
    </div>
  )
}
