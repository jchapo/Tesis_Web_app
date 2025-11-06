/**
 * Utilidades para geocodificación y extracción de coordenadas
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY

// Coordenadas por defecto (Lima, Perú)
const DEFAULT_COORDS = {
  latitud: -12.080772,
  longitud: -76.980565
}

/**
 * Verifica si el texto es una URL
 */
function esURL(texto) {
  if (!texto) return false
  
  const textoStr = String(texto).trim()
  
  if (textoStr.startsWith('http://') || textoStr.startsWith('https://') || textoStr.startsWith('www.')) {
    return true
  }
  
  const dominiosComunes = ['.com', '.org', '.net', '.gob', '.edu', '.pe', '.maps']
  return dominiosComunes.some(dominio => textoStr.includes(dominio))
}

/**
 * Extrae coordenadas de una URL de Google Maps
 */
function extraerCoordenadasURL(url) {
  if (!url) return null
  
  const decodedUrl = decodeURIComponent(url)
  
  // Método 1: Buscar el patrón @latitud,longitud
  const regexAt = /@(-1[1-2]\.\d+),(-7[6-7]\.\d+)/
  const matchAt = decodedUrl.match(regexAt)
  if (matchAt) {
    return {
      latitud: parseFloat(matchAt[1]),
      longitud: parseFloat(matchAt[2])
    }
  }
  
  // Método 2: Parámetros de consulta
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    
    if (params.has('q')) {
      const coords = params.get('q').split(',')
      if (coords.length === 2) {
        const lat = parseFloat(coords[0])
        const lng = parseFloat(coords[1])
        if (lat >= -12.999999 && lat <= -11.000000 && lng >= -77.999999 && lng <= -76.000000) {
          return {
            latitud: lat,
            longitud: lng
          }
        }
      }
    }
  } catch (e) {
    // Continuar con otros métodos
  }
  
  // Método 3: Buscar coordenadas en cualquier parte
  const regexLat = /(-1[1-2]\.\d+)/g
  const regexLng = /(-7[6-7]\.\d+)/g
  
  const latMatches = [...decodedUrl.matchAll(regexLat)].map(m => m[1])
  const lngMatches = [...decodedUrl.matchAll(regexLng)].map(m => m[1])
  
  if (latMatches.length > 0 && lngMatches.length > 0) {
    for (const lat of latMatches) {
      for (const lng of lngMatches) {
        const latFloat = parseFloat(lat)
        const lngFloat = parseFloat(lng)
        if (latFloat >= -12.999999 && latFloat <= -11.000000 && 
            lngFloat >= -77.999999 && lngFloat <= -76.000000) {
          return {
            latitud: latFloat,
            longitud: lngFloat
          }
        }
      }
    }
  }
  
  // Método 4: Fragmentos específicos (!3d y !4d)
  const lat3dMatch = decodedUrl.match(/!3d(-1[1-2]\.\d+)/)
  const lng4dMatch = decodedUrl.match(/!4d(-7[6-7]\.\d+)/)
  
  if (lat3dMatch && lng4dMatch) {
    return {
      latitud: parseFloat(lat3dMatch[1]),
      longitud: parseFloat(lng4dMatch[1])
    }
  }
  
  return null
}

/**
 * Extrae nombre de lugar de una URL de Google Maps
 */
function extraerNombreLugar(url) {
  if (!url) return null
  
  const decodedUrl = decodeURIComponent(url)
  
  // Formato /place/NOMBRE/
  const placeMatch = decodedUrl.match(/\/place\/(.*?)(\/data=|\/\@|$)/)
  if (placeMatch) {
    let lugar = placeMatch[1]
    lugar = lugar.replace(/\+/g, ' ').replace(/%20/g, ' ').replace(/%2C/g, ',')
    return lugar
  }
  
  // Formato /maps?q=
  const mapsMatch = decodedUrl.match(/\/maps\?q=(.*?)(&|$)/)
  if (mapsMatch) {
    let lugar = mapsMatch[1]
    lugar = lugar.replace(/\+/g, ' ').replace(/%20/g, ' ').replace(/%2C/g, ',')
    return lugar
  }
  
  return null
}

/**
 * Obtiene coordenadas usando la API de Geocoding de Google
 */
async function obtenerCoordenadasGeocoding(direccion) {
  if (!direccion) return null
  
  try {
    let direccionCompleta = direccion
    
    // Añadir contexto "Lima, Perú" si no está especificado
    if (!direccion.toLowerCase().includes('lima') && 
        !direccion.toLowerCase().includes('perú') && 
        !direccion.toLowerCase().includes('peru')) {
      direccionCompleta += ', Lima, Perú'
    }
    
    const direccionCodificada = encodeURIComponent(direccionCompleta)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${direccionCodificada}&key=${GOOGLE_MAPS_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === 'OK' && data.results.length > 0) {
      const lat = data.results[0].geometry.location.lat
      const lng = data.results[0].geometry.location.lng
      
      // Verificar que las coordenadas estén en el rango de Lima
      if (lat >= -12.999999 && lat <= -11.000000 && lng >= -77.999999 && lng <= -76.000000) {
        return {
          latitud: lat,
          longitud: lng
        }
      }
    }
    
    console.warn('Geocoding API no devolvió resultados válidos:', data.status)
    return null
  } catch (error) {
    console.error('Error al consultar Geocoding API:', error)
    return null
  }
}

/**
 * Obtiene coordenadas desde una URL (intentando varios métodos)
 */
async function obtenerCoordenadasDesdeURL(url) {
  if (!url) return null
  
  // Intentar extraer coordenadas directamente de la URL
  let coords = extraerCoordenadasURL(url)
  if (coords) {
    return coords
  }
  
  // Si no se encontraron coordenadas, intentar extraer el nombre del lugar
  const lugar = extraerNombreLugar(url)
  if (lugar) {
    coords = await obtenerCoordenadasGeocoding(lugar)
    if (coords) {
      return coords
    }
  }
  
  return null
}

/**
 * Procesa una entrada (URL o dirección) y devuelve coordenadas
 * @param {string} entrada - URL de Google Maps o dirección de texto
 * @returns {Promise<Object>} - Objeto con latitud y longitud
 */
export async function procesarEntrada(entrada) {
  if (!entrada || entrada.trim() === '') {
    return DEFAULT_COORDS
  }
  
  let coordenadas
  
  if (esURL(entrada)) {
    coordenadas = await obtenerCoordenadasDesdeURL(entrada)
  } else {
    coordenadas = await obtenerCoordenadasGeocoding(entrada)
  }
  
  // Si no se pudieron obtener coordenadas, devolver coordenadas por defecto
  if (!coordenadas || coordenadas.latitud == null || coordenadas.longitud == null) {
    return DEFAULT_COORDS
  }
  
  return coordenadas
}
