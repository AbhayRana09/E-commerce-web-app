import api from "./api";

/**
 * Fetch list of categories
 */
export async function getCategories() {
  return await api.get("/api/categories");
}

/**
 * Fetch paginated list of products with filters
 * @param {Object} params - { search, category_id, min_price, max_price, sort, page, limit }
 */
export async function getProducts(params = {}) {
  const query = new URLSearchParams();

  if (params.search) query.append("search", params.search);
  if (params.category_id) query.append("category_id", params.category_id);
  if (params.min_price) query.append("min_price", params.min_price);
  if (params.max_price) query.append("max_price", params.max_price);
  if (params.sort) query.append("sort", params.sort);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  const queryString = query.toString();
  const url = `/api/products${queryString ? `?${queryString}` : ""}`;
  return await api.get(url);
}

/**
 * Fetch product details by slug
 */
export async function getProductBySlug(slug) {
  return await api.get(`/api/products/${slug}`);
}
