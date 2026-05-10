# Usuarios del Sistema — QAPAQ FX

> 14 perfiles registrados para el prototipo.
> Contraseña común para no-admin: `qapaq2026`

---

## Admin — Administrador

| Campo | Valor |
|---|---|
| Email | `admin@qapaq.com.pe` |
| Contraseña | `admin2026` |
| Nombre | Admin QAPAQ |
| Descripción | Acceso total — configuración del sistema |

**Sidebar:** Panel Admin, Usuarios y Roles, Clientes, Mercado TC, Operaciones, Posición FX, Reportes, Catálogos, Parámetros, Auditoría

**Permisos:** Todos los módulos y permisos. No editables desde la matriz de roles.

**Páginas accesibles:**
| Módulo | Sub-tabs |
|---|---|
| Panel Admin | Resumen, Actividad reciente, Estado del sistema |
| Usuarios y Roles | Usuarios registrados, Roles y permisos |
| Clientes | Cartera, Cuentas bancarias, Convenios, Árbol de Traders |
| Cliente detalle | Datos, Documentación, PLAFT, Cuentas, Convenios, Asignación, Excepciones |
| Catálogos | Mesas, Monedas, Bancos, Tipos de Op., Causas de Anulación, Plazos, Contrapartes |
| Mercado TC | Gestión de Pizarra, Historial de Cambios |
| Operaciones | Bandeja General, Pendientes de Abono, Revisión BO, Observadas, Liquidadas |
| Posición FX | Posición FX, Saldos Bancarios, TC SBS, Cierre Diario, Conciliación |
| Reportes | Operativos e Internos, Anexo 5 SBS, BCRP Adelantado, BCRP Definitivo, RO SBS |
| Parámetros | — |
| Auditoría | Log de Auditoría |

---

## Trader — Trader

| Campo | Valor |
|---|---|
| Email | `trader@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Carlos Medina |
| Descripción | Front Office · Cotización y registro FX |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| M1 · Front Office | `visible`, `crear`, `editar` |
| Anulación de operaciones FX | `visible`, `crear` (solo solicitar) |
| M3 · Posición y Tesorería | `visible` |
| M6 · Rep. Operativos | `visible`, `descargar` |

**Páginas accesibles:** Dashboard role-variant (Trader), Cartera de clientes (solo lectura por sidebar), Operaciones (bandeja, crear), Posición FX (solo lectura), Reportes (solo internos), Dashboards.

---

## Middle Office — Middle Office

| Campo | Valor |
|---|---|
| Email | `middle@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Marco Quispe |
| Descripción | Gestión de clientes y cartera (M0) |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| Cartera de clientes | `visible`, `crear`, `editar`, `descargar` |
| Cuentas bancarias | `visible`, `crear`, `editar`, `descargar` |
| Convenios y documentación | `visible`, `crear`, `descargar` |
| Excepciones documentarias | `visible`, `crear`, `editar` |
| Árbol de Traders | `visible`, `editar` |
| M1 · Front Office | `visible` |
| Anulación de operaciones FX | `visible`, `crear`, `ejecutar` |
| M6 · Rep. Operativos | `visible`, `descargar` |

**Páginas accesibles:** Dashboard (Middle), Clientes (gestión completa M0), Operaciones (solo lectura bandeja), Posición FX (solo lectura), Reportes (internos).

---

## Back Office — Back Office

| Campo | Valor |
|---|---|
| Email | `back@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Ana Torres |
| Descripción | Validación y liquidación de operaciones |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| Excepciones documentarias | `visible`, `ejecutar`, `editar` |
| M1 · Front Office | `visible` |
| Anulación de operaciones FX | `visible`, `ejecutar` (solo aprobar/rechazar) |
| M2 · Back Office | `visible`, `editar`, `descargar` |
| M6 · Rep. Operativos | `visible`, `descargar` |

**Páginas accesibles:** Dashboard (Back Office), Clientes (solo excepciones), Operaciones (revisión BO, liquidación), Posición FX (solo lectura), Reportes (Control BO, Conciliación, Errores).

---

## Head de Mesa — Head de Mesa

| Campo | Valor |
|---|---|
| Email | `head@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Diego Marín |
| Descripción | Supervisión Mesa · M0 excepciones, M1, M3 |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| Cartera de clientes | `visible` |
| Cuentas bancarias | `visible` |
| Convenios y documentación | `visible`, `ejecutar` |
| Excepciones documentarias | `visible`, `ejecutar` |
| Árbol de Traders | `visible`, `editar` |
| M1 · Front Office | `visible`, `crear`, `editar` |
| Anulación de operaciones FX | `visible`, `crear`, `ejecutar` |
| M3 · Posición y Tesorería | `visible`, `editar` |
| M5 · Rep. Regulatorios | `visible` |
| M6 · Rep. Operativos | `visible`, `descargar` |

**Páginas accesibles:** Dashboard (Head), Clientes (supervisión M0), Operaciones (bandeja + anulaciones), Posición FX (edición), Reportes (Diario FX, Flujo Saldos, por Trader).

---

## Jefe de Op. Centrales — Jefe de Op. Centrales

| Campo | Valor |
|---|---|
| Email | `jefeop@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Lucía Fernández |
| Descripción | M2, M3, M4 · Cierre diario |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| M2 · Back Office | `visible`, `editar`, `descargar` |
| M3 · Posición y Tesorería | `visible` |
| M4 · Cierre Diario | `visible`, `editar`, `ejecutar`, `descargar` |
| M6 · Rep. Operativos | `visible`, `crear`, `descargar` |

**Páginas accesibles:** Dashboard (Head/Jefe), Operaciones (revisión), Posición FX (lectura), Cierre Diario (ejecutar cierre), Reportes (Operativos).

---

## Tesorería y Posición — Tesorería y Posición

| Campo | Valor |
|---|---|
| Email | `tesoreria@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Alfonso Reyes |
| Descripción | Posición FX · Cierre y reportes |

**Sidebar:** Dashboard, Mercado TC, Operaciones, Reportes

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| M3 · Posición y Tesorería | `visible`, `editar` |
| M4 · Cierre Diario | `visible`, `editar`, `ejecutar`, `descargar` |
| M5 · Rep. Regulatorios | `visible` |
| M6 · Rep. Operativos | `visible`, `descargar` |

**Páginas accesibles:** Dashboard (Tesorería), Mercado TC (Pizarra, Historial), Operaciones (bandeja), Posición FX (vía M3 — editar saldos, TC SBS, ajustes), Cierre Diario (ejecutar), Reportes (Diario FX, por Moneda, Posición Diaria, Flujo Saldos, Trama Contable).

---

## Contabilidad — Contabilidad

| Campo | Valor |
|---|---|
| Email | `contab@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Rosa Martínez |
| Descripción | Posición FX · Trama contable |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| M3 · Posición y Tesorería | `visible`, `editar` |
| M4 · Cierre Diario | `visible` |
| M6 · Rep. Operativos | `visible`, `descargar` |

**Páginas accesibles:** Dashboard (Contabilidad placeholder), Posición FX (vista/edición), Reportes (por Moneda, Posición Diaria, Trama Contable).

---

## Jefe de Tesorería — Jefe de Tesorería

| Campo | Valor |
|---|---|
| Email | `headtes@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Fernando Luna |
| Descripción | Acceso amplio M0–M6 |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| Cartera de clientes | `visible`, `crear`, `editar` |
| Cuentas bancarias | `visible`, `crear`, `editar` |
| Convenios y documentación | `visible`, `crear` |
| M1 · Front Office | `visible`, `editar` |
| M2 · Back Office | `visible`, `editar` |
| M3 · Posición y Tesorería | `visible`, `editar` |
| M4 · Cierre Diario | `visible`, `editar`, `ejecutar`, `descargar` |
| M5 · Rep. Regulatorios | `visible`, `crear`, `descargar` |
| M6 · Rep. Operativos | `visible`, `crear`, `descargar` |

**Páginas accesibles:** Dashboard, Clientes (gestión M0), Operaciones (bandeja + revisión), Posición FX (edición), Cierre Diario (ejecutar), Reportes (todos).

---

## Gerente de Finanzas — Gerente de Finanzas

| Campo | Valor |
|---|---|
| Email | `gerente@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Elena Vargas |
| Descripción | Dashboards gerenciales y reportes (R) |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| Excepciones documentarias | `visible`, `ejecutar` |
| M3 · Posición y Tesorería | `visible` |
| M5 · Rep. Regulatorios | `visible` |
| M6 · Rep. Operativos | `visible`, `descargar` |

**Páginas accesibles:** Dashboard (Gerencial), Posición FX (solo lectura), Reportes (Utilidad, Regulatorios).

---

## Riesgos — Riesgos

| Campo | Valor |
|---|---|
| Email | `riesgos@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Pedro Castillo |
| Descripción | M3 y reportes regulatorios |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| M3 · Posición y Tesorería | `visible` |
| M5 · Rep. Regulatorios | `visible`, `crear`, `descargar` |
| M6 · Rep. Operativos | `visible` |

**Páginas accesibles:** Dashboard, Posición FX (solo lectura), Reportes (Regulatorios).

---

## Oficial Cumplimiento PLAFT — Oficial Cumplimiento PLAFT

| Campo | Valor |
|---|---|
| Email | `plaft@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Sofía Quispe |
| Descripción | M0 PLAFT y reportes operativos |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| Cartera de clientes | `visible`, `editar` |
| Convenios y documentación | `visible` |
| M6 · Rep. Operativos | `visible` |

**Páginas accesibles:** Dashboard, Clientes (cartera + validación PLAFT), Reportes (Excepciones).

---

## Reporte Regulatorio — Reporte Regulatorio

| Campo | Valor |
|---|---|
| Email | `reportes@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Jorge Delgado |
| Descripción | M5 y reportes operativos |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Dashboard Operativo | `visible` |
| M5 · Rep. Regulatorios | `visible`, `crear`, `descargar` |
| M6 · Rep. Operativos | `visible` |

**Páginas accesibles:** Dashboard, Reportes (Anexo 5, BCRP Adelantado, BCRP Definitivo, RO SBS, Operativos).

---

## Seguridad de la Información — Seguridad de la Información

| Campo | Valor |
|---|---|
| Email | `seguridad@qapaq.com.pe` |
| Contraseña | `qapaq2026` |
| Nombre | Martín Paredes |
| Descripción | Solo lectura · Logs y auditoría |

**Sidebar:** Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría

**Permisos:**
| Módulo | Permisos |
|---|---|
| Auditoría | `visible`, `descargar` |

**Páginas accesibles:** Auditoría (Log de Auditoría — solo lectura). Sin acceso a módulos operativos.

---

## Resumen de Sidebar por Rol

| Rol | Nav Config | Ítems visibles |
|---|---|---|
| admin | `navByRole.admin` | Panel Admin, Usuarios, Clientes, Mercado TC, Operaciones, Posición FX, Reportes, Catálogos, Parámetros, Auditoría |
| tesoreria | `navByRole.tesoreria` | Dashboard, Mercado TC, Operaciones, Reportes |
| trader, middle, back, head, jefe_op, contab, head_tes, gerente, riesgos, plaft, reportes, seguridad | `navByRole.default` | Dashboard, Clientes, Operaciones, Posición FX, Reportes, Dashboards, Auditoría |
