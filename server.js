/* eslint-disable no-undef */
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Product from './models/Product.js'
import User from './models/User.js'
import Order from './models/Order.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bneel289_db_user:12345@clusterimage.hibhquq.mongodb.net/chips-web'
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@chips.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing' })
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, JWT_SECRET, (error, payload) => {
    if (error) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    req.user = payload
    next()
  })
}

const authorizeRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Access denied' })
  }
  next()
}

const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      if (!existingAdmin.password.startsWith('$2')) {
        existingAdmin.password = await bcrypt.hash(existingAdmin.password, 10)
        await existingAdmin.save()
        console.log('Existing admin password was unhashed and has been secured.')
      }
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    })
    console.log('Default admin user created:')
    console.log(`  email: ${ADMIN_EMAIL}`)
    console.log(`  password: ${ADMIN_PASSWORD}`)
  } catch (error) {
    console.error('Error creating default admin user:', error.message)
  }
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    })

    const token = generateToken(user)
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Unable to create user' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user)
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Unable to log in' })
  }
})

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Unable to load user profile' })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 })
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load products' })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load product' })
  }
})

app.post('/api/products', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const product = new Product(req.body)
    const savedProduct = await product.save()
    res.status(201).json(savedProduct)
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: 'Could not create product' })
  }
})

app.put('/api/products/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: 'Could not update product' })
  }
})

app.delete('/api/products/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not delete product' })
  }
})

app.get('/api/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not load users' })
  }
})

app.delete('/api/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin account' })
    }
    await user.deleteOne()
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not delete user' })
  }
})

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' })
    }

    const productIds = items.map((item) => item._id)
    const products = await Product.find({ _id: { $in: productIds } })
    const orderItems = []
    let total = 0

    for (const item of items) {
      const product = products.find((product) => product._id.toString() === item._id)
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item._id}` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` })
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      })
      total += product.price * item.quantity
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      status: 'pending',
    })

    await Promise.all(
      orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        }),
      ),
    )

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Unable to create order' })
  }
})

app.get('/api/orders/me', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not load your orders' })
  }
})

app.get('/api/orders', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not load orders' })
  }
})

app.get('/api/orders/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not load order' })
  }
})

app.put('/api/orders/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { status } = req.body
    const statuses = ['pending', 'success', 'complete', 'cancel']
    if (!statuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not update order status' })
  }
})

app.get('/api/dashboard', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalOrders = await Order.countDocuments()
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $in: ['success', 'complete'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ])
    const totalStockResult = await Product.aggregate([
      { $group: { _id: null, stock: { $sum: '$stock' } } },
    ])

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
      totalStock: totalStockResult[0]?.stock || 0,
      statusCounts: orderStatusCounts.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not load dashboard stats' })
  }
})

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected')
    await createAdminUser()
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => console.error('MongoDB connection error:', error.message))
