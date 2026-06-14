import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import clsx from 'clsx'
import { fmtMoney } from '../../utils/format.js'

/* ═══════════════════════════════════════════════
   OP SUMMARY BAR
   Banda persistente con los datos registrados de la
   operación. Se muestra en todas las pantallas del
   flujo: cliente, compra/venta, monto y TC pactado.
═══════════════════════════════════════════════ */
const TIPO_META = {
  compra:  { label: 'Compra',  Icon: ArrowDownLeft,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  venta:   { label: 'Venta',   Icon: ArrowUpRight,   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  cruzada: { label: 'Cruzada', Icon: ArrowLeftRight, cls: 'bg-purple-50 text-purple-700 border-purple-200' },
}

function fmtMonto(monto, moneda) {
  if (monto === null || monto === undefined || monto === '') return null
  const n = typeof monto === 'number' ? monto : parseFloat(String(monto).replace(/,/g, ''))
  if (isNaN(n) || n <= 0) return null
  return `${moneda ? moneda + ' ' : ''}${fmtMoney(n)}`
}

function fmtTc(tc) {
  if (tc === null || tc === undefined || tc === '') return null
  const n = typeof tc === 'number' ? tc : parseFloat(String(tc).replace(',', '.'))
  if (isNaN(n) || n <= 0) return null
  return n.toFixed(4)
}

function Item({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-800 truncate">{children}</span>
    </div>
  )
}

export default function OpSummaryBar({ id, cliente, tipo, monedaCruzada, monto, moneda, tc, className = '' }) {
  // Nada que mostrar todavía
  if (!cliente && !tipo) return null

  const meta      = TIPO_META[tipo]
  const monedaOp  = moneda ?? (tipo === 'cruzada' ? (monedaCruzada ?? 'PEN') : tipo === 'compra' ? 'USD' : tipo === 'venta' ? 'PEN' : undefined)
  const montoStr  = fmtMonto(monto, monedaOp)
  const tcStr     = fmtTc(tc)

  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-gray-100 px-6 py-4 mb-6 shadow-sm',
      'flex flex-wrap items-center gap-x-8 gap-y-3',
      className,
    )}>
      {id && <Item label="Operación"><span className="font-mono">{id}</span></Item>}

      {cliente && <Item label="Cliente">{cliente}</Item>}

      {meta && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tipo</span>
          <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold w-fit', meta.cls)}>
            <meta.Icon size={11} />
            {meta.label}{tipo === 'cruzada' && monedaCruzada ? ` ${monedaCruzada === 'PEN' ? 'soles' : 'dólares'}` : ''}
          </span>
        </div>
      )}

      {montoStr && <Item label="Monto"><span className="font-mono">{montoStr}</span></Item>}

      {tcStr && <Item label="TC pactado"><span className="font-mono">{tcStr}</span></Item>}
    </div>
  )
}
