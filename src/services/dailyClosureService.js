// services/dailyClosureService.js
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { transformFirestoreDoc } from './ordersService.js'

/**
 * Obtiene pedidos ENTREGADOS o ANULADOS que aún NO están CERRADOS
 * (sin importar cuándo fueron creados o entregados)
 */
export const getDailyClosing = async () => {
  try {
    console.log("🔎 Ejecutando cierre diario...")
    const ordersRef = collection(db, 'pedidos')
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    console.log("📅 Buscando pedidos terminados (entregados/anulados) pero NO cerrados")
    
    // PEDIDOS ENTREGADOS pero NO CERRADOS
    const qEntregados = query(
      ordersRef,
      where('fechas.entrega', '!=', null),              // Tiene fecha de entrega
      where('fechas.entrega', '<=', today),             // Entregado hasta hoy
      where('cicloOperativo.cerradoPorAdmin', '==', false) // NO está cerrado
    )
    
    console.log("📌 Consultando pedidos entregados no cerrados...")
    const entregadosSnapshot = await getDocs(qEntregados)
    console.log(`📦 Pedidos entregados sin cerrar: ${entregadosSnapshot.size}`)
    
    let orders = []
    entregadosSnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      console.log(`📥 ID: ${docSnap.id} | Creación: ${data.fechas?.creacion?.toDate?.().toLocaleDateString()} | Entrega: ${data.fechas?.entrega?.toDate?.().toLocaleDateString()}`)
      
      const order = transformFirestoreDoc(docSnap)
      if (order) orders.push(order)
    })
    
    // PEDIDOS ANULADOS pero NO CERRADOS
    const qAnulados = query(
      ordersRef,
      where('fechas.anulacion', '!=', null),            // Tiene fecha de anulación
      where('fechas.anulacion', '<=', today),           // Anulado hasta hoy
      where('cicloOperativo.cerradoPorAdmin', '==', false) // NO está cerrado
    )
    
    console.log("📌 Consultando pedidos anulados no cerrados...")
    const anuladosSnapshot = await getDocs(qAnulados)
    console.log(`🚫 Pedidos anulados sin cerrar: ${anuladosSnapshot.size}`)
    
    anuladosSnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      console.log(`📥 ID: ${docSnap.id} | Creación: ${data.fechas?.creacion?.toDate?.().toLocaleDateString()} | Anulación: ${data.fechas?.anulacion?.toDate?.().toLocaleDateString()}`)
      
      const order = transformFirestoreDoc(docSnap)
      // Evitar duplicados (aunque un pedido no debería tener ambas fechas)
      if (order && !orders.find(o => o.id === order.id)) {
        orders.push(order)
      }
    })
    
    console.log("✅ TOTAL pedidos para cierre diario:", orders.length)
    console.log("📋 Resumen:")
    console.table(orders.map(o => ({
      id: o.id,
      creacion: o.fechas?.creacion,
      entrega: o.fechas?.entrega || 'N/A',
      anulacion: o.fechas?.anulacion || 'N/A',
      monto: o.pago?.montoTotal
    })))
    
    return orders
    
  } catch (error) {
    console.error('❌ Error al obtener cierre diario:', error)
    throw error
  }
}

/**
 * CIERRA los pedidos después de procesarlos en el cierre diario
 * Esto significa que ya fueron liquidados y no deben aparecer más
 */
export const closeOrders = async (orderIds) => {
  if (!orderIds || orderIds.length === 0) {
    console.log("⚠️ No hay pedidos para cerrar")
    return
  }

  try {
    const batch = writeBatch(db)
    const now = new Date()
    
    console.log(`🔒 Cerrando ${orderIds.length} pedidos...`)
    
    orderIds.forEach(id => {
      const orderRef = doc(db, 'pedidos', id)
      batch.update(orderRef, {
        'cicloOperativo.cerradoPorAdmin': true,     // Marcado como CERRADO
        'cicloOperativo.fechaCierreAdmin': now      // Fecha de cierre
      })
    })
    
    await batch.commit()
    console.log(`✅ ${orderIds.length} pedidos CERRADOS exitosamente`)
    
  } catch (error) {
    console.error('❌ Error al cerrar pedidos:', error)
    throw error
  }
}

/**
 * REABRE pedidos cerrados (para correcciones o ajustes)
 */
export const reopenOrders = async (orderIds) => {
  if (!orderIds || orderIds.length === 0) return

  try {
    const batch = writeBatch(db)
    
    console.log(`🔓 Reabriendo ${orderIds.length} pedidos...`)
    
    orderIds.forEach(id => {
      const orderRef = doc(db, 'pedidos', id)
      batch.update(orderRef, {
        'cicloOperativo.cerradoPorAdmin': false,
        'cicloOperativo.fechaCierreAdmin': null
      })
    })
    
    await batch.commit()
    console.log(`✅ ${orderIds.length} pedidos reabiertos`)
    
  } catch (error) {
    console.error('❌ Error al reabrir pedidos:', error)
    throw error
  }
}