import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Orders from './pages/Orders'
import OrderView from './pages/OrderView'
import OrderEdit from './pages/OrderEdit'
import OrderAssign from './pages/OrderAssign'

function App() {
  return (
    <Router>
      <div className="font-display bg-background-light dark:bg-background-dark">
        <Layout>
          <Routes>
            <Route path="/" element={<Orders />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId/view" element={<OrderView />} />
            <Route path="/orders/:orderId/edit" element={<OrderEdit />} />
            <Route path="/orders/:orderId/assign" element={<OrderAssign />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App
