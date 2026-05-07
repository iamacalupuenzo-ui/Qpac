import { useState, useEffect } from 'react'
import Login from './pages/Login'
import AppLayout from './components/layout/AppLayout'
import AdminDashboard from './pages/AdminDashboard'
import UsersPage from './pages/admin/UsersPage'
import MesasDineroPage from './pages/admin/MesasDineroPage'
import OperacionesPage from './pages/operaciones/OperacionesPage'
import ClientesPage from './pages/clientes/ClientesPage'
import ClienteWizard from './pages/clientes/ClienteWizard'
import ClienteDetalle from './pages/clientes/ClienteDetalle'
import MercadoTCPage from './pages/tesoreria/MercadoTCPage'
import PosicionFXPage from './pages/tesoreria/PosicionFXPage'
import TcSbsPage from './pages/tesoreria/TcSbsPage'
import CierreDiarioPage from './pages/tesoreria/CierreDiarioPage'
import ReportesRegulatoriosPage from './pages/reportes/ReportesRegulatoriosPage'
import DashboardsPage from './pages/dashboards/DashboardsPage'
import ReportesPage from './pages/reportes/ReportesPage'
import ConciliacionPage from './pages/conciliacion/ConciliacionPage'
import AuditoriaPage from './pages/auditoria/AuditoriaPage'
import CatalogosPage from './pages/admin/CatalogosPage'
import ParametrosPage from './pages/admin/ParametrosPage'
import Toast from './components/ui/Toast'
import { CheckCircle2 } from 'lucide-react'
import './index.css'

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function nextBusinessDay(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

/* ── Tabs / títulos admin ── */
const ADMIN_TABS = {
  dashboard:  [{ id: 'resumen', label: 'Resumen' }, { id: 'actividad', label: 'Actividad reciente' }, { id: 'sistema', label: 'Estado del sistema' }],
  usuarios:   [{ id: 'registrados', label: 'Usuarios registrados' }, { id: 'roles', label: 'Roles y permisos' }],
  clientes:   [{ id: 'cartera', label: 'Cartera de clientes' }, { id: 'cuentas_bancarias', label: 'Cuentas bancarias' }, { id: 'convenios', label: 'Convenios y documentación' }, { id: 'arbol_trader', label: 'Árbol de Traders' }],
  operaciones: [{ id: 'bandeja', label: 'Bandeja General' }, { id: 'pendientes_abono', label: 'Pendientes de Abono' }, { id: 'revision_back_office', label: 'Revisión Back Office' }, { id: 'operaciones_observadas', label: 'Observadas' }, { id: 'liquidadas', label: 'Liquidadas' }],
  catalogos:  [
    { id: 'mesas', label: 'Mesas de Dinero' },
    { id: 'monedas', label: 'Monedas Operadas' },
    { id: 'bancos', label: 'Bancos QAPAQ' },
    { id: 'tipos_op', label: 'Tipos de Operación' },
    { id: 'causas_anulacion', label: 'Causas de Anulación' },
    { id: 'plazos', label: 'Plazos de Excepción' },
    { id: 'contrapartes', label: 'Tipos de Contraparte' }
  ],
  mercado:    [{ id: 'pizarra', label: 'Gestión de Pizarra' }, { id: 'historial', label: 'Historial de Cambios' }],
  posicion:   [{ id: 'posicion_fx', label: 'Posición FX' }, { id: 'saldos', label: 'Saldos Bancarios' }, { id: 'tc_sbs', label: 'TC SBS Referencial' }, { id: 'cierres', label: 'Cierre Diario' }, { id: 'conciliacion', label: 'Conciliación Bancaria' }],
  reportes:   [
    { id: 'internos', label: 'Operativos e Internos' },
    { id: 'anexo5_sbs', label: 'Anexo 5 SBS' },
    { id: 'bcrp_adelantado', label: 'BCRP Adelantado' },
    { id: 'bcrp_definitivo', label: 'BCRP Definitivo' },
    { id: 'ro_sbs', label: 'RO SBS' }
  ],
  parametros: [],
  auditoria:  [{ id: 'log', label: 'Log de Auditoría' }],
}
const ADMIN_TITLES = {
  dashboard:   'Panel de Administración',
  usuarios:    'Usuarios y Roles',
  clientes:    'Gestión de Clientes',
  operaciones: 'Bandeja de Operaciones FX',
  catalogos:   'Catálogos del Sistema',
  mercado:     'Mercado TC y Datatec',
  parametros:  'Parámetros',
  auditoria:   'Auditoría',
}

/* ── Tabs / títulos operativos por página ── */
const OPERATIVE_PAGE_TABS = {
  dashboard:   [],
  clientes:    [{ id: 'cartera', label: 'Cartera de clientes' }, { id: 'cuentas_bancarias', label: 'Cuentas bancarias' }, { id: 'convenios', label: 'Convenios y documentación' }, { id: 'arbol_trader', label: 'Árbol de Traders' }],
  operaciones: [{ id: 'bandeja', label: 'Bandeja General' }, { id: 'pendientes_abono', label: 'Pendientes de Abono' }, { id: 'revision_back_office', label: 'Revisión Back Office' }, { id: 'operaciones_observadas', label: 'Observadas' }, { id: 'liquidadas', label: 'Liquidadas' }],
  posicion:   [{ id: 'posicion_fx', label: 'Posición FX' }, { id: 'saldos', label: 'Saldos Bancarios' }, { id: 'tc_sbs', label: 'TC SBS Referencial' }, { id: 'cierres', label: 'Cierre Diario' }, { id: 'conciliacion', label: 'Conciliación Bancaria' }],
  reportes:   [
    { id: 'internos', label: 'Operativos e Internos' },
    { id: 'anexo5_sbs', label: 'Anexo 5 SBS' },
    { id: 'bcrp_adelantado', label: 'BCRP Adelantado' },
    { id: 'bcrp_definitivo', label: 'BCRP Definitivo' },
    { id: 'ro_sbs', label: 'RO SBS' }
  ],
  dashboards:  [],
  mercado:     [{ id: 'pizarra', label: 'Gestión de Pizarra' }, { id: 'historial', label: 'Historial de Cambios' }],
}

const OPERATIVE_PAGE_TITLES = {
  dashboard:   { trader: 'Dashboard — Front Office', middle: 'Dashboard — Middle Office', back: 'Dashboard — Back Office', head: 'Dashboard — Head de Mesa', tesoreria: 'Dashboard — Tesorería', contab: 'Dashboard — Contabilidad' },
  clientes:    { _: 'Gestión de Clientes' },
  operaciones: { _: 'Operaciones' },
  mercado:     { _: 'Mercado TC y Datatec' },
  reportes:    { _: 'Reportes' },
  dashboards:  { _: 'Dashboards' },
  mercado:     { _: 'Mercado TC y Datatec' },
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
  const [notification,     setNotification]    = useState(null)
  const [cierreNotification, setCierreNotification] = useState(null)
  const [operatingDate,    setOperatingDate]   = useState(new Date().toISOString().split('T')[0])
  
  /* Admin state */
  const [adminPage,        setAdminPage]        = useState('dashboard')
  const [adminTab,         setAdminTab]         = useState('resumen')
  /* Operative state */
  const [operPage,         setOperPage]         = useState('dashboard')
  const [operTab,          setOperTab]          = useState('resumen')
  
  /* Navigation Guard */
  const [inWizard,         setInWizard]         = useState(false)
  const [showExitModal,    setShowExitModal]    = useState(false)
  const [pendingNav,       setPendingNav]       = useState(null) // { type: 'page'|'tab', value: string }
  /* Client module state */
  const [clientView,       setClientView]       = useState('list')  // 'list' | 'wizard' | 'detail'
  const [selectedClient,   setSelectedClient]   = useState(null)
  const [clientDetailTab,  setClientDetailTab]  = useState('datos')
  const [pendingCliente,   setPendingCliente]   = useState(null)
  const [nextClientCode,   setNextClientCode]   = useState('CLI-009')
  const [clientes,         setClientes]         = useState([
    { id: 'CLI-001', nombre: 'María González Paredes',        tipo: 'PN',  tipoDoc: 'DNI', doi: '43210987',    riesgo: 'estandar', estado: 'activo',          plaft: 'conforme',   registradoPor: 'Marco Quispe L.', fecha: '15/01/2026' },
    { id: 'CLI-002', nombre: 'Exportaciones Lima S.A.C.',     tipo: 'PJ',  tipoDoc: 'RUC', doi: '20512345678', riesgo: 'estandar', estado: 'activo',          plaft: 'conforme',   registradoPor: 'Marco Quispe L.', fecha: '20/01/2026' },
    { id: 'CLI-003', nombre: 'Banco Americano del Perú S.A.', tipo: 'EF',  tipoDoc: 'RUC', doi: '20123456789', riesgo: 'rf',       estado: 'activo',          plaft: 'conforme',   registradoPor: 'Marco Quispe L.', fecha: '05/02/2026' },
    { id: 'CLI-004', nombre: 'Roberto Sánchez Vidal',         tipo: 'P10', tipoDoc: 'DNI', doi: '38765432',    riesgo: 'estandar', estado: 'activo_proceso',  plaft: 'en_proceso', registradoPor: 'Marco Quispe L.', fecha: '01/03/2026', docsPendientes: 2 },
    { id: 'CLI-005', nombre: 'Inversiones Pacífico S.R.L.',   tipo: 'PJ',  tipoDoc: 'RUC', doi: '20987654321', riesgo: 'rf',       estado: 'pendiente_legal', plaft: 'conforme',   registradoPor: 'Marco Quispe L.', fecha: '10/03/2026' },
    { id: 'CLI-006', nombre: 'Carmen Rivas Huanca',           tipo: 'PN',  tipoDoc: 'DNI', doi: '52109876',    riesgo: 'estandar', estado: 'no_habilitado',   plaft: 'conforme',   registradoPor: 'Marco Quispe L.', fecha: '12/02/2026' },
    { id: 'CLI-007', nombre: 'Minera Andina S.A.',            tipo: 'PJ',  tipoDoc: 'RUC', doi: '20345678901', riesgo: 'estandar', estado: 'activo',          plaft: 'conforme',   registradoPor: 'Marco Quispe L.', fecha: '25/02/2026' },
    { id: 'CLI-008', nombre: 'James Wilson Carter',           tipo: 'PN',  tipoDoc: 'CE',  doi: 'CE001234',    riesgo: 'rf',       estado: 'activo',          plaft: 'conforme',   registradoPor: 'Marco Quispe L.', fecha: '08/03/2026' },
  ].sort((a, b) => {
    const parseFecha = (str) => {
       if (!str) return new Date(0)
       const [d, m, y] = str.split('/')
       return new Date(+y, +m - 1, +d)
    }
    return parseFecha(b.fecha) - parseFecha(a.fecha)
  }))

  /* ── Ops State (lifted from OperacionesPage for cross-module sharing) ── */
  const todayISO = new Date().toISOString().split('T')[0]
  const [ops, setOps] = useState([
    { id: 'OP-2026-001', clienteNombre: 'Empresa Industrial Inca S.A.C.',  tipo: 'compra', montoUSD: 50_000,  tc: 3.742, montoPEN: 187_100, estado: 'reservada',   fecha: todayISO, hora: '09:15', tcRef: 3.739, tcFuente: 'Datatec', trader: 'Andrés Valdivia C.', mesa: 'Mesa Alpha', solAnulacion: null, historial: [], fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null },
    { id: 'OP-2026-002', clienteNombre: 'Textiles del Sur E.I.R.L.',        tipo: 'venta',  montoUSD: 25_000,  tc: 3.738, montoPEN: 93_450,  estado: 'observada',   fecha: todayISO, hora: '10:30', tcRef: 3.738, tcFuente: 'Datatec', trader: 'Karla Mendoza R.',   mesa: 'Mesa Beta',  solAnulacion: { causa: 'cliente_desiste', detalle: 'El cliente llamó indicando que ya no requiere la operación.', solicitadoPor: 'Karla Mendoza R.', fecha: todayISO, hora: '12:45' }, historial: [], fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null, textoObservacion: 'El comprobante adjunto es ilegible. Por favor adjuntar nueva imagen con mayor resolución.', observadoPor: 'Back Office', fechaObservacion: todayISO + ' 11:00', cuentaQpaqIn: 'QP-PEN-1', cuentaQpaqOut: 'QP-USD-1' },
    { id: 'OP-2026-003', clienteNombre: 'Grupo Minero Los Andes S.A.',      tipo: 'compra', montoUSD: 120_000, tc: 3.741, montoPEN: 448_920, estado: 'en_revision', fecha: todayISO, hora: '08:50', tcRef: 3.740, tcFuente: 'Datatec', trader: 'Rodrigo Paredes F.', mesa: 'Mesa Alpha', solAnulacion: null, historial: [], fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null, cuentaQpaqIn: 'QP-PEN-1', cuentaQpaqOut: 'QP-USD-1', comprobantes: [{ name: 'voucher_003.pdf' }] },
    { id: 'OP-2026-004', clienteNombre: 'Consorcio Lima Norte S.A.C.',      tipo: 'venta',  montoUSD: 15_000,  tc: 3.739, montoPEN: 56_085,  estado: 'subsanada',   fecha: todayISO, hora: '16:20', tcRef: 3.742, tcFuente: 'Manual',  trader: 'Sofía Ríos M.',     mesa: 'Mesa Beta',  solAnulacion: null, historial: [], fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null, cuentaQpaqIn: 'QP-USD-1', cuentaQpaqOut: 'QP-PEN-1', comprobantes: [] },
    { id: 'OP-2026-005', clienteNombre: 'Importadora del Pacífico S.A.',    tipo: 'compra', montoUSD: 80_000,  tc: 3.740, montoPEN: 299_200, estado: 'reservada',   fecha: todayISO, hora: '11:05', trader: 'Andrés Valdivia C.', mesa: 'Mesa Alpha', solAnulacion: { causa: 'error_operativo', detalle: 'Se ingresó TC 3.740 pero el tipo de cambio pactado con el cliente fue 3.745.', solicitadoPor: 'Andrés Valdivia C.', fecha: todayISO, hora: '11:30' }, historial: [], fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null },
    { id: 'OP-2026-006', clienteNombre: 'Distribuidora Norte EIRL',          tipo: 'venta',  montoUSD: 8_500,   tc: 3.744, montoPEN: 31_824,  estado: 'liquidada',   fecha: todayISO, hora: '14:15', trader: 'César Huanca P.',   mesa: 'Mesa Gamma', solAnulacion: null, historial: [], fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null, refTransferencia: 'BCP-2026-00412', fechaLiquidacion: todayISO },
    { id: 'OP-2026-007', clienteNombre: 'Farmacéutica Andina S.A.',          tipo: 'compra', montoUSD: 45_000,  tc: 3.743, montoPEN: 168_435, estado: 'anulada',     fecha: todayISO, hora: '10:00', trader: 'Rodrigo Paredes F.', mesa: 'Mesa Alpha', solAnulacion: null, historial: [{ tipo: 'solicitud', por: 'Rodrigo Paredes F. (Trader)', fecha: todayISO, hora: '10:45', causa: 'transferencia_mal_ejecutada', detalle: 'La transferencia fue realizada a una cuenta bancaria incorrecta.' }, { tipo: 'anulacion', por: 'María Torres (Middle Office)', fecha: todayISO, hora: '11:15', causa: 'transferencia_mal_ejecutada', detalle: 'Se verificó el error.' }], fechaAnulacion: todayISO, horaAnulacion: '11:15', anuladoPor: 'María Torres (Middle Office)', causaAnulacion: 'transferencia_mal_ejecutada' },
    { id: 'OP-2026-008', clienteNombre: 'Textiles del Sur E.I.R.L.',        tipo: 'venta',  montoUSD: 12_000,  tc: 3.737, montoPEN: 44_844,  estado: 'observada',   fecha: todayISO, hora: '13:40', trader: 'Luis Fernández A.', mesa: 'Mesa Gamma', solAnulacion: null, historial: [], fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null, textoObservacion: 'La cuenta de ingreso no coincide con la declarada. Por favor corregir.', observadoPor: 'Back Office', fechaObservacion: todayISO + ' 14:00', cuentaQpaqIn: 'QP-PEN-2', cuentaQpaqOut: 'QP-USD-2', comprobantes: [{ name: 'voucher_008.jpg' }] },
  ])

  /* ── TC SBS State (RF-22) ── */
  const [tcSbsHistory, setTcSbsHistory] = useState([
    { fecha: todayISO, t: 3.742, tMinus1: 3.738, usuario: 'Marco Quispe L.', timestamp: todayISO + 'T09:00:00Z' }
  ])

  /* ── Ajustes Contables (RF-21) ── */
  const [ajustes, setAjustes] = useState([])

  /* ── Cierres Diarios (RF-23, RF-24) ── */
  const [cierres, setCierres] = useState([])

  /* ── Exportaciones de Reportes (RF-25, 26, 27, 28) ── */
  const [reportExports, setReportExports] = useState([])

  /* ── Mercado TC State ── */
  const [marketData, setMarketData] = useState({
    datatec: { compra: 3.739, venta: 3.744 },
    pizarra: { compra: 3.738, venta: 3.745 },
    status: 'connected',
    mode: 'datatec', // 'datatec' | 'manual'
    lastPizarraUpdate: { hora: '08:30', usuario: 'Sistema' },
    history: [
      { hora: '11:15', compra: 3.738, venta: 3.745, usuario: 'María Torres (Mesa)', motivo: 'Ajuste volatilidad' },
      { hora: '09:40', compra: 3.737, venta: 3.744, usuario: 'Juan Pérez (Treas)', motivo: 'Apertura' },
      { hora: '08:30', compra: 3.735, venta: 3.742, usuario: 'Sistema', motivo: 'Cierre previo' },
    ]
  })

  // Simulación de Datatec Feed
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const isPostCutoff = (now.getHours() > 13) || (now.getHours() === 13 && now.getMinutes() >= 33)
      
      setMarketData(prev => {
        const newMode = (isPostCutoff && prev.mode === 'datatec') ? 'manual' : prev.mode
        // Solo variamos datatec si estamos en horario o modo datatec
        const variation = (Math.random() - 0.5) * 0.002
        return {
          ...prev,
          mode: newMode,
          datatec: {
            compra: prev.datatec.compra + variation,
            venta: prev.datatec.venta + variation
          }
        }
      })
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  if (!user) return <Login onLogin={setUser} />

  const isAdmin = user.role === 'admin'

  /* ── Navigation ── */
  function handleAdminNavigate(page) {
    if (inWizard) {
      setPendingNav({ type: 'page_admin', value: page })
      setShowExitModal(true)
      return
    }
    setAdminPage(page)
    setAdminTab(ADMIN_TABS[page]?.[0]?.id ?? null)
    if (page !== 'clientes') { setClientView('list'); setSelectedClient(null) }
  }

  function handleOperNavigate(page) {
    if (inWizard) {
      setPendingNav({ type: 'page_oper', value: page })
      setShowExitModal(true)
      return
    }
    setOperPage(page)
    setClientView('list')
    setSelectedClient(null)
    setOperTab(OPERATIVE_PAGE_TABS[page]?.[0]?.id ?? null)
  }

  function handleTabChange(id) {
    if (inWizard) {
      setPendingNav({ type: 'tab', value: id })
      setShowExitModal(true)
      return
    }
    if (isDetailView) setClientDetailTab(id)
    else if (isAdmin) setAdminTab(id)
    else setOperTab(id)
  }

  function goToAdmin(page, tab) {
    setAdminPage(page)
    setAdminTab(tab ?? ADMIN_TABS[page]?.[0]?.id ?? null)
    if (page !== 'clientes') { setClientView('list'); setSelectedClient(null) }
  }

  function goToOper(page, tab) {
    setOperPage(page)
    setOperTab(tab ?? OPERATIVE_PAGE_TABS[page]?.[0]?.id ?? null)
    setClientView('list')
    setSelectedClient(null)
  }

  function confirmNavigation() {
    if (!pendingNav) return
    const { type, value } = pendingNav
    setInWizard(false)
    setShowExitModal(false)
    setPendingNav(null)

    if (type === 'page_admin') {
      setAdminPage(value)
      setAdminTab(ADMIN_TABS[value]?.[0]?.id ?? null)
      if (value !== 'clientes') { setClientView('list'); setSelectedClient(null) }
    } else if (type === 'page_oper') {
      setOperPage(value)
      setClientView('list')
      setSelectedClient(null)
      setOperTab(OPERATIVE_PAGE_TABS[value]?.[0]?.id ?? null)
    } else if (type === 'tab') {
      if (isDetailView) setClientDetailTab(value)
      else if (isAdmin) setAdminTab(value)
      else setOperTab(value)
    }
  }

  function handleClienteCreado(data) {
    setClientes(prev => [data, ...prev])
    setNextClientCode(prev => {
      const num = parseInt(prev.split('-')[1]) + 1
      return `CLI-${String(num).padStart(3, '0')}`
    })
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

  /* ── UI Handlers ── */
  function notify(message, type = 'success') {
    setNotification({ message, type })
  }

  function handlePreviewDoc(docName) {
    // Simulación de apertura en pestaña nueva (RF fix)
    const win = window.open('about:blank', '_blank')
    if (win) {
      win.document.write(`
        <html>
          <head><title>Visualizador - QAPAQ</title></head>
          <body style="margin:0; background:#f4f7fa; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
            <div style="background:white; padding:40px; border-radius:24px; box-shadow:0 20px 40px rgba(0,0,0,0.05); text-align:center;">
              <div style="width:64px; height:64px; background:#eff6ff; color:#2563eb; border-radius:16px; display:flex; items-center; justify-content:center; margin:0 auto 20px;">
                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
              </div>
              <h1 style="margin:0; color:#111827; font-size:18px;">Visualizando: ${docName || 'Documento'}</h1>
              <p style="color:#6b7280; font-size:14px; margin-top:8px;">Documento validado por el sistema QAPAQ FX.</p>
              <button onclick="window.close()" style="margin-top:24px; padding:10px 20px; background:#111827; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">Cerrar vista</button>
            </div>
          </body>
        </html>
      `)
    }
  }

  /* ── Treasury Handlers ── */
  function handleTcSbsUpdate(data) {
    setTcSbsHistory(prev => [data, ...prev])
    notify('Tipo de cambio SBS registrado exitosamente.')
  }

  function handleSaveAjuste(adj) {
    setAjustes(prev => [adj, ...prev])
    notify(`Ajuste contable por ${adj.moneda} ${adj.monto.toLocaleString()} registrado.`)
  }

  function handleCierreDiario(cierre) {
    setCierres(prev => [cierre, ...prev])
    setOps(prev => prev.map(o =>
      (o.estado === 'liquidada' && o.fecha === cierre.fechaSoc) ? { ...o, estado: 'cerrada' } : o
    ))
    notify('Cierre diario completado. Operaciones consolidadas.')
    const fechaCierre = cierre.fechaSoc || operatingDate
    setCierreNotification({
      fecha:     fechaCierre,
      nextFecha: nextBusinessDay(fechaCierre),
      opsCount:  cierre.opsLiquidadas ?? 0,
    })
  }

  function handleReversionCierre(id, motivo) {
    let affectedDate = ''
    setCierres(prev => prev.map(c => {
      if (c.id === id) {
        affectedDate = c.fechaSoc
        return { ...c, estado: 'revertido', motivoReversion: motivo }
      }
      return c
    }))
    if (affectedDate) {
      setOps(prev => prev.map(o => 
        (o.estado === 'cerrada' && o.fecha === affectedDate) ? { ...o, estado: 'liquidada' } : o
      ))
      notify('Consolidación revertida exitosamente. Las operaciones vuelven a estado Liquidada.', 'warning')
    }
  }

  function handleExportReport(data) {
    setReportExports(prev => [data, ...prev])
    notify(`Reporte ${data.tipo.toUpperCase()} exportado correctamente.`)
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
  const onTabChange = handleTabChange

  /* ── Content ── */
  function renderClientes(moduleTab) {
    if (clientView === 'wizard')
      return <ClienteWizard
        onBack={() => { setClientView('list'); setInWizard(false) }}
        onSave={(data) => { handleClienteCreado(data); setInWizard(false) }}
        nextCode={nextClientCode}
      />
    if (clientView === 'detail')
      return <ClienteDetalle cliente={selectedClient} activeTab={clientDetailTab} onBack={closeDetail} />
    return (
      <ClientesPage
        activeTab={moduleTab}
        onNuevoCliente={() => { setClientView('wizard'); setInWizard(true) }}
        onVerCliente={openDetail}
        clientes={clientes}
        setClientes={setClientes}
      />
    )
  }

  function renderContent() {
    if (isAdmin) {
      switch (adminPage) {
        case 'dashboard':  return <AdminDashboard activeTab={adminTab} onGoTo={goToAdmin} />
        case 'usuarios':   return <UsersPage activeTab={adminTab} />
        case 'clientes':   return renderClientes(adminTab)
        case 'operaciones': return <OperacionesPage role={user.role} activeTab={adminTab} marketData={marketData} ops={ops} setOps={setOps} onPreviewDoc={handlePreviewDoc} notify={notify} setInWizard={setInWizard} />
        case 'posicion': {
          switch (adminTab) {
            case 'posicion_fx': return <PosicionFXPage ops={ops} marketData={marketData} tcSbs={tcSbsHistory[0]} />
            case 'saldos':      return <PosicionFXPage activeTab="saldos" ops={ops} marketData={marketData} ajustes={ajustes} onSaveAjuste={handleSaveAjuste} role={user.role} />
            case 'tc_sbs':      return <TcSbsPage history={tcSbsHistory} onUpdate={handleTcSbsUpdate} role={user.role} />
            case 'cierres':     return <CierreDiarioPage ops={ops} tcSbs={tcSbsHistory[0]} cierres={cierres} onCerrar={handleCierreDiario} onRevertir={handleReversionCierre} role={user.role} />
            case 'conciliacion':return <ConciliacionPage role={user.role} />
            default:            return <PosicionFXPage ops={ops} marketData={marketData} />
          }
        }
        case 'catalogos':  return <CatalogosPage activeTab={adminTab} />
        case 'mercado':    return (
          <MercadoTCPage 
            activeTab={adminTab}
            onTabChange={setAdminTab}
            marketData={marketData} 
            onUpdatePizarra={(newP) => setMarketData(prev => ({
              ...prev, 
              pizarra: { compra: newP.compra, venta: newP.venta },
              lastPizarraUpdate: { hora: newP.hora, usuario: newP.usuario },
              history: [{ ...newP }, ...prev.history]
            }))}
          />
        )
        case 'reportes':   return <ReportesPage role={user.role} activeTab={adminTab} />
        case 'parametros': return <ParametrosPage />
        case 'auditoria':  return <AuditoriaPage role={user.role} />
        default:           return <DashboardsPage role={user.role} tcSbs={tcSbsHistory[0]} />
      }
    }
    switch (operPage) {
      case 'dashboard':   return <DashboardsPage role={user.role} tcSbs={tcSbsHistory[0]} onGoTo={goToOper} />
      case 'dashboards':  return <DashboardsPage role={user.role} tcSbs={tcSbsHistory[0]} onGoTo={goToOper} />
      case 'clientes':    return renderClientes(operTab)
      case 'operaciones': return <OperacionesPage role={user.role} activeTab={operTab} marketData={marketData} ops={ops} setOps={setOps} onPreviewDoc={handlePreviewDoc} notify={notify} setInWizard={setInWizard} />
      case 'posicion': {
        switch (operTab) {
          case 'posicion_fx': return <PosicionFXPage ops={ops} marketData={marketData} tcSbs={tcSbsHistory[0]} />
          case 'saldos':      return <PosicionFXPage activeTab="saldos" ops={ops} marketData={marketData} ajustes={ajustes} onSaveAjuste={handleSaveAjuste} role={user.role} />
          case 'tc_sbs':      return <TcSbsPage history={tcSbsHistory} onUpdate={handleTcSbsUpdate} role={user.role} />
          case 'cierres':     return <CierreDiarioPage ops={ops} tcSbs={tcSbsHistory[0]} cierres={cierres} onCerrar={handleCierreDiario} onRevertir={handleReversionCierre} role={user.role} />
          case 'conciliacion':return <ConciliacionPage role={user.role} />
          default:            return <PosicionFXPage ops={ops} marketData={marketData} />
        }
      }
      case 'reportes':    return <ReportesPage role={user.role} activeTab={operTab} />
      case 'mercado': return (
        <MercadoTCPage 
          activeTab={operTab}
          onTabChange={setOperTab}
          marketData={marketData} 
          onUpdatePizarra={(newP) => setMarketData(prev => ({
            ...prev, 
            pizarra: { compra: newP.compra, venta: newP.venta },
            lastPizarraUpdate: { hora: newP.hora, usuario: newP.usuario },
            history: [{ ...newP }, ...prev.history]
          }))}
        />
      )
      case 'reportes': return (
        <ReportesRegulatoriosPage 
          activeTab={operTab} 
          ops={ops} 
          tcSbsHistory={tcSbsHistory} 
          onExport={handleExportReport} 
        />
      )
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
      marketData={marketData}
      ops={ops}
    >
      {renderContent()}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* ── Notificación Cierre de Día ── */}
      {cierreNotification && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            {/* Banner superior */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="text-white" size={28} />
              </div>
              <h2 className="text-lg font-bold text-white">Día operativo concluido</h2>
              <p className="text-blue-100 text-sm mt-1">QAPAQ FX — Cierre diario completado</p>
            </div>

            {/* Cuerpo */}
            <div className="px-8 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-center" style={{ border: '1px solid var(--color-border)' }}>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Día cerrado</p>
                  <p className="text-sm font-bold text-gray-900">{fmtDate(cierreNotification.fecha)}</p>
                </div>
                <div className="bg-blue-50 rounded-xl px-4 py-3 text-center" style={{ border: '1px solid #bfdbfe' }}>
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mb-1">Próximo día hábil</p>
                  <p className="text-sm font-bold text-blue-700">{fmtDate(cierreNotification.nextFecha)}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Todas las operaciones liquidadas han sido consolidadas. El sistema está listo para iniciar el siguiente día hábil.
              </p>

              <button
                onClick={() => {
                  setOperatingDate(cierreNotification.nextFecha)
                  setCierreNotification(null)
                }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                Confirmar e iniciar {fmtDate(cierreNotification.nextFecha)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación de Salida ── */}
      {showExitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowExitModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">¿Descartar cambios?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Tienes un proceso en curso. Si sales ahora, se perderán los datos ingresados y no completados.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmNavigation}
                className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold shadow-md shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
              >
                Sí, descartar y salir
              </button>
              <button 
                onClick={() => setShowExitModal(false)}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
              >
                Continuar trabajando
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
