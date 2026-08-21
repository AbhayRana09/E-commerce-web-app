import api from "./api";

/**
 * Place a new order from current cart (Address ID, Coupon Code, Payment Method)
 */
export async function createOrder(data) {
  return await api.post("/api/orders", data);
}

/**
 * Fetch logged-in customer's order history
 */
export async function getMyOrders() {
  return await api.get("/api/orders/my");
}

/**
 * Fetch a single order receipt / detail by ID
 */
export async function getOrderById(orderId) {
  return await api.get(`/api/orders/${orderId}`);
}

/**
 * Simulate payment for an order (Mock Card / UPI / COD)
 */
export async function simulateOrderPayment(orderId, paymentData) {
  return await api.post(`/api/orders/${orderId}/pay`, paymentData);
}
