import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, Plus, X, CheckCircle2, Clock, ShieldOff, FileWarning, RefreshCw, Info, ChevronDown, Search, Check } from 'lucide-react'
import clsx from 'clsx'

/* ═══════════════════════════════════════════════
   SEARCH HELPERS
═══════════════════════════════════════════════ */
function normalize(str) {
  return (str ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function SearchableSelect({ value, onChange, options, placeholder, error }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const ref      = useRef(null)
  const selected = options.find(o => o.value === value)

  const filtered = query.trim()
    ? options.filter(o =>
        normalize(o.label).includes(normalize(query)) ||
        normalize(o.sub ?? '').includes(normalize(query))
      )
    : options

  useEffect(() => {
    if (!open) return
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function handleOpen() {
    setOpen(true); setQuery('')
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  function handleSelect(val) { onChange(val); setOpen(false); setQuery('') }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={handleOpen}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all bg-white',
          error ? 'border-red-400' : open ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
        )}>
        <span className={clsx('flex-1 truncate text-sm', selected ? 'text-gray-900' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} className={clsx('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-50 overflow-hidden"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <Search size={12} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
            {query && (
              <button onMouseDown={e => { e.preventDefault(); setQuery('') }}
                className="text-gray-300 hover:text-gray-500 transition-colors">
                <X size={11} />
              </button>
            )}
          </div>
          <div className="py-1 overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-gray-400 text-center">Sin resultados</p>
            ) : filtered.map(o => (
              <button key={o.value} type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(o.value) }}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                  o.value === value ? 'bg-blue-50' : 'hover:bg-gray-50'
                )}>
                <div className="min-w-0">
                  <p className={clsx('text-sm truncate', o.value === value ? 'text-blue-700 font-medium' : 'text-gray-800')}>{o.label}</p>
                  {o.sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{o.sub}</p>}
                </div>
                {o.value === value && <Check size={12} className="text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function addDays(base, n) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
function todayStr() { return new Date().toISOString().split('T')[0] }
function diffDays(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000) }
function fmtDate(d) {
  if (!d) return '—'
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y}`
}
let _nextId = 10
function nextId() { return `EXC-${String(++_nextId).padStart(3, '0')}` }

/* ═══════════════════════════════════════════════
   CATÁLOGO DE EXCEPCIONES
═══════════════════════════════════════════════ */
const TIPOS = {
  dj_origen_fondos:       { label: 'DJ Origen de Fondos',             dias: 15, aplica: ['PN','P10','PJ','EF'], operativa: false, desc: 'Sin presentación de Declaración Jurada de Origen de Fondos'             },
  convenio_marco_pj:      { label: 'Convenio Marco (PJ)',             dias: 30, aplica: ['PJ','EF'],             operativa: false, desc: 'Sin convenio marco firmado para persona jurídica'                       },
  vigencia_poderes_ext:   { label: 'Vigencia de Poderes Expirada',    dias: 30, aplica: ['PJ','EF'],             operativa: false, desc: 'Poderes notariales del representante legal con vigencia expirada'        },
  fondos_cheque_gerencia: { label: 'Fondos por Cheque de Gerencia',   dias:  5, aplica: ['PN','P10','PJ','EF'], operativa: true,  desc: 'Fondos presentados mediante cheque de gerencia pendiente de acreditación' },
  fondos_ventanilla:      { label: 'Fondos por Operación Ventanilla', dias:  3, aplica: ['PN','P10','PJ','EF'], operativa: true,  desc: 'Fondos por operación de ventanilla en proceso de verificación'           },
}

/* ═══════════════════════════════════════════════
   ESTADOS
═══════════════════════════════════════════════ */
const ESTADO_META = {
  solicitada:  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Solicitada'   },
  activa:      { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Activa'       },
  por_vencer:  { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Por vencer'   },
  vencida:     { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Vencida'      },
  bloqueada:   { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Bloqueada'    },
  regularizada:{ bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400',   label: 'Regularizada' },
  rechazada:   { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400',    label: 'Rechazada'    },
}

function computeEstado(exc) {
  if (['regularizada','rechazada'].includes(exc.estado)) return exc.estado
  if (exc.estado === 'solicitada') return 'solicitada'
  const t = todayStr()
  const venc = exc.fechaVencimiento
  if (!venc) return 'activa'
  const dias = diffDays(t, venc)        // positive = días restantes, negative = días vencida
  if (dias < -7) return 'bloqueada'
  if (dias < 0)  return 'vencida'
  if (dias <= 3) return 'por_vencer'
  return 'activa'
}

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const T = todayStr()
const INIT_EXCEPCIONES = {
  'CLI-002': [
    {
      id: 'EXC-001',
      tipo: 'dj_origen_fondos',
      estado: 'activa',
      fechaSolicitud: addDays(T, -5),
      fechaInicio:    addDays(T, -4),
      fechaVencimiento: addDays(T, 2),    // 2 días restantes → por_vencer / AL-GC-04
      motivo: 'Cliente en proceso de obtención de la DJ firmada ante notario. Solicita plazo para regularizar.',
      solicitadoPor: 'María Torres',
      autorizadoPor: 'Javier Mendoza (Head de Mesa)',
      fechaAutorizacion: addDays(T, -4),
      fechaRegularizacion: null,
      motivoRechazo: null,
    },
  ],
  'CLI-003': [
    {
      id: 'EXC-002',
      tipo: 'fondos_cheque_gerencia',
      estado: 'activa',
      fechaSolicitud: addDays(T, -13),
      fechaInicio:    addDays(T, -12),
      fechaVencimiento: addDays(T, -9),   // 9 días vencida → bloqueada / AL-GC-05
      motivo: 'Cheque de gerencia del BCP pendiente de acreditación en cuenta Soles.',
      solicitadoPor: 'Luis Fernández',
      autorizadoPor: 'Javier Mendoza (Head de Mesa)',
      fechaAutorizacion: addDays(T, -12),
      fechaRegularizacion: null,
      motivoRechazo: null,
    },
    {
      id: 'EXC-003',
      tipo: 'convenio_marco_pj',
      estado: 'regularizada',
      fechaSolicitud: addDays(T, -46),
      fechaInicio:    addDays(T, -45),
      fechaVencimiento: addDays(T, -15),
      motivo: 'Convenio en revisión legal pendiente de firma por el directorio.',
      solicitadoPor: 'María Torres',
      autorizadoPor: 'Javier Mendoza (Head de Mesa)',
      fechaAutorizacion: addDays(T, -45),
      fechaRegularizacion: addDays(T, -16),
      motivoRechazo: null,
    },
  ],
  'CLI-007': [
    {
      id: 'EXC-004',
      tipo: 'vigencia_poderes_ext',
      estado: 'solicitada',
      fechaSolicitud: T,
      fechaInicio: null,
      fechaVencimiento: null,
      motivo: 'Poderes notariales del representante legal enviados a notaría para renovación urgente.',
      solicitadoPor: 'María Torres',
      autorizadoPor: null,
      fechaAutorizacion: null,
      fechaRegularizacion: null,
      motivoRechazo: null,
    },
  ],
}

/* ═══════════════════════════════════════════════
   BADGE
═══════════════════════════════════════════════ */
function EstadoBadge({ estado }) {
  const m = ESTADO_META[estado] ?? ESTADO_META.activa
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', m.bg, m.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', m.dot)} />{m.label}
    </span>
  )
}

/* ═══════════════════════════════════════════════
   DRAWER — Nueva / ver excepción
═══════════════════════════════════════════════ */
const EMPTY_FORM = { tipo: '', motivo: '' }

function ExcepcionDrawer({ open, clienteTipo, excepcionesActivas, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function reset() { setForm(EMPTY_FORM); setErrors({}) }

  function handleClose() { reset(); onClose() }

  function tiposDisponibles() {
    return Object.entries(TIPOS)
      .filter(([, t]) => t.aplica.includes(clienteTipo))
      .map(([id, t]) => ({ id, ...t }))
  }

  const tipoMeta = form.tipo ? TIPOS[form.tipo] : null

  /* Regla de no-acumulación: DJ Origen de Fondos y excepción operativa no pueden coexistir */
  function getIncompatibilidad() {
    if (!form.tipo) return null
    const activas = excepcionesActivas.map(e => e.tipo)
    const nuevoEsOperativo = TIPOS[form.tipo]?.operativa
    const tieneOperativaActiva = activas.some(t => TIPOS[t]?.operativa)
    const tieneDJActiva = activas.includes('dj_origen_fondos')
    if (nuevoEsOperativo && tieneDJActiva) return 'No se puede registrar una excepción operativa mientras existe una DJ Origen de Fondos activa.'
    if (form.tipo === 'dj_origen_fondos' && tieneOperativaActiva) return 'No se puede registrar DJ Origen de Fondos mientras existe una excepción operativa activa.'
    return null
  }

  const incompatibilidad = getIncompatibilidad()

  function validate() {
    const e = {}
    if (!form.tipo) e.tipo = 'Seleccione un tipo de excepción.'
    if (incompatibilidad) e.tipo = incompatibilidad
    if (!form.motivo.trim()) e.motivo = 'El motivo es obligatorio.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({
      id: nextId(),
      tipo: form.tipo,
      estado: 'solicitada',
      fechaSolicitud: T,
      fechaInicio: null,
      fechaVencimiento: null,
      motivo: form.motivo.trim(),
      solicitadoPor: 'María Torres',
      autorizadoPor: null,
      fechaAutorizacion: null,
      fechaRegularizacion: null,
      motivoRechazo: null,
    })
    reset()
    onClose()
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={handleClose} />}
      <div
        className="fixed top-0 right-0 h-full z-50 bg-white flex flex-col"
        style={{
          width: 420,
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.22s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold text-gray-900">Solicitar excepción documentaria</h2>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Info note */}
          <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-blue-50" style={{ border: '1px solid #bfdbfe' }}>
            <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              La excepción quedará en estado <strong>Solicitada</strong> hasta que el Head de Mesa o Gerente la autorice.
              Las operaciones podrán procesarse una vez activada.
            </p>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Tipo de excepción <span className="text-red-400">*</span>
            </label>
            <SearchableSelect
              value={form.tipo}
              onChange={v => { setForm(f => ({ ...f, tipo: v })); setErrors({}) }}
              placeholder="Buscar tipo de excepción..."
              error={errors.tipo}
              options={tiposDisponibles().map(t => ({
                value: t.id,
                label: t.label,
                sub:   `${t.dias} días · ${t.operativa ? 'Operativa' : 'Documentaria'}`,
              }))}
            />
            {errors.tipo && <p className="text-[11px] text-red-500 mt-1">{errors.tipo}</p>}
          </div>

          {/* Tipo detail */}
          {tipoMeta && !incompatibilidad && (
            <div className="px-3 py-3 rounded-lg bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-[11px] font-medium text-gray-700 mb-1">{tipoMeta.label}</p>
              <p className="text-[11px] text-gray-500 mb-2">{tipoMeta.desc}</p>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-500">Vigencia: <strong className="text-gray-700">{tipoMeta.dias} días calendario</strong></span>
                {tipoMeta.operativa && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Excepción operativa</span>
                )}
              </div>
            </div>
          )}

          {/* Non-accumulation warning */}
          {incompatibilidad && (
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
              <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700 leading-relaxed">{incompatibilidad}</p>
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Motivo <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={form.motivo}
              onChange={e => { setForm(f => ({ ...f, motivo: e.target.value })); setErrors({}) }}
              placeholder="Describa el motivo por el cual se solicita esta excepción…"
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all resize-none',
                errors.motivo ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              )}
            />
            {errors.motivo && <p className="text-[11px] text-red-500 mt-1">{errors.motivo}</p>}
          </div>

          <div className="px-3 py-2.5 rounded-lg bg-gray-50 text-[11px] text-gray-500" style={{ border: '1px solid var(--color-border)' }}>
            Fecha de solicitud: <strong className="text-gray-700">{fmtDate(T)}</strong> · Registrado por: <strong className="text-gray-700">María Torres</strong>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleSave}
            disabled={!!incompatibilidad}
            className={clsx(
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors',
              incompatibilidad
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            Enviar solicitud
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   RECHAZAR MODAL
═══════════════════════════════════════════════ */
function RechazarModal({ open, excepcion, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('')
  const [err, setErr] = useState('')

  function handleConfirm() {
    if (!motivo.trim()) { setErr('El motivo de rechazo es obligatorio.'); return }
    onConfirm(excepcion.id, motivo.trim())
    setMotivo(''); setErr('')
    onClose()
  }

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed z-50 bg-white rounded-xl shadow-xl" style={{ top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:380, border:'1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--color-border)' }}>
          <h2 className="text-sm font-semibold text-gray-900">Rechazar excepción</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {excepcion && (
            <p className="text-xs text-gray-500">Excepción: <strong className="text-gray-700">{TIPOS[excepcion.tipo]?.label}</strong></p>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Motivo del rechazo <span className="text-red-400">*</span></label>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setErr('') }}
              className={clsx('w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none resize-none', err ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')}
              placeholder="Motivo por el cual se rechaza la solicitud…"
            />
            {err && <p className="text-[11px] text-red-500 mt-1">{err}</p>}
          </div>
        </div>
        <div className="px-5 py-3.5 border-t flex gap-2" style={{ borderColor:'var(--color-border)' }}>
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Confirmar rechazo</button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   EXCEPCIÓN CARD
═══════════════════════════════════════════════ */
function ExcepcionCard({ exc, onAutorizar, onRechazar, onRegularizar }) {
  const estadoReal = computeEstado(exc)
  const tipo = TIPOS[exc.tipo] ?? {}
  const estadoMeta = ESTADO_META[estadoReal]

  const diasRestantes = exc.fechaVencimiento ? diffDays(todayStr(), exc.fechaVencimiento) : null
  const alGC04 = estadoReal === 'por_vencer'
  const alGC05 = estadoReal === 'bloqueada' || estadoReal === 'vencida'

  return (
    <div className={clsx(
      'rounded-lg p-4 space-y-3',
      alGC05 ? 'bg-red-50'   : alGC04 ? 'bg-amber-50' : 'bg-white'
    )} style={{ border: `1px solid ${alGC05 ? '#fca5a5' : alGC04 ? '#fcd34d' : 'var(--color-border)'}` }}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold text-gray-900">{tipo.label ?? exc.tipo}</p>
            <EstadoBadge estado={estadoReal} />
            {tipo.operativa && (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Operativa</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">{exc.id} · Solicitado el {fmtDate(exc.fechaSolicitud)}</p>
        </div>

        {/* Días restantes pill */}
        {diasRestantes !== null && !['regularizada','rechazada'].includes(estadoReal) && (
          <div className={clsx(
            'shrink-0 text-center px-3 py-1.5 rounded-lg',
            diasRestantes < 0 ? 'bg-red-100' : diasRestantes <= 3 ? 'bg-amber-100' : 'bg-green-50'
          )}>
            <p className={clsx('text-base font-bold leading-none', diasRestantes < 0 ? 'text-red-700' : diasRestantes <= 3 ? 'text-amber-700' : 'text-green-700')}>
              {diasRestantes < 0 ? Math.abs(diasRestantes) : diasRestantes}
            </p>
            <p className={clsx('text-[10px] mt-0.5', diasRestantes < 0 ? 'text-red-500' : diasRestantes <= 3 ? 'text-amber-500' : 'text-green-500')}>
              {diasRestantes < 0 ? 'días vencida' : 'días restantes'}
            </p>
          </div>
        )}
      </div>

      {/* Motivo */}
      <p className="text-xs text-gray-600 leading-relaxed">{exc.motivo}</p>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
        <span className="text-gray-400">Vigencia: <strong className="text-gray-700">{tipo.dias ?? '—'} días</strong></span>
        {exc.fechaVencimiento && <span className="text-gray-400">Vence: <strong className="text-gray-700">{fmtDate(exc.fechaVencimiento)}</strong></span>}
        {exc.fechaInicio && <span className="text-gray-400">Inicio: <strong className="text-gray-700">{fmtDate(exc.fechaInicio)}</strong></span>}
        {exc.autorizadoPor && <span className="text-gray-400">Autorizado por: <strong className="text-gray-700">{exc.autorizadoPor}</strong></span>}
        {exc.solicitadoPor && <span className="text-gray-400">Solicitado por: <strong className="text-gray-700">{exc.solicitadoPor}</strong></span>}
        {exc.fechaRegularizacion && <span className="text-gray-400">Regularizado: <strong className="text-gray-700">{fmtDate(exc.fechaRegularizacion)}</strong></span>}
        {exc.motivoRechazo && <span className="col-span-2 text-gray-400">Motivo rechazo: <strong className="text-red-600">{exc.motivoRechazo}</strong></span>}
      </div>

      {/* Alert banners */}
      {alGC04 && (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded bg-amber-100 border border-amber-300">
          <AlertTriangle size={12} className="text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700 font-medium">AL-GC-04 — Excepción próxima a vencer. Regularizar antes de que expire.</p>
        </div>
      )}
      {alGC05 && (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded bg-red-100 border border-red-300">
          <ShieldOff size={12} className="text-red-600 shrink-0" />
          <p className="text-[11px] text-red-700 font-medium">
            {estadoReal === 'bloqueada'
              ? 'AL-GC-05 — Excepción vencida más de 7 días. Cliente bloqueado para nuevas operaciones.'
              : 'AL-GC-04/05 — Excepción vencida. Regularizar para evitar bloqueo operativo.'}
          </p>
        </div>
      )}

      {/* Actions */}
      {estadoReal === 'solicitada' && (
        <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-[11px] text-gray-400 flex-1">Pendiente de autorización</p>
          <button
            onClick={() => onAutorizar(exc.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold transition-colors"
          >
            <CheckCircle2 size={11} /> Autorizar
          </button>
          <button
            onClick={() => onRechazar(exc)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold border border-red-200 transition-colors"
          >
            <X size={11} /> Rechazar
          </button>
        </div>
      )}

      {(estadoReal === 'por_vencer' || estadoReal === 'vencida' || estadoReal === 'bloqueada') && (
        <div className="flex items-center justify-end pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => onRegularizar(exc.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors"
          >
            <RefreshCw size={11} /> Regularizar excepción
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN TAB
═══════════════════════════════════════════════ */
export default function ExcepcionesTab({ clienteId, clienteNombre, clienteTipo = 'PN' }) {
  const [excepciones, setExcepciones] = useState(
    () => JSON.parse(JSON.stringify(INIT_EXCEPCIONES[clienteId] ?? []))
  )
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [rechazarExc,  setRechazarExc]  = useState(null)
  const [histVisible,  setHistVisible]  = useState(false)

  /* Partitions */
  const activas    = excepciones.filter(e => !['regularizada','rechazada'].includes(computeEstado(e)))
  const historial  = excepciones.filter(e =>  ['regularizada','rechazada'].includes(computeEstado(e)))
  const bloqueadas = activas.filter(e => computeEstado(e) === 'bloqueada')
  const porVencer  = activas.filter(e => computeEstado(e) === 'por_vencer')

  /* Stats */
  const stats = [
    { label: 'Activas',       value: activas.filter(e => ['activa','por_vencer'].includes(computeEstado(e))).length,  color: 'text-green-700'  },
    { label: 'Solicitadas',   value: activas.filter(e => computeEstado(e) === 'solicitada').length,                   color: 'text-blue-700'   },
    { label: 'Por vencer',    value: porVencer.length,                                                                color: 'text-amber-700'  },
    { label: 'Bloqueadas',    value: bloqueadas.length,                                                               color: 'text-red-700'    },
    { label: 'Regularizadas', value: historial.filter(e => computeEstado(e) === 'regularizada').length,               color: 'text-gray-600'   },
  ]

  function handleAutorizar(excId) {
    setExcepciones(prev => prev.map(e => {
      if (e.id !== excId) return e
      const tipo = TIPOS[e.tipo]
      const inicio = T
      return {
        ...e,
        estado: 'activa',
        fechaInicio: inicio,
        fechaVencimiento: addDays(inicio, tipo?.dias ?? 15),
        autorizadoPor: 'Javier Mendoza (Head de Mesa)',
        fechaAutorizacion: T,
      }
    }))
  }

  function handleRechazar(excId, motivo) {
    setExcepciones(prev => prev.map(e =>
      e.id === excId ? { ...e, estado: 'rechazada', motivoRechazo: motivo } : e
    ))
  }

  function handleRegularizar(excId) {
    setExcepciones(prev => prev.map(e =>
      e.id === excId ? { ...e, estado: 'regularizada', fechaRegularizacion: T } : e
    ))
  }

  function handleNueva(exc) {
    setExcepciones(prev => [...prev, exc])
  }

  return (
    <div className="space-y-4">

      {/* AL-GC-05 banner */}
      {bloqueadas.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
          <ShieldOff size={14} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-700">AL-GC-05 — Cliente bloqueado para nuevas operaciones</p>
            <p className="text-[11px] text-red-600 mt-0.5">
              Existen {bloqueadas.length} excepción{bloqueadas.length > 1 ? 'es' : ''} vencida{bloqueadas.length > 1 ? 's' : ''} hace más de 7 días sin regularizar. Se requiere acción inmediata.
            </p>
          </div>
        </div>
      )}

      {/* AL-GC-04 banner */}
      {porVencer.length > 0 && bloqueadas.length === 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
          <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium">
            AL-GC-04 — {porVencer.length} excepción{porVencer.length > 1 ? 'es' : ''} próxima{porVencer.length > 1 ? 's' : ''} a vencer. Regularizar antes del vencimiento para evitar bloqueo.
          </p>
        </div>
      )}

      {/* Header + stats */}
      <div className="bg-white rounded-lg p-4" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Excepciones documentarias</p>
            {clienteNombre && <p className="text-[11px] text-gray-400 mt-0.5">{clienteNombre}</p>}
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            disabled={bloqueadas.length > 0}
            title={bloqueadas.length > 0 ? 'No se pueden solicitar nuevas excepciones con AL-GC-05 activo' : ''}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              bloqueadas.length > 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            <Plus size={13} /> Nueva excepción
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className={clsx('text-xl font-bold leading-none', s.color)}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Excepciones activas / pendientes */}
      {activas.length === 0 && (
        <div className="flex items-center justify-center h-32 bg-white rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
          <div className="text-center">
            <FileWarning size={20} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Sin excepciones documentarias activas</p>
          </div>
        </div>
      )}

      {activas.map(exc => (
        <ExcepcionCard
          key={exc.id}
          exc={exc}
          onAutorizar={handleAutorizar}
          onRechazar={setRechazarExc}
          onRegularizar={handleRegularizar}
        />
      ))}

      {/* Historial */}
      {historial.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setHistVisible(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span className="uppercase tracking-wide">Historial ({historial.length})</span>
            <ChevronDown size={13} className={clsx('transition-transform', histVisible && 'rotate-180')} />
          </button>
          {histVisible && (
            <div className="border-t space-y-0" style={{ borderColor: 'var(--color-border)' }}>
              {historial.map((exc, i) => {
                const estadoReal = computeEstado(exc)
                const tipo = TIPOS[exc.tipo] ?? {}
                const estadoMeta = ESTADO_META[estadoReal] ?? ESTADO_META.regularizada
                return (
                  <div key={exc.id} className={clsx('flex items-start gap-4 px-4 py-3', i < historial.length - 1 && 'border-b')} style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-gray-700">{tipo.label ?? exc.tipo}</p>
                        <EstadoBadge estado={estadoReal} />
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Solicitado {fmtDate(exc.fechaSolicitud)}
                        {exc.fechaRegularizacion ? ` · Regularizado ${fmtDate(exc.fechaRegularizacion)}` : ''}
                        {exc.motivoRechazo ? ` · Rechazado: ${exc.motivoRechazo}` : ''}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{exc.id}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Drawer */}
      <ExcepcionDrawer
        open={drawerOpen}
        clienteTipo={clienteTipo}
        excepcionesActivas={activas}
        onClose={() => setDrawerOpen(false)}
        onSave={handleNueva}
      />

      {/* Rechazar modal */}
      <RechazarModal
        open={!!rechazarExc}
        excepcion={rechazarExc}
        onClose={() => setRechazarExc(null)}
        onConfirm={handleRechazar}
      />
    </div>
  )
}
