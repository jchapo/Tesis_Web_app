import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/orders', icon: 'local_shipping', label: 'Pedidos' },
    { path: '/drivers', icon: 'two_wheeler', label: 'Motorizados' },
    { path: '/customers', icon: 'groups', label: 'Clientes' },
    { path: '/reports', icon: 'analytics', label: 'Reportes' },
  ]

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
              location.pathname === item.path
                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
            title={item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <Link
          to="/settings"
          className="p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
          title="Configuración"
        >
          <span className="material-symbols-outlined">settings</span>
        </Link>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAiE3lhoLU-4v4OJBuK3cBmpqCYhVsSI83kjdyRebEYE12Bb242SVCvAT5g8jSmzI29PX6dds0dZqWPsdWO7r-Y3NfLzo4hAn6BNcbWhk9j0m_3k_1zL7UqBP5pXZm5rNkTWohYlXiP-L-JLIcha9wGMKFMRMamTEdsTsCAnTflJk79RsKSHgK9w18pyYZLylU4WpAC3j-WY3S8rcZwhB071kmsAAadnQWqEMFf636hRGerEw6VA9zLBBoiW1-LqTSkCD70szovPoE")'
          }}
          title="User profile picture"
        />
      </div>
    </aside>
  )
}

export default Sidebar
