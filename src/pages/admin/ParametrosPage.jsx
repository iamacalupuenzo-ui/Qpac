import { useState } from 'react'
import {
  SlidersHorizontal, ShieldCheck, BookOpen, Cpu,
  Save, CheckCircle2, Clock,
} from 'lucide-react'
import clsx from 'clsx'

/* ══════════════════════════════════════════════
   INITIAL STATE
══════════════════════════════════════════════ */
const DEFAULT_PARAMS = {
  /* Límites Operacionales */
  montoLimiteGeneral:    5_000_000,
  tcTolerancia:          2.5,
  limiteAcumuladoDiario: 10_000_000,
  stopLossUSD:           500_000,
  maxOpsConcurrentes:    50,

  /* Seguridad y Sesión */
  sessionTimeout:        15,
  reqDobleFactorOp:      true,
  maxIntentosFallidos:   5,
  bloqueoAutomatico:     true,

  /* Regulatorio */
  umbralPLAFT:           10_000,
  diasResolucionDiff:    1,
  reportesBCRP_auto:     true,
  vigenciaNormativa:     '2026-01-01',

  /* Sistema */
  backupAutomatico:      true,
  logRetention:          90,
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function fmtMoney(n) {
  return parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 0 })
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-blue-600' : 'bg-gray-200'
      )}
    >
      <span className={clsx(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200',
        checked ? 'translate-x-4' : 'translate-x-0'
      )} />
    </button>
  )
}

function FieldParam({ label, hint, children, row = false }) {
  return (
    <div className={clsx(row ? 'flex items-center justify-between gap-4' : '')}>
      <div className={row ? 'flex-1' : 'mb-1.5'}>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className={row ? 'shrink-0' : 'mt-1.5'}>
        {children}
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white'
const selectCls = inputCls + ' appearance-none'

/* ══════════════════════════════════════════════
   SECTION CARD
══════════════════════════════════════════════ */
function Section({ icon: Icon, iconColor = 'text-gray-400', title, desc, children }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-bg)' }}>
        <Icon size={15} className={iconColor} />
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="px-5 py-5 space-y-5">
        {children}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function ParametrosPage() {
  const [params,   setParams]   = useState(DEFAULT_PARAMS)
  const [loading,  setLoading]  = useState(false)
  const [savedAt,  setSavedAt]  = useState(null)
  const [feedback, setFeedback] = useState(null)

  function set(key, value) {
    setParams(p => ({ ...p, [key]: value }))
    setFeedback(null)
  }

  function handleSave() {
    setLoading(true)
    setTimeout(() => {
      const now = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      setSavedAt(now)
      setLoading(false)
      setFeedback({ type: 'success', msg: `Parámetros guardados correctamente a las ${now}. Registro añadido a auditoría.` })
      setTimeout(() => setFeedback(null), 5000)
    }, 1000)
  }

  const stats = [
    { label: 'Límite general (USD)',  value: `$ ${fmtMoney(params.montoLimiteGeneral)}`,   color: 'text-blue-600'   },
    { label: 'Tolerancia TC',         value: `${params.tcTolerancia} %`,                    color: 'text-gray-900'   },
    { label: 'Timeout de sesión',     value: `${params.sessionTimeout} min`,                 color: 'text-gray-900'   },
    { label: 'Stop Loss (USD)',         value: `$ ${fmtMoney(params.stopLossUSD)}`,           color: 'text-red-600'    },
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

      {/* Feedback */}
      {feedback && (
        <div className={clsx(
          'flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-semibold',
          feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        )} style={{ border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fca5a5'}` }}>
          <CheckCircle2 size={13} />
          {feedback.msg}
        </div>
      )}

      {/* ── Límites Operacionales ── */}
      <Section
        icon={SlidersHorizontal}
        iconColor="text-blue-500"
        title="Límites Operacionales"
        desc="Montos y tolerancias que rigen la ejecución de operaciones FX. Los cambios son efectivos de inmediato."
      >
        <div className="grid grid-cols-2 gap-5">
          <FieldParam
            label="Monto Límite General Operacional (USD)"
            hint="Montos superiores requerirán VoBo del Head antes de ejecutarse."
          >
            <input type="number" value={params.montoLimiteGeneral}
              onChange={e => set('montoLimiteGeneral', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>

          <FieldParam
            label="Tolerancia TC vs Pizarra (%)"
            hint="Desviación máxima permitida entre el TC pactado y el TC de referencia."
          >
            <input type="number" step="0.1" value={params.tcTolerancia}
              onChange={e => set('tcTolerancia', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>

          <FieldParam
            label="Límite Acumulado Diario (USD)"
            hint="Monto máximo consolidado de compras + ventas en el día por mesa."
          >
            <input type="number" value={params.limiteAcumuladoDiario}
              onChange={e => set('limiteAcumuladoDiario', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>

          <FieldParam
            label="Stop Loss — Exposición Máxima (USD)"
            hint="Monto máximo de posición neta (comprada o vendida). Al alcanzarlo se dispara una alerta en Posición FX."
          >
            <input type="number" value={params.stopLossUSD}
              onChange={e => set('stopLossUSD', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>

          <FieldParam
            label="Máx. Operaciones Concurrentes por Mesa"
            hint="Límite de operaciones en estado Reservada simultáneamente."
          >
            <input type="number" value={params.maxOpsConcurrentes}
              onChange={e => set('maxOpsConcurrentes', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>
        </div>
      </Section>

      {/* ── Seguridad y Sesión ── */}
      <Section
        icon={ShieldCheck}
        iconColor="text-green-500"
        title="Seguridad y Sesión"
        desc="Controles de acceso, autenticación y bloqueo de cuentas."
      >
        <div className="grid grid-cols-2 gap-5">
          <FieldParam
            label="Timeout de Inactividad (minutos)"
            hint="Tiempo sin actividad antes de cerrar la sesión automáticamente."
          >
            <select value={params.sessionTimeout}
              onChange={e => set('sessionTimeout', Number(e.target.value))}
              className={selectCls}>
              <option value={5}>5 minutos</option>
              <option value={10}>10 minutos</option>
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
            </select>
          </FieldParam>

          <FieldParam
            label="Máx. Intentos Fallidos de Login"
            hint="Al superarlo la cuenta queda bloqueada hasta desbloqueo manual."
          >
            <input type="number" min={1} max={10} value={params.maxIntentosFallidos}
              onChange={e => set('maxIntentosFallidos', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>
        </div>

        <div className="pt-2 border-t space-y-4" style={{ borderColor: 'var(--color-border)' }}>
          <FieldParam
            label="Exigir Doble Factor para Autorizaciones"
            hint="Afecta cierres diarios, anulaciones y cambios de configuración."
            row
          >
            <Toggle checked={params.reqDobleFactorOp} onChange={v => set('reqDobleFactorOp', v)} />
          </FieldParam>
          <FieldParam
            label="Bloqueo Automático por Inactividad Prolongada"
            hint="Bloquea la cuenta si no ha iniciado sesión en más de 30 días corridos."
            row
          >
            <Toggle checked={params.bloqueoAutomatico} onChange={v => set('bloqueoAutomatico', v)} />
          </FieldParam>
        </div>
      </Section>

      {/* ── Regulatorio ── */}
      <Section
        icon={BookOpen}
        iconColor="text-amber-500"
        title="Regulatorio"
        desc="Parámetros vinculados a la normativa SBS/BCRP/PLAFT. Modificaciones requieren aprobación del Compliance Officer."
      >
        <div className="grid grid-cols-2 gap-5">
          <FieldParam
            label="Umbral PLAFT para Reporte (USD)"
            hint="Operaciones individuales iguales o superiores generan alerta automática."
          >
            <input type="number" value={params.umbralPLAFT}
              onChange={e => set('umbralPLAFT', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>

          <FieldParam
            label="Días Hábiles para Resolución de Diferencias"
            hint="Plazo regulatorio máximo para resolver discrepancias de conciliación (AL-RI-04)."
          >
            <input type="number" min={1} max={5} value={params.diasResolucionDiff}
              onChange={e => set('diasResolucionDiff', Number(e.target.value))}
              className={inputCls} />
          </FieldParam>

          <FieldParam
            label="Fecha de Vigencia Normativa Activa"
            hint="Norma SBS/BCRP que rige el ciclo operativo actual."
          >
            <input type="date" value={params.vigenciaNormativa}
              onChange={e => set('vigenciaNormativa', e.target.value)}
              className={inputCls} />
          </FieldParam>
        </div>

        <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <FieldParam
            label="Generación Automática de Reportes BCRP/SBS al cierre"
            hint="El sistema pre-genera los reportes regulatorios al ejecutar el cierre diario."
            row
          >
            <Toggle checked={params.reportesBCRP_auto} onChange={v => set('reportesBCRP_auto', v)} />
          </FieldParam>
        </div>
      </Section>

      {/* ── Sistema ── */}
      <Section
        icon={Cpu}
        iconColor="text-gray-400"
        title="Sistema"
        desc="Configuración de infraestructura y retención de datos. Cambios requieren reinicio del servicio."
      >
        <div className="grid grid-cols-2 gap-5">
          <FieldParam
            label="Ambiente Activo"
            hint="Solo lectura. Modificar desde el panel de DevOps."
          >
            <input type="text" value="Producción" disabled
              className={clsx(inputCls, 'bg-gray-50 text-gray-400 cursor-not-allowed')} />
          </FieldParam>

          <FieldParam
            label="Versión del Sistema"
            hint="Desplegada en el entorno actual."
          >
            <input type="text" value="v1.2.0 — 26/04/2026" disabled
              className={clsx(inputCls, 'bg-gray-50 text-gray-400 cursor-not-allowed')} />
          </FieldParam>

          <FieldParam
            label="Retención del Log de Auditoría (días)"
            hint="Los registros más antiguos se archivarán en almacenamiento frío."
          >
            <select value={params.logRetention}
              onChange={e => set('logRetention', Number(e.target.value))}
              className={selectCls}>
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
              <option value={90}>90 días</option>
              <option value={180}>180 días</option>
            </select>
          </FieldParam>
        </div>

        <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <FieldParam
            label="Backup Automático Diario"
            hint="Snapshot del estado del sistema ejecutado al cierre operativo."
            row
          >
            <Toggle checked={params.backupAutomatico} onChange={v => set('backupAutomatico', v)} />
          </FieldParam>
        </div>
      </Section>

      {/* ── Footer guardar ── */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={13} className="text-blue-400" />
            Todos los cambios quedan registrados en el log de auditoría con usuario y timestamp.
            {savedAt && <span className="text-green-600 font-medium ml-2">· Último guardado: {savedAt}</span>}
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            {loading ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
            {loading ? 'Guardando...' : 'Guardar Parámetros'}
          </button>
        </div>
      </div>

    </div>
  )
}
