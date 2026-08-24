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
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs sticky top-24">
      <h3 className="text-base font-bold text-[#2C2A29] tracking-tight pb-3.5 border-b border-[#DDD6C8]">
        Order Summary ({itemsCount} item{itemsCount === 1 ? "" : "s"})
      </h3>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-stone-700">
          <span>Items Subtotal</span>
          <span className="font-mono font-semibold text-[#2C2A29]">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-stone-700">
          <div className="flex items-center gap-1.5">
            <span>Shipping Fee</span>
            {shippingCost === 0 && (
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                FREE
              </span>
            )}
          </div>
          <span className="font-mono font-semibold text-[#2C2A29]">
            {shippingCost === 0 ? "$0.00" : formatCurrency(shippingCost)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-800">
            <span>Discount ({appliedCoupon?.code})</span>
            <span className="font-mono font-bold">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-stone-700">
          <span>Estimated Tax (8%)</span>
          <span className="font-mono font-semibold text-[#2C2A29]">
            {formatCurrency(estimatedTax)}
          </span>
        </div>

        <div className="pt-4 border-t border-[#DDD6C8] flex items-center justify-between">
          <span className="text-base font-bold text-[#2C2A29]">Total Amount</span>
          <span className="text-2xl font-extrabold text-[#2C2A29] font-mono">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
