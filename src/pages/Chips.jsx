/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_URL = '/api'
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1607544863095-61f6d773ef4f?auto=format&fit=crop&w=1200&q=80'

const Chips = () => {
  const { isAuthenticated, apiRequest } = useAuth()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkoutStatus, setCheckoutStatus] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`)
        if (!response.ok) {
          throw new Error('Unable to load products')
        }
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        setError('Could not load chips. Please start the backend server and try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id)
      const maxStock = product.stock ?? Infinity
      if (existing) {
        if (existing.quantity >= maxStock) {
          return current
        }
        return current.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const updateCartItemQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item._id !== productId) return item
          const stock = item.stock ?? Infinity
          const nextQuantity = Math.max(1, Math.min(stock, item.quantity + delta))
          return { ...item, quantity: nextQuantity }
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item._id !== productId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0)

  const handleCheckout = async () => {
    setCheckoutStatus('')
    setCheckoutError('')
    if (!isAuthenticated) {
      setCheckoutError('Please log in before checking out.')
      return
    }
    if (cart.length === 0) {
      setCheckoutError('Your cart is empty.')
      return
    }

    setCheckoutLoading(true)
    try {
      await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items: cart }),
      })

      setCheckoutStatus('Order placed successfully. You can review it on your My Orders page.')
      setCart([])
    } catch (err) {
      setCheckoutError(err.message || 'Unable to submit order')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div>
      <section className="shop-header rounded-4 p-4 p-md-5 mb-5 shadow-sm fade-section">
        <div className="row align-items-center gy-4">
          <div className="col-lg-8">
            <p className="eyebrow">Discover new chips</p>
            <h2 className="fw-bold mb-3">Fresh snacks with bold flavor and smooth shopping.</h2>
            <p className=" mb-4">
              Browse our live product catalog, add favorites to your cart, and enjoy a polished checkout experience designed for chip lovers.
            </p>
          </div>
          <div className="col-lg-4">
            <div className="shop-summary p-4 bg-dark bg-opacity-75 text-white h-100 rounded-4 rounded-4">
              <p className="text-uppercase small text-warning mb-2">Order snapshot</p>
              <h3 className="mb-3">{products.length} products</h3>
              <p className="mb-1">Cart items</p>
              <h4 className="mb-3">{cart.length}</h4>
              <p className="mb-0">Total: <span className="text-white">₹{cartTotal.toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      </section>

      {loading && <p>Loading chips...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {checkoutError && <div className="alert alert-danger">{checkoutError}</div>}
      {checkoutStatus && <div className="alert alert-success">{checkoutStatus}</div>}
      {!loading && products.length === 0 && !error && (
        <div className="alert alert-info">
          No products are available yet. Add new items from the <strong>Admin</strong> page.
        </div>
      )}

      <div className="row g-4 chip-grid fade-section">
        {products.map((product) => {
          const price = Number(product.price) || 0
          const image = product.image || DEFAULT_IMAGE

          return (
            <div className="col-md-6 col-xl-4" key={product._id}>
              <div className="product-card rounded-4 shadow-sm h-100 overflow-hidden">
                <div className="product-thumb overflow-hidden">
                  <img src={image} alt={product.name || 'Product'} className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="p-4 d-flex flex-column h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
                    <div>
                      <h5 className="mb-1">{product.name}</h5>
                      <p className="small mb-1">{product.description}</p>
                      <p className="product-stock mb-0">Stock: {product.stock ?? 0}</p>
                    </div>
                    <span className="badge badge-pill">{product.flavor || 'Classic'}</span>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <p className="small mb-1">Price</p>
                        <strong className="product-price">₹{price.toFixed(2)}</strong>
                      </div>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0 || cart.find((item) => item._id === product._id)?.quantity >= (product.stock ?? Infinity)}
                      >
                        {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {cart.length > 0 && (
        <section className="cart-panel mt-5 p-4 rounded-4 shadow-sm bg-dark bg-opacity-10">
          <div className="section-title mb-3 d-flex align-items-center justify-content-between gap-3">
            <h3 className="mb-0">Your Cart</h3>
            <button
              className="btn btn-accent btn-lg"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Placing order...' : 'Checkout now'}
            </button>
          </div>
          <div className="list-group mb-3">
            {cart.map((item) => (
              <div key={item._id} className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-center bg-transparent border-0 px-0 py-3">
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <h6 className="mb-1 text-white">{item.name}</h6>
                    <small className="text-white">Price: ₹{Number(item.price).toFixed(2)}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light"
                      onClick={() => updateCartItemQuantity(item._id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="text-white">{item.quantity}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light"
                      onClick={() => updateCartItemQuantity(item._id, 1)}
                      disabled={item.quantity >= (item.stock ?? Infinity)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <span className='text-white'>₹{((Number(item.price) || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="text-end text-white">
            <strong className="fs-5">Order total:</strong>{' '}
            <span className="fs-5">₹{cartTotal.toFixed(2)}</span>
          </div>
        </section>
      )}
    </div>
  )
}

export default Chips
