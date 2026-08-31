"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getMyOrders, cancelOrder } from "@/lib/orders";
import { getMyReviews, deleteProductReview } from "@/lib/reviews";
import { useToast } from "@/context/ToastContext";
import RouteGuard from "@/components/RouteGuard";
import RateOrderProductModal from "@/components/reviews/RateOrderProductModal";
import {
  MoreVertical,
  FileText,
  XCircle,
  Star,
  Trash2,
  Truck,
  MapPin,
  CheckCircle2,
  Package,
  ShieldCheck,
  Check,
} from "lucide-react";

function OrdersContent() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Reviews state for delivered items
  const [userReviewsMap, setUserReviewsMap] = useState({});
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, reviewsData] = await Promise.all([
        getMyOrders(),
        getMyReviews().catch(() => []),
      ]);
      setOrders(ordersData || []);

      const revMap = {};
      if (Array.isArray(reviewsData)) {
        reviewsData.forEach((rev) => {
          if (rev.product_id) {
            revMap[rev.product_id] = rev;
          }
        });
      }
      setUserReviewsMap(revMap);
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

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      setDeletingReview(true);
      await deleteProductReview(reviewToDelete.id);
      showToast("Review & rating deleted successfully.", "success");
      setReviewToDelete(null);
      await fetchOrders();
    } catch (err) {
      showToast(err.message || "Failed to delete review", "error");
    } finally {
      setDeletingReview(false);
    }
  };

  useEffect(() => {
    if (!selectedOrder && !orderToCancel && !reviewToDelete && !trackingOrder) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (reviewToDelete && !deletingReview) setReviewToDelete(null);
        else if (orderToCancel) setOrderToCancel(null);
        else if (selectedOrder) setSelectedOrder(null);
        else if (trackingOrder) setTrackingOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrder, orderToCancel, reviewToDelete, deletingReview, trackingOrder]);

  const getEstimatedDeliveryDate = (order) => {
    if (!order || !order.created_at) return "3-5 Business Days";
    if (order.status === "DELIVERED") {
      const delDate = new Date(order.updated_at || order.created_at);
      return delDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const date = new Date(order.created_at);
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Shipped
          </span>
        );
      case "PROCESSING":
        return (
          <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] animate-pulse"></span>
            Processing
          </span>
        );
      case "CANCELLED":
        return (
          <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      case "CONFIRMED":
      default:
        return (
          <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Confirmed
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus, orderStatus) => {
    const isPaid = paymentStatus === "PAID" || orderStatus === "DELIVERED";
    if (isPaid) {
      return (
        <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Paid
        </span>
      );
    }
    return (
      <span className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Pending
      </span>
    );
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

                {/* Top Right: Status Badges (Order Status & Payment Status) & 3-Dot Dropdown Menu */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex flex-col items-center w-26 sm:w-28 gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 text-center w-full">Order Status</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex flex-col items-center w-22 sm:w-24 gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 text-center w-full">Payment</span>
                      {getPaymentStatusBadge(order.payment_status, order.status)}
                    </div>
                  </div>

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
                        {/* Track Order Action */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDropdownId(null);
                            setTrackingOrder(order);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#1E3A5F] hover:bg-[#ECE8DF] transition cursor-pointer text-left"
                        >
                          <Truck className="w-4 h-4 text-[#1E3A5F]" />
                          <span>Track Order</span>
                        </button>

                        {/* View Receipt */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDropdownId(null);
                            setSelectedOrder(order);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer text-left"
                        >
                          <FileText className="w-4 h-4 text-stone-600" />
                          <span>View Receipt</span>
                        </button>

                        {/* Review and Rating in 3-Dot Dropdown */}
                        {order.status === "DELIVERED" && order.items?.length === 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveDropdownId(null);
                                setReviewingProduct(order.items[0].product);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer text-left"
                            >
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                              <span>
                                {userReviewsMap[order.items[0].product?.id]
                                  ? "Edit Review & Rating"
                                  : "Review and Rating"}
                              </span>
                            </button>

                            {userReviewsMap[order.items[0].product?.id] && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setReviewToDelete({
                                    id: userReviewsMap[order.items[0].product?.id].id,
                                    productName: order.items[0].product?.name || "this product",
                                  });
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>Delete Review & Rating</span>
                              </button>
                            )}
                          </>
                        )}

                        {order.status === "DELIVERED" && order.items?.length > 1 && (
                          <>
                            <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-t border-[#DDD6C8] mt-1">
                              Reviews & Ratings
                            </div>
                            {order.items.map((item) => {
                              const existingRev = item.product?.id ? userReviewsMap[item.product.id] : null;
                              return (
                                <div key={`dropdown-review-${item.id}`} className="space-y-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDropdownId(null);
                                      setReviewingProduct(item.product);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer text-left"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                    <span className="truncate">
                                      {existingRev ? "Edit:" : "Rate:"} {item.product?.name || "Product"}
                                    </span>
                                  </button>

                                  {existingRev && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        setReviewToDelete({
                                          id: existingRev.id,
                                          productName: item.product?.name || "this product",
                                        });
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left pl-6"
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-500 shrink-0" />
                                      <span>Delete Review</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}

                        {order.status === "CONFIRMED" && (
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

                      <div className="min-w-0 space-y-1.5">
                        <h4 className="font-bold text-sm sm:text-base text-[#2C2A29] line-clamp-1 break-words">
                          {item.product?.name || "Product Item"}
                        </h4>
                        <div className="flex items-center gap-2.5 text-xs text-stone-600 font-medium">
                          <span className="bg-[#FFFFFF] px-2.5 py-0.5 rounded-lg border border-[#D8D4CE] shadow-xs">
                            Qty: <strong className="text-[#2C2A29]">{item.quantity}</strong>
                          </span>
                        </div>

                        {/* Rating Display Under Qty */}
                        {(() => {
                          const userReview = item.product?.id ? userReviewsMap[item.product.id] : null;
                          if (userReview) {
                            return (
                              <div className="flex items-center gap-0.5 pt-0.5" title={`Rated ${userReview.rating} of 5 stars`}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= userReview.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-stone-200 text-stone-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Right: Item Total Price */}
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm sm:text-base font-extrabold text-[#2C2A29]">
                        ${(item.quantity * item.price_at_purchase).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        ${Number(item.price_at_purchase).toFixed(2)} / each
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
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-xl font-bold text-[#2C2A29]">Order #{selectedOrder.id} Receipt</h2>
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center w-24 sm:w-26 gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 text-center w-full">Order Status</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex flex-col items-center w-20 sm:w-22 gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 text-center w-full">Payment</span>
                      {getPaymentStatusBadge(selectedOrder.payment_status, selectedOrder.status)}
                    </div>
                  </div>
                </div>
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
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[#2C2A29] font-medium truncate">
                          {item.product?.name} &times; {item.quantity}
                        </span>
                        {selectedOrder.status === "DELIVERED" && item.product && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(null);
                              setReviewingProduct(item.product);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 transition cursor-pointer"
                          >
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>
                              {userReviewsMap[item.product.id] ? "Edit Rating" : "Rate"}
                            </span>
                          </button>
                        )}
                      </div>
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
              {selectedOrder.status === "CONFIRMED" ? (
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

      {/* Track Order Delivery Stepper Modal */}
      {trackingOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setTrackingOrder(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden cursor-default animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDD6C8] px-6 sm:px-8 py-5 shrink-0 bg-[#F7F5F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 flex items-center justify-center text-[#1E3A5F] shrink-0 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg font-bold text-[#2C2A29]">
                      Track Order #{trackingOrder.id}
                    </h2>
                    <div className="w-26">
                      {getStatusBadge(trackingOrder.status)}
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    Ordered on {new Date(trackingOrder.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="text-stone-400 hover:text-[#2C2A29] transition p-2 rounded-xl hover:bg-[#ECE8DF] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Inner Body */}
            <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-6">
              {/* Estimated Delivery Highlight Banner */}
              {trackingOrder.status !== "CANCELLED" ? (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {trackingOrder.status === "DELIVERED" ? "Delivery Completed" : "Estimated Delivery"}
                    </span>
                    <p className="text-base sm:text-lg font-extrabold text-emerald-950">
                      {trackingOrder.status === "DELIVERED"
                        ? `Delivered on ${getEstimatedDeliveryDate(trackingOrder)}`
                        : getEstimatedDeliveryDate(trackingOrder)}
                    </p>
                    <p className="text-xs text-emerald-700/80">
                      {trackingOrder.status === "DELIVERED"
                        ? "Package handed over to customer."
                        : "Express Air Delivery by Standard Logistics"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 border border-emerald-200 flex items-center justify-center text-xl shadow-xs shrink-0">
                    {trackingOrder.status === "DELIVERED" ? "🎉" : "🚚"}
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 text-rose-800 space-y-1.5 min-w-0 overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                      Order Cancelled
                    </span>
                    {(trackingOrder.cancelled_at || trackingOrder.updated_at) && (
                      <span className="text-[11px] font-mono text-rose-700/80 font-semibold">
                        {new Date(trackingOrder.cancelled_at || trackingOrder.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-rose-900">
                    This order was cancelled and is not in transit.
                  </p>
                  {trackingOrder.cancellation_reason && (
                    <p className="text-xs italic text-stone-700 break-words [overflow-wrap:anywhere] pt-1 border-t border-rose-200/60">
                      <span className="font-semibold text-rose-800 not-italic">Reason: </span>
                      &ldquo;{trackingOrder.cancellation_reason}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Visual 4-Step Milestone Stepper */}
              {trackingOrder.status !== "CANCELLED" && (
                <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F] block">
                    Shipment Progress
                  </span>

                  {(() => {
                    const statusOrder = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
                    const currentIdx = statusOrder.indexOf(trackingOrder.status);

                    const isDelivered = trackingOrder.status === "DELIVERED";
                    const startTime = new Date(trackingOrder.created_at).getTime();
                    const rawEndTime = trackingOrder.delivered_at || trackingOrder.updated_at
                      ? new Date(trackingOrder.delivered_at || trackingOrder.updated_at).getTime()
                      : startTime;
                    const endTime = (isDelivered && rawEndTime > startTime)
                      ? rawEndTime
                      : startTime + 4 * 24 * 60 * 60 * 1000;

                    const formatTimestamp = (dateStr) => {
                      if (!dateStr) return null;
                      const date = new Date(dateStr);
                      const dateFormatted = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      const timeFormatted = date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return `${dateFormatted}, ${timeFormatted}`;
                    };

                    const getMilestoneTimestamp = (stepIdx, specificDate, isDone, isCurrent) => {
                      // If database has the exact transition timestamp for this milestone, use it directly!
                      if (isDone && specificDate) {
                        return formatTimestamp(specificDate);
                      }

                      let timeMs;
                      if (isDelivered) {
                        // Fallback: distribute intermediate milestones proportionally
                        const fraction = stepIdx / 3;
                        timeMs = startTime + (endTime - startTime) * fraction;
                      } else {
                        // In progress: Day offsets [0, 1, 2, 4]
                        const dayOffsets = [0, 1, 2, 4];
                        timeMs = startTime + dayOffsets[stepIdx] * 24 * 60 * 60 * 1000;
                      }

                      const date = new Date(timeMs);
                      const dateFormatted = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      const timeFormatted = date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      if (isDone) {
                        return `${dateFormatted}, ${timeFormatted}`;
                      }
                      if (isCurrent) {
                        return "In Progress";
                      }
                      return `Expected: ${dateFormatted}`;
                    };

                    const steps = [
                      {
                        key: "CONFIRMED",
                        title: "Confirmed",
                        description: "Your order has been verified and registered.",
                        time: getMilestoneTimestamp(0, trackingOrder.confirmed_at || trackingOrder.created_at, true, currentIdx === 0),
                        icon: CheckCircle2,
                      },
                      {
                        key: "PROCESSING",
                        title: "Processing",
                        description: "Items gathered, safety-checked, and packed at warehouse.",
                        time: getMilestoneTimestamp(1, trackingOrder.processing_at, currentIdx >= 1, currentIdx === 1),
                        icon: Package,
                      },
                      {
                        key: "SHIPPED",
                        title: "Shipped",
                        description: "Courier picked up package and is en-route.",
                        time: getMilestoneTimestamp(2, trackingOrder.shipped_at, currentIdx >= 2, currentIdx === 2),
                        icon: Truck,
                      },
                      {
                        key: "DELIVERED",
                        title: "Delivered",
                        description: "Package delivered safely at your address.",
                        time: getMilestoneTimestamp(3, trackingOrder.delivered_at, currentIdx >= 3, currentIdx === 3),
                        icon: ShieldCheck,
                      },
                    ];

                    return (
                      <div className="space-y-4">
                        {steps.map((step, idx) => {
                          const isDone = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div key={step.key} className="flex items-start gap-4">
                              {/* Left Column: Step Node Icon + Connecting Line */}
                              <div className="flex flex-col items-center shrink-0 w-8">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isDone
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "bg-[#FFFFFF] text-stone-400 border border-[#D8D4CE]"
                                  } ${isCurrent ? "ring-4 ring-emerald-200" : ""}`}
                                >
                                  {isDone ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                                  )}
                                </div>
                                {idx < steps.length - 1 && (
                                  <div
                                    className={`w-0.5 min-h-[32px] my-1 rounded-full ${
                                      idx < currentIdx ? "bg-emerald-500" : "bg-[#D8D4CE]"
                                    }`}
                                  />
                                )}
                              </div>

                              {/* Right Column: Step Text Info */}
                              <div className="flex-1 pt-1 min-w-0 pb-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <h4
                                    className={`text-xs sm:text-sm font-bold ${
                                      isDone ? "text-[#2C2A29]" : "text-stone-400"
                                    }`}
                                  >
                                    {step.title}
                                  </h4>
                                  <span
                                    className={`text-[11px] font-mono font-medium ${
                                      isCurrent
                                        ? "text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md"
                                        : isDone
                                        ? "text-stone-500"
                                        : "text-stone-400"
                                    }`}
                                  >
                                    {step.time}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs mt-0.5 leading-relaxed ${
                                    isDone ? "text-stone-600" : "text-stone-400"
                                  }`}
                                >
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Delivery Address Box */}
              {trackingOrder.address && (
                <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A5F] uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#1E3A5F]" />
                    <span>Delivery Destination</span>
                  </div>
                  <div className="text-xs sm:text-sm text-[#2C2A29] font-medium leading-relaxed pl-6">
                    <p className="font-bold">{trackingOrder.user?.first_name} {trackingOrder.user?.last_name}</p>
                    <p className="text-stone-600">
                      {trackingOrder.address.street}, {trackingOrder.address.city}, {trackingOrder.address.state} {trackingOrder.address.postal_code}, {trackingOrder.address.country}
                    </p>
                  </div>
                </div>
              )}

              {/* Items in Package */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Items in this Shipment ({trackingOrder.items?.length || 0})
                </span>
                <div className="divide-y divide-[#DDD6C8] bg-[#ECE8DF] rounded-2xl border border-[#DDD6C8] p-4 text-xs sm:text-sm shadow-xs">
                  {trackingOrder.items?.map((item) => (
                    <div key={`track-item-${item.id}`} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-[#DDD6C8] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-400 text-xs shrink-0">
                            📦
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-[#2C2A29] truncate">{item.product?.name || "Product"}</p>
                          <p className="text-[11px] text-stone-500 font-mono">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#2C2A29] shrink-0">
                        ${(item.quantity * item.price_at_purchase).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#DDD6C8] px-6 sm:px-8 py-4 shrink-0 bg-[#F7F5F0]">
              <button
                type="button"
                onClick={() => {
                  const target = trackingOrder;
                  setTrackingOrder(null);
                  setSelectedOrder(target);
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer border border-[#D8D4CE] shadow-xs"
              >
                Close Tracker
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
                    className={`text-[11px] font-mono ${cancelReason.length >= 100
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

      {/* Delete Review Confirmation Modal */}
      {reviewToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingReview) {
              setReviewToDelete(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 cursor-default animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C2A29]">
                  Delete Review & Rating?
                </h3>
                <p className="text-xs text-stone-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-[#ECE8DF] p-3.5 rounded-2xl border border-[#DDD6C8]">
              Are you sure you want to remove your review and rating for{" "}
              <strong className="text-[#2C2A29]">{reviewToDelete.productName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingReview}
                onClick={() => setReviewToDelete(null)}
                className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold px-4 py-2.5 rounded-xl transition border border-[#D8D4CE] cursor-pointer shadow-xs"
              >
                Keep Review
              </button>
              <button
                type="button"
                disabled={deletingReview}
                onClick={handleConfirmDeleteReview}
                className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                {deletingReview ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flipkart-Style Rate & Review Product Modal */}
      <RateOrderProductModal
        isOpen={Boolean(reviewingProduct)}
        onClose={() => setReviewingProduct(null)}
        product={reviewingProduct}
        existingReview={reviewingProduct ? userReviewsMap[reviewingProduct.id] : null}
        onReviewSubmitted={fetchOrders}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RouteGuard type="private">
      <OrdersContent />
    </RouteGuard>
  );
}
