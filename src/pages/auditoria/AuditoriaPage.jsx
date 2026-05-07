import { useState } from 'react'
import {
  Shield, Search, X, Download,
  ChevronLeft, ChevronRight, ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════ */
const LOGS = [
  { id: 'EV-3001', ts: '2026-04-26 09:03:11', user: 'Marco Quispe L.',    role: 'admin',     modulo: 'Autenticación', accion: 'Inicio de sesión',          objeto: '—',                  detalle: 'Acceso al panel de administración.',                   resultado: 'exito' },
  { id: 'EV-3002', ts: '2026-04-26 09:05:42', user: 'Andrés Valdivia C.', role: 'trader',    modulo: 'Autenticación', accion: 'Inicio de sesión',          objeto: '—',                  detalle: 'Acceso desde IP 192.168.1.45.',                        resultado: 'exito' },
  { id: 'EV-3003', ts: '2026-04-26 09:15:08', user: 'Andrés Valdivia C.', role: 'trader',    modulo: 'Operaciones',   accion: 'Nueva operación',           objeto: 'OP-2026-009',        detalle: 'Compra USD 50,000 — TC 3.742.',                        resultado: 'exito' },
  { id: 'EV-3004', ts: '2026-04-26 09:18:50', user: 'Karla Mendoza R.',   role: 'trader',    modulo: 'Autenticación', accion: 'Login fallido',             objeto: '—',                  detalle: 'Contraseña incorrecta (intento 1/5).',                 resultado: 'fallo' },
  { id: 'EV-3005', ts: '2026-04-26 09:30:22', user: 'Marco Quispe L.',    role: 'admin',     modulo: 'Parámetros',    accion: 'Modificación',              objeto: 'montoLimiteGeneral', detalle: 'Valor anterior: 3,000,000 USD → nuevo: 5,000,000 USD.', resultado: 'exito' },
  { id: 'EV-3006', ts: '2026-04-26 09:45:17', user: 'María Torres S.',    role: 'middle',    modulo: 'Back Office',   accion: 'Revisión de operación',     objeto: 'OP-2026-003',        detalle: 'Operación aprobada para liquidación.',                 resultado: 'exito' },
  { id: 'EV-3007', ts: '2026-04-26 10:02:33', user: 'Rodrigo Paredes F.', role: 'trader',    modulo: 'Clientes',      accion: 'Registro de cliente',       objeto: 'CLI-009',            detalle: 'Nuevo cliente PJ — RUC 20567891234.',                  resultado: 'exito' },
  { id: 'EV-3008', ts: '2026-04-26 10:15:05', user: 'Luis Fernández A.',  role: 'trader',    modulo: 'Operaciones',   accion: 'Solicitud de anulación',    objeto: 'OP-2026-005',        detalle: 'Causa: error operativo en TC pactado.',                resultado: 'exito' },
  { id: 'EV-3009', ts: '2026-04-26 10:20:44', user: 'Marco Quispe L.',    role: 'admin',     modulo: 'Catálogos',     accion: 'Modificación',              objeto: 'BCP',                detalle: 'Banco BCP — estado cambiado a Activo.',                resultado: 'exito' },
  { id: 'EV-3010', ts: '2026-04-26 10:33:19', user: 'Sofía Ríos M.',      role: 'trader',    modulo: 'Mercado TC',    accion: 'Actualización de pizarra',  objeto: 'Pizarra',            detalle: 'Compra 3.738 / Venta 3.745.',                          resultado: 'exito' },
  { id: 'EV-3011', ts: '2026-04-26 10:50:07', user: 'César Huanca P.',    role: 'trader',    modulo: 'Operaciones',   accion: 'Transición de estado',      objeto: 'OP-2026-006',        detalle: 'Reservada → Liquidada.',                               resultado: 'exito' },
  { id: 'EV-3012', ts: '2026-04-26 11:05:30', user: 'Sistema',            role: 'sistema',   modulo: 'Mercado TC',    accion: 'Sincronización Datatec',    objeto: 'Datatec API',        detalle: 'Fallo de conexión — activado modo manual.',            resultado: 'fallo' },
  { id: 'EV-3013', ts: '2026-04-26 11:10:12', user: 'María Torres S.',    role: 'middle',    modulo: 'Back Office',   accion: 'Observación registrada',    objeto: 'OP-2026-002',        detalle: 'Comprobante adjunto ilegible. Requiere nueva imagen.',  resultado: 'exito' },
  { id: 'EV-3014', ts: '2026-04-26 11:30:54', user: 'Marco Quispe L.',    role: 'admin',     modulo: 'Usuarios',      accion: 'Creación de usuario',       objeto: 'USR-015',            detalle: 'Nuevo usuario — Trader Mesa Gamma.',                   resultado: 'exito' },
  { id: 'EV-3015', ts: '2026-04-26 11:45:22', user: 'Andrés Valdivia C.', role: 'trader',    modulo: 'Operaciones',   accion: 'Nueva operación',           objeto: 'OP-2026-010',        detalle: 'Venta USD 80,000 — TC 3.744.',                         resultado: 'exito' },
  { id: 'EV-3016', ts: '2026-04-26 12:01:09', user: 'Rosa Gutiérrez P.',  role: 'tesoreria', modulo: 'Cierre Diario', accion: 'Inicio de cierre',          objeto: 'CIE-20260426',       detalle: 'Cierre operativo iniciado para el día en curso.',       resultado: 'exito' },
  { id: 'EV-3017', ts: '2026-04-26 12:15:38', user: 'Marco Quispe L.',    role: 'admin',     modulo: 'Reportes',      accion: 'Exportación',               objeto: 'RO SBS',             detalle: 'Archivo CSV descargado — 86 registros.',               resultado: 'exito' },
  { id: 'EV-3018', ts: '2026-04-26 12:30:00', user: 'Sistema',            role: 'sistema',   modulo: 'Backup',        accion: 'Backup automático',         objeto: 'DB-Snapshot',        detalle: 'Snapshot diario completado correctamente.',            resultado: 'exito' },
  { id: 'EV-3019', ts: '2026-04-26 13:05:17', user: 'Luis Fernández A.',  role: 'trader',    modulo: 'Autenticación', accion: 'Cierre de sesión',          objeto: '—',                  detalle: 'Logout manual.',                                       resultado: 'exito' },
  { id: 'EV-3020', ts: '2026-04-26 13:20:44', user: 'Karla Mendoza R.',   role: 'trader',    modulo: 'Clientes',      accion: 'Modificación de cliente',   objeto: 'CLI-004',            detalle: 'Cuenta bancaria actualizada.',                          resultado: 'exito' },
  { id: 'EV-3021', ts: '2026-04-26 13:40:11', user: 'Rosa Gutiérrez P.',  role: 'tesoreria', modulo: 'Conciliación',  accion: 'Registro de diferencia',    objeto: 'CONC-0042',          detalle: 'Diferencia de S/ 245.00 registrada.',                  resultado: 'exito' },
  { id: 'EV-3022', ts: '2026-04-26 13:55:29', user: 'Sistema',            role: 'sistema',   modulo: 'PLAFT',         accion: 'Alerta automática',         objeto: 'OP-2026-010',        detalle: 'Operación supera umbral PLAFT de $10,000.',            resultado: 'exito' },
  { id: 'EV-3023', ts: '2026-04-26 14:10:08', user: 'Marco Quispe L.',    role: 'admin',     modulo: 'Parámetros',    accion: 'Modificación',              objeto: 'sessionTimeout',     detalle: 'Timeout de sesión: 30 min → 15 min.',                  resultado: 'exito' },
  { id: 'EV-3024', ts: '2026-04-26 14:25:55', user: 'Rodrigo Paredes F.', role: 'trader',    modulo: 'Autenticación', accion: 'Login fallido',             objeto: '—',                  detalle: 'Contraseña incorrecta (intento 3/5).',                 resultado: 'fallo' },
  { id: 'EV-3025', ts: '2026-04-26 14:45:30', user: 'María Torres S.',    role: 'middle',    modulo: 'Reportes',      accion: 'Exportación',               objeto: 'BCRP Adelantado',    detalle: 'PDF generado para reporte regulatorio.',               resultado: 'exito' },
  { id: 'EV-3026', ts: '2026-04-26 15:00:19', user: 'César Huanca P.',    role: 'trader',    modulo: 'Operaciones',   accion: 'Anulación aprobada',        objeto: 'OP-2026-005',        detalle: 'Autorizada por Head de Mesa.',                          resultado: 'exito' },
  { id: 'EV-3027', ts: '2026-04-26 15:15:41', user: 'Sistema',            role: 'sistema',   modulo: 'Autenticación', accion: 'Bloqueo de cuenta',         objeto: 'rodrigo.paredes',    detalle: 'Cuenta bloqueada tras 5 intentos fallidos.',           resultado: 'fallo' },
  { id: 'EV-3028', ts: '2026-04-26 15:30:07', user: 'Marco Quispe L.',    role: 'admin',     modulo: 'Usuarios',      accion: 'Desbloqueo de cuenta',      objeto: 'rodrigo.paredes',    detalle: 'Cuenta desbloqueada manualmente por administrador.',   resultado: 'exito' },
  { id: 'EV-3029', ts: '2026-04-26 15:45:22', user: 'Rosa Gutiérrez P.',  role: 'tesoreria', modulo: 'TC SBS',        accion: 'Registro de TC',            objeto: 'TC-SBS',             detalle: 'TC SBS diario registrado: 3.742.',                     resultado: 'exito' },
  { id: 'EV-3030', ts: '2026-04-26 16:00:55', user: 'Andrés Valdivia C.', role: 'trader',    modulo: 'Catálogos',     accion: 'Modificación',              objeto: 'USD',                detalle: 'Moneda USD — decimales actualizados a 2.',             resultado: 'exito' },
]

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const ROLE_META = {
  admin:     { label: 'Admin',         cls: 'bg-blue-50 text-blue-700'    },
  trader:    { label: 'Trader',        cls: 'bg-violet-50 text-violet-700' },
  middle:    { label: 'Middle Office', cls: 'bg-teal-50 text-teal-700'    },
  back:      { label: 'Back Office',   cls: 'bg-amber-50 text-amber-700'  },
  tesoreria: { label: 'Tesorería',     cls: 'bg-green-50 text-green-700'  },
  sistema:   { label: 'Sistema',       cls: 'bg-gray-100 text-gray-600'   },
}

const ALL_MODULES = ['Todos', ...Array.from(new Set(LOGS.map(l => l.modulo))).sort()]

const selCls = 'px-2.5 py-1.5 rounded-lg text-xs text-gray-700 bg-white outline-none appearance-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function AuditoriaPage({ role }) {
  const [search,   setSearch]   = useState('')
  const [modFil,   setModFil]   = useState('Todos')
  const [resFil,   setResFil]   = useState('todos')
  const [dateFil,  setDateFil]  = useState('')
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const isAdmin = role === 'admin'
  const base    = isAdmin ? LOGS : LOGS.filter(l => l.role === role || l.role === 'sistema')

  const totalExito  = base.filter(l => l.resultado === 'exito').length
  const totalFallo  = base.filter(l => l.resultado === 'fallo').length
  const uniqueUsers = new Set(base.map(l => l.user)).size

  const filtered = base.filter(l => {
    const q        = search.toLowerCase()
    const matchQ   = !search || [l.id, l.user, l.modulo, l.accion, l.objeto, l.detalle].some(v => v.toLowerCase().includes(q))
    const matchMod = modFil === 'Todos' || l.modulo === modFil
    const matchRes = resFil === 'todos'  || l.resultado === resFil
    const matchDate = !dateFil || l.ts.startsWith(dateFil)
    return matchQ && matchMod && matchRes && matchDate
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  function resetPage() { setPage(1) }

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Eventos registrados', value: base.length,  color: 'text-gray-900'  },
          { label: 'Exitosos',            value: totalExito,   color: 'text-green-600' },
          { label: 'Fallidos / Alertas',  value: totalFallo,   color: 'text-red-500'   },
          { label: 'Usuarios únicos',     value: uniqueUsers,  color: 'text-blue-600'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
          <div className="flex items-center gap-2.5">
            <Shield size={15} className="text-violet-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Log de Auditoría</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Registro inmutable · trazabilidad completa de acciones del sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white w-52 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
              style={{ border: '1px solid var(--color-border)' }}>
              <Search size={12} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar actor, módulo, objeto..."
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage() }}
                className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full"
              />
              {search && (
                <button onClick={() => { setSearch(''); resetPage() }} className="text-gray-300 hover:text-gray-500 shrink-0">
                  <X size={11} />
                </button>
              )}
            </div>
            {/* Module filter */}
            <select
              value={modFil}
              onChange={e => { setModFil(e.target.value); resetPage() }}
              className={selCls}
              style={{ border: '1px solid var(--color-border)' }}
            >
              {ALL_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {/* Date filter */}
            <input
              type="date"
              value={dateFil}
              onChange={e => { setDateFil(e.target.value); resetPage() }}
              className={clsx(selCls, 'border')}
              style={{ border: '1px solid var(--color-border)' }}
            />
            {/* Result filter */}
            <select
              value={resFil}
              onChange={e => { setResFil(e.target.value); resetPage() }}
              className={selCls}
              style={{ border: '1px solid var(--color-border)' }}
            >
              <option value="todos">Todos los resultados</option>
              <option value="exito">Solo exitosos</option>
              <option value="fallo">Solo fallidos</option>
            </select>
            {/* Export */}
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
              <Download size={12} /> Exportar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">T-Stamp / ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Actor</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Módulo</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Acción</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Objeto / Detalle</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50/60 transition-colors"
                  style={{ borderColor: 'var(--color-border)' }}>

                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-bold text-gray-800">{log.ts}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">#{log.id}</p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-900">{log.user}</p>
                    <span className={clsx(
                      'inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium',
                      (ROLE_META[log.role] ?? ROLE_META.sistema).cls
                    )}>
                      {(ROLE_META[log.role] ?? ROLE_META.sistema).label}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-700">{log.modulo}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{log.accion}</span>
                  </td>

                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="text-xs text-gray-700 truncate" title={log.detalle}>{log.detalle}</p>
                    {log.objeto !== '—' && (
                      <p className="text-[10px] text-blue-600 font-bold mt-0.5">{log.objeto}</p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                      log.resultado === 'exito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    )}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full',
                        log.resultado === 'exito' ? 'bg-green-500' : 'bg-red-500')} />
                      {log.resultado === 'exito' ? 'Éxito' : 'Fallo'}
                    </span>
                  </td>
                </tr>
              ))}

              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-300">
                    No se encontraron eventos
                    {search && <span className="text-gray-400"> para "<strong>{search}</strong>"</span>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Mostrar</span>
              <select
                value={String(pageSize)}
                onChange={e => { setPageSize(Number(e.target.value)); resetPage() }}
                className="px-2 py-1 rounded-lg text-xs text-gray-700 bg-white appearance-none"
                style={{ border: '1px solid var(--color-border)' }}
              >
                {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>por página · <span className="font-medium text-gray-700">{filtered.length}</span> evento{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, idx) =>
                  n === '…' ? (
                    <span key={`e${idx}`} className="px-1.5 text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={clsx(
                        'min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium transition-colors',
                        n === safePage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {n}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
        <ShieldCheck size={13} className="text-violet-400 shrink-0" />
        <p className="text-[11px] text-gray-500">
          Registro inmutable conforme a normativa SBS/BCRP (RF-33). No se permite modificación, eliminación ni exportación sin autorización del Compliance Officer.
          {!isAdmin && (
            <span className="text-amber-600 ml-1 font-medium">
              · Vista filtrada por su rol — el log completo está disponible para Seguridad Informática.
            </span>
          )}
        </p>
      </div>

    </div>
  )
}
