import { useState, useRef, useEffect, useMemo } from 'react'
import { Save, Info, Plus, X, Check } from 'lucide-react'
import clsx from 'clsx'
import { useToast, ToastContainer } from '../../components/ui/Toast'

/* ═══════════════════════════════════════════════
   DEFINICIÓN DE MÓDULOS Y PERMISOS
═══════════════════════════════════════════════ */
export const ALL_PERMS = ['visible', 'crear', 'editar', 'eliminar', 'ejecutar', 'descargar']
export const PERM_LABELS = {
  visible:   'Visible',
  crear:     'Crear',
  editar:    'Editar',
  eliminar:  'Eliminar',
  ejecutar:  'Ejecutar',
  descargar: 'Descargar',
}

export const MODULES = [
  { id: 'dash_admin', label: 'Dashboard Administrador', group: 'Dashboards',          applicable: ['visible'] },
  { id: 'dash_op',    label: 'Dashboard Operativo',     group: 'Dashboards',          applicable: ['visible'] },
  { id: 'm0',  label: 'M0 · Gestión de Clientes',       group: 'Módulos Operativos',  applicable: ['visible','crear','editar','descargar'] },
  { id: 'm1',  label: 'M1 · Front Office',              group: 'Módulos Operativos',  applicable: ['visible','crear','editar','descargar'] },
  { id: 'm2',  label: 'M2 · Back Office',               group: 'Módulos Operativos',  applicable: ['visible','editar','descargar'] },
  { id: 'm3',  label: 'M3 · Posición y Tesorería',      group: 'Módulos Operativos',  applicable: ['visible','editar','descargar'] },
  { id: 'm4',  label: 'M4 · Cierre Diario',             group: 'Módulos Operativos',  applicable: ['visible','editar','ejecutar','descargar'] },
  { id: 'm5',  label: 'M5 · Rep. Regulatorios',         group: 'Módulos Operativos',  applicable: ['visible','crear','descargar'] },
  { id: 'm6',  label: 'M6 · Rep. Operativos',           group: 'Módulos Operativos',  applicable: ['visible','descargar'] },
  { id: 'auditoria', label: 'Auditoría',                group: 'Transversales',       applicable: ['visible','descargar'] },
  { id: 'config',    label: 'Configuración',            group: 'Transversales',       applicable: ['visible','crear','editar','eliminar'] },
]

/* ═══════════════════════════════════════════════
   ROLES
═══════════════════════════════════════════════ */
export const ROLES = [
  { id: 'admin',    label: 'Administrador',              color: 'purple', desc: 'Acceso total — configuración del sistema' },
  { id: 'trader',   label: 'Trader',                     color: 'blue',   desc: 'Front Office · Cotización y registro FX' },
  { id: 'middle',   label: 'Middle Office',              color: 'cyan',   desc: 'Gestión de clientes y cartera (M0)' },
  { id: 'back',     label: 'Back Office',                color: 'indigo', desc: 'Validación y liquidación de operaciones' },
  { id: 'head',     label: 'Head de Mesa',               color: 'violet', desc: 'Supervisión Mesa · M0 excepciones, M1, M3' },
  { id: 'jefe_op',  label: 'Jefe de Op. Centrales',      color: 'sky',    desc: 'M2, M3, M4 · Cierre diario' },
  { id: 'tesoreria',label: 'Tesorería y Posición',       color: 'teal',   desc: 'Posición FX · Cierre y reportes' },
  { id: 'contab',   label: 'Contabilidad',               color: 'emerald',desc: 'Posición FX · Trama contable' },
  { id: 'head_tes', label: 'Jefe de Tesorería',          color: 'green',  desc: 'Acceso amplio M0–M6' },
  { id: 'gerente',  label: 'Gerente de Finanzas',        color: 'amber',  desc: 'Dashboards gerenciales y reportes (R)' },
  { id: 'riesgos',  label: 'Riesgos',                    color: 'orange', desc: 'M3 y reportes regulatorios' },
  { id: 'plaft',    label: 'Oficial Cumplimiento PLAFT', color: 'red',    desc: 'M0 PLAFT y reportes operativos' },
  { id: 'reportes', label: 'Reporte Regulatorio',        color: 'rose',   desc: 'M5 y reportes operativos' },
  { id: 'seguridad',label: 'Seguridad de la Información',color: 'slate',  desc: 'Solo lectura · Logs y auditoría' },
]

const ROLE_COLOR = {
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', sel: 'border-purple-300 bg-purple-50' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   sel: 'border-blue-300 bg-blue-50' },
  cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-700',   dot: 'bg-cyan-500',   sel: 'border-cyan-300 bg-cyan-50' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', sel: 'border-indigo-300 bg-indigo-50' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', sel: 'border-violet-300 bg-violet-50' },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-700',    dot: 'bg-sky-500',    sel: 'border-sky-300 bg-sky-50' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500',   sel: 'border-teal-300 bg-teal-50' },
  emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500',sel: 'border-emerald-300 bg-emerald-50' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  sel: 'border-green-300 bg-green-50' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  sel: 'border-amber-300 bg-amber-50' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', sel: 'border-orange-300 bg-orange-50' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    sel: 'border-red-300 bg-red-50' },
  rose:   { bg: 'bg-rose-50',   text: 'text-rose-700',   dot: 'bg-rose-500',   sel: 'border-rose-300 bg-rose-50' },
  slate:  { bg: 'bg-slate-50',  text: 'text-slate-700',  dot: 'bg-slate-500',  sel: 'border-slate-300 bg-slate-50' },
}

/* ═══════════════════════════════════════════════
   PERMISOS INICIALES POR ROL
═══════════════════════════════════════════════ */
const INITIAL_PERMS = {
  admin:    { dash_admin:['visible'], dash_op:['visible'], m0:['visible','crear','editar','descargar'], m1:['visible','crear','editar','descargar'], m2:['visible','editar','descargar'], m3:['visible','editar','descargar'], m4:['visible','editar','ejecutar','descargar'], m5:['visible','crear','descargar'], m6:['visible','descargar'], auditoria:['visible','descargar'], config:['visible','crear','editar','eliminar'] },
  trader:   { dash_op:['visible'], m1:['visible','crear','editar'], m3:['visible'], m6:['visible','descargar'] },
  middle:   { dash_op:['visible'], m0:['visible','crear','editar','descargar'], m1:['visible'], m6:['visible','descargar'] },
  back:     { dash_op:['visible'], m1:['visible'], m2:['visible','editar','descargar'], m6:['visible','descargar'] },
  head:     { dash_op:['visible'], m0:['visible','editar'], m1:['visible','crear','editar'], m3:['visible','editar'], m5:['visible'], m6:['visible','descargar'] },
  jefe_op:  { dash_op:['visible'], m2:['visible','editar','descargar'], m3:['visible'], m4:['visible','editar','ejecutar','descargar'], m6:['visible','crear','descargar'] },
  tesoreria:{ dash_op:['visible'], m3:['visible','editar'], m4:['visible','editar','ejecutar','descargar'], m5:['visible'], m6:['visible','descargar'] },
  contab:   { dash_op:['visible'], m3:['visible','editar'], m4:['visible'], m6:['visible','descargar'] },
  head_tes: { dash_op:['visible'], m0:['visible','crear','editar'], m1:['visible','editar'], m2:['visible','editar'], m3:['visible','editar'], m4:['visible','editar','ejecutar','descargar'], m5:['visible','crear','descargar'], m6:['visible','crear','descargar'] },
  gerente:  { dash_op:['visible'], m3:['visible'], m5:['visible'], m6:['visible','descargar'] },
  riesgos:  { dash_op:['visible'], m3:['visible'], m5:['visible','crear','descargar'], m6:['visible'] },
  plaft:    { dash_op:['visible'], m0:['visible','editar'], m6:['visible'] },
  reportes: { dash_op:['visible'], m5:['visible','crear','descargar'], m6:['visible'] },
  seguridad:{ auditoria:['visible','descargar'] },
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function initPerms() {
  return JSON.parse(JSON.stringify(INITIAL_PERMS))
}

function groupModules() {
  const groups = {}
  MODULES.forEach(m => {
    if (!groups[m.group]) groups[m.group] = []
    groups[m.group].push(m)
  })
  return groups
}

/* ═══════════════════════════════════════════════
   MODAL — Crear nuevo rol
═══════════════════════════════════════════════ */
const COLOR_OPTIONS = [
  'blue','cyan','indigo','violet','teal','emerald',
  'green','amber','orange','red','rose','slate','purple','sky',
]

function NewRoleModal({ open, existingIds, onClose, onCreate }) {
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')
  const [color, setColor] = useState('blue')
  const [errors, setErrors] = useState({})
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) { setName(''); setDesc(''); setColor('blue'); setErrors({}) }
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'El nombre es obligatorio.'
    const slug = name.trim().toLowerCase().replace(/\s+/g, '_')
    if (existingIds.includes(slug)) e.name = 'Ya existe un rol con ese nombre.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleCreate() {
    if (!validate()) return
    const id = name.trim().toLowerCase().replace(/\s+/g, '_')
    onCreate({ id, label: name.trim(), desc: desc.trim(), color })
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div
        className="fixed z-50 bg-white rounded-xl shadow-xl"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold text-gray-900">Nuevo rol</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Nombre del rol <span className="text-red-400">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ej. Analista de Riesgo"
              value={name}
              onChange={e => { setName(e.target.value); setErrors({}) }}
              className={clsx(
                'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all',
                errors.name
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              )}
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción</label>
            <input
              type="text"
              placeholder="Breve descripción del rol..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Color identificador</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => {
                const rc = ROLE_COLOR[c]
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={clsx(
                      'w-6 h-6 rounded-full transition-all',
                      rc.dot,
                      color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'
                    )}
                    title={c}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={clsx('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', ROLE_COLOR[color]?.bg, ROLE_COLOR[color]?.text)}>
                Vista previa del badge
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t flex gap-2" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleCreate}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            <Check size={13} /> Crear rol
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE
═══════════════════════════════════════════════ */
/* helper para comparar permisos ignorando orden de arrays */
function serializePerms(p) {
  if (!p) return '{}'
  const sorted = {}
  Object.keys(p).sort().forEach(k => { sorted[k] = [...(p[k] ?? [])].sort() })
  return JSON.stringify(sorted)
}

export default function RolesTab() {
  const [roles, setRoles]             = useState(ROLES)
  const [selectedRole, setSelectedRole] = useState('trader')
  const [perms, setPerms]             = useState(initPerms)
  const [savedPerms, setSavedPerms]   = useState(initPerms)  // baseline guardado
  const [newRoleOpen, setNewRoleOpen] = useState(false)
  const { toasts, add: toast, remove: removeToast } = useToast()

  const groups  = groupModules()
  const isAdmin = selectedRole === 'admin'

  /* habilita el botón solo cuando hay cambios respecto al último guardado */
  const hasChanges = useMemo(() => {
    if (isAdmin) return false
    return serializePerms(perms[selectedRole]) !== serializePerms(savedPerms[selectedRole])
  }, [perms, savedPerms, selectedRole, isAdmin])

  function handleCreateRole(newRole) {
    setRoles(rs => [...rs, newRole])
    setPerms(p => ({ ...p, [newRole.id]: {} }))
    setSavedPerms(p => ({ ...p, [newRole.id]: {} }))
    setSelectedRole(newRole.id)
    toast({ title: 'Rol creado', message: `"${newRole.label}" fue agregado al sistema.`, type: 'success' })
  }

  function toggle(moduleId, perm) {
    if (isAdmin) return
    setPerms(prev => {
      const cur = prev[selectedRole] ?? {}
      const modPerms = cur[moduleId] ? [...cur[moduleId]] : []
      let next

      if (perm === 'visible') {
        // Si apagamos visible → borrar todos los permisos del módulo
        if (modPerms.includes('visible')) {
          next = []
        } else {
          next = ['visible']
        }
      } else {
        if (modPerms.includes(perm)) {
          next = modPerms.filter(p => p !== perm)
        } else {
          // Auto-check visible al activar cualquier otro permiso
          next = [...new Set(['visible', ...modPerms, perm])]
        }
      }

      const newCur = { ...cur }
      if (next.length === 0) {
        delete newCur[moduleId]
      } else {
        newCur[moduleId] = next
      }
      return { ...prev, [selectedRole]: newCur }
    })
  }

  function handleSave() {
    setSavedPerms(prev => ({
      ...prev,
      [selectedRole]: JSON.parse(JSON.stringify(perms[selectedRole] ?? {})),
    }))
    const roleObj2 = roles.find(r => r.id === selectedRole)
    toast({ title: 'Permisos guardados', message: `Configuración de "${roleObj2?.label}" actualizada.`, type: 'success' })
  }

  const roleObj = roles.find(r => r.id === selectedRole)
  const rc = ROLE_COLOR[roleObj?.color ?? 'blue']

  return (
    <>
    <NewRoleModal
      open={newRoleOpen}
      existingIds={roles.map(r => r.id)}
      onClose={() => setNewRoleOpen(false)}
      onCreate={handleCreateRole}
    />

    <div className="flex gap-4" style={{ minHeight: 560 }}>

      {/* ── Lista de roles ── */}
      <div
        className="shrink-0 w-56 bg-white rounded-lg overflow-hidden flex flex-col"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Roles</p>
            <button
              onClick={() => setNewRoleOpen(true)}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <Plus size={11} /> Nuevo
            </button>
          </div>
          <p className="text-[11px] text-gray-400">{roles.length} roles configurados</p>
        </div>
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 520 }}>
          {roles.map(role => {
            const c = ROLE_COLOR[role.color] ?? ROLE_COLOR.blue
            const isSelected = selectedRole === role.id
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={clsx(
                  'w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors border-l-2',
                  isSelected
                    ? `border-l-current ${c.bg} ${c.text}`
                    : 'border-l-transparent hover:bg-gray-50 text-gray-700'
                )}
                style={isSelected ? { borderLeftColor: 'currentColor' } : {}}
              >
                <span className={clsx('w-2 h-2 rounded-full shrink-0', c.dot)} />
                <span className="text-xs font-medium leading-snug">{role.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Matriz de permisos ── */}
      <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

        {/* Header del rol seleccionado */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold', rc.bg, rc.text)}>
              {roleObj?.label}
            </div>
            <p className="text-xs text-gray-500">{roleObj?.desc}</p>
            {isAdmin && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Info size={10} /> Permisos del Administrador no son editables
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            title={isAdmin ? 'El rol Administrador no es editable' : !hasChanges ? 'No hay cambios por guardar' : ''}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Save size={12} />
            Guardar cambios
          </button>
        </div>

        {/* Tabla de permisos */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 w-64 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  Módulo
                </th>
                {ALL_PERMS.map(p => (
                  <th key={p} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 border-b" style={{ borderColor: 'var(--color-border)', minWidth: 76 }}>
                    {PERM_LABELS[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([group, mods]) => (
                <>
                  {/* Group header */}
                  <tr key={`g-${group}`} className="bg-gray-50/60">
                    <td
                      colSpan={ALL_PERMS.length + 1}
                      className="px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest border-y"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {group}
                    </td>
                  </tr>

                  {/* Module rows */}
                  {mods.map((mod, idx) => {
                    const modPerms = perms[selectedRole]?.[mod.id] ?? []
                    return (
                      <tr
                        key={mod.id}
                        className={clsx(
                          'transition-colors',
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30',
                          !isAdmin && 'hover:bg-blue-50/20'
                        )}
                      >
                        <td className="px-5 py-2.5 text-xs text-gray-700 border-b" style={{ borderColor: 'var(--color-border)' }}>
                          {mod.label}
                        </td>
                        {ALL_PERMS.map(perm => {
                          const applicable = mod.applicable.includes(perm)
                          const checked = applicable && modPerms.includes(perm)
                          return (
                            <td
                              key={perm}
                              className="px-3 py-2.5 text-center border-b"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              {applicable ? (
                                <label className={clsx(
                                  'inline-flex items-center justify-center cursor-pointer',
                                  (isAdmin) && 'cursor-default'
                                )}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(mod.id, perm)}
                                    disabled={isAdmin}
                                    className="sr-only"
                                  />
                                  <span className={clsx(
                                    'w-4 h-4 rounded flex items-center justify-center transition-all border',
                                    checked
                                      ? isAdmin
                                        ? 'bg-gray-400 border-gray-400'
                                        : 'bg-blue-600 border-blue-600'
                                      : 'bg-white border-gray-300',
                                    !isAdmin && !checked && 'hover:border-blue-400',
                                  )}>
                                    {checked && (
                                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </span>
                                </label>
                              ) : (
                                <span className="text-gray-200 text-sm select-none">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
