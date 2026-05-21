/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'

const API_URL = "http://localhost:5000/api"
const ORDER_STATUSES = ['pending', 'success', 'complete', 'cancel']
const statusLabels = {
  pending: 'Pending',
  success: 'Success',
  complete: 'Complete',
  cancel: 'Cancelled',
}
const statusClasses = {
  pending: 'badge bg-warning text-dark',
  success: 'badge bg-success',
  complete: 'badge bg-info text-dark',
  cancel: 'badge bg-danger',
}

const Admin = () => {
  const [form, setForm] = useState({
    name: '',
    flavor: '',
    description: '',
    price: '',
    image: '',
    stock: '',
  })
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalRevenue: 0, totalStock: 0, totalUsers: 0, totalOrders: 0, statusCounts: {} })
  const [editingId, setEditingId] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')

  const request = async (path, options = {}) => {
    const token = localStorage.getItem('authToken')
    const headers = {
      ...(options.headers || {}),
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Request failed')
    }
    return response.json()
  }

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setStatus('')
    setUploadingImage(true)

    try {
      const token = localStorage.getItem('authToken')
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Upload failed')
      }

      const data = await response.json()
      setForm((current) => ({ ...current, image: data.url }))
      setStatus('Image uploaded successfully.')
    } catch (err) {
      setError(err.message || 'Unable to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const resetForm = () => {
    setForm({ name: '', flavor: '', description: '', price: '', image: '', stock: '' })
    setEditingId('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/products`)
      if (!response.ok) {
        throw new Error('Unable to load products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError('Could not load products. Please make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await request('/users')
      setUsers(data)
    } catch (err) {
      setError(err.message || 'Could not load users.')
    }
  }

  const loadOrders = async () => {
    try {
      const data = await request('/orders')
      setOrders(data)
    } catch (err) {
      setError(err.message || 'Could not load orders.')
    }
  }

  const loadStats = async () => {
    try {
      const data = await request('/dashboard')
      setStats(data)
    } catch (err) {
      setError(err.message || 'Could not load dashboard stats.')
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      setError('')
      await Promise.all([loadProducts(), loadUsers(), loadOrders(), loadStats()])
      setLoading(false)
    }

    loadAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEdit = (product) => {
    setStatus('')
    setError('')
    setEditingId(product._id)
    setForm({
      name: product.name || '',
      flavor: product.flavor || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      image: product.image || '',
      stock: product.stock?.toString() || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently?')) {
      return
    }
    setStatus('')
    setError('')

    try {
      await request(`/products/${productId}`, { method: 'DELETE' })
      setStatus('Product deleted successfully.')
      setProducts((current) => current.filter((item) => item._id !== productId))
      if (editingId === productId) {
        resetForm()
      }
      await loadStats()
    } catch (err) {
      setError(err.message || 'Could not delete product. Please try again.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')

    const product = {
      name: form.name.trim(),
      flavor: form.flavor.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      image: form.image.trim(),
      stock: parseInt(form.stock, 10),
    }

    if (
      !product.name ||
      !product.flavor ||
      !product.description ||
      Number.isNaN(product.price) ||
      Number.isNaN(product.stock) ||
      !product.image
    ) {
      setError('Please fill in all fields with valid values.')
      return
    }

    const method = editingId ? 'PUT' : 'POST'
    const endpoint = editingId ? `/products/${editingId}` : '/products'

    try {
      const savedProduct = await request(endpoint, {
        method,
        body: JSON.stringify(product),
      })
      const successMessage = editingId ? 'Product updated successfully.' : 'Product saved successfully.'
      setStatus(successMessage)
      setError('')
      resetForm()
      setProducts((current) => {
        if (editingId) {
          return current.map((item) => (item._id === savedProduct._id ? savedProduct : item))
        }
        return [savedProduct, ...current]
      })
      await loadStats()
    } catch (err) {
      setError(err.message || 'Could not save product. Please try again.')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account?')) {
      return
    }
    setStatus('')
    setError('')

    try {
      await request(`/users/${userId}`, { method: 'DELETE' })
      setStatus('User deleted successfully.')
      setUsers((current) => current.filter((item) => item._id !== userId))
      await loadStats()
    } catch (err) {
      setError(err.message || 'Could not delete user. Please try again.')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setStatus('')
    setError('')

    try {
      const updatedOrder = await request(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })
      setOrders((current) => current.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))
      setStatus('Order status updated successfully.')
      await Promise.all([loadStats(), loadOrders()])
    } catch (err) {
      setError(err.message || 'Could not update order status.')
    }
  }

  const filteredOrders = orders.filter((order) => orderFilter === 'all' || order.status === orderFilter)
  const orderStatusCounts = ORDER_STATUSES.reduce((acc, statusKey) => {
  acc[statusKey] =
    stats?.statusCounts?.[statusKey] ||
    orders.filter((order) => order.status === statusKey).length
  return acc
}, {})

  return (
    <div>
      <section className="admin-hero rounded-4 p-4 p-md-5 mb-5 shadow-sm fade-section">
        <div className="row align-items-center gy-4">
          <div className="col-lg-8">
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="display-6 fw-bold mb-3">Complete shop control with products, users, and orders.</h1>
            <p className="mb-0">
              Track revenue, manage users and inventory, approve orders, and make live updates with a single admin panel.
            </p>
          </div>
          <div className="col-lg-4">
            <div className="admin-summary p-4 rounded-4 bg-dark bg-opacity-75 text-white h-100">
              <p className="text-uppercase small text-warning mb-2">Dashboard snapshot</p>
              <h3 className="mb-3">{stats.totalOrders} orders</h3>
              <p className="mb-0">Revenue: ₹{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </section>

      {status && <div className="alert alert-success">{status}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="stats-card p-4 rounded-4 shadow-sm h-100">
            <p className="text-uppercase small text-warning mb-2">Total products</p>
            <h3>{products.length}</h3>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="stats-card p-4 rounded-4 shadow-sm h-100">
            <p className="text-uppercase small text-warning mb-2">Total users</p>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="stats-card p-4 rounded-4 shadow-sm h-100">
            <p className="text-uppercase small text-warning mb-2">Total stock</p>
            <h3>{stats.totalStock}</h3>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="stats-card p-4 rounded-4 shadow-sm h-100">
            <p className="text-uppercase small text-warning mb-2">Order total</p>
            <h3>₹{stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="p-4 rounded-4 shadow-sm bg-dark bg-opacity-10">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
              <div>
                <h4 className="mb-1">Order status chart</h4>
                <p className="mb-0">Quick insight into how orders are moving through the pipeline.</p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {ORDER_STATUSES.map((statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    className={`btn btn-outline-secondary btn-sm ${orderFilter === statusKey ? 'active' : ''}`}
                    onClick={() => setOrderFilter(statusKey)}
                  >
                    {statusLabels[statusKey]} ({orderStatusCounts[statusKey]})
                  </button>
                ))}
                <button type="button" className={`btn btn-outline-secondary btn-sm ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>
                  All orders
                </button>
              </div>
            </div>
            <div className="row g-3">
              {ORDER_STATUSES.map((statusKey) => {
                const count = orderStatusCounts[statusKey] || 0
                const portion = stats.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0
                return (
                  <div className="col-sm-6 col-md-3" key={statusKey}>
                    <div className="p-3 rounded-4 bg-black bg-opacity-10 h-100">
                      <p className="text-uppercase small text-warning mb-2">{statusLabels[statusKey]}</p>
                      <h4 className="mb-2">{count}</h4>
                      <div className="progress" style={{ height: '8px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${portion}%` }} aria-valuenow={portion} aria-valuemin="0" aria-valuemax="100" />
                      </div>
                      <small className="text-muted">{portion}% of all orders</small>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <div className="admin-form-card p-4 rounded-4 shadow-sm h-100">
            <div className="mb-4">
              <h3 className="mb-1">{editingId ? 'Edit product details' : 'Add new product'}</h3>
              <p className="mb-0">Fill in each field and submit to update the catalog.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control form-control-dark"
                    placeholder="Name"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Flavor</label>
                  <input
                    type="text"
                    name="flavor"
                    value={form.flavor}
                    onChange={handleChange}
                    className="form-control form-control-dark"
                    placeholder="Flavor"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="form-control form-control-dark"
                    step="0.01"
                    placeholder="Price"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="form-control form-control-dark"
                    placeholder="Stock"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    className="form-control form-control-dark"
                    placeholder="Image URL"
                  />
                </div>
                {form.image && (
                  <div className="col-6">
                    <label className="form-label">Preview</label>
                    <div className="border rounded-4 overflow-hidden">
                      <img src={form.image} alt="Preview" className="img-fluid" />
                    </div>
                  </div>
                )}
                {uploadingImage && (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">Uploading image, please wait...</div>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-control form-control-dark"
                    rows="5"
                    placeholder="Description"
                  />
                </div>
                <div className="col-12 d-flex gap-3 justify-content-end">
                  {editingId && (
                    <button type="button" className="btn btn-outline-light" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                  <button className="btn btn-accent btn-lg" type="submit">
                    {editingId ? 'Save changes' : 'Add product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="admin-form-card p-4 rounded-4 shadow-sm h-100">
            <div className="mb-4">
              <h3 className="mb-1">Manage users</h3>
              <p className="mb-0">View registered accounts and delete suspicious or inactive users.</p>
            </div>
            {!users.length && <div className="alert alert-info">No user accounts found.</div>}
            {users.map((user) => (
              <div key={user._id} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                <div>
                  <h6 className="mb-1">{user.name}</h6>
                  <p className="small mb-0">{user.email}</p>
                </div>
                <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => handleDeleteUser(user._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="admin-form-card p-4 rounded-4 shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
              <div>
                <h3 className="mb-1">Order management</h3>
                <p className="mb-0">Review order details, update statuses, and keep the sales pipeline moving.</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button className={`btn btn-outline-secondary btn-sm ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>
                  All
                </button>
                {ORDER_STATUSES.map((statusKey) => (
                  <button key={statusKey} className={`btn btn-outline-secondary btn-sm ${orderFilter === statusKey ? 'active' : ''}`} onClick={() => setOrderFilter(statusKey)}>
                    {statusLabels[statusKey]}
                  </button>
                ))}
              </div>
            </div>

            {!filteredOrders.length && <div className="alert alert-info">No orders for the selected status.</div>}
            {filteredOrders.map((order) => (
              <div key={order._id} className="mb-4 p-3 rounded-4 bg-black bg-opacity-10">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <h5 className="mb-1">Order #{order._id.slice(-6)}</h5>
                    <p className="small mb-1">Customer: {order.user?.name || 'Unknown'}</p>
                    <p className="small mb-0">Email: {order.user?.email || 'Unknown'}</p>
                  </div>
                  <div className="text-end">
                    <span className={statusClasses[order.status]}>{statusLabels[order.status]}</span>
                    <p className="small mb-0">Total: ₹{Number(order.total).toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-3 d-flex flex-column flex-sm-row justify-content-between gap-3 align-items-start">
                  <div className="d-flex flex-column gap-2">
                    <small className="text-muted">Placed: {new Date(order.createdAt).toLocaleString()}</small>
                    <button className="btn btn-outline-light btn-sm" type="button" onClick={() => setExpandedOrderId(expandedOrderId === order._id ? '' : order._id)}>
                      {expandedOrderId === order._id ? 'Hide details' : 'View details'}
                    </button>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {ORDER_STATUSES.map((statusKey) => (
                      <button
                        key={`${order._id}-${statusKey}`}
                        className={`btn btn-sm ${order.status === statusKey ? 'btn-accent' : 'btn-outline-secondary'}`}
                        type="button"
                        onClick={() => handleUpdateOrderStatus(order._id, statusKey)}
                      >
                        {statusLabels[statusKey]}
                      </button>
                    ))}
                  </div>
                </div>

                {expandedOrderId === order._id && (
                  <div className="mt-4 p-3 rounded-4 bg-white bg-opacity-75">
                    <h6 className="mb-3">Order items</h6>
                    {order.items.map((item) => (
                      <div key={`${order._id}-${item.product}`} className="d-flex justify-content-between mb-2">
                        <span>{item.name} x {item.quantity}</span>
                        <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                    <div className="border-top pt-3 mt-3 d-flex justify-content-between">
                      <span className="fw-semibold">Order total</span>
                      <strong>₹{Number(order.total).toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="product-list-grid row g-3">
            {loading && <p>Loading products...</p>}
            {!loading && products.length === 0 && <div className="alert alert-info">No products available yet.</div>}
            {products.map((product) => (
              <div className="col-md-6" key={product._id}>
                <div className="product-card admin-card rounded-4 shadow-sm h-100 overflow-hidden">
                  <div className="product-thumb-small overflow-hidden">
                    <img src={product.image || 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=80'} alt={product.name} className="w-100 h-100 object-fit-cover" />
                  </div>
                  <div className="p-4 d-flex flex-column h-100">
                    <div className="mb-3">
                      <h5 className="mb-1">{product.name}</h5>
                      <p className="small mb-1">{product.flavor}</p>
                      <p className="small mb-0">Stock: {product.stock ?? 0}</p>
                    </div>
                    <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                      <span className="badge badge-pill badge-accent">₹{Number(product.price).toFixed(2)}</span>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-light btn-sm" type="button" onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => handleDeleteProduct(product._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
