import { useState, useCallback } from 'react'
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'

function DriverMap({ drivers = [], selectedDriver, onDriverSelect }) {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Estado para el mapa
  const [mapCenter, setMapCenter] = useState({ lat: -12.0464, lng: -77.0428 }) // Lima, Perú por defecto
  const [zoom, setZoom] = useState(13)

  // Función para manejar zoom in
  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + 1, 20))
  }, [])

  // Función para manejar zoom out
  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - 1, 1))
  }, [])

  // Función para centrar en la ubicación actual
  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setZoom(15)
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          alert('No se pudo obtener tu ubicación')
        }
      )
    } else {
      alert('Tu navegador no soporta geolocalización')
    }
  }, [])

  // Función para manejar click en un marcador
  const handleMarkerClick = useCallback((driver) => {
    if (onDriverSelect) {
      onDriverSelect(driver)
    }
    // Centrar el mapa en el motorizado seleccionado
    if (driver.location) {
      setMapCenter({
        lat: driver.location.lat,
        lng: driver.location.lng
      })
    }
  }, [onDriverSelect])

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId="driver-tracking-map"
          center={mapCenter}
          zoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={true}
          className="w-full h-full"
        >
          {/* Marcadores de motorizados */}
          {drivers.map((driver) => {
            // Si el motorizado no tiene ubicación, usar una ubicación mock cerca del centro
            const position = driver.location || {
              lat: mapCenter.lat + (Math.random() - 0.5) * 0.02,
              lng: mapCenter.lng + (Math.random() - 0.5) * 0.02
            }

            const isSelected = selectedDriver?.id === driver.id

            return (
              <AdvancedMarker
                key={driver.id}
                position={position}
                onClick={() => handleMarkerClick(driver)}
              >
                <div className="relative flex flex-col items-center group">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-3 hidden group-hover:block transition-all z-10">
                    <div className="bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 min-w-max">
                      <h4 className="font-bold">{driver.name}</h4>
                      <p className="text-gray-300">
                        {driver.status === 'active' ? 'Activo' : 'Inactivo'}
                      </p>
                      {driver.vehiculo?.placa && (
                        <p className="text-gray-400 text-xs mt-1">
                          {driver.vehiculo.placa}
                        </p>
                      )}
                    </div>
                    <div className="w-4 h-4 bg-gray-900 transform rotate-45 -mt-2 mx-auto"></div>
                  </div>

                  {/* Pin personalizado */}
                  <div
                    className={`rounded-full p-2 shadow-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary ring-4 ring-primary/30 scale-110'
                        : 'bg-primary/80 ring-2 ring-white dark:ring-background-dark hover:scale-105'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: isSelected ? '32px' : '24px' }}
                    >
                      two_wheeler
                    </span>
                  </div>
                </div>
              </AdvancedMarker>
            )
          })}
        </Map>
      </APIProvider>

      {/* Map Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-10">
        <div className="flex flex-col rounded-lg shadow-lg bg-white dark:bg-gray-800">
          <button
            onClick={handleZoomIn}
            className="flex size-12 items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
            title="Acercar"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
          <button
            onClick={handleZoomOut}
            className="flex size-12 items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
            title="Alejar"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
        </div>
        <button
          onClick={handleMyLocation}
          className="flex size-12 items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Mi ubicación"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>
    </div>
  )
}

export default DriverMap
