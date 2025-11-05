import { useParams, useNavigate } from 'react-router-dom'

function OrderEdit() {
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
        <h2 className="text-2xl font-bold mb-4">Editar Pedido {orderId}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Formulario de edición del pedido. Esta página se implementará con todos los campos editables.
        </p>
      </div>
    </div>
  )
}

export default OrderEdit
