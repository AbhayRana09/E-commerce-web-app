"use client";

import AvailableOffers from "@/components/checkout/AvailableOffers";
import { ArrowRight } from "lucide-react";

export default function StepReviewCart({
  selectedAddress,
  items = [],
  appliedCoupon,
  couponCodeInput,
  setCouponCodeInput,
  validatingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  availableOffers = [],
  loadingOffers,
  subtotal,
  handleApplyOfferCode,
  applyingOfferCode,
  onBack,
  onProceedToPayment,
}) {
  return (
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
      {/* Header & Inline Destination Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDD6C8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2A29]">Review & Apply Offers</h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Check your items, apply available promo discounts, and confirm details.
          </p>
        </div>

        {selectedAddress && (
          <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 w-full sm:w-[260px] shrink-0 self-start sm:self-auto shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-base shrink-0">📍</span>
              <div className="text-xs min-w-0 flex-1">
                <span className="font-bold text-[#2C2A29] block truncate" title={selectedAddress.street}>
                  {selectedAddress.street}
                </span>
                <span className="text-[11px] text-stone-500 truncate block">
                  {selectedAddress.city}, {selectedAddress.state}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] text-[#1E3A5F] hover:text-[#152843] font-semibold underline ml-1 cursor-pointer shrink-0"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* 2-Column Balanced Grid: Left Items + Right Offers Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Shipment Items List (7 Cols) */}
        <div className="xl:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#2C2A29] flex items-center gap-2">
              <span>📦</span> Shipment Items ({items.length})
            </h3>
            <span className="text-[11px] text-stone-500">Standard Delivery</span>
          </div>

          <div className="divide-y divide-[#DDD6C8] bg-[#FFFFFF] rounded-3xl border border-[#D8D4CE] p-3 sm:p-4 max-h-[460px] overflow-y-auto scrollbar-thin shadow-xs">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#ECE8DF] border border-[#DDD6C8] overflow-hidden shrink-0">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#2C2A29] truncate text-xs sm:text-sm">
                      {item.product?.name}
                    </p>
                    <p className="text-stone-600 text-xs mt-0.5">
                      Qty: <span className="font-semibold text-[#2C2A29]">{item.quantity}</span> &times; ${Number(item.product?.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[#2C2A29] font-mono text-sm shrink-0">
                  ${(item.quantity * (item.product?.price || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Promotions & Available Offers Hub (5 Cols) */}
        <div className="xl:col-span-5 bg-[#FFFFFF] border border-[#D8D4CE] rounded-3xl p-5 space-y-4 shadow-xs">
          {/* Manual Promo Code Form */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#2C2A29] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🏷️</span> Have a Coupon Code?
              </span>
              {appliedCoupon && (
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Applied ✓
                </span>
              )}
            </span>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-800 font-mono text-sm">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {appliedCoupon.discount_type === "PERCENTAGE"
                      ? `${appliedCoupon.discount_value}% OFF applied`
                      : `$${appliedCoupon.discount_value.toFixed(2)} FLAT OFF applied`}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-emerald-800 font-mono text-sm">
                    -${appliedCoupon.discount_amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-stone-500 hover:text-red-600 text-xs font-semibold underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} noValidate className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-3.5 py-2 text-xs text-[#2C2A29] uppercase font-mono placeholder:text-stone-400 focus:outline-none focus:border-[#1E3A5F] shadow-xs"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCodeInput.trim()}
                  className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-[#DDD6C8] pt-3">
            {/* Available Offers Component */}
            <AvailableOffers
              offers={availableOffers}
              loading={loadingOffers}
              subtotal={subtotal}
              appliedCoupon={appliedCoupon}
              onApplyOffer={handleApplyOfferCode}
              onRemoveOffer={handleRemoveCoupon}
              applyingCode={applyingOfferCode}
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Navigation */}
      <div className="flex items-center justify-between pt-5 border-t border-[#DDD6C8]">
        <button
          type="button"
          onClick={onBack}
          className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition cursor-pointer shadow-xs"
        >
          &larr; Back to Address
        </button>
        <button
          type="button"
          onClick={onProceedToPayment}
          className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
