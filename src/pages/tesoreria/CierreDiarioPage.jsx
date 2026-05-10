import { useState } from 'react'
import {
  Lock, FileCheck, AlertCircle,
  Download, CheckCircle2, RotateCcw,
  Clock, ShieldCheck, User, History,
} from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney, fmtDate } from '../../utils/format.js'

export default function CierreDiarioPage({ ops = [], tcSbs = {}, cierres = [], onCerrar, onRevertir, role }) {
  const [view,              setView]              = useState('resumen')
  const [loading,           setLoading]           = useState(false)
  const [showConfirm,       setShowConfirm]       = useState(false)
  const [success,           setSuccess]           = useState(false)
  const [revertingCierre,   setRevertingCierre]   = useState(null)
  const [motivoReversion,   setMotivoReversion]   = useState('')

  const todayISO = new Date().toISOString().split('T')[0]

  const hasTcSbs      = tcSbs?.t && tcSbs?.fecha === todayISO
  const opsLiquidadas = ops.filter(o => o.estado === 'liquidada' && o.fecha === todayISO)
  const opsPendientes = ops.filter(o => ['reservada', 'pendiente_abono', 'en_revision', 'observada', 'subsanada'].includes(o.estado) && o.fecha === todayISO)
  const isCierreDone  = cierres.some(c => c.fechaSoc === todayISO && c.estado === 'cerrado')
  const canClose      = hasTcSbs && opsLiquidadas.length > 0 && !isCierreDone && opsPendientes.length === 0
  const isJefe        = role === 'head' || role === 'jefe' || role === 'admin'

  const resumen = opsLiquidadas.reduce((acc, op) => {
    if (op.tipo === 'cruzada') {
      // Cruzada genera 2 registros BCRP simultáneos (compra + venta)
      acc.usd.compra += op.montoUSD
      acc.usd.venta  += op.montoUSD
    } else if (op.tipo === 'compra') {
      acc.usd.compra += op.montoUSD
    } else {
      acc.usd.venta += op.montoUSD
    }
    return acc
  }, { usd: { compra: 0, venta: 0 } })

  function handleExecuteCierre() {
    setLoading(true)
    setTimeout(() => {
      onCerrar({
        id: `CIER-${todayISO}-${Math.floor(Math.random() * 1000)}`,
        fechaSoc: todayISO,
        cantOps: opsLiquidadas.length,
        montos: resumen,
        tcSbs: tcSbs.t,
        usuario: 'Marco Quispe L.',
        timestamp: new Date().toISOString(),
        estado: 'cerrado',
      })
      setLoading(false)
      setSuccess(true)
      setShowConfirm(false)
    }, 1500)
  }

  function handleExecuteReversion() {
    if (motivoReversion.length < 30) return
    setLoading(true)
    setTimeout(() => {
      onRevertir(revertingCierre.id, motivoReversion)
      setLoading(false)
      setRevertingCierre(null)
      setMotivoReversion('')
    }, 1200)
  }

  /* ── Stats ── */
  const stats = [
    {
      label: 'Estado del día',
      value: isCierreDone ? 'Cerrado' : 'Pendiente',
      color: isCierreDone ? 'text-green-600' : 'text-amber-600',
    },
    {
      label: 'Ops. liquidadas',
      value: opsLiquidadas.length,
      color: 'text-blue-600',
    },
    {
      label: 'Compra USD',
      value: resumen.usd.compra > 0 ? `$ ${fmtMoney(resumen.usd.compra)}` : '—',
      color: 'text-blue-600',
    },
    {
      label: 'Venta USD',
      value: resumen.usd.venta > 0 ? `$ ${fmtMoney(resumen.usd.venta)}` : '—',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-lg w-fit" style={{ border: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setView('resumen')}
          className={clsx('px-5 py-1.5 rounded-lg text-sm font-semibold transition-all',
            view === 'resumen' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900')}
        >
          Consolidación del Día
        </button>
        <button
          onClick={() => setView('historial')}
          className={clsx('px-5 py-1.5 rounded-lg text-sm font-semibold transition-all',
            view === 'historial' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900')}
        >
          Historial de Cierres
        </button>
      </div>

      {/* ── Vista Resumen ── */}
      {view === 'resumen' && (
        <div className="grid grid-cols-3 gap-4">

          {/* Panel principal — 2/3 */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cierre Operativo — {fmtDate(todayISO)}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Formaliza las operaciones liquidadas y genera la trama contable para Bank+</p>
                </div>
                <span className={clsx(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                  isCierreDone ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                )}>
                  <span className={clsx('w-1.5 h-1.5 rounded-full', isCierreDone ? 'bg-green-500' : 'bg-amber-400')} />
                  {isCierreDone ? 'Cerrado' : 'Pendiente'}
                </span>
              </div>

              {/* Stats del cierre */}
              <div className="grid grid-cols-2 gap-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
                {[
                  { label: 'Operaciones a cerrar',    value: opsLiquidadas.length,                         mono: false, color: 'text-gray-900'    },
                  { label: 'Tipo de cambio SBS (T)',   value: tcSbs?.t?.toFixed(3) || 'No ingresado',       mono: true,  color: 'text-gray-800'    },
                  { label: 'Consolidado compra USD',   value: '$ ' + fmtMoney(resumen.usd.compra),           mono: true,  color: 'text-blue-600'    },
                  { label: 'Consolidado venta USD',    value: '$ ' + fmtMoney(resumen.usd.venta),           mono: true,  color: 'text-orange-600'  },
                ].map((item, i) => (
                  <div key={i} className={clsx('px-5 py-4', i % 2 === 0 && 'border-r')} style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className={clsx('text-xl font-bold', item.mono && 'font-mono', item.color)}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Acciones */}
              <div className="px-5 py-5">
                {success ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50" style={{ border: '1px solid #bbf7d0' }}>
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-green-800">Cierre ejecutado correctamente</p>
                        <p className="text-[11px] text-green-600">ID: {cierres[cierres.length - 1]?.id}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs hover:underline">
                      <Download size={13} /> Descargar Trama Bank+ (TXT)
                    </button>
                  </div>
                ) : isCierreDone ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50" style={{ border: '1px solid #bbf7d0' }}>
                      <FileCheck size={16} className="text-green-600 shrink-0" />
                      <p className="text-xs font-semibold text-green-800">Este día ya ha sido cerrado formalmente.</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs hover:underline">
                      <Download size={13} /> Descargar Trama Bank+ (TXT)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {showConfirm ? (
                      <div className="space-y-3">
                        <div className="flex gap-3 p-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fcd34d' }}>
                          <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            ¿Confirmas la ejecución del cierre? Esta acción congelará las operaciones del día.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleExecuteCierre}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40"
                          >
                            {loading ? <Clock size={14} className="animate-spin" /> : <Lock size={14} />}
                            {loading ? 'Procesando...' : 'Sí, confirmar cierre'}
                          </button>
                          <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <ShieldCheck size={13} className="text-blue-400" />
                          {isJefe ? 'Registro con trazabilidad completa' : 'Solo el rol Jefe de Operaciones puede ejecutar el cierre.'}
                        </div>
                        <button
                          disabled={!canClose || !isJefe}
                          onClick={() => setShowConfirm(true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40"
                        >
                          <Lock size={14} /> Ejecutar Cierre Diario
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Nota de negocio */}
            <div className="flex gap-3 px-4 py-3.5 rounded-lg bg-blue-50" style={{ border: '1px solid #bfdbfe' }}>
              <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 leading-relaxed space-y-1">
                <p><strong>Regla de negocio:</strong> Las operaciones que no estén en estado "Liquidada" no se incluirán en este cierre y serán arrastradas al siguiente día operativo.</p>
                <p>El cierre es un prerequisito bloqueante para la apertura del siguiente día hábil.</p>
              </div>
            </div>
          </div>

          {/* Panel lateral: Prerequisitos — 1/3 */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
                <h4 className="text-sm font-semibold text-gray-900">Prerequisitos del Cierre</h4>
              </div>
              <div className="px-5 py-4 space-y-4">
                <PrereqItem
                  label="TC SBS del Día (T)"
                  done={hasTcSbs}
                  sub={hasTcSbs ? `Valor: ${tcSbs.t?.toFixed(3)}` : 'Pendiente de ingreso'}
                />
                <PrereqItem
                  label="Operaciones Liquidadas"
                  done={opsLiquidadas.length > 0}
                  sub={`${opsLiquidadas.length} listas para cierre`}
                />
                <PrereqItem
                  label="Pendientes Operativos"
                  done={opsPendientes.length === 0}
                  sub={opsPendientes.length > 0 ? `${opsPendientes.length} ops. activas aún` : 'Mesa limpia'}
                  warning={opsPendientes.length > 0}
                />
              </div>
            </div>

            <div className="flex gap-3 px-4 py-3.5 rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
              <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-gray-500 leading-relaxed">
                Cada cierre genera un registro inmutable en el log de auditoría, vinculado a los Anexos 5, 25, 26 y 28 de la SBS/BCRP.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Vista Historial ── */}
      {view === 'historial' && (
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <History size={14} className="text-gray-400" /> Historial de Consolidación
            </h4>
            <p className="text-[11px] text-gray-400">Solo cierres del día en curso son reversibles</p>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Consolidación ID</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Fecha</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Ops</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Compra USD</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Venta USD</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cierres.map(c => {
                const canRevert = c.fechaSoc === todayISO && c.estado === 'cerrado' && isJefe
                return (
                  <tr key={c.id} className={clsx('border-b hover:bg-gray-50/60 transition-colors', c.estado === 'revertido' && 'opacity-60')} style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-gray-800">{c.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-700">{fmtDate(c.fechaSoc)}</p>
                      <p className="text-[10px] text-gray-400">{c.timestamp.split('T')[1].substring(0, 5)} · {c.usuario}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-700">{c.cantOps}</td>
                    <td className="px-4 py-3 text-xs font-mono text-blue-600 font-bold">{fmtMoney(c.montos.usd.compra)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-orange-600 font-bold">{fmtMoney(c.montos.usd.venta)}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                        c.estado === 'cerrado' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500')}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', c.estado === 'cerrado' ? 'bg-green-500' : 'bg-gray-400')} />
                        {c.estado === 'cerrado' ? 'Cerrado' : 'Revertido'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition-colors">
                          <Download size={11} /> Trama
                        </button>
                        {canRevert && (
                          <button
                            onClick={() => setRevertingCierre(c)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[11px] font-semibold hover:bg-red-100 transition-colors"
                          >
                            <RotateCcw size={11} /> Revertir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {cierres.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No hay cierres registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Reversión Controlada */}
      {revertingCierre && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/30">
          <div className="bg-white rounded-xl w-full max-w-xl overflow-hidden flex flex-col" style={{ border: '1px solid var(--color-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>

            <div className="px-6 py-4 border-b bg-red-50" style={{ borderColor: '#fca5a5' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <RotateCcw size={16} />
                </div>
                <h3 className="text-sm font-semibold text-red-900">Reversión Controlada del Cierre</h3>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                Estás a punto de invalidar la consolidación <strong>{revertingCierre.id}</strong>.
                Las {revertingCierre.cantOps} operaciones volverán al estado Liquidada para su corrección.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-700">Motivo de la Reversión <span className="text-gray-400">(mín. 30 caracteres)</span></label>
                  <span className={clsx('text-[11px] font-medium', motivoReversion.length >= 30 ? 'text-green-600' : 'text-gray-400')}>
                    {motivoReversion.length} / 30
                  </span>
                </div>
                <textarea
                  value={motivoReversion}
                  onChange={e => setMotivoReversion(e.target.value)}
                  className="w-full h-24 px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm resize-none transition-all bg-white"
                  placeholder="Describe con precisión el error detectado que justifica la reversión de la trama contable..."
                />
                <p className="text-[11px] text-gray-400 mt-1">Este motivo aparecerá en el log de auditoría.</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: 'var(--color-border)' }}>
              <button
                disabled={motivoReversion.length < 30 || loading}
                onClick={handleExecuteReversion}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                {loading ? <Clock size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                {loading ? 'Procesando...' : 'Confirmar Reversión'}
              </button>
              <button
                onClick={() => setRevertingCierre(null)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PrereqItem({ label, done, sub, warning }) {
  return (
    <div className="flex items-start gap-3">
      <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border',
        done    ? 'bg-green-100 border-green-200 text-green-600' :
        warning ? 'bg-amber-100 border-amber-200 text-amber-500' :
                  'bg-gray-50 border-gray-100 text-gray-300')}>
        {done    ? <CheckCircle2 size={12} /> :
         warning ? <AlertCircle  size={12} /> :
                   <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
      </div>
      <div>
        <p className={clsx('text-xs font-semibold', done ? 'text-gray-800' : 'text-gray-500')}>{label}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

