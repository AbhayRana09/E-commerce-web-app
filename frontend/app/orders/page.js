"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getMyOrders } from "@/lib/orders";
import { useToast } from "@/context/ToastContext";
import RouteGuard from "@/components/RouteGuard";

function OrdersContent() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data || []);
    } catch (err) {
      showToast(err.message || "Failed to load orders history", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "SHIPPED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "PROCESSING":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "CONFIRMED":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track, view receipts, and monitor the delivery status of your purchases.
          </p>
        </div>

        <Link
          href="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Shop More Items &rarr;</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-24 text-center max-w-xl mx-auto space-y-5 bg-slate-900/40 p-10 sm:p-12 rounded-3xl border border-slate-800">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center mx-auto text-3xl">
            📦
          </div>
          <h2 className="text-2xl font-bold text-white">No Orders Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            You haven&apos;t placed any orders yet. Discover our premium collection and start shopping today.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-2xl transition shadow-md shadow-indigo-600/20"
          >
            Explore Catalog &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-8 transition shadow-xl space-y-5"
            >
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-4 font-mono">
                  <span className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-white font-bold text-sm">
                    Order #{order.id}
                  </span>
                  <span className="text-slate-400">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-slate-500">
                    • Method: <strong className="text-slate-300">{order.payment_method === "MOCK_CARD" ? "Card" : order.payment_method === "MOCK_UPI" ? "UPI" : order.payment_method || "Card"}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition border border-slate-700 cursor-pointer"
                  >
                    View Receipt
                  </button>
                </div>
              </div>

              {/* Items Thumbnails & Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4 overflow-x-auto py-1">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative group"
                      title={`${item.product?.name} (${item.quantity}x)`}
                    >
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                          Item
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 bg-slate-950/90 text-indigo-300 font-mono text-xs font-bold px-1.5 rounded-tl-lg">
                        &times;{item.quantity}
                      </span>
                    </div>
                  ))}
                  <span className="text-sm text-slate-400 font-medium pl-2">
                    {order.items?.length} item{order.items?.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs text-slate-500 uppercase block font-semibold">Total Paid</span>
                  <span className="text-2xl font-extrabold text-white font-mono">
                    ${Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged Order Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl sm:max-w-4xl w-[95vw] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Order #{selectedOrder.id} Receipt</h2>
                <span className="text-xs text-slate-400 font-mono">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white transition p-2 rounded-xl hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Delivery Address */}
            {selectedOrder.address && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-sm space-y-1.5 min-w-0 overflow-hidden">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <p className="text-slate-200 font-bold truncate">{selectedOrder.user?.first_name} {selectedOrder.user?.last_name}</p>
                <p className="text-slate-300 break-words [overflow-wrap:anywhere]">
                  {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.postal_code}, {selectedOrder.address.country}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Ordered Items
              </span>
              <div className="divide-y divide-slate-800/60 bg-slate-950/40 rounded-2xl border border-slate-800 p-4 text-sm">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <span className="text-slate-200 font-medium truncate">
                      {item.product?.name} &times; {item.quantity}
                    </span>
                    <span className="font-mono text-white font-bold text-sm">
                      ${(item.quantity * item.price_at_purchase).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="font-mono text-slate-200">
                  {selectedOrder.shipping_cost === 0 ? "FREE" : `$${selectedOrder.shipping_cost.toFixed(2)}`}
                </span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Discount ({selectedOrder.coupon_code || "COUPON"})</span>
                  <span className="font-mono font-bold">-${selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-bold text-base">
                <span className="text-white">Total Amount Paid</span>
                <span className="text-white font-mono text-xl">${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RouteGuard type="customer" adminRedirect="/admin">
      <OrdersContent />
    </RouteGuard>
  );
}
