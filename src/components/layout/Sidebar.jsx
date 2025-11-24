import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function Sidebar() {
  const location = useLocation()
  const { isAdmin } = useAuth()

  const allMenuItems = [
    { path: '/orders/create', icon: 'add_circle', label: 'Crear Pedido', exact: true },
    { path: '/orders', icon: 'local_shipping', label: 'Pedidos', exact: false },
    { path: '/drivers', icon: 'two_wheeler', label: 'Motorizados', exact: false },
    { path: '/customers', icon: 'groups', label: 'Clientes', exact: false },
    { path: '/supervisors/create', icon: 'admin_panel_settings', label: 'Crear Supervisor', exact: true, adminOnly: true },
    { path: '/closing', icon: 'task_alt', label: 'Cierre Diario', exact: true },
  ]

  // Filtrar menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin()
    }
    return true
  })

  // Función para determinar si un item está activo
  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    // Para rutas no exactas, verificar que empiece con el path pero no sea una sub-ruta específica
    if (item.path === '/orders') {
      // Solo activar para /orders y sus sub-rutas que no sean /orders/create
      return location.pathname === '/orders' ||
             (location.pathname.startsWith('/orders/') && !location.pathname.startsWith('/orders/create'))
    }
    return location.pathname.startsWith(item.path)
  }

  return (
    <aside className="flex flex-col items-center w-20 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-white/10 py-4 px-2">
      {/* Logo */}
      <div className="size-8 text-primary mb-8">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path
            clipRule="evenodd"
            d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col items-center gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-3 rounded-lg ${
              isActive(item)
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
            title={item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
