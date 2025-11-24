import { useState, useEffect } from 'react'
import { getAllDrivers } from '../services/userService'

function DriverAssignmentModal({ isOpen, onClose, onAssign, currentDriver, isAssigning = false }) {
  const [drivers, setDrivers] = useState([])
  const [filteredDrivers, setFilteredDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriver, setSelectedDriver] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadDrivers()
    }
  }, [isOpen])

  useEffect(() => {
    filterDrivers()
  }, [searchTerm, drivers])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      setError(null)
      const allDrivers = await getAllDrivers()

      // Filtrar solo motorizados activos con rol motorizado
      const activeDrivers = allDrivers.filter(
        driver => driver.status === 'active' && driver.rawData?.rol === 'motorizado'
      )

      setDrivers(activeDrivers)
      setFilteredDrivers(activeDrivers)
    } catch (err) {
      setError('Error al cargar motorizados')
      console.error('Error cargando motorizados:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterDrivers = () => {
    if (!searchTerm.trim()) {
      setFilteredDrivers(drivers)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = drivers.filter(driver =>
      driver.name.toLowerCase().includes(term) ||
      driver.email.toLowerCase().includes(term) ||
      (driver.rawData?.telefono && driver.rawData.telefono.includes(term)) ||
      (driver.rawData?.licencia && driver.rawData.licencia.toLowerCase().includes(term)) ||
      (driver.rawData?.ruta && driver.rawData.ruta.toLowerCase().includes(term)) ||
      (driver.rawData?.detalleRuta && driver.rawData.detalleRuta.toLowerCase().includes(term))
    )
    setFilteredDrivers(filtered)
  }

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign(selectedDriver)
      handleClose()
    }
  }

  const handleClose = () => {
    setSearchTerm('')
    setSelectedDriver(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Asignar Motorizado
            </h2>
            {currentDriver && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Actual: {currentDriver}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, licencia, ruta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={loadDrivers}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Reintentar
              </button>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl mb-4">
                person_off
              </span>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No se encontraron motorizados' : 'No hay motorizados activos disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDriver?.id === driver.id
                      ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg scale-[1.02]'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 dark:hover:border-primary/50 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar con icono de moto */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      selectedDriver?.id === driver.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      <span className="material-symbols-outlined text-2xl">
                        two_wheeler
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Nombre */}
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base font-bold truncate ${
                          selectedDriver?.id === driver.id
                            ? 'text-primary'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {driver.name}
                        </h3>
                        {selectedDriver?.id === driver.id && (
                          <span className="material-symbols-outlined text-primary text-lg animate-pulse">
                            check_circle
                          </span>
                        )}
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                        {/* Ruta */}
                        {driver.rawData?.ruta && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-gray-400 text-base">
                              route
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 truncate">
                              {driver.rawData.ruta}
                              {driver.rawData.detalleRuta && ` - ${driver.rawData.detalleRuta}`}
                            </span>
                          </div>
                        )}

                        {/* Teléfono */}
                        {driver.phone && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-gray-400 text-base">
                              phone
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 truncate">
                              {driver.phone}
                            </span>
                          </div>
                        )}

                        {/* Licencia */}
                        {driver.rawData?.licencia && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-gray-400 text-base">
                              badge
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 truncate">
                              {driver.rawData.licencia}
                            </span>
                          </div>
                        )}

                        {/* Vehículo */}
                        {driver.rawData?.vehiculo?.placa && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-gray-400 text-base">
                              directions_car
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 truncate">
                              {driver.rawData.vehiculo.placa}
                              {driver.rawData.vehiculo.modelo && ` - ${driver.rawData.vehiculo.modelo}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredDrivers.length} motorizado{filteredDrivers.length !== 1 ? 's' : ''} disponible{filteredDrivers.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedDriver || isAssigning}
              className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
                selectedDriver && !isAssigning
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAssigning ? 'Asignando...' : 'Asignar Motorizado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverAssignmentModal
