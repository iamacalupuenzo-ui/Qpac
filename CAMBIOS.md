# Registro de Cambios – Qpac

Historial de modificaciones aplicadas al sistema. Cada entrada indica qué se cambió, dónde, por qué, y cómo revertirlo.

---

## [2026-05-03] Módulo Clientes – Flujo Nuevo Cliente

**Motivo:** Pedido de Gerencia General: no promocionar atención a terceros.

---

### CAMBIO 1 — Eliminar campo "¿Opera a terceros?" del perfil de PJ y EF

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Menú principal > Clientes > Botón "Nuevo cliente" > Step 2 (Datos básicos) > sección "Perfil del cliente"
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:**
Se eliminó el bloque que mostraba el radio group "¿Opera a terceros?" en el Step 2 (Datos básicos), sección "Perfil del cliente", para los tipos Persona Jurídica (PJ) y Entidad Financiera (EF).

**Código eliminado (Step 2 ~línea 393):**
```jsx
{isEntidad && (
  <Field label="¿Opera a terceros?" required hint="Determina si se requiere Convenio Marco y revisión legal" error={errors?.operaATerceros}>
    <RadioGroup value={formData.operaATerceros} onChange={v => onChange('operaATerceros', v)}
      options={[{ value: 'si', label: 'Sí, opera a terceros' }, { value: 'no', label: 'Solo cuentas propias' }]} />
    {errors?.operaATerceros && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.operaATerceros}</p>}
  </Field>
)}
```

**Efecto colateral controlado:**
- Para PJ: `operaATerceros` siempre queda en `''`, por lo que la condición `operaATerceros === 'si'` nunca se activa → PJ ya no exige Convenio Marco ni revisión legal.
- Para EF: sigue requiriendo documentos legales porque la condición es `operaATerceros === 'si' || tipoPersona === 'EF'` — EF siempre los necesita independientemente.

**Cómo revertir:**
Reinsertar el bloque eliminado en `ClienteWizard.jsx` justo antes del `<Field label="Clasificación de riesgo"...>`, dentro de la sección del perfil del cliente.

---

### CAMBIO 2 — Eliminar validación de "¿Opera a terceros?" en Step 2

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Lógica interna del wizard (no visible al usuario)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:**
Se eliminó la validación que impedía avanzar al Step 3 si `operaATerceros` estaba vacío para PJ/EF.

**Código eliminado (función `validateStep`, ~línea 765):**
```js
if (isEntidad && !formData.operaATerceros) e.operaATerceros = 'Campo requerido'
```

**Cómo revertir:**
Reinsertar esa línea dentro del bloque `if (step === 2)` de la función `validateStep`, junto a las demás validaciones del paso 2.

---

### CAMBIO 3 — Ocultar "Carta de Autorización Terceros" en Documentos Opcionales (PN)

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Menú principal > Clientes > Botón "Nuevo cliente" > Step 3 (Documentación) > sección "Documentos opcionales" (solo aplica a Persona Natural y Persona Natural con Negocio)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:**
Se cambió el `grupo` del documento `cartaTerceros` de `'Opcional'` a `'Otros'`. Como `'Otros'` no está incluido en la lista de grupos renderizados del Step 3, el documento deja de mostrarse en pantalla.

**Antes (~línea 40):**
```js
docs.push({ id: 'cartaTerceros', label: 'Carta de Autorización Terceros', req: false, grupo: 'Opcional' })
```

**Después:**
```js
docs.push({ id: 'cartaTerceros', label: 'Carta de Autorización Terceros', req: false, grupo: 'Otros' })
```

**Nota:** El documento sigue existiendo en la lógica interna. Si el cliente necesita adjuntar una carta de autorización, puede hacerlo mediante el ítem "Otros documentos" que sí permanece visible.

**Cómo revertir:**
Cambiar `grupo: 'Otros'` de vuelta a `grupo: 'Opcional'` en la función `getDocsRequeridos`.

---

## [2026-05-03] Módulo Clientes – Flujo Nuevo Cliente (continuación)

**Motivo:** Ajustes de reglas de negocio para PEP y documentación requerida.

---

### CAMBIO 4 — DJ Origen de Fondos (PN) deja de ser obligatorio cuando el cliente es PEP

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Menú principal > Clientes > Botón "Nuevo cliente" > Step 3 (Documentación) > sección "Documentos base" (aplica a PN y P10)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:**
Cuando el cliente es declarado PEP, el documento "DJ Origen de Fondos PEP" reemplaza al "DJ Origen de Fondos (PN)". Se cambió `req` del documento PN de `true` fijo a dinámico: es obligatorio solo si el cliente NO es PEP.

**Antes (~línea 35):**
```js
docs.push({ id: 'djOrigenFondos', label: 'DJ Origen de Fondos (PN)', req: true, grupo: 'Base' })
```

**Después:**
```js
docs.push({ id: 'djOrigenFondos', label: 'DJ Origen de Fondos (PN)', req: esPEP !== 'si', grupo: 'Base' })
```

**Efecto:** Cuando `esPEP === 'si'`, el DJ de PN queda como opcional (no bloquea el estado "Activo"). El DJ Origen de Fondos PEP —que sí es requerido— cubre esa exigencia.

**Cómo revertir:**
Cambiar `req: esPEP !== 'si'` de vuelta a `req: true` en la función `getDocsRequeridos`.

---

### CAMBIO 5 — Ficha PEP ya no bloquea el avance del wizard

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Menú principal > Clientes > Botón "Nuevo cliente" > Step 3 (Documentación) y Step 2 (aviso al declarar PEP)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:**
Se eliminó la validación que impedía pasar del Step 3 al Step 4 si la Ficha PEP no había sido adjuntada. Ahora el ejecutivo puede avanzar y el cliente quedará en estado "Activo en proceso" para regularizar el documento posteriormente desde el módulo de documentos.

También se actualizaron los mensajes de aviso en Step 2 y Step 3 para reflejar la nueva regla.

**Código eliminado (función `validateStep`, bloque `step === 3`):**
```js
if (formData.esPEP === 'si' && !docState.fichaPEP?.loaded) {
  e.fichaPEP = 'La Ficha PEP es obligatoria (Regla de negocio 4)'
}
```

**Mensajes actualizados:**
- Step 2 (aviso al declarar PEP): *"la Ficha PEP es obligatoria. Si no se adjunta ahora, el cliente quedará pendiente de regularizar."*
- Step 3 (aviso en documentación): *"Si no se adjunta aquí, quedará pendiente de regularizar en el módulo de documentos."*
- Descripción general Step 3: eliminada la excepción que decía que la Ficha PEP bloqueaba el alta.

**Nota:** La Ficha PEP sigue siendo `req: true` en la lista de documentos, por lo que el cliente queda en "Activo en proceso" mientras no se adjunte.

**Cómo revertir:**
Reinsertar dentro del bloque `if (step === 3)` de `validateStep`:
```js
if (formData.esPEP === 'si' && !docState.fichaPEP?.loaded) {
  e.fichaPEP = 'La Ficha PEP es obligatoria (Regla de negocio 4)'
}
```
Y restaurar los tres mensajes de texto a su versión anterior.

---

### CAMBIO 6 — Cruce PLAFT con búsqueda automática y tabla de resultados en Step 4

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Menú principal > Clientes > Botón "Nuevo cliente" > Step 4 (Validación PLAFT)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:**
Se rediseñó el Step 4 para dividirlo en dos secciones:

1. **Cruce PLAFT** (nueva sección, aparece primero):
   - Al entrar al step se pre-carga el número de documento del cliente en el buscador y ejecuta la búsqueda automáticamente.
   - El ejecutivo puede ajustar el criterio (por N° documento o por nombre) y volver a buscar.
   - Los resultados se muestran en una tabla con columnas: N° Documento, Nombre / Razón social, Estado PLAFT (badge de color), Observación.
   - Estados posibles: Sin observaciones (verde), Con observaciones (ámbar), Lista restringida (rojo).
   - Si no hay resultados, muestra mensaje "No se encontraron registros".

2. **Confirmación del ejecutivo** (sección existente, renombrada):
   - Los botones Conforme / No conforme / En proceso permanecen igual.
   - El ejecutivo confirma el resultado basándose en lo que mostró el cruce.

**Nota técnica:** La búsqueda actualmente corre contra datos mock (`PLAFT_MOCK`). Cuando la integración con el Excel/API de PLAFT esté disponible, se reemplaza únicamente la función `buscarEnPLAFT` sin cambiar la UI.

**Cómo revertir:**
Eliminar el componente `PLAFTCruce`, las constantes `PLAFT_MOCK`, `ESTADO_BADGE` y la función `buscarEnPLAFT`, y remover `<PLAFTCruce formData={formData} />` del return de `Step4`. Restaurar el título de la sección a "Validación PLAFT" y su descripción original.

---

## [2026-05-03] Módulo Clientes – Bug de numeración de código de cliente

---

### CAMBIO 7 — Corrección de código de cliente en pantalla de confirmación (Step 5)

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Menú principal > Clientes > Botón "Nuevo cliente" > Step 5 (Confirmación) > pantalla de éxito
**Archivos:** `src/pages/clientes/ClienteWizard.jsx`

**Descripción del bug:**
Al confirmar el alta del cliente, la pantalla de éxito mostraba un código con un número más (ej. `CLI-010`) que el código realmente guardado en la tabla (ej. `CLI-009`).

**Causa raíz:**
Al llamar `onSave`, App.jsx incrementaba `nextClientCode` de `CLI-009` a `CLI-010`. React re-renderizaba el wizard (que seguía montado mostrando la confirmación) con el nuevo prop `nextCode='CLI-010'`. La pantalla de Step 5 usaba directamente `newCode={nextCode}`, por lo que mostraba el código ya incrementado en vez del que se acababa de guardar.

**Solución:**
Se agregó el estado `savedCode` en el wizard. En `handleConfirmar`, se captura el valor de `nextCode` en ese instante exacto (`codeToSave`) y se guarda en `savedCode` antes de llamar `onSave`. Step 5 ahora usa `savedCode ?? nextCode`, garantizando que muestre el código con el que se registró el cliente.

**Cambios aplicados:**
```js
// Estado agregado
const [savedCode, setSavedCode] = useState(null)

// En handleConfirmar, antes de onSave:
const codeToSave = nextCode ?? 'CLI-NVO'
setSavedCode(codeToSave)
onSave({ id: codeToSave, ... })

// En Step 5:
newCode={savedCode ?? nextCode}   // antes: newCode={nextCode}
```

**Cómo revertir:**
Eliminar `savedCode` del estado, quitar `const codeToSave = ...` y `setSavedCode(codeToSave)` de `handleConfirmar`, devolver `id: nextCode ?? 'CLI-NVO'` directo al `onSave`, y cambiar `newCode={savedCode ?? nextCode}` de vuelta a `newCode={nextCode}`.

---

## [2026-05-03] Módulo Clientes – Ajustes Entidad Financiera y retiro Asesoría Legal

**Motivo:** Solicitud de Directorio y ajustes de perfil de Entidad Financiera.

---

### CAMBIO 8 — Texto descriptivo de Entidad Financiera

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Step 1 (Tipo de cliente) → tarjeta Entidad Financiera
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:** Se simplificó la glosa descriptiva de la tarjeta de Entidad Financiera.

**Antes:** `'Banco, financiera, casa de cambio u otra entidad supervisada por SBS'`
**Después:** `'Banco, Financiera.'`

**Cómo revertir:** Restaurar el texto anterior en el array `TIPOS`, entrada `id: 'EF'`.

---

### CAMBIO 9 — Convenio Marco, Vigencia de Poderes y DOI Representantes pasan a opcionales para EF

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Step 3 (Documentación) → sección Documentos opcionales (solo EF)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:** Los tres documentos que antes eran obligatorios y exclusivos de EF (grupo `'Legal'`, `req: true`) ahora son opcionales (`req: false`, grupo `'Opcional'`). La condición `operaATerceros === 'si'` fue eliminada (ese campo ya no existe); la condición quedó solo para `tipoPersona === 'EF'`.

**Antes:**
```js
if (operaATerceros === 'si' || tipoPersona === 'EF') {
  docs.push({ id: 'convenioMarco',     ..., req: true, grupo: 'Legal' })
  docs.push({ id: 'vigenciaPoderes',   ..., req: true, grupo: 'Legal' })
  docs.push({ id: 'doiRepresentantes', ..., req: true, grupo: 'Legal' })
}
```

**Después:**
```js
if (tipoPersona === 'EF') {
  docs.push({ id: 'convenioMarco',     ..., req: false, grupo: 'Opcional' })
  docs.push({ id: 'vigenciaPoderes',   ..., req: false, grupo: 'Opcional' })
  docs.push({ id: 'doiRepresentantes', ..., req: false, grupo: 'Opcional' })
}
```

**Cómo revertir:** Restaurar la condición y los valores `req: true, grupo: 'Legal'` en `getDocsRequeridos`.

---

### CAMBIO 10 — Retiro completo de Asesoría Legal del flujo de alta de cliente

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Step 4 (Validación PLAFT) y Step 5 (Confirmación)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`
**Motivo:** Decisión de Directorio.

**Qué se eliminó:**
- Sección "Revisión Asesoría Legal" completa del Step 4 (campos Conformidad + Notas + aviso de Vigencia de Poderes)
- Estado `pendiente_legal` de `determineFinalState` y su tarjeta visual en Step 5
- Constante `needsLegal` en `validateStep`, `determineFinalState` y `Step4`
- Validación `if (needsLegal && !formData.conformidadLegal)`
- Campos `conformidadLegal` y `notasLegal` de `INITIAL_FORM`
- Entrada `pendiente_legal` del mapa de estilos en Step 5

**Cómo revertir:** Requiere restaurar todos los elementos listados. Ver versión previa en git o en los bloques de código de cambios anteriores (CAMBIO 1 al 6 como referencia del estado original).

---

### CAMBIO 11 — PJ/EF: RUC primero, Razón Social después con autocompletado SUNAT simulado

**Módulo:** Clientes → Cartera de Clientes → Nuevo Cliente
**Ruta en el sistema:** Step 2 (Datos básicos) → sección "Datos de identidad" (solo PJ y EF)
**Archivo:** `src/pages/clientes/ClienteWizard.jsx`

**Qué se hizo:**
Para PJ y EF se reordenaron los campos de identidad: el RUC ahora aparece primero (permite verificar si el cliente ya existe antes de ingresar nombre), y la Razón Social aparece después con posibilidad de autocompletarse.

Al digitar los 11 dígitos del RUC se dispara una consulta simulada a SUNAT (`SUNAT_MOCK`) que autocompleta:
- Razón Social
- Dirección SUNAT
- CIIU

Durante la consulta se muestra un spinner "Consultando SUNAT…". Según el resultado:
- **Encontrado** → banner verde "Datos obtenidos de SUNAT — puedes editarlos si es necesario."
- **No encontrado** → banner ámbar "RUC no encontrado en SUNAT. Ingresa los datos manualmente."

Los campos de PN/P10 no cambiaron (apellidos + nombres primero, documento después).

**Nota técnica:** La consulta usa `SUNAT_MOCK` (diccionario hardcoded). Cuando la API de SUNAT esté disponible, se reemplaza únicamente la función `handleRucChange` → bloque `setTimeout` por la llamada real.

**Cómo revertir:** Eliminar `SUNAT_MOCK`, `sunatStatus` state y `handleRucChange`. Restaurar el bloque `{isEntidad && <Field label="Razón Social"...>}` antes del grid de documentos compartido, y unificar nuevamente el grid de documentos para isPersona e isEntidad.

---

## [2026-05-03] Módulo Clientes – Bug: no se podía re-habilitar cliente inhabilitado

---

### CAMBIO 12 — Habilitar cliente inhabilitado desde la tabla de Cartera de Clientes

**Módulo:** Clientes → Cartera de Clientes
**Ruta en el sistema:** Menú principal > Clientes > tabla de clientes > columna de acciones (ícono verde cuando cliente está No habilitado)
**Archivo:** `src/pages/clientes/ClientesPage.jsx`

**Descripción del bug:**
Los clientes en estado `no_habilitado` mostraban el ícono de Ban deshabilitado (`cursor-not-allowed`), sin ninguna opción para revertir el estado. No existía flujo de re-habilitación.

**Qué se hizo:**
- Se agregó estado `confirmHabilitar` y función `handleConfirmarHabilitar` que cambia el estado del cliente a `activo`.
- Se agrega prop `onHabilitar` a `ClienteRow`: se activa cuando `estado === 'no_habilitado'` y muestra el ícono `UserCheck` (verde).
- Cuando el cliente NO está inhabilitado, se sigue mostrando el ícono `Ban` (rojo) para inhabilitar.
- Se agregó modal de confirmación de habilitación (espejo del modal de inhabilitación) con ícono verde y mensaje apropiado.
- Se añadió `UserCheck` al import de lucide-react.

**Lógica del botón en la fila:**
- `estado === 'no_habilitado'` → botón `UserCheck` verde → abre modal de confirmación → estado pasa a `activo`
- Cualquier otro estado → botón `Ban` rojo → abre modal de inhabilitación → estado pasa a `no_habilitado`

**Cómo revertir:**
Eliminar `confirmHabilitar`, `handleConfirmarHabilitar`, el modal de habilitación y el prop `onHabilitar` en `ClienteRow`. Restaurar la lógica original del botón (Ban deshabilitado cuando `no_habilitado`). Quitar `UserCheck` del import.

---

## [2026-05-03] Múltiples módulos – Cuentas bancarias, Convenios y Árbol de Traders

---

### CAMBIO 13 — Cuentas bancarias: búsqueda por DNI, CE, RUC o Nombre

**Módulo:** Clientes → Cuentas Bancarias
**Ruta en el sistema:** Menú principal > Clientes > pestaña "Cuentas bancarias" > buscador
**Archivo:** `src/pages/clientes/CuentasBancariasTab.jsx`

**Qué se hizo:**
- Se añadió el campo `doi` a cada cliente en `CLIENTES_ACTIVOS` (DNI o RUC según tipo).
- En el filtro de búsqueda, se agrega la comparación del término contra el DOI del cliente de la cuenta. La búsqueda ahora cubre: nombre, N° cuenta, ID de cuenta, banco y **DNI / CE / RUC del cliente**.

**Cómo revertir:** Quitar `doi` de `CLIENTES_ACTIVOS` y eliminar el lookup de `doi` dentro del `filtered` en `CuentasBancariasTab`.

---

### CAMBIO 14 — Cuentas bancarias: cuenta verificada revierte a "Pendiente" al editar

**Módulo:** Clientes → Cuentas Bancarias
**Ruta en el sistema:** Menú principal > Clientes > pestaña "Cuentas bancarias" > ícono ojo (editar) sobre cuenta verificada
**Archivo:** `src/pages/clientes/CuentasBancariasTab.jsx`

**Qué se hizo:**
En `handleSave`, cuando se guarda la edición de una cuenta que tenía `verificacion: 'verificada'`, se resetean automáticamente los campos de verificación:
- `verificacion` → `'pendiente'`
- `verificadoPor` → `null`
- `fechaVerificacion` → `null`

Esto fuerza a que Back Office vuelva a verificar la cuenta tras cualquier modificación, evitando que se adulteren datos ya aprobados.

**Cómo revertir:** Eliminar el spread `...(eraVerificada && {...})` de `handleSave`.

---

### CAMBIO 15 — Convenios y documentación: retirar columnas Vencimiento, Representante y Revisión Legal

**Módulo:** Clientes → Convenios y Documentación
**Ruta en el sistema:** Menú principal > Clientes > pestaña "Convenios y documentación" > tabla principal
**Archivo:** `src/pages/clientes/ConveniosTab.jsx`

**Qué se hizo:**
- Se eliminaron las columnas `Vencimiento`, `Repres.` y `Rev. Legal` de los encabezados de la tabla (tanto en vista con clienteId como sin él).
- Se eliminaron las tres `<td>` correspondientes del componente `DocRow`.
- Se eliminaron las variables locales de `DocRow` que solo servían a esas columnas: `rl`, `RevIcon`, `days`, `showAlert`.

**Cómo revertir:** Restaurar los encabezados con las tres columnas eliminadas, reinsertar los tres bloques `<td>` en `DocRow` y restaurar las variables locales.

---

### CAMBIO 16 — Árbol de Traders: restricción de reasignación a la misma mesa (ambos módulos)

**Módulo:** Clientes → Árbol de Traders (detalle de cliente) y Clientes → Gestión de traders (módulo global)
**Ruta en el sistema:**
- Menú principal > Clientes > ficha de cliente > pestaña "Árbol de traders" > botón "Reasignar"
- Menú principal > Clientes > pestaña "Árbol de traders" global > botón "Reasignar"
**Archivos:** `src/pages/clientes/ArbolTraderTab.jsx` y `src/pages/clientes/ArbolTraderGlobalTab.jsx`

**Qué se hizo (en ambos archivos):**
- `traderPrincipalOpts`: cuando es reasignación (`esReasignacion=true`) y existe mesa actual, se filtran solo los traders que pertenecen a esa misma mesa. En primera asignación se muestran todos.
- `backupAddOpts`: siempre se filtran para mostrar solo traders de la misma mesa que el trader principal seleccionado.
- Se agrega un aviso ámbar en el drawer: *"Solo se muestran traders de [Mesa X]. No se puede reasignar entre mesas distintas."*

**Cómo revertir:** En ambos archivos, eliminar el filtro `!esReasignacion || !mesaActual || ...` en `traderPrincipalOpts`, el filtro `!mesaPrincipal || ...` en `backupAddOpts`, y el bloque del aviso ámbar.

---

### CAMBIO 17 — Mercado y TC: indicador de tendencia en Evolución Datatec Live

**Módulo:** Mercado y TC → Gestión de Pizarra
**Ruta en el sistema:** Menú principal > Mercado y TC > pestaña "Gestión de pizarra" > sección "Evolución Datatec (Live)"
**Archivo:** `src/pages/tesoreria/MercadoTCPage.jsx`

**Qué se hizo:**
- Se creó el componente `TrendBadge({ current, previous })` que compara el valor actual con el anterior y muestra:
  - `TrendingUp` verde + delta positivo (ej. `+0.0012`) si subió
  - `TrendingDown` rojo + delta negativo (ej. `-0.0008`) si bajó
  - `Minus` gris + `0.0000` si no varió
- En `PizarraTab` se calcula `prevEntry = history[0]` (el registro más reciente).
- Las tarjetas de Compra y Venta en la sección "Evolución Datatec (Live)" reemplazan los íconos estáticos (`ArrowDownLeft` / `ArrowUpRight`) por `<TrendBadge current={datatec.compra/venta} previous={prevEntry?.compra/venta} />`.
- Se añadieron `TrendingDown` y `Minus` al import de lucide-react.

**Cómo revertir:**
- Eliminar el componente `TrendBadge`.
- Volver a poner `<ArrowDownLeft size={14} className="text-emerald-500" />` en Compra y `<ArrowUpRight size={14} className="text-blue-500" />` en Venta.
- Eliminar `prevEntry` de `PizarraTab`.
- Quitar `TrendingDown` y `Minus` del import.

---

## [2026-05-03] Módulo Operaciones – Bandeja General

---

### CAMBIO 18 — Filtro multi-estado en Bandeja General

**Módulo:** Operaciones → Bandeja General
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Bandeja General" > filtro Estado
**Archivo:** `src/pages/operaciones/OperacionesPage.jsx`

**Qué se hizo:**
- Se creó el componente `MultiFilterSelect` con checkboxes dentro de un dropdown desplegable.
- Se reemplazó el estado `filtroEstado` (string único) por `filtroEstados` (array de strings).
- El filtro de Estado ahora permite seleccionar varios estados simultáneamente. Si ninguno está seleccionado muestra "Todos los estados"; si hay uno muestra su nombre; si hay más muestra "N estados".
- La lógica de filtrado en `filtered` pasó de `o.estado !== filtroEstado` a `!filtroEstados.includes(o.estado)`.
- `clearFilters` ahora resetea a `[]` en lugar de `''`.

**Cómo revertir:** Eliminar `MultiFilterSelect`. Cambiar `filtroEstados` de vuelta a `filtroEstado` (string). Restaurar `FilterSelect` en el filtro de estado y ajustar la lógica de filtrado.

---

### CAMBIO 19 — EditarDrawer: 4 campos editables, auto-cálculo, alerta duplicado y spread

**Módulo:** Operaciones → Bandeja General
**Ruta en el sistema:** Menú principal > Operaciones > Bandeja General > ícono lápiz sobre operación editable
**Archivo:** `src/pages/operaciones/OperacionesPage.jsx`

**Qué se hizo:**
- `EditarDrawer` ahora recibe `ops` como prop adicional para la detección de duplicados.
- **4 campos editables:** Monto USD, TC Pactado, Monto PEN y TC Punta (antes solo montoUSD y tc).
- **Auto-cálculo de 2 de 3:** al cambiar Monto USD o TC Pactado → recalcula Monto PEN. Al cambiar Monto PEN con Monto USD fijo → recalcula TC Pactado. Al cambiar Monto PEN con TC fijo → recalcula Monto USD.
- **Alerta de duplicado:** si hay otra operación del mismo cliente, misma fecha (hoy), mismo monto USD y mismo TC, aparece un banner ámbar con los IDs de las operaciones similares.
- **Spread calculado (solo lectura):** Compra: (TC Punta – TC Pactado) × 10,000; Venta: (TC Pactado – TC Punta) × 10,000.
- **Fuente TC** se muestra como campo de solo lectura junto al spread.
- **Formato de miles:** bajo los inputs de Monto USD y Monto PEN aparece el valor formateado con separador de miles como referencia visual.
- `handleGuardar` ahora guarda `{ montoUSD, tc, montoPEN, tcRef? }` en lugar de solo `{ montoUSD, tc, montoPEN }`.

**Cómo revertir:** Restaurar el `EditarDrawer` original (solo campos `monto` y `tc`), eliminar `ops` prop, quitar los handlers `handleMonto`/`handleMontoPen`/`handleTc`, y revertir `handleGuardar`.

---

### CAMBIO 20 — CotizacionWizard Step 2: grilla 4 campos, auto-cálculo 2 de 3, spread correcto y alerta duplicado

**Módulo:** Operaciones → Nueva Cotización (wizard)
**Ruta en el sistema:** Menú principal > Operaciones > botón "Nueva cotización" > Step 2 "Operación"
**Archivo:** `src/pages/operaciones/CotizacionWizard.jsx`

**Qué se hizo:**
- **Grilla 2×2:** El Step 2 ahora muestra 4 campos en grilla: Monto USD, TC Pactado, Monto PEN, TC Punta (referencia). Antes solo tenía Monto USD y TC Pactado con TC Punta al lado.
- **Auto-cálculo 2 de 3:** el Trader puede ingresar cualquier 2 de los 3 campos principales (Monto USD, TC Pactado, Monto PEN) y el tercero se calcula automáticamente:
  - Cambia Monto USD o TC Pactado → calcula Monto PEN
  - Cambia Monto PEN con Monto USD fijo → recalcula TC Pactado
  - Cambia Monto PEN con TC Pactado fijo → recalcula Monto USD
- **Spread corregido:** Compra = (TC Punta – TC Pactado) × 10,000; Venta = (TC Pactado – TC Punta) × 10,000 (antes comparaba contra TC SBS, ahora compara contra TC Punta).
- **Utilidad estimada** (read-only): spread/10,000 × Monto USD.
- **Spread negativo** muestra alerta roja en lugar de ámbar.
- **Alerta de duplicado:** si existe otra operación del mismo cliente, mismo día, mismo monto y TC → banner ámbar con IDs de operaciones similares.
- **Formato de miles:** hint debajo de los inputs de monto mostrando el valor formateado.
- **TC Punta bloqueado** cuando fuente = Datatec; editable cuando fuente = Manual.
- `montoPen` agregado a `INITIAL_FORM`.
- `validateStep` en step 2 ahora exige solo 2 de 3 campos; si hay menos de 2 campos válidos muestra error.
- `handleConfirmar` usa `formData.montoPen` si está disponible, sino calcula `montoUSD × tc`.
- `handleConfirmar` guarda `tcRef` y `tcFuente` en la nueva operación.
- `CotizacionWizard` recibe prop `ops` para la detección de duplicados.
- Step 4 (resumen) actualizado para mostrar Monto PEN, TC Punta y Spread ×10,000.

**Cómo revertir:** Restaurar el `Step2` original con los 2 campos (Monto + Fuente TC + TC Punta + TC Pactado), eliminar `montoPen` de `INITIAL_FORM`, restaurar `validateStep` original, revertir `handleConfirmar`, quitar prop `ops`.

---

### CAMBIO 21 — CotizacionWizard Step 3: cuenta destino múltiple con monto por cuenta

**Módulo:** Operaciones → Nueva Cotización (wizard)
**Ruta en el sistema:** Menú principal > Operaciones > botón "Nueva cotización" > Step 3 "Cuentas"
**Archivo:** `src/pages/operaciones/CotizacionWizard.jsx`

**Qué se hizo:**
La sección "Cuenta del cliente" en Step 3 pasó de un selector único (`cuentaDest`) a una lista dinámica de filas (`cuentasDest`), permitiendo distribuir el abono en varias cuentas.

- **Múltiples cuentas:** botón "+ Agregar cuenta" añade filas adicionales; cada fila tiene un selector de cuenta y un campo de monto. Las filas adicionales se pueden eliminar con el botón ✕.
- **Pre-relleno automático:** al entrar al step, si el campo monto de la primera fila está vacío se rellena automáticamente con el monto total que corresponde al cliente (PEN en compra, USD en venta).
- **Alerta por fila:** si la cuenta seleccionada es de tercero sin convenio, la tarjeta de esa fila se pinta en rojo y muestra el código AL-FO-04.
- **Alerta de diferencia:** cuando hay más de una cuenta y la suma de montos no coincide con el total de la operación, se muestra un banner ámbar con la diferencia.
- **Resumen Step 4:** se agregó una tarjeta "Cuentas destino del cliente" que lista cada cuenta con su monto.
- **INITIAL_FORM:** `cuentaDest: ''` reemplazado por `cuentasDest: [{ cuentaId: '', monto: '' }]`.
- `Plus` añadido al import de lucide-react.

**Cómo revertir:**
- En `INITIAL_FORM` cambiar `cuentasDest` de vuelta a `cuentaDest: ''`.
- Restaurar el `Step3` original (selector único con `AppSelect` + `handleCuentaDest`).
- Eliminar la tarjeta "Cuentas destino del cliente" del resumen de `Step4`.
- Quitar `Plus` del import.

---

## [2026-05-03] Módulo Operaciones – Bandeja y Wizard (continuación)

---

### CAMBIO 22 — Bandeja General: columna Back Office con visibilidad por rol

**Módulo:** Operaciones → Bandeja General
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Bandeja General" > tabla
**Archivos:** `src/pages/operaciones/OperacionesPage.jsx`, `src/pages/operaciones/CotizacionWizard.jsx`

**Qué se hizo:**
- Se añadió el campo `backOffice` (string | null) a todos los registros de `MOCK_OPS_INIT`.
- Se añadió constante `MOCK_BO_USER = 'María Torres'` (nombre mock del BO activo; reemplazar por contexto de auth real).
- Se añadió columna "Back Office" en el encabezado y celda de la tabla, **visible solo para `role === 'admin'` y `role === 'back'`** (otros roles no ven la columna).
- **Comportamiento por rol:**
  - `admin`: ve el nombre real asignado a cada operación, o "Sin asignar" en gris itálica.
  - `back`: la bandeja filtra automáticamente solo sus propias operaciones (`backOffice === MOCK_BO_USER`) más las sin asignar (`backOffice === null`). La celda siempre muestra su propio nombre.
- El filtro BO se aplica en `filtered` (useMemo) antes que los filtros de pestaña y búsqueda.
- `colSpan` del mensaje vacío es 10 para admin/back y 9 para los demás.
- `handleConfirmar` en `CotizacionWizard` inicializa `backOffice: null` en las operaciones nuevas.

**Cómo revertir:**
Quitar `MOCK_BO_USER`, quitar el filtro de role en `filtered`, quitar `backOffice` de mock data, eliminar columna + celda condicional, revertir colSpan, quitar `backOffice` de `newOp`.

---

### CAMBIO 23 — Step 3 Wizard: cuentas destino filtradas por moneda del contravalor

**Módulo:** Operaciones → Nueva Cotización (wizard)
**Ruta en el sistema:** Step 3 "Cuentas" > sección "Cuenta del cliente"
**Archivo:** `src/pages/operaciones/CotizacionWizard.jsx`

**Qué se hizo:**
En `destOpts`, las cuentas bancarias del cliente ahora se filtran por `c.moneda === monedaDest` (la moneda que recibe el cliente). Para compra, solo se muestran cuentas PEN; para venta, solo USD. La opción "Cuenta transitoria QAPAQ" se mantiene siempre visible.

**Efecto:** Evita que el trader seleccione por error una cuenta en la moneda incorrecta.

**Cómo revertir:** Eliminar el `.filter(c => !tipoOp || c.moneda === monedaDest)` en `destOpts`.

---

### CAMBIO 24 — Step 3 Wizard: cuentas QAPAQ renombradas y multi-fila

**Módulo:** Operaciones → Nueva Cotización (wizard)
**Ruta en el sistema:** Step 3 "Cuentas" > sección "Cuentas QAPAQ"
**Archivo:** `src/pages/operaciones/CotizacionWizard.jsx`

**Qué se hizo:**
- Sección renombrada: "Cuenta QAPAQ — entrega fondos" → **"Cuenta QAPAQ – Egreso"**; "Cuenta QAPAQ — recibe fondos" → **"Cuenta QAPAQ – Ingreso"**.
- `cuentaQpaqOut: ''` y `cuentaQpaqIn: ''` en `INITIAL_FORM` reemplazados por `cuentasQpaqEgreso: ['']` y `cuentasQpaqIngreso: ['']` (arrays).
- Cada sección (Egreso / Ingreso) tiene botón "+ Agregar" para añadir filas y botón ✕ en filas adicionales para eliminar, igual que cuentasDest.
- Los botones Agregar se deshabilitan si no hay tipo de operación seleccionado.

**Cómo revertir:**
- En `INITIAL_FORM` restaurar `cuentaQpaqOut: ''` y `cuentaQpaqIn: ''`.
- Restaurar la sección original de Cuentas QAPAQ con grid 2×1 y los campos `cuentaQpaqOut` / `cuentaQpaqIn`.
- Restaurar las referencias a `cuentaQpaqOut` / `cuentaQpaqIn` al inicio de `Step3`.

---

## [2026-05-03] Módulo Operaciones – Wizard Step 2 rediseño y corrección de moneda

---

### CAMBIO 25 — Step 2: nuevo layout, contravalor PEN y spread como decimal

**Módulo:** Operaciones → Nueva Cotización (wizard)
**Ruta en el sistema:** Step 2 "Operación" > sección "Monto y tipo de cambio"
**Archivo:** `src/pages/operaciones/CotizacionWizard.jsx`

**Qué se hizo:**

**Layout:** La grilla 2×2 original tenía [Monto USD, TC Pactado, Monto PEN (editable), TC Punta]. Se reestructuró a:
- Fila 1: [Monto (USD), Fuente de tipo de cambio]
- Fila 2: [TC de referencia (punta), TC pactado con el cliente]
- Fila read-only: [Spread calculado, Contravalor estimado (PEN)]

**Contravalor estimado (corrección del bug):** Antes se mostraba "Utilidad estimada" calculada como `(spread/10.000) × montoUSD`, lo que arrojaba USD en vez de PEN para operación Venta. Ahora se muestra "Contravalor estimado" = `monto × TC pactado`, siempre en PEN para ambas operaciones.

**Spread:** Se cambia de ×10.000 a raw decimal (`toFixed(4)`). La fórmula es la misma; solo cambia la escala de visualización. Etiqueta: "Spread calculado" (antes "Spread ×10,000").

**Alerta de spread:** Se cambia de rojo a ámbar. Mensaje: "El TC pactado difiere del TC de referencia en más de 0.01."

**Validación Step 2:** Se simplifica la validación: exige `monto` Y `tcPactado` (antes "2 de 3" con montoPen). Se elimina el banner de hint del auto-cálculo.

**Función `handleConfirmar`:** `montoPEN` siempre se calcula como `montoUSD × tc` (antes usaba `formData.montoPen` si disponible).

**Step 4 resumen "OPERACIÓN":** Se eliminan "Monto PEN" y "TC referencia". Ahora muestra: Tipo, Monto USD, TC pactado, Contravalor PEN, Spread. Spread muestra como decimal (`.toFixed(4)`).

**Cómo revertir:**
- Restaurar los 4 campos editables en la grilla (agregar Monto PEN editable con `handleMontoPen` y auto-cálculo).
- Mover Fuente TC fuera de la grilla (debajo).
- Restaurar "Utilidad estimada" con fórmula `(spread/10.000) × montoUSD`.
- Restaurar "Spread ×10,000" con `.toFixed(2)` y alerta roja.
- Restaurar la validación "2 de 3" en `validateStep`.
- Restaurar el banner de hint de auto-cálculo.
- Restaurar el `ResumenCard` de Step4 con Monto PEN, TC referencia y spread ×10000.

---

## [2026-05-03] Módulo Operaciones – Confirmar Abono rediseño

---

### CAMBIO 26 — ConfirmarAbonoWizard: Step 1 editable, cuentas destino multi-fila y resumen con contravalor

**Módulo:** Operaciones → Pendientes de Abono
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Pendientes de abono" > botón "Confirmar abono" sobre una operación
**Archivo:** `src/pages/operaciones/ConfirmarAbonoWizard.jsx`

**Qué se hizo:**

1. **Step 1 — Verificación pasa a ser editable:**
   - Los campos Monto USD y TC pactado son ahora inputs editables (antes eran campos de solo lectura en un `ResumenCard`).
   - Contravalor PEN se calcula en tiempo real como `Monto × TC` y se muestra read-only.
   - Los campos Identificación (ID, cliente, trader, mesa) siguen siendo de solo lectura.
   - Mensaje de alerta cambió de "NO procedas, cancela y coordina con Middle Office" a "Si el cliente solicitó un monto diferente, actualízalo aquí antes de continuar."
   - El botón Siguiente del Step 1 se habilita solo cuando `monto` y `tc` tienen valor.

2. **Step 2 — Cuentas destino del cliente (multi-fila):**
   - Se añade sección "Cuentas destino del cliente" con filas dinámicas (igual que en CotizacionWizard Step 3).
   - Cada fila tiene campo de cuenta (`cuentaId`) y monto a abonar en la moneda destino.
   - Botón "+ Agregar cuenta" añade filas; botón ✕ elimina filas adicionales.
   - Estado `cuentasDestCliente` se pre-carga desde `op.cuentasDest` si existe.
   - `MAX_FILES` se incrementó de 5 a 10.
   - Se añadió prop `onPreviewDoc` para que el botón ojo (previsualizar) en cada archivo funcione.

3. **Step 3 — Resumen con contravalor y cuentas destino:**
   - Muestra Monto USD, TC pactado y Contravalor PEN (calculado) en la tarjeta "Operación".
   - Muestra tarjeta "Cuenta abono cliente" con todas las filas de `cuentasDestCliente`.
   - Usa `CUENTAS_DISPLAY` para mostrar etiquetas legibles de los IDs de cuenta.

4. **handleConfirmarFinal:** envía `montoUSD: parseFloat(monto)` y `tc: parseFloat(tc)` (valores editados) en lugar de tomar los valores directos de `op`.

5. **Pre-carga de cuentas QAPAQ:** lee `(op?.cuentasQpaqIngreso ?? [])[0]` con fallback a `op?.cuentaQpaqIn` para ser compatible con operaciones creadas con CotizacionWizard nuevo y antiguo.

**Antes:** Step 1 solo lectura, Step 2 sin cuentas destino cliente, confirmación sin contravalor.

**Cómo revertir:**
- En `Step1`: restaurar el `ResumenCard` de "Condiciones pactadas" con `ResumenRow` read-only. Quitar `monto`, `setMonto`, `tc`, `setTc`, `errors`, `montoPEN` y el grid de inputs. Restaurar el mensaje de alerta original.
- En `Step2`: eliminar la sección "Cuentas destino del cliente" y sus funciones. Quitar props `cuentasDestCliente`, `setCuentasDestCliente`, `onPreviewDoc`. Restaurar `MAX_FILES = 5`. Quitar botón Eye y su handler.
- En el wizard principal: quitar estados `monto`, `tc`, `cuentasDestCliente`. Quitar `validateStep1`. Revertir `handleConfirmarFinal`. Revertir pre-carga de cuentas QAPAQ.
- Quitar `Plus`, `X`, `AlertCircle` del import de lucide-react.
- Quitar constante `CUENTAS_DISPLAY`.

---

## [2026-05-03] Módulo Operaciones – Confirmar Abono y Nueva Cotización (correcciones)

---

### CAMBIO 27 — ConfirmarAbonoWizard Step 2: cuentas destino con pre-carga inteligente y select de catálogo del cliente

**Módulo:** Operaciones → Pendientes de Abono
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Pendientes de abono" > Confirmar abono > Step 2 (Documentación) > sección "Cuentas destino del cliente"
**Archivo:** `src/pages/operaciones/ConfirmarAbonoWizard.jsx`

**Qué se hizo:**

- **Filas pre-cargadas (flag `_preset`):** al inicializar el wizard, si `op.cuentasDest` trae filas con `cuentaId` no vacío, cada fila se marca con `_preset: true`. Estas filas muestran la cuenta como etiqueta de solo lectura (banco · número · moneda · tipo) con el monto editable. No se puede cambiar la cuenta, solo el monto.
- **Filas nuevas (`_preset: false`):** las filas sin cuenta pre-cargada (o las añadidas con "+ Agregar cuenta") muestran un `<select>` con las cuentas del cliente filtradas por la moneda que le corresponde recibir (`monedaAbono`). Solo aparecen **cuentas del propio cliente**, sin opciones de cuentas QAPAQ.
- **Estado vacío:** si el cliente no tiene cuentas registradas en la moneda destino, se muestra un aviso ámbar "Sin cuentas registradas en [moneda] para este cliente".
- **Alerta tercero sin convenio:** igual que antes, la tarjeta se pinta en rojo y muestra AL-FO-04 tanto en filas pre-cargadas como en filas seleccionadas del dropdown.
- **Limpieza al confirmar:** `handleConfirmarFinal` hace un `map(({ _preset, ...r }) => r)` para no enviar el flag interno al callback.
- Se añadió `CUENTAS_CLIENTE` (catálogo mock) al archivo con cuentas para CLI-001 y CLI-002.
- Mock ops con `clienteId` y `cuentasDest`: `OP-2026-001` (CLI-001, con CTA-002 pre-cargada) y `OP-2026-005` (CLI-005, sin pre-carga) en `OperacionesPage`.

**Cómo revertir:**
- Quitar el flag `_preset` de la inicialización del estado.
- En la sección "Cuentas destino del cliente" de Step2, restaurar el `<input type="text">` para `cuentaId`.
- Quitar `CUENTAS_CLIENTE` del archivo y `todasCuentasCli` / `cuentasCli` de Step2.
- Quitar `clienteId` y `cuentasDest` de los mocks de OperacionesPage.

---

### CAMBIO 28 — CotizacionWizard Step 3: corrección de `montoTotal`, cuentas por cliente y alerta de diferencia en fila única

**Módulo:** Operaciones → Nueva Cotización
**Ruta en el sistema:** Menú principal > Operaciones > botón "Nueva cotización" > Step 3 "Cuentas" > sección "Cuenta del cliente"
**Archivo:** `src/pages/operaciones/CotizacionWizard.jsx`

**Qué se hizo:**

1. **Corrección de `montoTotal` (bug post CAMBIO 25):**
   El cálculo usaba `formData.montoPen`, que el CAMBIO 25 dejó de actualizar (el contravalor PEN pasó a ser visual, no persistido en el form). Ahora se calcula directamente:
   - Compra → cliente recibe PEN = `monto USD × TC pactado` (redondeado a 2 dec.)
   - Venta → cliente recibe USD = `monto USD`
   Esto restaura el auto-fill del monto en la primera fila al entrar al Step 3 y el hint "Total operación: PEN/USD X".

2. **Alerta de diferencia también con una sola fila:**
   `showDif` ya no requiere `cuentasDest.length > 1`. Si el usuario tiene una sola fila y el monto ingresado no coincide con el total de la operación (diferencia > 0.005), aparece el banner ámbar de advertencia.

3. **"Cuenta transitoria QAPAQ" eliminada del dropdown de destino del cliente:**
   `destOpts` solo incluye las cuentas propias del cliente filtradas por `monedaDest`. La transitoria pertenece a QAPAQ, no al cliente.

4. **Cuentas bancarias para todos los clientes mock:**
   `CUENTAS_CLIENTE` ahora incluye cuentas para CLI-003, CLI-004, CLI-005 y CLI-006 (antes solo CLI-001 y CLI-002 tenían cuentas y los demás clientes mostraban un dropdown vacío).

**Antes:**
- `montoTotal` para compras era `null` → no había auto-fill ni alerta de diferencia.
- El dropdown de destino mostraba "Cuenta transitoria QAPAQ" como primera opción.
- CLI-003 a CLI-006 no tenían cuentas → dropdown vacío en Step 3.
- La alerta de diferencia solo aparecía con 2 o más filas.

**Cómo revertir:**
- Restaurar `montoTotal` a `formData.montoPen` para compras.
- Restaurar `showDif` con la condición `&& cuentasDest.length > 1`.
- Agregar `{ value: 'transitoria', label: 'Cuenta transitoria QAPAQ' }` como primer elemento de `destOpts`.
- Eliminar las entradas CLI-003 a CLI-006 de `CUENTAS_CLIENTE`.

---

## [2026-05-03] Módulo Operaciones – Revisión Back Office (correcciones y mejoras)

---

### CAMBIO 29 — Datos mock completos para operaciones en revisión (OP-2026-003 y OP-2026-004)

**Módulo:** Operaciones → Revisión Back Office
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Revisión Back Office" > botón "Revisar operación"
**Archivo:** `src/pages/operaciones/OperacionesPage.jsx`

**Qué se hizo:**
Las operaciones `OP-2026-003` (`en_revision`) y `OP-2026-004` (`subsanada`) no tenían datos de cuentas QAPAQ, cuentas destino del cliente ni comprobantes adjuntos. Se agregaron:

- `OP-2026-003` (compra, CLI-003): `clienteId`, `cuentasQpaqIngreso: ['QP-PEN-1']`, `cuentasQpaqEgreso: ['QP-USD-1']`, `cuentasDest: [{ cuentaId: 'CTA-030', monto: '120000' }]`, dos comprobantes mock.
- `OP-2026-004` (venta, CLI-004): `clienteId`, `cuentasQpaqIngreso: ['QP-USD-2']`, `cuentasQpaqEgreso: ['QP-PEN-2']`, `cuentasDest: [{ cuentaId: 'CTA-040', monto: '56085' }]`, un comprobante mock, historial con una observacion y su subsanacion.

**Efecto:** El wizard de Revisión Back Office (Step 1) ahora muestra datos completos: cuentas QAPAQ, cuenta destino del cliente y comprobantes.

**Cómo revertir:** Quitar los campos agregados de OP-2026-003 y OP-2026-004 (clienteId, cuentasQpaqIngreso, cuentasQpaqEgreso, cuentasDest, comprobantes, historial).

---

### CAMBIO 30 — RevisionBackOfficeWizard: cuentas QAPAQ leen formato array (ingreso/egreso)

**Módulo:** Operaciones → Revisión Back Office
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Revisión Back Office" > Step 1 (Revisión) y Step 4 (Liquidación)
**Archivo:** `src/pages/operaciones/RevisionBackOfficeWizard.jsx`

**Problema resuelto:**
El Step 1 leía `op.cuentaQpaqIn` y `op.cuentaQpaqOut` (campos del formato antiguo, singular). Desde el CAMBIO 24, las operaciones creadas con el nuevo wizard guardan `cuentasQpaqIngreso` y `cuentasQpaqEgreso` (arrays). Si la operación usaba el nuevo formato, los campos singulares eran `undefined` y el wizard mostraba "—" (u otro texto incorrecto).

**Qué se hizo:**
- **Step 1 "Cuentas QAPAQ registradas":** Lee `cuentasQpaqIngreso`/`cuentasQpaqEgreso` (array), filtra vacíos, y hace fallback a `cuentaQpaqIn`/`cuentaQpaqOut` si el array está vacío. Renderiza cada cuenta en su propia línea usando `QAPAQ_DISPLAY`.
- **Step 4 "Datos de la liquidación":** La fila "Cuenta ingreso" y "Cuenta egreso" también resuelven el ID desde el array (primer elemento no vacío) con fallback al campo singular, y aplican `QAPAQ_DISPLAY` para mostrar banco · número en lugar del ID raw.

**Cómo revertir:**
- En Step 1: restaurar el grid 2×1 con `{QAPAQ_DISPLAY[op.cuentaQpaqIn] ?? op.cuentaQpaqIn ?? '—'}` y `{QAPAQ_DISPLAY[op.cuentaQpaqOut] ?? op.cuentaQpaqOut ?? '—'}`.
- En Step 4: restaurar `{ l: 'Cuenta ingreso', v: op.cuentaQpaqIn ?? '—' }` y `{ l: 'Cuenta egreso', v: op.cuentaQpaqOut ?? '—' }`.

---

## [2026-05-03] Módulo Operaciones – Revisión Back Office (ajustes de texto, liquidación y confirmación)

---

### CAMBIO 31 — Step 4 Liquidación: referencia de transferencia bancaria pasa a ser optativa

**Módulo:** Operaciones → Revisión Back Office
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Revisión Back Office" > Revisar operación > Step 4 (Liquidación)
**Archivo:** `src/pages/operaciones/RevisionBackOfficeWizard.jsx`

**Motivo:** La referencia bancaria no está disponible en todos los bancos en el momento del registro, por lo que bloquear el avance era un impedimento operativo.

**Qué se hizo:**
- El label del campo pasó de `Referencia de transferencia bancaria` (requerido) a `Referencia de transferencia bancaria (opcional — no siempre disponible)`.
- La función `validateStep4` ya no genera error cuando el campo está vacío (`if (false) e.ref = ''`). El campo acepta texto vacío y el botón "Confirmar liquidación" se habilita igualmente.
- El hint descriptivo del campo ya explica que el dato vincula permanentemente la referencia cuando se ingresa.

**Antes:** La referencia era requerida para poder confirmar la liquidación (la validación bloqueaba el avance).
**Después:** Campo opcional; si se ingresa queda vinculado a la operación, si no se ingresa la liquidación procede igualmente.

**Cómo revertir:**
Cambiar la condición `if (false)` en `validateStep4` por `if (!refTransferencia.trim()) e.ref = 'Ingresa la referencia de transferencia bancaria.'` y quitar el texto `(opcional — no siempre disponible)` del label.

---

### CAMBIO 32 — Step 2 Decisión: redacción de los botones y descripción introductoria

**Módulo:** Operaciones → Revisión Back Office
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Revisión Back Office" > Revisar operación > Step 2 (Decisión)
**Archivo:** `src/pages/operaciones/RevisionBackOfficeWizard.jsx`

**Qué se hizo:**
Se actualizaron los textos de presentación y de los botones de decisión para que reflejen con mayor precisión el flujo operativo:

| Elemento | Antes | Después |
|---|---|---|
| Botón "aprobar" — título | `Aprobar operación` | `Procesar operación en plataforma bancaria` |
| Botón "observar" — título | `Observar operación` | `Se detectó un problema` |
| Botón "observar" — descripción | `Devolver al trader con observación.` | `Retornar al Trader según leyenda de errores seleccionada.` |
| Texto introductorio del step | *(genérico)* | `Si procesas, Bank+ recibirá el registro y deberás ingresar la referencia de transferencia bancaria. Si observas, la operación regresa al Trader según la leyenda de errores.` |

**Cómo revertir:** Restaurar los textos anteriores en los `<span>` y `<p>` de los dos botones card y en el `<p>` introductorio del Step 2.

---

### CAMBIO 33 — Step 3 Confirmación: muestra monto a transferir al cliente y desglose de cuentas de abono

**Módulo:** Operaciones → Revisión Back Office
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Revisión Back Office" > Revisar operación > Step 3 (Confirmación)
**Archivo:** `src/pages/operaciones/RevisionBackOfficeWizard.jsx`

**Motivo:** Antes de confirmar, el analista debe poder ver exactamente cuánto se transferirá al cliente y en qué cuentas se abonará cada importe, especialmente cuando la operación tiene múltiples abonos.

**Qué se hizo:**
Se agregó una sección "Monto a transferir al cliente" en el Step 3, visible solo cuando la decisión es `aprobar` y la operación tiene al menos una entrada en `op.cuentasDest`:

- La sección lista cada fila de `cuentasDest` en un panel separado con divisor.
- Por cada fila se muestra:
  - **Etiqueta:** "Cuenta principal" (primera) o "Cuenta adicional N" (siguientes).
  - **Banco de abono:** primera parte de `CUENTAS_DISPLAY[row.cuentaId]` (antes del `·`).
  - **Cuenta de abono:** segunda parte (número de cuenta, moneda, tipo).
  - **Importe:** monto formateado con separador de miles y la moneda de destino de la operación (`PEN` para compra, `USD` para venta).
- La moneda de destino se deriva de `op.tipo`: compra → PEN, venta → USD.

**Estructura del bloque agregado (~después del resumen de 4 celdas en Step3):**
```jsx
{isAprob && (op.cuentasDest ?? []).length > 0 && (
  <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
      Monto a transferir al cliente ({monedaDestino})
    </p>
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
      {op.cuentasDest.map((row, idx) => {
        const label = CUENTAS_DISPLAY[row.cuentaId] ?? row.cuentaId ?? '—'
        const [banco, resto] = label.split(' · ')
        return (
          <div key={idx} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] text-gray-400">{idx === 0 ? 'Cuenta principal' : `Cuenta adicional ${idx}`}</p>
              <p className="text-xs font-semibold text-gray-800">{banco}</p>
              <p className="text-[11px] text-gray-500">{resto}</p>
            </div>
            <p className="text-sm font-bold text-gray-900 font-mono">
              {monedaDestino} {row.monto ? parseFloat(row.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '—'}
            </p>
          </div>
        )
      })}
    </div>
  </div>
)}
```

**Cómo revertir:** Eliminar el bloque condicional `{isAprob && (op.cuentasDest ?? []).length > 0 && (...)}` del return de `Step3`.

---

## [2026-05-03] Módulo Operaciones – Observadas (SubsanacionWizard)

---

### CAMBIO 34 — SubsanacionWizard: edición de monto y TC en Step 2

**Módulo:** Operaciones → Observadas
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Observadas" > botón "Subsanar" > Step 2 (Corrección)
**Archivos:** `src/pages/operaciones/SubsanacionWizard.jsx`, `src/pages/operaciones/OperacionesPage.jsx`

**Motivo:** Cuando la observación de Back Office indica un error en el monto o TC pactado, el Trader necesita poder corregirlos sin anular la operación y crearla de nuevo.

**Qué se hizo:**
- Se agregó una sección "Datos editables de la operación" en Step 2, **antes** de las Cuentas QAPAQ, con dos inputs editables: Monto (USD) y TC pactado.
- Los inputs se pre-cargan con los valores actuales de `op.montoUSD` y `op.tc`.
- Estados `editMonto` y `editTc` se mantienen en el wizard principal.
- `handleSubsanar` ahora incluye `montoUSD: parseFloat(editMonto)` y `tc: parseFloat(editTc)` al llamar `onSubsanar`.
- `OperacionesPage.handleSubsanar` aplica los nuevos valores y recalcula `montoPEN = montoUSD × tc`.
- Step 3 (resumen) muestra los valores editados en el `ResumenCard` de Operación.

**Cómo revertir:** Eliminar los estados `editMonto` / `editTc`, quitar la sección "Datos editables" de Step2, simplificar `handleSubsanar` a solo `{ ctaIngreso, ctaEgreso, files }`.

---

### CAMBIO 35 — SubsanacionWizard: botón "Anular operación" como ruta alternativa

**Módulo:** Operaciones → Observadas
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Observadas" > Subsanar > footer del wizard (steps 1 y 2)
**Archivos:** `src/pages/operaciones/SubsanacionWizard.jsx`, `src/pages/operaciones/OperacionesPage.jsx`

**Motivo:** Si la observación requiere cambiar el tipo de operación (compra ↔ venta), la corrección no es posible en el wizard de subsanación; debe anularse y registrarse de nuevo.

**Qué se hizo:**
- Se agregó prop `onAnular` al wizard.
- En el footer, cuando `step === 1` o `step === 2`, aparece el botón **"Anular operación"** (borde rojo, ícono `XCircle`) entre los botones de navegación.
- `OperacionesPage` implementa `handleAnularDesdeSubsanacion(id)` que pone el estado de la operación en `'anulada'`, cierra el wizard y muestra un toast.
- El aviso informativo en Step 1 se reemplazó: texto ámbar que aclara cuándo usar anulación (cambio de tipo) vs. corrección (monto/TC/cuentas).

**Cómo revertir:** Quitar prop `onAnular`, eliminar el botón del footer, eliminar `handleAnularDesdeSubsanacion` de OperacionesPage, restaurar el aviso azul original.

---

### CAMBIO 36 — SubsanacionWizard: eliminar comprobantes originales en Step 2

**Módulo:** Operaciones → Observadas
**Ruta en el sistema:** Menú principal > Operaciones > pestaña "Observadas" > Subsanar > Step 2 (Documentación)
**Archivo:** `src/pages/operaciones/SubsanacionWizard.jsx`

**Motivo:** Los comprobantes originalmente cargados podían generar confusión en Back Office si eran incorrectos. El Trader ahora puede eliminarlos antes de reenviar.

**Qué se hizo:**
- Estado `deletedOriginals: Set<number>` en el wizard principal rastrea los índices de comprobantes marcados para eliminar.
- Cada comprobante original muestra un botón `Trash2`: al pulsar, el archivo se tacha (rojo, semitransparente) y se etiqueta "Eliminado". Volver a pulsar lo restaura.
- El contador `totalArchivos` excluye los eliminados.
- `handleSubsanar` pasa `deletedOriginals: Array.from(deletedOriginals)`.
- `OperacionesPage.handleSubsanar` filtra `op.comprobantes` para excluir los índices eliminados antes de fusionarlos con los archivos nuevos.
- Step 3 muestra un aviso ámbar si hay comprobantes marcados para eliminar.

**Cómo revertir:** Eliminar el estado `deletedOriginals`, restaurar el render estático de los comprobantes originales (sin Trash2), revertir `handleSubsanar` en OperacionesPage.

---

## [2026-05-03] Posición FX – Múltiples mejoras

---

### CAMBIO 37 — PosicionFX: "Comprada" / "Vendida" en posición neta

**Módulo:** Posición FX → Posición FX
**Ruta en el sistema:** Menú principal > Posición FX > pestaña "Posición FX" > KPI "Posición neta USD"
**Archivo:** `src/pages/tesoreria/PosicionFXPage.jsx`

**Qué se hizo:** Cambiado el subtexto del KPI de posición neta:
- Antes: `'Compradora'` / `'Vendedora'`
- Después: `'Comprada'` / `'Vendida'`

**Cómo revertir:** Restaurar los textos en el prop `sub` del `KpiCard` de posición neta.

---

### CAMBIO 38 — PosicionFX: Stop Loss reemplaza "Equiv. PEN" + indicador de timer

**Módulo:** Posición FX → Posición FX
**Ruta en el sistema:** Menú principal > Posición FX > pestaña "Posición FX" > KPI grid (4to card) y tabla de mesas
**Archivo:** `src/pages/tesoreria/PosicionFXPage.jsx`

**Motivo:** El monto de exposición equivalente en PEN no era el dato más relevante. El Stop Loss es el límite de exposición máxima (comprada o vendida) y necesitaba visibilidad inmediata.

**Qué se hizo:**
- Se reemplazó el 4to KPI card ("Equiv. PEN") por un card dinámico **"Stop Loss"**.
- Estado `stopLoss` con valor por defecto `500_000` USD (sincronizable con Parámetros).
- El card muestra el límite configurado y cambia de color según el porcentaje de exposición utilizado:
  - `< 80%` → fondo blanco (normal)
  - `≥ 80%` → fondo ámbar + ícono `AlertTriangle` (alerta)
  - `≥ 100%` → fondo rojo + mensaje "EXCEDIDO" (crítico)
- Banner adicional de alerta roja en la parte superior cuando `|neta| ≥ stopLoss`.
- Subtítulo de la tabla de mesas actualizado a `(auto-refresh cada 30s)` para responder a la pregunta sobre la frecuencia de actualización.

**Cómo revertir:** Eliminar estado `stopLoss`, restaurar el 4to KPI card con "Equiv. PEN" y su cálculo `Math.abs(neta) × (actualTcSbs ?? TC_SBS_AYER)`, eliminar el banner de stop loss y la nota de auto-refresh.

---

### CAMBIO 39 — Saldos Bancarios: cuentas transitorias, filtros múltiples, ingresos sin bolsa

**Módulo:** Posición FX → Saldos Bancarios
**Ruta en el sistema:** Menú principal > Posición FX > pestaña "Saldos Bancarios"
**Archivo:** `src/pages/tesoreria/SaldosBancariosPage.jsx`

**Qué se hizo:**

1. **Cuentas transitorias:** Se agregaron campos `tipo` y `mesa` a `CUENTAS_QAPAQ_MOCK` y dos nuevas cuentas de tipo `'transitoria'` (`QP-TRANS-PEN` en BCP y `QP-TRANS-USD` en Interbank) sin límites de alerta. Badge violeta las distingue de las operativas.

2. **Filtros múltiples:** Barra de filtros con tres `<select>`:
   - **Entidad financiera** (banco): filtra por `c.banco`.
   - **Mesa**: filtra por `c.mesa` (ignorado para transitorias cuya mesa es `'—'`).
   - **Estado (semáforo)**: Verde / Alerta / Crítico / Sin límites.
   - Botón "Limpiar filtros" visible cuando algún filtro está activo.

3. **Ingresos/salidas siempre visibles:** Las celdas de Ingresos y Salidas ya no dependen de que exista una bolsa. Muestran el valor calculado (o `0.00` en gris) en todo momento.

4. **Columna "Tipo":** Nueva columna en la tabla que muestra `operativa` (gris) o `transitoria` (violeta).

5. **Auto-refresh indicado:** El subtítulo del header ahora incluye `(auto-refresh 30s)`.

**Nota sobre bug de bolsa:** El estado `bolsas` vive dentro de `SaldosBancariosPage`. Al cambiar de pestaña y regresar el componente se desmonta y el valor se pierde. La corrección definitiva requiere levantar el estado a `PosicionFXPage` o a `App.jsx`; queda pendiente.

**Cómo revertir:** Restaurar `CUENTAS_QAPAQ_MOCK` sin `tipo`/`mesa` y sin cuentas transitorias. Eliminar estados de filtro y barra de filtros. Restaurar condición `sinBolsa` en celdas de ingresos/salidas. Eliminar columna "Tipo".

---

### CAMBIO 40 — TC SBS: grabación única diaria, sin modificaciones

**Módulo:** Posición FX → TC SBS Referencial
**Ruta en el sistema:** Menú principal > Posición FX > pestaña "TC SBS Referencial"
**Archivo:** `src/pages/tesoreria/TcSbsPage.jsx`

**Motivo:** El TC SBS es un dato oficial que no debe modificarse una vez registrado en el día.

**Qué se hizo:**
- Ambos inputs (TC día T y TC día anterior T-1) ahora tienen `disabled={!canEdit || loading || isTodayReg}`. Una vez grabado el TC del día, los inputs quedan bloqueados.
- El botón de guardar tiene `disabled={loading || !t || !tm1 || isTodayReg}`. Cuando `isTodayReg` es `true`, el botón queda deshabilitado.
- Se agrega un banner verde dentro del card (antes de los inputs) cuando `isTodayReg`: "TC SBS registrado para hoy. No se permiten modificaciones."
- El texto del botón simplificado a `'Confirmar e ingresar'` (ya no dice "Actualizar valores").

**Cómo revertir:** Quitar `|| isTodayReg` de los `disabled` de inputs y botón. Restaurar el texto condicional del botón. Eliminar el banner verde.

---

### CAMBIO 41 — Cierre Diario: bloquear cierre con operaciones pendientes

**Módulo:** Posición FX → Cierre Diario
**Ruta en el sistema:** Menú principal > Posición FX > pestaña "Cierre Diario" > botón "Ejecutar Cierre Diario"
**Archivo:** `src/pages/tesoreria/CierreDiarioPage.jsx`

**Qué se hizo:**
```js
// Antes:
const canClose = hasTcSbs && opsLiquidadas.length > 0 && !isCierreDone

// Después:
const canClose = hasTcSbs && opsLiquidadas.length > 0 && !isCierreDone && opsPendientes.length === 0
```

El panel de prerequisitos ya mostraba el estado de operaciones pendientes con aviso ámbar (`PrereqItem` con `warning`). Ahora ese prerequisito también bloquea el botón de cierre.

**Cómo revertir:** Quitar `&& opsPendientes.length === 0` de `canClose`.

---

### CAMBIO 42 — Conciliación Bancaria: upload de imágenes en diferencias y formato de miles

**Módulo:** Posición FX → Conciliación Bancaria
**Ruta en el sistema:** Menú principal > Posición FX > pestaña "Conciliación Bancaria" > Cuadraturas A y B
**Archivo:** `src/pages/conciliacion/ConciliacionPage.jsx`

**Qué se hizo:**

1. **Upload de imágenes:** Cuando hay diferencia en Cuadratura A o B, aparece un campo `<input type="file" accept="image/png,image/jpeg,image/jpg">` debajo del textarea de descripción. Permite adjuntar capturas de estado de cuenta o comprobantes que expliquen la diferencia. Útil para identificar clientes al día siguiente.

2. **Formato de miles en stats:** Los valores de Cuadratura A y B en el panel de KPIs (parte superior) ahora se formatean con separadores de miles usando `toLocaleString('es-PE', { minimumFractionDigits: 2 })` antes de mostrar el prefijo `Δ`.

**Cómo revertir:** Eliminar el bloque de `<input type="file">` en los bloques condicionales de diferencia A y B. Revertir el formateo del stat a `Δ ${quadX.valor}`.

---

## [2026-05-03] Reportes – Spread ×10,000 y BCRP Adelantado

---

### CAMBIO 43 — Reportes: spread en ×10,000 para Trader y Utilidad

**Módulo:** Reportes → Operativos e Internos
**Ruta en el sistema:** Menú principal > Reportes > "Operaciones por Trader" y "Reporte de Utilidad"
**Archivo:** `src/pages/reportes/ReportesPage.jsx`

**Qué se hizo:**
- Reporte `op_trader`: columna renombrada de `'Spread Prom.'` a `'Spread (×10K)'`. Valores multiplicados ×10,000:
  - `0.0042` → `42.0` · `0.0038` → `38.0` · `0.0035` → `35.0`
- Reporte `utilidad`: ídem.
  - `0.0040` → `40.0` · `0.0038` → `38.0` · `0.0041` → `41.0`

**Cómo revertir:** Restaurar los nombres de columna y los valores decimales en `REPORT_DEFS.op_trader` y `REPORT_DEFS.utilidad`.

---

### CAMBIO 44 — BCRP Adelantado: incluir todos los estados excepto anuladas

**Módulo:** Reportes → BCRP Adelantado
**Ruta en el sistema:** Menú principal > Reportes > pestaña "BCRP Adelantado" > generar preview
**Archivo:** `src/pages/reportes/ReportesRegulatoriosPage.jsx`

**Qué se hizo:**
```js
// Antes:
const filtered = ops.filter(o =>
  o.fecha === selectedDate && ['liquidada', 'cerrada'].includes(o.estado)
)

// Después:
const filtered = ops.filter(o => {
  if (o.fecha !== selectedDate) return false
  if (activeTab === 'bcrp_adelantado') return o.estado !== 'anulada'
  return ['liquidada', 'cerrada'].includes(o.estado)
})
```

El reporte Adelantado tiene corte dinámico (antes de las 5:00 PM), por lo que debe incluir operaciones en todos los estados activos. El Definitivo y el RO SBS mantienen el filtro restrictivo de solo `liquidada` y `cerrada`.

**Cómo revertir:** Restaurar el filtro original de `['liquidada', 'cerrada'].includes(o.estado)` sin distinción por `activeTab`.

---

## [2026-05-03] Catálogos, Parámetros y Auditoría

---

### CAMBIO 45 — Catálogos Bancos: validación de 11 dígitos en RUC

**Módulo:** Catálogos → Bancos QAPAQ
**Ruta en el sistema:** Menú principal > Catálogos > pestaña "Bancos QAPAQ" > Nuevo banco / Editar
**Archivo:** `src/pages/admin/CatalogosPage.jsx`

**Qué se hizo:**
- En `bancos.formFields`, el campo RUC ahora tiene `hint: '11 dígitos exactos'` y `maxLength: 11`.
- El input `type="text"` del `CatalogDrawer` pasa `maxLength={f.maxLength}` al elemento HTML, impidiendo ingresar más de 11 caracteres.
- En `validate()`, se agrega validación que comprueba que el RUC tenga exactamente 11 dígitos cuando se ingresa algún valor. Mensaje: `"El RUC debe tener exactamente 11 dígitos"`.

**Cómo revertir:** Quitar `maxLength: 11` de la definición del campo, quitar el prop `maxLength` del input, y quitar la validación de longitud en `validate()`.

---

### CAMBIO 46 — Parámetros: incorporar Stop Loss

**Módulo:** Parámetros
**Ruta en el sistema:** Menú principal > Parámetros > sección "Límites Operacionales"
**Archivo:** `src/pages/admin/ParametrosPage.jsx`

**Qué se hizo:**
- Se agregó `stopLossUSD: 500_000` a `DEFAULT_PARAMS` dentro del bloque de Límites Operacionales.
- Se agregó un `FieldParam` con input numérico para `stopLossUSD` en la sección "Límites Operacionales", entre "Límite Acumulado Diario" y "Máx. Operaciones Concurrentes".
- El stat inferior del panel de KPIs ahora muestra `Stop Loss (USD)` en rojo en lugar de "Umbral PLAFT".

**Nota:** El valor de `stopLossUSD` en `ParametrosPage` es independiente del `useState(500_000)` en `PosicionFXPage`. La integración real (leer el parámetro desde un contexto o prop) queda pendiente.

**Cómo revertir:** Quitar `stopLossUSD` de `DEFAULT_PARAMS`, eliminar el `FieldParam` correspondiente y restaurar el stat de "Umbral PLAFT".

---

### CAMBIO 47 — Auditoría: filtro por fecha

**Módulo:** Auditoría
**Ruta en el sistema:** Menú principal > Auditoría > barra de filtros
**Archivo:** `src/pages/auditoria/AuditoriaPage.jsx`

**Qué se hizo:**
- Se agregó estado `dateFil` (`useState('')`).
- En `filtered`, se agrega condición `const matchDate = !dateFil || l.ts.startsWith(dateFil)`.
- Se agrega un input `type="date"` en la barra de filtros junto al selector de módulo y resultado.
- Al cambiar la fecha, se llama `resetPage()` para volver a la primera página.

**Cómo revertir:** Eliminar estado `dateFil`, quitar `matchDate` de `filtered`, eliminar el input de fecha.

---
