import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Orders from './pages/Orders'
import OrderView from './pages/OrderView'
import OrderEdit from './pages/OrderEdit'
import OrderAssign from './pages/OrderAssign'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="font-display bg-background-light dark:bg-background-dark">
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/orders" replace />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:orderId/view" element={<OrderView />} />
                      <Route path="/orders/:orderId/edit" element={<OrderEdit />} />
                      <Route path="/orders/:orderId/assign" element={<OrderAssign />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
