import { useState, useRef } from 'react'
import {
  ArrowLeft, Check, Upload, X, CheckCircle2,
  FileText, User, Briefcase, Building2, Shield,
  AlertCircle, AlertTriangle, Info, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
const STEPS = [
  { id: 1, label: 'Tipo' },
  { id: 2, label: 'Datos básicos' },
  { id: 3, label: 'Documentación' },
  { id: 4, label: 'Validación PLAFT' },
  { id: 5, label: 'Confirmación' },
]

const TIPOS = [
  { id: 'PN',  abbr: 'PN',  label: 'Persona Natural',             desc: 'Persona física sin actividad comercial registrada',                     Icon: User      },
  { id: 'P10', abbr: 'P10', label: 'Persona Natural con Negocio', desc: 'Persona natural con RUC activo y actividad económica declarada',         Icon: Briefcase },
  { id: 'PJ',  abbr: 'PJ',  label: 'Persona Jurídica',            desc: 'Empresa o sociedad con personería jurídica constituida',                 Icon: Building2 },
  { id: 'EF',  abbr: 'EF',  label: 'Entidad Financiera',          desc: 'Banco, Financiera.',                                                   Icon: Shield    },
]

/* ═══ Business logic helpers ═══════════════════ */

function getDocsRequeridos({ tipoPersona, esPEP, operaATerceros, clasificacionRiesgo }) {
  const docs = []
  docs.push({ id: 'consultaBank',    label: 'Consulta Bank+',                             req: true,  grupo: 'Base'     })

  if (tipoPersona === 'PN' || tipoPersona === 'P10') {
    docs.push({ id: 'doiCliente',      label: 'DOI del cliente',                            req: true,  grupo: 'Base'     })
    docs.push({ id: 'djOrigenFondos',  label: 'DJ Origen de Fondos (PN)',                   req: esPEP !== 'si', grupo: 'Base' })
    if (esPEP === 'si') {
      docs.push({ id: 'djOrigenPEP', label: 'DJ Origen de Fondos PEP',                    req: true,  grupo: 'PEP'      })
      docs.push({ id: 'fichaPEP',    label: 'Ficha PEP',                                  req: true,  grupo: 'PEP'      })
    }
    docs.push({ id: 'cartaTerceros',   label: 'Carta de Autorización Terceros',             req: false, grupo: 'Otros'    })
  }

  if (tipoPersona === 'PJ' || tipoPersona === 'EF') {
    docs.push({ id: 'fichaRUC',        label: 'Ficha RUC / Consulta RUC',                   req: true,  grupo: 'Base'     })
    docs.push({ id: 'autorizacionSBS', label: 'Autorización SBS (Casa de Cambio)',           req: true,  grupo: 'Base'     })
    if (tipoPersona === 'EF') {
      docs.push({ id: 'convenioMarco',     label: 'Convenio Marco de Operaciones',           req: false, grupo: 'Opcional' })
      docs.push({ id: 'vigenciaPoderes',   label: 'Vigencia de Poderes',                     req: false, grupo: 'Opcional' })
      docs.push({ id: 'doiRepresentantes', label: 'DOI Representantes Legales',              req: false, grupo: 'Opcional' })
    }
  }

  if (clasificacionRiesgo === 'rf') {
    docs.push({ id: 'docsRF', label: 'Documentación adicional – Régimen Reforzado',         req: true,  grupo: 'RF'       })
  }

  docs.push({ id: 'otros', label: 'Otros documentos', req: false, grupo: 'Opcional' })
  return docs
}

function determineFinalState(formData, docState) {
  const docs = getDocsRequeridos(formData)
  const missing = docs.filter(d => d.req && !docState[d.id]?.loaded).length
  if (missing > 0) return { estado: 'activo_proceso', label: 'Activo en proceso', color: 'amber', missing }
  return { estado: 'activo', label: 'Activo', color: 'green' }
}

/* ═══════════════════════════════════════════════
   FORM ATOMS
═══════════════════════════════════════════════ */
const inputCls = (err) => clsx(
  'w-full px-3 py-2.5 rounded-lg border text-sm bg-white outline-none transition-all',
  err
    ? 'border-red-400 ring-2 ring-red-50'
    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
)

function Field({ label, required, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} strokeWidth={2.5} />{error}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, type = 'text', maxLength, disabled }) {
  return (
    <input
      type={type} value={value} disabled={disabled} maxLength={maxLength}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={inputCls(error)}
    />
  )
}

function SelectInput({ value, onChange, options, placeholder, error }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls(error)}>
      <option value="">{placeholder ?? 'Seleccionar...'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <label key={o.value} className={clsx(
          'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all select-none',
          value === o.value ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        )}>
          <input type="radio" className="hidden" checked={value === o.value} onChange={() => onChange(o.value)} />
          <div className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
            value === o.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300')}>
            {value === o.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          {o.label}
        </label>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   DOCUMENT ITEM
═══════════════════════════════════════════════ */
function DocItem({ doc, status, onUpload, onRemove, hasError }) {
  const fileRef = useRef(null)
  const loaded = status?.loaded

  return (
    <div className={clsx(
      'flex items-center gap-3 p-3 rounded-lg border transition-all',
      hasError ? 'border-red-300 bg-red-50'
      : loaded  ? 'border-green-200 bg-green-50'
      :           'border-gray-200 bg-white'
    )}>
      <FileText size={14} className={loaded ? 'text-green-500 shrink-0' : 'text-gray-400 shrink-0'} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{doc.label}</p>
        {loaded   && <p className="text-[11px] text-gray-500 truncate mt-0.5">{status.filename}</p>}
        {hasError && <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle size={10} />Obligatorio para continuar</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {doc.req  && !loaded && !hasError && <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Requerido</span>}
        {doc.grupo === 'PEP' && !loaded   && <span className="text-[10px] font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded">PEP</span>}
        {doc.grupo === 'RF'  && !loaded   && <span className="text-[10px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">RF</span>}
        {loaded ? (
          <>
            <span className="text-[10px] font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Check size={9} />Cargado
            </span>
            <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors"><X size={14} /></button>
          </>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Upload size={11} />Adjuntar
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f.name); e.target.value = '' }} />
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════════ */
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-start justify-center">
      {STEPS.map((step, i) => {
        const done   = step.id < currentStep
        const active = step.id === currentStep
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                done   ? 'bg-blue-600 text-white'
                : active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                :          'bg-gray-100 text-gray-400'
              )}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={clsx('mt-1.5 text-[11px] font-medium whitespace-nowrap',
                active ? 'text-blue-600' : done ? 'text-gray-600' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('h-px mt-3.5 mx-2 transition-all', done ? 'bg-blue-400' : 'bg-gray-200')}
                style={{ width: 40 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 1 — TIPO DE CLIENTE
═══════════════════════════════════════════════ */
function Step1({ formData, onChange, errors }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Tipo de cliente</h3>
      <p className="text-xs text-gray-500 mb-5">Selecciona el tipo de persona que corresponde al cliente a registrar. Este campo determina los datos y documentos requeridos.</p>
      
      {errors?.tipoPersona && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={14} />
          {errors.tipoPersona}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {TIPOS.map(({ id, abbr, label, desc, Icon }) => {
          const sel = formData.tipoPersona === id
          return (
            <button key={id} type="button" onClick={() => onChange('tipoPersona', id)}
              className={clsx('text-left p-4 rounded-xl border-2 transition-all',
                sel ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50')}>
              <div className="flex items-start gap-3">
                <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  sel ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 transition-colors')}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors',
                    sel ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500')}>
                    {abbr}
                  </span>
                  <p className={clsx('text-sm font-semibold mt-1 transition-colors', sel ? 'text-blue-900' : 'text-gray-800')}>{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
                {sel && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 2 — DATOS BÁSICOS
═══════════════════════════════════════════════ */

/* Datos SUNAT simulados — reemplazar con llamada a API cuando esté disponible */
const SUNAT_MOCK = {
  '20512345678': { razonSocial: 'EXPORTACIONES LIMA S.A.C.',     direccion: 'AV. INDUSTRIAL 1234, LA VICTORIA, LIMA',    ciiu: '4690' },
  '20123456789': { razonSocial: 'BANCO AMERICANO DEL PERÚ S.A.', direccion: 'AV. LARCO 1301, MIRAFLORES, LIMA',          ciiu: '6419' },
  '20987654321': { razonSocial: 'INVERSIONES PACÍFICO S.R.L.',   direccion: 'JR. DE LA UNIÓN 562, CERCADO DE LIMA',      ciiu: '6499' },
  '20345678901': { razonSocial: 'MINERA ANDINA S.A.',            direccion: 'AV. BENAVIDES 1555, SANTIAGO DE SURCO',     ciiu: '0710' },
  '20111222333': { razonSocial: 'COMERCIAL SAN MARTÍN E.I.R.L.', direccion: 'AV. VENEZUELA 3050, BREÑA, LIMA',           ciiu: '4711' },
  '20444555666': { razonSocial: 'DISTRIBUIDORA NORTE S.A.',      direccion: 'AV. TÚPAC AMARU 2800, INDEPENDENCIA, LIMA', ciiu: '4631' },
}

function Step2({ formData, onChange, errors }) {
  const tipo      = formData.tipoPersona
  const isPersona = tipo === 'PN' || tipo === 'P10'
  const isEntidad = tipo === 'PJ' || tipo === 'EF'
  const showNac   = isPersona && formData.tipoDoc === 'CE'

  const [sunatStatus, setSunatStatus] = useState(null) // null | 'loading' | 'found' | 'not_found'

  function handleRucChange(val) {
    const clean = val.replace(/\D/g, '').slice(0, 11)
    onChange('numDoc', clean)
    if (clean.length === 11) {
      setSunatStatus('loading')
      setTimeout(() => {
        const data = SUNAT_MOCK[clean]
        if (data) {
          onChange('razonSocial',   data.razonSocial)
          onChange('direccionSunat', data.direccion)
          onChange('ciiu',           data.ciiu)
          setSunatStatus('found')
        } else {
          setSunatStatus('not_found')
        }
      }, 700)
    } else {
      setSunatStatus(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* Identidad */}
      <section>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos de identidad</p>
        <div className="space-y-3">

          {/* PN / P10: nombres primero, luego documento */}
          {isPersona && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Apellido paterno" required error={errors?.apellidoPaterno}>
                  <TextInput value={formData.apellidoPaterno} onChange={v => onChange('apellidoPaterno', v)} placeholder="García" error={errors?.apellidoPaterno} />
                </Field>
                <Field label="Apellido materno" required error={errors?.apellidoMaterno}>
                  <TextInput value={formData.apellidoMaterno} onChange={v => onChange('apellidoMaterno', v)} placeholder="López" error={errors?.apellidoMaterno} />
                </Field>
              </div>
              <Field label="Nombres" required error={errors?.nombres}>
                <TextInput value={formData.nombres} onChange={v => onChange('nombres', v)} placeholder="María Fernanda" error={errors?.nombres} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo de documento" required error={errors?.tipoDoc}>
                  <SelectInput
                    value={formData.tipoDoc}
                    onChange={v => { onChange('tipoDoc', v); onChange('numDoc', ''); onChange('nacionalidad', '') }}
                    options={tipo === 'PN'
                      ? [{ value: 'DNI', label: 'DNI' }, { value: 'CE', label: 'Carné de Extranjería (CE)' }]
                      : [{ value: 'DNI', label: 'DNI' }, { value: 'CE', label: 'Carné de Extranjería (CE)' }, { value: 'RUC', label: 'RUC' }]}
                    error={errors?.tipoDoc}
                  />
                </Field>
                <Field label="Número de documento" required
                  hint={formData.tipoDoc === 'DNI' ? '8 dígitos' : undefined}
                  error={errors?.numDoc}>
                  <TextInput
                    value={formData.numDoc}
                    onChange={v => onChange('numDoc', v.replace(/\D/g, ''))}
                    placeholder={formData.tipoDoc === 'DNI' ? '12345678' : 'Número'}
                    maxLength={formData.tipoDoc === 'DNI' ? 8 : 20}
                    error={errors?.numDoc}
                  />
                </Field>
              </div>
              {showNac && (
                <Field label="Nacionalidad" required hint="Obligatorio para Carné de Extranjería" error={errors?.nacionalidad}>
                  <TextInput value={formData.nacionalidad} onChange={v => onChange('nacionalidad', v)} placeholder="Ej. Colombiana" error={errors?.nacionalidad} />
                </Field>
              )}
            </>
          )}

          {/* PJ / EF: RUC primero, luego Razón Social (auto-completada desde SUNAT) */}
          {isEntidad && (
            <>
              <Field label="RUC" required hint="11 dígitos — se consultará SUNAT automáticamente" error={errors?.numDoc}>
                <TextInput
                  value={formData.numDoc}
                  onChange={handleRucChange}
                  placeholder="20123456789"
                  maxLength={11}
                  error={errors?.numDoc}
                />
              </Field>

              {sunatStatus === 'loading' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  Consultando SUNAT…
                </div>
              )}
              {sunatStatus === 'found' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                  <Check size={12} className="shrink-0" />
                  Datos obtenidos de SUNAT — puedes editarlos si es necesario.
                </div>
              )}
              {sunatStatus === 'not_found' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  <AlertCircle size={12} className="shrink-0" />
                  RUC no encontrado en SUNAT. Ingresa los datos manualmente.
                </div>
              )}

              <Field label="Razón Social" required error={errors?.razonSocial}>
                <TextInput
                  value={formData.razonSocial}
                  onChange={v => onChange('razonSocial', v)}
                  placeholder="Nombre legal completo de la entidad"
                  error={errors?.razonSocial}
                />
              </Field>
            </>
          )}
        </div>
      </section>

      {/* Fiscal y contacto */}
      <section>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos fiscales y contacto</p>
        <div className="space-y-3">
          <Field label="Dirección (SUNAT)" required error={errors?.direccionSunat}>
            <TextInput value={formData.direccionSunat} onChange={v => onChange('direccionSunat', v)} placeholder="Dirección fiscal registrada en SUNAT" error={errors?.direccionSunat} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ubigeo" required hint="6 dígitos: departamento / provincia / distrito" error={errors?.ubigeo}>
              <TextInput value={formData.ubigeo} onChange={v => onChange('ubigeo', v.replace(/\D/g, '').slice(0, 6))} placeholder="150101" maxLength={6} error={errors?.ubigeo} />
            </Field>
            <Field label="Actividad económica (CIIU)" required hint={isPersona ? 'Sin actividad comercial: 0000' : undefined} error={errors?.ciiu}>
              <TextInput value={formData.ciiu} onChange={v => onChange('ciiu', v.replace(/\D/g, '').slice(0, 4))} placeholder="0000" maxLength={4} error={errors?.ciiu} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Correo de pacto" required hint="Recibe cotizaciones y comprobantes" error={errors?.correoPacto}>
              <TextInput type="email" value={formData.correoPacto} onChange={v => onChange('correoPacto', v)} placeholder="correo@empresa.com" error={errors?.correoPacto} />
            </Field>
            <Field label="Correo de facturación" required hint="Puede ser diferente al correo de pacto" error={errors?.correoFacturacion}>
              <TextInput type="email" value={formData.correoFacturacion} onChange={v => onChange('correoFacturacion', v)} placeholder="facturacion@empresa.com" error={errors?.correoFacturacion} />
            </Field>
          </div>
        </div>
      </section>

      {/* Perfil */}
      <section>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Perfil del cliente</p>
        <div className="space-y-4">
          {tipo === 'PN' && (
            <Field label="Condición laboral" required error={errors?.condicionLaboral}>
              <SelectInput value={formData.condicionLaboral} onChange={v => onChange('condicionLaboral', v)}
                options={[{ value: 'empleado', label: 'Empleado' }, { value: 'dependiente', label: 'Dependiente' }, { value: 'independiente', label: 'Independiente' }]}
                error={errors?.condicionLaboral} />
            </Field>
          )}
          {isPersona && (
            <>
              <Field label="Residencia en Perú" required error={errors?.residenciasPeru}>
                <RadioGroup value={formData.residenciasPeru} onChange={v => onChange('residenciasPeru', v)}
                  options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]} />
                {errors?.residenciasPeru && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.residenciasPeru}</p>}
              </Field>
              <Field label="¿El cliente es PEP?" required hint="Persona Expuesta Políticamente" error={errors?.esPEP}>
                <RadioGroup value={formData.esPEP} onChange={v => onChange('esPEP', v)}
                  options={[{ value: 'si', label: 'Sí, es PEP' }, { value: 'no', label: 'No' }]} />
                {errors?.esPEP && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.esPEP}</p>}
              </Field>
              {formData.esPEP === 'si' && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700"><strong>Atención:</strong> Al declarar PEP, la Ficha PEP es obligatoria. Si no se adjunta ahora, el cliente quedará pendiente de regularizar.</p>
                </div>
              )}
            </>
          )}
          <Field label="Clasificación de riesgo" required error={errors?.clasificacionRiesgo}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'estandar', label: 'Estándar',           desc: 'Sin indicadores de riesgo elevado', active: 'border-blue-400 bg-blue-50', textActive: 'text-blue-800' },
                { value: 'rf',       label: 'Régimen Reforzado',   desc: 'Documentación y supervisión adicional', active: 'border-orange-400 bg-orange-50', textActive: 'text-orange-800' },
              ].map(({ value, label, desc, active, textActive }) => {
                const sel = formData.clasificacionRiesgo === value
                return (
                  <button key={value} type="button" onClick={() => onChange('clasificacionRiesgo', value)}
                    className={clsx('text-left p-3 rounded-lg border-2 transition-all', sel ? active : 'border-gray-200 bg-white hover:border-gray-300')}>
                    <p className={clsx('text-sm font-semibold', sel ? textActive : 'text-gray-700')}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </button>
                )
              })}
            </div>
            {errors?.clasificacionRiesgo && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.clasificacionRiesgo}</p>}
          </Field>
        </div>
      </section>

      {/* PJ adicional */}
      {tipo === 'PJ' && (
        <section>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos adicionales – Persona Jurídica</p>
          <Field label="Resultado Consulta Bank+" required hint="Registrar resultado de la consulta manual en Bankplus" error={errors?.consultaBankplus}>
            <SelectInput value={formData.consultaBankplus} onChange={v => onChange('consultaBankplus', v)}
              options={[
                { value: 'sin_observaciones', label: 'Sin observaciones' },
                { value: 'con_observaciones', label: 'Con observaciones' },
                { value: 'pendiente',          label: 'Pendiente de consulta' },
              ]}
              error={errors?.consultaBankplus} />
          </Field>
        </section>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 3 — DOCUMENTACIÓN
═══════════════════════════════════════════════ */
const GRUPO_LABELS = {
  Base:     'Documentos base',
  PEP:      'Documentos PEP',
  Legal:    'Documentos legales',
  RF:       'Régimen reforzado',
  Opcional: 'Documentos opcionales',
}

function Step3({ formData, docState, onUpload, onRemove, errors }) {
  const docs   = getDocsRequeridos(formData)
  const grupos = ['Base', 'PEP', 'Legal', 'RF', 'Opcional']

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Documentación requerida</h3>
      <p className="text-xs text-gray-500 mb-4">
        Adjunta los documentos del expediente. Los documentos obligatorios no adjuntados dejarán al cliente en estado <strong>Activo en proceso</strong> para regularizar posteriormente.
      </p>

      {(formData.esPEP === 'si' || formData.clasificacionRiesgo === 'rf') && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            {formData.esPEP === 'si'               && <p className="text-xs text-amber-700"><strong>Cliente PEP:</strong> La Ficha PEP es obligatoria. Si no se adjunta aquí, quedará pendiente de regularizar en el módulo de documentos.</p>}
            {formData.clasificacionRiesgo === 'rf' && <p className="text-xs text-amber-700"><strong>Régimen Reforzado:</strong> Se requiere documentación adicional de mayor control.</p>}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {grupos.map(grupo => {
          const grupoDoc = docs.filter(d => d.grupo === grupo)
          if (!grupoDoc.length) return null
          return (
            <div key={grupo}>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{GRUPO_LABELS[grupo]}</p>
              <div className="space-y-2">
                {grupoDoc.map(doc => (
                  <DocItem key={doc.id} doc={doc} status={docState[doc.id]}
                    onUpload={fn => onUpload(doc.id, fn)}
                    onRemove={() => onRemove(doc.id)}
                    hasError={!!errors?.[doc.id]} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Los documentos adjuntados quedan almacenados con trazabilidad.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 4 — VALIDACIÓN PLAFT
═══════════════════════════════════════════════ */

/* Base PLAFT mock — reemplazar con llamada a API cuando esté disponible */
const PLAFT_MOCK = [
  { doc: '12345678',    nombre: 'JUAN PÉREZ GARCÍA',      estado: 'sin_obs',    detalle: '' },
  { doc: '87654321',    nombre: 'MARÍA LÓPEZ TORRES',     estado: 'con_obs',    detalle: 'Transacciones inusuales registradas en período 2024' },
  { doc: '20123456789', nombre: 'INVERSIONES ARCA SAC',   estado: 'restringida',detalle: 'Figura en lista OFAC / ONU' },
  { doc: '47112233',    nombre: 'PEDRO SÁNCHEZ VILA',     estado: 'con_obs',    detalle: 'PEP vinculado a proceso administrativo vigente' },
]

const ESTADO_BADGE = {
  sin_obs:     { label: 'Sin observaciones', cls: 'bg-green-50 text-green-700 border-green-200' },
  con_obs:     { label: 'Con observaciones', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  restringida: { label: 'Lista restringida', cls: 'bg-red-50 text-red-700 border-red-200'       },
}

function buscarEnPLAFT(term) {
  const t = (term || '').trim().toUpperCase()
  if (!t) return null
  return PLAFT_MOCK.filter(r => r.doc === t || r.nombre.includes(t))
}

function PLAFTCruce({ formData }) {
  const nombreCliente = (formData.tipoPersona === 'PJ' || formData.tipoPersona === 'EF')
    ? (formData.razonSocial || '').toUpperCase()
    : [formData.nombres, formData.apellidoPaterno, formData.apellidoMaterno].filter(Boolean).join(' ').toUpperCase()

  const [query,   setQuery]   = useState(formData.numDoc || '')
  const [results, setResults] = useState(() => buscarEnPLAFT(formData.numDoc))
  const [loading, setLoading] = useState(false)

  function handleBuscar() {
    if (!query.trim()) return
    setLoading(true)
    setTimeout(() => {
      setResults(buscarEnPLAFT(query))
      setLoading(false)
    }, 500)
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Cruce PLAFT</h3>
      <p className="text-xs text-gray-500 mb-3">
        Verifica al cliente en la base PLAFT. La búsqueda se pre-carga con el documento registrado; ajústala si necesitas buscar por nombre u otro criterio.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBuscar()}
          placeholder="Buscar por N° documento o nombre..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 hover:border-gray-300 transition-all"
        />
        <button
          type="button"
          onClick={handleBuscar}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
        <Info size={11} className="shrink-0" />
        <span>
          Cliente registrado: <strong className="text-gray-700">{formData.numDoc || '—'}</strong>
          {nombreCliente && <> · <span className="text-gray-600">{nombreCliente}</span></>}
        </span>
      </div>

      {results === null && (
        <p className="text-xs text-gray-400 italic py-2">Ingresa un criterio y presiona Buscar.</p>
      )}

      {results !== null && results.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
          <AlertCircle size={13} className="shrink-0 text-gray-400" />
          No se encontraron registros en la base PLAFT para ese criterio.
        </div>
      )}

      {results !== null && results.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-500 whitespace-nowrap">N° Documento</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Nombre / Razón social</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500 whitespace-nowrap">Estado PLAFT</th>
                <th className="text-left px-3 py-2 font-medium text-gray-500">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r, i) => {
                const badge = ESTADO_BADGE[r.estado]
                return (
                  <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-gray-700">{r.doc}</td>
                    <td className="px-3 py-2.5 text-gray-700">{r.nombre}</td>
                    <td className="px-3 py-2.5">
                      <span className={clsx('inline-flex px-2 py-0.5 rounded-full border text-[11px] font-medium', badge.cls)}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{r.detalle || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PLAFTCard({ value, current, label, color, onClick }) {
  const sel = current === value
  const colorCls = {
    green: sel ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200',
    red:   sel ? 'border-red-400 bg-red-50 text-red-700'       : 'border-gray-200',
    amber: sel ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200',
  }
  return (
    <button type="button" onClick={onClick}
      className={clsx('p-3 rounded-lg border-2 text-sm font-medium transition-all text-center',
        sel ? colorCls[color] : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300')}>
      {sel && <Check size={12} className="mx-auto mb-1" />}
      {label}
    </button>
  )
}

function Step4({ formData, onChange, errors }) {
  return (
    <div className="space-y-6">
      {/* Cruce PLAFT */}
      <PLAFTCruce formData={formData} />

      {/* Confirmación del ejecutivo */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Confirmación del ejecutivo</h3>
        <p className="text-xs text-gray-500 mb-4">Registra el resultado final de la validación PLAFT basado en el cruce anterior.</p>
        <div className="space-y-4">
          <Field label="Resultado de validación PLAFT" required error={errors?.resultadoPLAFT}>
            <div className="grid grid-cols-3 gap-2">
              <PLAFTCard value="conforme"    current={formData.resultadoPLAFT} label="Conforme"     color="green" onClick={() => onChange('resultadoPLAFT', 'conforme')} />
              <PLAFTCard value="no_conforme" current={formData.resultadoPLAFT} label="No conforme"  color="red"   onClick={() => onChange('resultadoPLAFT', 'no_conforme')} />
              <PLAFTCard value="en_proceso"  current={formData.resultadoPLAFT} label="En proceso"   color="amber" onClick={() => onChange('resultadoPLAFT', 'en_proceso')} />
            </div>
            {errors?.resultadoPLAFT && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={10} />{errors.resultadoPLAFT}</p>
            )}
          </Field>

          {formData.resultadoPLAFT === 'no_conforme' && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">
                <strong>No se puede continuar:</strong> Un resultado No conforme bloquea el alta del cliente. Debes resolver las observaciones PLAFT antes de registrar.
              </p>
            </div>
          )}

          <Field label="Observaciones PLAFT" hint="Notas adicionales del resultado de la validación">
            <textarea value={formData.notasPLAFT} onChange={e => onChange('notasPLAFT', e.target.value)} rows={3}
              placeholder="Registra observaciones relevantes del proceso de validación..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none hover:border-gray-300 transition-all" />
          </Field>
        </div>
      </section>

    </div>
  )
}

/* ═══════════════════════════════════════════════
   STEP 5 — CONFIRMACIÓN
═══════════════════════════════════════════════ */
function ResumenRow({ label, value, fullWidth }) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium truncate">{value || '—'}</p>
    </div>
  )
}

function Step5({ formData, docState, onConfirmar, confirmed, newCode }) {
  if (confirmed) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Cliente registrado exitosamente</h3>
        <p className="text-sm text-gray-500 mb-6">El expediente ha sido creado y el cliente está habilitado para operar.</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-10 py-4 mb-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Código de cliente</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight font-mono">{newCode}</p>
        </div>
        <p className="text-xs text-gray-400 max-w-xs">Puedes buscar este cliente en la Cartera de clientes usando su código o documento de identidad.</p>
      </div>
    )
  }

  const finalState = determineFinalState(formData, docState)
  const tipo = TIPOS.find(t => t.id === formData.tipoPersona)
  const isPersona = formData.tipoPersona === 'PN' || formData.tipoPersona === 'P10'
  const nombreCompleto = isPersona
    ? [formData.apellidoPaterno, formData.apellidoMaterno, formData.nombres].filter(Boolean).join(' ')
    : formData.razonSocial

  const estadoDisplay = {
    activo:         { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    activo_proceso: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  }
  const sd = estadoDisplay[finalState.estado]

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Resumen del registro</h3>
      <p className="text-xs text-gray-500 mb-5">Revisa los datos antes de confirmar el alta del cliente.</p>
      <div className="space-y-3">

        <ResumenCard title="Identidad">
          <ResumenRow label="Tipo de cliente"     value={tipo?.label} />
          <ResumenRow label="Nombre / Razón Social" value={nombreCompleto} />
          <ResumenRow label="Documento"           value={[formData.tipoDoc, formData.numDoc].filter(Boolean).join(' ')} />
          {formData.nacionalidad && <ResumenRow label="Nacionalidad" value={formData.nacionalidad} />}
        </ResumenCard>

        <ResumenCard title="Contacto y fiscal">
          <ResumenRow label="Correo de pacto"       value={formData.correoPacto} />
          <ResumenRow label="Correo de facturación" value={formData.correoFacturacion} />
          <ResumenRow label="Dirección SUNAT" value={formData.direccionSunat} fullWidth />
          <ResumenRow label="Ubigeo" value={formData.ubigeo} />
          <ResumenRow label="CIIU"   value={formData.ciiu} />
        </ResumenCard>

        <ResumenCard title="Perfil y riesgo">
          <ResumenRow label="Clasificación"    value={formData.clasificacionRiesgo === 'rf' ? 'Régimen Reforzado' : 'Estándar'} />
          <ResumenRow label="Validación PLAFT" value={formData.resultadoPLAFT === 'conforme' ? 'Conforme' : formData.resultadoPLAFT === 'en_proceso' ? 'En proceso' : '—'} />
          {isPersona && <ResumenRow label="¿Es PEP?" value={formData.esPEP === 'si' ? 'Sí' : 'No'} />}
        </ResumenCard>

        <ResumenCard title="Documentación">
          <div className="col-span-2 flex flex-wrap gap-1.5">
            {getDocsRequeridos(formData).map(doc => {
              const ok = docState[doc.id]?.loaded
              return (
                <span key={doc.id} className={clsx(
                  'text-[11px] px-2 py-1 rounded-lg border flex items-center gap-1',
                  ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                )}>
                  {ok ? <Check size={9} /> : <X size={9} />}{doc.label}
                </span>
              )
            })}
          </div>
        </ResumenCard>

        {/* Estado final + botón confirmar */}
        <div className={clsx('rounded-xl border p-4 flex items-center gap-4', sd.bg, sd.border)}>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 mb-0.5">Estado que tendrá el cliente al confirmar</p>
            <p className={clsx('text-base font-bold', sd.text)}>{finalState.label}</p>
            {finalState.estado === 'activo_proceso' && (
              <p className="text-xs text-amber-600 mt-1">{finalState.missing} documento(s) pendiente(s). El cliente puede operar mientras completa la documentación en el plazo configurado.</p>
            )}
          </div>
          <button onClick={onConfirmar}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm whitespace-nowrap">
            Confirmar alta
          </button>
        </div>
      </div>
    </div>
  )
}

function ResumenCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN WIZARD
═══════════════════════════════════════════════ */
const INITIAL_FORM = {
  tipoPersona: null,
  apellidoPaterno: '', apellidoMaterno: '', nombres: '',
  razonSocial: '',
  tipoDoc: '', numDoc: '', nacionalidad: '',
  direccionSunat: '', ubigeo: '', ciiu: '',
  correoPacto: '', correoFacturacion: '',
  condicionLaboral: '', residenciasPeru: '', esPEP: '',
  operaATerceros: '', consultaBankplus: '',
  clasificacionRiesgo: '',
  resultadoPLAFT: '', notasPLAFT: '',
}

function validateStep(step, formData, docState) {
  const e = {}
  const isPersona = formData.tipoPersona === 'PN' || formData.tipoPersona === 'P10'
  const isEntidad = formData.tipoPersona === 'PJ' || formData.tipoPersona === 'EF'

  if (step === 1) {
    if (!formData.tipoPersona) e.tipoPersona = 'Selecciona un tipo de cliente'
  }
  if (step === 2) {
    if (isPersona) {
      if (!formData.apellidoPaterno)  e.apellidoPaterno  = 'Campo requerido'
      if (!formData.apellidoMaterno)  e.apellidoMaterno  = 'Campo requerido'
      if (!formData.nombres)          e.nombres          = 'Campo requerido'
    }
    if (isEntidad && !formData.razonSocial) e.razonSocial = 'Campo requerido'
    if (!formData.tipoDoc)  e.tipoDoc  = 'Campo requerido'
    if (!formData.numDoc)   e.numDoc   = 'Campo requerido'
    else if (formData.tipoDoc === 'DNI' && formData.numDoc.length !== 8)  e.numDoc = 'El DNI debe tener 8 dígitos'
    else if (formData.tipoDoc === 'RUC' && formData.numDoc.length !== 11) e.numDoc = 'El RUC debe tener 11 dígitos'
    if (isPersona && formData.tipoDoc === 'CE' && !formData.nacionalidad) e.nacionalidad = 'Campo requerido'
    if (!formData.direccionSunat)                    e.direccionSunat    = 'Campo requerido'
    if (!formData.ubigeo || formData.ubigeo.length !== 6) e.ubigeo       = 'Debe tener exactamente 6 dígitos'
    if (!formData.ciiu)                              e.ciiu              = 'Campo requerido'
    if (!formData.correoPacto)                       e.correoPacto       = 'Campo requerido'
    if (!formData.correoFacturacion)                 e.correoFacturacion = 'Campo requerido'
    if (formData.tipoPersona === 'PN' && !formData.condicionLaboral) e.condicionLaboral = 'Campo requerido'
    if (isPersona && !formData.residenciasPeru)      e.residenciasPeru   = 'Campo requerido'
    if (isPersona && !formData.esPEP)                e.esPEP             = 'Campo requerido'
    if (!formData.clasificacionRiesgo)               e.clasificacionRiesgo = 'Campo requerido'
  }
  if (step === 3) {
    // Ficha PEP no bloquea el avance — queda como documento pendiente de regularizar
  }
  if (step === 4) {
    if (!formData.resultadoPLAFT) e.resultadoPLAFT = 'Campo requerido'
    else if (formData.resultadoPLAFT === 'no_conforme') e.resultadoPLAFT = 'Resultado No conforme bloquea el alta. Resuelve las observaciones PLAFT primero.'
  }
  return e
}

export default function ClienteWizard({ onBack, onSave, nextCode }) {
  const [step,       setStep]      = useState(1)
  const [formData,   setFormData]  = useState(INITIAL_FORM)
  const [docState,   setDocState]  = useState({})
  const [errors,     setErrors]    = useState({})
  const [confirmed,  setConfirmed] = useState(false)
  const [savedCode,  setSavedCode] = useState(null)

  function handleChange(field, value) {
    if (field === 'tipoPersona') {
      const defaultDoc = (value === 'PN' || value === 'P10') ? 'DNI' : 'RUC'
      setFormData(prev => ({ ...prev, tipoPersona: value, tipoDoc: defaultDoc, numDoc: '', nacionalidad: '' }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function handleUpload(docId, filename) {
    setDocState(prev => ({ ...prev, [docId]: { loaded: true, filename } }))
    if (errors[docId]) setErrors(prev => ({ ...prev, [docId]: undefined }))
  }

  function handleRemoveDoc(docId) {
    setDocState(prev => { const n = { ...prev }; delete n[docId]; return n })
  }

  function handleNext() {
    const e = validateStep(step, formData, docState)
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  function handleBack() {
    setErrors({})
    setStep(s => Math.max(1, s - 1))
  }

  function handleConfirmar() {
    if (onSave) {
      const isPersona = formData.tipoPersona === 'PN' || formData.tipoPersona === 'P10'
      const nombre = isPersona
        ? [formData.apellidoPaterno, formData.apellidoMaterno, formData.nombres].filter(Boolean).join(' ')
        : formData.razonSocial
      const finalState = determineFinalState(formData, docState)
      const now = new Date()
      const fecha = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`
      const codeToSave = nextCode ?? 'CLI-NVO'
      setSavedCode(codeToSave)
      onSave({
        id:            codeToSave,
        nombre,
        tipo:          formData.tipoPersona,
        tipoDoc:       formData.tipoDoc,
        doi:           formData.numDoc,
        riesgo:        formData.clasificacionRiesgo,
        estado:        finalState.estado,
        plaft:         formData.resultadoPLAFT,
        registradoPor: 'Marco Quispe L.',
        fecha,
      })
    }
    setConfirmed(true)
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* ── Volver — enlace simple, sin card ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a Cartera de Clientes
      </button>

      {/* Stepper indicator */}
      {!confirmed && (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-6 shadow-sm">
          <StepIndicator currentStep={step} />
        </div>
      )}

      {/* Main Form Content */}
      <div className={clsx('bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6', confirmed && 'text-center')}>
        <div className="mb-8">
          {step === 1 && <Step1 formData={formData} onChange={handleChange} errors={errors} />}
          {step === 2 && <Step2 formData={formData} onChange={handleChange} errors={errors} />}
          {step === 3 && (
            <Step3
              formData={formData}
              docState={docState}
              onUpload={handleUpload}
              onRemove={handleRemoveDoc}
              errors={errors}
            />
          )}
          {step === 4 && <Step4 formData={formData} onChange={handleChange} errors={errors} />}
          {step === 5 && (
            <Step5
              formData={formData}
              docState={docState}
              onConfirmar={handleConfirmar}
              confirmed={confirmed}
              newCode={savedCode ?? nextCode}
            />
          )}
        </div>
      </div>

      {/* ── Footer de navegación ── */}
      {!confirmed && (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm flex items-center justify-between">
          <button
            onClick={step === 1 ? onBack : handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            <ArrowLeft size={15} /> {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>

          {step < 5 && (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            >
              Siguiente <ChevronRight size={15} />
            </button>
          )}

          {step === 5 && (
            <button
              onClick={handleConfirmar}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            >
              Confirmar alta del cliente <ChevronRight size={15} />
            </button>
          )}
        </div>
      )}

      {/* Final step action */}
      {confirmed && (
        <div className="flex justify-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            <ArrowLeft size={16} /> Volver a la Cartera de Clientes
          </button>
        </div>
      )}
    </div>
  )
}
