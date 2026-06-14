import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Search, X, AlertTriangle, ChevronDown, Check,
  Eye, Info, Ban, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Clock, Filter, Plus, Pencil, ShieldCheck, Send,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtDate, fmtMoney, fmtTC } from '../../utils/format.js'
import CotizacionWizard from './CotizacionWizard'
import ConfirmarAbonoWizard from './ConfirmarAbonoWizard'
import SubsanacionWizard from './SubsanacionWizard'
import RevisionBackOfficeWizard from './RevisionBackOfficeWizard'
import ReaperturaDrawer from './ReaperturaDrawer'

/* ═══════════════════════════════════════════════
   CATÁLOGO DE CAUSAS
═══════════════════════════════════════════════ */
const CAUSAS = [
  { id: 'error_operativo',             label: 'Error operativo',             desc: 'Datos incorrectos en la operación (tipo, monto, TC, cuentas).' },
  { id: 'cliente_desiste',             label: 'Cliente desiste',             desc: 'El cliente retira la operación antes de realizar la transferencia.' },
  { id: 'error_datos_criticos',        label: 'Error en datos críticos',     desc: 'El cliente identificado no corresponde al abono recibido.' },
  { id: 'transferencia_mal_ejecutada', label: 'Transferencia mal ejecutada', desc: 'Error en la ejecución bancaria detectado antes de la liquidación.' },
]

/* ═══════════════════════════════════════════════
   ESTADOS
═══════════════════════════════════════════════ */
const ESTADO_META = {
  reservada:   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Reservada',   anulable: true  },
  observada:   { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Observada',   anulable: true  },
  en_revision: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'En revisión', anulable: false },
  subsanada:   { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   label: 'Subsanada',   anulable: false },
  liquidada:          { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Liquidada',           anulable: false },
  pendiente_reapertura: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', label: 'Pend. Reapertura',    anulable: false },
  anulada:             { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Anulada',             anulable: false },
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function todayStr() { return new Date().toISOString().split('T')[0] }
function subDays(n) {
  const d = new Date(todayStr())
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
const T = todayStr()

/* Correlativo para nuevas ops desde el wizard */
let _seq = 9
function nextCorr() { _seq++; return `OP-2026-${String(_seq).padStart(3, '0')}` }

/* Usuario Back Office activo (mock — reemplazar por contexto de autenticación real) */
const MOCK_BO_USER = 'María Torres'

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const MOCK_OPS_INIT = [
  {
    id: 'OP-2026-001',
    clienteId: 'CLI-001',
    clienteNombre: 'Empresa Industrial Inca S.A.C.',
    tipo: 'compra', montoUSD: 50_000, tc: 3.742, montoPEN: 187_100,
    estado: 'reservada', fecha: T, hora: '09:15',
    tcRef: 3.739, tcFuente: 'Datatec',
    trader: 'Andrés Valdivia C.', mesa: 'Mesa Alpha',
    backOffice: 'María Torres',
    cuentasQpaqIngreso: [{ cuentaId: 'QP-USD-1', monto: '25000' }, { cuentaId: 'QP-USD-2', monto: '25000' }],
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-PEN-1', monto: '187100' }],
    cuentasDest: [{ cuentaId: 'CTA-002', monto: '187100' }],
    solAnulacion: null, historial: [],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
  {
    id: 'OP-2026-002',
    clienteId: 'CLI-002',
    clienteNombre: 'Textiles del Sur E.I.R.L.',
    tipo: 'venta', montoUSD: 25_000, tc: 3.738, montoPEN: 93_450,
    estado: 'observada', fecha: T, hora: '10:30',
    tcRef: 3.738, tcFuente: 'Datatec',
    trader: 'Karla Mendoza R.', mesa: 'Mesa Beta',
    backOffice: 'Jorge Castillo',
    cuentasQpaqIngreso: [{ cuentaId: 'QP-PEN-2', monto: '93450' }],
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-USD-1', monto: '25000' }],
    cuentasDest: [{ cuentaId: 'CTA-010', monto: '25000' }],
    solAnulacion: {
      causa: 'cliente_desiste',
      detalle: 'El cliente llamó indicando que ya no requiere la operación. Confirma desistimiento vía email a las 12:40.',
      solicitadoPor: 'Karla Mendoza R.',
      fecha: T, hora: '12:45',
    },
    historial: [],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
  {
    id: 'OP-2026-003',
    clienteId: 'CLI-003',
    clienteNombre: 'Grupo Minero Los Andes S.A.',
    tipo: 'compra', montoUSD: 120_000, tc: 3.741, montoPEN: 448_920,
    estado: 'en_revision', fecha: T, hora: '08:50',
    tcRef: 3.740, tcFuente: 'Datatec',
    trader: 'Rodrigo Paredes F.', mesa: 'Mesa Alpha',
    backOffice: 'Ana L. Ramírez',
    cuentasQpaqEgreso: [
      { cuentaId: 'QP-PEN-1', monto: '300000' },
      { cuentaId: 'QP-PEN-2', monto: '148920' },
    ],
    cuentasQpaqIngreso:  [{ cuentaId: 'QP-USD-1', monto: '120000' }],
    cuentasDest: [{ cuentaId: 'CTA-031', monto: '448920' }],
    comprobantes: [
      { name: 'Voucher_transferencia_OP003.pdf' },
      { name: 'Constancia_recibo_OP003.jpg' },
    ],
    solAnulacion: null, historial: [],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
  {
    id: 'OP-2026-004',
    clienteId: 'CLI-004',
    clienteNombre: 'Consorcio Lima Norte S.A.C.',
    tipo: 'venta', montoUSD: 15_000, tc: 3.739, montoPEN: 56_085,
    estado: 'subsanada', fecha: subDays(1), hora: '16:20',
    tcRef: 3.742, tcFuente: 'Manual',
    trader: 'Sofía Ríos M.', mesa: 'Mesa Beta',
    backOffice: 'María Torres',
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-USD-2', monto: '15000' }],
    cuentasQpaqIngreso: [{ cuentaId: 'QP-PEN-2', monto: '56085' }],
    cuentasDest: [{ cuentaId: 'CTA-041', monto: '15000' }],
    comprobantes: [{ name: 'Comprobante_abono_OP004.pdf' }],
    solAnulacion: null,
    historial: [
      { tipo: 'observacion', por: 'Ana L. Ramírez (Back Office)',  fecha: subDays(1), hora: '17:00', detalle: 'El monto del voucher adjunto no coincide con S/ 56,085. Se solicita nuevo comprobante.' },
      { tipo: 'subsanacion', por: 'Sofía Ríos M. (Trader)',        fecha: subDays(1), hora: '17:45', detalle: 'Voucher corregido adjunto. El error fue tipográfico del cliente al transferir.' },
    ],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
  {
    id: 'OP-2026-005',
    clienteId: 'CLI-005',
    clienteNombre: 'Importadora del Pacífico S.A.',
    tipo: 'compra', montoUSD: 80_000, tc: 3.740, montoPEN: 299_200,
    estado: 'reservada', fecha: T, hora: '11:05',
    trader: 'Andrés Valdivia C.', mesa: 'Mesa Alpha',
    backOffice: null,
    cuentasQpaqIngreso: [{ cuentaId: 'QP-USD-1', monto: '40000' }, { cuentaId: 'QP-USD-2', monto: '40000' }],
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-PEN-2', monto: '299200' }],
    cuentasDest: [{ cuentaId: 'CTA-050', monto: '299200' }],
    solAnulacion: {
      causa: 'error_operativo',
      detalle: 'Se ingresó TC 3.740 pero el tipo de cambio pactado con el cliente fue 3.745. Error en el registro.',
      solicitadoPor: 'Andrés Valdivia C.',
      fecha: T, hora: '11:30',
    },
    historial: [],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
  {
    id: 'OP-2026-006',
    clienteId: 'CLI-006',
    clienteNombre: 'Distribuidora Norte EIRL',
    tipo: 'venta', montoUSD: 8_500, tc: 3.744, montoPEN: 31_824,
    estado: 'liquidada', fecha: subDays(1), hora: '14:15',
    trader: 'César Huanca P.', mesa: 'Mesa Gamma',
    backOffice: 'Jorge Castillo',
    cuentasQpaqIngreso: [{ cuentaId: 'QP-PEN-1', monto: '31824' }],
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-USD-1', monto: '8500' }],
    cuentasDest: [{ cuentaId: 'CTA-061', monto: '8500' }],
    refTransferencia: 'TRF-006-2026', fechaLiquidacionISO: subDays(1),
    solAnulacion: null, historial: [],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
  {
    id: 'OP-2026-007',
    clienteId: 'CLI-007',
    clienteNombre: 'Farmacéutica Andina S.A.',
    tipo: 'compra', montoUSD: 45_000, tc: 3.743, montoPEN: 168_435,
    estado: 'anulada', fecha: subDays(2), hora: '10:00',
    trader: 'Rodrigo Paredes F.', mesa: 'Mesa Alpha',
    backOffice: 'Ana L. Ramírez',
    cuentasQpaqIngreso: [{ cuentaId: 'QP-USD-2', monto: '45000' }],
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-PEN-1', monto: '168435' }],
    cuentasDest: [{ cuentaId: 'CTA-071', monto: '168435' }],
    solAnulacion: null,
    historial: [
      { tipo: 'solicitud', por: 'Rodrigo Paredes F. (Trader)',   fecha: subDays(2), hora: '10:45', causa: 'transferencia_mal_ejecutada', detalle: 'La transferencia fue realizada a una cuenta bancaria incorrecta por error del cliente.' },
      { tipo: 'anulacion', por: 'María Torres (Middle Office)',  fecha: subDays(2), hora: '11:15', causa: 'transferencia_mal_ejecutada', detalle: 'Se verificó el error con operaciones bancarias. Se procede con la anulación.' },
    ],
    fechaAnulacion: subDays(2), horaAnulacion: '11:15',
    anuladoPor: 'María Torres (Middle Office)',
    causaAnulacion: 'transferencia_mal_ejecutada',
  },
  {
    id: 'OP-2026-008',
    clienteId: 'CLI-002',
    clienteNombre: 'Textiles del Sur E.I.R.L.',
    tipo: 'venta', montoUSD: 12_000, tc: 3.737, montoPEN: 44_844,
    estado: 'observada', fecha: T, hora: '13:40',
    trader: 'Luis Fernández A.', mesa: 'Mesa Gamma',
    backOffice: null,
    cuentasQpaqIngreso: [{ cuentaId: 'QP-PEN-2', monto: '44844' }],
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-USD-2', monto: '12000' }],
    cuentasDest: [{ cuentaId: 'CTA-010', monto: '12000' }],
    solAnulacion: null, historial: [],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
  {
    id: 'OP-2026-009',
    clienteId: 'CLI-001',
    clienteNombre: 'Empresa Industrial Inca S.A.C.',
    tipo: 'compra', montoUSD: 30_000, tc: 3.741, montoPEN: 112_230,
    estado: 'liquidada', fecha: T, hora: '09:50',
    trader: 'Andrés Valdivia C.', mesa: 'Mesa Alpha',
    backOffice: 'María Torres',
    cuentasQpaqIngreso: [{ cuentaId: 'QP-USD-1', monto: '30000' }],
    cuentasQpaqEgreso:  [{ cuentaId: 'QP-PEN-1', monto: '112230' }],
    cuentasDest: [{ cuentaId: 'CTA-002', monto: '112230' }],
    refTransferencia: 'TRF-009-2026', fechaLiquidacionISO: T,
    solAnulacion: null, historial: [],
    fechaAnulacion: null, horaAnulacion: null, anuladoPor: null, causaAnulacion: null,
  },
]

/* ═══════════════════════════════════════════════
   FILTER SELECT
═══════════════════════════════════════════════ */
function FilterSelect({ value, onChange, options, placeholder }) {
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
          'flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs text-left transition-all w-full',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300'
        )}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}>
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
              className={clsx('w-full flex items-center justify-between gap-3 px-3 py-2 text-xs transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50')}>
              {o.label}
              {o.value === value && <Check size={11} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MULTI FILTER SELECT
═══════════════════════════════════════════════ */
function MultiFilterSelect({ values, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const selectedLabels = options.filter(o => values.includes(o.value)).map(o => o.label)
  const displayText = selectedLabels.length === 0
    ? placeholder
    : selectedLabels.length === 1
    ? selectedLabels[0]
    : `${selectedLabels.length} estados`
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={clsx('flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs text-left transition-all w-full',
          open ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300')}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}>
        <span className={clsx('flex-1 truncate', values.length > 0 ? 'text-gray-700 font-medium' : 'text-gray-400')}>{displayText}</span>
        <ChevronDown size={11} className={clsx('text-gray-400 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 min-w-max"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}>
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => {
                const next = values.includes(o.value) ? values.filter(v => v !== o.value) : [...values, o.value]
                onChange(next)
              }}
              className={clsx('w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left',
                values.includes(o.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50')}>
              <div className={clsx('w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                values.includes(o.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300')}>
                {values.includes(o.value) && <Check size={9} className="text-white" />}
              </div>
              {o.label}
            </button>
          ))}
          {values.length > 0 && (
            <button onClick={() => onChange([])}
              className="w-full text-[10px] text-gray-400 hover:text-gray-600 px-3 py-1.5 text-left border-t"
              style={{ borderColor: 'var(--color-border)' }}>
              Limpiar selección
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   BADGES
═══════════════════════════════════════════════ */
function EstadoBadge({ estado }) {
  const m = ESTADO_META[estado] ?? ESTADO_META.reservada
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap', m.bg, m.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', m.dot)} />{m.label}
    </span>
  )
}

function TipoBadge({ tipo, monedaCruzada }) {
  if (tipo === 'compra')
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
      <ArrowDownLeft size={10} /> Compra
    </span>
  if (tipo === 'cruzada')
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
      <ArrowLeftRight size={10} /> Cruzada {monedaCruzada === 'USD' ? 'USD' : 'PEN'}
    </span>
  return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
    <ArrowUpRight size={10} /> Venta
  </span>
}

/* ═══════════════════════════════════════════════
   SOLICITAR ANULACIÓN DRAWER (Trader)
═══════════════════════════════════════════════ */
const EMPTY_FORM = { causa: '', detalle: '' }

function SolicitarDrawer({ open, op, onClose, onSolicitar }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function reset() { setForm(EMPTY_FORM); setErrors({}) }
  function handleClose() { reset(); onClose() }

  function validate() {
    const e = {}
    if (!form.causa)          e.causa   = 'Seleccione una causa de anulación.'
    if (!form.detalle.trim()) e.detalle = 'La justificación es obligatoria.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSolicitar() {
    if (!validate()) return
    const now = new Date()
    const hora = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    onSolicitar(op.id, { causa: form.causa, detalle: form.detalle.trim(), solicitadoPor: 'Andrés Valdivia C. (Trader)', fecha: T, hora })
    reset(); onClose()
  }

  const causaMeta = CAUSAS.find(c => c.id === form.causa)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={handleClose} />}
      <div className="fixed right-0 top-0 h-full z-50 bg-white flex flex-col"
        style={{ width: 440, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.22s ease' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Solicitar anulación</h2>
            {op && <p className="text-[11px] text-gray-400 mt-0.5">{op.id} · {op.clienteNombre}</p>}
          </div>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {op && (
            <div className="rounded-lg px-4 py-3 space-y-2 bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Operación a anular</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                <span className="text-gray-400">Correlativo: <strong className="text-gray-700 font-mono">{op.id}</strong></span>
                <span className="text-gray-400">Estado: <EstadoBadge estado={op.estado} /></span>
                <span className="text-gray-400">Tipo: <TipoBadge tipo={op.tipo} /></span>
                <span className="text-gray-400">Monto: <strong className="text-gray-700">USD {fmtMoney(op.montoUSD)}</strong></span>
                <span className="text-gray-400">TC: <strong className="text-gray-700">{fmtTC(op.tc)}</strong></span>
                <span className="text-gray-400">Mesa: <strong className="text-gray-700">{op.mesa}</strong></span>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
            <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700 leading-relaxed">
              <strong>Acción irreversible.</strong> Una vez aprobada por el Middle Office, la operación pasará a estado <strong>Anulada</strong> de forma definitiva.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Causa de anulación <span className="text-red-400">*</span></label>
            <div className="relative">
              <select value={form.causa} onChange={e => { setForm(f => ({ ...f, causa: e.target.value })); setErrors({}) }}
                className={clsx('w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 outline-none appearance-none bg-white transition-all', errors.causa ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')}>
                <option value="">Seleccionar causa…</option>
                {CAUSAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.causa && <p className="text-[11px] text-red-500 mt-1">{errors.causa}</p>}
            {causaMeta && <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{causaMeta.desc}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Justificación / detalle <span className="text-red-400">*</span></label>
            <textarea rows={4} value={form.detalle}
              onChange={e => { setForm(f => ({ ...f, detalle: e.target.value })); setErrors({}) }}
              placeholder="Describa en detalle el motivo que justifica la anulación…"
              className={clsx('w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none resize-none transition-all', errors.detalle ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')} />
            {errors.detalle && <p className="text-[11px] text-red-500 mt-1">{errors.detalle}</p>}
          </div>
          <div className="px-3 py-2 rounded-lg bg-blue-50 text-[11px] text-blue-700" style={{ border: '1px solid #bfdbfe' }}>
            <Info size={11} className="inline mr-1.5 shrink-0" />
            La solicitud será enviada al Middle Office para revisión. La operación permanece en su estado actual.
          </div>
        </div>
        <div className="px-5 py-3.5 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleSolicitar}
            className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors">
            Enviar solicitud de anulación
          </button>
          <button onClick={handleClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   ANULAR DIRECTO DRAWER (Middle Office)
═══════════════════════════════════════════════ */
function AnularDirectoDrawer({ open, op, onClose, onConfirmAnular }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function reset() { setForm(EMPTY_FORM); setErrors({}) }
  function handleClose() { reset(); onClose() }

  function validate() {
    const e = {}
    if (!form.causa)          e.causa   = 'Seleccione una causa de anulación.'
    if (!form.detalle.trim()) e.detalle = 'La justificación es obligatoria.'
    setErrors(e); return Object.keys(e).length === 0
  }

  function handleProceder() {
    if (!validate()) return
    onConfirmAnular(op.id, { causa: form.causa, detalle: form.detalle.trim() })
    reset(); onClose()
  }

  const causaMeta = CAUSAS.find(c => c.id === form.causa)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={handleClose} />}
      <div className="fixed right-0 top-0 h-full z-50 bg-white flex flex-col"
        style={{ width: 440, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.22s ease' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Anular operación</h2>
            {op && <p className="text-[11px] text-gray-400 mt-0.5">Middle Office · {op.id}</p>}
          </div>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {op && (
            <div className="rounded-lg px-4 py-3 space-y-2 bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Operación</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                <span className="text-gray-400">Correlativo: <strong className="text-gray-700 font-mono">{op.id}</strong></span>
                <span className="text-gray-400">Estado: <EstadoBadge estado={op.estado} /></span>
                <span className="text-gray-400">Tipo: <TipoBadge tipo={op.tipo} /></span>
                <span className="text-gray-400">Monto: <strong className="text-gray-700">USD {fmtMoney(op.montoUSD)}</strong></span>
                <span className="col-span-2 text-gray-400">Cliente: <strong className="text-gray-700">{op.clienteNombre}</strong></span>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
            <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-700 leading-relaxed">
              <strong>Acción definitiva e irreversible.</strong> Al confirmar, la operación pasará a estado <strong>Anulada</strong> y su impacto en posición FX será revertido.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Causa de anulación <span className="text-red-400">*</span></label>
            <div className="relative">
              <select value={form.causa} onChange={e => { setForm(f => ({ ...f, causa: e.target.value })); setErrors({}) }}
                className={clsx('w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 outline-none appearance-none bg-white transition-all', errors.causa ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')}>
                <option value="">Seleccionar causa…</option>
                {CAUSAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.causa && <p className="text-[11px] text-red-500 mt-1">{errors.causa}</p>}
            {causaMeta && <p className="text-[11px] text-gray-400 mt-1.5">{causaMeta.desc}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Justificación / detalle <span className="text-red-400">*</span></label>
            <textarea rows={4} value={form.detalle}
              onChange={e => { setForm(f => ({ ...f, detalle: e.target.value })); setErrors({}) }}
              placeholder="Justificación de la anulación ejecutada por Middle Office…"
              className={clsx('w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none resize-none transition-all', errors.detalle ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')} />
            {errors.detalle && <p className="text-[11px] text-red-500 mt-1">{errors.detalle}</p>}
          </div>
        </div>
        <div className="px-5 py-3.5 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleProceder}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
            <Ban size={13} /> Anular operación
          </button>
          <button onClick={handleClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   REVISAR SOLICITUD DRAWER (Middle Office)
═══════════════════════════════════════════════ */
function RevisarDrawer({ open, op, onClose, onAprobar, onRechazar }) {
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [errMotivo, setErrMotivo]         = useState('')
  const [vista, setVista]                 = useState('revisar')

  function reset() { setMotivoRechazo(''); setErrMotivo(''); setVista('revisar') }
  function handleClose() { reset(); onClose() }

  function handleAprobar() { onAprobar(op.id); reset(); onClose() }
  function handleRechazar() {
    if (!motivoRechazo.trim()) { setErrMotivo('El motivo es obligatorio.'); return }
    onRechazar(op.id, motivoRechazo.trim()); reset(); onClose()
  }

  if (!op?.solAnulacion) return null
  const sol = op.solAnulacion
  const causaMeta = CAUSAS.find(c => c.id === sol.causa)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={handleClose} />}
      <div className="fixed right-0 top-0 h-full z-50 bg-white flex flex-col"
        style={{ width: 440, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.22s ease' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Revisar solicitud de anulación</h2>
            {op && <p className="text-[11px] text-gray-400 mt-0.5">Middle Office · {op.id}</p>}
          </div>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="rounded-lg px-4 py-3 space-y-2 bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Solicitud de anulación</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
              <span className="text-gray-500">Solicitado por: <strong className="text-gray-700">{sol.solicitadoPor}</strong></span>
              <span className="text-gray-500">Fecha: <strong className="text-gray-700">{fmtDate(sol.fecha)} {sol.hora}</strong></span>
              <span className="col-span-2 text-gray-500">Causa: <strong className="text-gray-700">{causaMeta?.label ?? sol.causa}</strong></span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed border-t pt-2" style={{ borderColor: '#fcd34d' }}>{sol.detalle}</p>
          </div>
          <div className="rounded-lg px-4 py-3 space-y-2 bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Operación afectada</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
              <span className="text-gray-400">Correlativo: <strong className="text-gray-700 font-mono">{op.id}</strong></span>
              <span className="text-gray-400">Estado: <EstadoBadge estado={op.estado} /></span>
              <span className="text-gray-400">Tipo: <TipoBadge tipo={op.tipo} /></span>
              <span className="text-gray-400">Monto: <strong className="text-gray-700">USD {fmtMoney(op.montoUSD)}</strong></span>
              <span className="col-span-2 text-gray-400">Cliente: <strong className="text-gray-700">{op.clienteNombre}</strong></span>
            </div>
          </div>
          {vista === 'revisar' && (
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-red-50" style={{ border: '1px solid #fca5a5' }}>
              <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700 leading-relaxed">
                Aprobar la anulación es <strong>definitivo e irreversible</strong>. La operación no podrá reactivarse.
              </p>
            </div>
          )}
          {vista === 'rechazar' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Motivo del rechazo <span className="text-red-400">*</span></label>
              <textarea rows={3} value={motivoRechazo}
                onChange={e => { setMotivoRechazo(e.target.value); setErrMotivo('') }}
                placeholder="Indique por qué se rechaza la solicitud de anulación…"
                className={clsx('w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none resize-none', errMotivo ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')} />
              {errMotivo && <p className="text-[11px] text-red-500 mt-1">{errMotivo}</p>}
            </div>
          )}
        </div>
        <div className="px-5 py-3.5 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          {vista === 'revisar' ? (
            <>
              <button onClick={handleAprobar}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                <Ban size={13} /> Aprobar anulación
              </button>
              <button onClick={() => setVista('rechazar')}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Rechazar solicitud
              </button>
            </>
          ) : (
            <>
              <button onClick={handleRechazar}
                className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold transition-colors">
                Confirmar rechazo
              </button>
              <button onClick={() => { setVista('revisar'); setMotivoRechazo(''); setErrMotivo('') }}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Volver
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   VER DETALLE DRAWER — todas las operaciones
═══════════════════════════════════════════════ */
function VerDetalleDrawer({ open, op, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />}
      <div className="fixed right-0 top-0 h-full z-50 bg-white flex flex-col"
        style={{ width: 480, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.22s ease' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Detalle de operación</h2>
            {op && <p className="text-[11px] text-gray-400 mt-0.5">{op.id}</p>}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>

        {op && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Estado + Tipo */}
            <div className="flex items-center gap-2.5">
              <EstadoBadge estado={op.estado} />
              <TipoBadge tipo={op.tipo} />
              {op.solAnulacion && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                  Sol. anulación pendiente
                </span>
              )}
            </div>

            {/* Datos de la operación */}
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <div className="px-4 py-2.5 bg-gray-50 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Datos de la operación</p>
              </div>
              <div className="px-4 py-3 divide-y" style={{ divideColor: 'var(--color-border)' }}>
                {[
                  { label: 'Correlativo',  value: <span className="font-mono font-bold text-gray-800">{op.id}</span> },
                  { label: 'Fecha / Hora', value: `${fmtDate(op.fecha)} · ${op.hora}` },
                  { label: op.tipo === 'cruzada' ? `Monto (${op.monedaCruzada ?? 'PEN'})` : 'Monto USD',
                    value: <span className="font-semibold">{op.tipo === 'cruzada' ? (op.monedaCruzada ?? 'PEN') : 'USD'} {fmtMoney(op.montoUSD)}</span> },
                  { label: 'TC pactado',   value: <span className="font-mono">{fmtTC(op.tc)}</span> },
                  op.tipo === 'cruzada'
                    ? { label: 'Contravalor (salida)', value: `${op.monedaCruzada ?? 'PEN'} ${fmtMoney(op.montoContravalor)}` }
                    : { label: 'Monto PEN', value: op.montoPEN ? `PEN ${fmtMoney(op.montoPEN)}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2 text-xs first:pt-0 last:pb-0">
                    <span className="text-gray-400 shrink-0">{label}</span>
                    <span className="text-gray-700 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cliente y asignación */}
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <div className="px-4 py-2.5 bg-gray-50 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Cliente y asignación</p>
              </div>
              <div className="px-4 py-3 divide-y" style={{ divideColor: 'var(--color-border)' }}>
                {[
                  { label: 'Cliente', value: op.clienteNombre },
                  { label: 'Trader',  value: op.trader },
                  { label: 'Mesa',    value: op.mesa },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2 text-xs first:pt-0 last:pb-0">
                    <span className="text-gray-400 shrink-0">{label}</span>
                    <span className="text-gray-700 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Solicitud pendiente */}
            {op.solAnulacion && (
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #fcd34d' }}>
                <div className="px-4 py-2.5 bg-amber-50 border-b" style={{ borderColor: '#fcd34d' }}>
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Solicitud de anulación pendiente</p>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Solicitado por</span>
                    <span className="text-gray-700">{op.solAnulacion.solicitadoPor}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Causa</span>
                    <span className="text-gray-700">{CAUSAS.find(c => c.id === op.solAnulacion.causa)?.label}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed border-t pt-2.5" style={{ borderColor: '#fcd34d' }}>
                    {op.solAnulacion.detalle}
                  </p>
                </div>
              </div>
            )}

            {/* Info de anulación */}
            {op.estado === 'anulada' && op.anuladoPor && (
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #fca5a5' }}>
                <div className="px-4 py-2.5 bg-red-50 border-b" style={{ borderColor: '#fca5a5' }}>
                  <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Información de anulación</p>
                </div>
                <div className="px-4 py-3 divide-y" style={{ divideColor: '#fca5a5' }}>
                  {[
                    { label: 'Anulado por',  value: op.anuladoPor },
                    { label: 'Fecha / Hora', value: `${fmtDate(op.fechaAnulacion)} · ${op.horaAnulacion}` },
                    { label: 'Causa',        value: CAUSAS.find(c => c.id === op.causaAnulacion)?.label ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-2 text-xs first:pt-0 last:pb-0">
                      <span className="text-gray-400 shrink-0">{label}</span>
                      <span className="text-gray-700 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historial */}
            {op.historial?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Historial de trazabilidad</p>
                <div className="space-y-2">
                  {op.historial.map((h, i) => (
                    <div key={i} className={clsx('rounded-lg px-3 py-2.5 text-[11px]',
                      h.tipo === 'anulacion' ? 'bg-red-50' : h.tipo === 'rechazo' ? 'bg-gray-50' : 'bg-amber-50')}
                      style={{ border: `1px solid ${h.tipo === 'anulacion' ? '#fca5a5' : h.tipo === 'rechazo' ? 'var(--color-border)' : '#fcd34d'}` }}>
                      <div className="flex justify-between mb-1">
                        <span className={clsx('font-semibold text-[10px] uppercase tracking-wide',
                          h.tipo === 'anulacion' ? 'text-red-600' : h.tipo === 'rechazo' ? 'text-gray-500' : 'text-amber-600')}>
                          {h.tipo === 'anulacion' ? 'Anulación ejecutada' : h.tipo === 'rechazo' ? 'Rechazo' : 'Solicitud de anulación'}
                        </span>
                        <span className="text-gray-400">{fmtDate(h.fecha)} {h.hora}</span>
                      </div>
                      <p className="text-gray-600 mb-0.5">Por: <strong className="text-gray-800">{h.por}</strong></p>
                      <p className="text-gray-600 leading-relaxed">{h.detalle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   EDITAR OPERACIÓN DRAWER
═══════════════════════════════════════════════ */
function EditarDrawer({ open, op, ops, onClose, onGuardar }) {
  const [monto,    setMonto]    = useState('')
  const [tc,       setTc]       = useState('')
  const [montoPen, setMontoPen] = useState('')
  const [tcPunta,  setTcPunta]  = useState('')
  const [errors,   setErrors]   = useState({})

  useEffect(() => {
    if (op) {
      setMonto(String(op.montoUSD ?? ''))
      setTc(String(op.tc ?? ''))
      setMontoPen(String(op.montoPEN ?? ''))
      setTcPunta(String(op.tcRef ?? ''))
      setErrors({})
    }
  }, [op])

  function handleClose() { setErrors({}); onClose() }

  function handleMonto(val) {
    setMonto(val)
    const m = parseFloat(val), t = parseFloat(tc)
    if (!isNaN(m) && m > 0 && !isNaN(t) && t > 0) setMontoPen((m * t).toFixed(2))
    setErrors(v => ({ ...v, monto: undefined }))
  }

  function handleTc(val) {
    setTc(val)
    const m = parseFloat(monto), t = parseFloat(val)
    if (!isNaN(m) && m > 0 && !isNaN(t) && t > 0) setMontoPen((m * t).toFixed(2))
    setErrors(v => ({ ...v, tc: undefined }))
  }

  function handleMontoPen(val) {
    setMontoPen(val)
    const p = parseFloat(val), m = parseFloat(monto), t = parseFloat(tc)
    if (!isNaN(p) && p > 0) {
      if (!isNaN(m) && m > 0) setTc((p / m).toFixed(4))
      else if (!isNaN(t) && t > 0) setMonto((p / t).toFixed(2))
    }
    setErrors(v => ({ ...v, montoPen: undefined }))
  }

  const tcPuntaVal = parseFloat(tcPunta)
  const tcVal      = parseFloat(tc)
  const spread = !isNaN(tcPuntaVal) && tcPuntaVal > 0 && !isNaN(tcVal) && tcVal > 0
    ? (op?.tipo === 'compra' ? tcPuntaVal - tcVal : tcVal - tcPuntaVal) * 10000
    : null

  const similar = (ops ?? []).filter(o =>
    o.id !== op?.id &&
    o.clienteNombre === op?.clienteNombre &&
    o.fecha === T &&
    !isNaN(parseFloat(monto)) && Math.abs(parseFloat(monto) - o.montoUSD) < 0.01 &&
    !isNaN(parseFloat(tc)) && Math.abs(parseFloat(tc) - o.tc) < 0.0001
  )

  function validate() {
    const e = {}
    const m = parseFloat(monto), t = parseFloat(tc), p = parseFloat(montoPen)
    if (!monto || isNaN(m) || m <= 0)    e.monto    = 'Ingrese un monto USD válido.'
    if (!tc || isNaN(t) || t <= 0)       e.tc       = 'Ingrese un TC pactado válido.'
    if (!montoPen || isNaN(p) || p <= 0) e.montoPen = 'Ingrese un monto PEN válido.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleGuardar() {
    if (!validate()) return
    const tcRefVal = parseFloat(tcPunta)
    onGuardar(op.id, {
      montoUSD: parseFloat(monto),
      tc: parseFloat(tc),
      montoPEN: parseFloat(montoPen),
      ...(tcPunta && !isNaN(tcRefVal) && tcRefVal > 0 ? { tcRef: tcRefVal } : {}),
    })
    handleClose()
  }

  const montoNum    = parseFloat(monto)
  const montoPenNum = parseFloat(montoPen)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={handleClose} />}
      <div className="fixed right-0 top-0 h-full z-50 bg-white flex flex-col"
        style={{ width: 480, borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.22s ease' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Editar operación</h2>
            {op && <p className="text-[11px] text-gray-400 mt-0.5">{op.id} · {op.clienteNombre}</p>}
          </div>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {op && (
            <div className="rounded-lg px-4 py-3 space-y-2 bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Operación</p>
              <div className="flex items-center gap-2.5">
                <TipoBadge tipo={op.tipo} />
                <EstadoBadge estado={op.estado} />
              </div>
              <p className="text-[11px] text-gray-600">Cliente: <strong className="text-gray-800">{op.clienteNombre}</strong></p>
            </div>
          )}

          {/* Alerta de operación similar */}
          {similar.length > 0 && (
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
              <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Posible duplicado:</strong> existe{similar.length > 1 ? 'n' : ''} {similar.length > 1 ? `${similar.length} operaciones similares` : 'una operación similar'} registrada{similar.length > 1 ? 's' : ''} hoy para este cliente con el mismo monto y TC ({similar.map(s => s.id).join(', ')}).
              </p>
            </div>
          )}

          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-blue-50" style={{ border: '1px solid #bfdbfe' }}>
            <Info size={12} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Ingresa 2 de 3 campos principales (Monto USD, TC Pactado o Monto PEN) y el tercero se calculará automáticamente.
            </p>
          </div>

          {/* Grid 2 columnas: 4 campos editables */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monto USD */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Monto USD <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">USD</span>
                <input type="number" min="0" step="0.01" value={monto}
                  onChange={e => handleMonto(e.target.value)}
                  className={clsx('w-full pl-12 pr-3 py-2.5 rounded-lg border text-sm text-right outline-none transition-all',
                    errors.monto ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')} />
              </div>
              {monto && !isNaN(montoNum) && montoNum > 0 && (
                <p className="text-[10px] text-gray-400 text-right">{fmtMoney(montoNum)}</p>
              )}
              {errors.monto && <p className="text-[11px] text-red-500">{errors.monto}</p>}
            </div>

            {/* TC Pactado */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">TC Pactado <span className="text-red-400">*</span></label>
              <input type="number" step="0.0001" value={tc}
                onChange={e => handleTc(e.target.value)}
                className={clsx('w-full px-3 py-2.5 rounded-lg border text-sm text-right font-mono outline-none transition-all',
                  errors.tc ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')} />
              {errors.tc && <p className="text-[11px] text-red-500">{errors.tc}</p>}
            </div>

            {/* Monto PEN */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Monto PEN <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">PEN</span>
                <input type="number" min="0" step="0.01" value={montoPen}
                  onChange={e => handleMontoPen(e.target.value)}
                  className={clsx('w-full pl-12 pr-3 py-2.5 rounded-lg border text-sm text-right outline-none transition-all',
                    errors.montoPen ? 'border-red-400' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100')} />
              </div>
              {montoPen && !isNaN(montoPenNum) && montoPenNum > 0 && (
                <p className="text-[10px] text-gray-400 text-right">{fmtMoney(montoPenNum)}</p>
              )}
              {errors.montoPen && <p className="text-[11px] text-red-500">{errors.montoPen}</p>}
            </div>

            {/* TC Punta */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">TC Punta</label>
              <input type="number" step="0.0001" value={tcPunta}
                onChange={e => setTcPunta(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-right font-mono outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>

          {/* Campos calculados: Spread y Fuente TC */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg px-3 py-2.5 bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] text-gray-400 mb-1">Spread (×10,000)</p>
              <p className={clsx('text-sm font-bold font-mono',
                spread === null ? 'text-gray-300' : spread >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {spread !== null ? spread.toFixed(2) : '—'}
              </p>
              {spread !== null && (
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {op?.tipo === 'compra' ? 'TC Punta – TC Pactado' : 'TC Pactado – TC Punta'}
                </p>
              )}
            </div>
            <div className="rounded-lg px-3 py-2.5 bg-gray-50" style={{ border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] text-gray-400 mb-1">Fuente TC</p>
              <p className="text-sm font-semibold text-gray-700">{op?.tcFuente ?? '—'}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={handleGuardar}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
            Guardar cambios
          </button>
          <button onClick={handleClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   PERMISOS POR ROL
═══════════════════════════════════════════════ */
const ANULACION_PERMS = {
  admin:    { solicitar: false, ejecutar: true  },
  trader:   { solicitar: true,  ejecutar: false },
  middle:   { solicitar: false, ejecutar: true  },
  back:     { solicitar: false, ejecutar: false },
  head:     { solicitar: true,  ejecutar: true  },
  jefe_op:  { solicitar: false, ejecutar: false },
  tesoreria:{ solicitar: false, ejecutar: false },
  contab:   { solicitar: false, ejecutar: false },
  head_tes: { solicitar: false, ejecutar: true  },
  gerente:  { solicitar: false, ejecutar: false },
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function OperacionesPage({ role = 'trader', activeTab = 'bandeja', marketData, ops: opsProp, setOps: setOpsProp, onPreviewDoc, notify, setInWizard }) {
  const [view,         setView]         = useState('bandeja')
  const [opsLocal,     setOpsLocal]     = useState(MOCK_OPS_INIT)
  // Use lifted state if provided, otherwise local
  const ops    = opsProp    ?? opsLocal
  const setOps = setOpsProp ?? setOpsLocal
  const [filtroEstados, setFiltroEstados] = useState([])
  const [filtroTipo,    setFiltroTipo]    = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [pageSize,     setPageSize]     = useState(10)

  /* Drawers */
  const [solicitarOp, setSolicitarOp] = useState(null)
  const [anularOp,    setAnularOp]    = useState(null)
  const [revisarOp,   setRevisarOp]   = useState(null)
  const [verOp,       setVerOp]       = useState(null)
  const [editOp,      setEditOp]      = useState(null)
  const [envioOp,     setEnvioOp]     = useState(null)
  const [subsanarOp,  setSubsanarOp]  = useState(null)
  const [revisarBOOp, setRevisarBOOp] = useState(null)
  const [revertirOp,  setRevertirOp]  = useState(null)   // RF-17 — solicitar reapertura
  const [autorizarOp, setAutorizarOp] = useState(null)   // RF-17 — autorizar/rechazar reapertura

  // Sincronizar estado global de wizard
  useEffect(() => {
    setInWizard?.(view !== 'bandeja')
  }, [view, setInWizard])

  // Resetear vista al cambiar de pestaña (sub-bandeja)
  useEffect(() => {
    setView('bandeja')
    setEnvioOp(null)
    setSubsanarOp(null)
    setRevisarBOOp(null)
  }, [activeTab])

  const perms        = ANULACION_PERMS[role] ?? { solicitar: false, ejecutar: false }
  const canSolicitar = perms.solicitar
  const canEjecutar  = perms.ejecutar

  const stats = useMemo(() => ({
    reservada:           ops.filter(o => o.estado === 'reservada').length,
    observada:           ops.filter(o => o.estado === 'observada').length,
    liquidada:           ops.filter(o => o.estado === 'liquidada').length,
    anulada:             ops.filter(o => o.estado === 'anulada').length,
    pendientesAnulacion: ops.filter(o => o.solAnulacion).length,
  }), [ops])

  const filtered = useMemo(() => {
    return ops.filter(o => {
      // Back Office solo ve sus propias operaciones (o sin asignar)
      if (role === 'back' && o.backOffice !== null && o.backOffice !== MOCK_BO_USER) return false

      // Filtro por pestaña activa
      if (activeTab === 'pendientes_abono')       return o.estado === 'reservada'
      if (activeTab === 'operaciones_observadas') return o.estado === 'observada'
      if (activeTab === 'revision_back_office')   return o.estado === 'en_revision' || o.estado === 'subsanada'
      if (activeTab === 'liquidadas')             return o.estado === 'liquidada'

      if (filtroEstados.length > 0 && !filtroEstados.includes(o.estado)) return false
      if (filtroTipo && o.tipo !== filtroTipo) return false
      if (dateFrom && o.fecha < dateFrom)             return false
      if (dateTo   && o.fecha > dateTo)               return false
      if (search) {
        const q = search.toLowerCase()
        if (!o.id.toLowerCase().includes(q) && !o.clienteNombre.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [ops, activeTab, role, filtroEstados, filtroTipo, dateFrom, dateTo, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const activeFilters = [filtroEstados.length > 0, filtroTipo, dateFrom, dateTo].filter(Boolean).length

  function resetPage() { setPage(1) }
  function clearFilters() { setFiltroEstados([]); setFiltroTipo(''); setDateFrom(''); setDateTo(''); resetPage() }
  function getNow() {
    const n = new Date()
    return { hora: `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}` }
  }

  /* Actions */
  function handleSolicitar(opId, sol) {
    setOps(prev => prev.map(o => o.id === opId ? {
      ...o,
      solAnulacion: sol,
      historial: [...(o.historial ?? []), { tipo: 'solicitud', por: sol.solicitadoPor, fecha: sol.fecha, hora: sol.hora, causa: sol.causa, detalle: sol.detalle }],
    } : o))
    notify?.(`Solicitud de anulación para ${opId} enviada al Middle Office.`)
  }

  function handleAprobar(opId) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => {
      if (o.id !== opId) return o
      const sol = o.solAnulacion
      return {
        ...o, estado: 'anulada', solAnulacion: null,
        fechaAnulacion: T, horaAnulacion: hora,
        anuladoPor: 'María Torres (Middle Office)', causaAnulacion: sol?.causa,
        historial: [...(o.historial ?? []), {
          tipo: 'anulacion', por: 'María Torres (Middle Office)',
          fecha: T, hora, causa: sol?.causa ?? '',
          detalle: `Anulación aprobada. ${sol?.detalle ?? ''}`.trim(),
        }],
      }
    }))
  }

  function handleRechazar(opId, motivo) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => {
      if (o.id !== opId) return o
      return {
        ...o, solAnulacion: null,
        historial: [...(o.historial ?? []), {
          tipo: 'rechazo', por: 'María Torres (Middle Office)',
          fecha: T, hora, causa: o.solAnulacion?.causa ?? '',
          detalle: `Solicitud rechazada. Motivo: ${motivo}`,
        }],
      }
    }))
  }

  function handleAnularDirecto(opId, { causa, detalle }) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => {
      if (o.id !== opId) return o
      return {
        ...o, estado: 'anulada', solAnulacion: null,
        fechaAnulacion: T, horaAnulacion: hora,
        anuladoPor: 'María Torres (Middle Office)', causaAnulacion: causa,
        historial: [...(o.historial ?? []), {
          tipo: 'anulacion', por: 'María Torres (Middle Office)',
          fecha: T, hora, causa, detalle,
        }],
      }
    }))
  }

  function handleEditar(opId, changes) {
    setOps(prev => prev.map(o => o.id === opId ? { ...o, ...changes } : o))
    notify?.(`Operación ${opId} actualizada.`)
  }

  function handleTomarOperacion(opId) {
    setOps(prev => prev.map(o => o.id === opId ? { ...o, backOffice: MOCK_BO_USER } : o))
    notify?.(`Operación ${opId} asignada a ${MOCK_BO_USER}.`)
  }

  function handleConfirmarAbono(id, data) {
    setOps(prev => prev.map(o => {
      if (o.id !== id) return o
      // No perder las cuentas destino del cliente: filtrar filas vacías y, si no quedan, conservar las ya registradas
      const destFiltradas = (data.cuentasDestCliente ?? []).filter(r => r.cuentaId || (r.monto !== '' && r.monto != null))
      const cuentasDest = destFiltradas.length > 0 ? destFiltradas : (o.cuentasDest ?? [])
      return {
      ...o,
      estado: 'en_revision',
      cuentasQpaqIngreso: data.cuentasQpaqIngreso ?? [],
      cuentasQpaqEgreso:  data.cuentasQpaqEgreso  ?? [],
      cuentaQpaqIn:  data.cuentasQpaqIngreso?.[0]?.cuentaId || data.ctaIngreso || '',
      cuentaQpaqOut: data.cuentasQpaqEgreso?.[0]?.cuentaId  || data.ctaEgreso  || '',
      cuentasDest,
      comprobantes:  data.files,
      montoUSD:      data.montoUSD ?? o.montoUSD,
      tc:            data.tc       ?? o.tc,
      montoPEN:      o.tipo === 'cruzada' ? null : Math.round((data.montoUSD ?? o.montoUSD) * (data.tc ?? o.tc) * 100) / 100,
      enviadaBackOffice: new Date().toISOString(),
      }
    }))
    setView('bandeja')
    setEnvioOp(null)
    notify?.(`Operación ${id} enviada a Back Office para revisión.`)
  }

  function handleCreada(newOp) {
    setOps(prev => [newOp, ...prev])
    notify?.(`Cotización ${newOp.id} registrada correctamente.`)
  }

  function handleSubsanar(id, data) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => {
      if (o.id !== id) return o
      const comprobantesOriginales = (o.comprobantes ?? []).filter((_, i) => !(data.deletedOriginals ?? []).includes(i))
      const nMontoUSD = data.montoUSD ?? o.montoUSD
      const nTc       = data.tc       ?? o.tc
      const nMontoPEN = o.tipo === 'cruzada' ? null : Math.round(nMontoUSD * nTc * 100) / 100
      return {
        ...o,
        estado: 'subsanada',
        cuentaQpaqIn:  data.ctaIngreso  || o.cuentaQpaqIn,
        cuentaQpaqOut: data.ctaEgreso   || o.cuentaQpaqOut,
        // Cuentas (con sus montos) editadas en la subsanación
        cuentasQpaqIngreso: data.cuentasQpaqIngreso?.length ? data.cuentasQpaqIngreso : (o.cuentasQpaqIngreso ?? []),
        cuentasQpaqEgreso:  data.cuentasQpaqEgreso?.length  ? data.cuentasQpaqEgreso  : (o.cuentasQpaqEgreso  ?? []),
        cuentasDest:        data.cuentasDest?.length        ? data.cuentasDest        : (o.cuentasDest        ?? []),
        montoUSD: nMontoUSD,
        tc:       nTc,
        montoPEN: nMontoPEN,
        comprobantes: [...comprobantesOriginales, ...data.files],
        historial: [...(o.historial ?? []), {
          tipo: 'subsanacion', por: 'Trader',
          fecha: T, hora, detalle: 'Operación subsanada y reenviada a Back Office.',
        }],
      }
    }))
    setView('bandeja')
    setSubsanarOp(null)
    notify?.(`Observaciones de la operación ${id} subsanadas.`)
  }

  function handleLiquidar(id, { refTransferencia, fechaLiquidacion }) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => o.id === id ? {
      ...o,
      estado: 'liquidada',
      refTransferencia,
      fechaLiquidacion,
      fechaLiquidacionISO: T,
      historial: [...(o.historial ?? []), {
        tipo: 'liquidacion', por: 'Back Office',
        fecha: T, hora, detalle: `Operación liquidada. Referencia bancaria: ${refTransferencia}.`,
      }],
    } : o))
    setView('bandeja')
    setRevisarBOOp(null)
    notify?.(`Operación ${id} liquidada exitosamente.`)
  }

  function handleSolicitarReapertura(id, motivo) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => o.id === id ? {
      ...o,
      estado: 'pendiente_reapertura',
      solReapertura: { motivo, solicitadoPor: 'Back Office', fecha: T, hora },
      historial: [...(o.historial ?? []), {
        tipo: 'solicitud_reapertura', por: 'Back Office',
        fecha: T, hora, detalle: motivo,
      }],
    } : o))
    setRevertirOp(null)
  }

  function handleAprobarReapertura(id) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => o.id === id ? {
      ...o,
      estado: 'en_revision',
      solReapertura: null,
      historial: [...(o.historial ?? []), {
        tipo: 'reapertura_aprobada', por: 'Jefe de Operaciones',
        fecha: T, hora, detalle: 'Reapertura autorizada. Operación devuelta a En revisión — Back Office.',
      }],
    } : o))
    setAutorizarOp(null)
  }

  function handleRechazarReapertura(id, motivoRechazo) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => o.id === id ? {
      ...o,
      estado: 'liquidada',
      solReapertura: null,
      historial: [...(o.historial ?? []), {
        tipo: 'reapertura_rechazada', por: 'Jefe de Operaciones',
        fecha: T, hora, detalle: `Reapertura rechazada. Motivo: ${motivoRechazo}`,
      }],
    } : o))
    setAutorizarOp(null)
  }

  function handleAnularDesdeSubsanacion(opId) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => {
      if (o.id !== opId) return o
      return {
        ...o, estado: 'anulada', solAnulacion: null,
        fechaAnulacion: T, horaAnulacion: hora,
        anuladoPor: 'Trader', causaAnulacion: 'error_operativo',
        historial: [...(o.historial ?? []), {
          tipo: 'anulacion', por: 'Trader',
          fecha: T, hora, causa: 'error_operativo',
          detalle: 'Operación anulada desde el asistente de subsanación.',
        }],
      }
    }))
    setView('bandeja')
    setSubsanarOp(null)
    setInWizard?.(false)
    notify?.(`Operación ${opId} anulada.`)
  }

  function handleBOObservar(id, texto) {
    const { hora } = getNow()
    setOps(prev => prev.map(o => o.id === id ? {
      ...o,
      estado: 'observada',
      observadoPor: 'Back Office',
      textoObservacion: texto,
      fechaObservacion: `${T} ${hora}`,
      historial: [...(o.historial ?? []), {
        tipo: 'observacion', por: 'Back Office',
        fecha: T, hora, detalle: texto,
      }],
    } : o))
    setView('bandeja')
    setRevisarBOOp(null)
    setInWizard?.(false)
  }

  /* Vista: asistente confirmación abono */
  if (view === 'confirmar_abono')
    return <ConfirmarAbonoWizard op={envioOp} onBack={() => { setView('bandeja'); setEnvioOp(null); setInWizard?.(false) }} onConfirmar={(id, data) => { handleConfirmarAbono(id, data); setInWizard?.(false) }} onPreviewDoc={onPreviewDoc} />

  /* Vista: subsanación de observación */
  if (view === 'subsanar')
    return <SubsanacionWizard op={subsanarOp} onBack={() => { setView('bandeja'); setSubsanarOp(null) }} onSubsanar={(id, data) => { handleSubsanar(id, data); setInWizard?.(false) }} onPreviewDoc={onPreviewDoc} onAnular={handleAnularDesdeSubsanacion} />

  /* Vista: revisión de Back Office */
  if (view === 'revision_bo')
    return <RevisionBackOfficeWizard op={revisarBOOp} onBack={() => { setView('bandeja'); setRevisarBOOp(null) }} onLiquidar={(id, data) => { handleLiquidar(id, data); setInWizard?.(false) }} onObservar={(id, txt) => { handleBOObservar(id, txt); setInWizard?.(false) }} onPreviewDoc={onPreviewDoc} notify={notify} />

  /* Vista: wizard nueva cotización */
  if (view === 'nueva')
    return <CotizacionWizard onBack={() => { setView('bandeja'); setInWizard?.(false) }} onCreada={(data) => { handleCreada(data); setInWizard?.(false) }} marketData={marketData} ops={ops} />

  return (
    <>
      {/* Banner solicitudes pendientes anulación */}
      {stats.pendientesAnulacion > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 mb-4" style={{ border: '1px solid #fcd34d' }}>
          <Clock size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            {stats.pendientesAnulacion} solicitud{stats.pendientesAnulacion > 1 ? 'es' : ''} de anulación
            pendiente{stats.pendientesAnulacion > 1 ? 's' : ''} de revisión por Middle Office.
          </p>
        </div>
      )}

      {/* Banner solicitudes reapertura — solo head/jefe */}
      {(role === 'head' || role === 'jefe' || role === 'admin') && ops.filter(o => o.estado === 'pendiente_reapertura').length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-violet-50 mb-4" style={{ border: '1px solid #c4b5fd' }}>
          <div className="flex items-center gap-3">
            <Clock size={14} className="text-violet-500 shrink-0" />
            <p className="text-xs text-violet-700 font-medium">
              {ops.filter(o => o.estado === 'pendiente_reapertura').length} solicitud(es) de
              reapertura pendiente(s) de autorización.
            </p>
          </div>
          <button
            onClick={() => setAutorizarOp(ops.find(o => o.estado === 'pendiente_reapertura'))}
            className="text-[11px] font-semibold text-violet-700 px-3 py-1.5 rounded-lg bg-violet-100 hover:bg-violet-200 transition-colors"
          >
            Revisar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Reservadas',             value: stats.reservada,           color: 'text-blue-700'   },
          { label: 'Observadas',             value: stats.observada,           color: 'text-amber-700'  },
          { label: 'Liquidadas hoy',         value: stats.liquidada,           color: 'text-green-700'  },
          { label: 'Anuladas',               value: stats.anulada,             color: 'text-gray-500'   },
          { label: 'Solicitudes pendientes', value: stats.pendientesAnulacion, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setView('nueva')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          <Plus size={14} /> Nueva cotización
        </button>
      </div>

      {/* Filtros + buscador */}
      <div className="flex items-end gap-2 mb-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Estado</label>
          <div className="w-48">
            <MultiFilterSelect values={filtroEstados} onChange={v => { setFiltroEstados(v); resetPage() }}
              placeholder="Todos los estados"
              options={[
                { value: 'reservada',   label: 'Reservada'   },
                { value: 'observada',   label: 'Observada'   },
                { value: 'en_revision', label: 'En revisión' },
                { value: 'subsanada',   label: 'Subsanada'   },
                { value: 'liquidada',   label: 'Liquidada'   },
                { value: 'anulada',     label: 'Anulada'     },
              ]} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Tipo</label>
          <div className="w-36">
            <FilterSelect value={filtroTipo} onChange={v => { setFiltroTipo(v); resetPage() }}
              placeholder="Todos los tipos"
              options={[
                { value: '',       label: 'Todos los tipos' },
                { value: 'compra', label: 'Compra'          },
                { value: 'venta',  label: 'Venta'           },
              ]} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Desde</label>
          <div className="flex items-center bg-white rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}>
            <input type="date" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); resetPage() }}
              className="pl-3 pr-2 py-2 rounded-lg text-xs bg-transparent text-gray-700 outline-none cursor-pointer w-36" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Hasta</label>
          <div className="flex items-center bg-white rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}>
            <input type="date" value={dateTo} min={dateFrom || undefined}
              onChange={e => { setDateTo(e.target.value); resetPage() }}
              className="pl-3 pr-2 py-2 rounded-lg text-xs bg-transparent text-gray-700 outline-none cursor-pointer w-36" />
          </div>
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white w-60 transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}>
            <Search size={13} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Buscar correlativo o cliente…"
              value={search} onChange={e => { setSearch(e.target.value); resetPage() }}
              className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full" />
            {search && (
              <button onClick={() => { setSearch(''); resetPage() }} className="text-gray-300 hover:text-gray-500 shrink-0">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg overflow-x-auto" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse" style={{ minWidth: 960 }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['Correlativo', 'Fecha / Hora', 'Cliente', 'Tipo', 'Monto USD', 'TC',
                ...(activeTab === 'revision_back_office' ? ['Monto PEN'] : ['Ref / Fuente']),
                ...(role === 'admin' || role === 'back' ? ['Back Office'] : []),
                'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={(role === 'admin' || role === 'back') ? 10 : 9} className="px-4 py-12 text-center text-sm text-gray-400">
                  No se encontraron operaciones con esos criterios
                </td>
              </tr>
            )}
            {paged.map(op => {
              const em          = ESTADO_META[op.estado] ?? ESTADO_META.reservada
              const isAnulable  = em.anulable
              const hasSolicitud = !!op.solAnulacion
              const isAnulada   = op.estado === 'anulada'
              const isEditable  = (op.estado === 'reservada' || op.estado === 'observada') && !hasSolicitud

              return (
                <tr key={op.id}
                  className={clsx(
                    'border-b last:border-0 transition-colors',
                    isAnulada ? 'opacity-60 bg-gray-50/50' : 'hover:bg-gray-50/60'
                  )}
                  style={{ borderColor: 'var(--color-border)' }}>

                  <td className="px-4 py-3">
                    <span className={clsx('font-mono text-xs font-semibold', isAnulada ? 'text-gray-400 line-through' : 'text-gray-800')}>
                      {op.id}
                    </span>
                    {hasSolicitud && (
                      <span className="ml-2 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                        Sol. pendiente
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {fmtDate(op.fecha)}<br />
                    <span className="text-[11px] text-gray-400">{op.hora}</span>
                  </td>

                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-800 max-w-[160px] truncate">{op.clienteNombre}</p>
                    <p className="text-[10px] text-gray-400">{op.trader}</p>
                  </td>

                  <td className="px-4 py-3"><TipoBadge tipo={op.tipo} monedaCruzada={op.monedaCruzada} /></td>

                  <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap text-right">
                    {fmtMoney(op.montoUSD)}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-800 font-mono text-right">
                    {fmtTC(op.tc)}
                  </td>
                  {activeTab === 'revision_back_office' ? (
                    <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap text-right">
                      {op.montoPEN ? `S/ ${fmtMoney(op.montoPEN)}` : '—'}
                    </td>
                  ) : (
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-800 font-mono">{fmtTC(op.tcRef ?? 0)}</p>
                      <p className={clsx('text-[10px]', op.tcFuente === 'Manual' ? 'text-amber-600' : 'text-blue-500 font-bold uppercase opacity-60')}>
                        {op.tcFuente ?? '—'}
                      </p>
                    </td>
                  )}

                  {(role === 'admin' || role === 'back') && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {role === 'admin'
                        ? op.backOffice
                          ? <span className="text-xs text-gray-700">{op.backOffice}</span>
                          : <span className="text-[11px] text-gray-300 italic">Sin asignar</span>
                        : /* role === 'back': siempre es su propio nombre */
                          <span className="text-xs text-gray-700">{MOCK_BO_USER}</span>
                      }
                    </td>
                  )}

                  <td className="px-4 py-3"><EstadoBadge estado={op.estado} /></td>

                  {/* ── Acciones ── */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 whitespace-nowrap">

                      {/* Ver detalle — siempre visible */}
                      <button onClick={() => setVerOp(op)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver detalle">
                        <Eye size={14} />
                      </button>

                      {/* ACCIONES POR CONTEXTO DE PESTAÑA */}
                      {activeTab === 'pendientes_abono' ? (
                        <button
                          onClick={() => { setEnvioOp(op); setView('confirmar_abono') }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <ShieldCheck size={12} /> Confirmar Abono
                        </button>
                      ) : activeTab === 'operaciones_observadas' ? (
                        <button
                          onClick={() => { setSubsanarOp(op); setView('subsanar') }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 transition-colors"
                        >
                          <ShieldCheck size={12} /> Subsanar
                        </button>
                      ) : activeTab === 'revision_back_office' ? (
                        op.backOffice === null && role === 'back'
                          ? <button
                              onClick={() => handleTomarOperacion(op.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                            >
                              <ShieldCheck size={12} /> Tomar operación
                            </button>
                          : <button
                              onClick={() => { setRevisarBOOp(op); setView('revision_bo') }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-[11px] font-semibold hover:bg-gray-100 transition-colors"
                            >
                              <Eye size={12} /> Revisar operación
                            </button>
                      ) : (op.estado === 'liquidada' && (role === 'back' || role === 'admin')) ? (
                        (() => {
                          // Solo se pueden revertir operaciones liquidadas del mismo día
                          const esDelDia = (op.fechaLiquidacionISO ?? op.fecha) === T
                          return esDelDia ? (
                            <button
                              onClick={() => setRevertirOp(op)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-semibold hover:bg-violet-100 transition-colors"
                            >
                              <span className="text-xs">↺</span> Solicitar reapertura
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Solo puedes revertir operaciones liquidadas del día"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-300 text-[11px] font-semibold cursor-not-allowed"
                            >
                              <span className="text-xs">↺</span> Solicitar reapertura
                            </button>
                          )
                        })()
                      ) : (op.estado === 'pendiente_reapertura' && (role === 'head' || role === 'jefe' || role === 'admin')) ? (
                        <button
                          onClick={() => setAutorizarOp(op)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-semibold hover:bg-violet-100 transition-colors"
                        >
                          <span className="text-xs">✓</span> Autorizar reapertura
                        </button>
                      ) : (
                        /* CASO GENERAL: Bandeja de Operaciones y otras */
                        <>
                          {/* Editar */}
                          {isEditable && (
                            <button onClick={() => setEditOp(op)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Editar operación">
                              <Pencil size={14} />
                            </button>
                          )}

                          {/* Separador visual si hay acciones de anulación */}
                          {(isEditable && isAnulable) && (
                            <span className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />
                          )}

                          {/* Anulación: No solicitada */}
                          {isAnulable && !hasSolicitud && (
                            <div className="flex items-center gap-1">
                              {canSolicitar && (
                                <button onClick={() => setSolicitarOp(op)}
                                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                  title="Enviar solicitud de anulación">
                                  <Send size={14} />
                                </button>
                              )}
                              {canEjecutar && (
                                <button onClick={() => setAnularOp(op)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Anular directamente">
                                  <Ban size={14} />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Anulación: Ya solicitada */}
                          {isAnulable && hasSolicitud && (
                            <div className="flex items-center gap-1">
                              {/* Solo Middle Office o Head revisan solicitudes */}
                              {(role === 'middle' || role === 'head' || role === 'admin') ? (
                                <button onClick={() => setRevisarOp(op)}
                                  className={clsx(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors",
                                    role === 'admin'
                                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                      : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  )}>
                                  <Clock size={11} /> {role === 'admin' ? 'Aprobar anulación' : 'Revisar'}
                                </button>
                              ) : (
                                <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                                   <Clock size={10} /> Solicitada
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Enviada (solo visual) si no es anulable ni editable */}
                          {!isAnulable && !isEditable && op.estado === 'en_revision' && (
                            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 px-2">
                               <Clock size={10} /> Enviada
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Paginación */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Mostrar</span>
              <FilterSelect
                value={String(pageSize)}
                onChange={v => { setPageSize(Number(v)); resetPage() }}
                placeholder=""
                options={[5, 10, 25, 50].map(n => ({ value: String(n), label: String(n) }))}
              />
              <span>por página · <span className="font-medium text-gray-700">{filtered.length}</span> operación{filtered.length !== 1 ? 'es' : ''}</span>
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

      {/* ── Drawers ── */}
      <SolicitarDrawer    open={!!solicitarOp} op={solicitarOp} onClose={() => setSolicitarOp(null)} onSolicitar={handleSolicitar} />
      <AnularDirectoDrawer open={!!anularOp}   op={anularOp}   onClose={() => setAnularOp(null)}    onConfirmAnular={handleAnularDirecto} />
      <RevisarDrawer      open={!!revisarOp}   op={revisarOp}  onClose={() => setRevisarOp(null)}    onAprobar={handleAprobar} onRechazar={handleRechazar} />
      <VerDetalleDrawer open={!!verOp}  op={verOp}  onClose={() => setVerOp(null)} />
      <EditarDrawer     open={!!editOp} op={editOp} ops={ops} onClose={() => setEditOp(null)} onGuardar={handleEditar} />

      {/* RF-17 — Drawer de Reapertura (solicitar) */}
      {revertirOp && (
        <ReaperturaDrawer
          op={revertirOp} modo="solicitar" role={role}
          onSolicitar={handleSolicitarReapertura}
          onAprobar={handleAprobarReapertura}
          onRechazar={handleRechazarReapertura}
          onClose={() => setRevertirOp(null)}
        />
      )}

      {/* RF-17 — Drawer de Reapertura (autorizar) */}
      {autorizarOp && (
        <ReaperturaDrawer
          op={autorizarOp} modo="autorizar" role={role}
          onSolicitar={handleSolicitarReapertura}
          onAprobar={handleAprobarReapertura}
          onRechazar={handleRechazarReapertura}
          onClose={() => setAutorizarOp(null)}
        />
      )}
    </>
  )
}


