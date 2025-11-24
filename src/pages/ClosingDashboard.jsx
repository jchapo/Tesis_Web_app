import { useEffect, useState } from 'react'
import { getDailyClosing } from '../services/dailyClosureService'


function ClosingDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    loadClosingData()
  }, [])

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
      

      return true
    })
  }

  const filteredOrders = getFilteredOrders()

  // Calcular métricas
  const totalAmount = filteredOrders.reduce((sum, o) => sum + parseAmount(o.amount), 0)
  const totalDelivered = filteredOrders.filter(o => o.status?.toLowerCase() === 'delivered').length
  const totalCancelled = filteredOrders.filter(o => o.status?.toLowerCase() === 'cancelled').length
  const totalInProgress = filteredOrders.filter(o => o.status?.toLowerCase() === 'in-progress').length


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
            <div className="h-[calc(100vh-300px)] overflow-y-auto">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
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
        {orders.map((order) => {
          const status = getStatusBadge(order.status)
          return (
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
                <span className={`inline-flex items-center gap-x-1 py-1 px-2 rounded-full text-[10px] font-medium ${status.className}`}>
                  {status.label}
                </span>
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                {order.driver}
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-800 dark:text-gray-200">
                {order.amount}
              </td>
            </tr>
          )
        })}

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
        </div>
      )}

      

    {!loading && !error && filteredOrders.length === 0 && (
        <div className="text-center py-12 px-4">
          <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4">inbox</span>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay pedidos para mostrar</p>
        </div>
      )}
    </div>
  )
}

export default ClosingDashboard