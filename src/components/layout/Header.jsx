import { useLocation, useNavigate } from 'react-router-dom'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  const getBreadcrumb = (path) => {
    // Manejo de rutas dinámicas
    if (path.startsWith('/orders/')) {
      const encodedOrderId = path.split('/')[2]
      const orderId = encodedOrderId ? decodeURIComponent(encodedOrderId) : ''
      const cleanOrderId = orderId.replace('#', '')

      return {
        showBack: true,
        items: [
          { label: 'Gestión de Pedidos', path: '/orders', clickable: true },
          { label: `Pedido ${cleanOrderId}`, clickable: false }
        ]
      }
    }

    // Rutas estáticas
    const routes = {
      '/': { showBack: false, items: [{ label: 'Gestión de Pedidos', clickable: false }] },
      '/orders': { showBack: false, items: [{ label: 'Gestión de Pedidos', clickable: false }] },
      '/drivers': { showBack: false, items: [{ label: 'Motorizados', clickable: false }] },
      '/customers': { showBack: false, items: [{ label: 'Clientes', clickable: false }] },
      '/reports': { showBack: false, items: [{ label: 'Reportes', clickable: false }] },
      '/settings': { showBack: false, items: [{ label: 'Configuración', clickable: false }] }
    }

    return routes[path] || { showBack: false, items: [{ label: 'Gestión de Pedidos', clickable: false }] }
  }

  const breadcrumb = getBreadcrumb(location.pathname)

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200/10 dark:border-white/10 px-6 md:px-10 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-10">
      <div className="flex items-center gap-4 text-black dark:text-white">
        {breadcrumb.showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
            title="Volver"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          {breadcrumb.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-gray-400 dark:text-gray-500">/</span>
              )}
              {item.clickable ? (
                <button
                  onClick={() => navigate(item.path)}
                  className="text-primary hover:underline text-lg font-bold leading-tight tracking-[-0.015em]"
                >
                  {item.label}
                </button>
              ) : (
                <h2 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                  {item.label}
                </h2>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white/10 dark:bg-white/5 text-gray-600 dark:text-gray-300 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  )
}

export default Header
