/**
 * Extrae el valor de un campo de Firestore según su tipo
 * @param {Object} field - Campo de Firestore con su tipo
 * @returns {any} - Valor extraído
 */
export const extractFirestoreValue = (field) => {
  if (!field) return null

  if (field.stringValue !== undefined) return field.stringValue
  if (field.integerValue !== undefined) return parseInt(field.integerValue)
  if (field.doubleValue !== undefined) return field.doubleValue
  if (field.booleanValue !== undefined) return field.booleanValue
  if (field.timestampValue !== undefined) return new Date(field.timestampValue)
  if (field.nullValue !== undefined) return null
  if (field.mapValue) return extractMapValue(field.mapValue)
  if (field.arrayValue) return extractArrayValue(field.arrayValue)

  return null
}

/**
 * Extrae valores de un mapValue (objeto)
 * @param {Object} mapValue - MapValue de Firestore
 * @returns {Object} - Objeto con valores extraídos
 */
export const extractMapValue = (mapValue) => {
  if (!mapValue || !mapValue.fields) return {}

  const result = {}
  for (const [key, value] of Object.entries(mapValue.fields)) {
    result[key] = extractFirestoreValue(value)
  }
  return result
}

/**
 * Extrae valores de un arrayValue
 * @param {Object} arrayValue - ArrayValue de Firestore
 * @returns {Array} - Array con valores extraídos
 */
export const extractArrayValue = (arrayValue) => {
  if (!arrayValue || !arrayValue.values) return []
  return arrayValue.values.map(extractFirestoreValue)
}

/**
 * Transforma un documento de pedido de Firestore REST API al formato de la aplicación
 * @param {Object} firestoreDoc - Documento de Firestore desde REST API
 * @returns {Object} - Pedido transformado
 */
export const transformFirestoreOrder = (firestoreDoc) => {
  if (!firestoreDoc || !firestoreDoc.fields) return null

  const fields = extractMapValue({ fields: firestoreDoc.fields })

  // Determinar el estado del pedido
  let status = 'pending'
  if (fields.fechas?.entrega) {
    status = 'delivered'
  } else if (fields.fechas?.anulacion) {
    status = 'cancelled'
  } else if (fields.asignacion?.recojo?.estado === 'completada' ||
             fields.asignacion?.entrega?.estado === 'en_camino') {
    status = 'in-progress'
  }

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calcular dimensiones
  const dim = fields.paquete?.dimensiones
  let dimensiones = '-'
  if (dim?.largo && dim?.ancho && dim?.alto) {
    dimensiones = `${dim.largo}x${dim.ancho}x${dim.alto}cm`
  }

  // Determinar motorizado
  let driver = 'Sin Asignar'
  if (fields.asignacion?.entrega?.motorizadoNombre) {
    driver = fields.asignacion.entrega.motorizadoNombre
  } else if (fields.asignacion?.recojo?.motorizadoNombre) {
    driver = fields.asignacion.recojo.motorizadoNombre
  }

  return {
    id: fields.id || firestoreDoc.name?.split('/').pop(),
    status,
    customer: fields.proveedor?.nombre || '-',
    recipient: fields.destinatario?.nombre || '-',
    pickupDistrict: fields.proveedor?.direccion?.distrito || '-',
    deliveryDistrict: fields.destinatario?.direccion?.distrito || '-',
    dimensions: dimensiones,
    charge: fields.pago?.seCobra ? `S/ ${(fields.pago.monto / 100).toFixed(2)}` : '-',
    driver,
    createdAt: formatDate(fields.fechas?.creacion),
    scheduledDelivery: formatDate(fields.fechas?.entregaProgramada),
    amount: `S/ ${((fields.pago?.montoTotal || 0) / 100).toFixed(2)}`,
    // Datos adicionales para la vista de detalles
    rawData: fields
  }
}

/**
 * Transforma datos de pedido para la vista detallada
 * @param {Object} fields - Campos del pedido transformados
 * @returns {Object} - Datos formateados para OrderView
 */
export const transformOrderForView = (fields) => {
  if (!fields) return null

  // Función helper para convertir timestamps
  const toDate = (timestamp) => {
    if (!timestamp) return null
    if (timestamp.toDate) return timestamp.toDate()
    if (timestamp instanceof Date) return timestamp
    return new Date(timestamp)
  }

  // Determinar el estado actual
  let currentStatus = 'Pendiente'
  let statusColor = 'text-yellow-500'

  if (fields.fechas?.entrega) {
    currentStatus = 'Entregado'
    statusColor = 'text-green-500'
  } else if (fields.fechas?.anulacion) {
    currentStatus = 'Cancelado'
    statusColor = 'text-red-500'
  } else if (fields.asignacion?.entrega?.estado === 'en_camino') {
    currentStatus = 'En Camino'
    statusColor = 'text-blue-500'
  } else if (fields.asignacion?.recojo?.estado === 'completada') {
    currentStatus = 'Recogido'
    statusColor = 'text-blue-500'
  } else if (fields.asignacion?.recojo?.estado === 'asignada') {
    currentStatus = 'Asignado para Recojo'
    statusColor = 'text-yellow-500'
  }

  // Construir timeline
  const timeline = [
    {
      status: 'Creado',
      date: toDate(fields.fechas?.creacion)?.toLocaleString('es-PE') || '-',
      completed: true,
      icon: 'check'
    },
    {
      status: 'Asignado',
      date: toDate(fields.asignacion?.recojo?.asignadaEn)?.toLocaleString('es-PE') || 'Pendiente',
      completed: !!fields.asignacion?.recojo?.asignadaEn,
      icon: 'check',
      current: fields.asignacion?.recojo?.estado === 'asignada' && !fields.fechas?.recojo
    },
    {
      status: 'En camino',
      date: toDate(fields.fechas?.recojo)?.toLocaleString('es-PE') || 'Pendiente',
      completed: !!fields.fechas?.recojo,
      icon: 'local_shipping',
      current: !!fields.fechas?.recojo && !fields.fechas?.entrega
    },
    {
      status: 'Entregado',
      date: toDate(fields.fechas?.entrega)?.toLocaleString('es-PE') || 'Pendiente',
      completed: !!fields.fechas?.entrega,
      icon: 'inventory_2'
    }
  ]

  const dim = fields.paquete?.dimensiones
  const dimensionesStr = (dim?.largo && dim?.ancho && dim?.alto)
    ? `${dim.largo}cm x ${dim.ancho}cm x ${dim.alto}cm`
    : 'No especificado'

  return {
    id: fields.id,
    status: currentStatus,
    statusColor,
    sender: {
      name: fields.proveedor?.nombre || '-',
      phone: fields.proveedor?.telefono || '-',
      address: `${fields.proveedor?.direccion?.link || ''}, ${fields.proveedor?.direccion?.distrito || ''}`
    },
    recipient: {
      name: fields.destinatario?.nombre || '-',
      phone: fields.destinatario?.telefono || '-',
      address: `${fields.destinatario?.direccion?.link || ''}, ${fields.destinatario?.direccion?.distrito || ''}`
    },
    package: {
      dimensions: dimensionesStr,
      weight: dim?.peso ? `${dim.peso} kg` : 'No especificado',
      volume: dim?.volumen ? `${dim.volumen} m³` : 'No especificado',
      content: fields.paquete?.detalle || 'No especificado'
    },
    driver: fields.asignacion?.entrega?.motorizadoNombre || fields.asignacion?.recojo?.motorizadoNombre
      ? {
          name: fields.asignacion.entrega?.motorizadoNombre || fields.asignacion.recojo?.motorizadoNombre || '-',
          vehicle: 'Moto',
          rating: '5.0',
          reviews: '0',
          avatar: 'https://via.placeholder.com/150'
        }
      : null,
    costs: {
      total: `S/ ${((fields.pago?.montoTotal || 0) ).toFixed(2)}`,
      commission: `S/ ${((fields.pago?.comision || 0) ).toFixed(2)}`,
      clientAmount: `S/ ${((fields.pago?.monto || 0) ).toFixed(2)}`
    },
    timeline,
    photos: {
      pickup: fields.paquete?.fotos?.recojo?.url || null,
      delivery: fields.paquete?.fotos?.entrega?.url || null
    }
  }
}
