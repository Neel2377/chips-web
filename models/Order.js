import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],

  total: {
    type: Number,
    required: true,
    default: 0,
  },

  status: {
    type: String,
    enum: ['pending', 'success', 'complete', 'cancel'],
    default: 'pending',
  },

  // ✅ ADD THESE HERE
  paymentId: {
    type: String,
  },
  orderId: {
    type: String,
  },
  signature: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
export default Order