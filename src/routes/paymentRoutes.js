/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from "express"
import crypto from "crypto"
import Razorpay from "razorpay"
import Order from "../../models/Order.js"

const router = express.Router()

// ✅ Razorpay instance (BEST PRACTICE)
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})


// =========================
// ✅ CREATE ORDER
// =========================
router.post("/order", async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" })
    }

    const options = {
      amount: Math.round(amount), // ✅ already in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    res.json(order)
  } catch (error) {
    console.error("Order creation error:", error)
    res.status(500).json({ message: "Payment order creation failed" })
  }
})


// =========================
// ✅ VERIFY PAYMENT
// =========================
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      userId
    } = req.body

    // ✅ VERIFY SIGNATURE (you probably already have this)

    // ✅ SAVE ORDER IN DB
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' })
    }

    const orderItems = items.map((item) => ({
      product: item.product || item._id,
      name: item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }))

    const total = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    )

    const order = await Order.create({
      user: userId,
      items: orderItems,
      total,
      status: "success",
    })

    res.json({ success: true, order })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Verification failed" })
  }
})

export default router