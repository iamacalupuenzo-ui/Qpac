# Guidelines — QAPAQ FX

> Reglas del sistema para colaboradores e IA
> Actualizado: 2026-05-10

---

## Reglas Generales

1. **Documentar siempre**: Cada cambio de comportamiento, UX o flujo va documentado en `guidelines/definicion.md`. Cada cambio estructural en `guidelines/contexto.md`.

2. **Preguntar antes de implementar UX**: Si el cambio involucra layout, colores, tipografía o decisión visual, validar con el usuario antes de ejecutar.

3. **`guidelines/definicion.md` es la fuente de verdad de producto**: Contiene decisiones de roles, visibilidad, textos, cálculos y comportamientos.

4. **No mezclar estilos**: Usar TailwindCSS utility classes como estándar. Solo usar estilos inline (`style={{}}`) cuando se requiera una variable CSS o cálculo dinámico no soportado por Tailwind.

5. **Datos mock**: Toda la data es simulada. No hay backend, API, ni base de datos real. Los cambios en datos afectan solo arrays/diccionarios en los componentes.

6. **Sin librería de routing**: La navegación se maneja con `useState` en `App.jsx` (`adminPage`, `operPage`, `adminTab`, `operTab`).

7. **Estado global**: Toda la data centralizada vive en `App.jsx` y se pasa por props. No hay Context API, Redux ni Zustand. El prop drilling es el patrón aceptado.

8. **Sin TypeScript**: El proyecto usa JavaScript plano (JSX). No crear archivos `.tsx` ni tipos.

9. **Sin pruebas**: No hay testing configurado. Verificar cambios manualmente con `npm run dev`.

10. **Desktop exclusivo**: La aplicación está diseñada solo para desktop. No implementar diseño responsive ni mobile.

11. **`CAMBIOS.md`**: Mantener actualizado con cada modificación aplicada. Incluir: fecha, módulo, qué se cambió, archivo, por qué, y cómo revertir.

---

## Reglas de Código

1. **Un solo componente por archivo**: Aunque los subcomponentes se definen en el mismo archivo que el componente principal, mantenerlos en la parte superior antes del export default.

2. **Helpers al inicio**: Funciones utilitarias (`fmtMoney`, `fmtDate`, etc.) siempre al inicio del archivo, antes de los componentes.

3. **Datos mock al inicio**: Arrays y objetos de datos mock declarados como constantes después de los helpers, antes de los componentes.

4. **Constante de colores**: No hay constante `C` como en otros proyectos. Los colores se definen vía CSS custom properties en `src/index.css` y se usan con Tailwind classes o `style={{ color: 'var(--color-*)' }}`.

5. **Iconos**: Usar exclusivamente Lucide React. Importar solo los iconos necesarios de `lucide-react`.

6. **Clases condicionales**: Usar `clsx()` para clases condicionales. No usar template strings.

7. **Formateo numérico**: Todos los montos deben usar `fmtMoney()` de `src/utils/format.js`. Todos los `parseFloat` sobre montos deben usar `parseMoney()`. Los TC no tienen separador de miles y usan `parseFloat` directo.

8. **Inputs de monto**: Usar `type="text"` con `inputMode="numeric"`, format-on-blur con `fmtMoney`, strip-on-focus.

9. **Inputs de TC**: Usar `type="text"` con `inputMode="decimal"`, reemplazo de `,` → `.` en onChange.

10. **Navegación segura en wizards**: Cuando `inWizard === true`, cualquier navegación debe mostrar el modal de confirmación "¿Descartar cambios?". Implementado via `pendingNav` + `showExitModal` + `confirmNavigation()` en `App.jsx`.

---

## Reglas de Datos

1. **Operaciones mock**: 8 operaciones en `App.jsx` array `ops` (estado central). Los wizards modifican este array via `setOps`.

2. **Clientes mock**: 8 clientes en `App.jsx` array `clientes`. Ordenados por fecha descendente.

3. **Nuevo código de cliente**: El wizard usa `nextClientCode` (ej. `CLI-009`) que se incrementa automáticamente al guardar.

4. **TC SBS mock**: Un solo registro inicial en `tcSbsHistory`. Cada registro tiene `fecha`, `t` (TC hoy), `tMinus1` (TC ayer), `usuario`, `timestamp`.

5. **Cierres diarios mock**: Array `cierres` en `App.jsx`. Cada cierre tiene `id`, `fechaSoc`, `cantOps`, `montos`, `tcSbs`, `usuario`, `timestamp`, `estado`.

6. **Simulación Datatec**: `setInterval` de 3s en `App.jsx` que varía `marketData.datatec.compra/venta` con `(Math.random() - 0.5) * 0.002`. No modificar este comportamiento sin validar con el usuario.

7. **Usuarios de login mock**: Objeto `TEST_USERS` en `Login.jsx`. No hay registro de nuevos usuarios desde login.

---

## Paleta de Colores (Resumen)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary-700` | `#1d4ed8` | Brand primario (azul) |
| `--color-primary-500` | `#3b82f6` | Botones, acentos |
| `--color-surface-bg` | `#f4f4f0` | Fondo de página |
| `--color-border` | `#e5e5e1` | Bordes |
| `--color-success` | `#10b981` | Éxito |
| `--color-warning` | `#f59e0b` | Alerta |
| `--color-danger` | `#ef4444` | Error |
| `--sidebar-w` | `56px` | Ancho sidebar |

---

## Referencias Rápidas

### Imports frecuentes
```javascript
import clsx from 'clsx'
import { Search, Plus, X, ChevronDown, Check, AlertTriangle } from 'lucide-react'
import { fmtMoney, parseMoney } from '../../utils/format'
import { useToast, ToastContainer } from '../../components/ui/Toast'
```

### Archivos críticos

| Archivo | Líneas | Rol |
|---------|--------|-----|
| `src/App.jsx` | 678 | Orquestador principal |
| `src/pages/operaciones/OperacionesPage.jsx` | 1747 | Bandeja de operaciones |
| `src/pages/operaciones/CotizacionWizard.jsx` | 1110 | Wizard de cotización |
| `src/pages/clientes/ClienteWizard.jsx` | 1069 | Wizard de onboarding |
| `src/pages/admin/UsersPage.jsx` | 934 | CRUD de usuarios |
| `src/pages/admin/CatalogosPage.jsx` | 659 | Catálogos del sistema |
| `src/pages/dashboards/DashboardsPage.jsx` | 644 | Dashboards por rol |
| `src/components/layout/Header.jsx` | 276 | Header + market data |
| `src/components/layout/Sidebar.jsx` | 143 | Sidebar de navegación |
| `src/index.css` | 44 | Tokens de diseño |

---

*Fin del documento Guidelines.md*
