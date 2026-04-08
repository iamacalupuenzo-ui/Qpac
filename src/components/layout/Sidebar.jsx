import { useState } from 'react'
import {
  LayoutDashboard, Users, ArrowLeftRight, FileText,
  BarChart2, Settings, Shield, TrendingUp,
  UserCog, Database, SlidersHorizontal, ClipboardList, Building2,
} from 'lucide-react'
import clsx from 'clsx'

/* ── Nav por rol ── */
const navByRole = {
  admin: {
    main: [
      { icon: LayoutDashboard,   label: 'Panel Admin',      id: 'dashboard'  },
      { icon: UserCog,           label: 'Usuarios y Roles', id: 'usuarios'   },
      { icon: Building2,         label: 'Clientes',         id: 'clientes'   },
      { icon: Database,          label: 'Catálogos',        id: 'catalogos'  },
      { icon: SlidersHorizontal, label: 'Parámetros',       id: 'parametros' },
      { icon: ClipboardList,     label: 'Auditoría',        id: 'auditoria'  },
    ],
    bottom: [
      { icon: Settings, label: 'Configuración', id: 'settings' },
    ],
  },
  default: {
    main: [
      { icon: LayoutDashboard, label: 'Dashboard',   id: 'dashboard'   },
      { icon: Building2,       label: 'Clientes',    id: 'clientes'    },
      { icon: ArrowLeftRight,  label: 'Operaciones', id: 'operaciones' },
      { icon: TrendingUp,      label: 'Posición FX', id: 'posicion'    },
      { icon: FileText,        label: 'Reportes',    id: 'reportes'    },
      { icon: BarChart2,       label: 'Dashboards',  id: 'dashboards'  },
    ],
    bottom: [
      { icon: Shield,   label: 'Auditoría',     id: 'auditoria' },
      { icon: Settings, label: 'Configuración', id: 'settings'  },
    ],
  },
}

export default function Sidebar({ activeItem, onNavigate, role = 'default' }) {
  const [tooltip, setTooltip] = useState(null)
  const nav = navByRole[role] ?? navByRole.default

  return (
    <aside
      className="fixed left-0 top-0 h-full z-30 flex flex-col"
      style={{
        width: 'var(--sidebar-w)',
        background: '#ffffff',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo — 56px contenido + 1px border = 57px total */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ height: '57px', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm select-none">
          Q
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-2 py-3">
        {nav.main.map(({ icon: Icon, label, id }) => (
          <NavBtn
            key={id}
            Icon={Icon}
            label={label}
            active={activeItem === id}
            showTooltip={tooltip === id}
            onMouseEnter={() => setTooltip(id)}
            onMouseLeave={() => setTooltip(null)}
            onClick={() => onNavigate?.(id)}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-0.5 w-full px-2 pb-3">
        <div className="w-full h-px mb-2" style={{ background: 'var(--color-border)' }} />
        {nav.bottom.map(({ icon: Icon, label, id }) => (
          <NavBtn
            key={id}
            Icon={Icon}
            label={label}
            active={activeItem === id}
            showTooltip={tooltip === id}
            onMouseEnter={() => setTooltip(id)}
            onMouseLeave={() => setTooltip(null)}
            onClick={() => onNavigate?.(id)}
          />
        ))}
      </div>
    </aside>
  )
}

function NavBtn({ Icon, label, active, showTooltip, onMouseEnter, onMouseLeave, onClick }) {
  return (
    <div className="relative w-full" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        onClick={onClick}
        className={clsx(
          'w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-150',
          active
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
        )}
      >
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
        )}
      </button>

      {showTooltip && (
        <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50
                        bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md
                        whitespace-nowrap pointer-events-none shadow-lg">
          {label}
          <span className="absolute right-full top-1/2 -translate-y-1/2
                           border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </div>
  )
}
