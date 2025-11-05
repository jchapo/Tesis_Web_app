import { useParams, useNavigate } from 'react-router-dom'

function OrderAssign() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Volver a la lista</span>
        </button>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Asignar Motorizado - Pedido {orderId}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Interfaz para asignar motorizado al pedido. Esta página mostrará la lista de motorizados disponibles.
        </p>
      </div>
    </div>
  )
}

export default OrderAssign
