import { useState, useRef, useEffect } from 'react'
import {
  Plus, X, Pencil, Search,
  Coins, Building2, FileText, AlertTriangle,
  Clock3, Users, CheckCircle2, Ban, Check,
  ChevronDown, ShieldCheck, ChevronLeft, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import MesasDineroPage from './MesasDineroPage'

/* ══════════════════════════════════════════════
   CATÁLOGO DEFS — schema + datos por tab
══════════════════════════════════════════════ */
const CATALOG_DEFS = {
  monedas: {
    icon:  Coins,
    color: 'text-blue-500',
    title: 'Monedas Operadas',
    desc:  'Divisas habilitadas para operaciones FX en la plataforma.',
    cols: [
      { key: 'codigo',    label: 'Código ISO',  mono: true  },
      { key: 'nombre',    label: 'Nombre'                   },
      { key: 'simbolo',   label: 'Símbolo',     mono: true  },
      { key: 'decimales', label: 'Decimales'                },
    ],
    formFields: [
      { key: 'codigo',    label: 'Código ISO',  type: 'text',   required: true, hint: 'Ej. USD, EUR, GBP' },
      { key: 'nombre',    label: 'Nombre',      type: 'text',   required: true  },
      { key: 'simbolo',   label: 'Símbolo',     type: 'text',   required: true, hint: 'Ej. $, €, £'      },
      { key: 'decimales', label: 'Decimales',   type: 'number', hint: 'Usualmente 2'                     },
    ],
    data: [
      { id: 'USD', codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$',   decimales: 2, activo: true  },
      { id: 'EUR', codigo: 'EUR', nombre: 'Euro',                 simbolo: '€',   decimales: 2, activo: true  },
      { id: 'GBP', codigo: 'GBP', nombre: 'Libra Esterlina',      simbolo: '£',   decimales: 2, activo: false },
      { id: 'JPY', codigo: 'JPY', nombre: 'Yen Japonés',          simbolo: '¥',   decimales: 0, activo: false },
      { id: 'CHF', codigo: 'CHF', nombre: 'Franco Suizo',         simbolo: 'Fr',  decimales: 2, activo: true  },
      { id: 'CAD', codigo: 'CAD', nombre: 'Dólar Canadiense',     simbolo: 'C$',  decimales: 2, activo: false },
    ],
  },

  bancos: {
    icon:  Building2,
    color: 'text-indigo-500',
    title: 'Bancos QAPAQ',
    desc:  'Entidades bancarias vinculadas a las cuentas operativas de QAPAQ.',
    cols: [
      { key: 'codigo', label: 'Código',  mono: true },
      { key: 'nombre', label: 'Banco'               },
      { key: 'tipo',   label: 'Tipo'                },
      { key: 'ruc',    label: 'RUC',     mono: true },
    ],
    formFields: [
      { key: 'codigo', label: 'Código corto',  type: 'text',   required: true, hint: 'Ej. BCP, IBK, SCO' },
      { key: 'nombre', label: 'Nombre',         type: 'text',   required: true  },
      { key: 'tipo',   label: 'Tipo de entidad',type: 'select', required: true,
        options: ['Banco múltiple', 'Banco estatal', 'Caja municipal', 'Caja rural', 'Financiera'] },
      { key: 'ruc',    label: 'RUC',            type: 'text',   hint: '11 dígitos exactos', maxLength: 11 },
    ],
    data: [
      { id: 'B-001', codigo: 'BCP',  nombre: 'Banco de Crédito del Perú',     tipo: 'Banco múltiple',  ruc: '20100047218', activo: true  },
      { id: 'B-002', codigo: 'IBK',  nombre: 'Interbank',                     tipo: 'Banco múltiple',  ruc: '20100053455', activo: true  },
      { id: 'B-003', codigo: 'SCO',  nombre: 'Scotiabank Perú',               tipo: 'Banco múltiple',  ruc: '20100043140', activo: true  },
      { id: 'B-004', codigo: 'BBVA', nombre: 'BBVA Continental',              tipo: 'Banco múltiple',  ruc: '20100130204', activo: true  },
      { id: 'B-005', codigo: 'BN',   nombre: 'Banco de la Nación',            tipo: 'Banco estatal',   ruc: '20100030595', activo: false },
      { id: 'B-006', codigo: 'GNB',  nombre: 'Banco GNB Perú',               tipo: 'Banco múltiple',  ruc: '20340917695', activo: true  },
    ],
  },

  tipos_op: {
    icon:  FileText,
    color: 'text-teal-500',
    title: 'Tipos de Operación',
    desc:  'Categorías de operaciones FX habilitadas en la plataforma.',
    cols: [
      { key: 'codigo',       label: 'Código',       mono: true },
      { key: 'nombre',       label: 'Nombre'                   },
      { key: 'plazo',        label: 'Liquidación'              },
      { key: 'requiere_doc', label: 'Req. Docum.',  bool: true },
    ],
    formFields: [
      { key: 'codigo',       label: 'Código',        type: 'text',   required: true, hint: 'Ej. SPOT, FWD'      },
      { key: 'nombre',       label: 'Nombre',         type: 'text',   required: true  },
      { key: 'plazo',        label: 'Plazo de liquidación', type: 'text', hint: 'Ej. Mismo día, T+1' },
      { key: 'requiere_doc', label: 'Requiere Documentación', type: 'toggle' },
    ],
    data: [
      { id: 'T-001', codigo: 'SPOT',    nombre: 'Spot / Contado',         plazo: 'Mismo día',        requiere_doc: true,  activo: true  },
      { id: 'T-002', codigo: 'FWD',     nombre: 'Forward',                plazo: 'Según contrato',   requiere_doc: true,  activo: true  },
      { id: 'T-003', codigo: 'SWAP',    nombre: 'Swap de Divisas',        plazo: 'Según contrato',   requiere_doc: true,  activo: false },
      { id: 'T-004', codigo: 'VTA-VEN', nombre: 'Venta a Ventanilla',     plazo: 'Mismo día',        requiere_doc: false, activo: true  },
      { id: 'T-005', codigo: 'ARBIT',   nombre: 'Arbitraje',              plazo: 'Mismo día',        requiere_doc: true,  activo: false },
    ],
  },

  causas_anulacion: {
    icon:  AlertTriangle,
    color: 'text-amber-500',
    title: 'Causas de Anulación',
    desc:  'Motivos válidos para solicitar la anulación de una operación (RF-11).',
    cols: [
      { key: 'codigo',    label: 'Código',           mono: true },
      { key: 'nombre',    label: 'Nombre'                       },
      { key: 'desc',      label: 'Descripción'                  },
      { key: 'req_aprov', label: 'Req. Aprobación',  bool: true },
    ],
    formFields: [
      { key: 'codigo',    label: 'Código',         type: 'text',     required: true, hint: 'Ej. ERR-OP, CLI-DES' },
      { key: 'nombre',    label: 'Nombre',          type: 'text',     required: true  },
      { key: 'desc',      label: 'Descripción',     type: 'textarea'                  },
      { key: 'req_aprov', label: 'Requiere Aprobación del Head', type: 'toggle'       },
    ],
    data: [
      { id: 'CA-001', codigo: 'ERR-OP',    nombre: 'Error Operativo (Trader)',        desc: 'Monto, TC o contraparte errados por la mesa.',           req_aprov: true,  activo: true  },
      { id: 'CA-002', codigo: 'CLI-DES',   nombre: 'Desistimiento de Cliente',        desc: 'El cliente cancela antes de ejecutar la transferencia.', req_aprov: false, activo: true  },
      { id: 'CA-003', codigo: 'ERR-DATOS', nombre: 'Error en Datos Críticos',         desc: 'Identidad del cliente no coincide con el abono.',        req_aprov: true,  activo: true  },
      { id: 'CA-004', codigo: 'TRF-ERROR', nombre: 'Transferencia Mal Ejecutada',     desc: 'Error bancario detectado antes de la liquidación.',      req_aprov: true,  activo: true  },
      { id: 'CA-005', codigo: 'LIM-EXC',  nombre: 'Límite de Exposición Excedido',   desc: 'La operación supera el límite regulatorio vigente.',     req_aprov: true,  activo: false },
    ],
  },

  plazos: {
    icon:  Clock3,
    color: 'text-violet-500',
    title: 'Plazos de Excepción',
    desc:  'Ventanas de tiempo habilitadas para resolver diferencias y excepciones documentarias.',
    cols: [
      { key: 'codigo', label: 'Código',      mono: true },
      { key: 'nombre', label: 'Nombre'                  },
      { key: 'dias',   label: 'Días hábiles'            },
      { key: 'tipo',   label: 'Aplica a'                },
    ],
    formFields: [
      { key: 'codigo', label: 'Código',         type: 'text',   required: true, hint: 'Ej. EXC-24H' },
      { key: 'nombre', label: 'Nombre',          type: 'text',   required: true  },
      { key: 'dias',   label: 'Días hábiles',    type: 'number', hint: 'Número entero positivo'      },
      { key: 'tipo',   label: 'Aplica a',        type: 'select',
        options: ['Conciliación', 'Documentación', 'PLAFT', 'Operativo', 'Regulatorio'] },
    ],
    data: [
      { id: 'PL-001', codigo: 'EXC-24H',  nombre: 'Excepción 24 horas',          dias: 1,  tipo: 'Conciliación',  activo: true  },
      { id: 'PL-002', codigo: 'EXC-48H',  nombre: 'Excepción 48 horas',          dias: 2,  tipo: 'Documentación', activo: true  },
      { id: 'PL-003', codigo: 'EXC-72H',  nombre: 'Excepción 72 horas',          dias: 3,  tipo: 'Documentación', activo: false },
      { id: 'PL-004', codigo: 'EXC-5D',   nombre: 'Excepción 5 días hábiles',    dias: 5,  tipo: 'PLAFT',         activo: true  },
      { id: 'PL-005', codigo: 'EXC-10D',  nombre: 'Excepción 10 días hábiles',   dias: 10, tipo: 'PLAFT',         activo: false },
    ],
  },

  contrapartes: {
    icon:  Users,
    color: 'text-rose-500',
    title: 'Tipos de Contraparte',
    desc:  'Categorías de clientes y entidades habilitadas para operar en la plataforma (RF-02).',
    cols: [
      { key: 'codigo',  label: 'Código',           mono: true },
      { key: 'nombre',  label: 'Nombre'                       },
      { key: 'tipo',    label: 'Categoría'                    },
      { key: 'vinc',    label: 'Req. Vinculación', bool: true },
    ],
    formFields: [
      { key: 'codigo', label: 'Código',         type: 'text',   required: true, hint: 'Ej. PN, PJ, PEP'    },
      { key: 'nombre', label: 'Nombre',          type: 'text',   required: true  },
      { key: 'tipo',   label: 'Categoría',       type: 'select',
        options: ['Minorista', 'Empresarial', 'Regulado', 'PEP (PLAFT)', 'Sector público', 'Institucional'] },
      { key: 'vinc',   label: 'Requiere Vinculación Formal', type: 'toggle'                                  },
    ],
    data: [
      { id: 'CP-001', codigo: 'PN',   nombre: 'Persona Natural',                tipo: 'Minorista',      vinc: false, activo: true  },
      { id: 'CP-002', codigo: 'PJ',   nombre: 'Persona Jurídica',               tipo: 'Empresarial',    vinc: true,  activo: true  },
      { id: 'CP-003', codigo: 'EMED', nombre: 'Empresa de Envío de Dinero',     tipo: 'Regulado',       vinc: true,  activo: true  },
      { id: 'CP-004', codigo: 'IFIN', nombre: 'Institución Financiera',         tipo: 'Regulado',       vinc: true,  activo: true  },
      { id: 'CP-005', codigo: 'PEP',  nombre: 'Persona Políticamente Expuesta', tipo: 'PEP (PLAFT)',    vinc: true,  activo: false },
      { id: 'CP-006', codigo: 'MUNI', nombre: 'Entidad Municipal / Gobierno',   tipo: 'Sector público', vinc: true,  activo: true  },
    ],
  },
}

/* ══════════════════════════════════════════════
   TOGGLE
══════════════════════════════════════════════ */
function Toggle({ checked, onChange, disabled }) {
  return (
    <button type="button" onClick={() => !disabled && onChange?.(!checked)} disabled={disabled}
      className={clsx('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-blue-600' : 'bg-gray-200', disabled && 'opacity-40 cursor-not-allowed')}>
      <span className={clsx('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200',
        checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  )
}

/* ══════════════════════════════════════════════
   MINI SELECT
══════════════════════════════════════════════ */
function MiniSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const sel = options.find(o => o.value === value)
  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div className="relative w-16" ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={clsx('flex items-center gap-1 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-white text-xs w-full',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300')}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}>
        <span className="flex-1 text-gray-700">{sel?.label}</span>
        <ChevronDown size={10} className={clsx('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx('w-full flex items-center justify-between px-2.5 py-1.5 text-xs',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50')}>
              {o.label}
              {o.value === value && <Check size={10} className="text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   DRAWER
══════════════════════════════════════════════ */
function CatalogDrawer({ open, item, def, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const isEdit = !!item

  useEffect(() => {
    if (open) {
      const initial = {}
      def.formFields.forEach(f => {
        initial[f.key] = item?.[f.key] ?? (f.type === 'toggle' ? false : f.type === 'number' ? 0 : '')
      })
      setForm(initial)
      setErrors({})
    }
  }, [open, item])

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e = {}
    def.formFields.filter(f => f.required).forEach(f => {
      if (!form[f.key] && form[f.key] !== 0) e[f.key] = 'Campo obligatorio'
    })
    // Validar maxLength para campos no requeridos pero que tienen maxLength
    def.formFields.filter(f => f.maxLength && form[f.key]).forEach(f => {
      if (String(form[f.key]).length > f.maxLength) e[f.key] = `Máximo ${f.maxLength} caracteres`
      if (f.key === 'ruc' && form[f.key] && String(form[f.key]).length !== f.maxLength && String(form[f.key]).length > 0) {
        e[f.key] = `El RUC debe tener exactamente ${f.maxLength} dígitos`
      }
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(form)
  }

  const inputCls = (err) => clsx(
    'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 outline-none transition-all bg-white',
    err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
  )

  return (
    <>
      <div className={clsx('fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose} />

      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{
          width: 480,
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              {def?.icon ? <def.icon size={16} /> : null}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {isEdit ? 'Editar' : 'Nuevo'} — {def?.title}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isEdit ? `ID: ${item?.id}` : 'Los campos con * son obligatorios.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {def?.formFields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>

              {f.type === 'text' && (
                <input type="text" value={form[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  placeholder={f.hint}
                  maxLength={f.maxLength}
                  className={inputCls(errors[f.key])} />
              )}

              {f.type === 'number' && (
                <input type="number" value={form[f.key] ?? 0}
                  onChange={e => setField(f.key, Number(e.target.value))}
                  placeholder={f.hint}
                  className={inputCls(errors[f.key])} />
              )}

              {f.type === 'textarea' && (
                <textarea rows={3} value={form[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  placeholder={f.hint}
                  className={clsx(inputCls(errors[f.key]), 'resize-none')} />
              )}

              {f.type === 'select' && (
                <select value={form[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  className={clsx(inputCls(errors[f.key]), 'appearance-none')}>
                  <option value="">Seleccionar...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}

              {f.type === 'toggle' && (
                <div className="flex items-center gap-3">
                  <Toggle checked={!!form[f.key]} onChange={v => setField(f.key, v)} />
                  <span className="text-xs text-gray-500">{form[f.key] ? 'Habilitado' : 'Deshabilitado'}</span>
                </div>
              )}

              {f.hint && f.type !== 'toggle' && !errors[f.key] && (
                <p className="text-[11px] text-gray-400 mt-1">{f.hint}</p>
              )}
              {errors[f.key] && (
                <p className="text-[11px] text-red-500 mt-1">{errors[f.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            <Check size={14} /> {isEdit ? 'Guardar cambios' : 'Crear registro'}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════
   GENERIC CATALOG
══════════════════════════════════════════════ */
function GenericCatalog({ activeTab }) {
  const def = CATALOG_DEFS[activeTab]

  const [items,    setItems]    = useState(def?.data ?? [])
  const [drawer,   setDrawer]   = useState(null)   // null | 'new' | item
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setItems(CATALOG_DEFS[activeTab]?.data ?? [])
    setSearch('')
    setPage(1)
  }, [activeTab])

  if (!def) return (
    <div className="flex items-center justify-center py-20 text-sm text-gray-400">
      Catálogo no disponible
    </div>
  )

  const Icon = def.icon

  /* Filtering */
  const filtered = items.filter(item =>
    !search || def.cols.some(col =>
      String(item[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function resetPage() { setPage(1) }

  /* Stats */
  const totalActivos   = items.filter(i => i.activo).length
  const totalInactivos = items.filter(i => !i.activo).length

  /* Actions */
  function handleToggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, activo: !i.activo } : i))
  }

  function handleSave(formData) {
    if (drawer === 'new') {
      const newId = `${activeTab.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-5)}`
      setItems(prev => [...prev, { id: newId, ...formData, activo: true }])
    } else {
      setItems(prev => prev.map(i => i.id === drawer.id ? { ...i, ...formData } : i))
    }
    setDrawer(null)
  }

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total registros', value: items.length,      color: 'text-gray-900'  },
          { label: 'Activos',          value: totalActivos,      color: 'text-green-600' },
          { label: 'Inactivos',        value: totalInactivos,    color: 'text-gray-400'  },
          { label: 'Resultados',       value: filtered.length,   color: 'text-blue-600'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
          <div className="flex items-center gap-2.5">
            <Icon size={15} className={def.color} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{def.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{def.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Buscador */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white w-52 transition-all focus-within:ring-2 focus-within:ring-blue-100"
              style={{ border: '1px solid var(--color-border)' }}>
              <Search size={12} className="text-gray-400 shrink-0" />
              <input type="text" placeholder={`Buscar en ${def.title.toLowerCase()}...`}
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage() }}
                className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full" />
              {search && (
                <button onClick={() => { setSearch(''); resetPage() }} className="text-gray-300 hover:text-gray-500 shrink-0">
                  <X size={11} />
                </button>
              )}
            </div>
            <button
              onClick={() => setDrawer('new')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus size={13} /> Nuevo
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                {def.cols.map(col => (
                  <th key={col.key} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(item => (
                <tr key={item.id}
                  className={clsx('border-b hover:bg-gray-50/60 transition-colors', !item.activo && 'opacity-60')}
                  style={{ borderColor: 'var(--color-border)' }}>

                  {def.cols.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      {col.bool ? (
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium',
                          item[col.key] ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                        )}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', item[col.key] ? 'bg-blue-500' : 'bg-gray-400')} />
                          {item[col.key] ? 'Sí' : 'No'}
                        </span>
                      ) : (
                        <span className={clsx(
                          'text-xs',
                          col.mono ? 'font-mono font-bold text-gray-800' : 'text-gray-700'
                        )}>
                          {String(item[col.key] ?? '—')}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                      item.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full', item.activo ? 'bg-green-500' : 'bg-gray-400')} />
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Editar"
                        onClick={() => setDrawer(item)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title={item.activo ? 'Inactivar' : 'Activar'}
                        onClick={() => handleToggle(item.id)}
                        className={clsx('p-1.5 rounded-lg transition-colors',
                          item.activo
                            ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                            : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                        )}
                      >
                        {item.activo ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paged.length === 0 && (
                <tr>
                  <td colSpan={def.cols.length + 2} className="px-4 py-12 text-center text-sm text-gray-300">
                    No se encontraron registros
                    {search && <span className="text-gray-400"> para "<strong>{search}</strong>"</span>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Mostrar</span>
              <MiniSelect
                value={String(pageSize)}
                onChange={v => { setPageSize(Number(v)); resetPage() }}
                options={[5, 10, 25].map(n => ({ value: String(n), label: String(n) }))}
              />
              <span>por página · <span className="font-medium text-gray-700">{filtered.length}</span> registro{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, idx) =>
                  n === '…' ? (
                    <span key={`e-${idx}`} className="px-1.5 text-xs text-gray-400">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n)}
                      className={clsx('min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium transition-colors',
                        n === safePage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>
                      {n}
                    </button>
                  )
                )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nota */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
        <ShieldCheck size={13} className="text-blue-400 shrink-0" />
        <p className="text-[11px] text-gray-500">
          La inactivación es lógica — los registros se conservan en el historial de auditoría (RF-33). No se permite eliminación permanente.
        </p>
      </div>

      <CatalogDrawer
        open={!!drawer}
        item={drawer !== 'new' ? drawer : null}
        def={def}
        onClose={() => setDrawer(null)}
        onSave={handleSave}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════
   ROUTER PRINCIPAL
══════════════════════════════════════════════ */
export default function CatalogosPage({ activeTab }) {
  if (activeTab === 'mesas') return <MesasDineroPage />
  return <GenericCatalog activeTab={activeTab} />
}
