import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllOrders, searchOrders } from '../services/ordersService'

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: '',
    origin: '',
    destination: '',
    driver: '',
    date: ''
  })
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [showDriverDropdown, setShowDriverDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Cargar pedidos al montar el componente
  useEffect(() => {
    loadOrders()
  }, [])

  // Reset página cuando cambia la búsqueda o items por página
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowStatusDropdown(false)
        setShowOriginDropdown(false)
        setShowDestinationDropdown(false)
        setShowDriverDropdown(false)
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  // Obtener opciones únicas para filtros
  const getUniqueStatuses = () => {
    const statuses = [...new Set(orders.map(order => order.status))]
    return statuses.map(status => ({
      value: status,
      label: getStatusBadge(status).label
    }))
  }

  const getUniqueOrigins = () => {
    const origins = new Set()
    orders.forEach(order => {
      if (order.pickupDistrict && order.pickupDistrict !== '-') {
        origins.add(order.pickupDistrict)
      }
    })
    return Array.from(origins).sort()
  }

  const getUniqueDestinations = () => {
    const destinations = new Set()
    orders.forEach(order => {
      if (order.deliveryDistrict && order.deliveryDistrict !== '-') {
        destinations.add(order.deliveryDistrict)
      }
    })
    return Array.from(destinations).sort()
  }

  const getUniqueDrivers = () => {
    const drivers = [...new Set(orders.map(order => order.driver))]
    return drivers.filter(driver => driver && driver !== '-').sort()
  }

  // Aplicar filtros
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Filtro por estado
      if (filters.status && order.status !== filters.status) {
        return false
      }

      // Filtro por origen (distrito recojo)
      if (filters.origin && order.pickupDistrict !== filters.origin) {
        return false
      }

      // Filtro por destino (distrito entrega)
      if (filters.destination && order.deliveryDistrict !== filters.destination) {
        return false
      }

      // Filtro por motorizado
      if (filters.driver && order.driver !== filters.driver) {
        return false
      }

      // Filtro por fecha
      if (filters.date) {
        // Convertir la fecha del filtro a objeto Date
        const filterDate = new Date(filters.date)
        filterDate.setHours(0, 0, 0, 0)

        // Extraer la fecha del texto createdAt (formato: "DD MMM, HH:MM")
        // Ejemplo: "05 nov, 10:30"
        const orderDateMatch = order.createdAt.match(/(\d{2})\s+(\w{3})/)
        if (orderDateMatch) {
          const [, day, monthStr] = orderDateMatch

          // Mapear nombres de meses en español a números
          const monthMap = {
            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
          }

          const orderDate = new Date()
          orderDate.setDate(parseInt(day))
          orderDate.setMonth(monthMap[monthStr.toLowerCase()])
          orderDate.setHours(0, 0, 0, 0)

          // Comparar solo día y mes
          if (orderDate.getDate() !== filterDate.getDate() ||
              orderDate.getMonth() !== filterDate.getMonth()) {
            return false
          }
        } else {
          return false
        }
      }

      return true
    })
  }

  const filteredOrders = getFilteredOrders()

  // Calcular paginación
  const totalItems = filteredOrders.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  // Funciones para manejar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1)
  }

  const clearFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: ''
    }))
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setFilters({
      status: '',
      origin: '',
      destination: '',
      driver: '',
      date: ''
    })
    setCurrentPage(1)
  }

  // Obtener fecha de hoy en formato para input date
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Funciones de navegación de páginas
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Generar array de números de página para mostrar
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      if (currentPage <= 3) {
        // Cerca del inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // En el medio
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
          {/* Filtro de Fecha */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex h-12 min-w-[84px] cursor-pointer items-center justify-center gap-x-2 rounded-lg px-4 ${
                filters.date
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">calendar_today</span>
              <p className="text-sm font-medium leading-normal">
                {filters.date
                  ? new Date(filters.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
                  : 'Hoy'}
              </p>
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">expand_more</span>
            </button>
            {showDatePicker && (
              <div className="absolute z-40 mt-2 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar fecha:
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => {
                    handleFilterChange('date', e.target.value)
                    setShowDatePicker(false)
                  }}
                  className="form-input rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      handleFilterChange('date', getTodayDate())
                      setShowDatePicker(false)
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Hoy
                  </button>
                  {filters.date && (
                    <button
                      onClick={() => {
                        clearFilter('date')
                        setShowDatePicker(false)
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="truncate">Crear Pedido</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 p-4 items-center relative">
        {/* Filtro Estado */}
        <div className="relative filter-dropdown z-30">
          <button
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown)
              setShowDistrictDropdown(false)
              setShowDriverDropdown(false)
            }}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 ${
              filters.status
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white'
            }`}
          >
            <p className="text-sm font-medium leading-normal">
              {filters.status ? getStatusBadge(filters.status).label : 'Estado'}
            </p>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
          {showStatusDropdown && (
            <div className="absolute z-40 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                {getUniqueStatuses().map(status => (
                  <button
                    key={status.value}
                    onClick={() => {
                      handleFilterChange('status', status.value)
                      setShowStatusDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {status.label}
                  </button>
                ))}
                {filters.status && (
                  <button
                    onClick={() => {
                      clearFilter('status')
                      setShowStatusDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filtro Origen */}
        <div className="relative filter-dropdown z-30">
          <button
            onClick={() => {
              setShowOriginDropdown(!showOriginDropdown)
              setShowStatusDropdown(false)
              setShowDestinationDropdown(false)
              setShowDriverDropdown(false)
            }}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 ${
              filters.origin
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white'
            }`}
          >
            <p className="text-sm font-medium leading-normal">
              {filters.origin || 'Origen'}
            </p>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
          {showOriginDropdown && (
            <div className="absolute z-40 mt-2 w-64 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              <div className="py-1">
                {getUniqueOrigins().map(origin => (
                  <button
                    key={origin}
                    onClick={() => {
                      handleFilterChange('origin', origin)
                      setShowOriginDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {origin}
                  </button>
                ))}
                {filters.origin && (
                  <button
                    onClick={() => {
                      clearFilter('origin')
                      setShowOriginDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filtro Destino */}
        <div className="relative filter-dropdown z-30">
          <button
            onClick={() => {
              setShowDestinationDropdown(!showDestinationDropdown)
              setShowStatusDropdown(false)
              setShowOriginDropdown(false)
              setShowDriverDropdown(false)
            }}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 ${
              filters.destination
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white'
            }`}
          >
            <p className="text-sm font-medium leading-normal">
              {filters.destination || 'Destino'}
            </p>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
          {showDestinationDropdown && (
            <div className="absolute z-40 mt-2 w-64 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              <div className="py-1">
                {getUniqueDestinations().map(destination => (
                  <button
                    key={destination}
                    onClick={() => {
                      handleFilterChange('destination', destination)
                      setShowDestinationDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {destination}
                  </button>
                ))}
                {filters.destination && (
                  <button
                    onClick={() => {
                      clearFilter('destination')
                      setShowDestinationDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filtro Motorizado */}
        <div className="relative filter-dropdown z-30">
          <button
            onClick={() => {
              setShowDriverDropdown(!showDriverDropdown)
              setShowStatusDropdown(false)
              setShowOriginDropdown(false)
              setShowDestinationDropdown(false)
            }}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 ${
              filters.driver
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white'
            }`}
          >
            <p className="text-sm font-medium leading-normal">
              {filters.driver || 'Motorizado'}
            </p>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
          {showDriverDropdown && (
            <div className="absolute z-40 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              <div className="py-1">
                {getUniqueDrivers().map(driver => (
                  <button
                    key={driver}
                    onClick={() => {
                      handleFilterChange('driver', driver)
                      setShowDriverDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {driver}
                  </button>
                ))}
                {filters.driver && (
                  <button
                    onClick={() => {
                      clearFilter('driver')
                      setShowDriverDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                  >
                    Limpiar filtro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botón limpiar todos los filtros */}
        {(filters.status || filters.origin || filters.destination || filters.driver || filters.date) && (
          <button
            onClick={clearAllFilters}
            className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-3 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
            <p className="text-sm font-medium leading-normal">Limpiar filtros</p>
          </button>
        )}
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
        <div className="relative z-10">
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
                {currentOrders.map((order) => {
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
      {!loading && !error && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 gap-4">
          {/* Selector de items por página */}
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

          {/* Info de paginación */}
          <div className="text-sm text-gray-700 dark:text-gray-400">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
            <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </div>

          {/* Controles de paginación */}
          <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            {/* Botón Anterior */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            {/* Números de página */}
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

            {/* Botón Siguiente */}
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
    </div>
  )
}

export default Orders
