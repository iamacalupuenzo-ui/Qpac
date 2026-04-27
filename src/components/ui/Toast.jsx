import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle2 size={18} className="text-green-500" />,
    error:   <XCircle size={18} className="text-red-500" />,
    info:    <Info size={18} className="text-blue-500" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error:   'bg-red-50 border-red-200',
    info:    'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
  }

  return (
    <div className={clsx(
      "fixed top-6 right-6 z-[200] flex items-start gap-3 px-5 py-4 rounded-xl border shadow-xl animate-in slide-in-from-right-10 duration-300",
      bgColors[type]
    )}>
      <div className="mt-0.5">{icons[type]}</div>
      <div>
         {/* If a title is passed, show it, otherwise omit it */}
         <p className="text-sm font-bold text-gray-800">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="ml-4 p-1 rounded-lg transition-colors text-gray-500 hover:bg-black/5"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (toastPrm) => {
    setToasts(prev => [...prev, { ...toastPrm, id: Date.now() + Math.random() }])
  }
  const remove = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }
  return { toasts, add, remove }
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="fixed top-6 right-6 z-[300] flex flex-col gap-2">
       {toasts.map(t => (
          <div key={t.id} className={clsx(
            "flex items-start gap-3 px-5 py-4 rounded-xl border shadow-lg bg-white",
            t.type === 'success' && 'border-green-200 bg-green-50',
            t.type === 'error' && 'border-red-200 bg-red-50',
            t.type === 'info' && 'border-blue-200 bg-blue-50',
            t.type === 'warning' && 'border-amber-200 bg-amber-50',
          )}>
            <div className="mt-0.5">
               {t.type === 'success' ? <CheckCircle2 size={18} className="text-green-500" /> : null}
               {t.type === 'error' ? <XCircle size={18} className="text-red-500" /> : null}
               {t.type === 'info' ? <Info size={18} className="text-blue-500" /> : null}
               {t.type === 'warning' ? <AlertTriangle size={18} className="text-amber-500" /> : null}
            </div>
            <div>
               {t.title && <p className="text-sm font-bold text-gray-900">{t.title}</p>}
               <p className="text-xs text-gray-700 mt-0.5 min-w-[200px]">{t.message}</p>
            </div>
            <button onClick={() => onRemove(t.id)} className="ml-4 p-1 hover:bg-black/5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
               <X size={14} />
            </button>
          </div>
       ))}
    </div>
  )
}
