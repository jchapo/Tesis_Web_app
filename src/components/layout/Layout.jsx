import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header fijo */}
        <Header />

        {/* Contenido scrolleable */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
