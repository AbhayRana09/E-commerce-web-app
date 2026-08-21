"use client";

import AvailableOffers from "@/components/checkout/AvailableOffers";

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
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
      {/* Header & Inline Destination Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Review & Apply Offers</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Check your items, apply available promo discounts, and confirm details.
          </p>
        </div>

        {selectedAddress && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 w-full sm:w-[260px] shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-base shrink-0">📍</span>
              <div className="text-xs min-w-0 flex-1">
                <span className="font-bold text-slate-200 block truncate" title={selectedAddress.street}>
                  {selectedAddress.street}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {selectedAddress.city}, {selectedAddress.state}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1 cursor-pointer shrink-0"
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
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>📦</span> Shipment Items ({items.length})
            </h3>
            <span className="text-[11px] text-slate-400">Standard Delivery</span>
          </div>

          <div className="divide-y divide-slate-800/60 bg-slate-950/60 rounded-3xl border border-slate-800 p-3 sm:p-4 max-h-[460px] overflow-y-auto scrollbar-thin">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 truncate text-xs sm:text-sm">
                      {item.product?.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Qty: <span className="font-semibold text-slate-200">{item.quantity}</span> &times; ${Number(item.product?.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-white font-mono text-sm shrink-0">
                  ${(item.quantity * (item.product?.price || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Promotions & Available Offers Hub (5 Cols) */}
        <div className="xl:col-span-5 bg-slate-950/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
          {/* Manual Promo Code Form */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🏷️</span> Have a Coupon Code?
              </span>
              {appliedCoupon && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Applied ✓
                </span>
              )}
            </span>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {appliedCoupon.discount_type === "PERCENTAGE"
                      ? `${appliedCoupon.discount_value}% OFF applied`
                      : `$${appliedCoupon.discount_value.toFixed(2)} FLAT OFF applied`}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    -${appliedCoupon.discount_amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-slate-400 hover:text-red-400 text-xs font-semibold underline cursor-pointer"
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
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCodeInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-3">
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
      <div className="flex items-center justify-between pt-5 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition cursor-pointer"
        >
          &larr; Back to Address
        </button>
        <button
          type="button"
          onClick={onProceedToPayment}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
        >
          <span>Proceed to Payment</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
