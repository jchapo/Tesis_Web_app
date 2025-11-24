import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createOrder, updateOrder } from '../services/orderCreateService'
import { getOrderById } from '../services/ordersService'

function OrderCreate() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const isEditMode = Boolean(orderId)

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditMode)
  const [error, setError] = useState(null)

  // Estados para cálculos dinámicos
  const [comisionCalculada, setComisionCalculada] = useState(0)
  const [montoTotal, setMontoTotal] = useState(0)
  const [comisionManual, setComisionManual] = useState(false) // Para saber si se editó manualmente
  const [volumenCalculado, setVolumenCalculado] = useState(0) // Volumen calculado automáticamente

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
    fotos: [],

    // Campos adicionales para edición
    proveedorUid: null,
    fechaCreacion: null,
    fechaRecojo: null,
    fechaEntrega: null,
    fechaAnulacion: null,
    estadoPago: 'pendiente',
    billeteraUsada: null,
    peso: null,
    confianzaIA: null,
    asignacionRecojoEstado: 'pendiente',
    asignacionRecojoRutaId: null,
    asignacionRecojoRutaNombre: null,
    asignacionRecojoMotorizadoUid: null,
    asignacionRecojoMotorizadoNombre: null,
    asignacionRecojoAsignadaEn: null,
    asignacionRecojoRazonPendiente: null,
    asignacionEntregaEstado: 'pendiente',
    asignacionEntregaRutaId: null,
    asignacionEntregaRutaNombre: null,
    asignacionEntregaMotorizadoUid: null,
    asignacionEntregaMotorizadoNombre: null,
    asignacionEntregaAsignadaEn: null,
    asignacionEntregaRazonPendiente: null
  })

  // Cargar datos del pedido si está en modo edición
  useEffect(() => {
    const loadOrderData = async () => {
      if (!isEditMode || !orderId) return

      try {
        setLoadingData(true)
        setError(null)

        const order = await getOrderById(orderId)
        const rawData = order.rawData

        // Formatear fecha para input date (YYYY-MM-DD)
        const formatDateForInput = (timestamp) => {
          if (!timestamp) return ''
          const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
          return date.toISOString().split('T')[0]
        }

        // Mapear los datos del pedido al formato del formulario
        setFormData({
          // Información del proveedor
          empresaNombre: rawData.proveedor?.nombre || '',
          empresaCelular: rawData.proveedor?.telefono || '',
          empresaDistrito: rawData.proveedor?.direccion?.distrito || '',
          empresaDireccion: rawData.proveedor?.direccion?.link || '',
          empresaEmail: rawData.proveedor?.correo || '',

          // Información del destinatario
          clienteNombre: rawData.destinatario?.nombre || '',
          clienteCelular: rawData.destinatario?.telefono || '',
          clienteDistrito: rawData.destinatario?.direccion?.distrito || '',
          clienteDireccion: rawData.destinatario?.direccion?.link || '',

          // Información del paquete
          detalleEnvio: rawData.paquete?.detalle || '',
          esPaqueteGrande: rawData.paquete?.dimensiones?.excedeMaximo ? 'grande' : 'pequeño',
          volumen: rawData.paquete?.dimensiones?.volumen || '',
          dimensionesAlto: rawData.paquete?.dimensiones?.alto || '',
          dimensionesAncho: rawData.paquete?.dimensiones?.ancho || '',
          dimensionesLargo: rawData.paquete?.dimensiones?.largo || '',

          // Información de entrega
          fechaEntrega: formatDateForInput(rawData.fechas?.entregaProgramada),
          observaciones: rawData.paquete?.observaciones || '',

          // Información de pago
          seCobrara: rawData.pago?.seCobra ? 'si' : 'no',
          metodoPago: rawData.pago?.metodoPago || '',
          montoCobrar: rawData.pago?.monto || '',

          // Otros
          estimadoIA: rawData.paquete?.dimensiones?.estimadoPorIA || false,
          fotos: rawData.paquete?.fotos || {},

          // Campos adicionales para preservar
          proveedorUid: rawData.proveedor?.uid,
          fechaCreacion: rawData.fechas?.creacion,
          fechaRecojo: rawData.fechas?.recojo,
          fechaEntregaOriginal: rawData.fechas?.entrega,
          fechaAnulacion: rawData.fechas?.anulacion,
          estadoPago: rawData.pago?.estadoPago || 'pendiente',
          billeteraUsada: rawData.pago?.billeteraUsada,
          peso: rawData.paquete?.dimensiones?.peso,
          confianzaIA: rawData.paquete?.dimensiones?.confianzaIA,

          // Datos de asignación
          asignacionRecojoEstado: rawData.asignacion?.recojo?.estado,
          asignacionRecojoRutaId: rawData.asignacion?.recojo?.rutaId,
          asignacionRecojoRutaNombre: rawData.asignacion?.recojo?.rutaNombre,
          asignacionRecojoMotorizadoUid: rawData.asignacion?.recojo?.motorizadoUid,
          asignacionRecojoMotorizadoNombre: rawData.asignacion?.recojo?.motorizadoNombre,
          asignacionRecojoAsignadaEn: rawData.asignacion?.recojo?.asignadaEn,
          asignacionRecojoRazonPendiente: rawData.asignacion?.recojo?.razonPendiente,
          asignacionEntregaEstado: rawData.asignacion?.entrega?.estado,
          asignacionEntregaRutaId: rawData.asignacion?.entrega?.rutaId,
          asignacionEntregaRutaNombre: rawData.asignacion?.entrega?.rutaNombre,
          asignacionEntregaMotorizadoUid: rawData.asignacion?.entrega?.motorizadoUid,
          asignacionEntregaMotorizadoNombre: rawData.asignacion?.entrega?.motorizadoNombre,
          asignacionEntregaAsignadaEn: rawData.asignacion?.entrega?.asignadaEn,
          asignacionEntregaRazonPendiente: rawData.asignacion?.entrega?.razonPendiente
        })
      } catch (err) {
        console.error('Error al cargar pedido:', err)
        setError('Error al cargar los datos del pedido')
      } finally {
        setLoadingData(false)
      }
    }

    loadOrderData()
  }, [isEditMode, orderId])

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

      // Preparar datos con comisión manual si fue editada
      const dataToSubmit = {
        ...formData,
        comisionManual: comisionManual ? comisionCalculada : null
      }

      let result
      if (isEditMode) {
        // Actualizar el pedido existente
        result = await updateOrder(orderId, dataToSubmit)
      } else {
        // Crear un nuevo pedido
        result = await createOrder(dataToSubmit)
      }

      if (result.success) {
        // Redirigir a la lista de pedidos con mensaje de éxito
        navigate('/orders', {
          state: {
            message: isEditMode
              ? `Pedido ${result.orderId} actualizado exitosamente`
              : `Pedido ${result.orderId} creado exitosamente`,
            type: 'success'
          }
        })
      } else {
        setError(result.message || (isEditMode ? 'Error al actualizar el pedido' : 'Error al crear el pedido'))
      }
    } catch (err) {
      console.error(isEditMode ? 'Error al actualizar pedido:' : 'Error al crear pedido:', err)
      setError(isEditMode ? 'Error inesperado al actualizar el pedido' : 'Error inesperado al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular comisión basada en distrito y tamaño
  const calcularComision = (distrito, esPaqueteGrande) => {
    let comisionBase = 10

    if (['Carabayllo (Lima)', 'Ventanilla (Callao)', 'Puente Piedra (Lima)'].includes(distrito)) {
      comisionBase = 15
    } else if (['Comas (Lima)', 'Villa El Salvador (Lima)', 'Villa María del Triunfo (Lima)', 'Oquendo (Callao)', 'Santa Clara (Ate, Lima)'].includes(distrito)) {
      comisionBase = 13
    }

    return esPaqueteGrande ? comisionBase + 5 : comisionBase
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

  // useEffect para calcular comisión y monto total dinámicamente
  useEffect(() => {
    const distrito = formData.clienteDistrito
    const esPaqueteGrande = formData.esPaqueteGrande === 'grande'
    const montoCobrar = formData.seCobrara === 'si' ? parseFloat(formData.montoCobrar || 0) : 0

    // Solo recalcular comisión automáticamente si NO se editó manualmente
    if (!comisionManual) {
      const comision = distrito ? calcularComision(distrito, esPaqueteGrande) : 0
      setComisionCalculada(comision)
    }

    // El monto a cobrar YA es el monto total (no se suma la comisión)
    setMontoTotal(montoCobrar)
  }, [formData.clienteDistrito, formData.esPaqueteGrande, formData.montoCobrar, formData.seCobrara, comisionManual])

  // Función para manejar el cambio manual de comisión
  const handleComisionChange = (e) => {
    const valor = parseFloat(e.target.value) || 0
    setComisionCalculada(valor)
    setComisionManual(true) // Marcar como editado manualmente
  }

  // Función para resetear comisión a automática
  const resetComisionAutomatica = () => {
    const distrito = formData.clienteDistrito
    const esPaqueteGrande = formData.esPaqueteGrande === 'grande'
    const comision = distrito ? calcularComision(distrito, esPaqueteGrande) : 0
    setComisionCalculada(comision)
    setComisionManual(false) // Volver a modo automático
  }

  // useEffect para calcular volumen automáticamente
  useEffect(() => {
    const alto = parseFloat(formData.dimensionesAlto)
    const ancho = parseFloat(formData.dimensionesAncho)
    const largo = parseFloat(formData.dimensionesLargo)

    // Solo calcular si las 3 dimensiones están presentes
    if (alto && ancho && largo && alto > 0 && ancho > 0 && largo > 0) {
      // Calcular volumen en cm³
      const volumenCm3 = alto * ancho * largo
      setVolumenCalculado(volumenCm3)

      // Actualizar formData con el volumen calculado
      setFormData(prev => ({
        ...prev,
        volumen: volumenCm3.toFixed(2) // 2 decimales para cm³
      }))
    } else {
      // Si falta alguna dimensión, limpiar el volumen
      setVolumenCalculado(0)
      setFormData(prev => ({
        ...prev,
        volumen: ''
      }))
    }
  }, [formData.dimensionesAlto, formData.dimensionesAncho, formData.dimensionesLargo])

  // Mostrar loading mientras se cargan los datos
  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header con breadcrumb */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4">
        <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
          {isEditMode ? 'Editar Pedido' : 'Crear Nuevo Pedido'}
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
                    {formData.clienteDistrito && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Tarifa base para este distrito: S/ {calcularComision(formData.clienteDistrito, false)}
                        {formData.esPaqueteGrande === 'grande' && ' (+S/ 5 por paquete grande)'}
                      </p>
                    )}
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

                {/* Indicador de comisión estimada */}
                {formData.clienteDistrito && formData.esPaqueteGrande && (
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">info</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          Comisión estimada: S/ {comisionCalculada.toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          Basada en distrito de entrega ({formData.clienteDistrito}) y tamaño del paquete
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                      <option value="grande">Sí, es paquete GRANDE (+S/ 5 adicionales)</option>
                    </select>
                    {formData.esPaqueteGrande === 'grande' && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        Los paquetes grandes tienen un cargo adicional de S/ 5
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="volumen">
                      Volumen (cm³)
                    </label>
                    <input
                      className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                      id="volumen"
                      name="volumen"
                      placeholder="Se calcula automáticamente"
                      type="text"
                      value={formData.volumen ? parseFloat(formData.volumen).toFixed(2) : ''}
                      readOnly
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formData.dimensionesAlto && formData.dimensionesAncho && formData.dimensionesLargo
                        ? `${formData.dimensionesAlto} × ${formData.dimensionesAncho} × ${formData.dimensionesLargo} cm`
                        : 'Ingresa las 3 dimensiones para calcular el volumen'
                      }
                    </p>
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

                {/* Resumen de costos (visible solo si se cobrará) */}
                {formData.seCobrara === 'si' && formData.montoCobrar && parseFloat(formData.montoCobrar) > 0 && (
                  <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Resumen de Costos</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-primary">Monto Total:</span>
                        <span className="text-xl font-bold text-primary">S/ {montoTotal.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-primary/30">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 dark:text-gray-300">Comisión de envío:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">S/ {comisionCalculada.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                          <span className="text-gray-700 dark:text-gray-300">Dinero proveedor:</span>
                          <span className="font-semibold text-green-600 dark:text-green-500">S/ {(montoTotal - comisionCalculada).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                          Monto a cobrar al cliente (S/) *
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comisión (Tarifa de envío)
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-gray-500 sm:text-sm">S/</span>
                            </div>
                            <input
                              className={`form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 ${
                                comisionManual
                                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600'
                                  : 'bg-gray-50 dark:bg-white/5'
                              } text-gray-900 dark:text-white pl-10 focus:ring-primary focus:border-primary`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={comisionCalculada.toFixed(2)}
                              onChange={handleComisionChange}
                            />
                          </div>
                          {comisionManual && (
                            <button
                              type="button"
                              onClick={resetComisionAutomatica}
                              className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                              title="Volver a cálculo automático"
                            >
                              <span className="material-symbols-outlined text-base">refresh</span>
                              <span className="hidden sm:inline">Auto</span>
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {comisionManual
                            ? '⚠️ Comisión editada manualmente - Click en "Auto" para recalcular'
                            : 'Calculado automáticamente según distrito y tamaño del paquete'
                          }
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Monto Total
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">S/</span>
                          </div>
                          <input
                            className="form-input block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-primary/10 dark:bg-primary/20 text-primary font-semibold pl-10 cursor-not-allowed"
                            value={montoTotal.toFixed(2)}
                            readOnly
                            disabled
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Monto a cobrar + Comisión
                        </p>
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
                      <span>{isEditMode ? 'Actualizar Pedido' : 'Crear Pedido'}</span>
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
