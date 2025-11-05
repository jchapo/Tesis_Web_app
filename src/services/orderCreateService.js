import { collection, doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { procesarEntrada } from '../utils/geocoding'

/**
 * Genera 6 dígitos aleatorios
 */
function generateRandomDigits() {
  return Math.floor(Math.random() * 900000 + 100000).toString()
}

/**
 * Formatea una fecha para crear el ID del documento
 */
function formatDocId(date) {
  const padToTwoDigits = (num) => num.toString().padStart(2, '0')

  const day = padToTwoDigits(date.getDate())
  const month = padToTwoDigits(date.getMonth() + 1)
  const year = date.getFullYear()
  const hours = padToTwoDigits(date.getHours())
  const minutes = padToTwoDigits(date.getMinutes())
  const seconds = padToTwoDigits(date.getSeconds())
  const randomId = generateRandomDigits()

  return `${day}-${month}-${year}-${hours}${minutes}${seconds}-${randomId}`
}

/**
 * Limpia y valida un número de teléfono
 */
function cleanAndValidatePhoneNumber(phoneNumber) {
  if (!phoneNumber) return '900000009'
  
  // Eliminar caracteres no visibles, espacios, guiones y el signo +
  let cleanedNumber = phoneNumber
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[\s-+]/g, '')
    .replace(/^51/, '') // Eliminar prefijo internacional de Perú

  if (/^\d{9}$/.test(cleanedNumber)) {
    return cleanedNumber
  } else {
    return '900000009'
  }
}

/**
 * Capitaliza un nombre (primera letra de cada palabra en mayúscula)
 */
function capitalizeName(name) {
  if (!name) return ''
  
  name = name.replace(/[.,]/g, '')
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Limpia un string eliminando caracteres especiales
 */
function cleanString(str) {
  if (!str) return ''
  
  return str
    .replace(/[^\p{L}\s]/gu, '')
    .trim()
}

/**
 * Calcula la comisión basada en el distrito y tamaño del paquete
 */
function calcularComision(distrito, esPaqueteGrande) {
  let comisionBase = 10
  
  if (['Carabayllo (Lima)', 'Ventanilla (Callao)', 'Puente Piedra (Lima)'].includes(distrito)) {
    comisionBase = 15
  } else if (['Comas (Lima)', 'Villa El Salvador (Lima)', 'Villa María del Triunfo (Lima)', 'Oquendo (Callao)', 'Santa Clara (Ate, Lima)'].includes(distrito)) {
    comisionBase = 13
  }
  
  return esPaqueteGrande ? comisionBase + 5 : comisionBase
}

/**
 * Determina el grupo de motorizado según el distrito
 */
function determinarGrupo(distrito) {
  const grupos = {
    NOR: ["Carabayllo (Lima)", "Comas (Lima)", "Independencia (Lima)", "Los Olivos (Lima)", "Puente Piedra (Lima)", "San Martín de Porres (Lima)", "Santa Rosa (Callao)", "Ventanilla (Callao)", "Mi Perú (Callao)", "Oquendo (Callao)"],
    SUR: ["San Borja (Lima)", "Barranco (Lima)", "Chorrillos (Lima)", "Lurín (Lima)", "San Juan de Miraflores (Lima)", "Surco (Lima)", "Surquillo (Lima)", "Villa El Salvador (Lima)", "Villa María del Triunfo (Lima)"],
    EST: ["La Molina (Lima)", "Ate (Lima)", "Chaclacayo (Lima)", "Huachipa (Ate, Lima)", "San Juan de Lurigancho (Lima)", "Santa Anita (Lima)", "Santa Clara (Ate, Lima)"],
    OES: ["Magdalena del Mar (Lima)", "Lince (Lima)", "Pueblo Libre (Lima)", "Bellavista (Callao)", "San Miguel (Lima)", "Callao (Callao)", "Carmen de la Legua (Callao)", "La Perla (Callao)", "La Punta (Callao)"],
    SJL: ["San Juan de Lurigancho (Lima)"]
  }

  for (const grupo in grupos) {
    if (grupos[grupo].includes(distrito)) {
      return grupo
    }
  }
  return null
}

/**
 * Crea un pedido en Firestore
 * @param {Object} formData - Datos del formulario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function createOrder(formData) {
  try {
    const now = new Date()
    const cutoffHour = 14
    
    // Crear fecha de entrega programada
    let fechaEntregaProgramada = new Date(formData.fechaEntrega)
    
    // Si el pedido se crea después de las 2pm y la entrega es para hoy, programar para mañana
    if (now.getHours() >= cutoffHour) {
      const entregaDate = new Date(formData.fechaEntrega)
      entregaDate.setHours(0, 0, 0, 0)
      const currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)
      
      if (entregaDate.getTime() <= currentDate.getTime()) {
        fechaEntregaProgramada.setDate(fechaEntregaProgramada.getDate() + 1)
      }
    }

    // Generar ID del documento
    const docId = formatDocId(now)
    
    // Procesar coordenadas
    const coordenadasProveedor = await procesarEntrada(formData.empresaDireccion)
    const coordenadasCliente = await procesarEntrada(formData.clienteDireccion)
    
    // Calcular comisión
    const esPaqueteGrande = formData.esPaqueteGrande === 'grande'
    const comision = calcularComision(formData.clienteDistrito, esPaqueteGrande)
    
    // Determinar grupos para asignación automática
    const grupoProveedor = determinarGrupo(formData.empresaDistrito)
    const grupoCliente = determinarGrupo(formData.clienteDistrito)
    
    const motorizadoRecojo = grupoProveedor ? grupoProveedor : "Asignar Recojo"
    const motorizadoEntrega = grupoCliente ? grupoCliente : "Asignar Entrega"
    
    // Calcular monto a cobrar
    const montoCobrar = formData.seCobrara === 'si' ? parseFloat(formData.montoCobrar || 0) : 0
    const montoTotal = montoCobrar + comision
    
    // Construir el objeto del pedido
    const orderData = {
      id: docId,
      
      asignacion: {
        recojo: {
          estado: "pendiente",
          rutaId: null,
          rutaNombre: motorizadoRecojo,
          motorizadoUid: null,
          motorizadoNombre: null,
          asignadaEn: null,
          razonPendiente: motorizadoRecojo === "Asignar Recojo" ? "Pendiente de asignación manual" : null
        },
        entrega: {
          estado: "pendiente",
          rutaId: null,
          rutaNombre: motorizadoEntrega,
          motorizadoUid: null,
          motorizadoNombre: null,
          asignadaEn: null,
          razonPendiente: motorizadoEntrega === "Asignar Entrega" ? "Pendiente de asignación manual" : null
        }
      },
      
      visibilidad: {
        motorizadoRecojo: false,
        motorizadoEntrega: false,
        administrador: true
      },
      
      cicloOperativo: {
        diaCreacion: Timestamp.fromDate(now),
        diaAsignado: null,
        cerradoPorAdmin: false,
        fechaCierreAdmin: null,
        horaLimiteRecojo: Timestamp.fromDate(fechaEntregaProgramada),
        permiteEntregaAntes13h: now.getHours() < cutoffHour
      },
      
      indices: {
        requiereAsignacionManual: true,
        motorizadoRecojoUid: null,
        motorizadoEntregaUid: null,
        rutaRecojoId: null,
        rutaEntregaId: null,
        distritoRecojo: formData.empresaDistrito,
        distritoEntrega: formData.clienteDistrito
      },
      
      proveedor: {
        uid: null,
        nombre: cleanString(formData.empresaNombre).toUpperCase(),
        correo: formData.empresaEmail || '',
        telefono: cleanAndValidatePhoneNumber(formData.empresaCelular),
        direccion: {
          link: formData.empresaDireccion || '',
          distrito: formData.empresaDistrito,
          coordenadas: {
            latitud: coordenadasProveedor.latitud,
            longitud: coordenadasProveedor.longitud
          }
        }
      },
      
      destinatario: {
        nombre: capitalizeName(cleanString(formData.clienteNombre)),
        telefono: cleanAndValidatePhoneNumber(formData.clienteCelular),
        direccion: {
          link: formData.clienteDireccion || '',
          distrito: formData.clienteDistrito,
          coordenadas: {
            latitud: coordenadasCliente.latitud,
            longitud: coordenadasCliente.longitud
          }
        }
      },
      
      paquete: {
        detalle: capitalizeName(formData.detalleEnvio || ''),
        observaciones: formData.observaciones || '',
        dimensiones: {
          alto: formData.dimensionesAlto ? parseFloat(formData.dimensionesAlto) : null,
          ancho: formData.dimensionesAncho ? parseFloat(formData.dimensionesAncho) : null,
          largo: formData.dimensionesLargo ? parseFloat(formData.dimensionesLargo) : null,
          volumen: formData.volumen ? parseFloat(formData.volumen) : null,
          peso: null,
          estimadoPorIA: formData.estimadoIA || false,
          editadoManualmente: false,
          excedeMaximo: esPaqueteGrande,
          confianzaIA: null
        },
        fotos: {
          recojo: {
            url: null,
            thumbnail: null,
            timestamp: null,
            procesadaPorIA: false
          },
          entrega: {
            url: null,
            thumbnail: null,
            timestamp: null
          },
          comprobantePago: {
            url: null,
            thumbnail: null,
            timestamp: null
          }
        }
      },
      
      pago: {
        seCobra: formData.seCobrara === 'si',
        metodoPago: formData.metodoPago || 'preguntar',
        monto: Math.round(montoCobrar * 100), // Convertir a centavos
        comision: Math.round(comision * 100), // Convertir a centavos
        montoTotal: Math.round(montoTotal * 100), // Convertir a centavos
        estadoPago: "pendiente",
        billeteraUsada: null
      },
      
      motorizado: null,
      
      fechas: {
        creacion: Timestamp.fromDate(now),
        entregaProgramada: Timestamp.fromDate(fechaEntregaProgramada),
        recojo: null,
        entrega: null,
        anulacion: null
      },
      
      actualizadoEn: Timestamp.fromDate(now),
      version: 1
    }

    // Guardar en Firestore
    const docRef = doc(db, 'pedidos', docId)
    await setDoc(docRef, orderData)

    return {
      success: true,
      orderId: docId,
      message: 'Pedido creado exitosamente'
    }
  } catch (error) {
    console.error('Error al crear pedido:', error)
    return {
      success: false,
      error: error.message,
      message: 'Error al crear el pedido'
    }
  }
}
