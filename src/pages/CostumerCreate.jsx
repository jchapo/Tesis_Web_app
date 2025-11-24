import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '../services/userService'

function CustomerCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Rol fijo en el código, no modificable desde la vista
  const userType = 'cliente'

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    datosEmpresariales: true, // Siempre true para clientes
    empresa: '',
    ruc: '',
    razonSocial: '',
    distrito: ''
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar campos obligatorios (incluyendo datos empresariales)
      if (!formData.email || !formData.telefono) {
        setError('Por favor completa todos los campos obligatorios')
        setLoading(false)
        return
      }

      // Validar datos empresariales obligatorios
      if (!formData.empresa || !formData.distrito) {
        setError('Por favor completa todos los datos empresariales')
        setLoading(false)
        return
      }

      const result = await createClient(formData)

      if (result.success) {
        navigate('/customers', {
          state: {
            message: `Cliente ${formData.empresa}} creado exitosamente`,
            type: 'success'
          }
        })
      } else {
        setError(result.message || 'Error al crear el cliente')
      }
    } catch (err) {
      console.error('Error al crear cliente:', err)
      setError('Error inesperado al crear el cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-3 sm:px-6 md:px-10">
        <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
          Crear Nuevo Cliente
        </h1>
      </div>

      <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-5">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-background-light dark:bg-background-dark p-6 md:p-8 rounded-xl border border-gray-200 dark:border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Datos Personales</h2>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-400 flex items-start gap-3">
                <span className="material-symbols-outlined text-xl">error</span>
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="nombre">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Juan"
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="apellido">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    placeholder="Pérez"
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="juan.perez@example.com"
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="telefono">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+51 987 654 321"
                    className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              {/* Nota sobre contraseña por defecto */}
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">info</span>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      La contraseña por defecto será: <strong>123456789</strong>
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      El cliente podrá cambiarla después de iniciar sesión
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos Empresariales - Obligatorio para clientes */}
              <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Datos Empresariales</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" htmlFor="empresa">
                      Nombre de Empresa *
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      placeholder="Logistics Inc."
                      className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" htmlFor="ruc">
                      RUC 
                    </label>
                    <input
                      type="text"
                      id="ruc"
                      name="ruc"
                      value={formData.ruc}
                      onChange={handleInputChange}
                      placeholder="20123456789"
                      className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                      
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" htmlFor="razonSocial">
                      Razón Social 
                    </label>
                    <input
                      type="text"
                      id="razonSocial"
                      name="razonSocial"
                      value={formData.razonSocial}
                      onChange={handleInputChange}
                      placeholder="LOGISTICS INC. S.A.C."
                      className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block" htmlFor="distrito">
                      DISTRITO 
                    </label>
                    <select
                      id="distrito"
                      name="distrito"
                      value={formData.distrito}
                      onChange={handleInputChange}
                      className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50"
                      required
                    >
                      <option value="">Selecciona un distrito</option>
                      <option value="Ate (Lima)">Ate (Lima)</option>
                      <option value="Barranco (Lima)">Barranco (Lima)</option>
                      <option value="Bellavista (Callao)">Bellavista (Callao)</option>
                      <option value="Breña (Lima)">Breña (Lima)</option>
                      <option value="Callao (Callao)">Callao (Callao)</option>
                      <option value="Carabayllo (Lima)">Carabayllo (Lima)</option>
                      <option value="Carmen de la Legua (Callao)">Carmen de la Legua (Callao)</option>
                      <option value="Cercado de Lima (Lima)">Cercado de Lima (Lima)</option>
                      <option value="Chorrillos (Lima)">Chorrillos (Lima)</option>
                      <option value="Comas (Lima)">Comas (Lima)</option>
                      <option value="El Agustino (Lima)">El Agustino (Lima)</option>
                      <option value="Huachipa (Ate, Lima)">Huachipa (Ate, Lima)</option>
                      <option value="Independencia (Lima)">Independencia (Lima)</option>
                      <option value="Jesús María (Lima)">Jesús María (Lima)</option>
                      <option value="La Molina (Lima)">La Molina (Lima)</option>
                      <option value="La Perla (Callao)">La Perla (Callao)</option>
                      <option value="La Punta (Callao)">La Punta (Callao)</option>
                      <option value="La Victoria (Lima)">La Victoria (Lima)</option>
                      <option value="Lince (Lima)">Lince (Lima)</option>
                      <option value="Los Olivos (Lima)">Los Olivos (Lima)</option>
                      <option value="Lurín (Lima)">Lurín (Lima)</option>
                      <option value="Magdalena del Mar (Lima)">Magdalena del Mar (Lima)</option>
                      <option value="Mi Perú (Callao)">Mi Perú (Callao)</option>
                      <option value="Miraflores (Lima)">Miraflores (Lima)</option>
                      <option value="Oquendo (Callao)">Oquendo (Callao)</option>
                      <option value="Pueblo Libre (Lima)">Pueblo Libre (Lima)</option>
                      <option value="Puente Piedra (Lima)">Puente Piedra (Lima)</option>
                      <option value="Rímac (Lima)">Rímac (Lima)</option>
                      <option value="San Borja (Lima)">San Borja (Lima)</option>
                      <option value="San Isidro (Lima)">San Isidro (Lima)</option>
                      <option value="San Juan de Lurigancho (Lima)">San Juan de Lurigancho (Lima)</option>
                      <option value="San Juan de Miraflores (Lima)">San Juan de Miraflores (Lima)</option>
                      <option value="San Luis (Lima)">San Luis (Lima)</option>
                      <option value="San Martín de Porres (Lima)">San Martín de Porres (Lima)</option>
                      <option value="San Miguel (Lima)">San Miguel (Lima)</option>
                      <option value="Santa Anita (Lima)">Santa Anita (Lima)</option>
                      <option value="Santa Clara (Ate, Lima)">Santa Clara (Ate, Lima)</option>
                      <option value="Santa Rosa (Callao)">Santa Rosa (Callao)</option>
                      <option value="Surco (Lima)">Surco (Lima)</option>
                      <option value="Surquillo (Lima)">Surquillo (Lima)</option>
                      <option value="Ventanilla (Callao)">Ventanilla (Callao)</option>
                      <option value="Villa El Salvador (Lima)">Villa El Salvador (Lima)</option>
                      <option value="Villa María del Triunfo (Lima)">Villa María del Triunfo (Lima)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/customers')}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>save</span>
                  <span>{loading ? 'Creando...' : 'Guardar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerCreate
