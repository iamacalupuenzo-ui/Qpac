import { ChevronDown, User, Settings, LogOut, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

function TrendArrow({ curr, prev, field }) {
  if (!prev || curr == null) return <Minus size={9} className="text-gray-300" />
  const diff = (curr[field] ?? 0) - (prev[field] ?? 0)
  if (diff > 0.00005) return <TrendingUp size={9} className="text-green-500" />
  if (diff < -0.00005) return <TrendingDown size={9} className="text-red-500" />
  return <Minus size={9} className="text-gray-300" />
}

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
  marketData,
  ops,
}) {
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

  /* ── Market strip ── */
  const isManual   = marketData?.mode !== 'datatec'
  const displayTC  = isManual ? marketData?.pizarra : marketData?.datatec
  const prevTC     = marketData?.history?.[0]
  const modeLabel  = isManual ? 'Pizarra' : 'Datatec'
  const modeTime   = isManual
    ? (marketData?.lastPizarraUpdate?.hora ?? '')
    : new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  const posNeta = ops
    ? ops
        .filter(o => !['anulada', 'cerrada'].includes(o.estado))
        .reduce((acc, o) => acc + (o.tipo === 'compra' ? o.montoUSD : -o.montoUSD), 0)
    : null
  const showGlobal = ['admin', 'tesoreria', 'contab', 'reportes'].includes(role)
  const posLabel   = showGlobal ? 'Global' : 'Mesa'

  return (
    <header
      className="sticky top-0 z-20 bg-white"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Top bar — misma altura que el logo del sidebar (56px) */}
      <div className="flex items-center justify-between px-6 h-14">

        {/* Título de módulo */}
        <h1 className="text-sm font-semibold text-gray-900 tracking-tight shrink-0">
          {title}
        </h1>

        {/* Centro: strip de mercado */}
        {marketData && displayTC && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 mx-4">
            <span className={clsx(
              'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
              isManual ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            )}>
              {modeLabel}
            </span>
            <span className="text-[10px] text-gray-400">{modeTime}</span>

            <span className="w-px h-3.5 bg-gray-200" />

            {/* Compra */}
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-gray-400 font-semibold mr-0.5">C</span>
              <span className="text-xs font-mono font-bold text-gray-800">{displayTC.compra.toFixed(3)}</span>
              <TrendArrow curr={displayTC} prev={prevTC} field="compra" />
            </div>

            <span className="text-gray-200 text-xs">|</span>

            {/* Venta */}
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-gray-400 font-semibold mr-0.5">V</span>
              <span className="text-xs font-mono font-bold text-gray-800">{displayTC.venta.toFixed(3)}</span>
              <TrendArrow curr={displayTC} prev={prevTC} field="venta" />
            </div>

            {posNeta !== null && (
              <>
                <span className="w-px h-3.5 bg-gray-200" />
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-400 font-semibold">Pos. {posLabel}</span>
                  <span className={clsx(
                    'text-xs font-mono font-bold',
                    posNeta > 0 ? 'text-green-600' : posNeta < 0 ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {posNeta >= 0 ? '+' : ''}{posNeta.toLocaleString('es-PE')} USD
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Controles derecha */}
        <div className="flex items-center gap-2">

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
