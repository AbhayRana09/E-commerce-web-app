"use client";

import { formatCurrency } from "@/lib/formatters";

export default function CheckoutSummaryCard({
  itemsCount = 0,
  subtotal = 0,
  shippingCost = 0,
  discountAmount = 0,
  appliedCoupon = null,
  estimatedTax = 0,
  finalTotal = 0,
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl sticky top-24">
      <h3 className="text-base font-bold text-white tracking-tight pb-3.5 border-b border-slate-800">
        Order Summary ({itemsCount} item{itemsCount === 1 ? "" : "s"})
      </h3>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-slate-300">
          <span>Items Subtotal</span>
          <span className="font-mono font-semibold text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5">
            <span>Shipping Fee</span>
            {shippingCost === 0 && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                FREE
              </span>
            )}
          </div>
          <span className="font-mono font-semibold text-white">
            {shippingCost === 0 ? "$0.00" : formatCurrency(shippingCost)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-400">
            <span>Discount ({appliedCoupon?.code})</span>
            <span className="font-mono font-bold">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-300">
          <span>Estimated Tax (8%)</span>
          <span className="font-mono font-semibold text-white">
            {formatCurrency(estimatedTax)}
          </span>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-base font-bold text-white">Total Amount</span>
          <span className="text-2xl font-extrabold text-white font-mono">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      <div className="pt-3 text-center text-xs text-slate-500 border-t border-slate-800/60 flex items-center justify-center gap-1.5">
        <span>🔒</span> 256-Bit Encrypted Secure Checkout
      </div>
    </div>
  );
}
