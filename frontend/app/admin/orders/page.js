"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminOrders, updateAdminOrderStatus } from "@/lib/admin";
import { useToast } from "@/context/ToastContext";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State for Viewing Order Details
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getAdminOrders({
        search: searchTerm.trim(),
        status: selectedStatus,
        page,
        limit: 10,
      });
      setOrders(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      showToast(err.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, page, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!selectedOrder) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrder]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const updated = await updateAdminOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} status updated to ${newStatus}`, "success");
      
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: updated.status }));
      }
    } catch (err) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-400";
      case "CONFIRMED":
        return "bg-sky-50 text-sky-800 border-sky-300 hover:border-sky-400";
      case "PROCESSING":
        return "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/30 hover:border-[#1E3A5F]";
      case "SHIPPED":
        return "bg-purple-50 text-purple-800 border-purple-300 hover:border-purple-400";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-400";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-300 hover:border-rose-400";
      default:
        return "bg-[#FFFFFF] text-[#2C2A29] border-[#D8D4CE] hover:border-stone-400";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Confirmed
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] animate-pulse"></span>
            Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Shipped
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Delivered
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECE8DF] text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C2A29]">
            Order Management
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Track customer orders, manage fulfillment stages, and view invoices ({totalCount} orders found).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-4 py-2.5 pl-10 text-sm text-[#2C2A29] placeholder-stone-400 focus:outline-none focus:border-[#1E3A5F] transition shadow-xs"
          />
          <svg
            className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-3.5 py-2.5 text-sm text-[#2C2A29] focus:outline-none focus:border-[#1E3A5F] transition cursor-pointer shadow-xs"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {(searchTerm || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("all");
                setPage(1);
              }}
              className="text-xs text-[#1E3A5F] hover:text-[#152843] font-semibold px-2 py-1 transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-stone-500 space-y-3">
            <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-stone-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#D8D4CE] flex items-center justify-center mx-auto text-stone-400 text-xl shadow-xs">
              📦
            </div>
            <div>
              <p className="text-base font-semibold text-[#2C2A29]">No orders found</p>
              <p className="text-xs text-stone-500 mt-1">
                {searchTerm || selectedStatus !== "all"
                  ? "Try refining your search terms or filter."
                  : "Customer orders will appear here once placed."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2C2A29]">
              <thead className="bg-[#ECE8DF] border-b border-[#DDD6C8] text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C8]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFFFFF] transition">
                    <td className="px-5 py-4 font-mono font-bold text-[#2C2A29] text-xs">
                      #{order.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#2C2A29]">
                        {order.user ? `${order.user.first_name} ${order.user.last_name}` : "Guest Customer"}
                      </div>
                      <div className="text-xs text-stone-500">
                        {order.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-600">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-600">
                      {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#2C2A29] font-mono">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative inline-flex items-center">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full border transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColorClass(
                            order.status
                          )}`}
                          title="Click to update order status"
                        >
                          <option value="PENDING" className="bg-[#FFFFFF] text-amber-800 py-1">Pending</option>
                          <option value="CONFIRMED" className="bg-[#FFFFFF] text-sky-800 py-1">Confirmed</option>
                          <option value="PROCESSING" className="bg-[#FFFFFF] text-[#1E3A5F] py-1">Processing</option>
                          <option value="SHIPPED" className="bg-[#FFFFFF] text-purple-800 py-1">Shipped</option>
                          <option value="DELIVERED" className="bg-[#FFFFFF] text-emerald-800 py-1">Delivered</option>
                          <option value="CANCELLED" className="bg-[#FFFFFF] text-rose-800 py-1">Cancelled</option>
                        </select>
                        <div className="pointer-events-none absolute right-2 flex items-center text-current opacity-70">
                          {updatingId === order.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-[#FFFFFF] hover:bg-[#1E3A5F] text-[#1E3A5F] hover:text-white border border-[#D8D4CE] text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#DDD6C8] flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] disabled:opacity-40 text-[#2C2A29] text-xs font-semibold px-3.5 py-1.5 rounded-xl transition cursor-pointer border border-[#D8D4CE] shadow-xs"
            >
              Previous
            </button>
            <span className="text-xs text-stone-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] disabled:opacity-40 text-[#2C2A29] text-xs font-semibold px-3.5 py-1.5 rounded-xl transition cursor-pointer border border-[#D8D4CE] shadow-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
            }
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDD6C8] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#2C2A29] tracking-tight">
                    Order #{selectedOrder.id}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-[#2C2A29] p-1 rounded-lg hover:bg-[#ECE8DF] transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-4 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Customer Information
                </span>
                <p className="text-sm font-semibold text-[#2C2A29]">
                  {selectedOrder.user ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}` : "Guest Customer"}
                </p>
                <p className="text-xs text-stone-600">{selectedOrder.user?.email || "No email"}</p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-4 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Delivery Address
                </span>
                {selectedOrder.address ? (
                  <p className="text-xs text-[#2C2A29] leading-relaxed">
                    {selectedOrder.address.street}<br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.postal_code}<br />
                    {selectedOrder.address.country}
                  </p>
                ) : (
                  <p className="text-xs text-stone-500">No address recorded</p>
                )}
              </div>
            </div>

            {/* Cancellation Reason if Cancelled */}
            {selectedOrder.status === "CANCELLED" && selectedOrder.cancellation_reason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-start gap-3">
                <span className="text-base">⚠️</span>
                <div>
                  <span className="font-bold text-red-800 block">Cancellation Reason</span>
                  <p className="mt-0.5 italic text-stone-700 break-words [overflow-wrap:anywhere]">
                    &ldquo;{selectedOrder.cancellation_reason}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Purchased Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="border border-[#D8D4CE] rounded-2xl divide-y divide-[#D8D4CE] overflow-hidden shadow-xs">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between bg-[#FFFFFF]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F7F5F0] border border-[#D8D4CE] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-stone-400">🛍️</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#2C2A29]">
                          {item.product?.name || `Product #${item.product_id}`}
                        </p>
                        <p className="text-[11px] text-stone-600">
                          ${item.price_at_purchase.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2C2A29] font-mono">
                      ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-4 space-y-2 text-xs shadow-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono text-[#2C2A29]">${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Cost</span>
                <span className="font-mono text-[#2C2A29]">${selectedOrder.shipping_cost.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied</span>
                  <span className="font-mono">-${selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#D8D4CE] flex justify-between text-sm font-bold text-[#2C2A29]">
                <span>Total Amount</span>
                <span className="font-mono text-[#1E3A5F]">${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] font-semibold py-2.5 rounded-xl transition text-xs cursor-pointer border border-[#D8D4CE] shadow-xs"
              >
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
