# Contexto del Proyecto — QPaC / QAPAQ FX

> Documentación técnica completa para análisis y modificación del proyecto
> Actualizado: 2026-05-07 — v2 (operaciones cruzadas + formateo numérico centralizado)

---

## 0. Reglas de Trabajo

1. **Datos mock**: Toda la data es simulada (hardcoded). No hay backend ni API real.
2. **Routing por estado**: No hay librería de routing. La navegación se maneja con `useState` en `App.jsx` (variables `adminPage`, `operPage`, `adminTab`, `operTab`).
3. **Estado global**: Toda la data vive en `App.jsx` y se pasa por props. No hay Context API, Redux ni Zustand.
4. **Sin TypeScript**: El proyecto usa JavaScript plano (JSX).
5. **Documentar cambios**: Cada cambio de comportamiento, UX o flujo se documenta en `definicion.md`. Cada cambio estructural en `contexto.md`.

---

## 1. Visión General

**QPaC (QAPAQ FX)** es una SPA (Single Page Application) para la **gestión de mesa de cambios (FX)** de la Financiera QAPAQ, una entidad financiera peruana. Cubre el ciclo de vida completo de operaciones de cambio:

- Captura de cotizaciones (Front Office / Traders)
- Verificación y aprobación (Back Office)
- Gestión de posiciones (Tesorería)
- Cierre diario y reportes regulatorios (BCRP, SBS)
- Gestión de clientes (onboarding, documentación, validación PLAFT)
- Datos de mercado (tipo de cambio vía feed Datatec o pizarra manual)
- Panel de administración (usuarios, roles, permisos, catálogos, parámetros, auditoría)

| Atributo | Valor |
|----------|-------|
| **Nombre** | qapaq-app |
| **Estado** | Prototipo funcional (v0.0.0) |
| **Tipo** | SPA (Single Page Application) |
| **Stack** | React 19 + Vite 8 + TailwindCSS 4 |
| **Backend** | Ninguno (datos mock) |
| **Idioma UI** | Español |

---

## 2. Estructura de Directorios

```
Qpac/
├── index.html                        # Entry HTML
├── package.json                      # Dependencias y scripts
├── vite.config.js                    # Vite config: React + TailwindCSS
├── eslint.config.js                  # ESLint flat config
├── CAMBIOS.md                        # Historial de cambios del proyecto
├── README.md                         # README por defecto de Vite
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── main.jsx                      # Punto de entrada React
│   ├── index.css                     # Estilos globales + TailwindCSS + tokens QAPAQ
│   ├── App.jsx                       # Orquestador principal (678 líneas)
│   │
│   ├── utils/
│   │   └── format.js                 # Utilidades centralizadas: fmtMoney, parseMoney
│   │
│   ├── assets/
│   │   ├── vite.svg
│   │   ├── react.svg
│   │   └── hero.png
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx         # Layout shell (sidebar + header + content)
│   │   │   ├── Header.jsx            # Barra superior: búsqueda, user menu, market strip
│   │   │   └── Sidebar.jsx           # Sidebar de navegación con íconos (role-aware)
│   │   └── ui/
│   │       └── Toast.jsx             # Componente Toast + hook useToast
│   │
│   └── pages/
│       ├── Login.jsx                 # Login con credenciales mock
│       ├── AdminDashboard.jsx        # Dashboard admin (3 tabs)
│       │
│       ├── admin/
│       │   ├── UsersPage.jsx         # CRUD de usuarios
│       │   ├── RolesTab.jsx          # Matriz de roles/permisos
│       │   ├── MesasDineroPage.jsx   # Gestión de mesas de dinero
│       │   ├── CatalogosPage.jsx     # Catálogos del sistema (7 tabs)
│       │   └── ParametrosPage.jsx    # Parámetros del sistema
│       │
│       ├── clientes/
│       │   ├── ClientesPage.jsx      # Cartera de clientes + 4 tabs
│       │   ├── ClienteWizard.jsx     # Wizard de onboarding (5 pasos)
│       │   ├── ClienteDetalle.jsx    # Detalle de cliente (7 tabs)
│       │   ├── CuentasBancariasTab.jsx
│       │   ├── ConveniosTab.jsx
│       │   ├── ArbolTraderTab.jsx    # Árbol de asignación por cliente
│       │   ├── ArbolTraderGlobalTab.jsx
│       │   └── ExcepcionesTab.jsx
│       │
│       ├── operaciones/
│       │   ├── OperacionesPage.jsx   # Bandeja de operaciones (5 tabs, 1737 líneas)
│       │   ├── CotizacionWizard.jsx  # Wizard de cotización (4 pasos)
│       │   ├── ConfirmarAbonoWizard.jsx  # Wizard de confirmación de abono (3 pasos)
│       │   ├── RevisionBackOfficeWizard.jsx  # Wizard revisión BO (4 pasos)
│       │   ├── SubsanacionWizard.jsx # Wizard de subsanación (3 pasos)
│       │   ├── ReaperturaDrawer.jsx  # Drawer de reapertura
│       │   ├── EnvioBackOfficeDrawer.jsx  # Drawer de envío a BO
│       │   └── RegistroFXPage.jsx    # Registro FX
│       │
│       ├── tesoreria/
│       │   ├── MercadoTCPage.jsx     # Pizarra TC + feed Datatec simulado
│       │   ├── PosicionFXPage.jsx    # Posición FX por mesa y global
│       │   ├── SaldosBancariosPage.jsx   # Saldos bancarios
│       │   ├── TcSbsPage.jsx        # Registro TC SBS
│       │   ├── CierreDiarioPage.jsx  # Cierre diario
│       │   └── AjusteContableDrawer.jsx  # Ajuste contable
│       │
│       ├── reportes/
│       │   ├── ReportesPage.jsx      # Reportes operativos (12 tipos)
│       │   └── ReportesRegulatoriosPage.jsx  # Reportes BCRP/SBS
│       │
│       ├── conciliacion/
│       │   └── ConciliacionPage.jsx  # Conciliación bancaria
│       │
│       ├── dashboards/
│       │   └── DashboardsPage.jsx    # Dashboards por rol con KPIs
│       │
│       └── auditoria/
│           └── AuditoriaPage.jsx     # Visor de auditoría con filtros
│
└── mejoras/
    ├── contexto.md                   # Este archivo
    └── definicion.md                 # Decisiones de producto y UX
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
| UI Utils | clsx | 2.1.1 |
| Linter | ESLint (flat config) | 9.39.4 |

---

## 4. Componentes Principales

### 4.1 Orquestador — `src/App.jsx` (678 líneas)

**Estado central (todos los datos viven aquí):**

```javascript
// Autenticación
const [user, setUser] = useState(null);         // { name, role, email, ... }

// Navegación
const [adminPage, setAdminPage] = useState('dashboard');
const [operPage, setOperPage] = useState('operaciones');
const [adminTab, setAdminTab] = useState('resumen');
const [operTab, setOperTab] = useState('bandeja');

// Datos de operaciones
const [ops, setOps] = useState(MOCK_OPS);       // Array de 8 operaciones mock

// Clientes
const [clientes, setClientes] = useState(MOCK_CLIENTES);  // 8 clientes mock
const [clientView, setClientView] = useState('list');     // 'list' | 'wizard' | 'detail'
const [selectedClient, setSelectedClient] = useState(null);
const [nextClientCode, setNextClientCode] = useState(9);

// Mercado
const [marketData, setMarketData] = useState({...});  // TC compra/venta + modo

// Tesorería
const [tcSbsHistory, setTcSbsHistory] = useState([]);
const [ajustesContables, setAjustesContables] = useState([]);
const [cierresDiarios, setCierresDiarios] = useState([]);
const [reportesGenerados, setReportesGenerados] = useState([]);

// Navegación segura
const [inWizard, setInWizard] = useState(false);
```

**Modos de navegación:**
- `user.role === 'admin'` → renderiza `AdminDashboard` y páginas admin
- Otros roles → renderiza layout operativo con Sidebar + Header + page content

**Simulación Datatec:** `setInterval` cada 3 segundos que varía aleatoriamente el TC compra/venta (±0.005).

### 4.2 Layout — `src/components/layout/`

**`AppLayout.jsx`:**
- Renderiza `<Sidebar>` (izquierda) + `<Header>` (arriba) + `<main>` (contenido central)
- Maneja estado de navegación interna (secciones colapsables)

**`Sidebar.jsx`:**
- Navegación por íconos con tooltips (Lucide icons)
- Definido por rol: `navByRole` con configuraciones para `admin`, `tesoreria`, y `default`
- Cada ítem: ícono + label + estado activo con indicador visual

**`Header.jsx`:**
- Título de página + tabs de sub-navegación
- Market data strip (feed en vivo: TC compra/venta, tendencia, modo, posición neta)
- Barra de búsqueda, campana de notificaciones, menú de usuario
- Avatar con iniciales + label de rol

### 4.3 Módulo de Operaciones (core)

**`OperacionesPage.jsx` (1737 líneas):** Bandeja principal con 5 tabs:
1. **Bandeja General**: todas las operaciones con filtros por estado
2. **Pendientes de Abono**: operaciones listas para confirmar pago
3. **Revisión Back Office**: operaciones enviadas a BO para verificación
4. **Observadas**: operaciones devueltas por BO con observaciones
5. **Liquidadas**: operaciones completadas

Estados de operación: `reservado`, `pendiente_abono`, `en_revision_bo`, `observado`, `subsanado`, `liquidado`, `anulado`.

**`CotizacionWizard.jsx` (4 pasos):** Cliente → Operación (monto, TC, spread) → Cuentas → Confirmación
- Tipos de operación: **Compra**, **Venta**, **Cruzada** (soles o dólares)
- Compra: `montoPEN = montoUSD × tcPactado`
- Venta: `montoUSD = montoPEN / tcPactado`
- Cruzada: `contravalor = monto × min(tcPactado, tcPunta) / max(tcPactado, tcPunta)` — genera 2 registros BCRP
- Spread compra: `tcPunta − tcPactado`; Venta: `tcPactado − tcPunta`; Cruzada: `|tcPactado − tcPunta|`
- Fuente TC: Datatec (auto-fill) o Manual; auto-fill usa compra para cruzada soles, venta para cruzada dólares
- Inputs de monto usan `type="text"` con **format-on-blur** (`fmtMoney`) y strip-on-focus
- Inputs TC usan `type="text"` con `inputMode="decimal"` y reemplazo `,` → `.`
- Todos los `parseFloat` sobre montos usan `parseMoney()` de `utils/format.js`

**`RevisionBackOfficeWizard.jsx` (4 pasos):** Revisión → Decisión → Confirmación → Liquidación
- Causas de observación configurables (comprobante ilegible, monto不一致, cuenta incorrecta, etc.)

**`ConfirmarAbonoWizard.jsx` (3 pasos):** Verificación montos → Documentación → Confirmación
- Cuentas destino con flag `_preset` (solo lectura vs editable)
- Carga de archivos (hasta 10)
- Monto pre-cargado con formato `fmtMoney` (ej. `100,000.00`)
- Input monto usa `type="text"` con format-on-blur; TC usa `type="text"` con `,` → `.`

### 4.4 Módulo de Clientes

**`ClienteWizard.jsx` (5 pasos):**
1. Tipo de cliente (PN, P10, PJ, EF)
2. Datos básicos (con simulación SUNAT para PJ/EF)
3. Documentación (reglas PEP/PLAFT)
4. Validación PLAFT (mock con colores: verde/ámbar/rojo)
5. Confirmación

**`ClienteDetalle.jsx` (7 tabs):** Datos generales, Documentación, PLAFT, Cuentas bancarias, Convenios, Asignación (árbol trader), Excepciones

### 4.5 Módulo de Tesorería

**`MercadoTCPage.jsx`:** Pizarra de TC con:
- Feed Datatec simulado (auto-actualización cada 3s)
- Modo manual/automático (corte a la 1:33 PM)
- Indicadores de tendencia (TrendBadge)
- Historial de ediciones con atribución

**`PosicionFXPage.jsx`:** Posición = compras USD - ventas USD, por mesa y global.

**`TcSbsPage.jsx`:** Registro de TC referencial SBS con detección de cotización atípica (tolerancia 3.600 - 3.900).

**`CierreDiarioPage.jsx`:** Proceso de cierre diario con prerequisitos (TC SBS registrado, sin operaciones pendientes) y capacidad de reversión.

### 4.6 Módulo de Administración

- **`AdminDashboard.jsx`**: Resumen (KPIs, parámetros), Actividad (timeline), Sistema (conexiones)
- **`UsersPage.jsx`**: CRUD de usuarios con generación de contraseñas
- **`RolesTab.jsx`**: Matriz de 6 permisos x 25+ módulos
- **`MesasDineroPage.jsx`**: Gestión de mesas con jefes y traders asignados
- **`CatalogosPage.jsx`**: 7 tipos de catálogo con CRUD inline
- **`ParametrosPage.jsx`**: Configuración de límites, seguridad, regulatorio

### 4.7 Reportes

- **`ReportesPage.jsx`**: 12 tipos de reportes operativos con exportación simulada
- **`ReportesRegulatoriosPage.jsx`**: 3 reportes regulatorios (BCRP Adelantado, BCRP Definitivo, RO SBS)

### 4.8 Otros

- **`ConciliacionPage.jsx`**: Ingreso de conciliación bancaria
- **`DashboardsPage.jsx`**: KPIs por rol
- **`AuditoriaPage.jsx`**: Visor de auditoría con 30 registros mock, filtros por módulo/rol/resultado, paginación

---

## 5. Roles de Usuario

Los roles definen qué páginas y acciones están disponibles. Se seleccionan en el login mock.
Ver `usuarios.md` para credenciales y detalle de permisos por módulo.

| Rol | ID | Sidebar | Acceso principal |
|-----|----|---------|------------------|
| Administrador | `admin` | admin | Todo el sistema — configuración y administración |
| Trader | `trader` | default | Front Office — cotizar, bandeja, clientes |
| Middle Office | `middle` | default | Gestión de clientes M0, operaciones (bandeja) |
| Back Office | `back` | default | Validación y liquidación de operaciones |
| Head de Mesa | `head` | default | Supervisión M0, M1, M3 |
| Jefe de Op. Centrales | `jefe_op` | default | M2, M3, M4 — cierre diario |
| Tesorería y Posición | `tesoreria` | tesoreria | Posición FX, cierre, reportes |
| Contabilidad | `contab` | default | Posición FX — trama contable |
| Jefe de Tesorería | `head_tes` | default | Acceso amplio M0–M6 |
| Gerente de Finanzas | `gerente` | default | Dashboards gerenciales, reportes |
| Riesgos | `riesgos` | default | M3, reportes regulatorios |
| Oficial Cumpl. PLAFT | `plaft` | default | M0 PLAFT, reportes operativos |
| Reporte Regulatorio | `reportes` | default | M5, reportes operativos |
| Seguridad Información | `seguridad` | default | Solo lectura — logs y auditoría |

---

## 6. Datos Mock

| Módulo | Cantidad | Descripción |
|--------|----------|-------------|
| Operaciones | 8 | Diferentes estados: reservado, observado, revisión, liquidado, anulado |
| Clientes | 8 | Tipos: PN, P10, PJ, EF. Estados: activo, activo_proceso, pendiente_legal, no_habilitado |
| Auditoría | 30 | Registros con diferentes módulos, roles y resultados |
| Usuarios login | 14 | admin, trader, middle, back, head, jefe_op, tesoreria, contab, head_tes, gerente, riesgos, plaft, reportes, seguridad |
| Usuarios sistema | 9 | 9 usuarios con roles distintos en UsersPage |
| Mesas de dinero | 3 | Cada una con jefe y traders asignados |

**Credenciales de login (mock):** Ver `usuarios.md` para lista completa.

---

## 7. Patrones de Código

### 7.1 Navegación
```javascript
// App.jsx maneja toda la navegación con useState
// Las páginas reciben props y callbacks
<OperacionesPage
  ops={ops}
  setOps={setOps}
  user={user}
  onNavigate={handleNavigate}
/>
```

### 7.2 Modales y wizards
- Los wizards se renderizan como componentes condicionales en las páginas
- Estado `showWizard` + `setWizardStep` controlan el flujo
- Los wizards tienen 3-5 pasos con navegación "Anterior" / "Siguiente"

### 7.3 Comunicación entre componentes
- Solo props (de padre a hijo) y callbacks (de hijo a padre)
- No hay CustomEvents, Context API ni librería de estado global
- `useToast` hook para notificaciones (Toast.jsx)

### 7.4 Estilos
- TailwindCSS utility classes
- Tokens de diseño QAPAQ en `index.css` (colores, bordes, sombras)
- Sin CSS modules ni styled-components

---

## 8. Scripts

| Script | Comando | Propósito |
|--------|---------|-----------|
| dev | `npm run dev` | Servidor de desarrollo con HMR |
| build | `npm run build` | Build de producción a `dist/` |
| preview | `npm run preview` | Preview del build de producción |
| lint | `npm run lint` | ESLint en todos los archivos |

---

## 9. Problemas Conocidos

1. **Componentes monolíticos**: `App.jsx` (678), `OperacionesPage.jsx` (1737), `CotizacionWizard.jsx` (1110), `ClienteWizard.jsx` (1069 líneas) — necesitan refactorización.
2. **Sin TypeScript**: Todo es JSX, sin tipado estático.
3. **Sin librería de routing**: La navegación manual con `useState` es frágil.
4. **Sin diseño responsive**: Aplicación diseñada solo para desktop.
5. **Datos mock**: Toda la data es hardcoded — no hay integración con backend.
6. **Estado global rudimentario**: Prop drilling excesivo, sin Context ni store.
7. `package.json` contiene `@types/react` y `@types/react-dom` como devDependencies pero no se usan (no hay TypeScript).

---

## 10. Archivos Críticos por Tarea

| Tarea | Archivo(s) principal(es) |
|-------|--------------------------|
| Modificar lógica de navegación | `src/App.jsx` |
| Agregar/editar operación | `src/pages/operaciones/` |
| Agregar/editar cliente | `src/pages/clientes/` |
| Modificar mercado TC / posiciones | `src/pages/tesoreria/` |
| Modificar administración | `src/pages/admin/` |
| Agregar reporte | `src/pages/reportes/` |
| Modificar layout | `src/components/layout/` |
| Agregar/mover sidebar item | `src/components/layout/Sidebar.jsx` |
| Modificar header/market strip | `src/components/layout/Header.jsx` |
| Cambiar estilos globales/tokens | `src/index.css` |
| Formateo/parseo de montos | `src/utils/format.js` |
| Decisiones de producto/UX | `definicion.md` |

---

*Fin del documento contexto.md*
