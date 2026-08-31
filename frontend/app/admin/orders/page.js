"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminOrders, updateAdminOrderStatus } from "@/lib/admin";
import { useToast } from "@/context/ToastContext";
import {
  MoreVertical,
  FileText,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Finite State Machine (FSM): strictly allowed next transitions
const ALLOWED_ADMIN_TRANSITIONS = {
  CONFIRMED: [
    {
      target: "PROCESSING",
      label: "Mark as Processing",
      icon: Package,
      color: "text-[#1E3A5F] hover:bg-[#1E3A5F]/10",
      description: "Send this order to warehouse for packaging.",
    },
    {
      target: "CANCELLED",
      label: "Cancel Order",
      icon: XCircle,
      color: "text-rose-600 hover:bg-rose-50",
      description: "Cancel this order and automatically restore products back into inventory.",
      isDestructive: true,
    },
  ],
  PROCESSING: [
    {
      target: "SHIPPED",
      label: "Mark as Shipped",
      icon: Truck,
      color: "text-purple-700 hover:bg-purple-50",
      description: "Dispatched with courier and en-route to customer.",
    },
    {
      target: "CANCELLED",
      label: "Cancel Order",
      icon: XCircle,
      color: "text-rose-600 hover:bg-rose-50",
      description: "Cancel this order and automatically restore products back into inventory.",
      isDestructive: true,
    },
  ],
  SHIPPED: [
    {
      target: "DELIVERED",
      label: "Mark as Delivered",
      icon: CheckCircle2,
      color: "text-emerald-700 hover:bg-emerald-50",
      description: "Package has reached customer doorstep. Customer can now review products.",
    },
    {
      target: "CANCELLED",
      label: "Cancel Order (RTO)",
      icon: XCircle,
      color: "text-rose-600 hover:bg-rose-50",
      description: "Mark as Return to Origin / Cancelled and restore product stock.",
      isDestructive: true,
    },
  ],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusConfirmModal, setStatusConfirmModal] = useState(null); // { order, targetStatus, label, description, isDestructive }

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

  // Click outside to close 3-dot dropdown
  useEffect(() => {
    function handleClickOutside() {
      setActiveDropdownId(null);
    }
    if (activeDropdownId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeDropdownId]);

  // Escape key handler for modals
  useEffect(() => {
    if (!selectedOrder && !statusConfirmModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (statusConfirmModal && !updatingStatus) setStatusConfirmModal(null);
        else if (selectedOrder) setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrder, statusConfirmModal, updatingStatus]);

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmModal) return;
    const { order, targetStatus } = statusConfirmModal;
    try {
      setUpdatingStatus(true);
      const updated = await updateAdminOrderStatus(order.id, targetStatus);
      showToast(`Order #${order.id} status updated to ${targetStatus}`, "success");

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: updated.status,
                payment_status: updated.payment_status || (targetStatus === "DELIVERED" ? "PAID" : o.payment_status),
              }
            : o
        )
      );
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder((prev) => ({
          ...prev,
          status: updated.status,
          payment_status: updated.payment_status || (targetStatus === "DELIVERED" ? "PAID" : prev.payment_status),
        }));
      }
      setStatusConfirmModal(null);
    } catch (err) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center justify-center min-w-[92px] gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Confirmed
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center justify-center min-w-[92px] gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] animate-pulse"></span>
            Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center justify-center min-w-[92px] gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Shipped
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center justify-center min-w-[92px] gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Delivered
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center justify-center min-w-[92px] gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center min-w-[92px] px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECE8DF] text-stone-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus, orderStatus) => {
    const isPaid = paymentStatus === "PAID" || orderStatus === "DELIVERED";
    if (isPaid) {
      return (
        <span className="inline-flex items-center justify-center min-w-[76px] gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-[76px] gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Pending
      </span>
    );
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
            Track customer orders, manage fulfillment lifecycle, and view receipts ({totalCount} orders found).
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
      <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl shadow-xs">
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
                  <th className="px-5 py-4">Order Status</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C8]">
                {orders.map((order) => {
                  const allowedTransitions = ALLOWED_ADMIN_TRANSITIONS[order.status] || [];

                  return (
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
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-5 py-4">
                        {getPaymentStatusBadge(order.payment_status, order.status)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {/* 3-Dot Dropdown Menu for Admin Actions */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId((prev) => (prev === order.id ? null : order.id));
                            }}
                            className="w-8 h-8 rounded-xl bg-[#FFFFFF] hover:bg-[#ECE8DF] border border-[#D8D4CE] flex items-center justify-center text-[#2C2A29] transition cursor-pointer shadow-xs"
                            title="Order Options"
                            aria-label="Order actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdownId === order.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-1.5 w-52 bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-left"
                            >
                              {/* View Details / Receipt */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setSelectedOrder(order);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer text-left"
                              >
                                <FileText className="w-4 h-4 text-[#1E3A5F] shrink-0" />
                                <span>View Details</span>
                              </button>

                              {/* Allowed Lifecycle Transitions */}
                              {allowedTransitions.length > 0 && (
                                <>
                                  <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-t border-[#DDD6C8] mt-1">
                                    Change Status
                                  </div>
                                  {allowedTransitions.map((t) => {
                                    const IconComponent = t.icon;
                                    return (
                                      <button
                                        key={t.target}
                                        type="button"
                                        onClick={() => {
                                          setActiveDropdownId(null);
                                          setStatusConfirmModal({
                                            order,
                                            targetStatus: t.target,
                                            label: t.label,
                                            description: t.description,
                                            isDestructive: t.isDestructive,
                                          });
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${t.color}`}
                                      >
                                        <IconComponent className="w-4 h-4 shrink-0" />
                                        <span>{t.label}</span>
                                      </button>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Status Change Confirmation Modal */}
      {statusConfirmModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !updatingStatus) {
              setStatusConfirmModal(null);
            }
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 cursor-default animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  statusConfirmModal.isDestructive
                    ? "bg-rose-100 border border-rose-200 text-rose-600"
                    : "bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 text-[#1E3A5F]"
                }`}
              >
                {statusConfirmModal.isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C2A29]">
                  {statusConfirmModal.label}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Order #{statusConfirmModal.order.id}
                </p>
              </div>
            </div>

            <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-4 space-y-2 text-xs text-stone-700">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-stone-500">Current Status:</span>
                <span>{getStatusBadge(statusConfirmModal.order.status)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-stone-500">Target Status:</span>
                <span>{getStatusBadge(statusConfirmModal.targetStatus)}</span>
              </div>
              <p className="text-stone-600 pt-2 border-t border-[#DDD6C8] leading-relaxed">
                {statusConfirmModal.description}
              </p>
            </div>

            {statusConfirmModal.isDestructive && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5 font-medium">
                ⚠️ Cancelling will immediately return all {statusConfirmModal.order.items?.length || 0} product(s) back to active store stock.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => setStatusConfirmModal(null)}
                className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold px-4 py-2.5 rounded-xl transition border border-[#D8D4CE] cursor-pointer shadow-xs"
              >
                Keep Current Status
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleConfirmStatusChange}
                className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 ${
                  statusConfirmModal.isDestructive
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-[#1E3A5F] hover:bg-[#152843]"
                }`}
              >
                {updatingStatus ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Confirm {statusConfirmModal.label}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
            }
          }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDD6C8] px-6 sm:px-8 py-5 shrink-0 bg-[#F7F5F0]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-[#2C2A29] tracking-tight">
                    Order #{selectedOrder.id}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedOrder.status)}
                    {getPaymentStatusBadge(selectedOrder.payment_status, selectedOrder.status)}
                  </div>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-[#2C2A29] p-1.5 rounded-lg hover:bg-[#ECE8DF] transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Inner Scrollable Body */}
            <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-6">
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
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-start gap-3">
                  <span className="text-base">⚠️</span>
                  <div>
                    <span className="font-bold text-rose-800 block">Cancellation Reason</span>
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
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#DDD6C8] px-6 sm:px-8 py-4 shrink-0 bg-[#F7F5F0]">
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
