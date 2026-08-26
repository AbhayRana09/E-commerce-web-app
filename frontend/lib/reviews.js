import api from "./api";

/**
 * Fetch review summary, 5-star breakdown, user status, and all reviews for a product
 * @param {number} productId
 */
export async function getProductReviews(productId) {
  return await api.get(`/api/reviews/product/${productId}`);
}

/**
 * Submit a new product review
 * @param {number} productId
 * @param {{ rating: number, comment?: string }} data
 */
export async function createProductReview(productId, data) {
  return await api.post(`/api/reviews/product/${productId}`, data);
}

/**
 * Edit/Update an existing product review
 * @param {number} reviewId
 * @param {{ rating?: number, comment?: string }} data
 */
export async function updateProductReview(reviewId, data) {
  return await api.put(`/api/reviews/${reviewId}`, data);
}

/**
 * Delete a review (by customer or admin)
 * @param {number} reviewId
 */
export async function deleteProductReview(reviewId) {
  return await api.delete(`/api/reviews/${reviewId}`);
}

/**
 * Fetch all reviews written by the currently logged-in user
 */
export async function getMyReviews() {
  return await api.get("/api/reviews/my");
}

/**
 * Admin: Fetch all reviews across products
 */
export async function getAllReviewsAdmin() {
  return await api.get("/api/reviews/admin/all");
}
