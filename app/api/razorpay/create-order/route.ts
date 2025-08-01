import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_5SW7TjdeeGzqoU",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "MafoLpyJ9iJdqaKKKDf7HLkZ",
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, receipt } = await request.json()

    const options = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: receipt,
    }

    const order = await razorpay.orders.create(options)

    // Return order with key_id for client-side usage
    return NextResponse.json({
      ...order,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_5SW7TjdeeGzqoU",
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
