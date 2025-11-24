// services/ordersService.js
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Transforma un documento de Firestore al formato de la aplicación
 * @param {Object} docSnapshot - DocumentSnapshot de Firestore
 * @returns {Object} - Pedido transformado
 */
export const transformFirestoreDoc = (docSnapshot) => {
  if (!docSnapshot.exists()) return null
  
  const data = docSnapshot.data()
  const id = docSnapshot.id

  // Determinar el estado del pedido
  let status = 'pending'
  if (data.fechas?.entrega) {
    status = 'delivered'
  } else if (data.fechas?.anulacion) {
    status = 'cancelled'
  } else if (data.asignacion?.recojo?.estado === 'completada' ||
             data.asignacion?.entrega?.estado === 'en_camino') {
    status = 'in-progress'
  }

  // Formatear fecha sin hora
  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short'
    })
  }

  // Calcular dimensiones
  const dim = data.paquete?.dimensiones
  let dimensiones = '-'
  if (dim?.largo && dim?.ancho && dim?.alto) {
    dimensiones = `${dim.largo}x${dim.ancho}x${dim.alto}cm`
  }

  // Determinar motorizado
  let driver = 'Sin Asignar'
  if (data.asignacion?.entrega?.motorizadoNombre) {
    driver = data.asignacion.entrega.motorizadoNombre
  } else if (data.asignacion?.recojo?.motorizadoNombre) {
    driver = data.asignacion.recojo.motorizadoNombre
  }

  return {
    id: data.id || id,
    status,
    customer: data.proveedor?.nombre || '-',
    recipient: data.destinatario?.nombre || '-',
    pickupDistrict: data.proveedor?.direccion?.distrito || '-',
    deliveryDistrict: data.destinatario?.direccion?.distrito || '-',
    dimensions: dimensiones,
    //charge: data.pago?.seCobra ? `S/ ${(data.pago.monto / 100).toFixed(2)}` : '-',
    charge: data.pago?.seCobra ? `S/ ${(data.pago.monto).toFixed(2)}` : '-',
    driver,
    createdAt: formatDate(data.fechas?.creacion),
    scheduledDelivery: formatDate(data.fechas?.entregaProgramada),
    //amount: `S/ ${((data.pago?.montoTotal || 0) / 100).toFixed(2)}`,
    amount: `S/ ${((data.pago?.montoTotal || 0)).toFixed(2)}`,
    // Datos adicionales
    isClosed: data.cicloOperativo?.cerradoPorAdmin || false,
    closedAt: data.cicloOperativo?.fechaCierreAdmin || null,
    rawData: data
  }
}

/**
 * Obtiene pedidos ACTIVOS (no cerrados) - USAR ESTA EN LAS TABLAS
 * Esta es la función principal para mostrar pedidos en el dashboard
 * @returns {Promise<Array>} - Array de pedidos activos
 */
export const getActiveOrders = async () => {
  try {
    console.log('🔍 Obteniendo pedidos activos (no cerrados)...')
    const ordersRef = collection(db, 'pedidos')
    
    const q = query(
      ordersRef,
      where('cicloOperativo.cerradoPorAdmin', '==', false),
      orderBy('fechas.creacion', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const orders = []

    querySnapshot.forEach((docSnap) => {
      const order = transformFirestoreDoc(docSnap)
      if (order) {
        orders.push(order)
      }
    })

    console.log(`✅ Pedidos activos obtenidos: ${orders.length}`)
    return orders
    
  } catch (error) {
    console.error('❌ Error al obtener pedidos activos:', error)
    throw error
  }
}

/**
 * Obtiene TODOS los pedidos (incluyendo cerrados)
 * SOLO USAR PARA: Reportes históricos, análisis, exportaciones
 * @returns {Promise<Array>} - Array de todos los pedidos
 */
export const getAllOrders = async () => {
  try {
    console.log('🔍 Obteniendo TODOS los pedidos (incluyendo cerrados)...')
    const ordersRef = collection(db, 'pedidos')
    const q = query(ordersRef, orderBy('fechas.creacion', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const orders = []
    querySnapshot.forEach((docSnap) => {
      const order = transformFirestoreDoc(docSnap)
      if (order) {
        orders.push(order)
      }
    })

    console.log(`📊 Total pedidos (activos + cerrados): ${orders.length}`)
    return orders
    
  } catch (error) {
    console.error('❌ Error al obtener todos los pedidos:', error)
    throw error
  }
}

/**
 * Obtiene un pedido específico por su ID
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} - Pedido transformado
 */
export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, 'pedidos', orderId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Pedido no encontrado')
    }

    return transformFirestoreDoc(docSnap)
    
  } catch (error) {
    console.error('❌ Error al obtener pedido:', error)
    throw error
  }
}

/**
 * Obtiene pedidos ACTIVOS con filtros aplicados
 * @param {Object} filters - Filtros a aplicar
 * @param {string} filters.status - Estado del pedido
 * @param {string} filters.district - Distrito
 * @param {string} filters.driver - Motorizado
 * @param {boolean} filters.includeClosed - Si incluir cerrados (default: false)
 * @returns {Promise<Array>} - Array de pedidos filtrados
 */
export const getOrdersWithFilters = async (filters = {}) => {
  try {
    // Usar getActiveOrders() por defecto, a menos que se pida incluir cerrados
    const orders = filters.includeClosed 
      ? await getAllOrders() 
      : await getActiveOrders()
    
    let filteredOrders = [...orders]

    // Aplicar filtro de estado
    if (filters.status) {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status)
    }

    // Aplicar filtro de distrito
    if (filters.district) {
      filteredOrders = filteredOrders.filter(order =>
        order.pickupDistrict === filters.district ||
        order.deliveryDistrict === filters.district
      )
    }

    // Aplicar filtro de motorizado
    if (filters.driver) {
      filteredOrders = filteredOrders.filter(order => order.driver === filters.driver)
    }

    return filteredOrders
    
  } catch (error) {
    console.error('❌ Error al obtener pedidos con filtros:', error)
    throw error
  }
}

/**
 * Busca pedidos ACTIVOS por término de búsqueda
 * @param {string} searchTerm - Término a buscar
 * @param {boolean} includeClosed - Si incluir cerrados en la búsqueda (default: false)
 * @returns {Promise<Array>} - Array de pedidos que coinciden
 */
export const searchOrders = async (searchTerm, includeClosed = false) => {
  try {
    // Por defecto busca solo en activos
    const orders = includeClosed 
      ? await getAllOrders() 
      : await getActiveOrders()

    if (!searchTerm || searchTerm.trim() === '') {
      return orders
    }

    const term = searchTerm.toLowerCase()
    
    return orders.filter(order =>
      order.id.toLowerCase().includes(term) ||
      order.customer.toLowerCase().includes(term) ||
      order.recipient.toLowerCase().includes(term) ||
      order.pickupDistrict.toLowerCase().includes(term) ||
      order.deliveryDistrict.toLowerCase().includes(term)
    )
    
  } catch (error) {
    console.error('❌ Error al buscar pedidos:', error)
    throw error
  }
}

/**
 * Obtiene pedidos pendientes de asignación (no cerrados)
 * @returns {Promise<Array>} - Array de pedidos pendientes
 */
export const getPendingOrders = async () => {
  try {
    const ordersRef = collection(db, 'pedidos')
    
    const q = query(
      ordersRef,
      where('asignacion.recojo.estado', '==', 'pendiente'),
      where('cicloOperativo.cerradoPorAdmin', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    const orders = []
    
    querySnapshot.forEach((docSnap) => {
      const order = transformFirestoreDoc(docSnap)
      if (order) orders.push(order)
    })
    
    console.log(`📋 Pedidos pendientes: ${orders.length}`)
    return orders
    
  } catch (error) {
    console.error('❌ Error al obtener pedidos pendientes:', error)
    throw error
  }
}

/**
 * Obtiene pedidos de una ruta específica (no cerrados)
 * @param {string} rutaId - ID de la ruta
 * @param {string} tipo - 'recojo' o 'entrega'
 * @returns {Promise<Array>} - Array de pedidos de la ruta
 */
export const getOrdersByRoute = async (rutaId, tipo = 'recojo') => {
  try {
    const ordersRef = collection(db, 'pedidos')
    
    const field = tipo === 'recojo' 
      ? 'asignacion.recojo.rutaId' 
      : 'asignacion.entrega.rutaId'
    
    const q = query(
      ordersRef,
      where(field, '==', rutaId),
      where('cicloOperativo.cerradoPorAdmin', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    const orders = []
    
    querySnapshot.forEach((docSnap) => {
      const order = transformFirestoreDoc(docSnap)
      if (order) orders.push(order)
    })
    
    console.log(`🚚 Pedidos en ruta ${rutaId}: ${orders.length}`)
    return orders
    
  } catch (error) {
    console.error(`❌ Error al obtener pedidos de ruta ${rutaId}:`, error)
    throw error
  }
}

/**
 * Obtiene pedidos por motorizado (no cerrados)
 * @param {string} motorizadoUid - UID del motorizado
 * @param {string} tipo - 'recojo' o 'entrega'
 * @returns {Promise<Array>} - Array de pedidos del motorizado
 */
export const getOrdersByDriver = async (motorizadoUid, tipo = 'recojo') => {
  try {
    const ordersRef = collection(db, 'pedidos')
    
    const field = tipo === 'recojo'
      ? 'asignacion.recojo.motorizadoUid'
      : 'asignacion.entrega.motorizadoUid'
    
    const q = query(
      ordersRef,
      where(field, '==', motorizadoUid),
      where('cicloOperativo.cerradoPorAdmin', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    const orders = []
    
    querySnapshot.forEach((docSnap) => {
      const order = transformFirestoreDoc(docSnap)
      if (order) orders.push(order)
    })
    
    console.log(`👤 Pedidos del motorizado: ${orders.length}`)
    return orders
    
  } catch (error) {
    console.error('❌ Error al obtener pedidos del motorizado:', error)
    throw error
  }
}

/**
 * Obtiene estadísticas de pedidos activos
 * @returns {Promise<Object>} - Objeto con estadísticas
 */
export const getOrderStats = async () => {
  try {
    const orders = await getActiveOrders()
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      inProgress: orders.filter(o => o.status === 'in-progress').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalAmount: orders.reduce((sum, o) => {
        const amount = parseFloat(o.amount.replace('S/ ', ''))
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
    }
    
    console.log('📊 Estadísticas de pedidos:', stats)
    return stats
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    throw error
  }
}

/**
 * Obtiene pedidos por rango de fechas (no cerrados)
 * @param {Date} startDate - Fecha inicial
 * @param {Date} endDate - Fecha final
 * @returns {Promise<Array>} - Array de pedidos en el rango
 */
export const getOrdersByDateRange = async (startDate, endDate) => {
  try {
    const ordersRef = collection(db, 'pedidos')

    const q = query(
      ordersRef,
      where('fechas.creacion', '>=', startDate),
      where('fechas.creacion', '<=', endDate),
      where('cicloOperativo.cerradoPorAdmin', '==', false),
      orderBy('fechas.creacion', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const orders = []

    querySnapshot.forEach((docSnap) => {
      const order = transformFirestoreDoc(docSnap)
      if (order) orders.push(order)
    })

    console.log(`📅 Pedidos en rango de fechas: ${orders.length}`)
    return orders

  } catch (error) {
    console.error('❌ Error al obtener pedidos por rango de fechas:', error)
    throw error
  }
}

/**
 * Asigna un motorizado a un pedido
 * @param {string} orderId - ID del pedido
 * @param {Object} driverData - Datos del motorizado
 * @param {string} driverData.id - UID del motorizado
 * @param {string} driverData.name - Nombre completo del motorizado
 * @param {string} driverData.rawData.ruta - Ruta del motorizado
 * @param {string} tipo - Tipo de asignación: 'recojo' o 'entrega' (default: 'recojo')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const assignDriverToOrder = async (orderId, driverData, tipo = 'recojo') => {
  try {
    const { updateDoc, doc, serverTimestamp, getDoc } = await import('firebase/firestore')

    console.log(`🚚 Asignando motorizado ${driverData.name} al pedido ${orderId} (${tipo})`)

    const orderRef = doc(db, 'pedidos', orderId)

    // Primero verificar que el pedido existe
    const orderSnap = await getDoc(orderRef)
    if (!orderSnap.exists()) {
      throw new Error('Pedido no encontrado')
    }

    const currentData = orderSnap.data()

    // Preparar los datos de actualización
    const updateData = {
      actualizadoEn: serverTimestamp()
    }

    // Actualizar según el tipo (recojo o entrega)
    if (tipo === 'recojo') {
      updateData['asignacion.recojo.motorizadoUid'] = driverData.id
      updateData['asignacion.recojo.motorizadoNombre'] = driverData.name
      updateData['asignacion.recojo.estado'] = 'asignado'
      updateData['asignacion.recojo.asignadaEn'] = serverTimestamp()
      updateData['asignacion.recojo.rutaNombre'] = driverData.rawData?.ruta || currentData.asignacion?.recojo?.rutaNombre || null
      updateData['asignacion.recojo.rutaId'] = currentData.asignacion?.recojo?.rutaId || null
      updateData['asignacion.recojo.razonPendiente'] = null

      // Actualizar índices para búsquedas
      updateData['indices.motorizadoRecojoUid'] = driverData.id

      // Actualizar visibilidad
      updateData['visibilidad.motorizadoRecojo'] = true
    } else {
      updateData['asignacion.entrega.motorizadoUid'] = driverData.id
      updateData['asignacion.entrega.motorizadoNombre'] = driverData.name
      updateData['asignacion.entrega.estado'] = 'asignado'
      updateData['asignacion.entrega.asignadaEn'] = serverTimestamp()
      updateData['asignacion.entrega.rutaNombre'] = driverData.rawData?.ruta || currentData.asignacion?.entrega?.rutaNombre || null
      updateData['asignacion.entrega.rutaId'] = currentData.asignacion?.entrega?.rutaId || null
      updateData['asignacion.entrega.razonPendiente'] = null

      // Actualizar índices para búsquedas
      updateData['indices.motorizadoEntregaUid'] = driverData.id

      // Actualizar visibilidad
      updateData['visibilidad.motorizadoEntrega'] = true
    }

    // Actualizar el documento
    await updateDoc(orderRef, updateData)

    console.log(`✅ Motorizado asignado exitosamente`)

    return {
      success: true,
      message: `Motorizado ${driverData.name} asignado exitosamente`
    }

  } catch (error) {
    console.error('❌ Error al asignar motorizado:', error)

    let errorMessage = 'Error al asignar motorizado'
    if (error.code === 'permission-denied') {
      errorMessage = 'No tienes permisos para asignar motorizados'
    } else if (error.message === 'Pedido no encontrado') {
      errorMessage = 'El pedido no existe'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage
    }
  }
}