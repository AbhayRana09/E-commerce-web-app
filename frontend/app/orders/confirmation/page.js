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
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center justify-center space-y-4 text-slate-400">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Generating order confirmation receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-md mx-auto space-y-4 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Order Receipt Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error || "Could not retrieve receipt details."}</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-md"
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
      <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900/60 to-slate-900/80 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-2xl backdrop-blur-md">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
          ✓
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 inline-block mb-3">
            Order Confirmed & Paid
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Thank you for your purchase!
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
            Your order has been received and is now being prepared for dispatch. We&apos;ve sent a confirmation receipt to your email.
          </p>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-mono text-slate-300">
          <span className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
            Order Number: <strong className="text-indigo-400 font-bold">#{order.id}</strong>
          </span>
          <span className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
            Placed on: {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
            Payment: <strong className="text-amber-400 font-bold">{order.payment_method === "MOCK_CARD" ? "Card" : order.payment_method === "MOCK_UPI" ? "UPI" : order.payment_method || "Card"}</strong>
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns for Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Ordered Items list */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white pb-4 border-b border-slate-800 flex items-center justify-between">
            <span>Items Ordered ({order.items?.length || 0})</span>
            <span className="text-xs text-slate-400 font-normal">Standard Delivery</span>
          </h2>

          <div className="divide-y divide-slate-800/60 bg-slate-950/40 rounded-2xl border border-slate-800 p-3 sm:p-5">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">No Img</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 truncate text-base">{item.product?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Qty: <strong className="text-slate-200">{item.quantity}</strong> &times; ${Number(item.price_at_purchase).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-white font-mono text-base shrink-0">
                  ${(item.quantity * item.price_at_purchase).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <Link
              href="/"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl transition text-center"
            >
              &larr; Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-7 py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 text-center"
            >
              View Order History &rarr;
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Destination & Cost Breakdown */}
        <div className="space-y-6">
          {/* Shipping Address */}
          {order.address && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 min-w-0 overflow-hidden">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Delivery Address
              </span>
              <p className="font-bold text-white text-sm truncate">{order.user?.first_name} {order.user?.last_name}</p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words [overflow-wrap:anywhere]">
                {order.address.street} <br />
                {order.address.city}, {order.address.state} {order.address.postal_code} <br />
                {order.address.country}
              </p>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3.5 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Payment Summary
            </h3>

            <div className="flex items-center justify-between text-slate-400">
              <span>Items Subtotal</span>
              <span className="font-mono text-slate-200">${order.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Shipping Fee</span>
              <span className="font-mono text-slate-200">
                {order.shipping_cost === 0 ? "FREE" : `$${order.shipping_cost.toFixed(2)}`}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Discount ({order.coupon_code || "OFFER"})</span>
                <span className="font-mono font-bold">-${order.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-base">
              <span className="font-bold text-white">Total Paid</span>
              <span className="text-2xl font-extrabold text-white font-mono">
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
