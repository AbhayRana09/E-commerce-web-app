"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getMyOrders, cancelOrder } from "@/lib/orders";
import { useToast } from "@/context/ToastContext";
import RouteGuard from "@/components/RouteGuard";
import { MoreVertical, FileText, XCircle } from "lucide-react";

function OrdersContent() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

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

  // Close 3-dot dropdown on click outside
  useEffect(() => {
    function handleClickOutside() {
      setActiveDropdownId(null);
    }
    if (activeDropdownId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeDropdownId]);

  const handleOpenCancelModal = (order) => {
    setActiveDropdownId(null);
    setOrderToCancel(order);
    setCancelReason("");
  };

  const handleConfirmCancel = async (e) => {
    if (e) e.preventDefault();
    if (!orderToCancel) return;
    try {
      setCancelling(true);
      await cancelOrder(orderToCancel.id, cancelReason.trim());
      showToast(`Order #${orderToCancel.id} has been cancelled successfully.`, "success");
      setOrderToCancel(null);
      setCancelReason("");
      if (selectedOrder && selectedOrder.id === orderToCancel.id) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: "CANCELLED",
                cancellation_reason: cancelReason.trim() || "Cancelled by customer",
              }
            : null
        );
      }
      await fetchOrders();
    } catch (err) {
      showToast(err.message || "Failed to cancel order", "error");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!selectedOrder && !orderToCancel) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (orderToCancel) setOrderToCancel(null);
        else if (selectedOrder) setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrder, orderToCancel]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "PROCESSING":
        return "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/20";
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDD6C8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2A29] tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track, view receipts, and monitor the delivery status of your purchases.
          </p>
        </div>

        <Link
          href="/"
          className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Shop More Items &rarr;</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-stone-500">
          <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-24 text-center max-w-xl mx-auto space-y-5 bg-[#ECE8DF] p-10 sm:p-12 rounded-3xl border border-[#DDD6C8] shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-[#FFFFFF] text-stone-400 border border-[#D8D4CE] flex items-center justify-center mx-auto text-3xl shadow-xs">
            📦
          </div>
          <h2 className="text-2xl font-bold text-[#2C2A29]">No Orders Found</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            You haven&apos;t placed any orders yet. Discover our premium collection and start shopping today.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 bg-[#1E3A5F] hover:bg-[#152843] text-white text-sm font-semibold px-6 py-3 rounded-2xl transition shadow-xs"
          >
            Explore Catalog &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#ECE8DF] border border-[#DDD6C8] hover:border-[#1E3A5F]/60 rounded-3xl p-5 sm:p-7 transition shadow-xs space-y-5"
            >
              {/* Order Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DDD6C8]">
                <div className="flex items-center gap-3">
                  <span className="bg-[#FFFFFF] border border-[#D8D4CE] px-3 py-1 rounded-xl text-[#2C2A29] font-bold text-xs sm:text-sm font-mono shadow-xs">
                    Order #{order.id}
                  </span>
                  <span className="text-xs sm:text-sm text-stone-600 font-medium">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Top Right: Status Badge & 3-Dot Dropdown Menu */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  {/* 3-Dot Action Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId((prev) => (prev === order.id ? null : order.id));
                      }}
                      className="w-8 h-8 rounded-xl bg-[#FFFFFF] hover:bg-[#ECE8DF] border border-[#D8D4CE] flex items-center justify-center text-[#2C2A29] transition cursor-pointer shadow-xs"
                      title="More Options"
                      aria-label="Order actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdownId === order.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1.5 w-44 bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDropdownId(null);
                            setSelectedOrder(order);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer text-left"
                        >
                          <FileText className="w-4 h-4 text-[#1E3A5F]" />
                          <span>View Receipt</span>
                        </button>

                        {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancelModal(order)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                          >
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Products List */}
              <div className="divide-y divide-[#DDD6C8]">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    {/* Left: Product Thumbnail & Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#FFFFFF] border border-[#D8D4CE] overflow-hidden shrink-0 shadow-xs relative">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                            Item
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <h4 className="font-bold text-sm sm:text-base text-[#2C2A29] line-clamp-1 break-words">
                          {item.product?.name || "Product Item"}
                        </h4>
                        <div className="flex items-center gap-2.5 text-xs text-stone-600 font-medium pt-0.5">
                          <span className="bg-[#FFFFFF] px-2.5 py-0.5 rounded-lg border border-[#D8D4CE] shadow-xs">
                            Qty: <strong className="text-[#2C2A29]">{item.quantity}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Footer: Total Paid */}
              <div className="pt-4 border-t border-[#DDD6C8] flex items-center justify-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-stone-500 uppercase font-semibold tracking-wider">
                    Total Paid:
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#2C2A29] font-mono">
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-3xl sm:max-w-4xl w-[95vw] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden cursor-default animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDD6C8] px-6 sm:px-8 py-5 shrink-0 bg-[#F7F5F0]">
              <div>
                <h2 className="text-xl font-bold text-[#2C2A29]">Order #{selectedOrder.id} Receipt</h2>
                <span className="text-xs text-stone-500 font-mono">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-[#2C2A29] transition p-2 rounded-xl hover:bg-[#ECE8DF] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Inner Body */}
            <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-6">
              {/* Cancellation Reason Notice if Cancelled */}
              {selectedOrder.status === "CANCELLED" && selectedOrder.cancellation_reason && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs sm:text-sm text-rose-700 flex items-start gap-3">
                  <span className="text-base">ℹ️</span>
                  <div>
                    <span className="font-bold text-rose-800 block">Cancellation Reason</span>
                    <p className="mt-0.5 italic text-stone-700 break-words [overflow-wrap:anywhere]">
                      &ldquo;{selectedOrder.cancellation_reason}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {selectedOrder.address && (
                <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-5 text-sm space-y-1.5 min-w-0 overflow-hidden shadow-xs">
                  <span className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider block">
                    Delivery Destination
                  </span>
                  <p className="text-[#2C2A29] font-bold truncate">{selectedOrder.user?.first_name} {selectedOrder.user?.last_name}</p>
                  <p className="text-stone-600 break-words [overflow-wrap:anywhere]">
                    {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.postal_code}, {selectedOrder.address.country}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Ordered Items
                </span>
                <div className="divide-y divide-[#DDD6C8] bg-[#ECE8DF] rounded-2xl border border-[#DDD6C8] p-4 text-sm shadow-xs">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <span className="text-[#2C2A29] font-medium truncate">
                        {item.product?.name} &times; {item.quantity}
                      </span>
                      <span className="font-mono text-[#2C2A29] font-bold text-sm">
                        ${(item.quantity * item.price_at_purchase).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-5 space-y-2.5 text-sm shadow-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#2C2A29]">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-[#2C2A29]">
                    {selectedOrder.shipping_cost === 0 ? "FREE" : `$${selectedOrder.shipping_cost.toFixed(2)}`}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-800">
                    <span>Discount ({selectedOrder.coupon_code || "COUPON"})</span>
                    <span className="font-mono font-bold">-${selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#DDD6C8] flex items-center justify-between font-bold text-base">
                  <span className="text-[#2C2A29]">
                    {selectedOrder.payment_status === "PAID" ? "Total Amount Paid" : "Total Amount Payable"}
                  </span>
                  <span className="text-[#2C2A29] font-mono text-xl">${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#DDD6C8] px-6 sm:px-8 py-4 shrink-0 bg-[#F7F5F0]">
              {(selectedOrder.status === "PENDING" || selectedOrder.status === "CONFIRMED") ? (
                <button
                  type="button"
                  onClick={() => {
                    const orderToCancelTarget = selectedOrder;
                    setSelectedOrder(null);
                    handleOpenCancelModal(orderToCancelTarget);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition border border-rose-200 cursor-pointer shadow-xs"
                >
                  Cancel This Order
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer border border-[#D8D4CE] shadow-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Reason Input Modal (Max 100 letters limit) */}
      {orderToCancel && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !cancelling) {
              setOrderToCancel(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-[#DDD6C8] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#2C2A29] tracking-tight">
                  Cancel Order #{orderToCancel.id}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Reserved items will be released back to inventory.
                </p>
              </div>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setOrderToCancel(null)}
                className="text-stone-400 hover:text-[#2C2A29] p-1 rounded-lg hover:bg-[#ECE8DF] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-stone-700 text-xs font-semibold uppercase tracking-wider">
                    Reason for Cancellation <span className="text-stone-500 font-normal lowercase">(optional)</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      cancelReason.length >= 100
                        ? "text-red-600 font-bold"
                        : cancelReason.length >= 80
                        ? "text-amber-600"
                        : "text-stone-400"
                    }`}
                  >
                    {cancelReason.length}/100
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  autoFocus
                  disabled={cancelling}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Ordered by mistake, wrong shipping address, change of mind..."
                  className="w-full bg-[#FFFFFF] border border-[#D8D4CE] focus:border-red-500 rounded-xl px-4 py-3 text-[#2C2A29] text-xs sm:text-sm focus:outline-none transition placeholder:text-stone-400 shadow-xs"
                />
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Max 100 letters limit.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDD6C8]">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setOrderToCancel(null)}
                  className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold px-4 py-2.5 rounded-xl transition border border-[#D8D4CE] cursor-pointer shadow-xs"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Order</span>
                  )}
                </button>
              </div>
            </form>
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
