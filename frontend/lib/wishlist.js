import api from "./api";

/**
 * Fetch the authenticated user's wishlist
 */
export async function getWishlist() {
  return await api.get("/api/wishlist");
}

/**
 * Toggle a product in wishlist (add if not present, remove if present)
 * @param {number} productId 
 */
export async function toggleWishlist(productId) {
  return await api.post(`/api/wishlist/toggle/${productId}`);
}

/**
 * Explicitly add a product to the wishlist
 * @param {number} productId 
 */
export async function addToWishlist(productId) {
  return await api.post(`/api/wishlist/${productId}`);
}

/**
 * Remove a specific product from wishlist
 * @param {number} productId 
 */
export async function removeFromWishlist(productId) {
  return await api.delete(`/api/wishlist/${productId}`);
}

/**
 * Move a wishlist item into shopping cart atomically
 * @param {number} productId 
 */
export async function moveWishlistItemToCart(productId) {
  return await api.post(`/api/wishlist/${productId}/move-to-cart`);
}

/**
 * Empty the user's wishlist
 */
export async function clearWishlist() {
  return await api.delete("/api/wishlist/clear/all");
}
