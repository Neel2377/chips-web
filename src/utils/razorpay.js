/* eslint-disable no-undef */
import Razorpay from "razorpay"

if (!process.env.VITE_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    "❌ Razorpay keys missing. Check your .env file (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)"
  )
}

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export default razorpay