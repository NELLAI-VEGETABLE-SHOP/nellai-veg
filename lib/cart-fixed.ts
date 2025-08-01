import { supabase } from "./supabase"
import type { CartItem } from "./supabase"

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching cart items:", error)
      throw error
    }

    return cartItems || []
  } catch (error) {
    console.error("Error in getCartItems:", error)
    throw error
  }
}

export const addToCart = async (userId: string, productId: string, quantity = 1): Promise<void> => {
  try {
    // Check if item already exists in cart
    const { data: existingItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing cart item:", fetchError)
      throw fetchError
    }

    if (existingItem) {
      // Update existing item
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)

      if (updateError) {
        console.error("Error updating cart item:", updateError)
        throw updateError
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })

      if (insertError) {
        console.error("Error adding cart item:", insertError)
        throw insertError
      }
    }
  } catch (error) {
    console.error("Error in addToCart:", error)
    throw error
  }
}

export const updateCartItem = async (cartItemId: string, quantity: number): Promise<void> => {
  try {
    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId)

    if (error) {
      console.error("Error updating cart item:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in updateCartItem:", error)
    throw error
  }
}

export const removeFromCart = async (cartItemId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

    if (error) {
      console.error("Error removing cart item:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in removeFromCart:", error)
    throw error
  }
}

export const clearCart = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in clearCart:", error)
    throw error
  }
}

export const getCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity
  }, 0)
}

export const getCartItemCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((count, item) => count + item.quantity, 0)
}
