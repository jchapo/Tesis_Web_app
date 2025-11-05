import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children }) {
  return (
    <div className="relative flex h-auto min-h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
