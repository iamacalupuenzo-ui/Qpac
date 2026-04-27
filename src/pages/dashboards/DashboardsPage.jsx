import { useState, useEffect } from 'react'
import {
  TrendingUp, ArrowLeftRight, Users, Clock, ShieldAlert,
  BadgeDollarSign, Zap, BarChart2, Activity, CheckCircle2,
  AlertTriangle, Building2, CreditCard, Landmark,
  RefreshCw, FileText, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   SHARED
══════════════════════════════════════════════ */
const bord = { border: '1px solid var(--color-border)' }

function StatCard({ label, value, color = 'text-gray-900', sub, icon: Icon, iconColor = 'text-gray-400' }) {
  return (
    <div className="bg-white rounded-lg px-4 py-3.5" style={bord}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-400">{label}</p>
        {Icon && <div className="p-1.5 rounded-lg bg-gray-50"><Icon size={13} className={iconColor} /></div>}
      </div>
      <p className={clsx('text-2xl font-bold tracking-tight', color)}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function CardWrap({ children }) {
  return <div className="bg-white rounded-lg overflow-hidden" style={bord}>{children}</div>
}

function CardHead({ icon: Icon, iconColor = 'text-gray-400', title, desc, action }) {
  return (
    <div className="flex items-center justify-between gap-2.5 px-5 py-4 border-b"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon size={15} className={iconColor} />}
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

const STATUS_BADGE = {
  reservada:    { cls: 'bg-blue-50 text-blue-700',    dot: 'bg-blue-500',    label: 'Reservada'    },
  en_revision:  { cls: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-400',   label: 'En revisión'  },
  observada:    { cls: 'bg-orange-50 text-orange-700',dot: 'bg-orange-400',  label: 'Observada'    },
  subsanada:    { cls: 'bg-indigo-50 text-indigo-700',dot: 'bg-indigo-400',  label: 'Subsanada'    },
  liquidada:    { cls: 'bg-green-50 text-green-700',  dot: 'bg-green-500',   label: 'Liquidada'    },
  anulada:      { cls: 'bg-red-50 text-red-600',      dot: 'bg-red-400',     label: 'Anulada'      },
  pendiente_abono: { cls: 'bg-violet-50 text-violet-700', dot: 'bg-violet-400', label: 'Pdte. abono' },
}

function EstadoBadge({ estado }) {
  const m = STATUS_BADGE[estado] ?? { cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', label: estado }
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', m.cls)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  )
}

/* ══════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════ */
const OPS = [
  { id: 'OP-2026-001', cliente: 'Empresa Industrial Inca S.A.C.',  tipo: 'compra', monto: 50_000,  tc: 3.742, estado: 'reservada',    hora: '09:15', trader: 'Andrés Valdivia C.', mesa: 'Mesa Alpha' },
  { id: 'OP-2026-002', cliente: 'Textiles del Sur E.I.R.L.',       tipo: 'venta',  monto: 25_000,  tc: 3.738, estado: 'observada',    hora: '10:30', trader: 'Karla Mendoza R.',   mesa: 'Mesa Beta'  },
  { id: 'OP-2026-003', cliente: 'Grupo Minero Los Andes S.A.',     tipo: 'compra', monto: 120_000, tc: 3.741, estado: 'en_revision',  hora: '08:50', trader: 'Rodrigo Paredes F.', mesa: 'Mesa Alpha' },
  { id: 'OP-2026-004', cliente: 'Consorcio Lima Norte S.A.C.',     tipo: 'venta',  monto: 15_000,  tc: 3.739, estado: 'subsanada',    hora: '16:20', trader: 'Sofía Ríos M.',      mesa: 'Mesa Beta'  },
  { id: 'OP-2026-005', cliente: 'Importadora del Pacífico S.A.',   tipo: 'compra', monto: 80_000,  tc: 3.740, estado: 'reservada',    hora: '11:05', trader: 'Andrés Valdivia C.', mesa: 'Mesa Alpha' },
  { id: 'OP-2026-006', cliente: 'Distribuidora Norte EIRL',         tipo: 'venta',  monto: 8_500,   tc: 3.744, estado: 'liquidada',    hora: '14:15', trader: 'César Huanca P.',    mesa: 'Mesa Gamma' },
  { id: 'OP-2026-007', cliente: 'Farmacéutica Andina S.A.',         tipo: 'compra', monto: 45_000,  tc: 3.743, estado: 'anulada',      hora: '10:00', trader: 'Rodrigo Paredes F.', mesa: 'Mesa Alpha' },
  { id: 'OP-2026-008', cliente: 'Textiles del Sur E.I.R.L.',       tipo: 'venta',  monto: 12_000,  tc: 3.737, estado: 'observada',    hora: '13:40', trader: 'Luis Fernández A.',  mesa: 'Mesa Gamma' },
]

const ACTIVIDAD_TRADER = [
  { hora: '11:05', evento: 'Operación reservada', obj: 'OP-2026-005', detalle: 'Compra USD 80,000 · TC 3.740' },
  { hora: '09:15', evento: 'Operación reservada', obj: 'OP-2026-001', detalle: 'Compra USD 50,000 · TC 3.742' },
  { hora: '09:05', evento: 'Inicio de sesión',    obj: '—',           detalle: 'Acceso desde 192.168.1.45'   },
]

const ACTIVIDAD_MIDDLE = [
  { hora: '11:10', evento: 'Observación registrada', obj: 'OP-2026-002', detalle: 'Comprobante adjunto ilegible.' },
  { hora: '09:45', evento: 'Operación aprobada',     obj: 'OP-2026-003', detalle: 'Verificación completada → Liquidar.' },
  { hora: '09:12', evento: 'Inicio de sesión',       obj: '—',           detalle: 'Acceso desde 192.168.1.23' },
]

const ACTIVIDAD_BACK = [
  { hora: '14:30', evento: 'Voucher verificado',     obj: 'OP-2026-003', detalle: 'Comprobante válido — en proceso.' },
  { hora: '13:50', evento: 'Observación emitida',    obj: 'OP-2026-008', detalle: 'Cuenta de ingreso no coincide.' },
  { hora: '12:00', evento: 'Abono confirmado',       obj: 'OP-2026-006', detalle: 'Transferencia BCP-2026-00412.' },
]

const ACTIVIDAD_TESORERIA = [
  { hora: '15:45', evento: 'TC SBS registrado',      obj: 'TC-SBS',       detalle: 'TC diario: 3.742' },
  { hora: '13:40', evento: 'Diferencia registrada',  obj: 'CONC-0042',    detalle: 'S/ 245.00 — BCP cuenta PEN.' },
  { hora: '12:01', evento: 'Inicio de cierre',       obj: 'CIE-20260426', detalle: 'Cierre operativo iniciado.' },
]

const BANCOS_STATUS = [
  { banco: 'BCP',  cta: '191-2334-USD',  saldo: '$ 485,200', estado: 'ok'      },
  { banco: 'IBK',  cta: '200-9881-USD',  saldo: '$ 120,400', estado: 'warning' },
  { banco: 'BBVA', cta: '011-4432-PEN',  saldo: 'S/ 890,100',estado: 'ok'      },
  { banco: 'SCO',  cta: '014-7721-PEN',  saldo: 'S/ 54,300', estado: 'ok'      },
]

/* ══════════════════════════════════════════════
   DASHBOARD TRADER
══════════════════════════════════════════════ */
function DashboardTrader({ tcSbs, onGoTo }) {
  const mis_ops  = OPS.filter(o => o.trader === 'Andrés Valdivia C.')
  const volumen  = mis_ops.reduce((s, o) => s + o.monto, 0)
  const tcCompra = tcSbs?.t ? (tcSbs.t - 0.004).toFixed(3) : '3.738'
  const tcVenta  = tcSbs?.t ? (tcSbs.t + 0.003).toFixed(3) : '3.745'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Mis operaciones hoy" value={mis_ops.length}      icon={ArrowLeftRight} iconColor="text-blue-500" />
        <StatCard label="Mi volumen (USD)"    value={`$ ${(volumen / 1000).toFixed(0)}K`} icon={TrendingUp} iconColor="text-green-500" color="text-green-600" />
        <StatCard label="TC Pizarra compra"   value={tcCompra}             icon={BadgeDollarSign} iconColor="text-blue-400"  color="text-blue-700" sub="Pizarra QAPAQ" />
        <StatCard label="TC Pizarra venta"    value={tcVenta}              icon={BadgeDollarSign} iconColor="text-indigo-400" color="text-indigo-700" sub="Pizarra QAPAQ" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <CardWrap>
            <CardHead icon={ArrowLeftRight} iconColor="text-blue-500" title="Mis operaciones del día" desc="Estado actual de cada operación que ingresé"
              action={<button onClick={() => onGoTo?.('operaciones', 'bandeja')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ver bandeja <ChevronRight size={11} /></button>} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Cliente</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Tipo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Monto USD</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">TC</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Hora</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {mis_ops.map(op => (
                    <tr key={op.id} className="border-b hover:bg-gray-50/60 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-700">{op.id}</span></td>
                      <td className="px-4 py-2.5"><span className="text-xs text-gray-700">{op.cliente}</span></td>
                      <td className="px-4 py-2.5">
                        <span className={clsx('text-xs font-semibold', op.tipo === 'compra' ? 'text-blue-600' : 'text-violet-600')}>
                          {op.tipo === 'compra' ? 'Compra' : 'Venta'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-800">$ {op.monto.toLocaleString()}</span></td>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs text-gray-600">{op.tc}</span></td>
                      <td className="px-4 py-2.5"><span className="text-xs text-gray-500">{op.hora}</span></td>
                      <td className="px-4 py-2.5"><EstadoBadge estado={op.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardWrap>
        </div>

        <CardWrap>
          <CardHead icon={Activity} iconColor="text-teal-500" title="Actividad reciente" desc="Mis últimas acciones del día" />
          <div className="px-5 py-3 space-y-0">
            {ACTIVIDAD_TRADER.map((ev, i) => (
              <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{ev.evento}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ev.detalle}</p>
                    {ev.obj !== '—' && <p className="text-[10px] text-blue-600 font-bold mt-0.5">{ev.obj}</p>}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 shrink-0">{ev.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </CardWrap>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   DASHBOARD HEAD DE MESA
══════════════════════════════════════════════ */
function DashboardHead({ tcSbs, onGoTo }) {
  const activas  = OPS.filter(o => !['anulada', 'liquidada'].includes(o.estado)).length
  const volumen  = OPS.reduce((s, o) => s + o.monto, 0)
  const traders  = [...new Set(OPS.map(o => o.trader))].length
  const tcRef    = tcSbs?.t?.toFixed(3) ?? '3.742'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Ops. activas de la mesa" value={activas}    icon={ArrowLeftRight} iconColor="text-blue-500" color="text-blue-600" />
        <StatCard label="Volumen total hoy (USD)"  value={`$ ${(volumen / 1000).toFixed(0)}K`} icon={TrendingUp} iconColor="text-green-500" color="text-green-600" />
        <StatCard label="Traders operando"          value={`${traders} / 8`}   icon={Users} iconColor="text-indigo-500" />
        <StatCard label="TC SBS referencial"        value={tcRef}    icon={BadgeDollarSign} iconColor="text-amber-500" color="text-amber-700" sub="Vigente hoy" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <CardWrap>
            <CardHead icon={Activity} iconColor="text-blue-500" title="Operaciones de la mesa" desc="Todas las operaciones del día — todos los traders"
              action={<button onClick={() => onGoTo?.('operaciones', 'bandeja')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ver bandeja <ChevronRight size={11} /></button>} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Trader</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Tipo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Monto USD</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">TC</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {OPS.map(op => (
                    <tr key={op.id} className="border-b hover:bg-gray-50/60 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-700">{op.id}</span></td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-800">{op.trader}</p>
                        <p className="text-[10px] text-gray-400">{op.mesa}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={clsx('text-xs font-semibold', op.tipo === 'compra' ? 'text-blue-600' : 'text-violet-600')}>
                          {op.tipo === 'compra' ? 'Compra' : 'Venta'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-800">$ {op.monto.toLocaleString()}</span></td>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs text-gray-600">{op.tc}</span></td>
                      <td className="px-4 py-2.5"><EstadoBadge estado={op.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardWrap>
        </div>

        <div className="space-y-3">
          {/* Distribución por trader */}
          <CardWrap>
            <CardHead icon={Users} iconColor="text-indigo-500" title="Actividad por trader"
            action={<button onClick={() => onGoTo?.('operaciones', 'bandeja')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Bandeja <ChevronRight size={11} /></button>} />
            <div className="px-5 py-3 space-y-0">
              {[...new Set(OPS.map(o => o.trader))].map(t => {
                const tOps = OPS.filter(o => o.trader === t)
                const tVol = tOps.reduce((s, o) => s + o.monto, 0)
                return (
                  <div key={t} className="flex items-center justify-between py-2.5 border-b last:border-0"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <p className="text-xs font-medium text-gray-800">{t.split(' ')[0]} {t.split(' ')[1]?.[0]}.</p>
                      <p className="text-[10px] text-gray-400">{tOps.length} op{tOps.length !== 1 ? 's' : '.'}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-gray-700">$ {(tVol / 1000).toFixed(0)}K</span>
                  </div>
                )
              })}
            </div>
          </CardWrap>

          {/* Límites */}
          <CardWrap>
            <CardHead icon={ShieldAlert} iconColor="text-amber-500" title="Exposición vs límites" />
            <div className="px-5 py-4 space-y-2">
              {[
                { label: 'Límite general',  used: volumen,   max: 5_000_000  },
                { label: 'Límite diario',   used: volumen,   max: 10_000_000 },
              ].map(({ label, used, max }) => {
                const pct = Math.round((used / max) * 100)
                const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-400' : 'bg-green-500'
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-600">{label}</span>
                      <span className="text-[11px] font-semibold text-gray-800">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardWrap>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   DASHBOARD MIDDLE OFFICE
══════════════════════════════════════════════ */
function DashboardMiddle({ onGoTo }) {
  const enRevision  = OPS.filter(o => o.estado === 'en_revision').length
  const observadas  = OPS.filter(o => o.estado === 'observada').length
  const liquidadas  = OPS.filter(o => o.estado === 'liquidada').length
  const pendientes  = OPS.filter(o => ['en_revision', 'subsanada'].includes(o.estado))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="En revisión ahora"  value={enRevision} icon={Clock}          iconColor="text-amber-500"  color="text-amber-600"  sub="Pendientes de revisión" />
        <StatCard label="Observadas"          value={observadas} icon={AlertTriangle}   iconColor="text-orange-500" color="text-orange-600" sub="Esperando trader" />
        <StatCard label="Aprobadas hoy"       value={liquidadas} icon={CheckCircle2}    iconColor="text-green-500"  color="text-green-600"  />
        <StatCard label="SLA promedio"        value="4.2 min"   icon={Zap}             iconColor="text-blue-500"   sub="Objetivo < 5 min"  />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <CardWrap>
            <CardHead icon={Clock} iconColor="text-amber-500" title="Cola de revisión" desc="Operaciones pendientes de acción del Middle Office"
              action={<button onClick={() => onGoTo?.('operaciones', 'revision_back_office')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ir a revisiones <ChevronRight size={11} /></button>} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Cliente</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Trader</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Monto USD</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Hora</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientes.map(op => (
                    <tr key={op.id} className="border-b hover:bg-gray-50/60 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-700">{op.id}</span></td>
                      <td className="px-4 py-2.5"><span className="text-xs text-gray-700">{op.cliente}</span></td>
                      <td className="px-4 py-2.5"><span className="text-xs text-gray-600">{op.trader}</span></td>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-800">$ {op.monto.toLocaleString()}</span></td>
                      <td className="px-4 py-2.5"><span className="text-xs text-gray-500">{op.hora}</span></td>
                      <td className="px-4 py-2.5"><EstadoBadge estado={op.estado} /></td>
                    </tr>
                  ))}
                  {pendientes.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-300">Sin operaciones pendientes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardWrap>
        </div>

        <CardWrap>
          <CardHead icon={Activity} iconColor="text-teal-500" title="Actividad reciente" desc="Mis últimas acciones de revisión" />
          <div className="px-5 py-3 space-y-0">
            {ACTIVIDAD_MIDDLE.map((ev, i) => (
              <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{ev.evento}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ev.detalle}</p>
                    {ev.obj !== '—' && <p className="text-[10px] text-blue-600 font-bold mt-0.5">{ev.obj}</p>}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 shrink-0">{ev.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </CardWrap>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   DASHBOARD BACK OFFICE
══════════════════════════════════════════════ */
function DashboardBackOffice({ onGoTo }) {
  const enRevision = OPS.filter(o => o.estado === 'en_revision')
  const observadas = OPS.filter(o => o.estado === 'observada').length
  const liquidadas = OPS.filter(o => o.estado === 'liquidada').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Para verificar"     value={enRevision.length} icon={Clock}       iconColor="text-amber-500"  color="text-amber-600" sub="Comprobantes pendientes" />
        <StatCard label="Observadas activas" value={observadas}        icon={AlertTriangle}iconColor="text-orange-500" color="text-orange-600" />
        <StatCard label="Liquidadas hoy"     value={liquidadas}        icon={CheckCircle2} iconColor="text-green-500"  color="text-green-600" />
        <StatCard label="SLA promedio BO"    value="3.8 min"          icon={Zap}          iconColor="text-blue-500"   sub="Objetivo < 5 min" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <CardWrap>
            <CardHead icon={FileText} iconColor="text-amber-500" title="Cola Back Office" desc="Operaciones pendientes de verificación documental"
              action={<button onClick={() => onGoTo?.('operaciones', 'revision_back_office')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ver cola <ChevronRight size={11} /></button>} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Cliente</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Monto USD</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Hora</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {enRevision.map(op => (
                    <tr key={op.id} className="border-b hover:bg-gray-50/60 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-700">{op.id}</span></td>
                      <td className="px-4 py-2.5"><span className="text-xs text-gray-700">{op.cliente}</span></td>
                      <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold text-gray-800">$ {op.monto.toLocaleString()}</span></td>
                      <td className="px-4 py-2.5"><span className="text-xs text-gray-500">{op.hora}</span></td>
                      <td className="px-4 py-2.5"><EstadoBadge estado={op.estado} /></td>
                    </tr>
                  ))}
                  {enRevision.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-300">Cola vacía</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardWrap>
        </div>

        <CardWrap>
          <CardHead icon={Activity} iconColor="text-teal-500" title="Actividad Back Office" />
          <div className="px-5 py-3 space-y-0">
            {ACTIVIDAD_BACK.map((ev, i) => (
              <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{ev.evento}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ev.detalle}</p>
                    {ev.obj !== '—' && <p className="text-[10px] text-blue-600 font-bold mt-0.5">{ev.obj}</p>}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 shrink-0">{ev.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </CardWrap>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   DASHBOARD TESORERÍA
══════════════════════════════════════════════ */
function DashboardTesoreria({ tcSbs, onGoTo }) {
  const tcRef   = tcSbs?.t?.toFixed(3) ?? '3.742'
  const volumen = OPS.reduce((s, o) => s + o.monto, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Posición neta USD"   value={`$ ${(volumen / 1000).toFixed(0)}K`} icon={BadgeDollarSign} iconColor="text-blue-500"  color="text-blue-700"  />
        <StatCard label="Saldo total bancos"   value="$ 605.6K"                             icon={Landmark}        iconColor="text-green-500" color="text-green-600" sub="Cuentas USD + PEN" />
        <StatCard label="TC SBS hoy"           value={tcRef}                                icon={TrendingUp}      iconColor="text-amber-500" color="text-amber-700" sub="Vigente" />
        <StatCard label="Estado del cierre"    value="Pendiente"                            icon={RefreshCw}       iconColor="text-violet-500" color="text-violet-700" sub="Programado 18:00" />
      </div>

      <div className="grid grid-cols-3 gap-3">

        {/* Saldos bancarios */}
        <CardWrap>
          <CardHead icon={Landmark} iconColor="text-blue-500" title="Saldos bancarios" desc="Estado de cuentas operativas QAPAQ"
            action={<button onClick={() => onGoTo?.('tesoreria', 'posicion')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ver posición <ChevronRight size={11} /></button>} />
          <div className="px-5 py-3 space-y-0">
            {BANCOS_STATUS.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <p className="text-xs font-medium text-gray-800">{b.banco}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{b.cta}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-800">{b.saldo}</span>
                  <span className={clsx('w-2 h-2 rounded-full', b.estado === 'ok' ? 'bg-green-500' : 'bg-amber-400')} />
                </div>
              </div>
            ))}
          </div>
        </CardWrap>

        {/* Actividad tesorería */}
        <CardWrap>
          <CardHead icon={Activity} iconColor="text-teal-500" title="Actividad reciente" desc="Mis últimas acciones del día" />
          <div className="px-5 py-3 space-y-0">
            {ACTIVIDAD_TESORERIA.map((ev, i) => (
              <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{ev.evento}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ev.detalle}</p>
                    {ev.obj !== '—' && <p className="text-[10px] text-blue-600 font-bold mt-0.5">{ev.obj}</p>}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400 shrink-0">{ev.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </CardWrap>

        {/* Estado del sistema para tesorería */}
        <CardWrap>
          <CardHead icon={Zap} iconColor="text-violet-500" title="Estado operativo" desc="Servicios relevantes para tesorería"
            action={<button onClick={() => onGoTo?.('tesoreria', 'cierre')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Cierre <ChevronRight size={11} /></button>} />
          <div className="px-5 py-3 space-y-0">
            {[
              { label: 'Datatec TC Feed',    status: 'ok',      note: 'Actualizado ahora'         },
              { label: 'TC SBS del día',     status: 'ok',      note: `Registrado: ${tcRef}`      },
              { label: 'Cierre diario',      status: 'pending', note: 'Programado para las 18:00' },
              { label: 'Conciliación BCP',   status: 'ok',      note: 'Sin diferencias pendientes'},
              { label: 'Reporte BCRP',       status: 'pending', note: 'Pendiente de generación'   },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs text-gray-600">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={clsx('text-[10px] text-gray-400')}>{item.note}</span>
                  <span className={clsx('w-2 h-2 rounded-full shrink-0',
                    item.status === 'ok' ? 'bg-green-500' : 'bg-amber-400')} />
                </div>
              </div>
            ))}
          </div>
        </CardWrap>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   DASHBOARD GERENCIAL (solo métricas)
══════════════════════════════════════════════ */
function DashboardGerencial({ tcSbs, onGoTo }) {
  const tcRef    = tcSbs?.t?.toFixed(3) ?? '3.742'
  const volumen  = OPS.reduce((s, o) => s + o.monto, 0)
  const spread   = 0.007
  const utilidad = Math.round(volumen * spread)
  const liquidadas = OPS.filter(o => o.estado === 'liquidada').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Volumen operado USD"  value={`$ ${(volumen / 1000).toFixed(0)}K`} icon={TrendingUp}      iconColor="text-blue-500"  color="text-blue-700"  />
        <StatCard label="Utilidad estimada"     value={`S/ ${utilidad.toLocaleString()}`}   icon={BadgeDollarSign} iconColor="text-green-500" color="text-green-600" sub={`TC SBS ${tcRef}`} />
        <StatCard label="Ops. completadas hoy"  value={liquidadas}                          icon={CheckCircle2}    iconColor="text-teal-500"  color="text-teal-600"  />
        <StatCard label="Spread promedio"       value={`${(spread * 100).toFixed(2)}%`}    icon={BarChart2}       iconColor="text-violet-500" sub="Compra/venta" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CardWrap>
          <CardHead icon={ArrowLeftRight} iconColor="text-blue-500" title="Distribución de operaciones" desc="Composición del volumen del día" />
          <div className="px-5 py-5 space-y-3">
            {[
              { label: 'Compras',   pct: 58, color: 'bg-blue-500',    count: OPS.filter(o => o.tipo === 'compra').length },
              { label: 'Ventas',    pct: 35, color: 'bg-violet-500',  count: OPS.filter(o => o.tipo === 'venta').length  },
              { label: 'Anuladas',  pct: 7,  color: 'bg-red-400',     count: OPS.filter(o => o.estado === 'anulada').length },
            ].map(({ label, pct, color, count }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600">{label}</span>
                  <span className="text-xs font-semibold text-gray-800">{pct}% · {count} ops</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardWrap>

        <CardWrap>
          <CardHead icon={Users} iconColor="text-indigo-500" title="Rendimiento por mesa" desc="Volumen y operaciones del día" />
          <div className="px-5 py-4 space-y-2">
            {['Mesa Alpha', 'Mesa Beta', 'Mesa Gamma'].map(mesa => {
              const mOps = OPS.filter(o => o.mesa === mesa)
              const mVol = mOps.reduce((s, o) => s + o.monto, 0)
              const pct  = Math.round((mVol / volumen) * 100)
              return (
                <div key={mesa} className="p-3 rounded-lg" style={{ background: 'var(--color-surface-bg)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-700">{mesa}</span>
                    <span className="font-mono text-xs font-bold text-gray-800">$ {(mVol / 1000).toFixed(0)}K · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardWrap>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SIN PANEL
══════════════════════════════════════════════ */
function DashboardSinPanel() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <BarChart2 size={22} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Sin panel asignado</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Tu rol no tiene un panel de control asignado. Usa el menú lateral para acceder a los módulos disponibles para ti.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ROUTER PRINCIPAL
══════════════════════════════════════════════ */
export default function DashboardsPage({ role, tcSbs, onGoTo }) {
  switch (role) {
    case 'head':
    case 'jefe':      return <DashboardHead tcSbs={tcSbs} onGoTo={onGoTo} />
    case 'trader':    return <DashboardTrader tcSbs={tcSbs} onGoTo={onGoTo} />
    case 'middle':    return <DashboardMiddle onGoTo={onGoTo} />
    case 'back':      return <DashboardBackOffice onGoTo={onGoTo} />
    case 'tesoreria': return <DashboardTesoreria tcSbs={tcSbs} onGoTo={onGoTo} />
    case 'gerente':   return <DashboardGerencial tcSbs={tcSbs} onGoTo={onGoTo} />
    case 'contab':    return <DashboardSinPanel />
    default:          return <DashboardTrader tcSbs={tcSbs} onGoTo={onGoTo} />
  }
}
