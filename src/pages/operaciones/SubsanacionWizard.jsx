import { useState, useRef } from 'react'
import {
  ArrowLeft, Check, ChevronRight,
  AlertTriangle, Upload, FileText, Trash2,
  CheckCircle2, Clock, ShieldCheck, Eye, XCircle, Plus, X,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney, parseMoney, fmtDateTime } from '../../utils/format.js'

/* ══════════════════════════════════════════════
   MOCK — Cuentas QAPAQ y del cliente (catálogo compartido)
══════════════════════════════════════════════ */
const CUENTAS_QAPAQ = {
  USD: [
    { id: 'QP-USD-1', banco: 'BCP',       numero: '191-9000001-0-01', moneda: 'USD' },
    { id: 'QP-USD-2', banco: 'Interbank', numero: '200-9000002-001',  moneda: 'USD' },
  ],
  PEN: [
    { id: 'QP-PEN-1', banco: 'BCP',        numero: '191-9000003-0-01', moneda: 'PEN' },
    { id: 'QP-PEN-2', banco: 'Scotiabank', numero: '00-272-9000004',   moneda: 'PEN' },
  ],
}

const CUENTAS_CLIENTE = {
  'CLI-001': [
    { id: 'CTA-001', banco: 'BCP',       moneda: 'USD', numero: '191-1234567-0-12',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-002', banco: 'Interbank', moneda: 'PEN', numero: '200-3000123456',             tipo: 'propia',  convenio: true  },
    { id: 'CTA-003', banco: 'Scotia',    moneda: 'USD', numero: '00-272-123456789',           tipo: 'tercero', convenio: false },
    { id: 'CTA-004', banco: 'BBVA',      moneda: 'EUR', numero: '0011-0111-11-0100001234',   tipo: 'propia',  convenio: true  },
  ],
  'CLI-002': [
    { id: 'CTA-010', banco: 'BBVA',      moneda: 'USD', numero: '0011-0111-11-0100075234',   tipo: 'propia',  convenio: true  },
    { id: 'CTA-011', banco: 'BCP',       moneda: 'PEN', numero: '191-2345678-0-45',          tipo: 'tercero', convenio: true  },
  ],
  'CLI-003': [
    { id: 'CTA-030', banco: 'BCP',       moneda: 'USD', numero: '191-3000001-0-55',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-031', banco: 'BCP',       moneda: 'PEN', numero: '191-3000002-0-11',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-032', banco: 'Interbank', moneda: 'USD', numero: '200-3100099-001',            tipo: 'tercero', convenio: true  },
  ],
  'CLI-004': [
    { id: 'CTA-040', banco: 'Scotiabank',moneda: 'PEN', numero: '00-272-4000001',            tipo: 'propia',  convenio: true  },
    { id: 'CTA-041', banco: 'BBVA',      moneda: 'USD', numero: '0011-0444-44-0100044001',   tipo: 'propia',  convenio: true  },
  ],
  'CLI-005': [
    { id: 'CTA-050', banco: 'BCP',       moneda: 'PEN', numero: '191-5000001-0-88',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-051', banco: 'BBVA',      moneda: 'USD', numero: '0011-0222-22-0100088001',   tipo: 'propia',  convenio: true  },
    { id: 'CTA-052', banco: 'Interbank', moneda: 'PEN', numero: '200-5000099-001',            tipo: 'tercero', convenio: false },
  ],
  'CLI-006': [
    { id: 'CTA-060', banco: 'BCP',       moneda: 'PEN', numero: '191-6000001-0-22',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-061', banco: 'Interbank', moneda: 'USD', numero: '200-6000012-001',            tipo: 'propia',  convenio: true  },
  ],
  'CLI-007': [
    { id: 'CTA-070', banco: 'BCP',       moneda: 'USD', numero: '191-7000001-0-33',          tipo: 'propia',  convenio: true  },
    { id: 'CTA-071', banco: 'BBVA',      moneda: 'PEN', numero: '0011-0777-77-0100077001',   tipo: 'propia',  convenio: true  },
  ],
}

/* Etiqueta legible de una cuenta a partir de su id */
/* Cuenta pendiente transversal (cliente / egreso / ingreso) */
const CUENTA_PENDIENTE_ID = 'PENDIENTE'
const CUENTA_PENDIENTE_LABEL = 'Cuenta por definir (pendiente)'

function labelCuentaQpaq(ctaId) {
  if (!ctaId) return '—'
  if (ctaId === CUENTA_PENDIENTE_ID) return CUENTA_PENDIENTE_LABEL
  for (const arr of Object.values(CUENTAS_QAPAQ)) {
    const c = arr.find(x => x.id === ctaId)
    if (c) return `${c.banco} · ${c.numero} (${c.moneda})`
  }
  return ctaId
}
function labelCuentaCliente(clienteId, ctaId) {
  if (!ctaId) return '—'
  if (ctaId === CUENTA_PENDIENTE_ID) return CUENTA_PENDIENTE_LABEL
  const c = (CUENTAS_CLIENTE[clienteId] ?? []).find(x => x.id === ctaId)
  return c ? `${c.banco} · ${c.numero} (${c.moneda})${c.tipo === 'tercero' ? ' — Tercero' : ''}` : ctaId
}

const STEPS = [
  { id: 1, label: 'Observación'  },
  { id: 2, label: 'Corrección'   },
  { id: 3, label: 'Reenvío'      },
]

/* ══════════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════════ */
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-start justify-center">
      {STEPS.map((step, i) => {
        const done   = step.id < currentStep
        const active = step.id === currentStep
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                done   ? 'bg-amber-500 text-white'
                : active ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                :          'bg-gray-100 text-gray-400'
              )}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={clsx('mt-1.5 text-[11px] font-medium whitespace-nowrap',
                active ? 'text-amber-600' : done ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('h-px mt-3.5 mx-3 transition-all', done ? 'bg-amber-400' : 'bg-gray-200')}
                style={{ width: 56 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════
   ATOMS
══════════════════════════════════════════════ */
function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function ResumenRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className={clsx('text-sm font-medium', mono ? 'font-mono text-gray-700' : 'text-gray-800')}>{value || '—'}</p>
    </div>
  )
}

function ResumenCard({ title, accent, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className={clsx('px-4 py-2.5 border-b', accent ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200')}>
        <p className={clsx('text-[11px] font-semibold uppercase tracking-wider', accent ? 'text-amber-700' : 'text-gray-500')}>{title}</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

const selectCls = (err) => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all',
  err ? 'border-red-400 ring-2 ring-red-50'
      : 'border-gray-200 hover:border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-50'
)

/* ══════════════════════════════════════════════
   SECCIÓN DE CUENTAS EDITABLE (multi-fila con monto)
══════════════════════════════════════════════ */
function CuentaSection({ title, moneda, rows, setRows, options, total, error }) {
  const suma = rows.reduce((a, r) => a + (parseMoney(r.monto) || 0), 0)
  const dif  = total != null ? Math.round((total - suma) * 100) / 100 : null
  const showDif = dif !== null && Math.abs(dif) > 0.005

  function update(idx, field, val) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function add() {
    const restante = total != null ? Math.round((total - suma) * 100) / 100 : null
    setRows(prev => [...prev, { cuentaId: '', monto: restante !== null && restante > 0 ? fmtMoney(restante) : '' }])
  }
  function remove(idx) {
    setRows(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {title}<span className="ml-1 font-normal normal-case text-gray-300">({moneda})</span>
        </p>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors">
          <Plus size={12} /> Agregar
        </button>
      </div>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                {idx === 0 ? 'Cuenta principal' : `Cuenta adicional ${idx}`}
              </p>
              {rows.length > 1 && (
                <button type="button" onClick={() => remove(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={row.cuentaId} onChange={e => update(idx, 'cuentaId', e.target.value)} className={selectCls(false)}>
                <option value="">Seleccionar cuenta…</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{moneda}</span>
                <input type="text" inputMode="numeric" placeholder="0.00"
                  value={row.monto}
                  onChange={e => update(idx, 'monto', e.target.value.replace(/[^0-9.,]/g, ''))}
                  onBlur={() => { const n = parseMoney(row.monto); if (!isNaN(n) && n > 0) update(idx, 'monto', fmtMoney(n)) }}
                  onFocus={() => update(idx, 'monto', String(row.monto).replace(/,/g, ''))}
                  className="w-full pl-12 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-right outline-none transition-all hover:border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-50" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {showDif && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg mt-2">
          <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-red-700">
            La suma ({moneda} {fmtMoney(suma)}) difiere del total esperado ({moneda} {fmtMoney(total)}).
            Diferencia: {fmtMoney(Math.abs(dif))}. <strong>Ajusta los montos para continuar.</strong>
          </p>
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle size={10} />{error}</p>}
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 1 — OBSERVACIÓN DE BACK OFFICE (solo lectura)
══════════════════════════════════════════════ */
function Step1({ op }) {
  const obs = op.observacion ?? op.historial?.filter(h => h.tipo === 'observacion').at(-1)

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Observación de Back Office</h3>
        <p className="text-xs text-gray-500">
          Revisa la observación registrada por Back Office. Este campo es de solo lectura. Debes atender el problema indicado antes de reenviar la operación.
        </p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Observación registrada</span>
          </div>
          <span className="text-[11px] text-amber-600 font-medium">
            {obs?.fecha ? fmtDateTime(obs.fecha) : (op.fechaObservacion ?? '—')}
          </span>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed font-medium">
          {obs?.detalle ?? op.textoObservacion ?? 'Sin descripción registrada.'}
        </p>
        <p className="text-[11px] text-amber-600">
          Registrado por: <strong>{obs?.por ?? op.observadoPor ?? 'Back Office'}</strong>
        </p>
      </div>

      <ResumenCard title="Datos de la operación (solo lectura)">
        <ResumenRow label="ID Operación"    value={op.id} mono />
        <ResumenRow label="Cliente"         value={op.clienteNombre} />
        <ResumenRow label="Tipo"            value={op.tipo?.toUpperCase()} />
        <ResumenRow label="TC pactado"      value={op.tc?.toFixed(3)} mono />
        <ResumenRow label="Monto USD"       value={'$ ' + fmtMoney(op.montoUSD)} />
        <ResumenRow label="Monto PEN"       value={'S/ ' + fmtMoney(op.montoPEN)} />
      </ResumenCard>

      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-700">
          <p className="font-medium mb-1">Si la observación requiere cambiar el <strong>tipo de operación</strong> (compra ↔ venta), la operación debe anularse y registrarse nuevamente.</p>
          <p>Para correcciones de monto, TC o cuentas, avanza al siguiente paso.</p>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 2 — CORRECCIÓN (datos + cuentas con montos + docs)
══════════════════════════════════════════════ */
function Step2({ op, editMonto, setEditMonto, editTc, setEditTc,
                 qpaqIngreso, setQpaqIngreso, qpaqEgreso, setQpaqEgreso,
                 cuentasDest, setCuentasDest,
                 files, setFiles, errors, deletedOriginals, setDeletedOriginals, onPreviewDoc,
                 totals }) {
  const fileInputRef = useRef(null)

  const { monedaIngreso, monedaEgreso, monedaDest, totalIngreso, totalEgreso, totalDest } = totals

  const PENDIENTE_OPT = { value: CUENTA_PENDIENTE_ID, label: CUENTA_PENDIENTE_LABEL }
  const optsIngreso = [...(CUENTAS_QAPAQ[monedaIngreso] || []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` })), PENDIENTE_OPT]
  const optsEgreso  = [...(CUENTAS_QAPAQ[monedaEgreso]  || []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` })), PENDIENTE_OPT]
  const optsDest    = [...(CUENTAS_CLIENTE[op.clienteId] ?? [])
    .filter(c => c.moneda === monedaDest)
    .map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})${c.tipo === 'tercero' ? ' — Tercero' : ''}` })), PENDIENTE_OPT]

  const archivosExistentes = op.comprobantes ?? []
  const archivosActivosCnt = archivosExistentes.filter((_, i) => !deletedOriginals.has(i)).length
  const totalArchivos = archivosActivosCnt + files.length

  function handleFileChange(e) {
    const incoming = Array.from(e.target.files)
    if (totalArchivos + incoming.length > 5) {
      alert(`Límite excedido. Ya hay ${totalArchivos} archivo(s). Máximo 5 en total.`)
      return
    }
    const valid = incoming.filter(f => {
      const ok = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
      const sz = f.size <= 10 * 1024 * 1024
      if (!ok) alert(`Formato no válido: ${f.name}`)
      if (!sz) alert(`Excede 10 MB: ${f.name}`)
      return ok && sz
    })
    setFiles(prev => [...prev, ...valid])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  function removeFile(idx) { setFiles(prev => prev.filter((_, i) => i !== idx)) }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Corrección de datos editables</h3>
        <p className="text-xs text-gray-500">
          Se muestran los datos registrados de la operación. Corrige montos, tipo de cambio, cuentas QAPAQ y cuentas del cliente según la observación, y adjunta la documentación solicitada.
        </p>
      </div>

      {/* Datos editables */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos editables de la operación</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monto (USD)" hint="Modifica si el monto observado es incorrecto">
            <input type="number" step="0.01" min="0" value={editMonto}
              onChange={e => setEditMonto(e.target.value)} placeholder="Ej: 50000.00"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-50 font-mono" />
          </Field>
          <Field label="TC pactado" hint="Tipo de cambio pactado con el cliente">
            <input type="number" step="0.001" min="0" value={editTc}
              onChange={e => setEditTc(e.target.value)} placeholder="Ej: 3.742"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-50 font-mono" />
          </Field>
        </div>
      </div>

      {/* Cuentas QAPAQ */}
      <div className="space-y-4">
        <CuentaSection title="Cuenta QAPAQ – Ingreso" moneda={monedaIngreso}
          rows={qpaqIngreso} setRows={setQpaqIngreso} options={optsIngreso}
          total={totalIngreso} error={errors?.qpaqIngreso} />
        <CuentaSection title="Cuenta QAPAQ – Egreso" moneda={monedaEgreso}
          rows={qpaqEgreso} setRows={setQpaqEgreso} options={optsEgreso}
          total={totalEgreso} error={errors?.qpaqEgreso} />
      </div>

      {/* Cuentas destino del cliente */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Cuentas destino del cliente</p>
        <CuentaSection title="Cuenta del cliente" moneda={monedaDest}
          rows={cuentasDest} setRows={setCuentasDest} options={optsDest}
          total={totalDest} error={errors?.cuentasDest} />
        {optsDest.length === 0 && (
          <p className="text-[11px] text-amber-600 mt-1.5">El cliente no tiene cuentas registradas en {monedaDest}. Regístralas en el módulo Clientes.</p>
        )}
      </div>

      {/* Documentación adicional */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Documentación adicional</p>
          <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full',
            totalArchivos >= 5 ? 'bg-red-50 text-red-500' :
            totalArchivos > 0  ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400')}>
            {totalArchivos} / 5 archivos
          </span>
        </div>

        {archivosExistentes.length > 0 && (
          <div className="mb-3 space-y-1">
            <p className="text-[11px] text-gray-400 mb-2">Comprobantes originales (enviados anteriormente):</p>
            {archivosExistentes.map((f, i) => {
              const isDeleted = deletedOriginals.has(i)
              return (
                <div key={i} className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg border transition-all', isDeleted ? 'border-red-200 bg-red-50 opacity-50' : 'border-gray-100 bg-gray-50')}>
                  <FileText size={13} className={clsx('shrink-0', isDeleted ? 'text-red-300' : 'text-gray-400')} />
                  <p className={clsx('text-xs truncate', isDeleted ? 'text-red-400 line-through' : 'text-gray-500')}>{f.name ?? `Comprobante ${i + 1}`}</p>
                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    {!isDeleted && (
                      <button onClick={() => onPreviewDoc?.(f.name ?? `Comprobante ${i + 1}`)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 transition-colors">
                        <Eye size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setDeletedOriginals(prev => {
                        const next = new Set(prev)
                        if (next.has(i)) next.delete(i); else next.add(i)
                        return next
                      })}
                      title={isDeleted ? 'Restaurar' : 'Eliminar comprobante'}
                      className={clsx('p-1 rounded transition-colors', isDeleted ? 'hover:bg-red-100 text-red-400' : 'hover:bg-red-50 text-gray-300 hover:text-red-500')}>
                      <Trash2 size={13} />
                    </button>
                    {!isDeleted && <span className="text-[10px] text-gray-400">Original</span>}
                    {isDeleted && <span className="text-[10px] text-red-400">Eliminado</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalArchivos < 5 && (
          <div onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-gray-50 hover:bg-amber-50/40 hover:border-amber-300 cursor-pointer transition-all">
            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            <Upload size={20} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Adjuntar comprobante adicional</p>
            <p className="text-xs text-gray-400">PDF, JPG o PNG — máx. 10 MB c/u · Quedan {5 - totalArchivos} espacios</p>
          </div>
        )}

        {totalArchivos >= 5 && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 text-center">
            Límite de 5 archivos alcanzado. No puedes adjuntar más comprobantes.
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] text-gray-400">Nuevos archivos a adjuntar:</p>
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-amber-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-700 truncate">{f.name}</p>
                    <p className="text-[10px] text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => onPreviewDoc?.(f.name)} className="p-1 rounded hover:bg-amber-100 text-amber-500 transition-colors">
                    <Eye size={13} />
                  </button>
                  <button onClick={() => removeFile(i)} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 3 — REENVÍO (resumen + confirmación)
══════════════════════════════════════════════ */
function ResumenCuentas({ title, rows, moneda, labelFn }) {
  const visibles = rows.filter(r => r.cuentaId || (r.monto !== '' && r.monto != null))
  if (visibles.length === 0) return null
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title} <span className="text-gray-400 font-normal normal-case">({moneda})</span></p>
      </div>
      <div className="divide-y divide-gray-100">
        {visibles.map((row, idx) => (
          <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-600 truncate">{labelFn(row.cuentaId)}</p>
            <p className="text-sm font-mono text-gray-700 shrink-0">{row.monto ? `${moneda} ${fmtMoney(row.monto)}` : '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step3({ op, qpaqIngreso, qpaqEgreso, cuentasDest, files, editMonto, editTc, deletedOriginals, totals }) {
  const { monedaIngreso, monedaEgreso, monedaDest } = totals
  const archivosExistentesActivos = (op.comprobantes ?? []).filter((_, i) => !deletedOriginals.has(i)).length
  const totalArchivos = archivosExistentesActivos + files.length

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Resumen del reenvío a Back Office</h3>
        <p className="text-xs text-gray-500">
          Verifica los cambios antes de confirmar. La operación pasará al estado <strong>Subsanada</strong> y volverá a la bandeja de revisión de Back Office.
        </p>
      </div>

      <ResumenCard title="Operación">
        <ResumenRow label="ID"         value={op.id} mono />
        <ResumenRow label="Cliente"    value={op.clienteNombre} />
        <ResumenRow label="Monto USD"  value={`$ ${fmtMoney(editMonto || op.montoUSD)}`} />
        <ResumenRow label="TC pactado" value={parseFloat(editTc || op.tc).toFixed(3)} mono />
      </ResumenCard>

      <ResumenCuentas title="Cuenta QAPAQ – Ingreso" rows={qpaqIngreso} moneda={monedaIngreso} labelFn={labelCuentaQpaq} />
      <ResumenCuentas title="Cuenta QAPAQ – Egreso"  rows={qpaqEgreso}  moneda={monedaEgreso}  labelFn={labelCuentaQpaq} />
      <ResumenCuentas title="Cuentas destino del cliente" rows={cuentasDest} moneda={monedaDest} labelFn={(id) => labelCuentaCliente(op.clienteId, id)} />

      <ResumenCard title="Documentación">
        <ResumenRow label="Total archivos adjuntos" value={`${totalArchivos} comprobante${totalArchivos !== 1 ? 's' : ''}`} />
        <ResumenRow label="Estado destino" value="Subsanada → Back Office" />
      </ResumenCard>

      {deletedOriginals.size > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">{deletedOriginals.size} comprobante(s) original(es) marcado(s) para eliminación.</p>
        </div>
      )}

      <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />
        <p className="text-xs text-green-700">
          Al confirmar, la operación saldrá de tu bandeja de observadas y quedará en cola para revisión de Back Office.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   HELPERS DE CARGA INICIAL
══════════════════════════════════════════════ */
// Normaliza filas {cuentaId, monto} desde la operación; precarga el total si falta el monto de una única cuenta
function initRows(raw, fallbackId, total) {
  let rows = (raw ?? [])
    .map(r => typeof r === 'string'
      ? { cuentaId: r, monto: '' }
      : { cuentaId: r.cuentaId || '', monto: (r.monto != null && r.monto !== '' && !isNaN(parseMoney(r.monto))) ? fmtMoney(parseMoney(r.monto)) : '' })
    .filter(r => r.cuentaId || r.monto)
  if (rows.length === 0) rows = [{ cuentaId: fallbackId || '', monto: '' }]
  if (rows.length === 1 && rows[0].monto === '' && total != null && total > 0) {
    rows = [{ ...rows[0], monto: fmtMoney(total) }]
  }
  return rows
}

/* ══════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════ */
export default function SubsanacionWizard({ op, onBack, onSubsanar, onPreviewDoc, onAnular }) {
  const [step,       setStep]       = useState(1)
  const [files,      setFiles]      = useState([])
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [deletedOriginals, setDeletedOriginals] = useState(new Set())
  const [editMonto, setEditMonto] = useState(String(op?.montoUSD ?? ''))
  const [editTc,    setEditTc]    = useState(String(op?.tc ?? ''))

  // Totales por lado, recalculados en vivo con monto/TC editados
  const isCompra   = op?.tipo === 'compra'
  const montoUSDn  = parseFloat(editMonto) || op?.montoUSD || 0
  const tcNum      = parseFloat(editTc)    || op?.tc       || 0
  const montoPENn  = op?.tipo === 'cruzada' ? (op?.montoPEN ?? 0) : Math.round(montoUSDn * tcNum * 100) / 100
  const monedaIngreso = isCompra ? 'USD' : 'PEN'   // entra a QAPAQ: compra recibe USD, venta recibe PEN
  const monedaEgreso  = isCompra ? 'PEN' : 'USD'   // sale de QAPAQ: compra paga PEN(soles), venta paga USD
  const monedaDest    = isCompra ? 'PEN' : 'USD'   // el cliente recibe lo que QAPAQ egresa
  const totalIngreso  = isCompra ? montoUSDn : montoPENn
  const totalEgreso   = isCompra ? montoPENn : montoUSDn
  const totalDest     = totalEgreso
  const totals = { monedaIngreso, monedaEgreso, monedaDest, totalIngreso, totalEgreso, totalDest }

  // Estado de cuentas, precargado desde la operación (con respaldo de totales)
  const [qpaqIngreso, setQpaqIngreso] = useState(() => initRows(op?.cuentasQpaqIngreso, op?.cuentaQpaqIn,  totalIngreso))
  const [qpaqEgreso,  setQpaqEgreso]  = useState(() => initRows(op?.cuentasQpaqEgreso,  op?.cuentaQpaqOut, totalEgreso))
  const [cuentasDest, setCuentasDest] = useState(() => initRows(op?.cuentasDest, '', totalDest))

  if (!op) return null

  function validateStep2() {
    const e = {}
    const sum = arr => arr.reduce((a, r) => a + (parseMoney(r.monto) || 0), 0)
    const tieneCuenta = arr => arr.some(r => r.cuentaId)

    if (!tieneCuenta(qpaqIngreso)) e.qpaqIngreso = 'Selecciona al menos una cuenta de ingreso.'
    else if (totalIngreso > 0 && Math.abs(totalIngreso - sum(qpaqIngreso)) > 0.005) e.qpaqIngreso = 'La suma de las cuentas de ingreso debe igualar el total de la operación.'

    if (!tieneCuenta(qpaqEgreso)) e.qpaqEgreso = 'Selecciona al menos una cuenta de egreso.'
    else if (totalEgreso > 0 && Math.abs(totalEgreso - sum(qpaqEgreso)) > 0.005) e.qpaqEgreso = 'La suma de las cuentas de egreso debe igualar el monto de la operación.'

    if (!tieneCuenta(cuentasDest)) e.cuentasDest = 'Selecciona al menos una cuenta destino del cliente.'
    else if (totalDest > 0 && Math.abs(totalDest - sum(cuentasDest)) > 0.005) e.cuentasDest = 'La suma de las cuentas del cliente debe igualar el total de la operación.'

    return e
  }

  function handleNext() {
    if (step === 2) {
      const e = validateStep2()
      if (Object.keys(e).length > 0) { setErrors(e); return }
    }
    setErrors({})
    setStep(s => s + 1)
  }

  function handlePrev() {
    setErrors({})
    setStep(s => s - 1)
  }

  function handleSubsanar() {
    setLoading(true)
    const limpiar = arr => arr.filter(r => r.cuentaId).map(r => ({ cuentaId: r.cuentaId, monto: String(parseMoney(r.monto) || '') }))
    setTimeout(() => {
      onSubsanar(op.id, {
        cuentasQpaqIngreso: limpiar(qpaqIngreso),
        cuentasQpaqEgreso:  limpiar(qpaqEgreso),
        cuentasDest:        limpiar(cuentasDest),
        ctaIngreso: qpaqIngreso.find(r => r.cuentaId)?.cuentaId || '',
        ctaEgreso:  qpaqEgreso.find(r => r.cuentaId)?.cuentaId || '',
        files,
        montoUSD: parseFloat(editMonto) || op.montoUSD,
        tc: parseFloat(editTc) || op.tc,
        deletedOriginals: Array.from(deletedOriginals),
      })
      setLoading(false)
    }, 1000)
  }

  const e2 = step === 2 ? validateStep2() : {}
  const canNext2 = Object.keys(e2).length === 0

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* ── Volver ── */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 font-medium mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver a Operaciones Observadas
      </button>

      {/* ── Stepper ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
        <StepIndicator currentStep={step} />
      </div>

      {/* ── Contenido ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
        <div className="mb-4">
          {step === 1 && <Step1 op={op} />}
          {step === 2 && (
            <Step2
              op={op}
              editMonto={editMonto} setEditMonto={setEditMonto}
              editTc={editTc}       setEditTc={setEditTc}
              qpaqIngreso={qpaqIngreso} setQpaqIngreso={setQpaqIngreso}
              qpaqEgreso={qpaqEgreso}   setQpaqEgreso={setQpaqEgreso}
              cuentasDest={cuentasDest} setCuentasDest={setCuentasDest}
              files={files}           setFiles={setFiles}
              errors={errors}
              deletedOriginals={deletedOriginals} setDeletedOriginals={setDeletedOriginals}
              onPreviewDoc={onPreviewDoc}
              totals={totals}
            />
          )}
          {step === 3 && (
            <Step3
              op={op}
              qpaqIngreso={qpaqIngreso}
              qpaqEgreso={qpaqEgreso}
              cuentasDest={cuentasDest}
              files={files}
              editMonto={editMonto}
              editTc={editTc}
              deletedOriginals={deletedOriginals}
              totals={totals}
            />
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
        <button onClick={step === 1 ? onBack : handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95">
          <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {(step === 1 || step === 2) && onAnular && (
          <button onClick={() => onAnular(op.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all">
            <XCircle size={14} /> Anular operación
          </button>
        )}

        {step < 3 && (
          <button onClick={handleNext} disabled={step === 2 && !canNext2}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95',
              step === 2 && !canNext2 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'
            )}>
            Siguiente <ChevronRight size={15} />
          </button>
        )}

        {step === 3 && (
          <button onClick={handleSubsanar} disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 shadow-sm transition-all active:scale-95 disabled:opacity-60">
            {loading
              ? <><Clock size={14} className="animate-spin" /> Enviando…</>
              : <><ShieldCheck size={14} /> Confirmar y reenviar</>}
          </button>
        )}
      </div>

    </div>
  )
}
