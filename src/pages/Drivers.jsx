import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDrivers, searchDrivers } from '../services/userService'
import DriverMap from '../components/DriverMap'

function Drivers() {
  const navigate = useNavigate()

  // Estados principales
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriver, setSelectedDriver] = useState(null)

  // Cargar motorizados al montar el componente
  useEffect(() => {
    loadDrivers()
  }, [])

  // Seleccionar el primer motorizado activo cuando se cargan
  useEffect(() => {
    if (drivers.length > 0 && !selectedDriver) {
      const firstActiveDriver = drivers.find(d => d.status === 'active') || drivers[0]
      setSelectedDriver(firstActiveDriver)
    }
  }, [drivers, selectedDriver])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllDrivers()
      setDrivers(data)
    } catch (err) {
      setError('Error al cargar los motorizados.')
      console.error('Error cargando motorizados:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === '') {
      loadDrivers()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const results = await searchDrivers(value)
      setDrivers(results)
    } catch (err) {
      setError('Error al buscar motorizados.')
      console.error('Error buscando motorizados:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500'
  }

  // Filtrar motorizados activos
  const activeDrivers = drivers.filter(driver => driver.status === 'active')

  // Mock data para pedidos asignados (puedes reemplazar con datos reales)
  const getAssignedOrders = (driverId) => {
    // Aquí conectarías con tu servicio real de pedidos
    return [
      { id: '84321', status: 'En Camino', address: 'Av. Libertador 456, Capital' },
      { id: '84322', status: 'Entregado', address: 'Calle Falsa 123, Provincia' },
      { id: '84323', status: 'Pendiente', address: 'Plaza Mayor 2, Centro' }
    ]
  }

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      'En Camino': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
      'Entregado': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
      'Pendiente': 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300'
    }
    return statusConfig[status] || statusConfig['Pendiente']
  }

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      {/* Drivers Panel */}
      <div className="flex w-[380px] flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Motorizados Activos</h1>
            <button
              onClick={() => navigate('/drivers/create')}
              className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              title="Añadir Motorizado"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
            <input
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 pl-10 pr-10 py-2.5 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-primary"
              placeholder="Buscar motorizado o pedido..."
              type="text"
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  loadDrivers()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                title="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando motorizados...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
            <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
            <p className="text-red-500 dark:text-red-400 font-medium text-sm text-center">{error}</p>
            <button
              onClick={loadDrivers}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <span className="material-symbols-outlined">refresh</span>
              Reintentar
            </button>
          </div>
        )}

        {/* Drivers List - Contenedor scrolleable */}
        {!loading && !error && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Lista de motorizados con scroll */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeDrivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
                  <span className="material-symbols-outlined text-gray-400 text-5xl">two_wheeler_off</span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    {searchTerm ? 'No se encontraron motorizados' : 'No hay motorizados activos'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {activeDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className={`block w-full p-4 text-left transition-colors ${
                        selectedDriver?.id === driver.id
                          ? 'border-l-4 border-primary bg-primary/10 dark:bg-primary/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="size-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold">
                            {driver.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${getStatusColor(driver.status)} ring-2 ring-white dark:ring-background-dark`}></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{driver.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">3 pedidos asignados</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Orders Panel for Selected Driver - Fixed at bottom */}
            {selectedDriver && (
              <div className="border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pedidos Asignados</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mostrando pedidos para {selectedDriver.name}</p>
                </div>
                <div className="max-h-80 overflow-y-auto p-4 pt-0">
                  <ul className="space-y-3">
                    {getAssignedOrders(selectedDriver.id).map((order) => (
                      <li key={order.id}>
                        <div className="rounded-lg p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Pedido #{order.id}</p>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.address}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="relative flex-1 overflow-hidden">
        <DriverMap
          drivers={activeDrivers}
          selectedDriver={selectedDriver}
          onDriverSelect={setSelectedDriver}
        />
      </div>
    </div>
  )
}

export default Drivers
