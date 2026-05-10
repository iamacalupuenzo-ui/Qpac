import { useState } from 'react'
import { 
  X, HelpCircle, AlertTriangle, Info, 
  CheckCircle2, Clock, Calculator, ArrowRight,
  User, ShieldCheck, Banknote
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */
export default function AjusteContableDrawer({ open, onClose, onSave, accounts = [], role }) {
  const [selectedAcc, setSelectedAcc] = useState('')
  const [tipo, setSelectedTipo] = useState('ingreso') // 'ingreso' | 'salida'
  const [monto, setMonto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [referencia, setReferencia] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  const acc = accounts.find(a => a.id === selectedAcc) || {}
  const canSave = selectedAcc && monto > 0 && motivo.length >= 20 && referencia.length >= 5

  function handleConfirmSave() {
    if (!canSave) return
    setLoading(true)
    
    // Simulación
    setTimeout(() => {
      onSave({
        id: `ADJ-${Date.now()}`,
        cuentaId: selectedAcc,
        cuentaNombre: acc.label || selectedAcc,
        tipo,
        monto: parseFloat(monto),
        moneda: acc.moneda || 'USD',
        motivo: motivo.trim(),
        referencia: referencia.trim(),
        usuario: 'Marco Quispe L.',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString()
      })
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        // Reset
        setSelectedAcc(''); setSelectedTipo('ingreso'); setMonto(''); setMotivo(''); setReferencia('')
      }, 2000)
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/25" onClick={onClose} />

      {/* Drawer */}
      <div className="w-[480px] bg-white h-full flex flex-col" style={{ borderLeft: '1px solid var(--color-border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.06)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shrink-0">
              <Calculator size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Ajuste Contable Manual</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Módulo de Tesorería · RF-21</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div className="flex gap-3 p-3 rounded-lg bg-amber-50" style={{ border: '1px solid #fca5a5' }}>
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-amber-800 leading-relaxed">
              Los ajustes manuales son excepcionales y no reemplazan operaciones FX. Afectan el <strong>disponible neto</strong> de forma inmediata.
            </p>
          </div>

          {/* Cuenta */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Cuenta bancaria QAPAQ <span className="text-red-400">*</span></label>
            <select
              value={selectedAcc}
              onChange={e => setSelectedAcc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none"
            >
              <option value="">Selecciona una cuenta...</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.label} ({a.moneda})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Tipo de ajuste</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTipo('ingreso')}
                  className={clsx('flex-1 py-2 rounded-lg text-xs font-medium border transition-colors', tipo === 'ingreso' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600')}
                >
                  Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTipo('salida')}
                  className={clsx('flex-1 py-2 rounded-lg text-xs font-medium border transition-colors', tipo === 'salida' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600')}
                >
                  Salida
                </button>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Monto del ajuste <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">{acc.moneda || '—'}</span>
              </div>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">Motivo del ajuste <span className="text-red-400">*</span></label>
              <span className={clsx('text-[11px] font-medium', motivo.length >= 20 ? 'text-green-600' : 'text-gray-400')}>{motivo.length}/20</span>
            </div>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Describe detalladamente el origen de este ajuste..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none bg-white"
            />
          </div>

          {/* Referencia */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">Referencia de respaldo <span className="text-red-400">*</span></label>
              <span className={clsx('text-[11px] font-medium', referencia.length >= 5 ? 'text-green-600' : 'text-gray-400')}>{referencia.length}/5</span>
            </div>
            <input
              value={referencia}
              onChange={e => setReferencia(e.target.value)}
              placeholder="Número de ticket, correo, código de operación..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
            />
          </div>

          <div className="rounded-lg px-4 py-3.5 space-y-2" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-bg)' }}>
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><User size={11} /> Registrador</span>
              <span className="font-medium text-gray-700">Marco Quispe L.</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><Clock size={11} /> Fecha y hora</span>
              <span className="font-medium text-gray-700">{new Date().toLocaleDateString('es-PE')} · {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex flex-col gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          {success ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm py-2.5">
              <CheckCircle2 size={16} /> Ajuste registrado exitosamente
            </div>
          ) : (
            <button
              disabled={!canSave || loading}
              onClick={handleConfirmSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40"
            >
              {loading ? <Clock size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Confirmar Registro de Ajuste
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

