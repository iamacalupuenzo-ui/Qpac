import { useState, useRef, useEffect } from 'react'
import {
  Search, Plus, Check, X, Filter, ChevronDown,
  ChevronLeft, ChevronRight, AlertTriangle, Clock,
  FileText, Eye, Ban, Upload, UserPlus, Trash2,
  ShieldCheck, ShieldAlert, CheckCircle2, ClipboardCheck, Pencil,
} from 'lucide-react'
import clsx from 'clsx'

/* ═══════════════════════════════════════════════
   DATE HELPERS
═══════════════════════════════════════════════ */
function isoToDisplay(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function displayToIso(disp) {
  if (!disp) return ''
  const [d, m, y] = disp.split('/')
  return `${y}-${m}-${d}`
}
function daysUntil(displayDate) {
  if (!displayDate) return null
  const [d, m, y] = displayDate.split('/')
  const target = new Date(+y, +m - 1, +d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}
function diffDays(fromIso, toIso) {
  const a = new Date(fromIso), b = new Date(toIso)
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24))
}
const todayISO = new Date().toISOString().slice(0, 10)

/* Dynamic mock dates so alerts always show */
function addDaysDisp(n) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const CLIENTES_ACTIVOS = [
  { value: 'CLI-002', label: 'Exportaciones Lima S.A.C. (CLI-002)',     nombre: 'Exportaciones Lima S.A.C.' },
  { value: 'CLI-003', label: 'Banco Americano del Perú S.A. (CLI-003)', nombre: 'Banco Americano del Perú S.A.' },
  { value: 'CLI-007', label: 'Minera Andina S.A. (CLI-007)',            nombre: 'Minera Andina S.A.' },
]

const MOCK_DOCS = [
  {
    id: 'DOC-001',
    clienteId: 'CLI-002', clienteNombre: 'Exportaciones Lima S.A.C.',
    tipoDoc: 'convenio_marco',
    fechaFirma: '20/01/2026', fechaVencimiento: null,
    archivo: 'convenio_marco_exportaciones.pdf',
    representantes: [{ id: 1, nombre: 'Carlos Ramírez Torres', doi: '28765432', archivo: 'dni_ramirez.pdf' }],
    excepcionPlazo: false, motivoExcepcion: null,
    estado: 'vigente',
    revisionLegal: 'conforme', observacionesLegal: null,
    revisadoPor: 'Dra. Lucía Vargas', fechaRevision: '22/01/2026',
    registradoPor: 'Marco Quispe L.', fechaRegistro: '20/01/2026',
    invalidadoPor: null, fechaInvalidacion: null,
  },
  {
    id: 'DOC-002',
    clienteId: 'CLI-002', clienteNombre: 'Exportaciones Lima S.A.C.',
    tipoDoc: 'vigencia_poderes',
    fechaFirma: '20/01/2026', fechaVencimiento: addDaysDisp(3), /* AL-GC-09: vence en 3 días */
    archivo: 'vigencia_poderes_exportaciones.pdf',
    representantes: [{ id: 1, nombre: 'Carlos Ramírez Torres', doi: '28765432', archivo: 'dni_ramirez.pdf' }],
    excepcionPlazo: false, motivoExcepcion: null,
    estado: 'vigente',
    revisionLegal: 'conforme', observacionesLegal: null,
    revisadoPor: 'Dra. Lucía Vargas', fechaRevision: '22/01/2026',
    registradoPor: 'Marco Quispe L.', fechaRegistro: '20/01/2026',
    invalidadoPor: null, fechaInvalidacion: null,
  },
  {
    id: 'DOC-003',
    clienteId: 'CLI-003', clienteNombre: 'Banco Americano del Perú S.A.',
    tipoDoc: 'convenio_marco',
    fechaFirma: '05/02/2026', fechaVencimiento: null,
    archivo: 'convenio_marco_bap.pdf',
    representantes: [
      { id: 1, nombre: 'Elena Fuentes Mora',  doi: '31234567', archivo: 'dni_fuentes.pdf' },
      { id: 2, nombre: 'Ricardo León Salas',  doi: '35678901', archivo: 'dni_leon.pdf' },
    ],
    excepcionPlazo: false, motivoExcepcion: null,
    estado: 'pendiente',
    revisionLegal: null, observacionesLegal: null,
    revisadoPor: null, fechaRevision: null,
    registradoPor: 'Marco Quispe L.', fechaRegistro: '05/02/2026',
    invalidadoPor: null, fechaInvalidacion: null,
  },
  {
    id: 'DOC-004',
    clienteId: 'CLI-003', clienteNombre: 'Banco Americano del Perú S.A.',
    tipoDoc: 'vigencia_poderes',
    fechaFirma: '05/02/2026', fechaVencimiento: addDaysDisp(-8), /* ya vencido */
    archivo: 'vigencia_poderes_bap.pdf',
    representantes: [{ id: 1, nombre: 'Elena Fuentes Mora', doi: '31234567', archivo: 'dni_fuentes.pdf' }],
    excepcionPlazo: false, motivoExcepcion: null,
    estado: 'vencido',
    revisionLegal: 'conforme', observacionesLegal: null,
    revisadoPor: 'Dra. Lucía Vargas', fechaRevision: '07/02/2026',
    registradoPor: 'Marco Quispe L.', fechaRegistro: '05/02/2026',
    invalidadoPor: null, fechaInvalidacion: null,
  },
  {
    id: 'DOC-005',
    clienteId: 'CLI-007', clienteNombre: 'Minera Andina S.A.',
    tipoDoc: 'carta_autorizacion',
    fechaFirma: '25/02/2026', fechaVencimiento: null,
    archivo: 'carta_autorizacion_minera.pdf',
    representantes: [],
    excepcionPlazo: false, motivoExcepcion: null,
    estado: 'vigente',
    revisionLegal: null, observacionesLegal: null,
    revisadoPor: null, fechaRevision: null,
    registradoPor: 'Marco Quispe L.', fechaRegistro: '25/02/2026',
    invalidadoPor: null, fechaInvalidacion: null,
  },
  {
    id: 'DOC-006',
    clienteId: 'CLI-002', clienteNombre: 'Exportaciones Lima S.A.C.',
    tipoDoc: 'convenio_marco',
    fechaFirma: '10/01/2026', fechaVencimiento: null,
    archivo: 'convenio_marco_exportaciones_v1.pdf',
    representantes: [{ id: 1, nombre: 'Carlos Ramírez Torres', doi: '28765432', archivo: 'dni_ramirez.pdf' }],
    excepcionPlazo: false, motivoExcepcion: null,
    estado: 'invalidado',
    revisionLegal: 'conforme', observacionesLegal: null,
    revisadoPor: 'Dra. Lucía Vargas', fechaRevision: '12/01/2026',
    registradoPor: 'Marco Quispe L.', fechaRegistro: '10/01/2026',
    invalidadoPor: 'Sistema', fechaInvalidacion: '22/01/2026',
  },
]

/* Apoderados registrados por cliente (mock) */
const TIPO_DOI_OPTS = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE',  label: 'Carné de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'RUC', label: 'RUC' },
]

const MOCK_APODERADOS = [
  { id: 1, clienteId: 'CLI-002', nombre: 'Carlos Ramírez Torres', tipoDoi: 'DNI', numeroDoi: '28765432' },
  { id: 2, clienteId: 'CLI-003', nombre: 'Elena Fuentes Mora',    tipoDoi: 'DNI', numeroDoi: '31234567' },
]

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const TIPO_DOC = {
  convenio_marco:    { label: 'Convenio Marco',         bg: 'bg-blue-50',    text: 'text-blue-700'    },
  vigencia_poderes:  { label: 'Vigencia de Poderes',    bg: 'bg-violet-50',  text: 'text-violet-700'  },
  carta_autorizacion:{ label: 'Carta de Autorización',  bg: 'bg-teal-50',    text: 'text-teal-700'    },
  otro:              { label: 'Otro',                   bg: 'bg-gray-100',   text: 'text-gray-600'    },
}

const ESTADO_DOC = {
  pendiente:  { bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400',  label: 'Pend. revisión legal' },
  vigente:    { bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500',  label: 'Vigente'              },
  invalidado: { bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400',   label: 'Invalidado'           },
  vencido:    { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'bg-red-500',    label: 'Vencido'              },
}

const REVISION_LEGAL = {
  conforme:    { bg: 'bg-green-50', text: 'text-green-700', Icon: ShieldCheck, label: 'Conforme'    },
  no_conforme: { bg: 'bg-red-50',   text: 'text-red-700',   Icon: ShieldAlert, label: 'No conforme' },
}

/* ═══════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════ */
function FilterSelect({ value, onChange, options, placeholder, className = 'w-44' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className={clsx('relative', className)} ref={ref}>
      <button
        type="button" onClick={() => setOpen(v => !v)}
        className={clsx(
          'flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs text-left transition-all w-full',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300'
        )}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}
      >
        <span className={clsx('flex-1 truncate', selected ? 'text-gray-700' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={11} className={clsx('text-gray-400 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 min-w-max"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3 py-2 text-xs transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              )}>
              {o.label}
              {o.value === value && <Check size={11} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DrawerSelect({ value, onChange, options, placeholder, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all bg-white',
          error ? 'border-red-400' : open ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
        )}>
        <span className={clsx('flex-1 truncate text-sm', selected ? 'text-gray-900' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} className={clsx('text-gray-400 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-50 py-1 overflow-auto"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)', maxHeight: 220 }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              )}>
              {o.label}
              {o.value === value && <Check size={12} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = err => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white',
  err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

const textareaCls = err => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white resize-none',
  err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

function ToggleGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={clsx(
            'flex-1 py-2 rounded-lg text-xs font-medium border transition-colors',
            value === o.value
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
          )}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function FileUploadField({ value, onChange, error }) {
  const ref = useRef(null)
  const files = value ? (Array.isArray(value) ? value : value.split(', ').filter(Boolean)) : []
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer transition-colors',
          error ? 'border-red-300 bg-red-50' : files.length ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
        )}>
        <Upload size={13} className={clsx('shrink-0', files.length ? 'text-green-500' : 'text-gray-400')} />
        <span className={clsx('text-sm truncate flex-1', files.length ? 'text-gray-700' : 'text-gray-400')}>
          {files.length ? `${files.length} archivo(s) seleccionado(s)` : 'Seleccionar archivo PDF o imagen...'}
        </span>
        {files.length > 0 && <Check size={12} className="text-green-500 shrink-0" />}
      </div>
      <input ref={ref} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={e => {
          const selected = Array.from(e.target.files ?? [])
          if (selected.length) {
            const names = selected.map(f => f.name)
            const prev = value ? (Array.isArray(value) ? value : value.split(', ').filter(Boolean)) : []
            onChange([...prev, ...names].join(', '))
          }
        }} />
      {files.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {files.map((name, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <FileText size={10} className="shrink-0 text-gray-400" />
              <span className="truncate flex-1">{name}</span>
              <button type="button" onClick={() => {
                const updated = files.filter((_, j) => j !== i)
                onChange(updated.length ? updated.join(', ') : '')
              }} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function PageBtn({ onClick, disabled, active, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={clsx('w-7 h-7 flex items-center justify-center rounded text-xs transition-all',
        active ? 'bg-blue-600 text-white font-semibold' :
        disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
      )}>
      {children}
    </button>
  )
}

/* ═══════════════════════════════════════════════
   CONFIRM MODAL (genérico)
═══════════════════════════════════════════════ */
function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-80"
        style={{ border: '1px solid var(--color-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
        <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors', confirmClass)}>
            {confirmLabel}
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   REVIEW MODAL — Asesoría Legal
═══════════════════════════════════════════════ */
function ReviewModal({ open, doc, onClose, onSave }) {
  const [resultado,     setResultado]     = useState('conforme')
  const [observaciones, setObservaciones] = useState('')
  const [error,         setError]         = useState('')

  useEffect(() => {
    if (open) { setResultado('conforme'); setObservaciones(''); setError('') }
  }, [open])

  function handleSave() {
    if (resultado === 'no_conforme' && !observaciones.trim()) {
      setError('Las observaciones son obligatorias cuando el resultado es No conforme.')
      return
    }
    onSave({ resultado, observaciones: resultado === 'no_conforme' ? observaciones : null })
  }

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-[420px]"
        style={{ border: '1px solid var(--color-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Revisión Legal</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{doc?.id} — {TIPO_DOC[doc?.tipoDoc]?.label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Resultado de revisión" required>
            <ToggleGroup
              value={resultado} onChange={v => { setResultado(v); setError('') }}
              options={[{ value: 'conforme', label: 'Conforme' }, { value: 'no_conforme', label: 'No conforme' }]}
            />
          </Field>

          {resultado === 'no_conforme' && (
            <Field label="Observaciones" required error={error}>
              <textarea
                rows={3} placeholder="Describa el motivo de no conformidad..."
                value={observaciones} onChange={e => { setObservaciones(e.target.value); setError('') }}
                className={textareaCls(error)}
              />
            </Field>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors',
              resultado === 'conforme' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            )}>
            <Check size={14} /> Registrar revisión
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

/* ═══════════════════════════════════════════════
   DETAIL MODAL — ver información completa
═══════════════════════════════════════════════ */
function DetailRow({ label, children }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  )
}

function DetailDrawer({ open, doc: d, onClose }) {
  const ts = d ? (TIPO_DOC[d.tipoDoc] ?? TIPO_DOC.otro) : null
  const es = d ? (ESTADO_DOC[d.estado] ?? ESTADO_DOC.pendiente) : null
  const rl = d?.revisionLegal ? REVISION_LEGAL[d.revisionLegal] : null
  const RevIcon = rl?.Icon
  const days = d?.fechaVencimiento ? daysUntil(d.fechaVencimiento) : null

  return (
    <>
      <div className={clsx('fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{ width: 520, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)', transform: open ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            {d && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-gray-500">{d.id}</span>
                  <span className={clsx('inline-block px-2 py-0.5 rounded text-[11px] font-medium', ts.bg, ts.text)}>{ts.label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{d.clienteNombre}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {d && (
              <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', es.bg, es.text)}>
                <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', es.dot)} />{es.label}
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        {d && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Datos del documento */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Datos del documento</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <DetailRow label="Fecha de firma">{d.fechaFirma}</DetailRow>
                <DetailRow label="Fecha de vencimiento">
                  {d.fechaVencimiento ? (
                    <div>
                      <span className={clsx(days !== null && days < 0 ? 'text-red-600 font-medium' : '')}>{d.fechaVencimiento}</span>
                      {days !== null && days < 0 && (
                        <span className="block text-[10px] text-red-500 mt-0.5">Vencido hace {Math.abs(days)}d</span>
                      )}
                    </div>
                  ) : <span className="text-gray-400">Sin vencimiento</span>}
                </DetailRow>
                <DetailRow label="Archivo digital">
                  {d.archivo
                    ? <span className="text-blue-500 cursor-pointer hover:underline text-sm">{d.archivo}</span>
                    : <span className="text-gray-400">—</span>}
                </DetailRow>
                {d.excepcionPlazo && (
                  <DetailRow label="Excepción de plazo">{d.motivoExcepcion || 'Aprobada'}</DetailRow>
                )}
              </div>
            </div>

            {/* Representantes */}
            {d.representantes.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Representantes legales ({d.representantes.length})
                </p>
                <div className="space-y-2">
                  {d.representantes.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border)' }}>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{r.nombre}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{r.doi}</p>
                      </div>
                      {r.archivo && (
                        <span className="text-[11px] text-blue-500 cursor-pointer hover:underline">{r.archivo}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revisión legal */}
            {['convenio_marco', 'vigencia_poderes'].includes(d.tipoDoc) && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Revisión legal</p>
                {rl ? (
                  <div className="space-y-1.5">
                    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', rl.bg, rl.text)}>
                      {RevIcon && <RevIcon size={11} />}{rl.label}
                    </span>
                    {d.revisadoPor && (
                      <p className="text-xs text-gray-500">{d.revisadoPor} · {d.fechaRevision}</p>
                    )}
                    {d.observacionesLegal && (
                      <p className="text-xs text-red-600 leading-relaxed">{d.observacionesLegal}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Sin revisión registrada aún.</p>
                )}
              </div>
            )}

            {/* Invalidación */}
            {d.estado === 'invalidado' && d.invalidadoPor && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Invalidación</p>
                <p className="text-xs text-gray-600">
                  Invalidado por <span className="font-medium">{d.invalidadoPor}</span> el {d.fechaInvalidacion}
                </p>
              </div>
            )}

            {/* Registro */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Registro</p>
              <p className="text-xs text-gray-500">{d.registradoPor} · {d.fechaRegistro}</p>
            </div>

          </div>
        )}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   DOC DRAWER — alta de documento
═══════════════════════════════════════════════ */
const EMPTY_FORM = {
  clienteId:      '',
  tipoDoc:        'convenio_marco',
  fechaFirma:     '',
  fechaVencimiento: '',
  archivo:        '',
  representantes: [],
  excepcionPlazo: false,
  motivoExcepcion: '',
}

let _repId = 100
function newRep() { return { id: ++_repId, nombre: '', doi: '', archivo: '' } }

function DocDrawer({ open, onClose, onSave, fixedClienteId, editDoc = null }) {
  const [form,   setForm]   = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const needsReps = ['convenio_marco', 'vigencia_poderes'].includes(form.tipoDoc)

  useEffect(() => {
    if (!open) return
    if (editDoc) {
      setForm({
        clienteId:        editDoc.clienteId,
        tipoDoc:          editDoc.tipoDoc,
        fechaFirma:       displayToIso(editDoc.fechaFirma),
        fechaVencimiento: editDoc.fechaVencimiento ? displayToIso(editDoc.fechaVencimiento) : '',
        archivo:          editDoc.archivo,
        representantes:   editDoc.representantes ?? [],
        excepcionPlazo:   editDoc.excepcionPlazo ?? false,
        motivoExcepcion:  editDoc.motivoExcepcion ?? '',
      })
    } else {
      setForm({ ...EMPTY_FORM, clienteId: fixedClienteId ?? '' })
    }
    setErrors({})
  }, [open, editDoc, fixedClienteId])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  function addRep()        { setForm(f => ({ ...f, representantes: [...f.representantes, newRep()] })); setErrors(e => ({ ...e, representantes: undefined })) }
  function removeRep(id)   { setForm(f => ({ ...f, representantes: f.representantes.filter(r => r.id !== id) })) }
  function updateRep(id, field, value) {
    setForm(f => ({ ...f, representantes: f.representantes.map(r => r.id === id ? { ...r, [field]: value } : r) }))
    if (errors[`rep_${id}_${field}`]) setErrors(e => ({ ...e, [`rep_${id}_${field}`]: undefined }))
  }

  function validate() {
    const e = {}
    if (!fixedClienteId && !form.clienteId) e.clienteId = 'Selecciona el cliente.'
    if (!form.fechaFirma)      e.fechaFirma = 'La fecha de firma es obligatoria.'
    else if (form.fechaFirma > todayISO) e.fechaFirma = 'La fecha de firma no puede ser futura.'
    if (!form.archivo)         e.archivo = 'El archivo PDF es obligatorio.'

    if (form.tipoDoc === 'vigencia_poderes') {
      if (!form.fechaVencimiento) {
        e.fechaVencimiento = 'La fecha de vencimiento es obligatoria para Vigencia de Poderes.'
      } else if (form.fechaFirma && form.fechaVencimiento) {
        const dias = diffDays(form.fechaFirma, form.fechaVencimiento)
        if (dias < 0) {
          e.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a la fecha de firma.'
        } else if (dias > 60) {
          e.fechaVencimiento = 'El plazo máximo absoluto es de 60 días calendario (incluso con excepción aprobada).'
        } else if (dias > 30 && !form.excepcionPlazo) {
          e.fechaVencimiento = 'El plazo máximo es 30 días. Active "Excepción de plazo" si cuenta con aprobación del Gerente de División Legal.'
        }
      }
      if (form.excepcionPlazo && !form.motivoExcepcion.trim())
        e.motivoExcepcion = 'El motivo de excepción es obligatorio.'
    }

    if (needsReps) {
      if (form.representantes.length === 0) {
        e.representantes = 'Debe registrar al menos un representante legal.'
      } else {
        form.representantes.forEach(r => {
          if (!r.nombre.trim()) e[`rep_${r.id}_nombre`] = 'Requerido'
          if (!r.doi.trim())    e[`rep_${r.id}_doi`]    = 'Requerido'
        })
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(form)
  }

  /* Vigencia de Poderes: show days count as user fills dates */
  const diasVigencia = (form.tipoDoc === 'vigencia_poderes' && form.fechaFirma && form.fechaVencimiento)
    ? diffDays(form.fechaFirma, form.fechaVencimiento)
    : null

  return (
    <>
      <div className={clsx('fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{ width: 520, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)', transform: open ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {editDoc ? 'Editar documento contractual' : 'Nuevo documento contractual'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {editDoc
                ? `${editDoc.id} · Los cambios reemplazarán los datos actuales del documento.`
                : 'El documento quedará pendiente de revisión por Asesoría Legal.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {!fixedClienteId && (
            <Field label="Cliente" required error={errors.clienteId}>
              <DrawerSelect value={form.clienteId} onChange={v => set('clienteId', v)}
                options={CLIENTES_ACTIVOS} placeholder="Seleccionar cliente..." error={errors.clienteId} />
            </Field>
          )}

          <Field label="Tipo de documento" required>
            {editDoc ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50">
                <span className={clsx('inline-block px-2 py-0.5 rounded text-[11px] font-medium', TIPO_DOC[form.tipoDoc]?.bg, TIPO_DOC[form.tipoDoc]?.text)}>
                  {TIPO_DOC[form.tipoDoc]?.label ?? form.tipoDoc}
                </span>
                <span className="text-[11px] text-gray-400 ml-1">No modificable</span>
              </div>
            ) : (
              <DrawerSelect
                value={form.tipoDoc}
                onChange={v => { set('tipoDoc', v); setForm(f => ({ ...f, tipoDoc: v, representantes: [], fechaVencimiento: '', excepcionPlazo: false, motivoExcepcion: '' })); setErrors({}) }}
                options={[
                  { value: 'convenio_marco',     label: 'Convenio Marco de Operaciones' },
                  { value: 'vigencia_poderes',   label: 'Vigencia de Poderes' },
                  { value: 'carta_autorizacion', label: 'Carta de Autorización Terceros' },
                  { value: 'otro',               label: 'Otro' },
                ]}
                placeholder=""
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha de firma" required error={errors.fechaFirma}>
              <input type="date" max={todayISO} value={form.fechaFirma}
                onChange={e => set('fechaFirma', e.target.value)}
                className={inputCls(errors.fechaFirma)} />
            </Field>

            {form.tipoDoc === 'vigencia_poderes' && (
              <Field
                label="Fecha de vencimiento"
                required
                error={errors.fechaVencimiento}
              >
                <input type="date" min={form.fechaFirma || undefined} value={form.fechaVencimiento}
                  onChange={e => set('fechaVencimiento', e.target.value)}
                  className={inputCls(errors.fechaVencimiento)} />
              </Field>
            )}
          </div>

          {/* Días contador — solo Vigencia de Poderes */}
          {form.tipoDoc === 'vigencia_poderes' && diasVigencia !== null && (
            <div className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
              diasVigencia > 60 ? 'bg-red-50 text-red-600' :
              diasVigencia > 30 ? 'bg-amber-50 text-amber-700' :
                                  'bg-green-50 text-green-700'
            )}>
              <Clock size={12} />
              {diasVigencia} días de vigencia
              {diasVigencia > 30 && diasVigencia <= 60 && ' — requiere excepción aprobada'}
              {diasVigencia > 60 && ' — excede el límite absoluto (60 días)'}
            </div>
          )}

          {/* Excepción de plazo — solo Vigencia de Poderes y >30 días */}
          {form.tipoDoc === 'vigencia_poderes' && diasVigencia !== null && diasVigencia > 30 && diasVigencia <= 60 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => set('excepcionPlazo', !form.excepcionPlazo)}
                  className={clsx(
                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    form.excepcionPlazo ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                  )}>
                  {form.excepcionPlazo && <Check size={10} className="text-white" />}
                </button>
                <span className="text-xs text-gray-700">
                  Excepción aprobada por el Gerente de División Legal y Compliance
                </span>
              </div>
              {form.excepcionPlazo && (
                <Field label="Motivo de excepción" required error={errors.motivoExcepcion}>
                  <textarea rows={2} placeholder="Describa el motivo y la aprobación obtenida..."
                    value={form.motivoExcepcion} onChange={e => set('motivoExcepcion', e.target.value)}
                    className={textareaCls(errors.motivoExcepcion)} />
                </Field>
              )}
            </div>
          )}

          <Field label="Archivo digital (PDF)" required error={errors.archivo}>
            <FileUploadField value={form.archivo} onChange={v => set('archivo', v)} error={errors.archivo} />
          </Field>

          {/* Representantes legales */}
          {needsReps && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">
                  Representantes legales<span className="text-red-400 ml-0.5">*</span>
                </label>
                <button type="button" onClick={addRep}
                  className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  <UserPlus size={12} /> Agregar
                </button>
              </div>
              {errors.representantes && (
                <p className="text-[11px] text-red-500 mb-2">{errors.representantes}</p>
              )}
              {form.representantes.length === 0 ? (
                <div className="text-center py-4 rounded-lg border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">Sin representantes. Haz clic en "Agregar".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.representantes.map((r, i) => (
                    <RepRow key={r.id} rep={r} index={i}
                      errors={{ nombre: errors[`rep_${r.id}_nombre`], doi: errors[`rep_${r.id}_doi`] }}
                      onChange={(f, v) => updateRep(r.id, f, v)}
                      onRemove={() => removeRep(r.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            <Check size={14} /> {editDoc ? 'Guardar cambios' : 'Registrar documento'}
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

function RepRow({ rep, index, errors, onChange, onRemove }) {
  return (
    <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-400 tracking-wide">REPRESENTANTE {index + 1}</p>
        <button type="button" onClick={onRemove}
          className="p-1 rounded text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Nombre completo" required error={errors.nombre}>
          <input type="text" placeholder="Nombres y apellidos"
            value={rep.nombre} onChange={e => onChange('nombre', e.target.value)}
            className={inputCls(errors.nombre)} />
        </Field>
        <Field label="DOI" required error={errors.doi}>
          <input type="text" placeholder="DNI / CE / RUC"
            value={rep.doi} onChange={e => onChange('doi', e.target.value)}
            className={inputCls(errors.doi)} />
        </Field>
      </div>
      <Field label="Copia de documento de identidad">
        <FileUploadField value={rep.archivo} onChange={v => onChange('archivo', v)} />
      </Field>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   APODERADOS DRAWER — registro de apoderados
═══════════════════════════════════════════════ */
let _apoId = 200
function newApoderado() { return { id: ++_apoId, nombre: '', tipoDoi: 'DNI', numeroDoi: '' } }

function ApoderadoRow({ apo, index, errors, onChange, onRemove }) {
  return (
    <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--color-surface-bg)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-400 tracking-wide">APODERADO {index + 1}</p>
        <button type="button" onClick={onRemove}
          className="p-1 rounded text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
      <Field label="Nombres y apellidos" required error={errors.nombre}>
        <input type="text" placeholder="Nombres y apellidos"
          value={apo.nombre} onChange={e => onChange('nombre', e.target.value)}
          className={inputCls(errors.nombre)} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Tipo de DOI" required>
          <DrawerSelect value={apo.tipoDoi} onChange={v => onChange('tipoDoi', v)}
            options={TIPO_DOI_OPTS} placeholder="Tipo" />
        </Field>
        <Field label="Número de DOI" required error={errors.numeroDoi}>
          <input type="text" placeholder="N° de documento"
            value={apo.numeroDoi} onChange={e => onChange('numeroDoi', e.target.value)}
            className={inputCls(errors.numeroDoi)} />
        </Field>
      </div>
    </div>
  )
}

function ApoderadosDrawer({ open, onClose, onSave, fixedClienteId, initial }) {
  const [clienteId, setClienteId] = useState('')
  const [rows,      setRows]      = useState([])
  const [errors,    setErrors]    = useState({})

  /* Load this client's apoderados when opening (or when switching client in global view) */
  const cid = fixedClienteId ?? clienteId
  useEffect(() => {
    if (!open) return
    setClienteId(fixedClienteId ?? '')
    setErrors({})
  }, [open, fixedClienteId])

  useEffect(() => {
    if (!open) return
    setRows(cid ? initial.filter(a => a.clienteId === cid) : [])
  }, [open, cid, initial])

  function addApoderado()      { setRows(rs => [...rs, newApoderado()]) }
  function removeApoderado(id) { setRows(rs => rs.filter(r => r.id !== id)) }
  function updateApoderado(id, field, value) {
    setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r))
    if (errors[`apo_${id}_${field}`]) setErrors(e => ({ ...e, [`apo_${id}_${field}`]: undefined }))
  }

  function validate() {
    const e = {}
    if (!cid) e.clienteId = 'Selecciona el cliente.'
    rows.forEach(r => {
      if (!r.nombre.trim())    e[`apo_${r.id}_nombre`]    = 'Requerido'
      if (!r.numeroDoi.trim()) e[`apo_${r.id}_numeroDoi`] = 'Requerido'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(cid, rows)
  }

  return (
    <>
      <div className={clsx('fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250"
        style={{ width: 520, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)', transform: open ? 'translateX(0)' : 'translateX(100%)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Apoderados</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Registra los apoderados del cliente: nombres y apellidos, tipo y número de DOI.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {!fixedClienteId && (
            <Field label="Cliente" required error={errors.clienteId}>
              <DrawerSelect value={clienteId} onChange={setClienteId}
                options={CLIENTES_ACTIVOS} placeholder="Seleccionar cliente..." error={errors.clienteId} />
            </Field>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Apoderados registrados {rows.length > 0 && <span className="text-gray-400">({rows.length})</span>}
              </label>
              <button type="button" onClick={addApoderado} disabled={!cid}
                className={clsx('flex items-center gap-1 text-[11px] font-medium transition-colors',
                  cid ? 'text-blue-600 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed')}>
                <UserPlus size={12} /> Agregar
              </button>
            </div>

            {!cid ? (
              <div className="text-center py-6 rounded-lg border border-dashed border-gray-200">
                <p className="text-xs text-gray-400">Selecciona un cliente para registrar sus apoderados.</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-6 rounded-lg border border-dashed border-gray-200">
                <p className="text-xs text-gray-400">Sin apoderados. Haz clic en "Agregar".</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rows.map((apo, i) => (
                  <ApoderadoRow key={apo.id} apo={apo} index={i}
                    errors={{ nombre: errors[`apo_${apo.id}_nombre`], numeroDoi: errors[`apo_${apo.id}_numeroDoi`] }}
                    onChange={(f, v) => updateApoderado(apo.id, f, v)}
                    onRemove={() => removeApoderado(apo.id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSave} disabled={!cid}
            className={clsx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors',
              cid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed')}>
            <Check size={14} /> Guardar apoderados
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

/* ═══════════════════════════════════════════════
   MAIN TAB
═══════════════════════════════════════════════ */
const PAGE_SIZE = 6

export default function ConveniosTab({ clienteId, clienteNombre }) {
  const [docs,          setDocs]          = useState(MOCK_DOCS)
  const [search,        setSearch]        = useState('')
  const [filterCliente, setFilterCliente] = useState('')
  const [filterTipo,    setFilterTipo]    = useState('')
  const [filterEstado,  setFilterEstado]  = useState('')
  const [page,          setPage]          = useState(1)
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [editingDoc,    setEditingDoc]    = useState(null)
  const [detailDoc,     setDetailDoc]     = useState(null)
  const [reviewDoc,     setReviewDoc]     = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [apoderados,    setApoderados]    = useState(MOCK_APODERADOS)
  const [apoderadosOpen,setApoderadosOpen]= useState(false)

  /* Stats */
  const scope = clienteId ? docs.filter(d => d.clienteId === clienteId) : docs
  const stats = {
    total:      scope.length,
    vigentes:   scope.filter(d => d.estado === 'vigente').length,
    pendientes: scope.filter(d => d.estado === 'pendiente').length,
    cerrados:   scope.filter(d => d.estado === 'vencido' || d.estado === 'invalidado').length,
  }

  /* Filters */
  const q = search.trim().toLowerCase()
  const filtered = docs.filter(d => {
    if (clienteId && d.clienteId !== clienteId) return false
    if (q && !d.clienteNombre.toLowerCase().includes(q) && !d.id.toLowerCase().includes(q)) return false
    if (filterCliente && d.clienteId !== filterCliente) return false
    if (filterTipo    && d.tipoDoc   !== filterTipo)    return false
    if (filterEstado  && d.estado    !== filterEstado)  return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function resetPage() { setPage(1) }
  const applySearch   = v => { setSearch(v);         resetPage() }
  const applyCliente  = v => { setFilterCliente(v);  resetPage() }
  const applyTipo     = v => { setFilterTipo(v);     resetPage() }
  const applyEstado   = v => { setFilterEstado(v);   resetPage() }

  const activeFilters = (clienteId ? [] : [filterCliente]).concat([filterTipo, filterEstado]).filter(Boolean).length
  function clearFilters() { setFilterCliente(''); setFilterTipo(''); setFilterEstado(''); resetPage() }

  function closeDrawer() { setDrawerOpen(false); setEditingDoc(null) }

  /* Save new document */
  function handleSave(form) {
    const today = isoToDisplay(todayISO)
    const resolvedClienteId = clienteId ?? form.clienteId
    const resolvedNombre = clienteNombre ?? CLIENTES_ACTIVOS.find(c => c.value === form.clienteId)?.nombre ?? ''
    setDocs(ds => [...ds, {
      id:             `DOC-${String(ds.length + 1).padStart(3, '0')}`,
      clienteId:      resolvedClienteId,
      clienteNombre:  resolvedNombre,
      tipoDoc:        form.tipoDoc,
      fechaFirma:     isoToDisplay(form.fechaFirma),
      fechaVencimiento: form.fechaVencimiento ? isoToDisplay(form.fechaVencimiento) : null,
      archivo:        form.archivo,
      representantes: form.representantes,
      excepcionPlazo: form.excepcionPlazo,
      motivoExcepcion: form.motivoExcepcion || null,
      estado:         'pendiente',
      revisionLegal:  null, observacionesLegal: null,
      revisadoPor:    null, fechaRevision: null,
      registradoPor:  'Marco Quispe L.', fechaRegistro: today,
      invalidadoPor:  null, fechaInvalidacion: null,
    }])
    setDrawerOpen(false)
  }

  /* Update existing document */
  function handleUpdate(form) {
    setDocs(ds => ds.map(d => d.id === editingDoc.id ? {
      ...d,
      fechaFirma:       isoToDisplay(form.fechaFirma),
      fechaVencimiento: form.fechaVencimiento ? isoToDisplay(form.fechaVencimiento) : null,
      archivo:          form.archivo,
      representantes:   form.representantes,
      excepcionPlazo:   form.excepcionPlazo,
      motivoExcepcion:  form.motivoExcepcion || null,
    } : d))
    closeDrawer()
  }

  /* Legal review */
  function handleReviewSave({ resultado, observaciones }) {
    const doc = reviewDoc
    const today = isoToDisplay(todayISO)
    setDocs(ds => ds.map(d => {
      if (d.id !== doc.id) return d
      if (resultado === 'no_conforme') {
        return { ...d, revisionLegal: 'no_conforme', observacionesLegal: observaciones, revisadoPor: 'Dra. Lucía Vargas', fechaRevision: today }
      }
      /* conforme — puede invalidar el convenio anterior del mismo cliente */
      return { ...d, revisionLegal: 'conforme', observacionesLegal: null, revisadoPor: 'Dra. Lucía Vargas', fechaRevision: today, estado: 'vigente' }
    }))
    /* Invalidar convenio marco anterior si aplica */
    if (resultado === 'conforme' && doc.tipoDoc === 'convenio_marco') {
      setDocs(ds => ds.map(d => {
        if (d.id === doc.id || d.clienteId !== doc.clienteId || d.tipoDoc !== 'convenio_marco' || d.estado !== 'vigente') return d
        return { ...d, estado: 'invalidado', invalidadoPor: 'Sistema', fechaInvalidacion: today }
      }))
    }
    setReviewDoc(null)
  }

  /* Invalidar manual */
  function executeInvalidar() {
    const doc = confirmAction.doc
    const today = isoToDisplay(todayISO)
    setDocs(ds => ds.map(d => d.id === doc.id
      ? { ...d, estado: 'invalidado', invalidadoPor: 'Marco Quispe L.', fechaInvalidacion: today }
      : d
    ))
    setConfirmAction(null)
  }

  /* Guardar apoderados — reemplaza los del cliente con las filas válidas */
  function handleSaveApoderados(cid, rows) {
    const limpias = rows
      .filter(r => r.nombre.trim() && r.numeroDoi.trim())
      .map(r => ({ id: r.id, clienteId: cid, nombre: r.nombre.trim(), tipoDoi: r.tipoDoi, numeroDoi: r.numeroDoi.trim() }))
    setApoderados(prev => [...prev.filter(a => a.clienteId !== cid), ...limpias])
    setApoderadosOpen(false)
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total documentos',      value: stats.total,     color: 'text-gray-900'  },
          { label: 'Vigentes',              value: stats.vigentes,  color: 'text-green-600' },
          { label: 'Pend. revisión legal',  value: stats.pendientes,color: 'text-amber-600' },
          { label: 'Vencidos / Invalidados',value: stats.cerrados,  color: 'text-gray-400'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-end gap-2 mb-3">
        <button onClick={() => setApoderadosOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors">
          <UserPlus size={14} /> Apoderados
        </button>
        <button onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          <Plus size={14} /> Nuevo documento
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-2 mb-3 flex-wrap">

        {!clienteId && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-400 pl-1">Cliente</label>
            <FilterSelect value={filterCliente} onChange={applyCliente} className="w-52"
              placeholder="Todos los clientes"
              options={[{ value: '', label: 'Todos los clientes' }, ...CLIENTES_ACTIVOS]} />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Tipo</label>
          <FilterSelect value={filterTipo} onChange={applyTipo} className="w-48"
            placeholder="Todos los tipos"
            options={[
              { value: '', label: 'Todos los tipos' },
              { value: 'convenio_marco',     label: 'Convenio Marco' },
              { value: 'vigencia_poderes',   label: 'Vigencia de Poderes' },
              { value: 'carta_autorizacion', label: 'Carta de Autorización' },
              { value: 'otro',               label: 'Otro' },
            ]} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Estado</label>
          <FilterSelect value={filterEstado} onChange={applyEstado} className="w-44"
            placeholder="Todos"
            options={[
              { value: '',           label: 'Todos' },
              { value: 'vigente',    label: 'Vigente' },
              { value: 'pendiente',  label: 'Pend. revisión legal' },
              { value: 'vencido',    label: 'Vencido' },
              { value: 'invalidado', label: 'Invalidado' },
            ]} />
        </div>

        {activeFilters > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-transparent">–</label>
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
              <Filter size={11} /> Limpiar ({activeFilters})
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1 ml-auto">
          <label className="text-[11px] text-transparent">–</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white w-56 transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}>
            <Search size={13} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Buscar cliente, código..."
              value={search} onChange={e => applySearch(e.target.value)}
              className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full" />
            {search && (
              <button onClick={() => applySearch('')} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {(clienteId
                ? ['Código', 'Tipo', 'Fecha firma', 'Estado', '']
                : ['Código', 'Cliente', 'Tipo', 'Fecha firma', 'Estado', '']
              ).map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                  No se encontraron documentos con esos criterios
                </td>
              </tr>
            ) : (
              paginated.map(d => (
                <DocRow key={d.id} doc={d}
                  showCliente={!clienteId}
                  onVerDetalle={() => setDetailDoc(d)}
                  onEditar={() => setEditingDoc(d)}
                  onReview={() => setReviewDoc(d)}
                  onInvalidar={() => setConfirmAction({ doc: d })}
                />
              ))
            )}
          </tbody>
        </table>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400">
              Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length} documentos
            </p>
            <div className="flex items-center gap-1">
              <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}><ChevronLeft size={14} /></PageBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <PageBtn key={n} active={n === safePage} onClick={() => setPage(n)}>{n}</PageBtn>
              ))}
              <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><ChevronRight size={14} /></PageBtn>
            </div>
          </div>
        )}
      </div>

      <DocDrawer
        open={drawerOpen || !!editingDoc}
        onClose={closeDrawer}
        onSave={editingDoc ? handleUpdate : handleSave}
        fixedClienteId={clienteId}
        editDoc={editingDoc}
      />

      <DetailDrawer open={!!detailDoc} doc={detailDoc} onClose={() => setDetailDoc(null)} />

      <ApoderadosDrawer
        open={apoderadosOpen}
        onClose={() => setApoderadosOpen(false)}
        onSave={handleSaveApoderados}
        fixedClienteId={clienteId}
        initial={apoderados}
      />

      <ReviewModal open={!!reviewDoc} doc={reviewDoc} onClose={() => setReviewDoc(null)} onSave={handleReviewSave} />

      {confirmAction && (
        <ConfirmModal
          open
          title="¿Invalidar este documento?"
          message="El documento quedará en estado Invalidado y se conservará en el expediente para auditoría. Esta acción no puede revertirse."
          confirmLabel="Sí, invalidar"
          confirmClass="bg-gray-700 hover:bg-gray-800"
          onConfirm={executeInvalidar}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════
   DOC ROW
═══════════════════════════════════════════════ */
function DocRow({ doc: d, showCliente = true, onVerDetalle, onEditar, onReview, onInvalidar }) {
  const ts  = TIPO_DOC[d.tipoDoc]   ?? TIPO_DOC.otro
  const es  = ESTADO_DOC[d.estado]  ?? ESTADO_DOC.pendiente
  const canEdit     = ['pendiente', 'vigente'].includes(d.estado)
  const canReview   = d.estado === 'pendiente' && ['convenio_marco', 'vigencia_poderes'].includes(d.tipoDoc)
  const canInvalidar = d.estado === 'vigente'

  return (
    <tr className="group border-b last:border-0 hover:bg-gray-50/60 transition-colors"
      style={{ borderColor: 'var(--color-border)' }}>

      <td className="px-4 py-3">
        <span className="text-xs font-mono font-semibold text-gray-500">{d.id}</span>
      </td>

      {showCliente && (
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{d.clienteNombre}</p>
          <p className="text-[11px] text-gray-400">{d.clienteId}</p>
        </td>
      )}

      <td className="px-4 py-3">
        <span className={clsx('inline-block px-2 py-0.5 rounded text-[11px] font-medium', ts.bg, ts.text)}>
          {ts.label}
        </span>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm text-gray-700">{d.fechaFirma}</p>
      </td>

      <td className="px-4 py-3">
        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', es.bg, es.text)}>
          <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', es.dot)} />{es.label}
        </span>
        {d.invalidadoPor && (
          <p className="text-[10px] text-gray-400 mt-0.5">por {d.invalidadoPor}</p>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button title="Ver detalle" onClick={onVerDetalle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Eye size={14} />
          </button>
          {canEdit && (
            <button title="Editar documento" onClick={onEditar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
              <Pencil size={14} />
            </button>
          )}
          {canReview && (
            <button title="Registrar revisión legal" onClick={onReview}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <ClipboardCheck size={14} />
            </button>
          )}
          {canInvalidar && (
            <button title="Invalidar documento" onClick={onInvalidar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Ban size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
