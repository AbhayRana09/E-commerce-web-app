import api from "./api";

/**
 * Fetch the authenticated user's shopping cart with real-time stock sync
 */
export async function getCart() {
  return await api.get("/api/cart");
}

/**
 * Add a product to the cart or increment its quantity
 * @param {number} productId 
 * @param {number} quantity 
 */
export async function addToCart(productId, quantity = 1) {
  return await api.post("/api/cart/items", {
    product_id: productId,
    quantity,
  });
}

/**
 * Update the quantity of a specific cart item
 * @param {number} itemId 
 * @param {number} quantity 
 */
export async function updateCartItem(itemId, quantity) {
  return await api.put(`/api/cart/items/${itemId}`, {
    quantity,
  });
}

/**
 * Remove a specific cart item
 * @param {number} itemId 
 */
export async function removeCartItem(itemId) {
  return await api.delete(`/api/cart/items/${itemId}`);
}

/**
 * Empty all items from the shopping cart
 */
export async function clearCart() {
  return await api.delete("/api/cart/clear");
}
