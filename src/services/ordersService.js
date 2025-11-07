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
//  console.log('Firestore SDK data:', JSON.stringify(data, null, 2))
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
    charge: data.pago?.seCobra ? `S/ ${(data.pago.monto / 100).toFixed(2)}` : '-',
    driver,
    createdAt: formatDate(data.fechas?.creacion),
    scheduledDelivery: formatDate(data.fechas?.entregaProgramada),
    amount: `S/ ${((data.pago?.montoTotal || 0) / 100).toFixed(2)}`,
    // Datos adicionales para la vista de detalles
    rawData: data
  }
}

/**
 * Obtiene todos los pedidos de la colección 'pedidos'
 * @returns {Promise<Array>} - Array de pedidos transformados
 */
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'pedidos')
    const q = query(ordersRef, orderBy('fechas.creacion', 'desc'))
    const querySnapshot = await getDocs(q)

    const orders = []
    querySnapshot.forEach((doc) => {
      const order = transformFirestoreDoc(doc)
      if (order) {
        orders.push(order)
      }
    })

    return orders
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
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
    console.error('Error al obtener pedido:', error)
    throw error
  }
}

/**
 * Obtiene pedidos con filtros aplicados
 * @param {Object} filters - Filtros a aplicar
 * @param {string} filters.status - Estado del pedido
 * @param {string} filters.district - Distrito
 * @param {string} filters.driver - Motorizado
 * @returns {Promise<Array>} - Array de pedidos filtrados
 */
export const getOrdersWithFilters = async (filters = {}) => {
  try {
    const orders = await getAllOrders()

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
    console.error('Error al obtener pedidos con filtros:', error)
    throw error
  }
}

/**
 * Busca pedidos por término de búsqueda
 * @param {string} searchTerm - Término a buscar
 * @returns {Promise<Array>} - Array de pedidos que coinciden
 */
export const searchOrders = async (searchTerm) => {
  try {
    const orders = await getAllOrders()

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
    console.error('Error al buscar pedidos:', error)
    throw error
  }
}
