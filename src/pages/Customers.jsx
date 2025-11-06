import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCustomers, searchCustomers } from '../services/userService'

function Customers() {
  const navigate = useNavigate()

  // Estados principales
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: ''
  })
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadCustomers()
  }, [])

  // Resetear a la primera página cuando cambia la búsqueda o items por página
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowStatusDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllCustomers()
      setCustomers(data)
    } catch (err) {
      setError('Error al cargar los clientes.')
      console.error('Error cargando clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === '') {
      loadCustomers()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const results = await searchCustomers(value)
      setCustomers(results)
    } catch (err) {
      setError('Error al buscar clientes.')
      console.error('Error buscando clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        label: 'Activo',
        className: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-500'
      },
      inactive: {
        label: 'Inactivo',
        className: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
      }
    }

    const config = statusConfig[status] || statusConfig.active
    return config
  }

  const getUniqueStatuses = () => {
    return [
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' }
    ]
  }

  // Aplicar filtros
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      // Filtro por estado
      if (filters.status && customer.status !== filters.status) {
        return false
      }

      return true
    })
  }

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
      status: ''
    })
    setCurrentPage(1)
  }

  // Obtener clientes filtrados y paginados
  const filteredCustomers = getFilteredCustomers()
  const totalItems = filteredCustomers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 md:px-10">
        <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">
          Gestión de Clientes
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
          Administra la información y el estado de tus clientes.
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 py-3 border-b border-gray-200/10 dark:border-white/10">
        <div className="flex-grow w-full md:w-auto">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full relative">
              <div className="text-gray-400 dark:text-gray-500 flex border-none bg-gray-100 dark:bg-white/5 items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-gray-100 dark:bg-white/5 h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pl-2 pr-10 text-base font-normal leading-normal"
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    loadCustomers()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/customers/create')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="truncate">Añadir Cliente</span>
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
            }}
            className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 ${
              filters.status
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white'
            }`}
          >
            <p className="text-sm font-medium leading-normal">
              {filters.status ? getStatusBadge(filters.status).label : 'Estado: Todos'}
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

        {/* Botón limpiar todos los filtros */}
        {filters.status && (
          <button
            onClick={clearAllFilters}
            className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-3 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
            <p className="text-sm font-medium leading-normal">Limpiar filtros</p>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Cargando clientes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
          <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={loadCustomers}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            Reintentar
          </button>
        </div>
      )}

      {/* Customers Table */}
      {!loading && !error && (
        <div className="relative z-10 px-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-background-dark divide-y divide-gray-200 dark:divide-gray-700">
                    {currentCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-5xl">group_off</span>
                            <p className="text-gray-500 dark:text-gray-400">
                              {searchTerm || filters.status
                                ? 'No se encontraron clientes con los filtros aplicados'
                                : 'No hay clientes registrados'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                            <div className="font-medium text-gray-900 dark:text-white">{customer.lastname}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {customer.company ? (
                              <>
                                <div className="font-medium text-gray-900 dark:text-white">{customer.company}</div>
                                {customer.ruc && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">RUC: {customer.ruc}</div>
                                )}
                              </>
                            ) : (
                              <div className="text-gray-500 dark:text-gray-400">N/A</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">{customer.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(customer.status).className}`}>
                              <span className={`size-1.5 rounded-full ${customer.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              {getStatusBadge(customer.status).label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => navigate(`/customers/${customer.id}/view`)}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Ver Detalles"
                              >
                                <span className="material-symbols-outlined text-xl">visibility</span>
                              </button>
                              <button
                                onClick={() => navigate(`/customers/${customer.id}/edit`)}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Editar"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button
                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title={customer.status === 'active' ? 'Desactivar' : 'Activar'}
                              >
                                <span className={`material-symbols-outlined text-xl ${customer.status === 'active' ? 'text-red-500' : 'text-green-500'}`}>
                                  {customer.status === 'active' ? 'toggle_off' : 'toggle_on'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> de{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default Customers
