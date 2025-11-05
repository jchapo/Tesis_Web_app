import { useParams, useNavigate } from 'react-router-dom'

function OrderView() {
  const { orderId: encodedOrderId } = useParams()
  const navigate = useNavigate()
  const orderId = decodeURIComponent(encodedOrderId)

  // Datos de ejemplo - en producción vendrían de una API
  const orderData = {
    id: orderId,
    status: 'En Camino',
    statusColor: 'text-yellow-500',
    sender: {
      name: 'Ana Morales',
      phone: '+1 (234) 567-890',
      address: 'Av. Principal 123, Ciudad Capital'
    },
    recipient: {
      name: 'Carlos Rojas',
      phone: '+1 (987) 654-321',
      address: 'Calle Secundaria 456, Distrito Norte'
    },
    package: {
      dimensions: '30cm x 20cm x 15cm',
      weight: '2.5 kg',
      volume: '0.009 m³',
      content: 'Documentos Importantes'
    },
    driver: {
      name: 'Javier Rodriguez',
      vehicle: 'Moto - Placa XYZ-123',
      rating: '4.9',
      reviews: '125',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZyEIwR6HATFjv4nMeD4RlvjzPT9LrwGcPeGxpS6tbp5d17fJGsOK-6NaMx0TMCvMyASYpMtO9wX7SQJdNk_YEXtXSm9-CKWuC6qJ6YVJDLPmlvClq6qQBp7Kmya92QpOvvt5aqkBIPRXl4g9t1BXUuzA1gt8oKNYhTwExKU5EDLjx8E_7ZJ-DNItvcBLdBd1PQX9Ii3eSOlvqeUDi2Rnm3tuRydJZoxq57QwD5pAxJTPhsm3MO810t9DxYIVmQDrv1k2IlM4fINc'
    },
    costs: {
      shipping: '$15.00',
      insurance: '$2.50',
      total: '$17.50'
    },
    timeline: [
      { status: 'Creado', date: '10 Jul, 10:00 AM', completed: true, icon: 'check' },
      { status: 'Asignado', date: '10 Jul, 10:15 AM', completed: true, icon: 'check' },
      { status: 'En camino', date: '10 Jul, 11:30 AM', completed: true, icon: 'local_shipping', current: true },
      { status: 'Entregado', date: 'Pendiente', completed: false, icon: 'inventory_2' }
    ],
    photos: {
      pickup: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiysCbwg7sPTMNU3sdS8IrgaD06eU_Y76gTrkJ2BlNlBGtOJdVZOgReBlK-ptl8vmVXtDEYrquM_fJayA0GTu9UGELp3wQD8R47GxqWOw9Psjkn0gYdBtF61V5zdKIheoEnV4EFmS9fQRiGi-zkQdozN9hI4F7nLw7rPRR1VXgw9ObulIo_9pWDjCZe2BzEPHLFWfuDaAClBzrUOZW4B3vSL9TmAY9HSNBozD6V3SxJtKIwDUogiF5K-nVUVZeKi7SMWg5NSLHZOw',
      delivery: null
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Heading */}
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-gray-900 dark:text-white text-3xl font-black">Pedido {orderData.id}</h1>
          <p className={`${orderData.statusColor} text-base font-medium flex items-center gap-2`}>
            <span className="material-symbols-outlined text-xl">local_shipping</span>
            <span>{orderData.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/orders/${encodeURIComponent(orderId)}/edit`)}
            className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-bold tracking-wide hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            <span className="truncate">Editar</span>
          </button>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-lg">print</span>
            <span className="truncate">Imprimir</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Timeline y Costos */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight mb-4">Historial del Pedido</h3>
            <div className="grid grid-cols-[auto_1fr] gap-x-4">
              {orderData.timeline.map((step, index) => (
                <div key={index} className="contents">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`flex items-center justify-center size-8 rounded-full ${
                      step.completed
                        ? step.current
                          ? 'bg-yellow-500 text-gray-900'
                          : 'bg-green-500 text-white'
                        : 'border-2 border-dashed border-gray-300 dark:border-gray-600'
                    }`}>
                      <span className={`material-symbols-outlined text-lg ${!step.completed && 'text-gray-400 dark:text-gray-500'}`}>
                        {step.icon}
                      </span>
                    </div>
                    {index < orderData.timeline.length - 1 && (
                      <div className="w-0.5 bg-gray-200 dark:bg-gray-700 grow"></div>
                    )}
                  </div>
                  <div className={index < orderData.timeline.length - 1 ? 'pb-6' : ''}>
                    <p className="text-gray-900 dark:text-white font-medium">{step.status}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Costos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight mb-4">Desglose de Costos</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Costo del envío</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{orderData.costs.shipping}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Seguro</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{orderData.costs.insurance}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary">{orderData.costs.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Central - Cliente y Destinatario */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Remitente y Destinatario */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight mb-4">Remitente</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">person</span>
                  <span className="text-gray-800 dark:text-gray-200">{orderData.sender.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">phone</span>
                  <a className="text-primary hover:underline" href={`tel:${orderData.sender.phone}`}>
                    {orderData.sender.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">location_on</span>
                  <span className="text-gray-800 dark:text-gray-200">{orderData.sender.address}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight mb-4">Destinatario</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">person</span>
                  <span className="text-gray-800 dark:text-gray-200">{orderData.recipient.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">phone</span>
                  <a className="text-primary hover:underline" href={`tel:${orderData.recipient.phone}`}>
                    {orderData.recipient.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg text-gray-400 mt-0.5">location_on</span>
                  <span className="text-gray-800 dark:text-gray-200">{orderData.recipient.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Paquete */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight mb-4">Detalles del Paquete</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Dimensiones</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{orderData.package.dimensions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Peso</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{orderData.package.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Volumen</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{orderData.package.volume}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Contenido</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">{orderData.package.content}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Motorizado y Fotos */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Motorizado */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight mb-4">Motorizado Asignado</h3>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16"
                style={{ backgroundImage: `url("${orderData.driver.avatar}")` }}
              />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{orderData.driver.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{orderData.driver.vehicle}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-yellow-400 text-base">star</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{orderData.driver.rating}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({orderData.driver.reviews})</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <span className="material-symbols-outlined text-lg">chat</span>
                <span>Contactar</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <span className="material-symbols-outlined text-lg">route</span>
                <span>Ver Ruta</span>
              </button>
            </div>
          </div>

          {/* Fotos del paquete */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold tracking-tight mb-4">Evidencia Fotográfica</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group cursor-pointer">
                <div
                  className="aspect-square w-full bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url("${orderData.photos.pickup}")` }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                  <span className="material-symbols-outlined text-white text-4xl">zoom_in</span>
                </div>
                <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">En Recogida</p>
              </div>
              <div className="relative group cursor-pointer">
                <div className="aspect-square w-full bg-cover bg-center rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-4xl">add_a_photo</span>
                </div>
                <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">En Entrega</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderView
