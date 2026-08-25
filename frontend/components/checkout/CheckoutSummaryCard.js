"use client";

import { formatCurrency } from "@/lib/formatters";
import { Tag, ChevronRight, Check } from "lucide-react";

export default function CheckoutSummaryCard({
  itemsCount = 0,
  subtotal = 0,
  shippingCost = 0,
  discountAmount = 0,
  appliedCoupon = null,
  estimatedTax = 0,
  finalTotal = 0,
  onOpenCouponModal,
  children,
}) {
  const totalSavings = discountAmount + (shippingCost === 0 ? 9.99 : 0);

  return (
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs sticky top-24">
      {/* Flipkart-Style Header */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 pb-3 border-b border-[#DDD6C8]">
        Price Details ({itemsCount} Item{itemsCount === 1 ? "" : "s"})
      </h3>

      {/* Coupon Modal Trigger Row (Flipkart-style) */}
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-3.5 shadow-xs">
        {appliedCoupon ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="truncate">
                <span className="font-mono font-bold text-xs text-emerald-900 block truncate">
                  {appliedCoupon.code} Applied
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Saved {formatCurrency(discountAmount)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenCouponModal}
              className="text-xs font-bold text-[#1E3A5F] hover:text-[#152843] hover:underline cursor-pointer shrink-0 ml-2"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenCouponModal}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#2C2A29] block">
                  Apply Coupons & Offers
                </span>
                <span className="text-[11px] text-stone-500">
                  Save more on your order
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#1E3A5F] transition" />
          </button>
        )}
      </div>

      {/* Breakdown List */}
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-stone-700">
          <span>Price ({itemsCount} item{itemsCount === 1 ? "" : "s"})</span>
          <span className="font-mono font-semibold text-[#2C2A29]">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-800">
            <span>Coupon Discount</span>
            <span className="font-mono font-bold">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-stone-700">
          <div className="flex items-center gap-1.5">
            <span>Delivery Charges</span>
            {shippingCost === 0 && (
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                FREE
              </span>
            )}
          </div>
          <span className="font-mono font-semibold text-[#2C2A29]">
            {shippingCost === 0 ? (
              <span className="text-emerald-700 font-bold">FREE</span>
            ) : (
              formatCurrency(shippingCost)
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-stone-700">
          <span>Estimated Tax (8%)</span>
          <span className="font-mono font-semibold text-[#2C2A29]">
            {formatCurrency(estimatedTax)}
          </span>
        </div>

        <div className="pt-4 border-t border-[#DDD6C8] flex items-center justify-between">
          <span className="text-base font-bold text-[#2C2A29]">Total Payable</span>
          <span className="text-2xl font-extrabold text-[#2C2A29] font-mono">
            {formatCurrency(finalTotal)}
          </span>
        </div>

        {/* Flipkart-Style Green Savings Banner */}
        {totalSavings > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-800">
            🎉 You will save {formatCurrency(totalSavings)} on this order
          </div>
        )}
      </div>

      {/* Step Action Controls Slot */}
      {children && (
        <div className="pt-2 border-t border-[#DDD6C8] space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}
