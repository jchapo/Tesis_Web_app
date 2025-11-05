import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllOrders, searchOrders } from '../services/ordersService'

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar pedidos al montar el componente
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllOrders()
      setOrders(data)
    } catch (err) {
      setError('Error al cargar los pedidos. Por favor, verifica tu conexión.')
      console.error('Error cargando pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar pedidos
  const handleSearch = async (e) => {
    const term = e.target.value
    setSearchTerm(term)

    try {
      setLoading(true)
      const data = await searchOrders(term)
      setOrders(data)
    } catch (err) {
      setError('Error al buscar pedidos.')
      console.error('Error buscando pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500'
      },
      'in-progress': {
        label: 'En Curso',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500'
      },
      delivered: {
        label: 'Entregado',
        className: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
      },
      cancelled: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
      }
    }
    return statusConfig[status] || statusConfig.pending
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4">
        <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
          Gestión de Pedidos
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 py-3 border-b border-gray-200/10 dark:border-white/10">
        <div className="flex-grow w-full md:w-auto">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-gray-400 dark:text-gray-500 flex border-none bg-gray-100 dark:bg-white/5 items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-gray-100 dark:bg-white/5 h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pl-2 text-base font-normal leading-normal"
                placeholder="Buscar por ID, cliente, destinatario..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/5 px-4">
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">calendar_today</span>
            <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Hoy</p>
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">expand_more</span>
          </button>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="truncate">Crear Pedido</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 p-4 overflow-x-auto">
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/5 px-3">
          <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Estado</p>
          <span className="material-symbols-outlined text-gray-500 text-base">expand_more</span>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/5 px-3">
          <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Distrito</p>
          <span className="material-symbols-outlined text-gray-500 text-base">expand_more</span>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/5 px-3">
          <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Motorizado</p>
          <span className="material-symbols-outlined text-gray-500 text-base">expand_more</span>
        </button>
      </div>

      {/* Estado de carga y errores */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mx-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={loadOrders}
            className="ml-4 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <div className="relative">
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    ID Pedido
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Estado
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Cliente
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Destinatario
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Dist. Recojo
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Dist. Entrega
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Dimensiones
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Cobro
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Motorizado
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    F. Creación
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    F. Programada
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Monto
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky-col bg-gray-50 dark:bg-white/5">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => {
                  const status = getStatusBadge(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-white/5">
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {order.id}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        <span className={`inline-flex items-center gap-x-1 py-1 px-2 rounded-full text-[10px] font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.customer}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.recipient}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.pickupDistrict}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.deliveryDistrict}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.dimensions}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.charge}
                      </td>
                      <td className={`px-2 py-2 whitespace-nowrap text-xs ${order.driver === 'Sin Asignar' || order.driver === 'N/A' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {order.driver}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.createdAt}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.scheduledDelivery}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                        {order.amount}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium sticky-col bg-white dark:bg-background-dark">
                        <div className="flex justify-end gap-0.5">
                          <button
                            onClick={() => navigate(`/orders/${encodeURIComponent(order.id)}/assign`)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
                            title="Asignar motorizado"
                          >
                            <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                          </button>
                          <button
                            onClick={() => navigate(`/orders/${encodeURIComponent(order.id)}/view`)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
                            title="Ver detalles"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => navigate(`/orders/${encodeURIComponent(order.id)}/edit`)}
                            className="p-1.5 text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <a href="#" className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Anterior
          </a>
          <a href="#" className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Siguiente
          </a>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              {' '}
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de{' '}
              <span className="font-medium">97</span> resultados{' '}
            </p>
          </div>
          <div>
            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <a href="#" className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </a>
              <a href="#" aria-current="page" className="relative z-10 inline-flex items-center bg-primary/10 dark:bg-primary/20 text-primary px-4 py-2 text-sm font-semibold focus:z-20">
                1
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20">
                2
              </a>
              <a href="#" className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 md:inline-flex">
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:outline-offset-0">
                ...
              </span>
              <a href="#" className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 md:inline-flex">
                8
              </a>
              <a href="#" className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
