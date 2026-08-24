"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/orders";
import RouteGuard from "@/components/RouteGuard";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID specified.");
      setLoading(false);
      return;
    }

    async function fetchReceipt() {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message || "Failed to load order receipt.");
      } finally {
        setLoading(false);
      }
    }

    fetchReceipt();
  }, [orderId]);

  if (loading) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center justify-center space-y-4 text-stone-500">
        <div className="w-10 h-10 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Generating order confirmation receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-md mx-auto space-y-4 bg-[#ECE8DF] p-8 rounded-3xl border border-[#DDD6C8] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-[#2C2A29]">Order Receipt Not Found</h2>
          <p className="text-xs text-stone-600 leading-relaxed">{error || "Could not retrieve receipt details."}</p>
          <Link
            href="/"
            className="inline-block bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
          >
            Return to Store Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      {/* Top Success Banner */}
      <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xs">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto text-3xl shadow-xs animate-bounce">
          ✓
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 inline-block mb-3">
            Order Confirmed & Paid
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C2A29] tracking-tight">
            Thank you for your purchase!
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Your order has been received and is now being prepared for dispatch. We&apos;ve sent a confirmation receipt to your email.
          </p>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-mono text-stone-700">
          <span className="bg-[#FFFFFF] border border-[#D8D4CE] px-4 py-2 rounded-xl shadow-xs">
            Order Number: <strong className="text-[#1E3A5F] font-bold">#{order.id}</strong>
          </span>
          <span className="bg-[#FFFFFF] border border-[#D8D4CE] px-4 py-2 rounded-xl shadow-xs">
            Placed on: {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="bg-[#FFFFFF] border border-[#D8D4CE] px-4 py-2 rounded-xl shadow-xs">
            Payment: <strong className="text-amber-800 font-bold">{order.payment_method === "MOCK_CARD" ? "Card" : order.payment_method === "MOCK_UPI" ? "UPI" : order.payment_method || "Card"}</strong>
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns for Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Ordered Items list */}
        <div className="lg:col-span-2 bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#2C2A29] pb-4 border-b border-[#DDD6C8] flex items-center justify-between">
            <span>Items Ordered ({order.items?.length || 0})</span>
            <span className="text-xs text-stone-500 font-normal">Standard Delivery</span>
          </h2>

          <div className="divide-y divide-[#DDD6C8] bg-[#FFFFFF] rounded-2xl border border-[#D8D4CE] p-3 sm:p-5 shadow-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-[#ECE8DF] border border-[#DDD6C8] overflow-hidden shrink-0">
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">No Img</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#2C2A29] truncate text-base">{item.product?.name}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Qty: <strong className="text-stone-800">{item.quantity}</strong> &times; ${Number(item.price_at_purchase).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[#2C2A29] font-mono text-base shrink-0">
                  ${(item.quantity * item.price_at_purchase).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DDD6C8]">
            <Link
              href="/"
              className="w-full sm:w-auto bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl transition text-center border border-[#D8D4CE] shadow-xs"
            >
              &larr; Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="w-full sm:w-auto bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-7 py-3 rounded-xl transition shadow-xs text-center"
            >
              View Order History &rarr;
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Destination & Cost Breakdown */}
        <div className="space-y-6">
          {/* Shipping Address */}
          {order.address && (
            <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 shadow-xs space-y-3 min-w-0 overflow-hidden">
              <span className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider block">
                Delivery Address
              </span>
              <p className="font-bold text-[#2C2A29] text-sm truncate">{order.user?.first_name} {order.user?.last_name}</p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed break-words [overflow-wrap:anywhere]">
                {order.address.street} <br />
                {order.address.city}, {order.address.state} {order.address.postal_code} <br />
                {order.address.country}
              </p>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 shadow-xs space-y-3.5 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-[#2C2A29] pb-3 border-b border-[#DDD6C8]">
              Payment Summary
            </h3>

            <div className="flex items-center justify-between text-stone-600">
              <span>Items Subtotal</span>
              <span className="font-mono text-[#2C2A29]">${order.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-stone-600">
              <span>Shipping Fee</span>
              <span className="font-mono text-[#2C2A29]">
                {order.shipping_cost === 0 ? "FREE" : `$${order.shipping_cost.toFixed(2)}`}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Discount ({order.coupon_code || "OFFER"})</span>
                <span className="font-mono font-bold">-${order.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#DDD6C8] flex items-center justify-between text-base">
              <span className="font-bold text-[#2C2A29]">Total Paid</span>
              <span className="text-2xl font-extrabold text-[#2C2A29] font-mono">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <RouteGuard type="customer" adminRedirect="/admin">
      <ConfirmationContent />
    </RouteGuard>
  );
}
