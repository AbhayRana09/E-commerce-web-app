import api from "./api";

/**
 * Fetch comprehensive overview stats & aggregation metrics for the Admin Dashboard
 */
export async function getAdminStats() {
  return await api.get("/api/orders/admin/stats");
}

/**
 * Fetch all products (active and inactive) for admin management
 */
export async function getAdminProducts() {
  return await api.get("/api/products/admin/all");
}

/**
 * Create a new product (Admin only)
 */
export async function createProduct(data) {
  return await api.post("/api/products", data);
}

/**
 * Update an existing product (Admin only)
 */
export async function updateProduct(id, data) {
  return await api.put(`/api/products/${id}`, data);
}

/**
 * Delete / deactivate a product (Admin only)
 */
export async function deleteProduct(id) {
  return await api.delete(`/api/products/${id}`);
}

/**
 * Create a new category (Admin only)
 */
export async function createCategory(data) {
  return await api.post("/api/categories", data);
}

/**
 * Update an existing category (Admin only)
 */
export async function updateCategory(id, data) {
  return await api.put(`/api/categories/${id}`, data);
}

/**
 * Delete a category (Admin only)
 */
export async function deleteCategory(id) {
  return await api.delete(`/api/categories/${id}`);
}

/**
 * Fetch paginated orders with search and status filters (Admin only)
 */
export async function getAdminOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  const queryString = query.toString();
  const endpoint = `/api/orders/admin${queryString ? `?${queryString}` : ""}`;
  return await api.get(endpoint);
}

/**
 * Fetch full order details by ID (Admin only)
 */
export async function getAdminOrderDetail(orderId) {
  return await api.get(`/api/orders/admin/${orderId}`);
}

/**
 * Update lifecycle status of an order (Admin only)
 */
export async function updateAdminOrderStatus(orderId, newStatus) {
  return await api.patch(`/api/orders/admin/${orderId}/status`, { status: newStatus });
}
