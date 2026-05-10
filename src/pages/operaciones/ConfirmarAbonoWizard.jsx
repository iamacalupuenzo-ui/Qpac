import { useState, useRef } from 'react'
import {
  ArrowLeft, Check, ChevronRight,
  AlertTriangle, Info, Upload, FileText, Trash2,
  CheckCircle2, Clock, ShieldCheck, Eye, Plus, X, AlertCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney, parseMoney } from '../../utils/format.js'

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

const CUENTAS_DISPLAY = {
  'CTA-001': 'BCP · 191-1234567-0-12 (USD)',
  'CTA-002': 'Interbank · 200-3000123456 (PEN)',
  'CTA-003': 'Scotia · 00-272-123456789 (USD)',
  'CTA-004': 'BBVA · 0011-0111-11-0100001234 (EUR)',
  'CTA-010': 'BBVA · 0011-0111-11-0100075234 (USD)',
  'CTA-011': 'BCP · 191-2345678-0-45 (PEN)',
  'CTA-030': 'BCP · 191-3000001-0-55 (USD)',
  'CTA-031': 'BCP · 191-3000002-0-11 (PEN)',
  'CTA-032': 'Interbank · 200-3100099-001 (USD)',
  'CTA-040': 'Scotiabank · 00-272-4000001 (PEN)',
  'CTA-041': 'BBVA · 0011-0444-44-0100044001 (USD)',
  'CTA-050': 'BCP · 191-5000001-0-88 (PEN)',
  'CTA-051': 'BBVA · 0011-0222-22-0100088001 (USD)',
  'CTA-052': 'Interbank · 200-5000099-001 (PEN)',
  'CTA-060': 'BCP · 191-6000001-0-22 (PEN)',
  'CTA-061': 'Interbank · 200-6000012-001 (USD)',
  'CTA-070': 'BCP · 191-7000001-0-33 (USD)',
  'CTA-071': 'BBVA · 0011-0777-77-0100077001 (PEN)',
  transitoria: 'Cuenta transitoria QAPAQ',
}

const QAPAQ_DISPLAY = {
  'QP-USD-1': 'BCP · 191-9000001-0-01 (USD)',
  'QP-USD-2': 'Interbank · 200-9000002-001 (USD)',
  'QP-PEN-1': 'BCP · 191-9000003-0-01 (PEN)',
  'QP-PEN-2': 'Scotiabank · 00-272-9000004 (PEN)',
}

const STEPS = [
  { id: 1, label: 'Verificación'  },
  { id: 2, label: 'Documentación' },
  { id: 3, label: 'Confirmación'  },
]

const MAX_FILES = 10

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
                done   ? 'bg-blue-600 text-white'
                : active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                :          'bg-gray-100 text-gray-400'
              )}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={clsx('mt-1.5 text-[11px] font-medium whitespace-nowrap',
                active ? 'text-blue-600' : done ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('h-px mt-3.5 mx-3 transition-all', done ? 'bg-blue-400' : 'bg-gray-200')}
                style={{ width: 56 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  )
}

function ResumenRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
    </div>
  )
}

function ResumenCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

const inputCls = (err) => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all',
  err
    ? 'border-red-400 ring-2 ring-red-50'
    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
)

function Step1({ op, monto, tc }) {
  const montoN = parseMoney(monto)
  const tcN    = parseFloat(tc)
  const montoPEN = !isNaN(montoN) && montoN > 0 && !isNaN(tcN) && tcN > 0
    ? montoN * tcN
    : null

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Verificación de datos</h3>
        <p className="text-xs text-gray-500">
          Revisa los datos de la operación. El monto y TC pactado vienen de la cotización y no pueden modificarse.
        </p>
      </div>

      <ResumenCard title="Identificación">
        <ResumenRow label="ID Operación" value={op.id} />
        <ResumenRow label="Cliente"      value={op.clienteNombre} />
        <ResumenRow label="Trader"       value={op.trader} />
        <ResumenRow label="Mesa"         value={op.mesa} />
      </ResumenCard>

      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Condiciones pactadas</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monto USD">
            <div className="w-full pl-3 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-right font-mono text-gray-700">
              $ {monto}
            </div>
          </Field>

          <Field label="TC pactado">
            <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-right font-mono text-gray-700">
              {tcN ? tcN.toFixed(4) : '—'}
            </div>
          </Field>

          <Field label="Tipo de operación">
            <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed">
              {op.tipo?.toUpperCase() ?? '—'}
            </div>
          </Field>

          <Field label="Contravalor PEN" hint="Monto × TC">
            <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-right font-mono text-gray-600">
              {montoPEN !== null ? `S/ ${fmtMoney(montoPEN)}` : '—'}
            </div>
          </Field>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────
   STEP 2 — CUENTAS Y DOCUMENTACIÓN
   ────────────────────────────── */
function Step2({ op, qpaqEgreso, setQpaqEgreso, qpaqIngreso, setQpaqIngreso,
                 cuentasDestCliente, setCuentasDestCliente,
                 files, setFiles, errors, onPreviewDoc }) {
  const fileInputRef = useRef(null)

  const monedaEgreso  = op.tipo === 'compra' ? 'USD' : 'PEN'
  const monedaIngreso = op.tipo === 'compra' ? 'PEN' : 'USD'
  const monedaAbono   = op.tipo === 'compra' ? 'PEN' : 'USD'

  const todasCuentasCli = CUENTAS_CLIENTE[op.clienteId] ?? []
  const cuentasCli = todasCuentasCli.filter(c => c.moneda === monedaAbono)

  const optsEgreso  = (CUENTAS_QAPAQ[monedaEgreso]  || []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))
  const optsIngreso = (CUENTAS_QAPAQ[monedaIngreso] || []).map(c => ({ value: c.id, label: `${c.banco} · ${c.numero} (${c.moneda})` }))

  const selectCls = (err) => clsx(
    'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all',
    err ? 'border-red-400 ring-2 ring-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
  )

  function updateQpaq(arr, setter, idx, field, val) {
    setter(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function addQpaqRow(setter) {
    setter(prev => [...prev, { cuentaId: '', monto: '' }])
  }
  function removeQpaqRow(arr, setter, idx) {
    if (arr.length <= 1) return
    setter(prev => prev.filter((_, i) => i !== idx))
  }

  function updateCuentaDest(idx, field, val) {
    setCuentasDestCliente(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function addCuentaDest() {
    setCuentasDestCliente(prev => [...prev, { cuentaId: '', monto: '', _preset: false }])
  }
  function removeCuentaDest(idx) {
    setCuentasDestCliente(prev => prev.filter((_, i) => i !== idx))
  }

  function handleFileChange(e) {
    const incoming = Array.from(e.target.files)
    if (files.length + incoming.length > MAX_FILES) {
      alert(`Máximo ${MAX_FILES} archivos.`)
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

  function renderQpaqSection({ rows, setter, moneda, opts, title, errorKey }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {title}
            <span className="ml-1 font-normal normal-case text-gray-300">({moneda})</span>
          </p>
          <button type="button" onClick={() => addQpaqRow(setter)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            <Plus size={12} /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  {idx === 0 ? `Cuenta ${title.split('–')[0]?.trim().toLowerCase() || ''} principal` : `Cuenta adicional ${idx}`}
                </p>
                {rows.length > 1 && (
                  <button type="button" onClick={() => removeQpaqRow(rows, setter, idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={row.cuentaId}
                  onChange={e => updateQpaq(rows, setter, idx, 'cuentaId', e.target.value)}
                  className={selectCls(false)}>
                  <option value="">Seleccionar cuenta…</option>
                  {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{moneda}</span>
                  <input type="text" inputMode="numeric" placeholder="0.00"
                    value={row.monto}
                    onChange={e => updateQpaq(rows, setter, idx, 'monto', e.target.value.replace(/[^0-9.,]/g, ''))}
                    onBlur={() => { const n = parseMoney(row.monto); if (!isNaN(n) && n > 0) updateQpaq(rows, setter, idx, 'monto', fmtMoney(n)) }}
                    onFocus={() => updateQpaq(rows, setter, idx, 'monto', row.monto.replace(/,/g, ''))}
                    className="w-full pl-12 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-right outline-none transition-all hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors?.[errorKey] && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={10} />{errors[errorKey]}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Cuentas bancarias y comprobantes</h3>
        <p className="text-xs text-gray-500">
          Revisa y ajusta las cuentas del flujo y el monto por cada una. Los datos se han precargado desde el registro de la operación.
        </p>
      </div>

      {/* QAPAQ Egreso */}
      {renderQpaqSection({
        rows: qpaqEgreso, setter: setQpaqEgreso,
        moneda: monedaEgreso, opts: optsEgreso,
        title: 'Cuenta QAPAQ – Egreso',
        errorKey: 'qpaqEgreso',
      })}

      {/* QAPAQ Ingreso */}
      {renderQpaqSection({
        rows: qpaqIngreso, setter: setQpaqIngreso,
        moneda: monedaIngreso, opts: optsIngreso,
        title: 'Cuenta QAPAQ – Ingreso',
        errorKey: 'qpaqIngreso',
      })}

      {/* Cuentas destino del cliente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cuentas destino del cliente</p>
          <button type="button" onClick={addCuentaDest}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            <Plus size={12} /> Agregar cuenta
          </button>
        </div>

        <div className="space-y-2">
          {cuentasDestCliente.map((row, idx) => {
            const cuentaInfo  = todasCuentasCli.find(c => c.id === row.cuentaId)
            const esTerceroSinConvenio = cuentaInfo?.tipo === 'tercero' && !cuentaInfo?.convenio
            return (
              <div key={idx} className={clsx(
                'rounded-xl border p-3',
                esTerceroSinConvenio ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-gray-500 font-medium">
                    {idx === 0 ? 'Cuenta principal' : `Cuenta adicional ${idx}`}
                  </p>
                  {cuentasDestCliente.length > 1 && (
                    <button type="button" onClick={() => removeCuentaDest(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cuenta destino">
                    {row._preset && row.cuentaId ? (
                      <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700">
                        {cuentaInfo ? (
                          <span>
                            <span className="font-medium">{cuentaInfo.banco}</span>
                            {' · '}{cuentaInfo.numero}
                            <span className="ml-1.5 text-[11px] text-gray-400">({cuentaInfo.moneda} — {cuentaInfo.tipo === 'tercero' ? 'Tercero' : 'Propia'})</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">{row.cuentaId}</span>
                        )}
                      </div>
                    ) : cuentasCli.length > 0 ? (
                      <select
                        value={row.cuentaId}
                        onChange={e => updateCuentaDest(idx, 'cuentaId', e.target.value)}
                        className={selectCls(false)}>
                        <option value="">Seleccionar cuenta…</option>
                        {cuentasCli.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.banco} · {c.numero} ({c.moneda}){c.tipo === 'tercero' ? ' — Tercero' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-700">
                        Sin cuentas registradas en {monedaAbono} para este cliente
                      </div>
                    )}
                  </Field>
                  <Field label={`Monto (${monedaAbono})`}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{monedaAbono}</span>
                      <input type="text" inputMode="numeric" placeholder="0.00"
                        value={row.monto}
                        onChange={e => updateCuentaDest(idx, 'monto', e.target.value.replace(/[^0-9.,]/g, ''))}
                        onBlur={() => { const n = parseMoney(row.monto); if (!isNaN(n) && n > 0) updateCuentaDest(idx, 'monto', fmtMoney(n)) }}
                        onFocus={() => updateCuentaDest(idx, 'monto', row.monto.replace(/,/g, ''))}
                        className="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-right outline-none transition-all hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                    </div>
                  </Field>
                </div>
                {esTerceroSinConvenio && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-red-500 shrink-0" />
                    <p className="text-[10px] text-red-600 font-medium">AL-FO-04: Cuenta de tercero sin convenio marco activo.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Vouchers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Voucher de abono</p>
          <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full',
            files.length >= MAX_FILES ? 'bg-amber-50 text-amber-600'
            : files.length > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500')}>
            {files.length} / {MAX_FILES} archivos
          </span>
        </div>

        {files.length < MAX_FILES && (
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-gray-50 hover:bg-blue-50/40 hover:border-blue-300 cursor-pointer transition-all"
          >
            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            <Upload size={20} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Haz clic o arrastra el comprobante</p>
            <p className="text-xs text-gray-400">PDF, JPG o PNG — máx. 10 MB c/u</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={14} className="text-blue-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-700 truncate">{f.name}</p>
                    <p className="text-[10px] text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => onPreviewDoc?.(f.name)}
                    className="p-1 rounded hover:bg-blue-50 text-blue-500 transition-colors">
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

        {errors?.files && <p className="text-[11px] text-red-500 mt-1">{errors.files}</p>}
      </div>

      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Una vez enviada la operación a Back Office, no podrás modificar las cuentas ni los archivos adjuntos.
        </p>
      </div>
    </div>
  )
}

function Step3({ op, monto, tc, qpaqEgreso, qpaqIngreso, cuentasDestCliente, files, onConfirmar, loading }) {
  const monedaEgreso  = op.tipo === 'compra' ? 'USD' : 'PEN'
  const monedaIngreso = op.tipo === 'compra' ? 'PEN' : 'USD'
  const monedaAbono   = op.tipo === 'compra' ? 'PEN' : 'USD'

  const montoN = parseMoney(monto)
  const tcN    = parseFloat(tc)
  const montoPEN = !isNaN(montoN) && !isNaN(tcN) ? montoN * tcN : null

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Resumen del envío a Back Office</h3>
        <p className="text-xs text-gray-500">
          Verifica que todos los datos sean correctos. Al confirmar, la operación pasará a estado <strong>En revisión — Back Office</strong>.
        </p>
      </div>

      <ResumenCard title="Operación">
        <ResumenRow label="ID"              value={op.id} />
        <ResumenRow label="Cliente"         value={op.clienteNombre} />
        <ResumenRow label="Monto USD"       value={`$ ${fmtMoney(montoN)}`} />
        <ResumenRow label="TC pactado"      value={tcN ? tcN.toFixed(4) : '—'} />
        {montoPEN && <ResumenRow label="Contravalor PEN" value={`S/ ${fmtMoney(montoPEN)}`} />}
      </ResumenCard>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cuentas QAPAQ</p>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="px-4 py-2.5 bg-gray-50/50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Egreso ({monedaEgreso})</p>
            {qpaqEgreso.filter(r => r.cuentaId).map((row, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 py-1.5">
                <p className="text-xs text-gray-600">{QAPAQ_DISPLAY[row.cuentaId] ?? row.cuentaId}</p>
                <p className="text-sm font-mono text-gray-700">{row.monto ? `${monedaEgreso} ${fmtMoney(+row.monto)}` : '—'}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingreso ({monedaIngreso})</p>
            {qpaqIngreso.filter(r => r.cuentaId).map((row, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 py-1.5">
                <p className="text-xs text-gray-600">{QAPAQ_DISPLAY[row.cuentaId] ?? row.cuentaId}</p>
                <p className="text-sm font-mono text-gray-700">{row.monto ? `${monedaIngreso} ${fmtMoney(+row.monto)}` : '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cuentasDestCliente.some(r => r.cuentaId || r.monto) && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cuenta abono cliente</p>
          </div>
          <div className="divide-y divide-gray-100">
            {cuentasDestCliente.filter(r => r.cuentaId || r.monto).map((row, idx) => (
              <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500 shrink-0">
                  {idx === 0 ? 'Principal' : `Adicional ${idx}`}
                </p>
                <p className="text-sm text-gray-800 font-medium flex-1 truncate">
                  {CUENTAS_DISPLAY[row.cuentaId] ?? row.cuentaId ?? '—'}
                </p>
                {row.monto && (
                  <p className="text-sm font-mono text-gray-700 shrink-0">
                    {monedaAbono} {fmtMoney(parseMoney(row.monto))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ResumenCard title="Documentación">
        <ResumenRow label="Vouchers adjuntos" value={`${files.length} archivo${files.length !== 1 ? 's' : ''}`} />
        <ResumenRow label="Estado destino"    value="En revisión — Back Office" />
      </ResumenCard>

      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Todo en orden. Usa el botón <strong>"Confirmar y enviar"</strong> para completar el proceso.
        </p>
      </div>
    </div>
  )
}

export default function ConfirmarAbonoWizard({ op, onBack, onConfirmar, onPreviewDoc }) {
  const [step,    setStep]    = useState(1)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  function parseQpaqArr(raw, fallback) {
    if (!raw || raw.length === 0) return fallback
    return raw.map(r => {
      if (typeof r === 'string') return { cuentaId: r, monto: '' }
      const m = r.monto
      return { cuentaId: r.cuentaId || '', monto: m && !isNaN(parseMoney(m)) ? fmtMoney(parseMoney(m)) : '' }
    })
  }

  const [monto,   setMonto]   = useState(op?.montoUSD ? fmtMoney(op.montoUSD) : '')
  const [tc,      setTc]      = useState(String(op?.tc ?? ''))

  const [qpaqEgreso, setQpaqEgreso] = useState(
    parseQpaqArr(op?.cuentasQpaqEgreso, [{ cuentaId: op?.cuentaQpaqOut || '', monto: '' }])
  )
  const [qpaqIngreso, setQpaqIngreso] = useState(
    parseQpaqArr(op?.cuentasQpaqIngreso, [{ cuentaId: op?.cuentaQpaqIn || '', monto: '' }])
  )
  const [cuentasDestCliente, setCuentasDestCliente] = useState(() => {
    if (op?.cuentasDest?.length) {
      return op.cuentasDest.map(r => {
        const m = r.monto
        return { ...r, monto: m && !isNaN(parseMoney(m)) ? fmtMoney(parseMoney(m)) : '', _preset: !!r.cuentaId }
      })
    }
    return [{ cuentaId: '', monto: '', _preset: false }]
  })
  const [files, setFiles] = useState([])

  if (!op) return null

  function validateStep1() {
    return {}
  }

  function validateStep2() {
    const e = {}
    if (!qpaqEgreso.some(r => r.cuentaId))  e.qpaqEgreso  = 'Selecciona al menos una cuenta de egreso.'
    if (!qpaqIngreso.some(r => r.cuentaId)) e.qpaqIngreso = 'Selecciona al menos una cuenta de ingreso.'
    if (files.length === 0) e.files = 'Adjunta al menos un comprobante de abono.'
    return e
  }

  function handleNext() {
    let e = {}
    if (step === 1) e = validateStep1()
    if (step === 2) e = validateStep2()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  function handlePrev() {
    setErrors({})
    setStep(s => s - 1)
  }

  function handleConfirmarFinal() {
    setLoading(true)
    setTimeout(() => {
      onConfirmar(op.id, {
        cuentasQpaqEgreso: qpaqEgreso.filter(r => r.cuentaId),
        cuentasQpaqIngreso: qpaqIngreso.filter(r => r.cuentaId),
        cuentasDestCliente: cuentasDestCliente.map(({ _preset, ...r }) => r),
        files,
        montoUSD: parseMoney(monto),
        tc: parseFloat(tc),
      })
      setLoading(false)
    }, 1000)
  }

  const canNext2 = qpaqEgreso.some(r => r.cuentaId) && qpaqIngreso.some(r => r.cuentaId) && files.length > 0

  return (
    <div className="max-w-4xl mx-auto pb-10">

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Pendientes de Abono
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
        <StepIndicator currentStep={step} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
        <div className="mb-4">
          {step === 1 && (
            <Step1
              op={op}
              monto={monto}
              tc={tc}
            />
          )}
          {step === 2 && (
            <Step2
              op={op}
              qpaqEgreso={qpaqEgreso}         setQpaqEgreso={setQpaqEgreso}
              qpaqIngreso={qpaqIngreso}       setQpaqIngreso={setQpaqIngreso}
              cuentasDestCliente={cuentasDestCliente} setCuentasDestCliente={setCuentasDestCliente}
              files={files}                   setFiles={setFiles}
              errors={errors}
              onPreviewDoc={onPreviewDoc}
            />
          )}
          {step === 3 && (
            <Step3
              op={op}
              monto={monto} tc={tc}
              qpaqEgreso={qpaqEgreso}
              qpaqIngreso={qpaqIngreso}
              cuentasDestCliente={cuentasDestCliente}
              files={files}
              onConfirmar={handleConfirmarFinal}
              loading={loading}
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
        <button
          onClick={step === 1 ? onBack : handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
        >
          <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {step < 3 && (
          <button
            onClick={handleNext}
            disabled={step === 2 ? !canNext2 : false}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95',
              (step === 2 && !canNext2)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            Siguiente <ChevronRight size={15} />
          </button>
        )}

        {step === 3 && (
          <button
            onClick={handleConfirmarFinal}
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {loading
              ? <><Clock size={14} className="animate-spin" /> Enviando…</>
              : <><ShieldCheck size={14} /> Confirmar y enviar</>}
          </button>
        )}
      </div>

    </div>
  )
}
