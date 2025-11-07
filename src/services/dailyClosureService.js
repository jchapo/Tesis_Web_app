// services/dailyClosureService.js
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { transformFirestoreDoc } from './ordersService.js'

export const getDailyClosing = async () => {
  try {
    console.log("🔎 Ejecutando cierre diario...")

    const ordersRef = collection(db, 'pedidos')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    console.log("📅 Rango de consulta:")
    console.log("  ✅ Today: ", today.toISOString())
    console.log("  ✅ Tomorrow: ", tomorrow.toISOString())

    // Pedidos entregados hoy
    const q = query(
      ordersRef,
      where('fechas.entrega', '>=', today),
      where('fechas.entrega', '<', tomorrow)
    )

    console.log("📌 Ejecutando consulta de entregas...")
    const querySnapshot = await getDocs(q)
    console.log(`📦 Pedidos entregados hoy: ${querySnapshot.size}`)

    let orders = []
    querySnapshot.forEach((docSnap) => {
      console.log("📥 Documento recibido ENTREGADO:", docSnap.id)
      console.log("RAW DATA:", docSnap.data())

      const order = transformFirestoreDoc(docSnap)
      console.log("➡ Pedido transformado:", order)

      if (!order) {
        console.warn("⚠️ Pedido ignorado por transformFirestoreDoc")
      } else {
        orders.push(order)
      }
    })

    // Pedidos cancelados hoy
    const qc = query(
      ordersRef,
      where('fechas.anulacion', '>=', today),
      where('fechas.anulacion', '<', tomorrow)
    )

    console.log("📌 Ejecutando consulta de anulaciones...")
    const cancelSnapshot = await getDocs(qc)
    console.log(`🚫 Pedidos anulados hoy: ${cancelSnapshot.size}`)

    cancelSnapshot.forEach((docSnap) => {
      console.log("📥 Documento recibido CANCELADO:", docSnap.id)
      console.log("RAW DATA:", docSnap.data())

      const order = transformFirestoreDoc(docSnap)
      console.log("➡ Pedido transformado:", order)

      if (!order) {
        console.warn("⚠️ Pedido cancelado ignorado por transformación")
      } else if (!orders.find(o => o.id === order.id)) {
        orders.push(order)
      }
    })

    console.log("✅ TOTAL pedidos para cierre diario:", orders.length)
    console.table(orders)

    return orders
  } catch (error) {
    console.error('❌ Error al obtener cierre diario:', error)
    throw error
  }
}
