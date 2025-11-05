import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../services/orderCreateService'

function OrderCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    // Información del proveedor/cliente
    empresaNombre: '',
    empresaCelular: '',
    empresaDistrito: '',
    empresaDireccion: '',
    empresaEmail: '',

    // Información del destinatario
    clienteNombre: '',
    clienteCelular: '',
    clienteDistrito: '',
    clienteDireccion: '',

    // Información del paquete
    detalleEnvio: '',
    esPaqueteGrande: '',
    volumen: '',
    dimensionesAlto: '',
    dimensionesAncho: '',
    dimensionesLargo: '',

    // Información de entrega
    fechaEntrega: '',
    observaciones: '',

    // Información de pago
    seCobrara: '',
    metodoPago: '',
    montoCobrar: '',

    // Otros
    estimadoIA: false,
    fotos: []
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      fotos: files
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!formData.empresaNombre || !formData.empresaCelular || !formData.empresaDistrito ||
          !formData.clienteNombre || !formData.clienteCelular || !formData.clienteDistrito ||
          !formData.detalleEnvio || !formData.fechaEntrega || !formData.seCobrara) {
        setError('Por favor completa todos los campos obligatorios')
        setLoading(false)
        return
      }

      // Si se cobrará, validar monto y método de pago
      if (formData.seCobrara === 'si') {
        if (!formData.montoCobrar || parseFloat(formData.montoCobrar) <= 0) {
          setError('Por favor ingresa un monto válido a cobrar')
          setLoading(false)
          return
        }
        if (!formData.metodoPago) {
          setError('Por favor selecciona un método de pago')
          setLoading(false)
          return
        }
      }

      // Crear el pedido
      const result = await createOrder(formData)

      if (result.success) {
        // Redirigir a la lista de pedidos con mensaje de éxito
        navigate('/orders', {
          state: {
            message: `Pedido ${result.orderId} creado exitosamente`,
            type: 'success'
          }
        })
      } else {
        setError(result.message || 'Error al crear el pedido')
      }
    } catch (err) {
      console.error('Error al crear pedido:', err)
      setError('Error inesperado al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  const distritosLima = [
    'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla',
    'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria',
    'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar', 'Miraflores',
    'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
    'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
    'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel',
    'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco',
    'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
  ]

  return (
    <div>
      {/* Header con breadcrumb */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4">
        <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
          Crear Nuevo Pedido
        </h1>
      </div>

      <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-5">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-background-light dark:bg-background-dark p-6 md:p-8 rounded-xl border border-gray-200 dark:border-white/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Información del Pedido</h2>

            {/* Mensaje de error */}
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

            <form onSubmit={handleSubmit}>
              {/* Información del Proveedor/Empresa */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proveedor/Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="empresaNombre">
                      Nombre de empresa *
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="empresaNombre"
                      name="empresaNombre"
                      placeholder="Nombre del cliente/empresa"
                      type="text"
                      value={formData.empresaNombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="empresaCelular">
                      Celular de empresa *
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="empresaCelular"
                      name="empresaCelular"
                      placeholder="999999999"
                      type="tel"
                      value={formData.empresaCelular}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="empresaEmail">
                      Correo electrónico
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="empresaEmail"
                      name="empresaEmail"
                      placeholder="correo@empresa.com"
                      type="email"
                      value={formData.empresaEmail}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="empresaDistrito">
                      Distrito de empresa *
                    </label>
                    <select
                      className="form-select block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                      id="empresaDistrito"
                      name="empresaDistrito"
                      value={formData.empresaDistrito}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar distrito</option>
                      {distritosLima.map(distrito => (
                        <option key={distrito} value={distrito}>{distrito} (Lima)</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="empresaDireccion">
                      Dirección de empresa o Link de ubicación *
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="empresaDireccion"
                      name="empresaDireccion"
                      placeholder="Dirección completa o link de Google Maps"
                      type="text"
                      value={formData.empresaDireccion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Destinatario */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Destinatario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="clienteNombre">
                      Nombre del cliente *
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="clienteNombre"
                      name="clienteNombre"
                      placeholder="Nombre del destinatario"
                      type="text"
                      value={formData.clienteNombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="clienteCelular">
                      Celular del cliente *
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="clienteCelular"
                      name="clienteCelular"
                      placeholder="999999999"
                      type="tel"
                      value={formData.clienteCelular}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="clienteDistrito">
                      Distrito de entrega *
                    </label>
                    <select
                      className="form-select block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                      id="clienteDistrito"
                      name="clienteDistrito"
                      value={formData.clienteDistrito}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar distrito</option>
                      {distritosLima.map(distrito => (
                        <option key={distrito} value={distrito}>{distrito} (Lima)</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="clienteDireccion">
                      Dirección del cliente o Link de ubicación *
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="clienteDireccion"
                      name="clienteDireccion"
                      placeholder="Dirección completa o link de Google Maps"
                      type="text"
                      value={formData.clienteDireccion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Paquete */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paquete</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="detalleEnvio">
                      ¿Qué envía? Detalle su envío *
                    </label>
                    <textarea
                      className="form-textarea block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="detalleEnvio"
                      name="detalleEnvio"
                      placeholder="Describa el contenido del paquete"
                      rows="3"
                      value={formData.detalleEnvio}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="esPaqueteGrande">
                      ¿Volumen mayor a 30cm x 30cm x 30cm? *
                    </label>
                    <select
                      className="form-select block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                      id="esPaqueteGrande"
                      name="esPaqueteGrande"
                      value={formData.esPaqueteGrande}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar tamaño</option>
                      <option value="pequeño">No, es paquete PEQUEÑO</option>
                      <option value="grande">Sí, es paquete GRANDE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="volumen">
                      Volumen (m³)
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="volumen"
                      name="volumen"
                      placeholder="e.g., 0.006"
                      type="text"
                      value={formData.volumen}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dimensiones (Alto x Ancho x Largo cm)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                        name="dimensionesAlto"
                        placeholder="Alto"
                        type="number"
                        value={formData.dimensionesAlto}
                        onChange={handleInputChange}
                      />
                      <span className="text-gray-500 dark:text-gray-400">x</span>
                      <input
                        className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                        name="dimensionesAncho"
                        placeholder="Ancho"
                        type="number"
                        value={formData.dimensionesAncho}
                        onChange={handleInputChange}
                      />
                      <span className="text-gray-500 dark:text-gray-400">x</span>
                      <input
                        className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                        name="dimensionesLargo"
                        placeholder="Largo"
                        type="number"
                        value={formData.dimensionesLargo}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Entrega y Pago */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Entrega y Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="fechaEntrega">
                      Fecha de entrega *
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                      id="fechaEntrega"
                      name="fechaEntrega"
                      type="date"
                      value={formData.fechaEntrega}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="seCobrara">
                      ¿Se cobrará al cliente? *
                    </label>
                    <select
                      className="form-select block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                      id="seCobrara"
                      name="seCobrara"
                      value={formData.seCobrara}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="si">Sí</option>
                      <option value="no">No. Solo entregar</option>
                    </select>
                  </div>

                  {formData.seCobrara === 'si' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="metodoPago">
                          Método de pago cliente *
                        </label>
                        <select
                          className="form-select block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                          id="metodoPago"
                          name="metodoPago"
                          value={formData.metodoPago}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccionar método</option>
                          <option value="yape">Yape</option>
                          <option value="plin">Plin</option>
                          <option value="efectivo">Efectivo</option>
                          <option value="pagolink">Pago Link</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="preguntar">Preguntar, no me indicó</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="montoCobrar">
                          ¿Cuánto se debe cobrar? (S/) *
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">S/</span>
                          </div>
                          <input
                            className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary pl-10"
                            id="montoCobrar"
                            name="montoCobrar"
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            value={formData.montoCobrar}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="observaciones">
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      className="form-textarea block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-primary focus:border-primary"
                      id="observaciones"
                      name="observaciones"
                      placeholder="Notas adicionales sobre el pedido"
                      rows="3"
                      value={formData.observaciones}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Fotos del Paquete */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fotos del Paquete
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary dark:hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                        htmlFor="file-upload"
                      >
                        <span>Sube un archivo</span>
                        <input
                          className="sr-only"
                          id="file-upload"
                          multiple
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    {formData.fotos.length > 0 && (
                      <p className="text-sm text-primary">{formData.fotos.length} archivo(s) seleccionado(s)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkbox Estimado IA */}
              <div className="mt-6 flex items-center">
                <input
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/10 text-primary focus:ring-primary"
                  id="estimadoIA"
                  name="estimadoIA"
                  type="checkbox"
                  checked={formData.estimadoIA}
                  onChange={handleInputChange}
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300" htmlFor="estimadoIA">
                  Estimado por IA
                </label>
              </div>

              {/* Botones de acción */}
              <div className="mt-8 pt-5 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-gray-300 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  <span className="material-symbols-outlined">close</span>
                  <span>Cancelar</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      <span>Crear Pedido</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default OrderCreate
