import { useState, useRef, useEffect } from 'react'
import { 
  X, Info, AlertTriangle, Upload, FileText, 
  CheckCircle2, DollarSign, ArrowRight, Trash2,
  FileCheck, ShieldCheck, Clock
} from 'lucide-react'
import clsx from 'clsx'

/* ── MOCK DATA REUSE ── */
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

/* ── UI ATOMS ── */
function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-gray-400">{hint}</p>}
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

function DataRow({ label, value, highlight }) {
  return (
    <div className="flex flex-col p-3 rounded-lg bg-gray-50/50 border border-gray-100">
      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">{label}</span>
      <span className={clsx("text-sm font-semibold", highlight ? "text-blue-600" : "text-gray-800 ")}>{value || '—'}</span>
    </div>
  )
}

export default function EnvioBackOfficeDrawer({ open, op, onClose, onConfirmar }) {
  const [files, setFiles] = useState([])
  const [ctaIngreso, setCtaIngreso] = useState('')
  const [ctaEgreso, setCtaEgreso] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Reset internal state when drawer opens with new op
  useEffect(() => {
    if (open && op) {
      setFiles([])
      setCtaIngreso(op.cuentaQpaqIn || '')
      setCtaEgreso(op.cuentaQpaqOut || '')
      setShowConfirm(false)
      setLoading(false)
    }
  }, [open, op])

  if (!open || !op) return null

  const monedaIngreso = op.tipo === 'compra' ? 'PEN' : 'USD'
  const monedaEgreso  = op.tipo === 'compra' ? 'USD' : 'PEN'
  
  const optsIngreso = (CUENTAS_QAPAQ[monedaIngreso] || []).map(c => ({ 
    value: c.id, 
    label: `${c.banco} · ${c.numero} (${c.moneda})` 
  }))
  const optsEgreso = (CUENTAS_QAPAQ[monedaEgreso] || []).map(c => ({ 
    value: c.id, 
    label: `${c.banco} · ${c.numero} (${c.moneda})` 
  }))

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    if (files.length + newFiles.length > 5) {
      alert("Máximo 5 archivos por operación.")
      return
    }

    const validFiles = newFiles.filter(f => {
      const isType = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
      const isSize = f.size <= 10 * 1024 * 1024
      if (!isType) alert(`Formato no válido: ${f.name}`)
      if (!isSize) alert(`Archivo excede los 10MB: ${f.name}`)
      return isType && isSize
    })

    setFiles(prev => [...prev, ...validFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleSend = () => {
    setLoading(true)
    setTimeout(() => {
      onConfirmar(op.id, { ctaIngreso, ctaEgreso, files })
      setLoading(false)
      onClose()
    }, 1000)
  }

  const canSend = files.length > 0 && ctaIngreso && ctaEgreso

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose} />
      
      {/* Content Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Confirmación de Abono</h2>
              <p className="text-xs text-gray-500">Envío de operación a revisión por Back Office</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scroll Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          
          {/* Step 1: Previsualización */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px]">1</span>
              Previsualización de Datos
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <DataRow label="ID OPERACIÓN" value={op.id} highlight />
               <DataRow label="CLIENTE" value={op.clienteNombre} />
               <DataRow label="TIPO OPERACIÓN" value={op.tipo.toUpperCase()} highlight />
               <DataRow label="TC PACTADO" value={op.tc.toFixed(3)} highlight />
               <DataRow label="MONTO USD" value={`$ ${op.montoUSD.toLocaleString()}`} />
               <DataRow label="MONTO PEN" value={`S/ ${op.montoPEN.toLocaleString()}`} />
            </div>
            
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-800 leading-relaxed">
                <strong>Importante:</strong> Los datos superiores son de solo-lectura. Si existe un error en montos o tipo de cambio, la operación debe ser anulada por Middleware y re-registrada.
              </p>
            </div>
          </section>

          {/* Step 2: Cuentas QAPAQ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px]">2</span>
              Definición de Cuentas QAPAQ
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cuenta Ingreso (Abone del Cliente)" required hint={`Moneda: ${monedaIngreso}`}>
                 <select value={ctaIngreso} onChange={e => setCtaIngreso(e.target.value)} 
                   className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 outline-none">
                    <option value="">Seleccionar cuenta...</option>
                    {optsIngreso.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                 </select>
              </Field>
              <Field label="Cuenta Egreso (Envío al Cliente)" required hint={`Moneda: ${monedaEgreso}`}>
                 <select value={ctaEgreso} onChange={e => setCtaEgreso(e.target.value)} 
                   className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 outline-none">
                    <option value="">Seleccionar cuenta...</option>
                    {optsEgreso.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                 </select>
              </Field>
            </div>
          </section>

          {/* Step 3: Adjuntar Comprobantes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                 <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px]">3</span>
                 Comprobantes de Pago
               </div>
               <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", files.length > 0 ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600")}>
                 {files.length} / 5 archivos
               </span>
            </div>

            <div 
              onClick={() => fileInputRef.current.click()}
              className="group border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer transition-all"
            >
              <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
              <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm">
                <Upload size={20} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Arrastra o selecciona el comprobante</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG hasta 10MB c/u</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-700 truncate">{f.name}</p>
                        <p className="text-[10px] text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(i) }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0">
          {!canSend ? (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg mb-4">
              <AlertTriangle size={14} />
              <p className="text-[11px] font-medium leading-none">
                Complete las cuentas QAPAQ y adjunte al menos un comprobante para continuar.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg mb-4">
              <CheckCircle2 size={14} />
              <p className="text-[11px] font-medium leading-none">
                Todos los requisitos obligatorios han sido completados.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSend}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold shadow-lg transition-all",
              canSend 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 active:scale-[0.98]" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            Validar y Enviar a Back Office
            <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* Confirmation Message Modal Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
           <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                   <Clock size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">¿Confirmar envío?</h3>
                   <p className="text-sm text-gray-500 mt-2 leading-relaxed px-4">
                     Estás por enviar la operación <strong className="text-gray-800">{op.id}</strong> a revisión por Back Office. Se adjuntaron <strong className="text-gray-800">{files.length}</strong> comprobantes.
                   </p>
                </div>
             </div>

             <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
               <div className="flex justify-between text-xs"><span className="text-gray-400">Cliente:</span> <span className="font-bold text-gray-800">{op.clienteNombre}</span></div>
               <div className="flex justify-between text-xs"><span className="text-gray-400">Total a liquidar:</span> <span className="font-bold text-blue-600">{op.montoUSD.toLocaleString()} USD</span></div>
               <div className="flex justify-between text-xs"><span className="text-gray-400">Cuenta Ingreso:</span> <span className="font-medium text-gray-600">{optsIngreso.find(o=>o.value===ctaIngreso)?.label.split('(')[0]}</span></div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <button onClick={() => setShowConfirm(false)} className="py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                  Cancelar
               </button>
               <button onClick={handleSend} disabled={loading} className="py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center">
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : "Sí, enviar"}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  )
}

function RefreshCw(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
    </svg>
  )
}
