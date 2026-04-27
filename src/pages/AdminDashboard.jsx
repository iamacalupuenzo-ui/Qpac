import {
  Users, ShieldCheck, Settings2, LogIn, Lock, Timer, Clock, Link2,
  Landmark, CircleDollarSign, TriangleAlert, CreditCard, Edit2,
  Activity, Cpu, WifiOff, CheckCircle2, ChevronRight,
  ArrowLeftRight, Building2, RefreshCw, Zap, AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   SHARED
══════════════════════════════════════════════ */
const bord = { border: '1px solid var(--color-border)' }

function StatCard({ label, value, color = 'text-gray-900', sub }) {
  return (
    <div className="bg-white rounded-lg px-4 py-3.5" style={bord}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
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
    <div className="flex items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={15} className={iconColor} />}
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

/* ══════════════════════════════════════════════
   DATA — RESUMEN
══════════════════════════════════════════════ */
const securityParams = [
  { icon: Lock,  label: 'Máx. intentos fallidos',  value: '5',  unit: 'intentos' },
  { icon: Timer, label: 'Bloqueo por intentos',     value: '15', unit: 'min'      },
  { icon: Clock, label: 'Inactividad de sesión',    value: '15', unit: 'min'      },
  { icon: Link2, label: 'Vigencia enlace reset',    value: '60', unit: 'min'      },
]

const operationalParams = [
  { label: 'Límite general',       value: '5,000,000',  unit: 'USD', mod: 'FX'  },
  { label: 'Tolerancia TC',        value: '2.5',         unit: '%',   mod: 'TC'  },
  { label: 'Umbral PLAFT',         value: '10,000',      unit: 'USD', mod: 'REG' },
  { label: 'Límite diario',        value: '10,000,000',  unit: 'USD', mod: 'FX'  },
]

const catalogStats = [
  { icon: Landmark,         label: 'Bancos',           active: 5, inactive: 1, color: 'blue'   },
  { icon: CircleDollarSign, label: 'Monedas',           active: 3, inactive: 3, color: 'green'  },
  { icon: TriangleAlert,    label: 'Causas anulación', active: 4, inactive: 1, color: 'amber'  },
  { icon: CreditCard,       label: 'Tipos contraparte',active: 5, inactive: 1, color: 'purple' },
]

const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-600'  },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600'  },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
}

const recentUsers = [
  { name: 'Andrés Valdivia C.', role: 'Trader',        status: 'activo',    lastLogin: 'Hoy 09:05' },
  { name: 'María Torres S.',    role: 'Middle Office', status: 'activo',    lastLogin: 'Hoy 09:12' },
  { name: 'Rosa Gutiérrez P.',  role: 'Tesorería',     status: 'activo',    lastLogin: 'Hoy 09:20' },
  { name: 'César Huanca P.',    role: 'Trader',        status: 'activo',    lastLogin: 'Hoy 09:35' },
  { name: 'Rodrigo Paredes F.', role: 'Trader',        status: 'bloqueado', lastLogin: '—'          },
]

const recentAudit = [
  { action: 'Moneda USD actualizada',         detail: 'Catálogos — decimales: 2',    time: 'Hoy 16:00' },
  { action: 'Cuenta bloqueada por Sistema',   detail: 'rodrigo.paredes — 5 intentos', time: 'Hoy 15:45' },
  { action: 'Desbloqueo manual de cuenta',    detail: 'rodrigo.paredes por Marco Q.', time: 'Hoy 15:30' },
  { action: 'Timeout de sesión modificado',   detail: '30 min → 15 min',              time: 'Hoy 14:10' },
  { action: 'Usuario creado — Trader Gamma',  detail: 'USR-015',                      time: 'Hoy 11:30' },
]

/* ══════════════════════════════════════════════
   DATA — ACTIVIDAD
══════════════════════════════════════════════ */
const RECENT_EVENTS = [
  { ts: '16:00', user: 'Andrés Valdivia C.', role: 'Trader',  mod: 'Catálogos',     event: 'Modificación',           detail: 'Moneda USD — decimales actualizados.',   type: 'config',   ok: true  },
  { ts: '15:45', user: 'Sistema',            role: 'Sistema', mod: 'Autenticación', event: 'Bloqueo de cuenta',      detail: 'rodrigo.paredes — 5 intentos fallidos.', type: 'security', ok: false },
  { ts: '15:30', user: 'Marco Quispe L.',    role: 'Admin',   mod: 'Usuarios',      event: 'Desbloqueo de cuenta',   detail: 'rodrigo.paredes desbloqueado.',           type: 'users',    ok: true  },
  { ts: '15:00', user: 'César Huanca P.',    role: 'Trader',  mod: 'Operaciones',   event: 'Anulación aprobada',     detail: 'OP-2026-005 — autorizada por Head.',      type: 'ops',      ok: true  },
  { ts: '14:25', user: 'Rodrigo Paredes F.', role: 'Trader',  mod: 'Autenticación', event: 'Login fallido',          detail: 'Contraseña incorrecta (intento 3/5).',    type: 'security', ok: false },
  { ts: '14:10', user: 'Marco Quispe L.',    role: 'Admin',   mod: 'Parámetros',    event: 'Modificación',           detail: 'sessionTimeout: 30 min → 15 min.',        type: 'config',   ok: true  },
  { ts: '13:55', user: 'Sistema',            role: 'Sistema', mod: 'PLAFT',          event: 'Alerta automática',      detail: 'OP-2026-010 supera umbral $10,000.',      type: 'ops',      ok: true  },
  { ts: '12:15', user: 'Marco Quispe L.',    role: 'Admin',   mod: 'Reportes',      event: 'Exportación',            detail: 'RO SBS descargado — 86 registros.',       type: 'config',   ok: true  },
  { ts: '11:30', user: 'Marco Quispe L.',    role: 'Admin',   mod: 'Usuarios',      event: 'Creación de usuario',    detail: 'USR-015 — Trader Mesa Gamma.',            type: 'users',    ok: true  },
  { ts: '11:05', user: 'Sistema',            role: 'Sistema', mod: 'Mercado TC',    event: 'Fallo de sincronización',detail: 'Datatec API — activado modo manual.',     type: 'security', ok: false },
  { ts: '10:33', user: 'Sofía Ríos M.',      role: 'Trader',  mod: 'Mercado TC',    event: 'Actualización pizarra',  detail: 'Compra 3.738 / Venta 3.745.',             type: 'ops',      ok: true  },
  { ts: '10:02', user: 'Rodrigo Paredes F.', role: 'Trader',  mod: 'Clientes',      event: 'Registro de cliente',    detail: 'CLI-009 — PJ, RUC 20567891234.',          type: 'clientes', ok: true  },
]

const SESSIONS_HOY = [
  { user: 'Marco Quispe L.',    role: 'Admin',         login: '09:03', active: true  },
  { user: 'Andrés Valdivia C.', role: 'Trader',        login: '09:05', active: true  },
  { user: 'María Torres S.',    role: 'Middle Office', login: '09:12', active: true  },
  { user: 'Rosa Gutiérrez P.',  role: 'Tesorería',     login: '09:20', active: true  },
  { user: 'Sofía Ríos M.',      role: 'Trader',        login: '09:28', active: true  },
  { user: 'César Huanca P.',    role: 'Trader',        login: '09:35', active: true  },
  { user: 'Karla Mendoza R.',   role: 'Trader',        login: '10:01', active: true  },
  { user: 'Luis Fernández A.',  role: 'Trader',        login: '09:44', active: false },
]

const TYPE_META = {
  config:   { label: 'Config.',   cls: 'bg-blue-50 text-blue-700'    },
  security: { label: 'Seguridad', cls: 'bg-red-50 text-red-600'      },
  users:    { label: 'Usuarios',  cls: 'bg-indigo-50 text-indigo-700' },
  ops:      { label: 'Ops',       cls: 'bg-teal-50 text-teal-700'    },
  clientes: { label: 'Clientes',  cls: 'bg-green-50 text-green-700'  },
}

/* ══════════════════════════════════════════════
   DATA — SISTEMA
══════════════════════════════════════════════ */
const CONNECTIONS = [
  { label: 'Datatec API (TC Live)',    status: 'ok',      note: 'Latencia 42 ms · actualizado ahora',  since: 'Hoy 09:05' },
  { label: 'Base de Datos Principal', status: 'ok',      note: 'PostgreSQL v15.4 · 99.9% uptime',     since: 'Continua'  },
  { label: 'Backup Automático',        status: 'ok',      note: 'Último snapshot completado hoy',       since: 'Hoy 12:30' },
  { label: 'Integración BCRP / SBS',  status: 'pending', note: 'Sin envíos pendientes hoy',            since: 'Manual'    },
  { label: 'Servicio de Alertas',      status: 'off',     note: 'No configurado en este entorno',       since: '—'         },
]

const ACTIVE_SESSIONS = [
  { user: 'Marco Quispe L.',    role: 'Admin',         since: '09:03', ip: '192.168.1.10' },
  { user: 'Andrés Valdivia C.', role: 'Trader',        since: '09:05', ip: '192.168.1.45' },
  { user: 'María Torres S.',    role: 'Middle Office', since: '09:12', ip: '192.168.1.23' },
  { user: 'Rosa Gutiérrez P.',  role: 'Tesorería',     since: '09:20', ip: '192.168.1.67' },
  { user: 'Sofía Ríos M.',      role: 'Trader',        since: '09:28', ip: '192.168.1.55' },
  { user: 'César Huanca P.',    role: 'Trader',        since: '09:35', ip: '192.168.1.78' },
  { user: 'Karla Mendoza R.',   role: 'Trader',        since: '10:01', ip: '192.168.1.82' },
]

const SCHEDULED_TASKS = [
  { name: 'Sincronización Datatec',   schedule: 'Continuo',     status: 'running',   lastRun: 'Ahora'      },
  { name: 'Cierre Diario',            schedule: 'Hoy 18:00',    status: 'pending',   lastRun: 'Ayer 18:02' },
  { name: 'Backup Automático',        schedule: 'Hoy 18:00',    status: 'pending',   lastRun: 'Hoy 12:30'  },
  { name: 'Reporte BCRP Adelantado',  schedule: 'Manual',       status: 'pending',   lastRun: 'Ayer 17:00' },
  { name: 'Archivo de Logs',          schedule: 'Cada 90 días', status: 'pending',   lastRun: '05/02/2026' },
]

const CONN_META = {
  ok:      { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700',  label: 'Operativo' },
  pending: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700',  label: 'Pendiente' },
  off:     { dot: 'bg-gray-300',  badge: 'bg-gray-100 text-gray-500',   label: 'Inactivo'  },
  error:   { dot: 'bg-red-500',   badge: 'bg-red-50 text-red-600',      label: 'Error'     },
}

const TASK_META = {
  running:   { cls: 'bg-blue-50 text-blue-700',   label: 'En curso'  },
  pending:   { cls: 'bg-gray-100 text-gray-500',  label: 'Pendiente' },
  completed: { cls: 'bg-green-50 text-green-700', label: 'Listo'     },
  failed:    { cls: 'bg-red-50 text-red-600',     label: 'Fallido'   },
}

/* ══════════════════════════════════════════════
   TAB: RESUMEN
══════════════════════════════════════════════ */
function TabResumen({ onGoTo }) {
  return (
    <div className="space-y-4">

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Usuarios totales"       value="18" color="text-gray-900"  sub="14 activos · 4 inactivos"  />
        <StatCard label="Inicios de sesión hoy"  value="12" color="text-blue-600"  sub="Primer acceso 09:03"        />
        <StatCard label="Sesiones activas ahora" value="7"  color="text-green-600" sub="En este momento"            />
        <StatCard label="Cambios de config. hoy" value="3"  color="text-gray-900"  sub="Últimas 24 horas"           />
      </div>

      {/* Parámetros */}
      <div className="grid grid-cols-2 gap-3">
        <CardWrap>
          <CardHead icon={Lock} iconColor="text-green-500" title="Parámetros de seguridad"
            action={<button onClick={() => onGoTo?.('parametros')} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"><Edit2 size={11} /> Editar</button>} />
          <div className="px-5 py-3 space-y-0">
            {securityParams.map(({ icon: Icon, label, value, unit }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <Icon size={13} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{value} <span className="font-normal text-gray-400">{unit}</span></span>
              </div>
            ))}
          </div>
        </CardWrap>

        <CardWrap>
          <CardHead icon={Settings2} iconColor="text-blue-500" title="Parámetros operativos"
            action={<button onClick={() => onGoTo?.('parametros')} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"><Edit2 size={11} /> Editar</button>} />
          <div className="px-5 py-3 space-y-0">
            {operationalParams.map(({ label, value, unit, mod }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 shrink-0">{mod}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{value} <span className="font-normal text-gray-400">{unit}</span></span>
              </div>
            ))}
          </div>
        </CardWrap>
      </div>

      {/* Usuarios + Catálogos + Auditoría */}
      <div className="grid grid-cols-3 gap-3">

        <CardWrap>
          <CardHead icon={Users} iconColor="text-indigo-500" title="Usuarios del sistema"
            action={<button onClick={() => onGoTo?.('usuarios', 'registrados')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todos <ChevronRight size={11} /></button>} />
          <div className="px-5 py-3 space-y-0">
            {recentUsers.map(({ name, role, status, lastLogin }) => (
              <div key={name} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500 shrink-0">
                    {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800 leading-none">{name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{role}</p>
                  </div>
                </div>
                <span className={clsx(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                  status === 'activo' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                )}>
                  <span className={clsx('w-1 h-1 rounded-full', status === 'activo' ? 'bg-green-500' : 'bg-red-400')} />
                  {status === 'activo' ? 'Activo' : 'Bloqueado'}
                </span>
              </div>
            ))}
          </div>
        </CardWrap>

        <CardWrap>
          <CardHead icon={Landmark} iconColor="text-amber-500" title="Estado de catálogos"
            action={<button onClick={() => onGoTo?.('catalogos', 'monedas')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Gestionar <ChevronRight size={11} /></button>} />
          <div className="px-5 py-4 space-y-2">
            {catalogStats.map(({ icon: Icon, label, active, inactive, color }) => {
              const c = colorMap[color]
              return (
                <div key={label} className="flex items-center justify-between p-2.5 rounded-lg"
                  style={{ background: 'var(--color-surface-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className={clsx('p-1.5 rounded-md', c.bg)}>
                      <Icon size={12} className={c.text} />
                    </div>
                    <span className="text-xs text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-gray-900">{active}</span>
                    <span className="text-gray-400">activos</span>
                    {inactive > 0 && <span className="text-amber-500 font-medium">· {inactive} inac.</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardWrap>

        <CardWrap>
          <CardHead icon={ShieldCheck} iconColor="text-violet-500" title="Últimos cambios"
            action={<button onClick={() => onGoTo?.('auditoria', 'log')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ver log <ChevronRight size={11} /></button>} />
          <div className="px-5 py-4 space-y-3">
            {recentAudit.map(({ action, detail, time }, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                  {i < recentAudit.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 leading-snug">{action}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{detail}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
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
   TAB: ACTIVIDAD RECIENTE
══════════════════════════════════════════════ */
function TabActividad({ onGoTo }) {
  const exitosos  = RECENT_EVENTS.filter(e => e.ok).length
  const fallidos  = RECENT_EVENTS.filter(e => !e.ok).length
  const seguridad = RECENT_EVENTS.filter(e => e.type === 'security').length
  const activas   = SESSIONS_HOY.filter(s => s.active).length

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Eventos registrados hoy" value={RECENT_EVENTS.length} color="text-gray-900" />
        <StatCard label="Exitosos"                 value={exitosos}             color="text-green-600" />
        <StatCard label="Alertas / Fallos"         value={fallidos}             color="text-red-500"   />
        <StatCard label="Sesiones abiertas hoy"    value={activas}              color="text-blue-600" sub={`${activas} activas ahora`} />
      </div>

      <div className="grid grid-cols-3 gap-3">

        {/* Timeline de eventos (col-span-2) */}
        <div className="col-span-2">
          <CardWrap>
            <CardHead icon={Activity} iconColor="text-blue-500"
              title="Eventos del día"
              desc="Acciones del sistema, configuración, operaciones y seguridad"
              action={<button onClick={() => onGoTo?.('auditoria', 'log')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Ver log completo <ChevronRight size={11} /></button>} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Hora</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Actor</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Módulo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Evento / Detalle</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Tipo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_EVENTS.map((ev, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50/60 transition-colors"
                      style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs font-bold text-gray-800">{ev.ts}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-900">{ev.user}</p>
                        <p className="text-[10px] text-gray-400">{ev.role}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-600">{ev.mod}</span>
                      </td>
                      <td className="px-4 py-2.5 max-w-[200px]">
                        <p className="text-xs font-medium text-gray-800">{ev.event}</p>
                        <p className="text-[10px] text-gray-500 truncate" title={ev.detail}>{ev.detail}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={clsx(
                          'inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium',
                          (TYPE_META[ev.type] ?? TYPE_META.config).cls
                        )}>
                          {(TYPE_META[ev.type] ?? TYPE_META.config).label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium',
                          ev.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        )}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', ev.ok ? 'bg-green-500' : 'bg-red-500')} />
                          {ev.ok ? 'Éxito' : 'Fallo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardWrap>
        </div>

        {/* Sesiones del día */}
        <CardWrap>
          <CardHead icon={Users} iconColor="text-indigo-500"
            title="Sesiones de hoy"
            desc={`${activas} activas · ${SESSIONS_HOY.length} ingresos`}
            action={<button onClick={() => onGoTo?.('usuarios', 'registrados')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Usuarios <ChevronRight size={11} /></button>} />
          <div className="px-5 py-3 space-y-0">
            {SESSIONS_HOY.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500 shrink-0">
                    {s.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-none truncate">{s.user}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.role} · {s.login}</p>
                  </div>
                </div>
                <span className={clsx(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2',
                  s.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                )}>
                  <span className={clsx('w-1 h-1 rounded-full', s.active ? 'bg-green-500' : 'bg-gray-300')} />
                  {s.active ? 'Activa' : 'Cerrada'}
                </span>
              </div>
            ))}
          </div>
        </CardWrap>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   TAB: ESTADO DEL SISTEMA
══════════════════════════════════════════════ */
function TabSistema({ onGoTo }) {
  const connOk = CONNECTIONS.filter(c => c.status === 'ok').length

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Sesiones activas"       value={ACTIVE_SESSIONS.length} color="text-blue-600"  />
        <StatCard label="Conexiones operativas"  value={`${connOk} / ${CONNECTIONS.length}`} color={connOk === CONNECTIONS.length ? 'text-green-600' : 'text-amber-600'} />
        <StatCard label="Último backup"          value="Hoy 12:30"              color="text-green-600" sub="Completado correctamente" />
        <StatCard label="Versión del sistema"    value="v1.2.0"                 color="text-gray-900"  sub="Producción" />
      </div>

      <div className="grid grid-cols-3 gap-3">

        {/* Conexiones */}
        <CardWrap>
          <CardHead icon={Cpu} iconColor="text-blue-500"
            title="Estado de conexiones"
            desc="Servicios externos e integraciones"
            action={<button onClick={() => onGoTo?.('parametros')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Parámetros <ChevronRight size={11} /></button>} />
          <div className="px-5 py-3 space-y-0">
            {CONNECTIONS.map((conn, i) => {
              const m = CONN_META[conn.status]
              return (
                <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{conn.label}</span>
                    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', m.badge)}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full', m.dot)} />
                      {m.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">{conn.note}</p>
                </div>
              )
            })}
          </div>
        </CardWrap>

        {/* Sesiones activas */}
        <CardWrap>
          <CardHead icon={Users} iconColor="text-green-500"
            title="Sesiones activas"
            desc={`${ACTIVE_SESSIONS.length} usuarios conectados ahora`}
            action={<button onClick={() => onGoTo?.('usuarios', 'registrados')} className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium">Gestionar <ChevronRight size={11} /></button>} />
          <div className="px-5 py-3 space-y-0">
            {ACTIVE_SESSIONS.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-[10px] font-semibold text-green-700">
                      {s.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-none truncate">{s.user}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.role}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-[10px] font-mono text-gray-500">desde {s.since}</p>
                  <p className="text-[10px] text-gray-300">{s.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </CardWrap>

        {/* Tareas programadas */}
        <CardWrap>
          <CardHead icon={RefreshCw} iconColor="text-violet-500"
            title="Tareas programadas"
            desc="Procesos automáticos y pendientes" />
          <div className="px-5 py-3 space-y-0">
            {SCHEDULED_TASKS.map((task, i) => {
              const m = TASK_META[task.status]
              return (
                <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-800 leading-snug">{task.name}</span>
                    <span className={clsx('inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0', m.cls)}>
                      {m.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">Próximo: {task.schedule}</p>
                    <p className="text-[10px] text-gray-300">Último: {task.lastRun}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardWrap>
      </div>

      {/* Alerta de ambiente */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
        <ShieldCheck size={13} className="text-blue-400 shrink-0" />
        <p className="text-[11px] text-gray-500">
          Ambiente: <span className="font-semibold text-gray-700">Producción</span> ·
          Versión: <span className="font-semibold text-gray-700">v1.2.0</span> ·
          Datos de conexión actualizados en tiempo real. Para cambios de infraestructura acceder al panel DevOps.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   EXPORT
══════════════════════════════════════════════ */
export default function AdminDashboard({ activeTab = 'resumen', onGoTo }) {
  if (activeTab === 'actividad') return <TabActividad onGoTo={onGoTo} />
  if (activeTab === 'sistema')   return <TabSistema onGoTo={onGoTo} />
  return <TabResumen onGoTo={onGoTo} />
}
