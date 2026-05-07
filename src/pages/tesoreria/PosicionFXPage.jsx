import { useState, useMemo, useEffect, useRef } from 'react'
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, ChevronDown, ChevronRight,
  AlertTriangle, Clock, DollarSign, ArrowDownLeft, ArrowUpRight, Info,
} from 'lucide-react'
import clsx from 'clsx'
import SaldosBancariosPage from './SaldosBancariosPage'

const TC_SBS_AYER = 3.738

/* ══════════════════════════════════════════════
   ESTADOS QUE IMPACTAN POSICIÓN
══════════════════════════════════════════════ */
const ESTADOS_ACTIVOS = new Set(['reservada', 'en_revision', 'observada', 'subsanada', 'liquidada'])

/* ══════════════════════════════════════════════
   JERARQUÍA MOCK (en producción viene de RF-07)
══════════════════════════════════════════════ */
const JERARQUIA = {
  'Mesa Alpha': {
    head: 'Javier Morales H.',
    traders: ['Andrés Valdivia C.', 'Rodrigo Paredes F.'],
  },
  'Mesa Beta': {
    head: 'Lucía Quispe V.',
    traders: ['Karla Mendoza R.', 'Sofía Ríos M.'],
  },
  'Mesa Gamma': {
    head: 'Carlos Yupanqui S.',
    traders: ['César Huanca P.', 'Luis Fernández A.'],
  },
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function fmtMoney(n, dec = 2) {
  if (!n && n !== 0) return '—'
  return parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function calcPosicion(ops, filtroMoneda = 'USD') {
  const activas = ops.filter(o => ESTADOS_ACTIVOS.has(o.estado))
  // Compras desde perspectiva QAPAQ: cliente vende divisas → QAPAQ recibe USD
  // Ventas desde perspectiva QAPAQ: cliente compra divisas → QAPAQ entrega USD
  let compras = 0, ventas = 0
  for (const op of activas) {
    if (op.tipo === 'compra') compras += op.montoUSD   // QAPAQ recibe USD del cliente
    else                      ventas  += op.montoUSD   // QAPAQ entrega USD al cliente
  }
  return { compras, ventas, neta: compras - ventas }
}

function calcPorMesa(ops) {
  const mesaMap = {}
  for (const [mesa, { head, traders }] of Object.entries(JERARQUIA)) {
    const opsTrader = {}
    for (const t of traders) {
      const tOps = ops.filter(o => ESTADOS_ACTIVOS.has(o.estado) && o.trader === t)
      let c = 0, v = 0
      for (const op of tOps) { op.tipo === 'compra' ? (c += op.montoUSD) : (v += op.montoUSD) }
      opsTrader[t] = { compras: c, ventas: v, neta: c - v, count: tOps.length }
    }
    const totC = Object.values(opsTrader).reduce((s, x) => s + x.compras, 0)
    const totV = Object.values(opsTrader).reduce((s, x) => s + x.ventas,  0)
    mesaMap[mesa] = { head, traders: opsTrader, compras: totC, ventas: totV, neta: totC - totV }
  }
  return mesaMap
}

/* ══════════════════════════════════════════════
   SEMÁFORO COMPONENT (RF-20)
══════════════════════════════════════════════ */
function Semaforo({ disponible, limiteAlerta, limiteCritico }) {
  if (limiteAlerta === undefined || limiteCritico === undefined)
    return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" title="Sin límites configurados" />
  const color = disponible < limiteCritico ? 'red' : disponible < limiteAlerta ? 'yellow' : 'green'
  return (
    <span className={clsx(
      'w-2.5 h-2.5 rounded-full inline-block ring-2 ring-offset-1',
      color === 'red'    ? 'bg-red-500 ring-red-200 animate-pulse'    : '',
      color === 'yellow' ? 'bg-yellow-400 ring-yellow-200'            : '',
      color === 'green'  ? 'bg-green-500 ring-green-200'              : '',
    )} title={color === 'red' ? 'Crítico' : color === 'yellow' ? 'Alerta temprana' : 'Normal'} />
  )
}

/* ══════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════ */
function KpiCard({ label, value, sub, color = 'blue', Icon }) {
  const textColor = {
    blue:  'text-blue-600',
    green: 'text-green-600',
    red:   'text-red-600',
    gray:  'text-gray-900',
  }
  return (
    <div className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400">{label}</p>
        {Icon && <Icon size={14} className="text-gray-300" />}
      </div>
      <p className={clsx('text-2xl font-bold tracking-tight', textColor[color])}>$ {fmtMoney(value)}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════════
   FILA EXPANDIBLE DE MESA / HEAD / TRADER
══════════════════════════════════════════════ */
function FilaMesa({ mesa, data, tcSbs, expanded, onToggle }) {
  const [expandedHead, setExpandedHead] = useState(false)
  const netaColor = data.neta > 0 ? 'text-green-700 font-bold' : data.neta < 0 ? 'text-red-600 font-bold' : 'text-gray-500'

  return (
    <>
      {/* Fila Mesa */}
      <tr className="border-b hover:bg-gray-50/60 transition-colors cursor-pointer" style={{ borderColor: 'var(--color-border)' }} onClick={onToggle}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            <span className="text-xs font-bold text-gray-800">{mesa}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-gray-500 text-right">$ {fmtMoney(data.compras)}</td>
        <td className="px-4 py-3 text-xs text-gray-500 text-right">$ {fmtMoney(data.ventas)}</td>
        <td className={clsx('px-4 py-3 text-xs text-right', netaColor)}>
          {data.neta >= 0 ? '+' : ''}$ {fmtMoney(Math.abs(data.neta))}
        </td>
        <td className="px-4 py-3 text-xs text-gray-400 text-right">
          {tcSbs?.t ? `S/ ${fmtMoney(Math.abs(data.neta) * tcSbs.t)}` : <span className="text-amber-500 font-medium">S/ {fmtMoney(Math.abs(data.neta) * TC_SBS_AYER)} *</span>}
        </td>
      </tr>

      {/* Fila Head */}
      {expanded && (
        <tr className="bg-blue-50/30 border-b border-blue-100/60 cursor-pointer hover:bg-blue-50/60" onClick={() => setExpandedHead(v => !v)}>
          <td className="px-4 py-2 pl-10">
            <div className="flex items-center gap-2">
              {expandedHead ? <ChevronDown size={12} className="text-blue-400" /> : <ChevronRight size={12} className="text-blue-400" />}
              <span className="text-[11px] font-semibold text-blue-700">{data.head}</span>
              <span className="text-[10px] text-blue-400 bg-blue-100 px-1.5 py-0.5 rounded-full">Head</span>
            </div>
          </td>
          <td className="px-4 py-2 text-[11px] text-blue-600 text-right">$ {fmtMoney(data.compras)}</td>
          <td className="px-4 py-2 text-[11px] text-blue-600 text-right">$ {fmtMoney(data.ventas)}</td>
          <td className={clsx('px-4 py-2 text-[11px] text-right', data.neta >= 0 ? 'text-green-600' : 'text-red-500')}>
            {data.neta >= 0 ? '+' : ''}$ {fmtMoney(Math.abs(data.neta))}
          </td>
          <td className="px-4 py-2 text-[11px] text-gray-400 text-right">—</td>
        </tr>
      )}

      {/* Filas Traders */}
      {expanded && expandedHead && Object.entries(data.traders).map(([trader, td]) => (
        <tr key={trader} className="bg-blue-50/10 border-b border-blue-50">
          <td className="px-4 py-2 pl-16">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600">{trader}</span>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{td.count} op.</span>
            </div>
          </td>
          <td className="px-4 py-2 text-[11px] text-gray-500 text-right">$ {fmtMoney(td.compras)}</td>
          <td className="px-4 py-2 text-[11px] text-gray-500 text-right">$ {fmtMoney(td.ventas)}</td>
          <td className={clsx('px-4 py-2 text-[11px] text-right', td.neta >= 0 ? 'text-green-600' : 'text-red-500')}>
            {td.neta >= 0 ? '+' : ''}$ {fmtMoney(Math.abs(td.neta))}
          </td>
          <td className="px-4 py-2 text-[11px] text-gray-400 text-right">—</td>
        </tr>
      ))}
    </>
  )
}

/* ══════════════════════════════════════════════
   POSICIÓN FX PAGE — MAIN
══════════════════════════════════════════════ */
export default function PosicionFXPage({ activeTab = 'posicion_fx', ops = [], marketData, tcSbs, ajustes, onSaveAjuste, role, notify }) {
  const [expanded,    setExpanded]    = useState({})
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing,  setRefreshing]  = useState(false)
  const [stopLoss]                    = useState(500_000)
  const timerRef = useRef(null)

  // Auto-refresh cada 30s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRefreshing(true)
      setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()) }, 600)
    }, 30_000)
    return () => clearInterval(timerRef.current)
  }, [])

  function manualRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); setLastRefresh(new Date()) }, 600)
  }

  const actualTcSbs = tcSbs?.t   // null si no ingresado aún
  const { compras, ventas, neta } = calcPosicion(ops)
  const porMesa = calcPorMesa(ops)

  const alertaRoja = Object.values(porMesa).some(m => m.neta < -200_000)

  if (activeTab === 'saldos') return <SaldosBancariosPage ops={ops} marketData={marketData} tcSbs={tcSbs} ajustes={ajustes} onSaveAjuste={onSaveAjuste} role={role} notify={notify} />

  return (
    <div className="space-y-5">

      {/* Banner Stop Loss excedido */}
      {Math.abs(neta) >= stopLoss && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700 font-medium">
            ⛔ Stop Loss excedido: posición neta de $ {fmtMoney(Math.abs(neta))} supera el límite de $ {fmtMoney(stopLoss)}. Acción inmediata requerida.
          </p>
        </div>
      )}

      {/* Banner alerta crítica */}
      {alertaRoja && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700 font-medium">
            Posición neta vendedora supera los límites configurados en una o más mesas. Revisar con Tesorería.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Compras del día" value={compras} color="blue"
          sub={`${ops.filter(o => ESTADOS_ACTIVOS.has(o.estado) && o.tipo === 'compra').length} operaciones`}
          Icon={ArrowDownLeft}
        />
        <KpiCard
          label="Ventas del día" value={ventas} color="green"
          sub={`${ops.filter(o => ESTADOS_ACTIVOS.has(o.estado) && o.tipo === 'venta').length} operaciones`}
          Icon={ArrowUpRight}
        />
        <KpiCard
          label="Posición neta USD" value={Math.abs(neta)}
          color={neta > 0 ? 'blue' : neta < 0 ? 'red' : 'gray'}
          sub={neta > 0 ? 'Comprada' : neta < 0 ? 'Vendida' : 'Neutral'}
          Icon={neta > 0 ? TrendingUp : neta < 0 ? TrendingDown : Minus}
        />
        {/* Stop Loss card */}
        {(() => {
          const posAbsoluta = Math.abs(neta)
          const pctUsado = stopLoss > 0 ? posAbsoluta / stopLoss : 0
          const enAlerta = pctUsado >= 0.8
          const excedido = pctUsado >= 1
          return (
            <div className={clsx('rounded-lg px-4 py-3.5', excedido ? 'bg-red-50' : enAlerta ? 'bg-amber-50' : 'bg-white')} style={{ border: `1px solid ${excedido ? '#fca5a5' : enAlerta ? '#fcd34d' : 'var(--color-border)'}` }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Stop Loss</p>
                {excedido && <AlertTriangle size={13} className="text-red-500" />}
                {enAlerta && !excedido && <AlertTriangle size={13} className="text-amber-500" />}
              </div>
              <p className={clsx('text-2xl font-bold tracking-tight', excedido ? 'text-red-600' : enAlerta ? 'text-amber-600' : 'text-gray-900')}>
                $ {fmtMoney(stopLoss)}
              </p>
              <p className={clsx('text-[11px] mt-0.5', excedido ? 'text-red-500 font-semibold' : enAlerta ? 'text-amber-600 font-medium' : 'text-gray-400')}>
                {excedido ? `⚠ EXCEDIDO — Exp. $ ${fmtMoney(posAbsoluta)}` : enAlerta ? `Alerta: ${Math.round(pctUsado * 100)}% utilizado` : `Exposición máx. permitida`}
              </p>
            </div>
          )
        })()}
      </div>

      {/* Tabla de posición por mesa */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Posición por Mesa</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Solo operaciones activas · Actualización:{' '}
              {lastRefresh.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {' '}(auto-refresh cada 30s)
            </p>
          </div>
          <button
            onClick={manualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={12} className={clsx(refreshing && 'animate-spin')} />
            Actualizar
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Mesa / Nivel</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Compras USD</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Ventas USD</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Posición Neta</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Equiv. PEN</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(porMesa).map(([mesa, data]) => (
              <FilaMesa
                key={mesa}
                mesa={mesa}
                data={data}
                tcSbs={tcSbs}
                expanded={!!expanded[mesa]}
                onToggle={() => setExpanded(prev => ({ ...prev, [mesa]: !prev[mesa] }))}
              />
            ))}

            {/* Fila total */}
            <tr style={{ background: 'var(--color-surface-bg)', borderTop: '2px solid var(--color-border)' }}>
              <td className="px-4 py-3 text-xs font-bold text-gray-800">Total Mesa</td>
              <td className="px-4 py-3 text-xs font-bold text-gray-700 text-right">$ {fmtMoney(compras)}</td>
              <td className="px-4 py-3 text-xs font-bold text-gray-700 text-right">$ {fmtMoney(ventas)}</td>
              <td className={clsx('px-4 py-3 text-xs font-bold text-right', neta >= 0 ? 'text-green-700' : 'text-red-600')}>
                {neta >= 0 ? '+' : ''}$ {fmtMoney(Math.abs(neta))}
              </td>
              <td className="px-4 py-3 text-xs font-bold text-gray-600 text-right">
                S/ {fmtMoney(Math.abs(neta) * (actualTcSbs ?? TC_SBS_AYER))}
                {!actualTcSbs && <span className="text-amber-500 ml-1">*</span>}
              </td>
            </tr>
          </tbody>
        </table>

        {!actualTcSbs && (
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-t border-amber-100">
            <Info size={12} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-600">* Equivalente calculado con TC SBS del día anterior ({TC_SBS_AYER}). Ingresa el TC SBS de hoy para ver el valor actualizado.</p>
          </div>
        )}
      </div>

      {/* Detalle de estados */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Reservadas',   count: ops.filter(o => o.estado === 'reservada').length,   color: 'bg-blue-500'   },
          { label: 'En revisión',  count: ops.filter(o => o.estado === 'en_revision').length,  color: 'bg-orange-500' },
          { label: 'Observadas',   count: ops.filter(o => o.estado === 'observada').length,   color: 'bg-amber-500'  },
          { label: 'Subsanadas',   count: ops.filter(o => o.estado === 'subsanada').length,   color: 'bg-teal-500'   },
          { label: 'Liquidadas',   count: ops.filter(o => o.estado === 'liquidada').length,   color: 'bg-green-500'  },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className={clsx('w-2 h-2 rounded-full', color)} />
              <p className="text-[11px] text-gray-500 font-medium">{label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
