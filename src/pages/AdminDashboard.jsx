import {
  Users, ShieldCheck, Settings2, Database,
  TrendingUp, LogIn, AlertTriangle, CheckCircle2,
  Clock, ChevronRight, Lock, Timer, RefreshCw, Link2,
  Landmark, CircleDollarSign, TriangleAlert, CreditCard,
  Edit2,
} from 'lucide-react'
import clsx from 'clsx'

/* ── helpers ── */
const card = 'bg-white rounded-lg p-5'
const cardStyle = { border: '1px solid var(--color-border)' }

function SectionTitle({ children }) {
  return <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</h2>
}

function KpiCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className={card} style={cardStyle}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={clsx('p-1.5 rounded-lg', accent ? 'bg-blue-50' : 'bg-gray-50')}>
          <Icon size={14} className={accent ? 'text-blue-600' : 'text-gray-400'} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

/* ── datos mock ── */
const securityParams = [
  { icon: Lock,    label: 'Máx. intentos fallidos',          value: '5',  unit: 'intentos', default: 5,  min: 3,  max: 10 },
  { icon: Timer,   label: 'Bloqueo por intentos (min)',      value: '15', unit: 'min',      default: 15, min: 5  },
  { icon: Clock,   label: 'Inactividad de sesión (min)',     value: '30', unit: 'min',      default: 30, min: 10 },
  { icon: Link2,   label: 'Vigencia enlace reset (min)',     value: '60', unit: 'min',      default: 60, min: 15 },
]

const operationalParams = [
  { label: 'Días estado "Activo en proceso"', value: '30',     unit: 'días',    module: 'M0' },
  { label: 'Límite BCP — USD',                value: '500,000', unit: 'USD',     module: 'M3' },
  { label: 'Límite BCP — PEN',                value: '1,800,000', unit: 'PEN',   module: 'M3' },
  { label: 'Límite BBVA — USD',               value: '300,000', unit: 'USD',     module: 'M3' },
]

const catalogs = [
  { icon: Landmark,        label: 'Bancos',               active: 6,  inactive: 1, color: 'blue'   },
  { icon: CircleDollarSign,label: 'Monedas',              active: 4,  inactive: 0, color: 'green'  },
  { icon: TriangleAlert,   label: 'Leyenda de errores',   active: 12, inactive: 2, color: 'amber'  },
  { icon: CreditCard,      label: 'Tipos de cuenta',      active: 2,  inactive: 0, color: 'purple' },
]

const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-600'  },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600'  },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
}

const recentUsers = [
  { name: 'Carlos Medina',   role: 'Trader',        status: 'activo',   lastLogin: 'Hoy 08:32' },
  { name: 'Ana Torres',      role: 'Back Office',   status: 'activo',   lastLogin: 'Hoy 08:15' },
  { name: 'Luis Paredes',    role: 'Middle Office', status: 'activo',   lastLogin: 'Hoy 09:01' },
  { name: 'Rosa Chávez',     role: 'Tesorería',     status: 'activo',   lastLogin: 'Ayer 17:44' },
  { name: 'Jorge Quispe',    role: 'Trader',        status: 'bloqueado', lastLogin: 'Ayer 11:20' },
]

const auditLog = [
  { user: 'admin@qapaq.com.pe', action: 'Modificó parámetro',  detail: 'Intentos máximos: 3 → 5',            time: 'Hoy 07:45' },
  { user: 'admin@qapaq.com.pe', action: 'Inhabilitó banco',    detail: 'Banco Pichincha → Inactivo',          time: 'Ayer 16:30' },
  { user: 'admin@qapaq.com.pe', action: 'Nuevo código error',  detail: 'BO-014 agregado a leyenda',           time: 'Ayer 14:12' },
  { user: 'admin@qapaq.com.pe', action: 'Modificó límite',     detail: 'BCP USD: 400,000 → 500,000',         time: '06/04 10:05' },
  { user: 'admin@qapaq.com.pe', action: 'Creó usuario',        detail: 'jorge.quispe — Rol: Trader',          time: '05/04 09:22' },
]

/* ── componente principal ── */
export default function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users}       label="Usuarios totales"       value="18"  sub="14 activos · 4 inactivos"     accent />
        <KpiCard icon={LogIn}       label="Inicios de sesión hoy"  value="11"  sub="Primer acceso 07:58"               />
        <KpiCard icon={ShieldCheck} label="Sesiones activas"       value="7"   sub="En este momento"              accent />
        <KpiCard icon={Settings2}   label="Cambios de config."     value="4"   sub="Últimos 7 días"                    />
      </div>

      {/* ── Fila 2: Parámetros ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Parámetros de seguridad */}
        <div className={card} style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Parámetros de seguridad</SectionTitle>
            <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <Edit2 size={12} /> Editar
            </button>
          </div>
          <div className="space-y-3">
            {securityParams.map(({ icon: Icon, label, value, unit }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-gray-50">
                    <Icon size={13} className="text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                  <span className="text-xs text-gray-400">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parámetros operativos */}
        <div className={card} style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Parámetros operativos</SectionTitle>
            <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
              <Edit2 size={12} /> Editar
            </button>
          </div>
          <div className="space-y-3">
            {operationalParams.map(({ label, value, unit, module: mod }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">
                    {mod}
                  </span>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                  <span className="text-xs text-gray-400">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fila 3: Usuarios + Catálogos + Auditoría ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Usuarios recientes */}
        <div className={card} style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Usuarios del sistema</SectionTitle>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5">
              Ver todos <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentUsers.map(({ name, role, status, lastLogin }) => (
              <div key={name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500 shrink-0">
                    {name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800 leading-none">{name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                    status === 'activo'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  )}>
                    <span className={clsx('w-1 h-1 rounded-full', status === 'activo' ? 'bg-green-500' : 'bg-red-400')} />
                    {status === 'activo' ? 'Activo' : 'Bloqueado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catálogos */}
        <div className={card} style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Estado de catálogos</SectionTitle>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5">
              Gestionar <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {catalogs.map(({ icon: Icon, label, active, inactive, color }) => {
              const c = colorMap[color]
              return (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface-bg)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className={clsx('p-1.5 rounded-md', c.bg)}>
                      <Icon size={13} className={c.text} />
                    </div>
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-900">{active}</span>
                    <span className="text-gray-400">activos</span>
                    {inactive > 0 && (
                      <span className="text-amber-500 font-medium">· {inactive} inactivo{inactive > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Auditoría reciente */}
        <div className={card} style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Últimos cambios de configuración</SectionTitle>
          </div>
          <div className="space-y-3">
            {auditLog.map(({ action, detail, time }, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  {i < auditLog.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
                </div>
                <div className="pb-1">
                  <p className="text-xs font-medium text-gray-800 leading-snug">{action}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{detail}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
