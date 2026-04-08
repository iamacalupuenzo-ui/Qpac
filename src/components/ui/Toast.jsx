import { useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const CONF = {
  success: { Icon: CheckCircle2, iconCls: 'text-green-500' },
  error:   { Icon: XCircle,      iconCls: 'text-red-500'   },
  warning: { Icon: AlertTriangle,iconCls: 'text-amber-500' },
  info:    { Icon: Info,         iconCls: 'text-blue-500'  },
}

/* ── Hook ── */
export function useToast() {
  const [toasts, setToasts] = useState([])

  function add({ message, title, type = 'success', duration = 3500 }) {
    const id = Date.now() + Math.random()
    setToasts(ts => [...ts, { id, message, title, type }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function remove(id) {
    setToasts(ts => ts.filter(t => t.id !== id))
  }

  return { toasts, add, remove }
}

/* ── Container ── */
export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  const { Icon, iconCls } = CONF[toast.type] ?? CONF.success
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white border pointer-events-auto w-72"
      style={{
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      }}
    >
      <Icon size={16} className={clsx(iconCls, 'shrink-0 mt-0.5')} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-xs font-semibold text-gray-800 leading-snug">{toast.title}</p>
        )}
        <p className={clsx('text-xs text-gray-500', toast.title && 'mt-0.5')}>{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-300 hover:text-gray-500 transition-colors shrink-0 mt-0.5"
      >
        <X size={13} />
      </button>
    </div>
  )
}
