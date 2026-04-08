import { Bell, Search, ChevronDown, User, Settings, LogOut, HelpCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

const roleLabel = {
  admin:     'Administrador',
  trader:    'Trader',
  middle:    'Middle Office',
  back:      'Back Office',
  head:      'Head de Mesa',
  tesoreria: 'Tesorería',
  contab:    'Contabilidad',
  reportes:  'Reportes Regulatorios',
}

export default function Header({
  title,
  tabs,
  activeTab,
  onTabChange,
  role = 'middle',
  userName = 'Marco Quispe',
  onLogout,
}) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    if (!userMenuOpen) return
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [userMenuOpen])

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header
      className="sticky top-0 z-20 bg-white"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Top bar — misma altura que el logo del sidebar (56px) */}
      <div className="flex items-center justify-between px-6 h-14">

        {/* Título de módulo */}
        <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
          {title}
        </h1>

        {/* Controles derecha */}
        <div className="flex items-center gap-2">

          {/* Buscador */}
          <div
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              searchFocused
                ? 'bg-white border border-blue-400 w-56'
                : 'bg-gray-100 border border-gray-100 w-44 hover:border-gray-200'
            )}
          >
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
          </div>

          {/* Campana */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* Usuario — botón con dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold select-none shrink-0">
                {initials}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-800 leading-none">{userName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-none">
                  {roleLabel[role] ?? role}
                </p>
              </div>
              <ChevronDown
                size={12}
                className={clsx(
                  'ml-0.5 transition-all duration-200',
                  userMenuOpen
                    ? 'rotate-180 text-gray-700'
                    : 'rotate-0 text-gray-400 group-hover:text-gray-700'
                )}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl
                           border py-1 z-50"
                style={{
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 16px 0 rgba(0,0,0,0.08)',
                }}
              >
                {/* Info usuario */}
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs font-semibold text-gray-800 truncate">{userName}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {roleLabel[role] ?? role}
                  </p>
                </div>

                {/* Opciones */}
                <div className="py-1">
                  <DropItem icon={User} label="Mi perfil" onClick={() => setUserMenuOpen(false)} />
                  <DropItem icon={Settings} label="Configuración" onClick={() => setUserMenuOpen(false)} />
                  <DropItem icon={HelpCircle} label="Ayuda" onClick={() => setUserMenuOpen(false)} />
                </div>

                <div className="border-t py-1" style={{ borderColor: 'var(--color-border)' }}>
                  <DropItem
                    icon={LogOut}
                    label="Cerrar sesión"
                    danger
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout?.()
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs de módulo */}
      {tabs && tabs.length > 0 && (
        <div
          className="flex items-center px-6"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={clsx(
                'relative px-4 py-2.5 text-sm transition-colors select-none',
                activeTab === tab.id
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500 font-medium hover:text-gray-800'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

function DropItem({ icon: Icon, label, danger = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50'
      )}
    >
      <Icon size={14} className="shrink-0" />
      {label}
    </button>
  )
}
