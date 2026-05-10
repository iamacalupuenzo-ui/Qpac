# Contexto del Proyecto — QAPAQ FX

> Documentación técnica completa para análisis y modificación del proyecto
> Actualizado: 2026-05-10

---

## 0. Reglas de Trabajo — Leer Primero

1. **Documentar siempre**: Cada cambio de comportamiento, UX o flujo va documentado en `definicion.md`. Cada cambio estructural en `contexto.md`.
2. **Preguntar antes de implementar UX**: Si el cambio involucra layout o decisión visual, validar con el usuario antes de ejecutar.
3. **`definicion.md` es la fuente de verdad de producto**: Contiene decisiones de roles, visibilidad, textos y comportamientos.
4. **No mezclar estilos**: Usar TailwindCSS utility classes. Solo usar estilos inline cuando sea necesario por especificidad.
5. **Datos mock**: Toda la data es simulada. No hay backend ni API real.
6. **Routing por estado**: No hay librería de routing. La navegación se maneja con `useState` en `App.jsx`.
7. **`CAMBIOS.md`**: Mantener actualizado con cada modificación aplicada.

---

## 1. Visión General

**QAPAQ FX** es una SPA (Single Page Application) para la gestión de mesa de cambios (FX) de la Financiera QAPAQ.

| Atributo | Valor |
|----------|-------|
| **Nombre** | qapaq-app |
| **Estado** | Prototipo funcional (v0.0.0) |
| **Tipo** | SPA |
| **Stack** | React 19 + Vite 8 + TailwindCSS 4 |
| **Backend** | Ninguno (datos mock) |
| **Idioma UI** | Español |

### Flujo de navegación
```
Login (email + password) → Sidebar + Header + Contenido (según rol)
```

---

## 2. Estructura de Directorios

```
Qpac/
├── index.html                    # Entry HTML
├── package.json                  # Dependencias y scripts
├── vite.config.js                # Vite config: React + TailwindCSS plugin
├── eslint.config.js              # ESLint flat config
├── CAMBIOS.md                    # Historial de cambios del proyecto
├── README.md                     # README por defecto de Vite
├── usuarios.md                   # Perfiles de usuario y credenciales de prueba
│
├── guidelines/                   # Documentación del proyecto
│   ├── Guidelines.md             # Reglas del sistema
│   ├── guia-estilos.md           # Sistema de diseño
│   ├── contexto.md               # Este archivo — arquitectura técnica
│   └── definicion.md             # Decisiones de producto y UX
│
├── src/
│   ├── main.jsx                  # Punto de entrada React
│   ├── index.css                 # Estilos globales + Tailwind + tokens QAPAQ
│   ├── App.jsx                   # Orquestador principal (678 líneas)
│   │
│   ├── utils/
│   │   └── format.js             # fmtMoney, parseMoney
│   │
│   ├── assets/
│   │   └── hero.png
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx     # Layout shell (sidebar + header + content)
│   │   │   ├── Header.jsx        # Barra superior con market strip
│   │   │   └── Sidebar.jsx       # Sidebar de navegación (role-aware)
│   │   └── ui/
│   │       └── Toast.jsx         # Componente Toast + hook useToast
│   │
│   └── pages/
│       ├── Login.jsx             # Login con credenciales mock
│       ├── AdminDashboard.jsx    # Dashboard admin (3 tabs)
│       │
│       ├── admin/
│       │   ├── UsersPage.jsx     # CRUD de usuarios (934 líneas)
│       │   ├── RolesTab.jsx      # Matriz de roles/permisos
│       │   ├── MesasDineroPage.jsx   # Gestión de mesas
│       │   ├── CatalogosPage.jsx     # Catálogos (7 tabs, 659 líneas)
│       │   └── ParametrosPage.jsx    # Parámetros del sistema
│       │
│       ├── clientes/
│       │   ├── ClientesPage.jsx      # Cartera + tabs (504 líneas)
│       │   ├── ClienteWizard.jsx     # Wizard onboarding (1069 líneas)
│       │   ├── ClienteDetalle.jsx    # Detalle de cliente (7 tabs)
│       │   ├── CuentasBancariasTab.jsx
│       │   ├── ConveniosTab.jsx
│       │   ├── ArbolTraderTab.jsx    # Árbol por cliente
│       │   ├── ArbolTraderGlobalTab.jsx  # Árbol global
│       │   └── ExcepcionesTab.jsx
│       │
│       ├── operaciones/
│       │   ├── OperacionesPage.jsx   # Bandeja principal (1747 líneas)
│       │   ├── CotizacionWizard.jsx  # Wizard cotización (1110 líneas)
│       │   ├── ConfirmarAbonoWizard.jsx  # Wizard confirmación
│       │   ├── RevisionBackOfficeWizard.jsx  # Wizard revisión BO
│       │   ├── SubsanacionWizard.jsx # Wizard subsanación
│       │   ├── ReaperturaDrawer.jsx  # Drawer reapertura
│       │   ├── EnvioBackOfficeDrawer.jsx  # Drawer envío BO
│       │   └── RegistroFXPage.jsx    # Registro FX
│       │
│       ├── tesoreria/
│       │   ├── MercadoTCPage.jsx     # Pizarra TC + feed Datatec
│       │   ├── PosicionFXPage.jsx    # Posición FX (365 líneas)
│       │   ├── SaldosBancariosPage.jsx   # Saldos bancarios
│       │   ├── TcSbsPage.jsx        # TC SBS referencial
│       │   ├── CierreDiarioPage.jsx  # Cierre diario (435 líneas)
│       │   └── AjusteContableDrawer.jsx  # Ajuste contable
│       │
│       ├── reportes/
│       │   ├── ReportesPage.jsx      # Reportes operativos (12 tipos)
│       │   └── ReportesRegulatoriosPage.jsx  # BCRP/SBS (334 líneas)
│       │
│       ├── conciliacion/
│       │   └── ConciliacionPage.jsx
│       │
│       ├── dashboards/
│       │   └── DashboardsPage.jsx    # Dashboards por rol (644 líneas)
│       │
│       └── auditoria/
│           └── AuditoriaPage.jsx     # Visor de auditoría
```

---

## 3. Tecnologías y Versiones

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | React | 19.2.4 |
| Lenguaje | JavaScript (JSX) | — |
| Bundler | Vite | 8.0.4 |
| Estilos | TailwindCSS | 4.2.2 |
| Iconos | Lucide React | 1.8.0 |
| CSS Utils | clsx | 2.1.1 |
| Linter | ESLint (flat config) | 9.39.4 |
| Plugin Vite | @tailwindcss/vite | 4.2.2 |
| Plugin Vite | @vitejs/plugin-react | 6.0.1 |

---

## 4. Componentes Principales

### 4.1 Orquestador — `src/App.jsx` (678 líneas)

**Estado central (todos los datos viven aquí):**

```typescript
// Autenticación
const [user, setUser] = useState(null);         // { name, role, email }

// Navegación admin
const [adminPage, setAdminPage] = useState('dashboard');
const [adminTab, setAdminTab] = useState('resumen');

// Navegación operativa
const [operPage, setOperPage] = useState('dashboard');
const [operTab, setOperTab] = useState('resumen');

// Datos de operaciones
const [ops, setOps] = useState([...]);          // 8 operaciones mock

// Clientes
const [clientes, setClientes] = useState([...]);  // 8 clientes mock
const [clientView, setClientView] = useState('list');  // 'list' | 'wizard' | 'detail'
const [selectedClient, setSelectedClient] = useState(null);
const [nextClientCode, setNextClientCode] = useState('CLI-009');

// Mercado
const [marketData, setMarketData] = useState({...});  // TC + modo

// Tesorería
const [tcSbsHistory, setTcSbsHistory] = useState([]);
const [ajustes, setAjustes] = useState([]);
const [cierres, setCierres] = useState([]);
const [reportExports, setReportExports] = useState([]);

// Wizard guard
const [inWizard, setInWizard] = useState(false);
const [showExitModal, setShowExitModal] = useState(false);
const [pendingNav, setPendingNav] = useState(null);
```

**Modos de navegación:**
- `user.role === 'admin'` → renderiza vistas admin
- Otros roles → renderiza layout operativo (Sidebar + Header + content)

**Simulación Datatec:** `setInterval` cada 3s que varía aleatoriamente TC compra/venta (±0.002). Corte automático a la 1:33 PM cambia a modo manual.

**Navigation Guard:** Si `inWizard === true`, cualquier intento de navegación abre modal de confirmación "¿Descartar cambios?".

**Tabs definidos en constantes:** `ADMIN_TABS`, `ADMIN_TITLES`, `OPERATIVE_PAGE_TABS`, `OPERATIVE_PAGE_TITLES`, `CLIENT_DETAIL_TABS`.

### 4.2 Layout — `src/components/layout/`

**`AppLayout.jsx`:**
- Renderiza `<Sidebar>` + `<Header>` + `<main>`
- Soporta tanto navegación interna como externa (props `extNav`/`extNavigate`)

**`Sidebar.jsx` (143 líneas):**
- Navegación por íconos con tooltips (Lucide)
- Configuración por rol: `navByRole` (`admin`, `tesoreria`, `default`)
- Indicador activo: barra azul izquierda de 3px
- Logo: cuadrado azul con "Q" (32×32, rounded-lg)
- Tooltips: aparecen en hover al costado derecho

**`Header.jsx` (276 líneas):**
- Título de página + tabs de sub-navegación
- **Market Data Strip:** siempre visible en modo operativo
  - Badge modo (Datatec azul / Pizarra ámbar)
  - TC Compra (C: 3.xxx) + tendencia
  - TC Venta (V: 3.xxx) + tendencia
  - Posición neta (Pos. Global/Mesa: ±X USD)
- Barra de búsqueda (placeholder, no funcional)
- Campana de notificaciones (mock)
- Avatar con iniciales + dropdown (Mi perfil, Configuración, Ayuda, Cerrar sesión)
- Tabs: navegación secundaria con indicador azul

### 4.3 Módulo de Operaciones (core)

**`OperacionesPage.jsx` (1747 líneas):** Bandeja principal con 5 tabs:
1. **Bandeja General**: todas las operaciones, filtros por estado (multi-select), búsqueda, acción Editar
2. **Pendientes de Abono**: operaciones listas para confirmar pago
3. **Revisión Back Office**: operaciones enviadas a BO
4. **Observadas**: devueltas por BO
5. **Liquidadas**: operaciones completadas

**Estados mock (`MOCK_OPS_INIT`):** 8 operaciones con datos completos (clienteId, tipo, montos, TC, trader, mesa, backOffice, cuentas, comprobantes, historial, solicitudes de anulación).

**Componentes internos:**
- `FilterSelect()`: dropdown de selección única
- `MultiFilterSelect()`: dropdown con checkboxes multi-estado
- `EditarDrawer()`: drawer lateral para editar monto USD, TC pactado, monto PEN, TC Punta con auto-cálculo y detección de duplicados
- `EstadoBadge()`: badge con color según estado

**`CotizacionWizard.jsx` (1110 líneas):** 4 pasos:
- Step 1: Cliente — buscador + selección
- Step 2: Operación — tipo (Compra/Venta/Cruzada), monto USD, TC pactado, TC punta, fuente TC, auto-cálculo, spread, alerta duplicado, alerta spread negativo
- Step 3: Cuentas — cuentas destino multi-fila, cuentas QAPAQ egreso/ingreso multi-fila, alertas de terceros
- Step 4: Confirmación — resumen completo

**Tipos de operación:**
- **Compra**: cliente entrega USD, recibe PEN
- **Venta**: cliente entrega PEN, recibe USD
- **Cruzada soles**: PEN→USD→PEN entre bancos
- **Cruzada dólares**: USD→PEN→USD entre bancos

### 4.4 Módulo de Clientes

**`ClientesPage.jsx` (504 líneas):** Tabla de cartera con badges de tipo/estado/riesgo, búsqueda, filtros, paginación. 4 tabs: Cartera, Cuentas Bancarias, Convenios, Árbol de Traders.

**`ClienteWizard.jsx` (1069 líneas):** 5 pasos con:
- Simulación SUNAT para autocompletado de RUC
- Gestión PEP (Persona Expuesta Políticamente)
- Validación PLAFT con búsqueda automática y tabla de resultados
- Estados: conforme, no conforme, en proceso

**`ClienteDetalle.jsx`:** 7 tabs de navegación con datos completos del cliente.

### 4.5 Módulo de Tesorería

**`MercadoTCPage.jsx`:** Pizarra con feed Datatec, modo manual, indicadores de tendencia, historial.

**`PosicionFXPage.jsx` (365 líneas):**
- Cálculo: `posición neta = sum(compras) - sum(ventas)`
- Stop Loss configurable con alertas visuales
- Semáforo de saldos
- Vista por mesa (Alpha, Beta, Gamma)

**`CierreDiarioPage.jsx` (435 líneas):** Prerrequisitos (TC SBS + sin ops pendientes), ejecución de cierre, reversión con motivo, notificación de día siguiente hábil.

### 4.6 Módulo de Administración

**`UsersPage.jsx` (934 líneas):** CRUD completo con 9 usuarios mock, roles con colores distintivos, filtros, paginación.

**`CatalogosPage.jsx` (659 líneas):** Sistema genérico de catálogos con schema-driven CRUD. 6 catálogos: Monedas, Bancos, Tipos de Operación, Causas de Anulación, Plazos, Contrapartes.

### 4.7 Reportes

**`ReportesRegulatoriosPage.jsx` (334 líneas):** Generación de preview + exportación para BCRP Adelantado, BCRP Definitivo, RO SBS. Manejo de operaciones cruzadas (2 registros BCRP).

### 4.8 UI Components

**`Toast.jsx`:** Componente de notificación con hook `useToast`. Posición top-right, animación, auto-cierre, tipos success/error/warning.

---

## 5. Roles de Usuario

Los roles definen qué páginas y acciones están disponibles. Ver `usuarios.md` para credenciales y detalle de permisos por módulo.

| Rol | ID | Sidebar items | Nav config |
|-----|----|---------------|------------|
| Administrador | `admin` | Panel Admin, Usuarios, Clientes, Mercado TC, Operaciones, Posición FX, Reportes, Catálogos, Parámetros, Auditoría | `admin` |
| Trader | `trader` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Middle Office | `middle` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Back Office | `back` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Head de Mesa | `head` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Jefe de Op. Centrales | `jefe_op` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Tesorería y Posición | `tesoreria` | Dashboard, Mercado TC, Operaciones, Reportes | `tesoreria` |
| Contabilidad | `contab` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Jefe de Tesorería | `head_tes` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Gerente de Finanzas | `gerente` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Riesgos | `riesgos` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Oficial Cumplimiento PLAFT | `plaft` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Reporte Regulatorio | `reportes` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |
| Seguridad de la Información | `seguridad` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría | `default` |

---

## 6. Datos Mock

| Módulo | Cantidad | Descripción |
|--------|----------|-------------|
| Operaciones | 8 | Estados: reservada, observada, en_revision, subsanada, liquidada, anulada |
| Clientes | 8 | PN(2), P10(1), PJ(3), EF(2). Estados: activo, activo_proceso, pendiente_legal, no_habilitado |
| Auditoría | 30 | Eventos con módulo, rol, resultado, timestamp |
| Usuarios mock login | 14 | admin, trader, middle, back, head, jefe_op, tesoreria, contab, head_tes, gerente, riesgos, plaft, reportes, seguridad |
| Usuarios sistema | 9 | 9 usuarios con roles distintos |
| Mesas de dinero | 3 | Alpha, Beta, Gamma, cada una con head y 2 traders |

---

## 7. Patrones de Código

### 7.1 Estructura de componentes
- Componentes de página y subcomponentes en un solo archivo
- `OperacionesPage.jsx` contiene: FilterSelect, MultiFilterSelect, EstadoBadge, EditarDrawer, OperacionesPage
- Helpers al inicio del archivo (fmtMoney, fmtDate, etc.)

### 7.2 Paleta de colores
- Definida en `index.css` como CSS custom properties bajo `:root`
- `--color-primary-*`: azul (50-700)
- `--color-surface-bg: #f4f4f0`
- `--color-border: #e5e5e1`
- `--sidebar-w: 56px`

### 7.3 Navegación
```javascript
// App.jsx maneja toda la navegación
function handleAdminNavigate(page) {
  if (inWizard) { setPendingNav(...); setShowExitModal(true); return }
  setAdminPage(page)
  setAdminTab(ADMIN_TABS[page]?.[0]?.id ?? null)
}
```

### 7.4 Gestión de estado
- `useState` local en `App.jsx` y cada página
- Sin Context API, Redux ni Zustand
- Comunicación solo por props y callbacks
- `useToast` hook para notificaciones

### 7.5 Animaciones
- Sin librería de animaciones (no hay Framer Motion)
- Transiciones CSS nativas (`transition-all`, `transition-colors`)
- Loading spinners con `animate-spin` de Tailwind

---

## 8. Scripts

| Script | Comando | Propósito |
|--------|---------|-----------|
| dev | `npm run dev` | Servidor de desarrollo con HMR |
| build | `npm run build` | Build de producción a `dist/` |
| preview | `npm run preview` | Preview del build |
| lint | `npm run lint` | ESLint en todos los archivos |

---

## 9. Problemas Conocidos

1. **Componentes monolíticos**: `App.jsx` (678), `OperacionesPage.jsx` (1747), `CotizacionWizard.jsx` (1110), `ClienteWizard.jsx` (1069 líneas)
2. **Sin TypeScript**: Todo en JSX sin tipado estático
3. **Sin librería de routing**: Navegación manual frágil
4. **Sin diseño responsive**: Desktop exclusivo
5. **Datos mock**: Sin integración con backend
6. **Prop drilling excesivo**: Sin Context ni store
7. **`@types/react` y `@types/react-dom` como devDependencies no usadas** (no hay TS)
8. **Sin pruebas unitarias ni E2E**
9. **Estados `pendiente_abono` y `pendiente_reapertura` definidos pero sin flujo completo**
10. **Stop Loss en `PosicionFXPage` independiente del valor en `ParametrosPage`**

---

## 10. Archivos Críticos por Tarea

| Tarea | Archivo(s) principal(es) |
|-------|--------------------------|
| Modificar navegación/App | `src/App.jsx` |
| Agregar/editar operación | `src/pages/operaciones/OperacionesPage.jsx` |
| Modificar wizard cotización | `src/pages/operaciones/CotizacionWizard.jsx` |
| Agregar/editar cliente | `src/pages/clientes/ClienteWizard.jsx` |
| Modificar mercado TC | `src/pages/tesoreria/MercadoTCPage.jsx` |
| Modificar posición FX | `src/pages/tesoreria/PosicionFXPage.jsx` |
| Modificar cierre diario | `src/pages/tesoreria/CierreDiarioPage.jsx` |
| Modificar administración | `src/pages/admin/UsersPage.jsx`, `CatalogosPage.jsx` |
| Modificar layout | `src/components/layout/AppLayout.jsx` |
| Agregar/mover sidebar item | `src/components/layout/Sidebar.jsx` |
| Modificar header/market strip | `src/components/layout/Header.jsx` |
| Cambiar estilos/tokens | `src/index.css` |
| Formateo de montos | `src/utils/format.js` |
| Reportes regulatorios | `src/pages/reportes/ReportesRegulatoriosPage.jsx` |
| Perfiles y credenciales de prueba | `usuarios.md` |
| Decisiones de producto | `guidelines/definicion.md` |

---

*Fin del documento contexto.md*
