/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import "./config/env.js"

import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import path from "path"
import { fileURLToPath } from "url"

import Product from "./models/Product.js"
import User from "./models/User.js"
import Order from "./models/Order.js"

import paymentRoutes from "./src/routes/paymentRoutes.js"

const app = express()

// PATH
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const staticPath = path.join(__dirname, "dist")

// ENV
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chips-web"
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "secret"

// MIDDLEWARE
app.use(cors({ origin: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ---------------- CLOUDINARY ----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
})

// ---------------- MULTER ----------------
const upload = multer({ storage: multer.memoryStorage() })

// ---------------- TOKEN ----------------
const generateToken = (user) =>
  jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" })

// ================= AUTH =================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) return res.status(400).json({ message: "User exists" })

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashed,
    })

    res.json({ token: generateToken(user), user })
  } catch (err) {
    res.status(500).json({ message: "Signup error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "Invalid" })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ message: "Invalid" })

    res.json({ token: generateToken(user), user })
  } catch {
    res.status(500).json({ message: "Login error" })
  }
})

// ================= PRODUCTS =================
app.get("/api/products", async (req, res) => {
  const data = await Product.find()
  res.json(data)
})

app.post("/api/products", async (req, res) => {
  const data = await Product.create(req.body)
  res.json(data)
})

app.delete("/api/products/:id", async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: "Product not found" })
  res.json({ message: "Deleted" })
})

app.put("/api/products/:id", async (req, res) => {
  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  if (!updated) {
    return res.status(404).json({ message: "Product not found" })
  }

  res.json(updated)
})
// ================= USERS =================
app.get("/api/users", async (req, res) => {
  const users = await User.find().select("-password")
  res.json(users)
})

app.delete("/api/users/:id", async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: "User not found" })
  res.json({ message: "User deleted" })
})

// ================= ORDERS =================
app.get("/api/orders", async (req, res) => {
  const orders = await Order.find().populate("user", "name email")
  res.json(orders)
})

// GET MY ORDERS
app.get("/api/orders/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token" })
    }

    const decoded = jwt.verify(token, JWT_SECRET)

    const orders = await Order.find({ user: decoded.id })
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (err) {
    res.status(401).json({ message: "Invalid token" })
  }
})

app.post("/api/orders", async (req, res) => {
  try {
    const { items, userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items required" })
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
      status: "pending",
    })

    res.json(order)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Order error" })
  }
})

app.put("/api/orders/:id", async (req, res) => {
  const { status } = req.body

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate("user", "name email")

  if (!order) return res.status(404).json({ message: "Order not found" })

  res.json(order)
})

// ================= DASHBOARD =================
app.get("/api/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()

    const orders = await Order.find()

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    )

    const stockAgg = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: "$stock" } } }
    ])

    const totalStock = stockAgg[0]?.totalStock || 0

    // ✅ ADD THIS (VERY IMPORTANT)
    const statusCounts = {
      pending: await Order.countDocuments({ status: "pending" }),
      success: await Order.countDocuments({ status: "success" }),
      complete: await Order.countDocuments({ status: "complete" }),
      cancel: await Order.countDocuments({ status: "cancel" }),
    }

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalStock,
      statusCounts, // ✅ REQUIRED
    })
  } catch (err) {
    res.status(500).json({ message: "Dashboard error" })
  }
})

// ================= IMAGE UPLOAD =================
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ message: "No file" })

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    const result = await cloudinary.uploader.upload(dataUri)

    res.json({ url: result.secure_url })
  } catch {
    res.status(500).json({ message: "Upload failed" })
  }
})

// ================= PAYMENT =================
app.use("/api/payment", paymentRoutes)

// ================= STATIC =================
app.use(express.static(staticPath))

// ================= API 404 FIX =================
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" })
})

// ================= FRONTEND =================
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"))
})

// ================= DB =================
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected")
    const server = app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    )
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${PORT} is in use, trying ${PORT + 1}...`)
        const altServer = app.listen(PORT + 1, () =>
          console.log(`🚀 Server running on http://localhost:${PORT + 1}`)
        )
      } else {
        console.error(err)
      }
    })
  })
  .catch(console.error)