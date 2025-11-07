import { useEffect, useState } from 'react'
import { getDailyClosing } from '../services/dailyClosureService'


function ClosingDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadClosingData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  const loadClosingData = async () => {
    try {
        setLoading(true)
        const data = await getDailyClosing()  // ✅ Trae datos reales
        setOrders(data || [])
        setError(null)
    } catch (err) {
        console.error("Error al obtener cierre diario:", err)
        setError('No se pudo cargar el cierre diario')
    } finally {
        setLoading(false)
    }
  }


  const parseAmount = (value) => {
    if (!value) return 0
    return Number(value.replace('S/ ', '')) || 0
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
    return statusConfig[status?.toLowerCase()] || statusConfig.pending
  }

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesSearch = 
          order.id?.toLowerCase().includes(term) ||
          order.customer?.toLowerCase().includes(term) ||
          order.recipient?.toLowerCase().includes(term)
        if (!matchesSearch) return false
      }

      return true
    })
  }

  const filteredOrders = getFilteredOrders()

  // Calcular métricas
  const totalAmount = filteredOrders.reduce((sum, o) => sum + parseAmount(o.amount), 0)
  const totalDelivered = filteredOrders.filter(o => o.status?.toLowerCase() === 'delivered').length
  const totalCancelled = filteredOrders.filter(o => o.status?.toLowerCase() === 'cancelled').length
  const totalInProgress = filteredOrders.filter(o => o.status?.toLowerCase() === 'in-progress').length

  // Paginación
  const totalItems = filteredOrders.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)


  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  const groupOrdersByCustomer = (orders) => {
    const groups = {};

    orders.forEach(order => {
        const customer = order.customer || "Sin Cliente";
        if (!groups[customer]) groups[customer] = [];
        groups[customer].push(order);
    });

    return groups;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4">
        <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
          Cierre Diario
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-6">
        <div className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredOrders.length}</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary">package_2</span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Entregados</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">{totalDelivered}</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-500">check_circle</span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Curso</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{totalInProgress}</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-500">local_shipping</span>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monto Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">S/ {totalAmount.toFixed(2)}</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary">payments</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 py-3 border-t border-gray-200/10 dark:border-white/10">
        <div className="flex-grow w-full md:w-auto">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full relative">
              <div className="text-gray-400 dark:text-gray-500 flex border-none bg-gray-100 dark:bg-white/5 items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-gray-100 dark:bg-white/5 h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pl-2 pr-10 text-base font-normal leading-normal"
                placeholder="Buscar por ID, cliente, destinatario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </label>
        </div>
      </div>

      

      {/* Loading & Error States */}
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
            onClick={loadClosingData}
            className="ml-4 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <div className="relative z-10 px-4">
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
                        Cliente
                      </th>
                      <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Destinatario
                      </th>
                      <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Estado
                      </th>
                      <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Motorizado
                      </th>
                      <th scope="col" className="px-2 py-2.5 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        Monto Cobrado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
  {Object.entries(groupOrdersByCustomer(filteredOrders)).map(([customer, orders]) => {
    const subtotal = orders.reduce((sum, o) => sum + parseAmount(o.amount), 0);

    return (
      <>
        {/* Encabezado por motorizado */}
        <tr className="bg-gray-100 dark:bg-gray-700/50">
          <td colSpan="6" className="px-2 py-2 font-bold text-gray-900 dark:text-white text-sm">
            {customer}
          </td>
        </tr>

        {/* Filas de pedidos */}
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-white/5">
            <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-200">
              {order.id}
            </td>
            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
              {order.customer}
            </td>
            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
              {order.recipient || '-'}
            </td>
            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
              {order.status}
            </td>
            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
              {order.driver}
            </td>
            <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
              {order.amount}
            </td>
          </tr>
        ))}

        {/* Subtotal */}
        <tr className="bg-gray-50 dark:bg-gray-800/40 font-bold">
          <td colSpan="5" className="px-2 py-2 text-xs text-right text-gray-900 dark:text-white">
            Subtotal:
          </td>
          <td className="px-2 py-2 text-xs text-gray-900 dark:text-white">
            S/ {subtotal.toFixed(2)}
          </td>
        </tr>
      </>
    );
  })}
</tbody>

                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-700 dark:text-gray-400">
              Mostrar:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="form-select rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-400">por página</span>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-400">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
            <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </div>

          <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700"
                  >
                    ...
                  </span>
                )
              }
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                    currentPage === page
                      ? 'z-10 bg-primary/10 dark:bg-primary/20 text-primary ring-1 ring-inset ring-primary'
                      : 'text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </nav>
        </div>
      )}

      {!loading && !error && totalItems === 0 && (
        <div className="text-center py-12 px-4">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">inbox</span>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay pedidos para mostrar</p>
        </div>
      )}
    </div>
  )
}

export default ClosingDashboard