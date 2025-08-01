import { supabase, type Order, type Address } from "./supabase"

export const createOrder = async (
  userId: string,
  cartItems: any[],
  deliveryAddress: Address,
  paymentMethod = "cod",
  notes?: string,
) => {
  const orderNumber = `NVS${Date.now()}`
  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity
  }, 0)

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: userId,
        order_number: orderNumber,
        status: "pending",
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        payment_status: "pending",
        notes,
      },
    ])
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.products?.price || 0,
    total_price: (item.products?.price || 0) * item.quantity,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) throw itemsError

  // Clear cart
  const { error: cartError } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (cartError) throw cartError

  return order
}

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          id,
          name,
          image_url,
          unit
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Order[]
}

export const getOrder = async (orderId: string, userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          id,
          name,
          image_url,
          unit
        )
      )
    `)
    .eq("id", orderId)
    .eq("user_id", userId)
    .single()

  if (error) throw error
  return data as Order
}
