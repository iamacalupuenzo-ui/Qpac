import { useState } from 'react'
import {
  ArrowLeft, Check, ChevronRight,
  Eye, FileText, CheckCircle2, XCircle,
  AlertTriangle, Info, Clock, ShieldCheck,
  MessageSquare, Banknote, RefreshCw,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney, fmtDate } from '../../utils/format.js'
import OpSummaryBar from '../../components/ui/OpSummaryBar.jsx'

/* ══════════════════════════════════════════════
   CATÁLOGOS DE LOOKUP
══════════════════════════════════════════════ */
const QAPAQ_DISPLAY = {
  'QP-USD-1': 'BCP · 191-9000001-0-01 (USD)',
  'QP-USD-2': 'Interbank · 200-9000002-001 (USD)',
  'QP-PEN-1': 'BCP · 191-9000003-0-01 (PEN)',
  'QP-PEN-2': 'Scotiabank · 00-272-9000004 (PEN)',
  PENDIENTE: 'Cuenta por definir (pendiente)',
}

const CUENTAS_DISPLAY = {
  'CTA-001': 'BCP · 191-1234567-0-12 (USD)',
  'CTA-002': 'Interbank · 200-3000123456 (PEN)',
  'CTA-003': 'Scotia · 00-272-123456789 (USD)',
  'CTA-010': 'BBVA · 0011-0111-11-0100075234 (USD)',
  'CTA-011': 'BCP · 191-2345678-0-45 (PEN)',
  'CTA-020': 'BCP · 191-5000001-0-88 (PEN)',
  'CTA-021': 'BBVA · 0011-0222-22-0100088001 (USD)',
  'CTA-030': 'BCP · 191-3000001-0-55 (USD)',
  'CTA-031': 'BCP · 191-3000002-0-11 (PEN)',
  'CTA-040': 'Scotiabank · 00-272-4000001 (PEN)',
  'CTA-041': 'BBVA · 0011-0444-44-0100044001 (USD)',
  'CTA-050': 'BCP · 191-5000001-0-88 (PEN)',
  'CTA-051': 'BBVA · 0011-0222-22-0100088001 (USD)',
  'CTA-060': 'BCP · 191-6000001-0-22 (PEN)',
  'CTA-061': 'Interbank · 200-6000012-001 (USD)',
  transitoria: 'Cuenta transitoria QAPAQ',
  PENDIENTE: 'Cuenta por definir (pendiente)',
}

/* Listado de errores tipo en operaciones de Mesa de Cambios (A–N) */
const CAUSAS_OBSERVACION = [
  { id: 'A', tipo: 'A', label: 'Error en distribución de flujos (sistema)',          detalle: 'Error en la colocación del banco (INGRESO o SALIDA) al momento del registro en el TRADER LIVE.' },
  { id: 'B', tipo: 'B', label: 'Error en importes pactados (sistema)',               detalle: 'Error en montos declarados.' },
  { id: 'C', tipo: 'C', label: 'Conversión',                                          detalle: 'Cliente abonó importe en cuenta bancaria de contravalor.' },
  { id: 'D', tipo: 'D', label: 'Titular difiere con registro de operación (sistema)', detalle: 'Nombre del ticket generado en el sistema difiere del nombre del titular que abonó en banco.' },
  { id: 'E', tipo: 'E', label: 'Registro de operación errada (compra-venta)',        detalle: 'Error del registro de VENTA en lugar de COMPRA o viceversa, en el sistema.' },
  { id: 'F', tipo: 'F', label: 'Entrada de dinero en estado pendiente/en proceso',   detalle: 'No se valida el ingreso de fondos a nuestras cuentas bancarias - VOUCHERS.' },
  { id: 'G', tipo: 'G', label: 'Documentación incompleta',                           detalle: 'VOUCHERS, DJ, CONVENIO o PLAFT (PEP): se precisará los documentos pendientes en correo.' },
  { id: 'H', tipo: 'H', label: 'Sin autorización de excepción',                      detalle: 'No cuenta con conformidad de su jefatura por la omisión de algún requisito.' },
  { id: 'I', tipo: 'I', label: 'Número de cuenta errada',                            detalle: 'Instrucción contiene número de cuenta bancaria de otro banco, otro titular, otra moneda o cuenta inválida.' },
  { id: 'J', tipo: 'J', label: 'No envían nro. de cuenta de abono',                  detalle: 'Instrucción del correo no tiene la cuenta del cliente a depositar.' },
  { id: 'K', tipo: 'K', label: 'Documentación errada',                               detalle: 'VOUCHERS, DJ, CONVENIO o PLAFT (PEP): se precisará los documentos errados en correo.' },
  { id: 'L', tipo: 'L', label: 'Duplicidad de operación',                            detalle: 'Duplicados de voucher, TICKET de atención, correos de atención.' },
  { id: 'M', tipo: 'M', label: 'Cliente bloqueado',                                  detalle: 'Cliente no ha subsanado observaciones previas o tiene más de una excepción previa.' },
  { id: 'N', tipo: 'N', label: 'Otros',                                              detalle: 'Correcciones pendientes de Middle Office, entre otros; en correo se especificará el error.' },
]

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   STEPS — 4 pasos cuando se aprueba (RF-15)
          3 pasos cuando se observa
══════════════════════════════════════════════ */
const ALL_STEPS = [
  { id: 1, label: 'Revisión'      },
  { id: 2, label: 'Decisión'      },
  { id: 3, label: 'Confirmación'  },
  { id: 4, label: 'Liquidación'   },
]

function StepIndicator({ currentStep, approved, totalSteps }) {
  const steps = ALL_STEPS.slice(0, totalSteps)
  const color  = approved ? 'green' : 'orange'
  return (
    <div className="flex items-start justify-center">
      {steps.map((step, i) => {
        const done   = step.id < currentStep
        const active = step.id === currentStep
        const ringCls = color === 'green' ? 'ring-green-100' : 'ring-orange-100'
        const bgCls   = color === 'green'
          ? done || active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
          : done || active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all', bgCls,
                active && `ring-4 ${ringCls}`)}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={clsx('mt-1.5 text-[11px] font-medium whitespace-nowrap',
                active ? (color === 'green' ? 'text-green-600' : 'text-orange-600')
                : done  ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx('h-px mt-3.5 mx-3 transition-all', done
                ? (color === 'green' ? 'bg-green-400' : 'bg-orange-400')
                : 'bg-gray-200')} style={{ width: 56 }} />
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
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</p>
}

function InfoCard({ children, bg = 'blue' }) {
  const cls = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    red:    'bg-red-50 border-red-200 text-red-700',
  }
  const Icon = { blue: Info, amber: AlertTriangle, green: CheckCircle2, red: AlertTriangle }[bg]
  return (
    <div className={clsx('flex items-start gap-2.5 p-3 rounded-lg border', cls[bg])}>
      <Icon size={13} className="mt-0.5 shrink-0" />
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 1 — REVISIÓN
══════════════════════════════════════════════ */
function Step1({ op, onPreviewDoc }) {
  const historialObs = (op.historial ?? []).filter(h => h.tipo === 'observacion' || h.tipo === 'subsanacion')
  const monedaDestino = op.tipo === 'compra' ? 'PEN' : 'USD'
  const monedaIngreso = op.tipo === 'compra' ? 'USD' : 'PEN'
  const monedaEgreso  = op.tipo === 'compra' ? 'PEN' : 'USD'

  // Totales por lado para usar como respaldo cuando una cuenta no tiene monto propio registrado
  const montoPEN      = op.montoPEN ?? (op.montoUSD && op.tc ? Math.round(op.montoUSD * op.tc * 100) / 100 : null)
  const totalIngreso  = monedaIngreso === 'USD' ? op.montoUSD : montoPEN
  const totalEgreso   = monedaEgreso  === 'USD' ? op.montoUSD : montoPEN

  // Normaliza un lado QAPAQ (ingreso/egreso) a filas { cuentaId, monto },
  // rellenando el monto con el total del lado cuando hay una sola cuenta sin monto propio.
  function qpaqRows(raw, fallbackId, total) {
    let rows = (raw ?? [])
      .map(r => typeof r === 'string' ? { cuentaId: r, monto: '' } : { cuentaId: r.cuentaId, monto: r.monto })
      .filter(r => r.cuentaId)
    if (rows.length === 0 && fallbackId) rows = [{ cuentaId: fallbackId, monto: '' }]
    const hasMonto = m => m !== '' && m !== undefined && m !== null
    if (rows.length === 1 && !hasMonto(rows[0].monto) && total != null) {
      rows = [{ ...rows[0], monto: total }]
    }
    return rows
  }

  const rowsIngreso = qpaqRows(op.cuentasQpaqIngreso, op.cuentaQpaqIn,  totalIngreso)
  const rowsEgreso  = qpaqRows(op.cuentasQpaqEgreso,  op.cuentaQpaqOut, totalEgreso)

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Revisión de operación</h3>
        <p className="text-xs text-gray-500">
          Revisa los datos, cuentas y comprobantes antes de tomar tu decisión.
        </p>
      </div>

      {/* Datos de la operación */}
      <div>
        <SectionTitle>Datos de la operación</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: 'ID',         v: op.id,                          mono: true },
            { l: 'Cliente',    v: op.clienteNombre                           },
            { l: 'Fecha',      v: fmtDate(op.fecha)                          },
            { l: 'Tipo',       v: op.tipo?.toUpperCase()                     },
            { l: 'Monto USD',  v: '$ ' + fmtMoney(op.montoUSD)                 },
            { l: 'TC pactado', v: op.tc?.toFixed(3),              mono: true },
            { l: 'Monto PEN',  v: 'S/ ' + fmtMoney(op.montoPEN ?? (op.montoUSD && op.tc ? op.montoUSD * op.tc : null)) },
          ].map(({ l, v, mono }) => (
            <div key={l} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 mb-0.5">{l}</p>
              <p className={clsx('text-xs font-bold text-gray-800', mono && 'font-mono')}>{v ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cuentas QAPAQ */}
      <div>
        <SectionTitle>Cuentas QAPAQ registradas</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {/* Ingreso */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50 space-y-1.5">
            <p className="text-[10px] text-gray-400">Cuenta(s) de ingreso</p>
            {rowsIngreso.length > 0
              ? rowsIngreso.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-gray-700 truncate">{QAPAQ_DISPLAY[r.cuentaId] ?? r.cuentaId}</p>
                    {r.monto !== '' && r.monto != null && (
                      <p className="text-xs font-bold text-gray-800 font-mono shrink-0">{monedaIngreso} {fmtMoney(r.monto)}</p>
                    )}
                  </div>
                ))
              : <p className="text-xs text-gray-400 italic">—</p>}
          </div>
          {/* Egreso */}
          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50 space-y-1.5">
            <p className="text-[10px] text-gray-400">Cuenta(s) de egreso</p>
            {rowsEgreso.length > 0
              ? rowsEgreso.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-gray-700 truncate">{QAPAQ_DISPLAY[r.cuentaId] ?? r.cuentaId}</p>
                    {r.monto !== '' && r.monto != null && (
                      <p className="text-xs font-bold text-gray-800 font-mono shrink-0">{monedaEgreso} {fmtMoney(r.monto)}</p>
                    )}
                  </div>
                ))
              : <p className="text-xs text-gray-400 italic">—</p>}
          </div>
        </div>
      </div>

      {/* Cuentas destino del cliente */}
      <div>
        <SectionTitle>Cuentas destino del cliente ({monedaDestino})</SectionTitle>
        {(() => {
          // El cliente recibe en la misma moneda que el egreso QAPAQ (lo que QAPAQ paga al cliente)
          const totalDestino = totalEgreso
          let rows = (op.cuentasDest ?? []).filter(r => r.cuentaId || (r.monto !== '' && r.monto != null))
          // Respaldo: una sola cuenta sin monto propio → total de la operación
          if (rows.length === 1 && (rows[0].monto === '' || rows[0].monto == null) && totalDestino != null) {
            rows = [{ ...rows[0], monto: totalDestino }]
          }
          if (rows.length === 0) {
            return <p className="text-xs text-amber-600 italic">Sin cuenta destino del cliente registrada. Verifique antes de aprobar.</p>
          }
          return (
            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 bg-white">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">{idx === 0 ? 'Cuenta principal' : `Cuenta adicional ${idx}`}</p>
                    <p className="text-xs font-medium text-gray-800">
                      {CUENTAS_DISPLAY[row.cuentaId] ?? row.cuentaId ?? '—'}
                    </p>
                  </div>
                  {row.monto !== '' && row.monto != null && (
                    <p className="text-sm font-bold text-gray-800 font-mono">
                      {monedaDestino} {fmtMoney(row.monto)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Comprobantes */}
      <div>
        <SectionTitle>Comprobantes adjuntos ({(op.comprobantes ?? []).length})</SectionTitle>
        {(op.comprobantes ?? []).length === 0 ? (
          <p className="text-xs text-gray-400 italic">Sin comprobantes adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {(op.comprobantes ?? []).map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-500 shrink-0" />
                  <p className="text-xs font-medium text-gray-700">{f.name ?? `Comprobante ${i + 1}`}</p>
                </div>
                <button
                  onClick={() => onPreviewDoc?.(f.name ?? `Comprobante ${i + 1}`)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye size={12} /> Vista previa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {historialObs.length > 0 && (
        <div>
          <SectionTitle>Historial de observaciones y subsanaciones</SectionTitle>
          <div className="space-y-2">
            {historialObs.map((h, i) => (
              <div key={i} className={clsx('p-3 rounded-lg border text-xs',
                h.tipo === 'observacion' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50')}>
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('font-bold uppercase text-[10px] tracking-wider',
                    h.tipo === 'observacion' ? 'text-amber-700' : 'text-green-700')}>
                    {h.tipo === 'observacion' ? '⚠ Observación' : '✓ Subsanación'}
                  </span>
                  <span className="text-gray-400">{h.fecha} {h.hora}</span>
                </div>
                <p className="text-gray-700">{h.detalle ?? h.causa}</p>
                <p className="text-gray-500 mt-0.5">Por: {h.por}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 2 — DECISIÓN
══════════════════════════════════════════════ */
function Step2({ decision, setDecision, causas, setCausas, observacion, setObservacion, errors }) {
  function toggleCausa(id) {
    setCausas(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Decisión del analista</h3>
        <p className="text-xs text-gray-500">
          Si procesas, Bank+ recibirá el registro y deberás ingresar la referencia de transferencia bancaria. Si observas, la operación regresa al Trader según la leyenda de errores.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setDecision('aprobar')}
          className={clsx('p-5 rounded-2xl border-2 text-left transition-all',
            decision === 'aprobar' ? 'border-green-500 bg-green-50 shadow-md shadow-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30')}>
          <div className="flex items-center gap-3 mb-2">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center',
              decision === 'aprobar' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')}>
              <CheckCircle2 size={18} />
            </div>
            <span className={clsx('text-sm font-bold', decision === 'aprobar' ? 'text-green-700' : 'text-gray-600')}>
              Procesar operación en plataforma bancaria
            </span>
          </div>
          <p className="text-xs text-gray-500">El abono es correcto. Registrar en Bank+ e ingresar referencia de transferencia.</p>
        </button>

        <button
          onClick={() => setDecision('observar')}
          className={clsx('p-5 rounded-2xl border-2 text-left transition-all',
            decision === 'observar' ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30')}>
          <div className="flex items-center gap-3 mb-2">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center',
              decision === 'observar' ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400')}>
              <MessageSquare size={18} />
            </div>
            <span className={clsx('text-sm font-bold', decision === 'observar' ? 'text-orange-700' : 'text-gray-600')}>
              Se detectó un problema
            </span>
          </div>
          <p className="text-xs text-gray-500">Retornar al Trader según leyenda de errores seleccionada.</p>
        </button>
      </div>

      {errors?.decision && <p className="text-[11px] text-red-500">{errors.decision}</p>}

      {decision === 'observar' && (
        <div className="space-y-4">
          {/* Leyenda de errores multi-select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Leyenda de errores <span className="text-red-400">*</span>
              <span className="ml-1 text-gray-400 font-normal">(selecciona al menos uno)</span>
            </label>
            <div className="space-y-1.5">
              {CAUSAS_OBSERVACION.map(causa => {
                const sel = causas.includes(causa.id)
                return (
                  <label key={causa.id}
                    className={clsx(
                      'flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all',
                      sel ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                    )}>
                    <input type="checkbox" checked={sel}
                      onChange={() => toggleCausa(causa.id)}
                      className="accent-orange-500 w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className={clsx(
                      'shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-px',
                      sel ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                    )}>
                      {causa.tipo}
                    </span>
                    <span className="min-w-0">
                      <span className={clsx('block text-xs', sel ? 'text-orange-800 font-semibold' : 'text-gray-700 font-medium')}>
                        {causa.label}
                      </span>
                      {causa.detalle && (
                        <span className="block text-[11px] text-gray-400 mt-0.5 leading-snug">{causa.detalle}</span>
                      )}
                    </span>
                  </label>
                )
              })}
            </div>
            {errors?.causas && <p className="text-[11px] text-red-500 mt-1">{errors.causas}</p>}
          </div>

          {/* Comentario adicional (optativo) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Comentario adicional <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
              rows={3}
              placeholder="Detalla el problema adicional si es necesario…"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white outline-none transition-all resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50"
            />
          </div>

          <InfoCard bg="amber">La leyenda de errores y el comentario quedarán registrados de forma permanente y serán visibles para el Trader.</InfoCard>
        </div>
      )}

      {decision === 'aprobar' && (
        <InfoCard bg="green">
          Al confirmar, el sistema enviará los datos a Bank+. Si el registro es exitoso, deberás ingresar la referencia de transferencia bancaria para completar la liquidación.
        </InfoCard>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 3 — CONFIRMACIÓN
══════════════════════════════════════════════ */
function Step3({ op, decision, causas, observacion }) {
  const isAprob = decision === 'aprobar'
  const monedaDestino = op.tipo === 'compra' ? 'PEN' : 'USD'
  const causasSeleccionadas = CAUSAS_OBSERVACION.filter(c => causas.includes(c.id))

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Confirmar decisión</h3>
        <p className="text-xs text-gray-500">Revisa el resumen antes de confirmar. Esta acción no puede revertirse.</p>
      </div>

      <div className={clsx('p-5 rounded-2xl border-2 space-y-3',
        isAprob ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50')}>
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            isAprob ? 'bg-green-500 text-white' : 'bg-orange-400 text-white')}>
            {isAprob ? <CheckCircle2 size={20} /> : <MessageSquare size={20} />}
          </div>
          <div>
            <p className={clsx('text-sm font-bold', isAprob ? 'text-green-800' : 'text-orange-800')}>
              {isAprob ? 'Procesar operación en plataforma bancaria' : 'Devolver con observación al Trader'}
            </p>
            <p className={clsx('text-xs', isAprob ? 'text-green-600' : 'text-orange-600')}>
              {isAprob
                ? `La operación ${op.id} iniciará el proceso de liquidación`
                : `La operación ${op.id} regresará al Trader en estado Observada`}
            </p>
          </div>
        </div>

        {!isAprob && causasSeleccionadas.length > 0 && (
          <div className="pt-3 border-t border-orange-200">
            <p className="text-[11px] text-orange-600 font-semibold uppercase tracking-wider mb-1.5">Leyenda de errores:</p>
            <ul className="space-y-1">
              {causasSeleccionadas.map(c => (
                <li key={c.id} className="flex items-center gap-1.5 text-xs text-orange-800">
                  <span className="shrink-0 w-4 h-4 rounded bg-orange-500 text-white flex items-center justify-center text-[9px] font-bold">{c.tipo}</span>
                  {c.label}
                </li>
              ))}
            </ul>
            {observacion && (
              <p className="mt-2 text-xs text-orange-700 italic">"{observacion}"</p>
            )}
          </div>
        )}
      </div>

      {/* Resumen de operación */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: 'Operación', v: op.id,                        mono: true  },
          { l: 'Cliente',   v: op.clienteNombre                          },
          { l: 'Monto USD', v: '$ ' + fmtMoney(op.montoUSD) + ' USD'      },
          { l: 'TC',        v: op.tc?.toFixed(3),            mono: true  },
        ].map(({ l, v, mono }) => (
          <div key={l} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 mb-0.5">{l}</p>
            <p className={clsx('text-xs font-bold', mono ? 'font-mono text-gray-800' : isAprob ? 'text-green-600' : 'text-orange-600')}>{v}</p>
          </div>
        ))}
      </div>

      {/* Cuentas destino del cliente (solo cuando se aprueba) */}
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
                    {monedaDestino} {row.monto ? fmtMoney(row.monto) : '—'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <InfoCard bg={isAprob ? 'green' : 'amber'}>
        {isAprob
          ? 'Se intentará el registro en Bank+. Si falla, la operación permanece en tu bandeja y podrás reintentar sin devolver la operación al Trader.'
          : 'La leyenda de errores y el comentario quedarán registrados en el historial de la operación.'}
      </InfoCard>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 4 — LIQUIDACIÓN (RF-15)
   Aparece solo cuando Bank+ acepta la aprobación
══════════════════════════════════════════════ */
function Step4({ op, refTransferencia, setRefTransferencia, fechaLiquidacion, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Ejecución de transferencia y liquidación</h3>
        <p className="text-xs text-gray-500">
          Bank+ ha registrado el asiento contable exitosamente. Ahora ingresa la referencia de la transferencia bancaria ejecutada para completar la liquidación.
        </p>
      </div>

      {/* Confirmación Bank+ */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-800">Bank+ — Registro exitoso</p>
          <p className="text-xs text-green-600">El asiento contable fue registrado. Correlativo: {op.id} · Hora: {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Referencia de transferencia */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Referencia de transferencia bancaria <span className="text-gray-400 font-normal">(opcional — no siempre disponible)</span>
        </label>
        <input
          type="text"
          value={refTransferencia}
          onChange={e => setRefTransferencia(e.target.value)}
          placeholder="Ej: BCP-2026-00412, ITB-9182736, InterOp-00234…"
          className={clsx(
            'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all font-mono',
            errors?.ref
              ? 'border-red-400 ring-2 ring-red-50'
              : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-50'
          )}
        />
        {errors?.ref && <p className="text-[11px] text-red-500 mt-1">{errors.ref}</p>}
        <p className="text-[11px] text-gray-400 mt-1">
          Ingresa el número o código que el sistema bancario generó al ejecutar la transferencia. Este dato queda vinculado permanentemente a la operación.
        </p>
      </div>

      {/* Fecha y hora auto */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Fecha y hora de liquidación</label>
        <div className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 font-mono">{fechaLiquidacion}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Registrada automáticamente. No editable.</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Datos de la liquidación</p>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { l: 'Operación',    v: op.id,                             mono: true },
            { l: 'Cliente',      v: op.clienteNombre                             },
            { l: 'Monto USD',    v: '$ ' + fmtMoney(op.montoUSD)                   },
            { l: 'TC liquidado', v: op.tc?.toFixed(3),                 mono: true },
            { l: 'Cuenta ingreso', v: (() => { const raw = op.cuentasQpaqIngreso ?? []; const id = raw.map(r => typeof r === 'string' ? r : r.cuentaId).find(Boolean) ?? op.cuentaQpaqIn; return QAPAQ_DISPLAY[id] ?? id ?? '—' })() },
            { l: 'Cuenta egreso',  v: (() => { const raw = op.cuentasQpaqEgreso  ?? []; const id = raw.map(r => typeof r === 'string' ? r : r.cuentaId).find(Boolean) ?? op.cuentaQpaqOut; return QAPAQ_DISPLAY[id] ?? id ?? '—' })() },
          ].map(({ l, v, mono }) => (
            <div key={l}>
              <p className="text-[11px] text-gray-400 mb-0.5">{l}</p>
              <p className={clsx('text-sm font-medium text-gray-800', mono && 'font-mono')}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      <InfoCard bg="blue">
        Una vez confirmada la liquidación, la operación pasará al estado <strong>Liquidada</strong> y la referencia de transferencia quedará vinculada de forma permanente e inmutable.
      </InfoCard>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════ */
export default function RevisionBackOfficeWizard({ op, onBack, onLiquidar, onObservar, onPreviewDoc, notify }) {
  const [step,             setStep]             = useState(1)
  const [decision,         setDecision]         = useState('')
  const [observacion,      setObservacion]      = useState('')
  const [causas,           setCausas]           = useState([])
  const [refTransferencia, setRefTransferencia] = useState('')
  const [errors,           setErrors]           = useState({})
  const [loading,          setLoading]          = useState(false)
  const [bankError,        setBankError]        = useState(false)
  const [bankOkAt,         setBankOkAt]         = useState(null)   // timestamp de aprobación Bank+

  if (!op) return null

  const isAprob   = decision === 'aprobar'
  const totalSteps = isAprob ? 4 : 3

  const fechaLiquidacion = bankOkAt
    ? bankOkAt.toLocaleDateString('es-PE') + ' ' + bankOkAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  function validateStep2() {
    const e = {}
    if (!decision) e.decision = 'Selecciona una decisión.'
    if (decision === 'observar' && causas.length === 0) e.causas = 'Selecciona al menos una causa de observación.'
    return e
  }

  function validateStep4() {
    const e = {}
    if (false) e.ref = ''  // referencia ahora es optativa
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
    setBankError(false)
    setStep(s => s - 1)
  }

  // Step 3 → confirmar → si aprobar intentar Bank+, si ok → ir a step 4
  //                    → si observar → llamar onObservar y salir
  function handleConfirmarDecision() {
    if (!isAprob) {
      setLoading(true)
      setTimeout(() => {
        const causasLabels = CAUSAS_OBSERVACION.filter(c => causas.includes(c.id)).map(c => `${c.tipo}. ${c.label}`)
        onObservar(op.id, [...causasLabels, ...(observacion.trim() ? [observacion.trim()] : [])].join(' | '))
        setLoading(false)
        notify?.(`Operación ${op.id} devuelta al Trader con observación.`, 'warning')
      }, 900)
      return
    }

    // Aprobar: simula Bank+ (90% éxito)
    setLoading(true)
    setBankError(false)
    setTimeout(() => {
      const bankOk = Math.random() > 0.1
      if (bankOk) {
        setBankOkAt(new Date())
        setStep(4)
        notify?.('Asiento contable registrado exitosamente en Bank+.')
      } else {
        setBankError(true)
        notify?.('Error al conectar con Bank+. Reinténtelo en unos minutos.', 'error')
      }
      setLoading(false)
    }, 1500)
  }

  // Step 4 → liquidar
  function handleLiquidar() {
    const e = validateStep4()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    setTimeout(() => {
      onLiquidar(op.id, { refTransferencia: refTransferencia.trim(), fechaLiquidacion })
      setLoading(false)
    }, 900)
  }

  // Reintentar Bank+
  function handleRetryBank() {
    setBankError(false)
    setLoading(true)
    setTimeout(() => {
      const bankOk = Math.random() > 0.3  // 70% éxito en reintento
      if (!bankOk) { setBankError(true); setLoading(false); return }
      setBankOkAt(new Date())
      setStep(4)
      setLoading(false)
    }, 1500)
  }

  const canNext2 = !!decision && (decision === 'aprobar' || causas.length > 0)
  const isLastStep = step === totalSteps

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* ── Volver ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Bandeja de Revisión
      </button>

      {/* ── Stepper ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
        <StepIndicator currentStep={step} approved={isAprob && step > 1} totalSteps={totalSteps} />
      </div>

      {/* Datos registrados de la operación — visibles en todas las pantallas del flujo */}
      <OpSummaryBar
        id={op.id}
        cliente={op.clienteNombre}
        tipo={op.tipo}
        monedaCruzada={op.monedaCruzada}
        monto={op.montoUSD}
        moneda="USD"
        tc={op.tc}
      />

      {/* ── Contenido ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
        {step === 1 && <Step1 op={op} onPreviewDoc={onPreviewDoc} />}
        {step === 2 && (
          <Step2
            decision={decision}       setDecision={setDecision}
            causas={causas}           setCausas={setCausas}
            observacion={observacion} setObservacion={setObservacion}
            errors={errors}
          />
        )}
        {step === 3 && <Step3 op={op} decision={decision} causas={causas} observacion={observacion} />}
        {step === 4 && (
          <Step4
            op={op}
            refTransferencia={refTransferencia} setRefTransferencia={setRefTransferencia}
            fechaLiquidacion={fechaLiquidacion}
            errors={errors}
          />
        )}

        {/* Error Bank+ */}
        {bankError && (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">
                <strong>Error de integración Bank+:</strong> No se pudo registrar el asiento contable. La operación permanece en tu bandeja. Puedes reintentar cuando Bank+ esté disponible.
              </p>
            </div>
            <button
              onClick={handleRetryBank}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={clsx(loading && 'animate-spin')} />
              Reintentar registro en Bank+
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
        <button
          onClick={step === 1 ? onBack : handlePrev}
          disabled={loading || step === 4}  // No se puede volver desde paso 4 (Bank+ ya procesó)
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-40"
        >
          <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {/* Siguiente — pasos 1 y 2 */}
        {!isLastStep && step < 3 && (
          <button
            onClick={handleNext}
            disabled={step === 2 && !canNext2}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95',
              step === 2 && !canNext2 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900'
            )}
          >
            Siguiente <ChevronRight size={15} />
          </button>
        )}

        {/* Confirmar decisión — paso 3 */}
        {step === 3 && (
          <button
            onClick={handleConfirmarDecision}
            disabled={loading}
            className={clsx(
              'flex items-center gap-1.5 px-6 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-60',
              isAprob ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'
            )}
          >
            {loading
              ? <><Clock size={14} className="animate-spin" /> Procesando…</>
              : isAprob
                ? <><ShieldCheck size={14} /> Confirmar y enviar a Bank+</>
                : <><MessageSquare size={14} /> Confirmar observación</>}
          </button>
        )}

        {/* Liquidar — paso 4 (RF-15) */}
        {step === 4 && (
          <button
            onClick={handleLiquidar}
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading
              ? <><Clock size={14} className="animate-spin" /> Liquidando…</>
              : <><Banknote size={14} /> Confirmar liquidación</>}
          </button>
        )}
      </div>
    </div>
  )
}

