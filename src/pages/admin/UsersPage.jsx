import { useState, useRef, useEffect } from 'react'
import {
  Search, Plus, Check, X, Filter,
  User, Mail, Phone, Key, RefreshCw, Eye, EyeOff,
  Unlock, UserX, UserCheck, Shield, ChevronDown, Pencil,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import RolesTab, { ROLES } from './RolesTab'
import { useToast, ToastContainer } from '../../components/ui/Toast'

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const ROLE_COLOR = {
  admin:    { bg: 'bg-purple-50', text: 'text-purple-700' },
  trader:   { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  middle:   { bg: 'bg-cyan-50',   text: 'text-cyan-700'   },
  back:     { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  head:     { bg: 'bg-violet-50', text: 'text-violet-700' },
  jefe_op:  { bg: 'bg-sky-50',    text: 'text-sky-700'    },
  tesoreria:{ bg: 'bg-teal-50',   text: 'text-teal-700'   },
  contab:   { bg: 'bg-emerald-50',text: 'text-emerald-700'},
  head_tes: { bg: 'bg-green-50',  text: 'text-green-700'  },
  gerente:  { bg: 'bg-amber-50',  text: 'text-amber-700'  },
  riesgos:  { bg: 'bg-orange-50', text: 'text-orange-700' },
  plaft:    { bg: 'bg-red-50',    text: 'text-red-700'    },
  reportes: { bg: 'bg-rose-50',   text: 'text-rose-700'   },
  seguridad:{ bg: 'bg-slate-50',  text: 'text-slate-700'  },
}

const STATUS_STYLE = {
  activo:    { bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-500',  label: 'Activo' },
  inactivo:  { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Inactivo' },
  bloqueado: { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500',    label: 'Bloqueado' },
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function roleLabel(roleId) {
  return ROLES.find(r => r.id === roleId)?.label ?? roleId
}

/* ═══════════════════════════════════════════════
   DATOS MOCK
═══════════════════════════════════════════════ */
const MOCK_USERS = [
  { id: 1, name: 'Admin QAPAQ',            email: 'admin@qapaq.com.pe',          phone: '999000001', role: 'admin',    status: 'activo',    lastLogin: 'Hoy 07:30',   logins: 112, created: '01/01/2026', password: 'Admin2026@#' },
  { id: 2, name: 'Patricia Lozano Díaz',   email: 'patricia.lozano@qapaq.com.pe',phone: '932109876', role: 'head',     status: 'activo',    lastLogin: 'Hoy 07:58',   logins: 71,  created: '01/01/2026', password: 'PLozano$26' },
  { id: 3, name: 'Marco Quispe León',      email: 'middle@qapaq.com.pe',         phone: '965432109', role: 'middle',   status: 'activo',    lastLogin: 'Hoy 09:01',   logins: 62,  created: '01/01/2026', password: 'qapaq2026' },
  { id: 4, name: 'Carlos Medina Ruiz',     email: 'trader@qapaq.com.pe',         phone: '987654321', role: 'trader',   status: 'activo',    lastLogin: 'Hoy 08:32',   logins: 45,  created: '01/02/2026', password: 'qapaq2026' },
  { id: 5, name: 'Ana Torres Vega',        email: 'back@qapaq.com.pe',           phone: '976543210', role: 'back',     status: 'activo',    lastLogin: 'Hoy 08:15',   logins: 38,  created: '15/01/2026', password: 'qapaq2026' },
  { id: 6, name: 'Rosa Chávez Soto',       email: 'rosa.chavez@qapaq.com.pe',    phone: '954321098', role: 'tesoreria',status: 'activo',    lastLogin: 'Ayer 17:44',  logins: 29,  created: '10/02/2026', password: 'RChavez!26' },
  { id: 7, name: 'Luis Paredes Mora',      email: 'luis.paredes@qapaq.com.pe',   phone: '921098765', role: 'contab',   status: 'activo',    lastLogin: '05/04 16:30', logins: 22,  created: '01/03/2026', password: 'LParedes$7' },
  { id: 8, name: 'Jorge Quispe Flores',    email: 'jorge.quispe@qapaq.com.pe',   phone: '943210987', role: 'trader',   status: 'bloqueado', lastLogin: 'Ayer 11:20',  logins: 18,  created: '20/01/2026', password: 'JQuispe#26' },
  { id: 9, name: 'Sofía Ríos Castillo',    email: 'sofia.rios@qapaq.com.pe',     phone: '910987654', role: 'reportes', status: 'inactivo',  lastLogin: '28/03 09:15', logins: 5,   created: '01/03/2026', password: 'SRios@2026' },
]

/* ═══════════════════════════════════════════════
   CUSTOM ROLE SELECT
═══════════════════════════════════════════════ */
function RoleSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const rolesFiltered = ROLES.filter(r => r.id !== 'admin')
  const selected = rolesFiltered.find(r => r.id === value)
  const rc = ROLE_COLOR[selected?.id ?? 'trader']

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm bg-white transition-all text-left',
          error
            ? 'border-red-400 focus:ring-2 focus:ring-red-100'
            : open
              ? 'border-blue-400 ring-2 ring-blue-100'
              : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <Shield size={13} className="text-gray-400 shrink-0" />
        {selected ? (
          <span className={clsx('inline-block px-2 py-0.5 rounded-full text-[11px] font-medium', rc.bg, rc.text)}>
            {selected.label}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Seleccionar rol...</span>
        )}
        <ChevronDown
          size={13}
          className={clsx('ml-auto text-gray-400 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg z-30 overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {rolesFiltered.map(role => {
            const c = ROLE_COLOR[role.id] ?? ROLE_COLOR.trader
            const isSelected = value === role.id
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => { onChange(role.id); setOpen(false) }}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left',
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                )}
              >
                <span className={clsx('inline-block px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap', c.bg, c.text)}>
                  {role.label}
                </span>
                <span className="text-[11px] text-gray-400 truncate">{role.desc}</span>
                {isSelected && <Check size={12} className="ml-auto text-blue-600 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CUSTOM FILTER SELECT
═══════════════════════════════════════════════ */
function FilterSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg bg-white text-xs text-left transition-all w-full',
          open
            ? 'border-blue-400 ring-2 ring-blue-100'
            : 'hover:border-gray-300'
        )}
        style={{ border: open ? undefined : '1px solid var(--color-border)' }}
      >
        <span className={clsx('flex-1 truncate', selected ? 'text-gray-700' : 'text-gray-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={11}
          className={clsx('text-gray-400 shrink-0 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg z-30 py-1 min-w-max"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
        >
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 px-3 py-2 text-xs transition-colors text-left',
                o.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {o.label}
              {o.value === value && <Check size={11} className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   DRAWER — formulario de usuario
═══════════════════════════════════════════════ */
const EMPTY_FORM = { name: '', email: '', phone: '', role: 'trader', status: 'activo', password: '' }

function UserDrawer({ open, user, users, onClose, onSave }) {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]   = useState({})
  const isEdit = !!user

  useEffect(() => {
    if (open) {
      setForm(user
        ? { name: user.name, email: user.email, phone: user.phone ?? '', role: user.role, status: user.status, password: user.password ?? '' }
        : { ...EMPTY_FORM, password: generatePassword() }
      )
      setErrors({})
      setShowPass(false)
    }
  }, [open, user])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())  e.name = 'El nombre es obligatorio.'
    if (!form.email.trim()) e.email = 'El correo es obligatorio.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido.'
    else if (!isEdit && users.some(u => u.email.toLowerCase() === form.email.toLowerCase()))
      e.email = 'Este correo ya está registrado en el sistema.'
    if (!form.role) e.role = 'Asigna un rol al usuario.'
    if (!isEdit && !form.password) e.password = 'La contraseña es obligatoria.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(form)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/25 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          'fixed right-0 top-0 h-full z-50 flex flex-col bg-white transition-transform duration-250',
        )}
        style={{
          width: 420,
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.06)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? `ID de usuario: #${user.id}` : 'Las credenciales se enviarán al correo registrado.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Nombre */}
          <Field label="Nombres y apellidos" required error={errors.name}>
            <InputIcon icon={User}>
              <input
                type="text" placeholder="Ej. Carlos Medina Ruiz"
                value={form.name} onChange={e => set('name', e.target.value)}
                className={inputCls(errors.name)}
              />
            </InputIcon>
          </Field>

          {/* Correo */}
          <Field label="Correo electrónico" required error={errors.email}>
            <InputIcon icon={Mail}>
              <input
                type="email" placeholder="usuario@qapaq.com.pe"
                value={form.email} onChange={e => set('email', e.target.value)}
                disabled={isEdit}
                className={clsx(inputCls(errors.email), isEdit && 'bg-gray-50 text-gray-500 cursor-not-allowed')}
              />
            </InputIcon>
            {isEdit && <p className="text-[11px] text-gray-400 mt-1">El correo no puede modificarse una vez creado.</p>}
          </Field>

          {/* Celular */}
          <Field label="Celular" error={errors.phone}>
            <InputIcon icon={Phone}>
              <input
                type="tel" placeholder="9XXXXXXXX"
                value={form.phone} onChange={e => set('phone', e.target.value)}
                className={inputCls(errors.phone)}
              />
            </InputIcon>
          </Field>

          {/* Rol */}
          <Field label="Rol asignado" required error={errors.role}>
            <RoleSelect
              value={form.role}
              onChange={v => set('role', v)}
              error={errors.role}
            />
          </Field>

          {/* Estado */}
          <Field label="Estado inicial">
            <div className="flex gap-2">
              {['activo', 'inactivo'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={clsx(
                    'flex-1 py-2 rounded-lg text-xs font-medium border transition-colors capitalize',
                    form.status === s
                      ? s === 'activo'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Field>

          {/* Contraseña */}
          <Field
            label="Contraseña"
            required={!isEdit}
            error={errors.password}
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className={clsx(
                    'w-full px-3 pr-9 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white font-mono tracking-wider',
                    errors.password
                      ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { set('password', generatePassword()); setShowPass(true) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors whitespace-nowrap shrink-0"
                title="Generar contraseña aleatoria"
              >
                <RefreshCw size={12} /> Aleatoria
              </button>
            </div>
          </Field>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            <Check size={14} />
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
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
   UI helpers locales
═══════════════════════════════════════════════ */
const inputCls = (err) => clsx(
  'w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white',
  err ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
)

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function InputIcon({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   USERS TAB
═══════════════════════════════════════════════ */
function UsersTab({ users, setUsers }) {
  const [search, setSearch]             = useState('')
  const [filterRole, setFilterRole]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [page, setPage]                 = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [editingUser, setEditingUser]   = useState(null)
  const [confirmUser, setConfirmUser]   = useState(null)
  const { toasts, add: toast, remove: removeToast } = useToast()

  // Parsea DD/MM/YYYY → Date (medianoche local)
  function parseDate(str) {
    if (!str) return null
    const [d, m, y] = str.split('/')
    return new Date(+y, +m - 1, +d)
  }

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase()
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !roleLabel(u.role).toLowerCase().includes(q)
      ) return false
    }
    if (filterRole   && u.role   !== filterRole)   return false
    if (filterStatus && u.status !== filterStatus) return false
    if (dateFrom || dateTo) {
      const created = parseDate(u.created)
      if (dateFrom && created < new Date(dateFrom)) return false
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59)
        if (created > to) return false
      }
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function resetPage() { setPage(1) }
  function applySearch(v)  { setSearch(v);       resetPage() }
  function applyRole(v)    { setFilterRole(v);   resetPage() }
  function applyStatus(v)  { setFilterStatus(v); resetPage() }
  function applyFrom(v)    { setDateFrom(v);     resetPage() }
  function applyTo(v)      { setDateTo(v);       resetPage() }

  const activeFilters = [filterRole, filterStatus, dateFrom, dateTo].filter(Boolean).length

  function clearFilters() {
    setFilterRole(''); setFilterStatus(''); setDateFrom(''); setDateTo(''); resetPage()
  }

  const stats = {
    total:     users.length,
    activos:   users.filter(u => u.status === 'activo').length,
    inactivos: users.filter(u => u.status === 'inactivo').length,
    bloqueados:users.filter(u => u.status === 'bloqueado').length,
  }

  function openCreate() { setEditingUser(null); setDrawerOpen(true) }
  function openEdit(u)  { setEditingUser(u);    setDrawerOpen(true) }

  function handleSave(form) {
    if (editingUser) {
      setUsers(us => us.map(u => u.id === editingUser.id
        ? { ...u, name: form.name, phone: form.phone, role: form.role, status: form.status, password: form.password }
        : u
      ))
      toast({ title: 'Usuario actualizado', message: `Los datos de ${form.name} fueron guardados.`, type: 'success' })
    } else {
      setUsers(us => [...us, {
        id: Date.now(), name: form.name, email: form.email, phone: form.phone,
        role: form.role, status: form.status, lastLogin: '—', logins: 0,
        created: new Date().toLocaleDateString('es-PE'),
      }])
      toast({ title: 'Usuario creado', message: `${form.name} fue registrado en el sistema.`, type: 'success' })
    }
    setDrawerOpen(false)
  }

  function handleStatusClick(u) {
    if (u.status === 'activo') {
      setConfirmUser(u)   // abre modal de confirmación
    } else {
      enableUser(u)
    }
  }

  function confirmDisable() {
    const u = confirmUser
    setConfirmUser(null)
    setUsers(us => us.map(x => x.id === u.id ? { ...x, status: 'bloqueado' } : x))
    toast({ title: 'Usuario bloqueado', message: `${u.name} fue bloqueado correctamente.`, type: 'warning' })
  }

  function enableUser(u) {
    setUsers(us => us.map(x => x.id === u.id ? { ...x, status: 'activo' } : x))
    toast({ title: 'Usuario habilitado', message: `${u.name} fue habilitado correctamente.`, type: 'success' })
  }

  function unlockUser(u) {
    setUsers(us => us.map(x => x.id === u.id ? { ...x, status: 'activo' } : x))
    toast({ title: 'Cuenta desbloqueada', message: `${u.name} puede iniciar sesión nuevamente.`, type: 'info' })
  }

  function resetPassword(u) {
    toast({ title: 'Contraseña restablecida', message: `Se generó una nueva contraseña para ${u.name}.`, type: 'info' })
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total usuarios',    value: stats.total,     color: 'text-gray-900' },
          { label: 'Activos',           value: stats.activos,   color: 'text-green-600' },
          { label: 'Inactivos',         value: stats.inactivos, color: 'text-gray-500' },
          { label: 'Bloqueados',        value: stats.bloqueados,color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg px-4 py-3.5" style={{ border: '1px solid var(--color-border)' }}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={clsx('text-2xl font-bold tracking-tight', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar — solo botón de acción */}
      <div className="flex justify-end mb-3">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={14} /> Nuevo usuario
        </button>
      </div>

      {/* Filtros + buscador en una sola fila */}
      <div className="flex items-end gap-2 mb-3">

        {/* Rol */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Rol</label>
          <div className="w-40">
            <FilterSelect
              value={filterRole}
              onChange={applyRole}
              placeholder="Todos los roles"
              options={[
                { value: '', label: 'Todos los roles' },
                ...ROLES.filter(r => r.id !== 'admin').map(r => ({ value: r.id, label: r.label })),
              ]}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Estado</label>
          <div className="w-36">
            <FilterSelect
              value={filterStatus}
              onChange={applyStatus}
              placeholder="Todos los estados"
              options={[
                { value: '',          label: 'Todos los estados' },
                { value: 'activo',    label: 'Activo'            },
                { value: 'inactivo',  label: 'Inactivo'          },
                { value: 'bloqueado', label: 'Bloqueado'         },
              ]}
            />
          </div>
        </div>

        {/* Desde */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Desde</label>
          <div
            className="flex items-center bg-white rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <input
              type="date" value={dateFrom} onChange={e => applyFrom(e.target.value)}
              className="pl-3 pr-2 py-2 rounded-lg text-xs bg-transparent text-gray-700 outline-none cursor-pointer w-36"
            />
          </div>
        </div>

        {/* Hasta */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-gray-400 pl-1">Hasta</label>
          <div
            className="flex items-center bg-white rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <input
              type="date" value={dateTo} min={dateFrom || undefined} onChange={e => applyTo(e.target.value)}
              className="pl-3 pr-2 py-2 rounded-lg text-xs bg-transparent text-gray-700 outline-none cursor-pointer w-36"
            />
          </div>
        </div>

        {/* Limpiar — solo si hay filtros activos */}
        {activeFilters > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-transparent">–</label>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Filter size={11} />
              Limpiar ({activeFilters})
            </button>
          </div>
        )}

        {/* Buscador — empujado al extremo derecho */}
        <div className="flex flex-col gap-1 ml-auto">
          <label className="text-[11px] text-transparent">–</label>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white w-60 transition-all focus-within:ring-2 focus-within:ring-blue-100"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text" placeholder="Buscar nombre, correo o rol..."
              value={search} onChange={e => applySearch(e.target.value)}
              className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-400 w-full"
            />
            {search && (
              <button onClick={() => applySearch('')} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border)' }}>
              {['Usuario', 'Rol', 'Estado', 'Último acceso', 'Registrado', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((u, i) => {
              const ss = STATUS_STYLE[u.status]
              const rc = ROLE_COLOR[u.role] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }
              return (
                <tr
                  key={u.id}
                  className="border-b last:border-0 hover:bg-gray-50/60 transition-colors"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {/* Usuario */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-semibold text-blue-700 shrink-0">
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 leading-none">{u.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <span className={clsx('inline-block px-2 py-0.5 rounded-full text-[11px] font-medium', rc.bg, rc.text)}>
                      {roleLabel(u.role)}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', ss.bg, ss.text)}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full', ss.dot)} />
                      {ss.label}
                    </span>
                  </td>

                  {/* Último acceso */}
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{u.lastLogin}</td>

                  {/* Registrado */}
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{u.created}</td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        title="Editar"
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title={u.status === 'bloqueado' ? 'Desbloquear' : u.status === 'activo' ? 'Inhabilitar' : 'Habilitar'}
                        onClick={() => u.status === 'bloqueado' ? unlockUser(u) : handleStatusClick(u)}
                        className={clsx(
                          'p-1.5 rounded-lg transition-colors',
                          u.status === 'activo'
                            ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                            : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                        )}
                      >
                        {u.status === 'activo'    ? <UserX      size={14} /> :
                         u.status === 'bloqueado' ? <Unlock     size={14} /> :
                                                    <UserCheck  size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-300">
                  No se encontraron usuarios con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación footer */}
        {filtered.length > 0 && (
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            {/* Mostrar X por página */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Mostrar</span>
              <div className="w-16">
                <FilterSelect
                  value={String(pageSize)}
                  onChange={v => { setPageSize(Number(v)); resetPage() }}
                  placeholder=""
                  options={[5, 10, 25, 50].map(n => ({ value: String(n), label: String(n) }))}
                />
              </div>
              <span>por página · <span className="font-medium text-gray-700">{filtered.length}</span> resultado{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Navegación */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, idx) =>
                  n === '…' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={clsx(
                        'min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium transition-colors',
                        n === safePage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <UserDrawer
        open={drawerOpen}
        user={editingUser}
        users={users}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Modal de confirmación — inhabilitar usuario */}
      {confirmUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setConfirmUser(null)}
          />
          {/* Card */}
          <div
            className="relative bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4"
            style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.14)' }}
          >
            {/* Ícono */}
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-50 mx-auto">
              <UserX size={20} className="text-amber-500" />
            </div>

            {/* Texto */}
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">¿Bloquear usuario?</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                <span className="font-medium text-gray-700">{confirmUser.name}</span> perderá el acceso
                al sistema de forma inmediata. Podrás desbloquearlo en cualquier momento.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setConfirmUser(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDisable}
                className="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Sí, bloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


/* ═══════════════════════════════════════════════
   PÁGINA PRINCIPAL
   Las tabs viven en el Header — aquí solo se
   renderiza el contenido según la tab activa.
═══════════════════════════════════════════════ */
export default function UsersPage({ activeTab = 'registrados' }) {
  const [users, setUsers] = useState(MOCK_USERS)
  return activeTab === 'roles' ? <RolesTab /> : <UsersTab users={users} setUsers={setUsers} />
}
