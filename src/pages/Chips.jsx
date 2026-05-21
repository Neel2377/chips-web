/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth.jsx'

const API_URL = "http://localhost:5000/api"
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1607544863095-61f6d773ef4f?auto=format&fit=crop&w=1200&q=80'

const Chips = () => {
  const { isAuthenticated, apiRequest, user } = useAuth()

  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkoutStatus, setCheckoutStatus] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // ✅ Load Razorpay script dynamically (BEST PRACTICE)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)

      document.body.appendChild(script)
    })
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`)
        if (!res.ok) throw new Error()

        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        setError('Backend not running or API error')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // ---------------- CART ----------------

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id)
      const stock = product.stock ?? Infinity

      if (existing) {
        if (existing.quantity >= stock) return prev
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateCartItemQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item

        const stock = item.stock ?? Infinity
        const qty = Math.max(1, Math.min(stock, item.quantity + delta))

        return { ...item, quantity: qty }
      })
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id))
  }

  const cartTotal = cart.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * i.quantity,
    0
  )

  // ---------------- CHECKOUT ----------------

  const handleCheckout = async () => {
  setCheckoutError('')
  setCheckoutStatus('')
  setCheckoutLoading(true)

  try {
    console.log("Checkout clicked")

    // ✅ Login check
    if (!isAuthenticated) {
      setCheckoutError('Please login first')
      return
    }

    // ✅ Cart check
    if (cart.length === 0) {
      setCheckoutError('Cart is empty')
      return
    }

    // ✅ Load Razorpay SDK
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      setCheckoutError('Razorpay SDK failed to load')
      return
    }

    // ✅ CALL API USING FETCH (NOT apiRequest)
    const res = await fetch('/api/payment/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: Math.round(cartTotal * 100) }),
    })

    if (!res.ok) {
      throw new Error("Order API failed")
    }

    const order = await res.json()
    console.log("Order:", order)

    if (!order?.id) {
      throw new Error("Order ID missing")
    }

    // ✅ Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Chip Store",
      description: "Order Payment",
      order_id: order.id,

      handler: async function (response) {
        console.log("Payment success:", response)

        try {
          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cart,
              userId: user?._id || user?.id,
            }),
          })

          setCart([])
          setCheckoutStatus("Payment successful 🎉")
        } catch (err) {
          console.error(err)
          setCheckoutError("Payment verification failed")
        }
      },

      modal: {
        ondismiss: () => {
          setCheckoutError("Payment cancelled")
        }
      },

      theme: {
        color: "#3399cc"
      }
    }

    console.log("Opening Razorpay...")

    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', function (response) {
      console.error("Payment failed:", response)
      setCheckoutError("Payment failed")
    })

    rzp.open()

  } catch (err) {
    console.error("Checkout error:", err)
    setCheckoutError("Checkout failed")
  } finally {
    setCheckoutLoading(false)
  }
}

  // ---------------- UI ----------------

  return (
    <div className="container py-5">
  {loading && (
    <div className="text-center mb-4">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2">Loading products...</p>
    </div>
  )}

  {error && (
    <div className="alert alert-danger shadow-sm">{error}</div>
  )}

  {checkoutError && (
    <div className="alert alert-danger shadow-sm">
      {checkoutError}
    </div>
  )}

  {checkoutStatus && (
    <div className="alert alert-success shadow-sm">
      {checkoutStatus}
    </div>
  )}

  <div className="row g-4">
    {products.map((p) => {
      const price = Number(p.price) || 0
      const image = p.image || DEFAULT_IMAGE

      return (
        <div className="col-sm-6 col-lg-4" key={p._id}>
          <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
            
            <div className="d-flex align-items-center justify-content-center p-3 bg-dark">
              <img
                src={image}
                alt={p.name}
                className="img-fluid"
                style={{
                  height: "220px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div className="card-body d-flex flex-column bg-dark text-white">
              <h5 className="fw-bold">{p.name}</h5>

              <p className="small flex-grow-1">
                {p.description}
              </p>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <h4 className="text-primary fw-bold mb-0">
                  ₹{price}
                </h4>

                {p.stock > 0 ? (
                  <span className="badge bg-success">
                    In Stock
                  </span>
                ) : (
                  <span className="badge bg-danger">
                    Out of Stock
                  </span>
                )}
              </div>

              <button
                className="btn btn-dark w-100 mt-4 rounded-pill bg-light text-black"
                onClick={() => addToCart(p)}
                disabled={p.stock === 0}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )
    })}
  </div>

  {cart.length > 0 && (
    <div className="mt-5">
      <div className="card border-0 shadow-lg rounded-4 p-4 bg-transparent text-white">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">Shopping Cart</h3>

          <span className="badge bg-dark fs-6">
            {cart.length} Items
          </span>
        </div>

        {cart.map((item) => (
          <div
            key={item._id}
            className="d-flex justify-content-between align-items-center border-bottom py-3"
          >
            <div>
              <h6 className="mb-1 fw-semibold">
                {item.name}
              </h6>

              <small className="">
                ₹{item.price} each
              </small>
            </div>

            <div className="d-flex align-items-center gap-2">
              
              <button
                className="btn btn-outline-secondary btn-sm rounded-circle"
                onClick={() =>
                  updateCartItemQuantity(item._id, -1)
                }
              >
                -
              </button>

              <span className="fw-bold px-2">
                {item.quantity}
              </span>

              <button
                className="btn btn-outline-secondary btn-sm rounded-circle"
                onClick={() =>
                  updateCartItemQuantity(item._id, 1)
                }
              >
                +
              </button>

              <button
                className="btn btn-outline-danger btn-sm ms-3"
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <h4 className="fw-bold">
            Total: ₹{cartTotal}
          </h4>

          <button
            className="btn btn-success px-4 py-2 rounded-pill"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading
              ? "Processing..."
              : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  )
}

export default Chips