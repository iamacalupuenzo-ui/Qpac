import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, User, Building2, Briefcase, Shield, FileText, AlertTriangle, CheckCircle2, Clock, XCircle, Upload, Pencil, Check, X, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import CuentasBancariasTab from './CuentasBancariasTab'
import ConveniosTab from './ConveniosTab'
import ArbolTraderTab from './ArbolTraderTab'
import ExcepcionesTab from './ExcepcionesTab'

/* ═══════════════════════════════════════════════
   STYLE MAPS (mirrors ClientesPage)
═══════════════════════════════════════════════ */
const TIPO_META = {
  PN:  { label: 'Persona Natural',                Icon: User,      bg: 'bg-slate-100',  text: 'text-slate-700'  },
  P10: { label: 'Pers. Natural c/ Negocio',       Icon: Briefcase, bg: 'bg-sky-100',    text: 'text-sky-700'    },
  PJ:  { label: 'Persona Jurídica',               Icon: Building2, bg: 'bg-indigo-100', text: 'text-indigo-700' },
  EF:  { label: 'Entidad Financiera',             Icon: Shield,    bg: 'bg-violet-100', text: 'text-violet-700' },
}

const ESTADO_META = {
  activo:          { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500',  label: 'Activo'                  },
  activo_proceso:  { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400',  label: 'Activo en proceso'        },
  pendiente_legal: { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-500',   label: 'Pendiente de aprobación'  },
  no_habilitado:   { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-400',    label: 'No habilitado'            },
}

const RIESGO_META = {
  estandar: { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Estándar'          },
  rf:       { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Régimen Reforzado'  },
}

const PLAFT_META = {
  conforme:   { bg: 'bg-green-50', text: 'text-green-700', label: 'Conforme'    },
  en_proceso: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En proceso'  },
}

const TIPO_DOC_LABEL = { DNI: 'DNI', CE: 'Carné de Extranjería', RUC: 'RUC' }

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 outline-none bg-white transition-all'
const selectCls = inputCls + ' cursor-pointer'

/* ═══════════════════════════════════════════════
   DATOS GENERALES TAB
═══════════════════════════════════════════════ */
function DatosGenerales({ cliente: c, modoEdicion, campos, onCampoChange }) {
  const d = modoEdicion && campos ? { ...c, ...campos } : c
  const tm = TIPO_META[d.tipo]    ?? TIPO_META.PN
  const em = ESTADO_META[d.estado] ?? ESTADO_META.activo
  const rm = RIESGO_META[d.riesgo] ?? RIESGO_META.estandar
  const pm = PLAFT_META[d.plaft]   ?? PLAFT_META.conforme

  return (
    <div className="space-y-4">

      {c.docsPendientes > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            {c.docsPendientes} documento{c.docsPendientes > 1 ? 's' : ''} pendiente{c.docsPendientes > 1 ? 's' : ''} de completar en el expediente del cliente.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg p-6" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 mr-4">
            {modoEdicion ? (
              <input
                value={campos.nombre}
                onChange={e => onCampoChange('nombre', e.target.value)}
                className={clsx(inputCls, 'text-base font-bold mb-1')}
                placeholder="Nombre completo..."
              />
            ) : (
              <div className="flex items-center gap-2.5 mb-1.5">
                <h2 className="text-lg font-bold text-gray-900">{d.nombre}</h2>
                <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0', tm.bg, tm.text)}>
                  <tm.Icon size={10} />{d.tipo}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400">{c.id}</p>
          </div>
          {!modoEdicion && (
            <div className="flex items-center gap-2 shrink-0">
              <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', em.bg, em.text)}>
                <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', em.dot)} />{em.label}
              </span>
              <span className={clsx('inline-block px-2 py-0.5 rounded text-[11px] font-medium', rm.bg, rm.text)}>
                {rm.label}
              </span>
            </div>
          )}
        </div>

        {modoEdicion ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Tipo de persona</label>
              <select value={campos.tipo} onChange={e => onCampoChange('tipo', e.target.value)} className={selectCls}>
                <option value="PN">Persona Natural (PN)</option>
                <option value="P10">Pers. Natural c/ Negocio (P10)</option>
                <option value="PJ">Persona Jurídica (PJ)</option>
                <option value="EF">Entidad Financiera (EF)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Estado habilitación</label>
              <select value={campos.estado ?? d.estado} onChange={e => onCampoChange('estado', e.target.value)} className={selectCls}>
                <option value="activo">Activo</option>
                <option value="activo_proceso">Activo en proceso</option>
                <option value="pendiente_legal">Pendiente de aprobación</option>
                <option value="no_habilitado">No habilitado</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Tipo de documento</label>
              <select value={campos.tipoDoc} onChange={e => onCampoChange('tipoDoc', e.target.value)} className={selectCls}>
                <option value="DNI">DNI</option>
                <option value="CE">Carné de Extranjería</option>
                <option value="RUC">RUC</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Perfil de riesgo</label>
              <select value={campos.riesgo} onChange={e => onCampoChange('riesgo', e.target.value)} className={selectCls}>
                <option value="estandar">Estándar</option>
                <option value="rf">Régimen Reforzado</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Número de documento</label>
              <input value={campos.doi} onChange={e => onCampoChange('doi', e.target.value)} className={clsx(inputCls, 'font-mono')} placeholder="N.º de documento..." />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">PLAFT</label>
              <select value={campos.plaft} onChange={e => onCampoChange('plaft', e.target.value)} className={selectCls}>
                <option value="conforme">Conforme</option>
                <option value="en_proceso">En proceso</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <InfoRow label="Tipo de persona"     value={tm.label} />
            <InfoRow label="Estado habilitación" value={em.label} badge={{ bg: em.bg, text: em.text }} />
            <InfoRow label="Tipo de documento"   value={TIPO_DOC_LABEL[d.tipoDoc] ?? d.tipoDoc} />
            <InfoRow label="Perfil de riesgo"    value={rm.label} badge={{ bg: rm.bg, text: rm.text }} />
            <InfoRow label="Número de documento" value={d.doi} mono />
            <InfoRow label="PLAFT"               value={pm.label} badge={{ bg: pm.bg, text: pm.text }} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-5" style={{ border: '1px solid var(--color-border)' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Registro</p>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
          <InfoRow label="Registrado por" value={c.registradoPor} />
          <InfoRow label="Fecha de registro" value={c.fecha} />
        </div>
      </div>

    </div>
  )
}

function InfoRow({ label, value, mono, badge }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      {badge ? (
        <span className={clsx('inline-block px-2 py-0.5 rounded text-[11px] font-medium', badge.bg, badge.text)}>
          {value}
        </span>
      ) : (
        <p className={clsx('text-sm text-gray-800', mono && 'font-mono')}>{value ?? '—'}</p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   DOCUMENTACIÓN TAB
═══════════════════════════════════════════════ */
const DOC_ESTADO = {
  entregado:  { bg: 'bg-green-50',  text: 'text-green-700', Icon: CheckCircle2, label: 'Entregado'   },
  pendiente:  { bg: 'bg-amber-50',  text: 'text-amber-700', Icon: Clock,        label: 'Pendiente'   },
  no_aplica:  { bg: 'bg-gray-100',  text: 'text-gray-500',  Icon: XCircle,      label: 'No aplica'   },
}

function DocEstadoBadge({ estado }) {
  const m = DOC_ESTADO[estado] ?? DOC_ESTADO.pendiente
  const Icon = m.Icon
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', m.bg, m.text)}>
      <Icon size={10} />{m.label}
    </span>
  )
}

function DocumentacionTab({ cliente: c, modoEdicion }) {
  const isPJ = ['PJ', 'EF'].includes(c.tipo)

  const docDefs = [
    { id: 1, nombre: 'Documento de identidad (DNI / CE)', estado: 'entregado', archivo: 'dni_cliente.pdf', obligatorio: true },
    { id: 2, nombre: 'Constancia de domicilio', estado: c.docsPendientes > 0 ? 'pendiente' : 'entregado', archivo: c.docsPendientes > 0 ? null : 'domicilio.pdf', obligatorio: true },
    { id: 3, nombre: isPJ ? 'Ficha RUC / Escritura de constitución' : 'Ficha RUC', estado: isPJ ? 'entregado' : 'no_aplica', archivo: isPJ ? 'ruc.pdf' : null, obligatorio: isPJ },
    { id: 4, nombre: 'Declaración jurada de origen de fondos', estado: 'entregado', archivo: 'djof.pdf', obligatorio: true },
    { id: 5, nombre: 'Estados financieros (último período)', estado: isPJ ? (c.docsPendientes > 0 ? 'pendiente' : 'entregado') : 'no_aplica', archivo: null, obligatorio: isPJ },
    { id: 6, nombre: 'Poderes notariales / Nombramiento de representantes', estado: isPJ ? 'entregado' : 'no_aplica', archivo: isPJ ? 'poderes.pdf' : null, obligatorio: isPJ },
  ]

  const opcionales = [
    ...(c.tipo === 'EF' ? [
      { id: 101, nombre: 'Convenio Marco de Operaciones', archivo: null },
      { id: 102, nombre: 'Vigencia de Poderes', archivo: null },
      { id: 103, nombre: 'DOI Representantes Legales', archivo: null },
    ] : []),
    { id: 199, nombre: 'Otros documentos', archivo: null },
  ]

  const allDefs = [...docDefs, ...opcionales]

  const [filesPerDoc, setFilesPerDoc] = useState(() => {
    const init = {}
    allDefs.forEach(d => {
      if (d.archivo) init[d.id] = [{ name: d.archivo, id: `${d.id}_0` }]
    })
    return init
  })

  function addFiles(docId, filenames) {
    setFilesPerDoc(prev => {
      const existing = prev[docId] ?? []
      const newFiles = filenames.map((name, i) => ({ name, id: `${docId}_${Date.now()}_${i}` }))
      return { ...prev, [docId]: [...existing, ...newFiles] }
    })
  }

  function removeFile(docId, fileId) {
    setFilesPerDoc(prev => {
      const remaining = (prev[docId] ?? []).filter(f => f.id !== fileId)
      if (remaining.length === 0) {
        const n = { ...prev }; delete n[docId]; return n
      }
      return { ...prev, [docId]: remaining }
    })
  }

  const docsRequeridos = docDefs.filter(d => d.estado !== 'no_aplica')
  const entregados = docsRequeridos.filter(d => d.estado === 'entregado' || filesPerDoc[d.id]?.length > 0).length
  const pendientes = docsRequeridos.filter(d => d.estado === 'pendiente' && !filesPerDoc[d.id]?.length).length
  const total      = docsRequeridos.length

  return (
    <div className="space-y-4">
      {pendientes > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            {pendientes} documento{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''} de completar en el expediente.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg p-5" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Expediente documental</p>
          <span className="text-xs text-gray-400">{entregados} / {total} documentos entregados</span>
        </div>

        <div className="space-y-2">
          {docDefs.map(doc => {
            if (doc.estado === 'no_aplica') return null
            const files = filesPerDoc[doc.id] ?? []
            const isLoaded = files.length > 0
            return (
              <DocRow key={doc.id} doc={doc} files={files} isLoaded={isLoaded}
                modoEdicion={modoEdicion}
                onUpload={filenames => addFiles(doc.id, filenames)}
                onRemove={fileId => removeFile(doc.id, fileId)} />
            )
          })}
        </div>

        {opcionales.length > 0 && (
          <div className="mt-6 pt-4 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Documentos opcionales</p>
            {opcionales.map(doc => {
              const files = filesPerDoc[doc.id] ?? []
              const isLoaded = files.length > 0
              return (
                <DocRow key={doc.id} doc={{ ...doc, estado: 'opcional', obligatorio: false }} files={files} isLoaded={isLoaded}
                  modoEdicion={modoEdicion}
                  onUpload={filenames => addFiles(doc.id, filenames)}
                  onRemove={fileId => removeFile(doc.id, fileId)} />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function DocRow({ doc, files, isLoaded, modoEdicion, onUpload, onRemove }) {
  const fileRef = useRef(null)

  return (
    <div>
      <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
        style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={13} className="text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-gray-800 truncate">
              {doc.nombre}
              {doc.obligatorio && <span className="text-red-400 ml-0.5 text-[11px]">*</span>}
            </p>
            {files.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">{files.length} archivo(s)</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DocEstadoBadge estado={isLoaded ? 'entregado' : doc.estado} />
          {modoEdicion && (
            <>
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
                <Upload size={11} /> {isLoaded ? 'Subir otro' : 'Subir'}
              </button>
              <input ref={fileRef} type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => {
                  const selected = Array.from(e.target.files ?? [])
                  if (selected.length) onUpload(selected.map(f => f.name))
                  e.target.value = ''
                }} />
            </>
          )}
        </div>
      </div>
      {files.length > 0 && (
        <div className="ml-9 pb-2 mt-2 pt-1 space-y-1.5 border-t border-dashed border-gray-100">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              <FileText size={10} className="shrink-0 text-gray-400" />
              <span className="truncate">{f.name}</span>
              {modoEdicion && (
                <button onClick={() => onRemove(f.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0 ml-1" title="Eliminar archivo">
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   VALIDACIÓN PLAFT TAB
═══════════════════════════════════════════════ */
const PLAFT_CHECK_META = {
  conforme:   { bg: 'bg-green-50',  text: 'text-green-700',  Icon: CheckCircle2, label: 'Conforme'   },
  en_proceso: { bg: 'bg-amber-50',  text: 'text-amber-700',  Icon: Clock,        label: 'En proceso' },
  pendiente:  { bg: 'bg-gray-100',  text: 'text-gray-500',   Icon: Clock,        label: 'Pendiente'  },
  observado:  { bg: 'bg-red-50',    text: 'text-red-700',    Icon: AlertTriangle, label: 'Observado' },
}

function PlaftBadge({ estado }) {
  const m = PLAFT_CHECK_META[estado] ?? PLAFT_CHECK_META.pendiente
  const Icon = m.Icon
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', m.bg, m.text)}>
      <Icon size={10} />{m.label}
    </span>
  )
}

function ValidacionPlaftTab({ cliente: c, modoEdicion }) {
  const baseControles = [
    { id: 1, nombre: 'Listas restrictivas (OFAC, ONU, UIF)', estado: 'conforme',   fecha: c.fecha, responsable: 'Sistema automático' },
    { id: 2, nombre: 'PEP — Persona Expuesta Políticamente',  estado: c.plaft === 'en_proceso' ? 'en_proceso' : 'conforme', fecha: c.fecha, responsable: 'Oficial de Cumplimiento' },
    { id: 3, nombre: 'Declaración jurada PLAFT firmada',       estado: 'conforme',   fecha: c.fecha, responsable: 'Marco Quispe L.' },
    { id: 4, nombre: 'Perfil económico del cliente',           estado: c.plaft === 'en_proceso' ? 'pendiente' : 'conforme', fecha: c.plaft !== 'en_proceso' ? c.fecha : null, responsable: c.plaft !== 'en_proceso' ? 'Oficial de Cumplimiento' : null },
    { id: 5, nombre: 'Visita de verificación (RF)',            estado: c.riesgo === 'rf' ? (c.plaft === 'en_proceso' ? 'en_proceso' : 'conforme') : 'no_aplica', fecha: null, responsable: null },
  ].filter(ctrl => ctrl.estado !== 'no_aplica')

  const [controlesEdit, setControlesEdit] = useState(baseControles)

  useEffect(() => { setControlesEdit(baseControles) }, [c.id])

  function setControlEstado(id, estado) {
    setControlesEdit(prev => prev.map(ctrl => ctrl.id === id ? { ...ctrl, estado } : ctrl))
  }

  const controles = modoEdicion ? controlesEdit : baseControles
  const pm = PLAFT_META[c.plaft] ?? PLAFT_META.conforme
  const rm = RIESGO_META[c.riesgo] ?? RIESGO_META.estandar

  return (
    <div className="space-y-4">

      <div className="bg-white rounded-lg p-5" style={{ border: '1px solid var(--color-border)' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Perfil de cumplimiento</p>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <InfoRow label="Estado PLAFT" value={pm.label} badge={{ bg: pm.bg, text: pm.text }} />
          <InfoRow label="Perfil de riesgo" value={rm.label} badge={{ bg: rm.bg, text: rm.text }} />
          <InfoRow label="Oficial de cumplimiento" value="Dra. Lucía Vargas" />
          <InfoRow label="Última revisión" value={c.fecha} />
        </div>
      </div>

      <div className="bg-white rounded-lg p-5" style={{ border: '1px solid var(--color-border)' }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Controles de debida diligencia</p>
        <div className="space-y-0">
          {controles.map((ctrl, i) => (
            <div key={ctrl.id} className={clsx('flex items-start justify-between gap-4 py-3', i < controles.length - 1 && 'border-b')}
              style={{ borderColor: 'var(--color-border)' }}>
              <div className="min-w-0">
                <p className="text-sm text-gray-800">{ctrl.nombre}</p>
                {ctrl.responsable && (
                  <p className="text-[11px] text-gray-400 mt-0.5">{ctrl.responsable}{ctrl.fecha ? ` · ${ctrl.fecha}` : ''}</p>
                )}
              </div>
              {modoEdicion ? (
                <select
                  value={ctrl.estado}
                  onChange={e => setControlEstado(ctrl.id, e.target.value)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 focus:border-blue-400 outline-none bg-white cursor-pointer shrink-0">
                  <option value="conforme">Conforme</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="observado">Observado</option>
                </select>
              ) : (
                <PlaftBadge estado={ctrl.estado} />
              )}
            </div>
          ))}
        </div>
      </div>

      {c.riesgo === 'rf' && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-orange-50" style={{ border: '1px solid #fed7aa' }}>
          <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700 leading-relaxed">
            <span className="font-semibold">Régimen Reforzado activo.</span> Este cliente requiere controles adicionales y aprobación del Oficial de Cumplimiento para cualquier operación.
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CLIENTE DETALLE
═══════════════════════════════════════════════ */
const TABS_EDITABLES = ['datos', 'documentos', 'plaft']

export default function ClienteDetalle({ cliente, activeTab, onBack }) {
  const [modoEdicion, setModoEdicion] = useState(false)
  const [campos, setCampos]           = useState(null)

  /* Al cambiar de tab, salir del modo edición */
  useEffect(() => {
    setModoEdicion(false)
    setCampos(null)
  }, [activeTab])

  function iniciarEdicion() {
    setCampos({
      nombre:  cliente.nombre,
      tipo:    cliente.tipo,
      tipoDoc: cliente.tipoDoc,
      doi:     cliente.doi,
      riesgo:  cliente.riesgo,
      plaft:   cliente.plaft,
      estado:  cliente.estado,
    })
    setModoEdicion(true)
  }

  function cancelarEdicion() {
    setCampos(null)
    setModoEdicion(false)
  }

  function guardarEdicion() {
    /* En producción: llamada a la API con `campos` */
    setCampos(null)
    setModoEdicion(false)
  }

  function onCampoChange(campo, valor) {
    setCampos(prev => ({ ...prev, [campo]: valor }))
  }

  if (!cliente) return null

  const mostrarEdicion = TABS_EDITABLES.includes(activeTab)

  return (
    <div>
      {/* Breadcrumb + acciones edición */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={13} /> Volver a cartera de clientes
        </button>

        {mostrarEdicion && (
          modoEdicion ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <Pencil size={11} /> Modo edición activo
              </span>
              <button
                onClick={guardarEdicion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                <Check size={12} /> Guardar cambios
              </button>
              <button
                onClick={cancelarEdicion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <X size={12} /> Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={iniciarEdicion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <Pencil size={12} /> Editar
            </button>
          )
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'datos'       && <DatosGenerales cliente={cliente} modoEdicion={modoEdicion} campos={campos} onCampoChange={onCampoChange} />}
      {activeTab === 'documentos'  && <DocumentacionTab cliente={cliente} modoEdicion={modoEdicion} />}
      {activeTab === 'plaft'       && <ValidacionPlaftTab cliente={cliente} modoEdicion={modoEdicion} />}
      {activeTab === 'cuentas'     && <CuentasBancariasTab clienteId={cliente.id} clienteNombre={cliente.nombre} />}
      {activeTab === 'convenios'   && <ConveniosTab clienteId={cliente.id} clienteNombre={cliente.nombre} />}
      {activeTab === 'asignacion'  && <ArbolTraderTab clienteId={cliente.id} clienteNombre={cliente.nombre} />}
      {activeTab === 'excepciones' && <ExcepcionesTab clienteId={cliente.id} clienteNombre={cliente.nombre} clienteTipo={cliente.tipo} />}
    </div>
  )
}
