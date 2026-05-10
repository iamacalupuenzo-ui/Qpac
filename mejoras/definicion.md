# Definición de Producto — QPaC / QAPAQ FX

> Decisiones de UX, roles, flujos de negocio y reglas de producto.
> Actualizado: 2026-05-07 — v2 (operaciones cruzadas + estándar de formateo numérico)

---

## 1. Perfiles de Usuario (Roles)

La app tiene **14 roles** que determinan qué módulos y acciones están disponibles. Ver `usuarios.md` para detalle completo de permisos por módulo y credenciales.

| Rol | ID | Descripción |
|-----|----|-------------|
| **Administrador** | `admin` | Acceso total — configuración del sistema |
| **Trader** | `trader` | Front Office · Cotización y registro FX |
| **Middle Office** | `middle` | Gestión de clientes y cartera (M0) |
| **Back Office** | `back` | Validación y liquidación de operaciones |
| **Head de Mesa** | `head` | Supervisión Mesa · M0 excepciones, M1, M3 |
| **Jefe de Op. Centrales** | `jefe_op` | M2, M3, M4 · Cierre diario |
| **Tesorería y Posición** | `tesoreria` | Posición FX · Cierre y reportes |
| **Contabilidad** | `contab` | Posición FX · Trama contable |
| **Jefe de Tesorería** | `head_tes` | Acceso amplio M0–M6 |
| **Gerente de Finanzas** | `gerente` | Dashboards gerenciales y reportes (R) |
| **Riesgos** | `riesgos` | M3 y reportes regulatorios |
| **Oficial Cumplimiento PLAFT** | `plaft` | M0 PLAFT y reportes operativos |
| **Reporte Regulatorio** | `reportes` | M5 y reportes operativos |
| **Seguridad de la Información** | `seguridad` | Solo lectura · Logs y auditoría |

### Selección de rol
- Los roles se seleccionan en la pantalla de login (mock).
- Cada rol tiene credenciales predefinidas (ver `usuarios.md`).
- No hay cambio de rol en sesión — el rol se fija al hacer login.

---

## 2. Módulo de Operaciones — Ciclo de Vida

### 2.1 Estados de una Operación

```
Reservado → Pendiente Abono → En Revisión BO → Liquidado
                                  ↘  Observado → Subsanado → En Revisión BO → Liquidado
Reservado → Anulado (en cualquier momento antes de liquidación)
Liquidado → Reapertura (solo tesorería)
```

| Estado | Descripción | Acciones disponibles |
|--------|-------------|---------------------|
| `reservado` | Cotización creada por trader, TC reservado | Editar, Anular, Enviar a abono |
| `pendiente_abono` | Esperando confirmación de pago del cliente | Confirmar abono, Anular |
| `en_revision_bo` | Enviada a Back Office para verificación | Revisar (aprobar/observar) |
| `observado` | Devuelta por BO con observaciones | Subsanar (corregir y re-enviar) |
| `subsanado` | Corregida por trader, re-enviada a BO | Revisar (Back Office) |
| `liquidado` | Operación completada | Ver detalle, Reabrir (tesorería) |
| `anulado` | Operación cancelada | Ver detalle |

### 2.2 Wizard de Cotización (4 pasos)

**Paso 1 — Cliente:**
- Buscador de cliente por nombre, código o RUC
- Muestra datos del cliente seleccionado (tipo, estado, límites)
- Validación: cliente debe estar en estado `activo`

**Paso 2 — Operación:**
- Tipo: **Compra** / **Venta** / **Cruzada** (soles o dólares)
- Monto en la moneda correspondiente al tipo
- TC Punta (referencia, auto-rellenado desde Datatec) y TC Pactado (con el cliente)
- Fuente TC: Datatec automático o Manual
- Detección de duplicados (mismo cliente, mismo monto, TC similar)

_Compra_ (cliente entrega USD, recibe PEN):
- Contravalor PEN = `Monto USD × TC Pactado`
- Spread = `TC Punta − TC Pactado`

_Venta_ (cliente entrega PEN, recibe USD):
- Contravalor USD = `Monto PEN / TC Pactado`
- Spread = `TC Pactado − TC Punta`

_Cruzada_ (cliente entrega fondos en un banco y recibe la **misma moneda** en otro banco):
- Subtipos: **Cruzada soles** (PEN→USD→PEN entre bancos) y **Cruzada dólares** (USD→PEN→USD entre bancos)
- Contravalor = `Monto × min(TC Pactado, TC Punta) / max(TC Pactado, TC Punta)`
- Fee QAPAQ = `Monto − Contravalor`
- Spread = `|TC Pactado − TC Punta|` (siempre positivo)
- Orden correcto de TCs: cruzada soles → `TC Pactado > TC Punta`; cruzada dólares → `TC Pactado < TC Punta`
- Auto-fill Datatec: cruzada soles usa TC **compra**; cruzada dólares usa TC **venta**
- Genera **2 registros BCRP** (compra + venta simultáneos) y 2 comprobantes al cliente
- Para la posición: no genera montoUSD neto; `montoPEN = null`

**Paso 3 — Cuentas:**
- Selección de cuenta del cliente (desde sus cuentas bancarias registradas)
- Selección de cuenta(s) QAPAQ (multi-cuenta)
- Cuenta interbancaria (CCI) para transferencias

**Paso 4 — Confirmación:**
- Resumen de toda la operación
- Botón "Confirmar" → crea la operación en estado `reservado`

### 2.3 Wizard de Confirmación de Abono (3 pasos)

**Paso 1 — Verificación de montos:**
- Muestra montos originales vs. montos reales abonados
- Validación: montos deben coincidir (tolerancia configurable)

**Paso 2 — Documentación y cuentas:**
- Cuentas destino pre-cargadas (flag `_preset` = readonly) o editables
- Carga de comprobantes (hasta 10 archivos)
- Previsualización de documentos en ventana emergente

**Paso 3 — Confirmación:**
- Resumen de abono
- Botón "Confirmar Abono" → cambia estado a `pendiente_abono`

### 2.4 Wizard de Revisión Back Office (4 pasos)

**Paso 1 — Revisión:**
- Visualización completa de la operación
- Documentos adjuntos

**Paso 2 — Decisión:**
- Aprobar → pasa a liquidación
- Observar → requiere seleccionar causa(s):
  - Comprobante ilegible
  - Monto no coincide
  - Cuenta incorrecta
  - Documentación incompleta
  - Otro (texto libre)

**Paso 3 — Confirmación:**
- Resumen de la decisión
- Si es liquidación: ingreso de referencia de transferencia bancaria
- Desglose de pagos multi-cuenta

**Paso 4 — Liquidación:**
- Operación marcada como `liquidado`
- Registro de fecha/hora de liquidación

### 2.5 Wizard de Subsanación (3 pasos)

**Paso 1 — Ver observación:**
- Muestra las observaciones del BO
- Documentos originales

**Paso 2 — Corrección:**
- Trader corrige los datos observados
- Re-carga de documentos si aplica

**Paso 3 — Re-enviar:**
- Confirma correcciones
- Operación vuelve a `subsanado` → queda en cola de revisión BO

### 2.6 Reapertura

- Solo disponible para rol `tesoreria`
- Operaciones liquidadas pueden reabrirse con justificación
- Drawer de reapertura con campo de motivo obligatorio
- Operación vuelve a estado `reservado`

---

## 3. Módulo de Clientes

### 3.1 Tipos de Cliente

| Tipo | ID | Descripción |
|------|----|-------------|
| Persona Natural | `PN` | Persona individual |
| Persona con Negocio | `P10` | Persona natural con negocio propio |
| Persona Jurídica | `PJ` | Empresa |
| Entidad Financiera | `EF` | Banco o financiera |

### 3.2 Estados de Cliente

| Estado | Descripción |
|--------|-------------|
| `activo` | Cliente habilitado para operar |
| `activo_proceso` | Cliente activo pero en proceso de documentación |
| `pendiente_legal` | Pendiente de revisión legal |
| `no_habilitado` | Cliente no habilitado para operar |

### 3.3 Wizard de Onboarding (5 pasos)

**Paso 1 — Tipo de Cliente:**
- Selección del tipo (PN, P10, PJ, EF)
- El tipo determina los requisitos de documentación

**Paso 2 — Datos Básicos:**
- PN/P10: nombres, apellidos, DNI, fecha nacimiento, nacionalidad
- PJ/EF: razón social, RUC (con simulación de búsqueda SUNAT), fecha constitución
- Dirección, teléfono, email

**Paso 3 — Documentación:**
- Requisitos automáticos según tipo de cliente
- Gestión de PEP (Persona Expuesta Políticamente):
  - ¿Es PEP? → formulario adicional con cargo, entidad, fecha inicio/fin
  - ¿Familiar de PEP? → datos del familiar PEP
- Carga de documentos digitales

**Paso 4 — Validación PLAFT:**
- Búsqueda mock en listas nacionales e internacionales
- Resultado visual por color:
  - 🟢 Verde: Sin coincidencias — cliente apto
  - 🟡 Ámbar: Coincidencias parciales — requiere revisión
  - 🔴 Rojo: Coincidencias plenas — bloqueado
- Detalle de listas consultadas (OFAC, ONU, SUNAT, etc.)

**Paso 5 — Confirmación:**
- Resumen de toda la información
- Código de cliente generado automáticamente

### 3.4 Detalle de Cliente (7 tabs)

| Tab | Contenido |
|-----|-----------|
| **Datos Generales** | Información del cliente (editable) |
| **Documentación** | Documentos cargados y requisitos |
| **PLAFT** | Resultados de validación PLAFT |
| **Cuentas Bancarias** | Cuentas registradas del cliente |
| **Convenios** | Convenios y acuerdos |
| **Asignación** | Árbol de asignación de traders por cliente |
| **Excepciones** | Excepciones documentarias |

### 3.5 Árbol de Asignación (Trader Tree)

- Los clientes se asignan a traders dentro de una mesa de dinero
- Estructura jerárquica: Mesa → Trader (asesor) → Cliente
- Restricción: solo se puede reasignar dentro de la misma mesa
- Historial de asignaciones

---

## 4. Módulo de Tesorería

### 4.1 Mercado TC / Pizarra

- **Modo Automático** (Datatec): Feed simulado que actualiza TC cada 3 segundos con variación aleatoria (±0.005)
- **Modo Manual**: El usuario puede fijar el TC de compra y venta
- **Corte automático**: A la 1:33 PM el sistema pasa a modo manual (hora de cierre del mercado)
- **Indicadores de tendencia**: ▲ (sube), ▼ (baja), – (estable) con delta de variación
- **Historial de ediciones**: registro de quién modificó cada TC y cuándo

### 4.2 Posición FX

- **Fórmula**: `Posición = Compras USD - Ventas USD`
- Vista por mesa de dinero
- Vista global (todas las mesas)
- Posición neta en USD

### 4.3 TC SBS (Regulatorio)

- Registro del tipo de cambio referencial de la SBS
- **Detección de cotización atípica**: si el TC está fuera del rango 3.600 - 3.900, muestra advertencia
- Opción de guardado forzado con justificación (override)
- Histórico de TC SBS registrados

### 4.4 Cierre Diario

- **Prerrequisitos para cerrar:**
  - TC SBS registrado para la fecha
  - No hay operaciones pendientes (sin `reservado`, `pendiente_abono`, etc.)
  - Posiciones conciliadas
- **Proceso:** Acumula operaciones liquidadas del día → genera resumen → cierra
- **Reversión:** Capacidad de revertir un cierre con motivo obligatorio
- **Notificación visual:** Al día siguiente hábil, muestra recordatorio de pendientes

### 4.5 Saldos Bancarios

- Registro de saldos por cuenta bancaria de QAPAQ
- Moneda, banco, número de cuenta, saldo contable, saldo disponible
- Fecha de corte

---

## 5. Módulo de Administración

### 5.1 Dashboard Admin (3 tabs)

| Tab | Contenido |
|-----|-----------|
| **Resumen** | Cards KPI (usuarios activos, operaciones del día, etc.), parámetros de seguridad y operativos, resumen de usuarios/catálogos/auditoría |
| **Actividad** | Timeline de eventos del sistema, sesiones activas |
| **Sistema** | Conexiones activas, sesiones, tareas programadas |

### 5.2 Usuarios

- CRUD completo: nombre, email, rol, mesa asignada, estado (activo/inactivo)
- Generación automática de contraseña
- Búsqueda y filtros

### 5.3 Roles y Permisos

Matriz de permisos (6 tipos x 25+ módulos):

| Permiso | Descripción |
|---------|-------------|
| `ver` | Visualizar el módulo |
| `crear` | Crear nuevos registros |
| `editar` | Modificar registros existentes |
| `anular` | Anular operaciones |
| `aprobar` | Aprobar operaciones en revisión |
| `exportar` | Exportar datos del módulo |

### 5.4 Mesas de Dinero

- Gestión de mesas: código, nombre, estado
- Asignación de jefe de mesa
- Asignación de traders a cada mesa
- Cada mesa puede tener múltiples traders

### 5.5 Catálogos (7 tipos)

| Catálogo | Contenido |
|----------|-----------|
| Monedas | Código, nombre, símbolo |
| Bancos | Código, nombre |
| Tipos de Operación | Compra, Venta |
| Causas de Observación | Motivos para devolución BO |
| Motivos de Anulación | Razones de cancelación |
| Tipos de Documento | DNI, RUC, CE, Pasaporte |
| Parámetros de Riesgo | Límites por cliente/tipo |

### 5.6 Parámetros del Sistema

| Categoría | Parámetros |
|-----------|------------|
| Operativos | Límite máximo por operación, spread mínimo, tolerancia montos |
| Seguridad | Máximo intentos de login, expiración de contraseña, 2FA |
| Regulatorio | Rango TC SBS, horario de corte, reportes obligatorios |
| Sistema | Formato de códigos, serie de documentos, configuración regional |

---

## 6. Módulo de Reportes

### 6.1 Reportes Operativos (12 tipos)

| Reporte | Descripción |
|---------|-------------|
| Operaciones del Día | Todas las operaciones del día actual |
| Operaciones por Cliente | Histórico por cliente |
| Operaciones por Trader | Producción por trader |
| Operaciones por Mesa | Volumen por mesa de dinero |
| Spreads | Análisis de spreads aplicados |
| Posición FX | Resumen de posiciones |
| TC Histórico | Evolución del TC |
| Clientes Nuevos | Clientes registrados en un período |
| Clientes por Estado | Distribución de estados de cliente |
| PLAFT | Reporte de validaciones realizadas |
| Auditoría | Eventos de auditoría |
| Operaciones Anuladas | Histórico de anulaciones |

### 6.2 Reportes Regulatorios (3 tipos)

| Reporte | Entidad | Descripción |
|---------|---------|-------------|
| BCRP Adelantado | BCRP | Reporte preliminar de operaciones de cambio |
| BCRP Definitivo | BCRP | Reporte consolidado del período |
| RO SBS | SBS | Reporte Operativo SBS |

---

## 7. Módulo de Auditoría

- 30 registros mock de eventos del sistema
- Filtros por: módulo, rol, resultado (éxito/error), rango de fechas
- Columnas: fecha/hora, usuario, rol, módulo, acción, detalle, resultado, IP
- Paginación (10 registros por página)

---

## 8. Módulo de Dashboards

Dashboards con KPIs adaptados al rol:

| Rol | KPIs principales |
|-----|-----------------|
| Trader | Mis operaciones del día, volumen operado, spreads obtenidos |
| Middle | Operaciones pendientes, posición por mesa, alertas |
| Back Office | Operaciones por revisar, pendientes de liquidación |
| Tesorería | Posición global, TC mercado, saldos bancarios |

---

## 9. Reglas de Negocio

### 9.1 Cálculos de Operación

**Compra** (cliente entrega USD):
- Contravalor PEN = `Monto USD × TC Pactado`
- Spread = `TC Punta − TC Pactado`

**Venta** (cliente entrega PEN):
- Contravalor USD = `Monto PEN / TC Pactado`
- Spread = `TC Pactado − TC Punta`

**Cruzada** (misma moneda, diferente banco):
- Contravalor = `Monto × min(TC Pactado, TC Punta) / max(TC Pactado, TC Punta)`
- Fee QAPAQ = `Monto − Contravalor`
- Spread = `|TC Pactado − TC Punta|`
- TC Punta = fuente Datatec (compra si es cruzada soles, venta si es cruzada dólares)

### 9.2 Validaciones de Operación

- No se puede cotizar a un cliente en estado `no_habilitado`
- No se puede cotizar a un cliente `pendiente_legal`
- Monto máximo por operación (según parámetros)
- Spread mínimo (según parámetros)
- Detección de operaciones duplicadas (mismo cliente, rango de montos y TC similar)

### 9.3 Validaciones de Cliente

- RUC debe tener 11 dígitos (PJ/EF)
- DNI debe tener 8 dígitos (PN/P10)
- PEP requiere formulario adicional obligatorio
- Documentación obligatoria según tipo de cliente

### 9.4 Reglas de Cierre Diario

- No se puede cerrar sin TC SBS registrado
- No se puede cerrar con operaciones pendientes
- Un cierre revertido puede ser re-ejecutado

---

## 10. Decisiones de UX

### 10.1 Layout General

- Sidebar izquierdo con íconos + tooltips (navegación principal)
- Header superior con market data strip (siempre visible en modo operativo)
- Contenido central con scroll vertical
- Diseño desktop exclusivo (sin responsive)

### 10.2 Wizards

- Todos los wizards tienen paso numerado (Paso X de Y)
- Navegación: Anterior / Siguiente / Cancelar
- Confirmación final con resumen antes de ejecutar
- Protección contra cierre accidental (modal de confirmación si `inWizard`)

### 10.3 Feedback Visual

- Toast notifications para acciones exitosas/fallidas (esquina superior derecha)
- Indicadores de carga en operaciones simuladas
- Colores de estado: verde (completado), ámbar (pendiente), rojo (observado/anulado), azul (en proceso)
- Trend indicators en TC: verde ▲ (sube), rojo ▼ (baja), gris – (estable)

### 10.4 Tablas y Bandejas

- Tablas con scroll horizontal
- Filtros por estado, fecha, cliente, trader
- Columnas configurables según el contexto
- Paginación donde aplica

---

## 11. Estándar de Formateo Numérico

### 11.1 Reglas generales

- **Montos** (PEN, USD, EUR, etc.): siempre con separador de miles y 2 decimales fijos.
  - Ejemplo: `500,000.00`, `1,234.56`, `99.00`
  - Locale: `es-PE` → miles con `,`, decimal con `.`
- **Tipos de cambio (TC)**: 4 decimales fijos, sin separador de miles.
  - Ejemplo: `3.5220`, `3.7400`
- **Spreads**: 4 decimales, sin separador de miles.
  - Ejemplo: `0.0020`

### 11.2 Utilidades centralizadas (`src/utils/format.js`)

| Función | Uso |
|---------|-----|
| `fmtMoney(n)` | Formatea un número como monto: `500000` → `"500,000.00"` |
| `parseMoney(s)` | Parsea un string de monto (con o sin comas): `"500,000.00"` → `500000` |

**Regla:** Todos los `parseFloat` sobre campos de monto deben usar `parseMoney()`. Los `parseFloat` sobre TC son directos (no tienen separador de miles).

### 11.3 Comportamiento de inputs de monto

Los inputs de monto usan `type="text"` con `inputMode="numeric"`:
- **onChange**: acepta solo caracteres numéricos, `.` y `,`
- **onBlur**: formatea con `fmtMoney` (agrega separador de miles)
- **onFocus**: quita el formateo (elimina comas) para permitir edición limpia

Los inputs de TC usan `type="text"` con `inputMode="decimal"`:
- **onChange**: reemplaza `,` → `.` para aceptar coma como separador decimal (estándar peruano)

### 11.4 Archivos actualizados con el estándar

| Archivo | Cambio |
|---------|--------|
| `src/utils/format.js` | Nuevo — definición centralizada |
| `src/pages/operaciones/CotizacionWizard.jsx` | Usa `fmtMoney`/`parseMoney`; monto inputs con format-on-blur |
| `src/pages/operaciones/ConfirmarAbonoWizard.jsx` | Ídem; TC input acepta coma |

---

*Fin del documento definicion.md*
