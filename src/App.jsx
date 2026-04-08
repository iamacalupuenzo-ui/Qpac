import { useState } from 'react'
import Login from './pages/Login'
import AppLayout from './components/layout/AppLayout'
import AdminDashboard from './pages/AdminDashboard'
import UsersPage from './pages/admin/UsersPage'
import ClientesPage from './pages/clientes/ClientesPage'
import ClienteWizard from './pages/clientes/ClienteWizard'
import './index.css'

/* ── Tabs / títulos admin ── */
const ADMIN_TABS = {
  dashboard:  [{ id: 'resumen', label: 'Resumen' }, { id: 'actividad', label: 'Actividad reciente' }, { id: 'sistema', label: 'Estado del sistema' }],
  usuarios:   [{ id: 'registrados', label: 'Usuarios registrados' }, { id: 'roles', label: 'Roles y permisos' }],
  clientes:   [{ id: 'cartera', label: 'Cartera de clientes' }],
  catalogos:  [],
  parametros: [],
  auditoria:  [],
}
const ADMIN_TITLES = {
  dashboard:  'Panel de Administración',
  usuarios:   'Usuarios y Roles',
  clientes:   'Gestión de Clientes',
  catalogos:  'Catálogos del Sistema',
  parametros: 'Parámetros',
  auditoria:  'Auditoría',
}

/* ── Tabs / títulos operativos por página ── */
const OPERATIVE_PAGE_TABS = {
  dashboard:   [{ id: 'resumen', label: 'Resumen' }, { id: 'operaciones', label: 'Operaciones' }, { id: 'posicion', label: 'Posición FX' }],
  clientes:    [{ id: 'cartera', label: 'Cartera de clientes' }],
  operaciones: [],
  posicion:    [],
  reportes:    [],
  dashboards:  [],
}

const OPERATIVE_PAGE_TITLES = {
  dashboard:   { trader: 'Dashboard — Front Office', middle: 'Dashboard — Middle Office', back: 'Dashboard — Back Office', head: 'Dashboard — Head de Mesa', tesoreria: 'Dashboard — Tesorería', contab: 'Dashboard — Contabilidad' },
  clientes:    { _: 'Gestión de Clientes' },
  operaciones: { _: 'Operaciones' },
  posicion:    { _: 'Posición FX' },
  reportes:    { _: 'Reportes' },
  dashboards:  { _: 'Dashboards' },
}

function getOperativeTitle(page, role) {
  const titles = OPERATIVE_PAGE_TITLES[page]
  if (!titles) return 'Dashboard'
  return titles[role] ?? titles._ ?? 'Dashboard'
}

/* ── Placeholders ── */
const card = 'bg-white rounded-lg p-5'
const bord = { border: '1px solid var(--color-border)' }

function OperativeDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Operaciones hoy',   value: '12',      sub: 'Reservadas' },
          { label: 'En validación',     value: '4',       sub: 'Back Office' },
          { label: 'Liquidadas',        value: '7',       sub: 'Con impacto' },
          { label: 'Posición neta USD', value: '148,200', sub: 'TC SBS 3.742' },
        ].map(({ label, value, sub }) => (
          <div key={label} className={card} style={bord}>
            <p className="text-xs text-gray-500 mb-1.5">{label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={card} style={{ ...bord, minHeight: 192 }}>
          <p className="text-xs font-medium text-gray-500 mb-3">Operaciones activas</p>
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-300">Sin datos aún</p>
          </div>
        </div>
        <div className={card} style={{ ...bord, minHeight: 192 }}>
          <p className="text-xs font-medium text-gray-500 mb-3">Flujo de saldos bancarios</p>
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-300">Sin datos aún</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-xs text-gray-300 mt-1">Próximamente</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   APP ROOT
════════════════════════════════════════════ */
export default function App() {
  const [user,        setUser]        = useState(null)
  /* Admin state */
  const [adminPage,   setAdminPage]   = useState('dashboard')
  const [adminTab,    setAdminTab]    = useState('resumen')
  /* Operative state */
  const [operPage,    setOperPage]    = useState('dashboard')
  const [operTab,     setOperTab]     = useState('resumen')
  const [clientView,  setClientView]  = useState('list') // 'list' | 'wizard'

  if (!user) return <Login onLogin={setUser} />

  const isAdmin = user.role === 'admin'

  /* Admin navigation */
  function handleAdminNavigate(page) {
    setAdminPage(page)
    setAdminTab(ADMIN_TABS[page]?.[0]?.id ?? null)
    if (page !== 'clientes') setClientView('list')
  }

  /* Operative navigation */
  function handleOperNavigate(page) {
    setOperPage(page)
    setClientView('list')
    setOperTab(OPERATIVE_PAGE_TABS[page]?.[0]?.id ?? null)
  }

  /* ── Derived values ── */
  const isClientesPage = (isAdmin && adminPage === 'clientes') || (!isAdmin && operPage === 'clientes')

  const title = isAdmin
    ? (clientView === 'wizard' ? 'Registro de cliente' : (ADMIN_TITLES[adminPage] ?? 'Panel de Administración'))
    : clientView === 'wizard'
      ? 'Registro de cliente'
      : getOperativeTitle(operPage, user.role)

  const tabs = isClientesPage && clientView === 'wizard'
    ? []
    : isAdmin
      ? (ADMIN_TABS[adminPage] ?? [])
      : (OPERATIVE_PAGE_TABS[operPage] ?? [])

  const activeNav = isAdmin ? adminPage : operPage
  const activeTab = isAdmin ? adminTab  : operTab
  const onNavigate  = isAdmin ? handleAdminNavigate : handleOperNavigate
  const onTabChange = isAdmin
    ? setAdminTab
    : setOperTab

  /* ── Content ── */
  function renderContent() {
    if (isAdmin) {
      switch (adminPage) {
        case 'dashboard':  return <AdminDashboard activeTab={adminTab} />
        case 'usuarios':   return <UsersPage activeTab={adminTab} />
        case 'clientes':
          return clientView === 'wizard'
            ? <ClienteWizard onBack={() => setClientView('list')} />
            : <ClientesPage onNuevoCliente={() => setClientView('wizard')} />
        case 'catalogos':  return <ComingSoon title="Catálogos del Sistema" />
        case 'parametros': return <ComingSoon title="Parámetros del Sistema" />
        case 'auditoria':  return <ComingSoon title="Trazabilidad y Auditoría" />
        default:           return <AdminDashboard activeTab={adminTab} />
      }
    }
    /* Operative */
    switch (operPage) {
      case 'clientes':
        return clientView === 'wizard'
          ? <ClienteWizard onBack={() => setClientView('list')} />
          : <ClientesPage onNuevoCliente={() => setClientView('wizard')} />
      case 'operaciones': return <ComingSoon title="Módulo de Operaciones FX" />
      case 'posicion':    return <ComingSoon title="Posición FX" />
      case 'reportes':    return <ComingSoon title="Reportes" />
      case 'dashboards':  return <ComingSoon title="Dashboards" />
      default:            return <OperativeDashboard />
    }
  }

  return (
    <AppLayout
      title={title}
      tabs={tabs}
      role={user.role}
      userName={user.name ?? user.email}
      onLogout={() => { setUser(null); setAdminPage('dashboard'); setAdminTab('resumen'); setOperPage('dashboard'); setClientView('list') }}
      activeNav={activeNav}
      onNavigate={onNavigate}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      {renderContent()}
    </AppLayout>
  )
}
