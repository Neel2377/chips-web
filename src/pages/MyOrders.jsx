import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const API_URL = '/api'
const statusClasses = {
  pending: 'badge bg-warning text-dark',
  success: 'badge bg-success',
  complete: 'badge bg-info text-dark',
  cancel: 'badge bg-danger',
}
const statusLabels = {
  pending: 'Pending',
  success: 'Success',
  complete: 'Complete',
  cancel: 'Cancelled',
}

const MyOrders = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, apiRequest } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const loadOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await apiRequest('/api/orders/me')
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load your orders')
        if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('login')) {
          navigate('/login', { replace: true })
        }
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [authLoading, isAuthenticated, navigate, apiRequest])

  if (authLoading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Checking authentication...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="container py-5">
      <div className="mb-5">
        <h1 className="mb-3">My Orders</h1>
        <p className="lead">Review your order history, check status, and see all order details in one place.</p>
      </div>

      {loading && <div className="alert alert-info">Loading your orders...</div>}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-light" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="alert alert-warning">
          You haven&apos;t placed any orders yet. Visit the <Link to="/chips" className="text-decoration-underline">shop page</Link> to place your first order.
        </div>
      )}

      <div className="row gy-4">
        {orders.map((order) => (
          <div key={order._id} className="col-12">
            <div className="p-4 rounded-4 shadow-sm bg-dark bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
                <div>
                  <h5 className="mb-1">Order #{order._id.slice(-6)}</h5>
                  <p className="mb-1">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                  <span className={statusClasses[order.status] || 'badge bg-secondary'}>{statusLabels[order.status] || order.status}</span>
                </div>
                <div className="text-md-end">
                  <p className="mb-1"><strong>Total:</strong> ₹{Number(order.total).toFixed(2)}</p>
                  <p className="mb-0">Items: {order.items.length}</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-borderless mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Quantity</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={`${order._id}-${item.product}`}>
                        <td>{item.name}</td>
                        <td className="text-end">₹{Number(item.price).toFixed(2)}</td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end">₹{(Number(item.price) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrders
