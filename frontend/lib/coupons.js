import api from "./api";

/**
 * Validate coupon code against subtotal during customer checkout
 */
export async function validateCoupon(code, subtotal) {
  return await api.post("/api/coupons/validate", {
    code,
    subtotal: Number(subtotal),
  });
}

/**
 * Fetch publicly active promotions & available coupon offers for checkout
 */
export async function getActiveOffers() {
  return await api.get("/api/coupons/public/active");
}

/**
 * Admin: List all coupons
 */
export async function getAdminCoupons(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return await api.get(`/api/coupons${query}`);
}

/**
 * Admin: Create coupon
 */
export async function createAdminCoupon(couponData) {
  return await api.post("/api/coupons", couponData);
}

/**
 * Admin: Update coupon
 */
export async function updateAdminCoupon(id, couponData) {
  return await api.put(`/api/coupons/${id}`, couponData);
}

/**
 * Admin: Toggle coupon active status
 */
export async function toggleAdminCouponStatus(id) {
  return await api.patch(`/api/coupons/${id}/toggle-active`);
}

/**
 * Admin: Delete coupon
 */
export async function deleteAdminCoupon(id) {
  return await api.delete(`/api/coupons/${id}`);
}
