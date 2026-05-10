# Guía de Estilos — QAPAQ FX

> Sistema de diseño para la plataforma de Mesa de Dinero FX de Financiera QAPAQ
> Actualizado: 2026-05-10

---

## 1. Marca & Identidad

| Atributo | Valor |
|----------|-------|
| **Nombre producto** | QAPAQ FX |
| **Marca corporativa** | Financiera QAPAQ |
| **Plataforma** | Mesa de Dinero FX |
| **Propósito** | Gestión de operaciones de cambio de divisas |

### Logotipo
- Isotipo: cuadrado azul con letra "Q" blanca (32×32, `rounded-lg`)
- Usado en sidebar y login (panel izquierdo)
- Texto corporativo: "Financiera QAPAQ"

---

## 2. Paleta de Colores

### 2.1 Colores de Marca

| Token | Uso | Hex |
|-------|-----|-----|
| `--color-primary-50` | Fondos muy claros | `#eff6ff` |
| `--color-primary-100` | Fondos hover, tags | `#dbeafe` |
| `--color-primary-200` | Bordes hover | `#bfdbfe` |
| `--color-primary-500` | Botones, acentos | `#3b82f6` |
| `--color-primary-600` | Hover botones | `#2563eb` |
| `--color-primary-700` | Brand primario (azul oscuro) | `#1d4ed8` |

### 2.2 Neutros

| Token | Uso | Hex |
|-------|-----|-----|
| `--color-surface-bg` | Fondo de página | `#f4f4f0` |
| `--color-surface-card` | Fondo de cards | `#ffffff` |
| `--color-surface-hover` | Hover de filas | `#f0f0ec` |
| `--color-border` | Bordes de componentes | `#e5e5e1` |
| `--color-text-primary` | Texto principal | `#111827` |
| `--color-text-secondary` | Texto secundario | `#6b7280` |
| `--color-text-muted` | Texto muted/placeholder | `#9ca3af` |

### 2.3 Semánticos

| Token | Uso | Hex |
|-------|-----|-----|
| `--color-success` | Éxito, completado, conforme | `#10b981` |
| `--color-warning` | Alerta, pendiente, observado | `#f59e0b` |
| `--color-danger` | Error, anulado, destructivo | `#ef4444` |

### 2.4 Colores de Estado (Operaciones)

| Estado | Fondo | Texto |
|--------|-------|-------|
| Reservada | `bg-blue-50` | `text-blue-700` |
| En revisión | `bg-amber-50` | `text-amber-700` |
| Observada | `bg-orange-50` | `text-orange-700` |
| Subsanada | `bg-teal-50` | `text-teal-700` |
| Liquidada | `bg-green-50` | `text-green-700` |
| Pend. Reapertura | `bg-violet-50` | `text-violet-700` |
| Anulada | `bg-gray-100` | `text-gray-500` |

### 2.5 Colores de Rol (Usuarios)

| Rol | Fondo | Texto |
|-----|-------|-------|
| admin | `bg-purple-50` | `text-purple-700` |
| trader | `bg-blue-50` | `text-blue-700` |
| middle | `bg-cyan-50` | `text-cyan-700` |
| back | `bg-indigo-50` | `text-indigo-700` |
| head | `bg-violet-50` | `text-violet-700` |
| tesoreria | `bg-teal-50` | `text-teal-700` |
| contab | `bg-emerald-50` | `text-emerald-700` |
| gerente | `bg-amber-50` | `text-amber-700` |

### 2.6 Colores de Tipo de Cliente

| Tipo | Fondo | Texto |
|------|-------|-------|
| PN | `bg-slate-100` | `text-slate-700` |
| P10 | `bg-sky-100` | `text-sky-700` |
| PJ | `bg-indigo-100` | `text-indigo-700` |
| EF | `bg-violet-100` | `text-violet-700` |

### 2.7 Colores de Estado de Cliente

| Estado | Fondo | Texto |
|--------|-------|-------|
| Activo | `bg-green-50` | `text-green-700` |
| Activo en proceso | `bg-amber-50` | `text-amber-700` |
| Pendiente legal | `bg-blue-50` | `text-blue-700` |
| No habilitado | `bg-red-50` | `text-red-700` |

---

## 3. Tipografía

### 3.1 Fuentes

| Rol | Fuente | Pesos | Uso |
|-----|--------|-------|-----|
| **Cuerpo** | Inter (sistema) | 400, 500, 600, 700 | Todo el texto de la interfaz |
| **Monospace** | font-mono (sistema) | — | IDs, montos, TC, spreads |

Carga en `index.css`:
```css
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 14px;
}
```

### 3.2 Jerarquía Tipográfica

| Elemento | Font | Tamaño | Weight |
|----------|------|--------|--------|
| **Título de módulo** | Inter | 14px (sm) | 600 (semibold) |
| **KPI value** | Inter | 24px (2xl) | 700 (bold) |
| **Nombre de página** | Inter | 14px | 600 |
| **Cuerpo (p)** | Inter | 12–14px | 400 |
| **Label** | Inter | 12–12.5px | 500 |
| **Tab** | Inter | 12–13px | 500 |
| **Button** | Inter | 12–14px | 600–700 |
| **Input** | Inter | 14px | 400 |
| **Tag / Badge** | Inter | 10–11px | 600 |
| **Table header** | Inter | 11–12px | 600 |
| **Table cell** | Inter | 11–12px | 400–500 |
| **Tooltip** | Inter | 12px | 400 |
| **Monto** | font-mono | 12–14px | 600–700 |
| **TC** | font-mono | 12–14px | 600 |
| **ID operación** | font-mono | 12px | 700 |

---

## 4. Componentes UI

### 4.1 Botones

| Variante | Uso | Estilo |
|----------|-----|--------|
| **Primary (azul)** | Acción principal | `bg-blue-600`, `text-white`, `hover:bg-blue-700`, `rounded-lg` (8–10px), `font-semibold` |
| **Primary danger (rojo)** | Eliminar, anular | `bg-red-600`, `text-white`, `hover:bg-red-700` |
| **Ghost** | Acción ligera | `hover:bg-gray-50`, `text-gray-600` |
| **Icon button** | Acción en tabla | `p-1.5`, `rounded-md`, `hover:bg-gray-100` |

**Estados:**
- Hover: `transition-colors duration-150`
- Disabled: `opacity-60 cursor-not-allowed`
- Active: `active:scale-95` (en modales de confirmación)

### 4.2 Cards

| Variante | Estilo |
|----------|--------|
| **KPI Card** | `bg-white rounded-lg px-4 py-3.5`, border `var(--color-border)` |
| **Card Wrap** | `bg-white rounded-lg overflow-hidden`, border `var(--color-border)` |
| **Card Head** | `px-5 py-4 border-b`, background `var(--color-surface-bg)` |

### 4.3 Inputs

| Propiedad | Valor |
|-----------|-------|
| Background | `bg-white` |
| Border | `1px solid var(--color-border)` |
| Border-radius | `rounded-lg` (8px) |
| Padding | `px-3 py-2.5` |
| Focus | `border-blue-500 ring-2 ring-blue-100` |
| Placeholder | `text-gray-400` |
| Font size | `text-sm` (14px) |

### 4.4 Badges / Tags

| Elemento | Style |
|----------|-------|
| **EstadoBadge** | `inline-flex`, `gap-1.5`, `px-2 py-0.5`, `rounded-full`, `text-[11px]`, `font-medium` |
| **Dot** | `w-1.5 h-1.5 rounded-full` |
| **TipoBadge** | `inline-flex`, `gap-1`, `px-2 py-0.5`, `rounded-full`, `text-[11px]`, `font-semibold` |
| **RolBadge** | `px-2 py-0.5`, `rounded-full`, `text-[11px]`, `font-medium` |

### 4.5 Tablas

| Propiedad | Valor |
|-----------|-------|
| Header | `text-xs font-semibold text-gray-500`, bg `var(--color-surface-bg)` |
| Cell | `px-4 py-2.5` |
| Row hover | `hover:bg-gray-50/60` |
| Row border | `border-b`, color `var(--color-border)` |

### 4.6 Tab Navigation

- Tab activa: `text-blue-600 font-semibold` + indicador inferior `h-[2px] bg-blue-600`
- Tab inactiva: `text-gray-500 font-medium hover:text-gray-800`
- Padding: `px-4 py-2.5`

### 4.7 Sidebar

| Propiedad | Valor |
|-----------|-------|
| Width | 56px (`var(--sidebar-w)`) |
| Background | `#ffffff` |
| Border | `1px solid var(--color-border)` |
| Logo | `w-8 h-8 rounded-lg bg-blue-600`, texto "Q" |
| Nav button active | `bg-blue-50 text-blue-600`, indicador `w-[3px] h-5 bg-blue-600` |
| Nav button inactive | `text-gray-400 hover:bg-gray-100 hover:text-gray-700` |
| Tooltip | `bg-gray-900 text-white`, `text-xs`, `rounded-md` |

### 4.8 Header

| Propiedad | Valor |
|-----------|-------|
| Height | `h-14` (56px) |
| Background | `bg-white` |
| Border bottom | `1px solid var(--color-border)` |
| Sticky | `sticky top-0 z-20` |

### 4.9 Market Data Strip

| Elemento | Estilo |
|----------|--------|
| Contenedor | `bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5` |
| Badge modo | `text-[9px] font-bold uppercase`, `bg-blue-100 text-blue-700` (Datatec) / `bg-amber-100 text-amber-700` (Manual) |
| TC valor | `text-xs font-mono font-bold text-gray-800` |
| Tendencia | `TrendingUp` verde `#10b981`, `TrendingDown` rojo `#ef4444`, `Minus` gris |
| Posición neta | `text-xs font-mono font-bold`, verde si positiva, rojo si negativa |

### 4.10 Dropdown / Filter Select

| Propiedad | Valor |
|-----------|-------|
| Trigger | `flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs` |
| Open state | `border-blue-400 ring-2 ring-blue-100` |
| Dropdown | `bg-white rounded-lg z-30 py-1`, border + shadow |
| Item active | `bg-blue-50 text-blue-700 font-medium` |
| Item inactive | `text-gray-700 hover:bg-gray-50` |

### 4.11 Modales / Drawers

| Propiedad | Valor |
|-----------|-------|
| Overlay | `bg-black/40 backdrop-blur-sm` (confirmación) / `bg-black/20` (drawers) |
| Panel | `bg-white rounded-2xl shadow-2xl`, border `var(--color-border)` |
| Padding | `p-6` (modal confirmación) |
| Z-index | `z-[60]` (modal), `z-[70]` (cierre notif) |

---

## 5. Layout & Espaciado

### Login
- Split: panel izquierdo `w-[420px]` azul (`#1d4ed8`) + panel derecho flex-1
- Form `max-w-sm`, padding `px-6 py-12`
- Panel izquierdo oculto en mobile (no aplica — desktop only)

### Dashboard / App Layout
- Sidebar: `var(--sidebar-w)` = 56px, fixed, full height
- Content: `margin-left: var(--sidebar-w)`, flex-1, min-height screen
- Padding main: `p-6` (24px)
- Border radius sistema: `rounded-lg` (8px) general, `rounded-xl` (12px) para tarjetas destacadas, `rounded-2xl` (16px) para modales

---

## 6. Animaciones

| Uso | Tipo | Parámetros |
|-----|------|-------------|
| Dropdowns | Transición CSS | `transition-all duration-150` |
| Buttons hover | Transición CSS | `transition-colors duration-150` |
| Spinner loading | Rotación CSS | `animate-spin` (Tailwind) |
| Active/tap | Scale CSS | `active:scale-95` |
| Rotate chevron | Rotación CSS | `transition-transform duration-150` |

No hay librería de animaciones (Framer Motion no está instalada). Solo animaciones nativas CSS.

---

## 7. Sombras

| Nivel | Sombra | Uso |
|-------|--------|-----|
| Sutil | `shadow-sm` | Cards, contenedores |
| Media | `0 4px 16px rgba(0,0,0,0.08)` | Dropdowns, popovers |
| Fuerte | `shadow-2xl` | Modales |

---

*Fin del documento guia-estilos.md*
