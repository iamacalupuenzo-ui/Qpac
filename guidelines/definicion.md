# Definición de Producto — QAPAQ FX

> Decisiones de UX, roles, flujos de negocio y reglas de producto para la plataforma de Mesa de Dinero FX
> Actualizado: 2026-05-10

---

## 1. Propósito del Producto

Plataforma operativa para la **gestión de operaciones de cambio de divisas (FX)** de Financiera QAPAQ. Cubre el ciclo de vida completo: captura de cotizaciones (Front Office), verificación y liquidación (Back Office), gestión de posiciones y cierre diario (Tesorería), reportes regulatorios (BCRP/SBS), onboarding de clientes, y administración del sistema.

### Objetivos de producto
1. Centralizar la operativa FX en una sola plataforma web
2. Automatizar cálculos de spread, contravalor y posición
3. Reducir errores operativos con validaciones en tiempo real
4. Generar reportes regulatorios (BCRP Adelantado/Definitivo, RO SBS) desde los datos operativos
5. Proveer visibilidad de posiciones en tiempo real por mesa de dinero

---

## 2. Perfiles de Usuario (Roles)

Ver `usuarios.md` para detalle completo de permisos por módulo y páginas accesibles.

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

### Estado actual
- Autenticación mock por email/contraseña (14 usuarios de prueba)
- Roles fijos al hacer login — no hay cambio de rol en sesión
- Sin backend real — todos los datos son mock

### Credenciales de prueba
| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | `admin@qapaq.com.pe` | `admin2026` |
| Trader | `trader@qapaq.com.pe` | `qapaq2026` |
| Middle Office | `middle@qapaq.com.pe` | `qapaq2026` |
| Back Office | `back@qapaq.com.pe` | `qapaq2026` |
| Head de Mesa | `head@qapaq.com.pe` | `qapaq2026` |
| Jefe de Op. Centrales | `jefeop@qapaq.com.pe` | `qapaq2026` |
| Tesorería y Posición | `tesoreria@qapaq.com.pe` | `qapaq2026` |
| Contabilidad | `contab@qapaq.com.pe` | `qapaq2026` |
| Jefe de Tesorería | `headtes@qapaq.com.pe` | `qapaq2026` |
| Gerente de Finanzas | `gerente@qapaq.com.pe` | `qapaq2026` |
| Riesgos | `riesgos@qapaq.com.pe` | `qapaq2026` |
| Oficial Cumplimiento PLAFT | `plaft@qapaq.com.pe` | `qapaq2026` |
| Reporte Regulatorio | `reportes@qapaq.com.pe` | `qapaq2026` |
| Seguridad de la Información | `seguridad@qapaq.com.pe` | `qapaq2026` |

---

## 3. Módulos y Flujos

### 3.1 Login
- Pantalla split: panel izquierdo branding (azul) + panel derecho formulario
- Validación contra `TEST_USERS` (mock)
- Loading simulado de 900ms
- Hint de credenciales visibles para prototipo

### 3.2 Dashboard
Dashboards con KPIs adaptados al rol:

| Rol | KPIs principales |
|-----|-----------------|
| Trader | Mis operaciones hoy, volumen USD, TC pizarra compra/venta |
| Head de Mesa | Ops activas, volumen total, traders operando, TC SBS referencial |
| Middle Office | En revisión, observadas, liquidadas, SLA promedio |
| Back Office | Para verificar, observadas activas, liquidadas hoy, SLA BO |
| Tesorería | Posición neta USD, saldo total bancos, TC SBS, estado del cierre |
| Gerente | Volumen operado, utilidad estimada, ops completadas, spread promedio |

### 3.3 Módulo de Operaciones — Ciclo de Vida

**Estados de una operación:**
```
Reservada → Pendiente Abono → En Revisión BO → Liquidada
                ↘  Observada → Subsanada → En Revisión BO → Liquidada
Reservada → Anulada (en cualquier momento)
Liquidada → Pend. Reapertura (solo tesorería)
```

| Estado | Descripción | Acciones disponibles |
|--------|-------------|---------------------|
| `reservada` | Cotización creada por trader | Editar, Anular, Enviar a abono |
| `pendiente_abono` | Esperando confirmación de pago | Confirmar abono, Anular |
| `en_revision` | Enviada a Back Office | Revisar (aprobar/observar) |
| `observada` | Devuelta por BO con observaciones | Subsanar (corregir y re-enviar) |
| `subsanada` | Corregida por trader, re-enviada | Revisar (Back Office) |
| `liquidada` | Operación completada | Ver detalle, Reabrir (tesorería) |
| `anulada` | Operación cancelada | Ver detalle |
| `pendiente_reapertura` | Solicitud de reapertura | Aprobar/Rechazar |

**Wizard de Cotización (4 pasos):**
1. **Cliente**: Buscador + datos del cliente (debe estar activo)
2. **Operación**: Tipo (Compra/Venta/Cruzada), Monto, TC Punta, TC Pactado, Fuente TC (Datatec/Manual), auto-cálculo de contravalor y spread, detección de duplicados
3. **Cuentas**: Cuenta(s) destino del cliente (multi-fila), cuentas QAPAQ de ingreso/egreso (multi-fila)
4. **Confirmación**: Resumen completo + confirmar

**Cálculos por tipo de operación:**

| Tipo | Contravalor | Spread |
|------|-------------|--------|
| **Compra** (cliente entrega USD) | PEN = USD × TC Pactado | TC Punta − TC Pactado |
| **Venta** (cliente entrega PEN) | USD = PEN / TC Pactado | TC Pactado − TC Punta |
| **Cruzada** (misma moneda) | Monto × min(TC) / max(TC) | \|TC Pactado − TC Punta\| |

**Wizard de Confirmación de Abono (3 pasos):**
1. **Verificación**: Montos editables (Monto USD, TC Pactado), contravalor auto-calculado
2. **Documentación**: Cuentas destino pre-cargadas (preset) o editables, comprobantes (hasta 10 archivos), previsualización
3. **Confirmación**: Resumen con contravalor y desglose de abonos

**Wizard de Revisión Back Office (4 pasos):**
1. **Revisión**: Vista completa de la operación + documentos adjuntos
2. **Decisión**: Aprobar ("Procesar en plataforma bancaria") u Observar ("Se detectó un problema")
3. **Confirmación**: Resumen de decisión + desglose de pagos multi-cuenta + monto a transferir al cliente
4. **Liquidación**: Registro de referencia de transferencia (opcional)

**Wizard de Subsanación (3 pasos):**
1. **Ver observación**: Muestra observación del BO + documentos originales
2. **Corrección**: Edición de monto y TC pactado, re-carga de documentos, eliminación de comprobantes originales
3. **Re-enviar**: Confirmación → operación vuelve a `subsanada`

### 3.4 Módulo de Clientes

**Tipos de cliente:**
| Tipo | ID | Descripción |
|------|----|-------------|
| Persona Natural | `PN` | Persona individual |
| Persona con Negocio | `P10` | PN con negocio propio |
| Persona Jurídica | `PJ` | Empresa |
| Entidad Financiera | `EF` | Banco o financiera |

**Estados de cliente:**
| Estado | Descripción |
|--------|-------------|
| `activo` | Cliente habilitado para operar |
| `activo_proceso` | Documentación pendiente de regularizar |
| `pendiente_legal` | Pendiente de revisión legal (deprecado — ver CAMBIO 10) |
| `no_habilitado` | Cliente deshabilitado |

**Wizard de Onboarding (5 pasos):**
1. **Tipo de Cliente**: Selección PN/P10/PJ/EF
2. **Datos Básicos**: PN/P10 → nombres + DNI; PJ/EF → RUC (con búsqueda SUNAT simulada) + Razón Social
3. **Documentación**: Requisitos automáticos según tipo, gestión PEP, carga de documentos
4. **Validación PLAFT**: Búsqueda mock en listas, resultados con badge de color (verde/ámbar/rojo)
5. **Confirmación**: Resumen + código de cliente generado

**Detalle de Cliente (7 tabs):** Datos generales, Documentación, PLAFT, Cuentas bancarias, Convenios, Asignación (árbol trader), Excepciones

### 3.5 Módulo de Tesorería

**Mercado TC / Pizarra:**
- Feed Datatec simulado (actualización cada 3s con variación aleatoria ±0.002)
- Corte automático a la 1:33 PM → modo manual
- Indicadores de tendencia: ▲ verde (sube), ▼ rojo (baja), – gris (estable)
- Historial de ediciones con atribución

**Posición FX:**
- Fórmula: `Posición neta = Compras USD − Ventas USD`
- Vista por mesa de dinero (Alpha, Beta, Gamma)
- Vista global
- Stop Loss configurable (default 500,000 USD) con alertas visuales
- Auto-refresh cada 30s

**Saldos Bancarios:**
- Cuentas operativas y transitorias
- Filtros por banco, mesa, estado (semáforo)
- Semáforo: verde (<80%), ámbar (80-100%), rojo (>100%)

**TC SBS (Regulatorio):**
- Registro único diario — no se permiten modificaciones
- Detección de cotización atípica (fuera de rango 3.600 - 3.900)
- Histórico de TC registrados

**Cierre Diario:**
- Prerrequisitos: TC SBS registrado, sin operaciones pendientes
- Bloquea cierre si hay operaciones pendientes
- Soporta reversión con motivo obligatorio (mín. 30 caracteres)
- Notificación al día siguiente hábil

### 3.6 Módulo de Administración

**Dashboard Admin (3 tabs):** Resumen (KPIs), Actividad (timeline), Sistema (conexiones)

**Usuarios:** CRUD completo con generación automática de contraseñas, búsqueda y filtros

**Roles y Permisos:** Matriz de 6 permisos (ver, crear, editar, anular, aprobar, exportar) × 25+ módulos

**Mesas de Dinero:** Gestión de mesas con jefe y traders asignados

**Catálogos (7 tipos):** Monedas, Bancos, Tipos de Operación, Causas de Anulación, Plazos, Contrapartes

**Parámetros:** Límites operacionales (incluyendo Stop Loss), seguridad, configuración regional

### 3.7 Reportes

**Operativos (12 tipos):** Operaciones del día, por cliente, por trader, por mesa, spreads, posición FX, TC histórico, clientes nuevos, clientes por estado, PLAFT, auditoría, anuladas

**Regulatorios (3 tipos):**
- **BCRP Adelantado**: Corte dinámico antes de 5:00 PM, incluye todos los estados excepto anuladas
- **BCRP Definitivo**: Corte al cierre (D+1), solo liquidadas/cerradas
- **RO SBS**: Reporte mensual

---

## 4. Reglas de Negocio

### 4.1 Operaciones
- No se puede cotizar a cliente en estado `no_habilitado` o `pendiente_legal`
- Detección de duplicados: mismo cliente, misma fecha, monto y TC similar
- Spread negativo muestra alerta roja
- TC Punta bloqueado cuando fuente = Datatec
- Referencia de transferencia es opcional en liquidación

### 4.2 Clientes
- RUC debe tener 11 dígitos (PJ/EF)
- DNI debe tener 8 dígitos (PN/P10)
- PEP requiere DJ Origen de Fondos PEP (reemplaza al DJ PN estándar)
- Ficha PEP no bloquea el alta (queda pendiente de regularizar)
- Asignación de traders: solo dentro de la misma mesa

### 4.3 Cierre Diario
- No cerrar sin TC SBS registrado
- No cerrar con operaciones pendientes
- Reversión requiere motivo de mínimo 30 caracteres

---

## 5. Decisiones de UX

### 5.1 Layout General
- Sidebar izquierdo angosto (56px) con íconos + tooltips
- Header superior con market data strip siempre visible
- Diseño desktop exclusivo (sin responsive)
- Layout flex con sidebar fija + contenido scrollable

### 5.2 Navegación
- Sin librería de routing — navegación por estado (`useState`)
- Roles administrador vs operativo determinan el menú
- Tabs de sub-navegación en el header
- Protección contra cierre accidental durante wizards (modal de confirmación)

### 5.3 Wizards
- Pasos numerados con navegación Anterior/Siguiente
- Resumen final antes de ejecutar
- Footer fijo en todos los wizards

### 5.4 Feedback Visual
- Toast notificaciones (esquina superior derecha, auto-cierre)
- Colores semánticos: verde (éxito/completado), ámbar (alerta/pendiente), rojo (error/anulado), azul (en proceso)
- Badges de estado con dot de color
- Trend indicators en TC: ▲ verde (sube), ▼ rojo (baja), – gris (estable)
- Semáforo en saldos bancarios y stop loss

### 5.5 Tablas
- Scroll horizontal, filtros por columna, paginación
- Columna Back Office visible solo para admin y back office
- Filtro multi-estado con checkboxes

---

## 6. Estándar de Formateo Numérico

### 6.1 Reglas generales
- **Montos**: separador de miles, 2 decimales fijos. Locale `es-PE`. Ej: `500,000.00`
- **TC**: 4 decimales fijos, sin separador. Ej: `3.7400`
- **Spreads**: 4 decimales, sin separador. Ej: `0.0020`

### 6.2 Utilidades (`src/utils/format.js`)
- `fmtMoney(n)`: formatea número a monto con separador de miles
- `parseMoney(s)`: parsea string con comas a número

### 6.3 Inputs
- Inputs de monto: `type="text"`, format-on-blur con `fmtMoney`, strip-on-focus
- Inputs de TC: `type="text"` con `inputMode="decimal"`, reemplazo `,` → `.`

---

## 7. Glosario

| Término | Definición |
|---------|-----------|
| **TC** | Tipo de cambio (precio de una divisa en términos de otra) |
| **TC Punta** | TC de referencia de mercado (Datatec o pizarra manual) |
| **TC Pactado** | TC acordado con el cliente |
| **Spread** | Diferencia entre TC Punta y TC Pactado |
| **Contravalor** | Monto equivalente en la moneda opuesta |
| **Cruzada** | Operación donde cliente entrega y recibe la misma moneda en distintos bancos |
| **Datatec** | Proveedor de feed de tipo de cambio |
| **Pizarra** | TC fijado manualmente por la mesa |
| **Mesa de Dinero** | Equipo de traders que operan FX |
| **PLAFT** | Prevención de Lavado de Activos y Financiamiento del Terrorismo |
| **PEP** | Persona Expuesta Políticamente |
| **BCRP** | Banco Central de Reserva del Perú |
| **SBS** | Superintendencia de Banca, Seguros y AFP |
| **RO** | Registro de Operaciones (reporte SBS) |

---

*Fin del documento definicion.md*
