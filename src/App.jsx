import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Orders from './pages/Orders'
import OrderCreate from './pages/OrderCreate'
import OrderView from './pages/OrderView'
import OrderAssign from './pages/OrderAssign'
import Customers from './pages/Customers'
import CustomerCreate from './pages/CostumerCreate'
import Drivers from './pages/Drivers'
import DriverCreate from './pages/DriverCreate'
import SupervisorCreate from './pages/SupervisorCreate'
import ClosingDashboard from './pages/ClosingDashboard'

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
                      <Route path="/orders/create" element={<OrderCreate />} />
                      <Route path="/orders/:orderId/view" element={<OrderView />} />
                      <Route path="/orders/:orderId/edit" element={<OrderCreate />} />
                      <Route path="/orders/:orderId/assign" element={<OrderAssign />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/create" element={<CustomerCreate />} />
                      <Route path="/drivers" element={<Drivers />} />
                      <Route path="/drivers/create" element={<DriverCreate />} />
                      <Route path="/supervisors/create" element={<SupervisorCreate />} />
                      <Route path="/closing" element={<ClosingDashboard />} />
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
