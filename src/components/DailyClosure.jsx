// components/DailyClosure.jsx
import { useState } from 'react'
import { getDailyClosing, closeOrders } from '../services/dailyClosureService'

export const DailyClosure = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [closed, setClosed] = useState(false)

  const handleGetClosureOrders = async () => {
    setLoading(true)
    try {
      const closureOrders = await getDailyClosing()
      setOrders(closureOrders)
      setClosed(false)
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error al obtener pedidos para cierre")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmClosure = async () => {
    if (orders.length === 0) {
      alert("No hay pedidos para cerrar")
      return
    }

    const totalMonto = orders.reduce((sum, o) => sum + (o.pago?.montoTotal || 0), 0)
    
    const confirm = window.confirm(
      `¿Confirmar CIERRE de ${orders.length} pedidos?\n\n` +
      `Monto total: S/ ${totalMonto}\n\n` +
      `Estos pedidos quedarán CERRADOS y no aparecerán más en operaciones activas.`
    )

    if (!confirm) return

    setLoading(true)
    try {
      // 1. Generar reporte de cierre (PDF, Excel, etc.)
      console.log("📄 Generando reporte de cierre...")
      // await generateClosureReport(orders)
      
      // 2. CERRAR los pedidos
      const orderIds = orders.map(o => o.id)
      await closeOrders(orderIds)
      
      setClosed(true)
      alert(`✅ Cierre completado: ${orders.length} pedidos cerrados`)
      
      setOrders([])
      
    } catch (error) {
      console.error("Error al confirmar cierre:", error)
      alert("❌ Error al procesar el cierre")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="daily-closure">
      <h2>Cierre Diario de Operaciones</h2>
      
      <button 
        onClick={handleGetClosureOrders} 
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Cargando..." : "Obtener Pedidos para Cierre"}
      </button>

      {orders.length > 0 && !closed && (
        <div className="closure-summary">
          <h3>📦 Pedidos encontrados: {orders.length}</h3>
          
          <div className="stats">
            <p>Entregados: {orders.filter(o => o.fechas?.entrega).length}</p>
            <p>Anulados: {orders.filter(o => o.fechas?.anulacion).length}</p>
            <p>Monto total: S/ {orders.reduce((sum, o) => sum + (o.pago?.montoTotal || 0), 0)}</p>
          </div>
          
          <button 
            onClick={handleConfirmClosure} 
            disabled={loading}
            className="btn-danger"
          >
            ⚠️ CERRAR PEDIDOS
          </button>
        </div>
      )}

      {closed && (
        <div className="success-message">
          ✅ Cierre completado exitosamente
        </div>
      )}
    </div>
  )
}