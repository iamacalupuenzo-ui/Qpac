import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Usuarios de prueba del prototipo
  const TEST_USERS = {
    'admin@qapaq.com.pe':   { password: 'admin2026',  role: 'admin',    name: 'Admin QAPAQ' },
    'trader@qapaq.com.pe':  { password: 'qapaq2026',  role: 'trader',   name: 'Carlos Medina' },
    'middle@qapaq.com.pe':  { password: 'qapaq2026',  role: 'middle',   name: 'Marco Quispe' },
    'back@qapaq.com.pe':    { password: 'qapaq2026',  role: 'back',     name: 'Ana Torres' },
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Completa todos los campos.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user = TEST_USERS[email.toLowerCase()]
      if (user && user.password === password) {
        onLogin?.({ email, role: user.role, name: user.name })
      } else {
        setError('Credenciales incorrectas. Intenta de nuevo.')
      }
    }, 900)
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--color-surface-bg)' }}
    >
      {/* Panel izquierdo — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ background: '#1d4ed8' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-base">
            Q
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            Financiera QAPAQ
          </span>
        </div>

        {/* Copy central */}
        <div>
          <h2 className="text-white text-3xl font-bold leading-snug tracking-tight mb-3">
            Mesa de<br />Dinero FX
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Plataforma operativa para gestión de operaciones de cambio de divisas,
            cierre diario y reportes regulatorios BCRP / SBS.
          </p>

          {/* Chips de módulos */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['Front Office', 'Back Office', 'Tesorería', 'Cierre Diario', 'Reportes BCRP', 'Reportes SBS'].map(m => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-full text-xs font-medium text-blue-100 border border-white/20 bg-white/10"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-blue-300 text-xs">
          © 2026 Financiera QAPAQ S.A. — Uso interno exclusivo
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              Q
            </div>
            <span className="font-semibold text-gray-800 text-sm">Financiera QAPAQ</span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mb-7">
            Ingresa tus credenciales para acceder al sistema.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Campo email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@qapaq.com.pe"
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900
                           placeholder-gray-400 outline-none transition-all
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                           bg-white"
              />
            </div>

            {/* Campo contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm text-gray-900
                             placeholder-gray-400 outline-none transition-all
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                             bg-white"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                         bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                         text-white text-sm font-semibold
                         transition-colors duration-150
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Ingresar al sistema
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Nota */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Acceso restringido. Credenciales asignadas por el Administrador.
          </p>

          {/* Hint para prototipo */}
          <div className="mt-4 px-3 py-3 rounded-lg bg-amber-50 border border-amber-100 space-y-1.5">
            <p className="text-xs text-amber-700 font-semibold">Prototipo — usuarios de prueba</p>
            {[
              { email: 'admin@qapaq.com.pe',  pass: 'admin2026', label: 'Administrador' },
              { email: 'trader@qapaq.com.pe', pass: 'qapaq2026', label: 'Trader' },
              { email: 'middle@qapaq.com.pe', pass: 'qapaq2026', label: 'Middle Office' },
            ].map(u => (
              <div key={u.email} className="flex items-center justify-between">
                <span className="text-[11px] text-amber-600">{u.label}</span>
                <code className="text-[11px] font-mono text-amber-700">{u.email} · {u.pass}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
