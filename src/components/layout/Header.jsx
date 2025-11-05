import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, userData, logout } = useAuth()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/login')
    }
  }

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
      <div className="flex flex-1 justify-end items-center gap-3">
        {/* Información del usuario */}
        <div className="hidden lg:flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">{userData?.nombre || user?.email}</span>
          {userData?.rol && (
            <span className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded text-xs font-medium">
              {userData.rol}
            </span>
          )}
        </div>

        {/* Notificaciones */}
        <button
          className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/10 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          title="Notificaciones"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Configuración */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center rounded-lg h-10 w-10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          title="Configuración"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* Avatar del usuario */}
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAiE3lhoLU-4v4OJBuK3cBmpqCYhVsSI83kjdyRebEYE12Bb242SVCvAT5g8jSmzI29PX6dds0dZqWPsdWO7r-Y3NfLzo4hAn6BNcbWhk9j0m_3k_1zL7UqBP5pXZm5rNkTWohYlXiP-L-JLIcha9wGMKFMRMamTEdsTsCAnTflJk79RsKSHgK9w18pyYZLylU4WpAC3j-WY3S8rcZwhB071kmsAAadnQWqEMFf636hRGerEw6VA9zLBBoiW1-LqTSkCD70szovPoE")'
          }}
          title={userData?.nombre || user?.email || 'Perfil de usuario'}
        />

        {/* Divisor */}
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors"
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="hidden lg:inline text-sm font-medium">Salir</span>
        </button>
      </div>
    </header>
  )
}

export default Header
