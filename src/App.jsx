import { useState } from 'react'
import Login from './pages/Login'
import AppLayout from './components/layout/AppLayout'
import AdminDashboard from './pages/AdminDashboard'
import UsersPage from './pages/admin/UsersPage'
import MesasDineroPage from './pages/admin/MesasDineroPage'
import OperacionesPage from './pages/operaciones/OperacionesPage'
import ClientesPage from './pages/clientes/ClientesPage'
import ClienteWizard from './pages/clientes/ClienteWizard'
import ClienteDetalle from './pages/clientes/ClienteDetalle'
import './index.css'

/* ── Tabs / títulos admin ── */
const ADMIN_TABS = {
  dashboard:  [{ id: 'resumen', label: 'Resumen' }, { id: 'actividad', label: 'Actividad reciente' }, { id: 'sistema', label: 'Estado del sistema' }],
  usuarios:   [{ id: 'registrados', label: 'Usuarios registrados' }, { id: 'roles', label: 'Roles y permisos' }],
  clientes:   [{ id: 'cartera', label: 'Cartera de clientes' }, { id: 'cuentas_bancarias', label: 'Cuentas bancarias' }, { id: 'convenios', label: 'Convenios y documentación' }, { id: 'arbol_trader', label: 'Árbol de Traders' }],
  operaciones: [],
  catalogos:  [{ id: 'mesas', label: 'Mesas de Dinero' }],
  parametros: [],
  auditoria:  [],
}
const ADMIN_TITLES = {
  dashboard:   'Panel de Administración',
  usuarios:    'Usuarios y Roles',
  clientes:    'Gestión de Clientes',
  operaciones: 'Bandeja de Operaciones FX',
  catalogos:   'Catálogos del Sistema',
  parametros:  'Parámetros',
  auditoria:   'Auditoría',
}

/* ── Tabs / títulos operativos por página ── */
const OPERATIVE_PAGE_TABS = {
  dashboard:   [{ id: 'resumen', label: 'Resumen' }, { id: 'operaciones', label: 'Operaciones' }, { id: 'posicion', label: 'Posición FX' }],
  clientes:    [{ id: 'cartera', label: 'Cartera de clientes' }, { id: 'cuentas_bancarias', label: 'Cuentas bancarias' }, { id: 'convenios', label: 'Convenios y documentación' }, { id: 'arbol_trader', label: 'Árbol de Traders' }],
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

/* Tabs que se muestran dentro de la ficha de un cliente */
const CLIENT_DETAIL_TABS = [
  { id: 'datos',       label: 'Datos generales' },
  { id: 'documentos',  label: 'Documentación' },
  { id: 'plaft',       label: 'Validación PLAFT' },
  { id: 'cuentas',     label: 'Cuentas bancarias' },
  { id: 'convenios',   label: 'Convenios y documentación' },
  { id: 'asignacion',  label: 'Asignación'               },
  { id: 'excepciones', label: 'Excepciones documentarias' },
]

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
  const [user,             setUser]            = useState(null)
  /* Admin state */
  const [adminPage,        setAdminPage]        = useState('dashboard')
  const [adminTab,         setAdminTab]         = useState('resumen')
  /* Operative state */
  const [operPage,         setOperPage]         = useState('dashboard')
  const [operTab,          setOperTab]          = useState('resumen')
  /* Client module state */
  const [clientView,       setClientView]       = useState('list')  // 'list' | 'wizard' | 'detail'
  const [selectedClient,   setSelectedClient]   = useState(null)
  const [clientDetailTab,  setClientDetailTab]  = useState('datos')

  if (!user) return <Login onLogin={setUser} />

  const isAdmin = user.role === 'admin'

  /* ── Navigation ── */
  function handleAdminNavigate(page) {
    setAdminPage(page)
    setAdminTab(ADMIN_TABS[page]?.[0]?.id ?? null)
    if (page !== 'clientes') { setClientView('list'); setSelectedClient(null) }
  }

  function handleOperNavigate(page) {
    setOperPage(page)
    setClientView('list')
    setSelectedClient(null)
    setOperTab(OPERATIVE_PAGE_TABS[page]?.[0]?.id ?? null)
  }

  function openDetail(cliente) {
    setSelectedClient(cliente)
    setClientView('detail')
    setClientDetailTab('datos')
  }

  function closeDetail() {
    setClientView('list')
    setSelectedClient(null)
  }

  /* ── Derived values ── */
  const isClientesPage = (isAdmin && adminPage === 'clientes') || (!isAdmin && operPage === 'clientes')
  const isDetailView   = isClientesPage && clientView === 'detail'

  const title = isDetailView
    ? (selectedClient?.nombre ?? 'Ficha de cliente')
    : isAdmin
      ? (clientView === 'wizard' ? 'Registro de cliente' : (ADMIN_TITLES[adminPage] ?? 'Panel de Administración'))
      : clientView === 'wizard'
        ? 'Registro de cliente'
        : getOperativeTitle(operPage, user.role)

  const tabs = isDetailView
    ? CLIENT_DETAIL_TABS
    : (isClientesPage && clientView === 'wizard')
      ? []
      : isAdmin
        ? (ADMIN_TABS[adminPage] ?? [])
        : (OPERATIVE_PAGE_TABS[operPage] ?? [])

  const activeNav   = isAdmin ? adminPage : operPage
  const activeTab   = isDetailView ? clientDetailTab : (isAdmin ? adminTab : operTab)
  const onNavigate  = isAdmin ? handleAdminNavigate : handleOperNavigate
  const onTabChange = isDetailView
    ? setClientDetailTab
    : isAdmin ? setAdminTab : setOperTab

  /* ── Content ── */
  function renderClientes(moduleTab) {
    if (clientView === 'wizard')
      return <ClienteWizard onBack={() => setClientView('list')} />
    if (clientView === 'detail')
      return <ClienteDetalle cliente={selectedClient} activeTab={clientDetailTab} onBack={closeDetail} />
    return (
      <ClientesPage
        activeTab={moduleTab}
        onNuevoCliente={() => setClientView('wizard')}
        onVerCliente={openDetail}
      />
    )
  }

  function renderContent() {
    if (isAdmin) {
      switch (adminPage) {
        case 'dashboard':  return <AdminDashboard activeTab={adminTab} />
        case 'usuarios':   return <UsersPage activeTab={adminTab} />
        case 'clientes':   return renderClientes(adminTab)
        case 'operaciones': return <OperacionesPage role={user.role} />
        case 'catalogos':  return <MesasDineroPage />
        case 'parametros': return <ComingSoon title="Parámetros del Sistema" />
        case 'auditoria':  return <ComingSoon title="Trazabilidad y Auditoría" />
        default:           return <AdminDashboard activeTab={adminTab} />
      }
    }
    switch (operPage) {
      case 'clientes':    return renderClientes(operTab)
      case 'operaciones': return <OperacionesPage role={user.role} />
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
      onLogout={() => {
        setUser(null)
        setAdminPage('dashboard'); setAdminTab('resumen')
        setOperPage('dashboard');  setOperTab('resumen')
        setClientView('list');     setSelectedClient(null)
      }}
      activeNav={activeNav}
      onNavigate={onNavigate}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      {renderContent()}
    </AppLayout>
  )
}
