import api from "./api";

/**
 * Fetch all saved addresses for current user
 */
export async function getAddresses() {
  return await api.get("/api/addresses");
}

/**
 * Create a new address
 */
export async function createAddress(data) {
  return await api.post("/api/addresses", data);
}

/**
 * Update an existing address
 */
export async function updateAddress(id, data) {
  return await api.put(`/api/addresses/${id}`, data);
}

/**
 * Delete an address
 */
export async function deleteAddress(id) {
  return await api.delete(`/api/addresses/${id}`);
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(id) {
  return await api.patch(`/api/addresses/${id}/default`);
}
