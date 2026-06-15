import { useState, useMemo, useEffect } from 'react'
import {
  Plus, Save, AlertTriangle, Info, CheckCircle2, Clock,
  Edit3, RefreshCw, TrendingDown, TrendingUp, DollarSign,
} from 'lucide-react'
import clsx from 'clsx'
import AjusteContableDrawer from './AjusteContableDrawer'
import { fmtMoney, fmtDateTime } from '../../utils/format.js'

const TC_SBS_AYER = 3.738

/* ══════════════════════════════════════════════
   MOCK — Cuentas QAPAQ con límites (RF-03 configura)
══════════════════════════════════════════════ */
const CUENTAS_QAPAQ_MOCK = [
  { id: 'QP-PEN-1', banco: 'BCP',        numero: '191-9000003-0-01', moneda: 'PEN', tipo: 'operativa',   mesa: 'Mesa Alpha', limiteAlerta: 200_000, limiteCritico: 50_000  },
  { id: 'QP-PEN-2', banco: 'Scotiabank', numero: '00-272-9000004',   moneda: 'PEN', tipo: 'operativa',   mesa: 'Mesa Beta',  limiteAlerta: 150_000, limiteCritico: 30_000  },
  { id: 'QP-USD-1', banco: 'BCP',        numero: '191-9000001-0-01', moneda: 'USD', tipo: 'operativa',   mesa: 'Mesa Alpha', limiteAlerta: 100_000, limiteCritico: 20_000  },
  { id: 'QP-USD-2', banco: 'Interbank',  numero: '200-9000002-001',  moneda: 'USD', tipo: 'operativa',   mesa: 'Mesa Beta',  limiteAlerta: 80_000,  limiteCritico: 15_000  },
  { id: 'QP-TRANS-PEN', banco: 'BCP',    numero: '191-9000099-0-01', moneda: 'PEN', tipo: 'transitoria', mesa: '—',          limiteAlerta: undefined, limiteCritico: undefined },
  { id: 'QP-TRANS-USD', banco: 'Interbank', numero: '200-9000099-001', moneda: 'USD', tipo: 'transitoria', mesa: '—',       limiteAlerta: undefined, limiteCritico: undefined },
  /* Cuenta sin banco/fondos definidos: al inicio del proceso no todas tienen banco establecido */
  { id: 'QP-SINDEF', banco: 'Por definir', numero: 'Sin asignar', moneda: 'PEN', tipo: 'sin_definir', mesa: '—', limiteAlerta: undefined, limiteCritico: undefined },
]

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function semaforo(disponible, limiteAlerta, limiteCritico) {
  if (limiteAlerta === undefined) return 'sin_config'
  if (disponible < limiteCritico) return 'rojo'
  if (disponible < limiteAlerta)  return 'amarillo'
  return 'verde'
}

const SEMAFORO_COLORS = {
  verde:      { dot: 'bg-green-500 ring-green-200',  txt: 'text-green-700',  badge: 'bg-green-50 border-green-200',  label: 'Normal'   },
  amarillo:   { dot: 'bg-yellow-400 ring-yellow-200 animate-pulse', txt: 'text-yellow-700', badge: 'bg-yellow-50 border-yellow-200', label: 'Alerta'   },
  rojo:       { dot: 'bg-red-500 ring-red-200 animate-pulse',     txt: 'text-red-700',    badge: 'bg-red-50 border-red-200',       label: 'Crítico'  },
  sin_config: { dot: 'bg-gray-300',              txt: 'text-gray-400',   badge: 'bg-gray-50 border-gray-200',     label: 'Sin límites' },
}

/* ══════════════════════════════════════════════
   CÁLCULO DE MOVIMIENTOS POR CUENTA
  
  - INGRESOS: cuando cliente vende USD a QAPAQ (tipo=compra), QAPAQ recibe PEN 
              cuando cliente compra USD a QAPAQ (tipo=venta), QAPAQ recibe USD   
  - SALIDAS:  operaciones liquidadas con referencia registrada → transferencia ejecutada
══════════════════════════════════════════════ */
function calcMovimientos(ops, cuentaId, moneda, ajustes = []) {
  const INGRESOS_ESTADOS = new Set(['en_revision', 'observada', 'subsanada', 'liquidada', 'cerrada'])
  let ingresos = 0, salidas = 0

  // 1. Movimientos por operaciones FX
  for (const op of ops) {
    const esIngreso = INGRESOS_ESTADOS.has(op.estado)
    const esSalida  = (op.estado === 'liquidada' || op.estado === 'cerrada') && op.refTransferencia

    if (op.cuentaQpaqIn === cuentaId && esIngreso) {
      if (moneda === 'PEN' && op.tipo === 'compra') ingresos += op.montoPEN
      if (moneda === 'USD' && op.tipo === 'venta')  ingresos += op.montoUSD
    }

    if (op.cuentaQpaqOut === cuentaId && esSalida) {
      if (moneda === 'USD' && op.tipo === 'compra') salidas += op.montoUSD
      if (moneda === 'PEN' && op.tipo === 'venta')  salidas += op.montoPEN
    }
  }

  // 2. Ajustes manuales (RF-21)
  const misAjustes = ajustes.filter(a => a.cuentaId === cuentaId)
  for (const adj of misAjustes) {
    if (adj.tipo === 'ingreso') ingresos += adj.monto
    else salidas += adj.monto
  }

  return { ingresos, salidas }
}

/* ══════════════════════════════════════════════
   DRAWER DE BOLSA INICIAL
══════════════════════════════════════════════ */
function BolsaDrawer({ cuenta, bolsaActual, onSave, onClose, isAjuste }) {
  const [monto,  setMonto]  = useState(isAjuste ? String(bolsaActual ?? '') : '')
  const [motivo, setMotivo] = useState('')
  const [error,  setError]  = useState('')

  function handleSave() {
    const val = parseFloat(monto)
    if (!monto || isNaN(val) || val <= 0) { setError('El monto debe ser mayor a cero.'); return }
    if (isAjuste && motivo.trim().length < 5) { setError('El motivo del ajuste es obligatorio.'); return }
    onSave({ monto: val, motivo: motivo.trim(), fecha: fmtDateTime(), previo: bolsaActual })
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/25" onClick={onClose} />
      <div className="w-[480px] bg-white h-full flex flex-col overflow-y-auto" style={{ borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {isAjuste ? 'Ajustar bolsa inicial' : 'Registrar bolsa inicial'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{cuenta.banco} · {cuenta.numero} ({cuenta.moneda})</p>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Monto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Bolsa inicial ({cuenta.moneda}) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" min="0" step="0.01"
              value={monto}
              onChange={e => { setMonto(e.target.value); setError('') }}
              placeholder="Ej: 250000.00"
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all',
                error && !isAjuste ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
              )}
            />
          </div>

          {/* Motivo — solo si es ajuste */}
          {isAjuste && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Motivo del ajuste <span className="text-red-400">*</span>
              </label>
              <div className="text-[11px] text-gray-400 mb-1.5">Valor anterior: {cuenta.moneda} {fmtMoney(bolsaActual)}</div>
              <textarea
                value={motivo}
                onChange={e => { setMotivo(e.target.value); setError('') }}
                rows={3}
                placeholder="Describe el motivo del ajuste al saldo inicial…"
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all resize-none',
                  error ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
                )}
              />
            </div>
          )}

          {error && <p className="text-[11px] text-red-500">{error}</p>}

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              {isAjuste
                ? 'El ajuste queda registrado con tu usuario, fecha, hora y motivo. El valor anterior queda en el historial.'
                : 'La bolsa inicial se registra una vez por día. Si necesitas corregirla, usa la opción Ajustar.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            <Save size={14} /> {isAjuste ? 'Guardar ajuste' : 'Registrar bolsa'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   FILA DE CUENTA
══════════════════════════════════════════════ */
function FilaCuenta({ cuenta, bolsa, ops, tcSbs, ajustes, role, onBolsaAction }) {
  const { ingresos, salidas } = useMemo(() => calcMovimientos(ops, cuenta.id, cuenta.moneda, ajustes), [ops, cuenta.id, cuenta.moneda, ajustes])
  const actualTcSbs = tcSbs?.t
  const disponible = bolsa !== undefined ? (bolsa + ingresos - salidas) : null
  const estado = disponible !== null ? semaforo(disponible, cuenta.limiteAlerta, cuenta.limiteCritico) : 'sin_config'
  const sc = SEMAFORO_COLORS[estado]
  const esTesorer = role === 'tesoreria' || role === 'admin'
  const sinBolsa = bolsa === undefined

  return (
    <tr className="border-b hover:bg-gray-50/60 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
      {/* Semáforo */}
      <td className="px-4 py-3 w-8">
        <div className={clsx('w-2.5 h-2.5 rounded-full ring-2 ring-offset-1', sc.dot)} />
      </td>

      {/* Cuenta */}
      <td className="px-4 py-3">
        <p className="text-xs font-bold text-gray-800">{cuenta.banco}</p>
        <p className="text-[11px] text-gray-400 font-mono">{cuenta.numero}</p>
      </td>

      {/* Moneda */}
      <td className="px-4 py-3">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{cuenta.moneda}</span>
      </td>

      {/* Tipo */}
      <td className="px-4 py-3">
        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
          cuenta.tipo === 'transitoria' ? 'bg-violet-50 text-violet-600'
          : cuenta.tipo === 'sin_definir' ? 'bg-amber-50 text-amber-600'
          : 'bg-gray-100 text-gray-600')}>
          {(cuenta.tipo ?? 'operativa').replace('_', ' ')}
        </span>
      </td>

      {/* Bolsa inicial */}
      <td className="px-4 py-3 text-xs text-right">
        {sinBolsa ? (
          <span className="text-amber-500 italic text-[11px]">Sin registro</span>
        ) : (
          <span className="font-medium text-gray-700">{fmtMoney(bolsa)}</span>
        )}
      </td>

      {/* Ingresos */}
      <td className="px-4 py-3 text-xs font-medium text-green-700 text-right">
        {ingresos > 0 ? `+ ${fmtMoney(ingresos)}` : <span className="text-gray-300">0.00</span>}
      </td>

      {/* Salidas */}
      <td className="px-4 py-3 text-xs font-medium text-red-600 text-right">
        {salidas > 0 ? `− ${fmtMoney(salidas)}` : <span className="text-gray-300">0.00</span>}
      </td>

      {/* Disponible neto */}
      <td className="px-4 py-3 text-xs text-right">
        {disponible === null ? (
          <span className="text-gray-300 italic text-[11px]">N/D</span>
        ) : (
          <span className={clsx('font-bold', sc.txt)}>{fmtMoney(disponible)}</span>
        )}
      </td>

      {/* Equiv PEN */}
      <td className="px-4 py-3 text-[11px] text-gray-400 text-right">
        {disponible === null || cuenta.moneda === 'PEN' ? '—' : (
          <>S/ {fmtMoney(disponible * (actualTcSbs ?? TC_SBS_AYER))}{!actualTcSbs && <sup className="text-amber-400">*</sup>}</>
        )}
      </td>

      {/* Estado semáforo */}
      <td className="px-4 py-3">
        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full border', sc.badge, sc.txt)}>
          {sc.label}
        </span>
      </td>

      {/* Acciones */}
      {esTesorer && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {sinBolsa ? (
              <button
                onClick={() => onBolsaAction(cuenta, false)}
                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                <Plus size={11} /> Registrar
              </button>
            ) : (
              <button
                onClick={() => onBolsaAction(cuenta, true)}
                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Edit3 size={11} /> Ajustar
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}

/* ══════════════════════════════════════════════
   SALDOS BANCARIOS PAGE — MAIN
══════════════════════════════════════════════ */
export default function SaldosBancariosPage({ ops = [], marketData, tcSbs, ajustes = [], onSaveAjuste, role, notify }) {
  const [bolsas,      setBolsas]      = useState({})     // { [cuentaId]: number }
  const [bolsaLog,    setBolsaLog]    = useState([])     // historial de ajustes de bolsa
  const [drawerCta,   setDrawerCta]   = useState(null)
  const [isAjuste,    setIsAjuste]    = useState(false)
  const [showAdjDrawer, setShowAdjDrawer] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [filtroEntidad, setFiltroEntidad] = useState('Todas')
  const [filtroEstado,  setFiltroEstado]  = useState('todos')
  const [filtroMesa,    setFiltroMesa]    = useState('Todas')

  const actualTcSbs = tcSbs?.t
  const esTesorer = role === 'tesoreria' || role === 'admin'

  // Auto-refresh cada 30s
  useEffect(() => {
    const t = setInterval(() => setLastRefresh(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  function openDrawer(cuenta, ajuste) {
    setDrawerCta(cuenta)
    setIsAjuste(ajuste)
  }

  function handleSaveBolsa({ monto, motivo, fecha, previo }) {
    setBolsas(prev => ({ ...prev, [drawerCta.id]: monto }))
    setBolsaLog(prev => [
      { cuenta: drawerCta.id, banco: drawerCta.banco, monto, previo: previo ?? null, motivo, fecha, usuario: 'Tesorería / Usuario', tipo: isAjuste ? 'ajuste' : 'registro' },
      ...prev,
    ])
    setDrawerCta(null)
    notify?.(isAjuste ? `Ajuste de bolsa para ${drawerCta.banco} guardado correctamente.` : `Bolsa inicial para ${drawerCta.banco} registrada.`)
  }

  const bancoOpts  = ['Todas', ...Array.from(new Set(CUENTAS_QAPAQ_MOCK.map(c => c.banco)))]
  const mesaOpts   = ['Todas', ...Array.from(new Set(CUENTAS_QAPAQ_MOCK.map(c => c.mesa))).filter(m => m !== '—')]
  const estadoOpts = ['todos', 'verde', 'amarillo', 'rojo', 'sin_config']

  // Alertas activas
  const alertas = CUENTAS_QAPAQ_MOCK.filter(c => {
    const b = bolsas[c.id]
    if (b === undefined) return false
    const { ingresos, salidas } = calcMovimientos(ops, c.id, c.moneda)
    const disp = b + ingresos - salidas
    return disp < c.limiteCritico
  })

  return (
    <div className="space-y-5">

      {/* Drawer */}
      {drawerCta && (
        <BolsaDrawer
          cuenta={drawerCta}
          bolsaActual={bolsas[drawerCta.id]}
          isAjuste={isAjuste}
          onSave={handleSaveBolsa}
          onClose={() => setDrawerCta(null)}
        />
      )}

      {/* Banner alertas críticas */}
      {alertas.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700 mb-0.5">⚠ {alertas.length} cuenta(s) en estado CRÍTICO</p>
            <p className="text-[11px] text-red-600">
              {alertas.map(c => `${c.banco} (${c.moneda})`).join(' · ')} — Disponible por debajo del límite crítico. Acción inmediata requerida.
            </p>
          </div>
        </div>
      )}

      {/* Ajuste Contable Drawer (RF-21) */}
      <AjusteContableDrawer 
        open={showAdjDrawer} 
        onClose={() => setShowAdjDrawer(false)}
        onSave={onSaveAjuste}
        accounts={CUENTAS_QAPAQ_MOCK.map(c => ({ id: c.id, label: `${c.banco} ${c.numero}`, moneda: c.moneda }))}
        role={role}
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Cuentas activas',    value: CUENTAS_QAPAQ_MOCK.length,                          sub: 'en catálogo', color: 'gray'  },
          { label: 'Con bolsa inicial',  value: Object.keys(bolsas).length,                          sub: 'registradas hoy', color: 'blue'  },
          { label: 'En alerta (ðŸŸ¡)',     value: CUENTAS_QAPAQ_MOCK.filter(c => { const b = bolsas[c.id]; if (!b) return false; const { ingresos, salidas } = calcMovimientos(ops, c.id, c.moneda); const d = b+ingresos-salidas; return d < c.limiteAlerta && d >= c.limiteCritico }).length, sub: 'amarillo', color: 'amber' },
          { label: 'Críticas (ðŸ”´)',      value: alertas.length,                                       sub: 'rojo · atención inmediata', color: 'red'   },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', { gray: 'text-gray-900', blue: 'text-blue-600', amber: 'text-amber-600', red: 'text-red-600' }[color])}>{value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Saldos por cuenta QAPAQ</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Disponible neto = Bolsa inicial + Ingresos + Ajustes manuales − Salidas ·
              Actualizado: {lastRefresh.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} (auto-refresh 30s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            {esTesorer && (
              <button 
                onClick={() => setShowAdjDrawer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 shadow-lg shadow-violet-100 transition-all"
              >
                <Plus size={14} /> Registrar Ajuste Manual
              </button>
            )}
            {!esTesorer && (
              <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">Solo lectura</span>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="px-5 py-3 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
          <span className="text-[11px] text-gray-400 font-medium">Filtrar:</span>
          <select value={filtroEntidad} onChange={e => setFiltroEntidad(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white outline-none focus:border-blue-400 transition-all">
            {bancoOpts.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filtroMesa} onChange={e => setFiltroMesa(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white outline-none focus:border-blue-400 transition-all">
            {mesaOpts.map(m => <option key={m} value={m}>{m === 'Todas' ? 'Todas las mesas' : m}</option>)}
          </select>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white outline-none focus:border-blue-400 transition-all">
            <option value="todos">Todos los estados</option>
            <option value="verde">Normal</option>
            <option value="amarillo">Alerta</option>
            <option value="rojo">Crítico</option>
            <option value="sin_config">Sin límites</option>
          </select>
          {(filtroEntidad !== 'Todas' || filtroMesa !== 'Todas' || filtroEstado !== 'todos') && (
            <button onClick={() => { setFiltroEntidad('Todas'); setFiltroMesa('Todas'); setFiltroEstado('todos') }}
              className="text-[11px] text-blue-600 hover:underline">Limpiar filtros</button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-4 py-2.5 w-8" />
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Cuenta</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Moneda</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Bolsa inicial</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">+ Ingresos</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">− Salidas</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Disponible neto</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Equiv. PEN</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Estado</th>
                {esTesorer && <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Acción</th>}
              </tr>
            </thead>
            <tbody>
              {CUENTAS_QAPAQ_MOCK.filter(c => {
                const matchEntidad = filtroEntidad === 'Todas' || c.banco === filtroEntidad
                const matchMesa    = filtroMesa    === 'Todas' || c.mesa === filtroMesa
                if (!matchEntidad || !matchMesa) return false
                if (filtroEstado !== 'todos') {
                  const b = bolsas[c.id]
                  const { ingresos, salidas } = calcMovimientos(ops, c.id, c.moneda, ajustes)
                  const disp = b !== undefined ? b + ingresos - salidas : null
                  const est  = disp !== null ? semaforo(disp, c.limiteAlerta, c.limiteCritico) : 'sin_config'
                  if (est !== filtroEstado) return false
                }
                return true
              }).map(c => (
                <FilaCuenta
                  key={c.id}
                  cuenta={c}
                  bolsa={bolsas[c.id]}
                  ops={ops}
                  tcSbs={tcSbs}
                  ajustes={ajustes}
                  role={role}
                  onBolsaAction={openDrawer}
                />
              ))}
            </tbody>
          </table>
        </div>

        {!actualTcSbs && (
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-t border-amber-100">
            <Info size={12} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-600">* Equivalente en PEN calculado con TC SBS del día anterior ({TC_SBS_AYER}). Ingresa el TC SBS de hoy para ver el valor actualizado.</p>
          </div>
        )}
      </div>

      {/* Historial de Ajustes Manuales (RF-21) */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Historial de Ajustes Contables Manuales</h3>
          <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700 text-[9px] font-bold">RF-21</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">ID / Fecha</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Cuenta</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Impacto</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Monto</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Motivo / Referencia</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ajustes.map(a => (
              <tr key={a.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="text-[11px] font-bold text-gray-700">{a.id}</p>
                  <p className="text-[10px] text-gray-400">{a.fecha} {a.hora}</p>
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-600">{a.cuentaNombre}</td>
                <td className="px-4 py-3">
                  <span className={clsx("px-2 py-0.5 rounded text-[9px] font-bold", a.tipo === 'ingreso' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {a.tipo.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] font-mono font-bold text-gray-800">{a.moneda} {fmtMoney(a.monto)}</td>
                <td className="px-4 py-3">
                  <p className="text-[11px] text-gray-600 line-clamp-1">{a.motivo}</p>
                  <p className="text-[10px] text-blue-500 font-medium">Ref: {a.referencia}</p>
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-500">{a.usuario}</td>
              </tr>
            ))}
            {ajustes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-400 italic">No hay ajustes contables registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Historial de ajustes */}
      {bolsaLog.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-bold text-gray-900">Historial de registros y ajustes de bolsa</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Cuenta</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Valor anterior</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Nuevo valor</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Motivo</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Usuario</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {bolsaLog.map((log, i) => (
                <tr key={i} className="border-b hover:bg-gray-50/60" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-4 py-2.5">
                    <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      log.tipo === 'ajuste' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700')}>
                      {log.tipo === 'ajuste' ? 'Ajuste' : 'Registro inicial'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{log.banco} ({log.cuenta})</td>
                  <td className="px-4 py-2.5 text-xs text-gray-400 text-right">{log.previo !== null ? fmtMoney(log.previo) : '—'}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-gray-800 text-right">{fmtMoney(log.monto)}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[200px] truncate">{log.motivo || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{log.usuario}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">{log.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

