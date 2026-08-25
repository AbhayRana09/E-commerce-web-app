"use client";

import { useEffect } from "react";
import { X, Tag, Check } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function CheckoutCouponModal({
  open,
  onClose,
  couponCodeInput,
  setCouponCodeInput,
  validatingCoupon,
  handleApplyCoupon,
  appliedCoupon,
  handleRemoveCoupon,
  availableOffers = [],
  loadingOffers = false,
  subtotal = 0,
  handleApplyOfferCode,
  applyingOfferCode,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden cursor-default animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#DDD6C8] px-6 sm:px-7 py-5 shrink-0 bg-[#F7F5F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2C2A29]">Apply Coupon & Offers</h2>
              <p className="text-xs text-stone-500">Save more on your purchase</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-[#2C2A29] p-1.5 rounded-xl hover:bg-[#ECE8DF] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 px-6 sm:px-7 py-6 space-y-6">
          {/* Active Applied Coupon Alert */}
          {appliedCoupon ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="font-mono font-bold text-emerald-900 text-sm block">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">
                    Applied! You get {appliedCoupon.discount_type === "PERCENTAGE" ? `${appliedCoupon.discount_value}% OFF` : `$${appliedCoupon.discount_value} FLAT OFF`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            /* Manual Promo Code Input */
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Enter Promo / Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  className="flex-1 bg-[#FFFFFF] border border-[#D8D4CE] focus:border-[#1E3A5F] rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-[#2C2A29] placeholder-stone-400 focus:outline-none transition shadow-xs"
                />
                <button
                  type="button"
                  disabled={validatingCoupon || !couponCodeInput.trim()}
                  onClick={handleApplyCoupon}
                  className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  {validatingCoupon ? "Checking..." : "Apply"}
                </button>
              </div>
            </div>
          )}

          {/* Available Store Offers Section */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Available Store Offers
            </span>

            {loadingOffers ? (
              <div className="py-6 text-center text-stone-500 text-xs flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching valid offers...</span>
              </div>
            ) : availableOffers.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-4 text-center bg-[#FFFFFF] rounded-2xl border border-[#D8D4CE]">
                No other active coupons right now.
              </p>
            ) : (
              <div className="space-y-3">
                {availableOffers.map((offer) => {
                  const isCurrentlyApplied = appliedCoupon?.code === offer.code;
                  const isEligible = subtotal >= (offer.min_purchase || 0);

                  return (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                        isCurrentlyApplied
                          ? "bg-emerald-50/50 border-emerald-300 shadow-xs"
                          : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-stone-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-[#1E3A5F]/10 text-[#1E3A5F] px-2.5 py-1 rounded-lg border border-[#1E3A5F]/20">
                              {offer.code}
                            </span>
                            <span className="text-xs font-bold text-[#2C2A29]">
                              {offer.discount_type === "PERCENTAGE"
                                ? `${offer.discount_value}% OFF`
                                : `${formatCurrency(offer.discount_value)} FLAT OFF`}
                            </span>
                          </div>
                          {offer.description && (
                            <p className="text-xs text-stone-600 leading-relaxed">
                              {offer.description}
                            </p>
                          )}
                          {offer.min_purchase > 0 && (
                            <p className="text-[11px] text-stone-500">
                              Min purchase requirement: {formatCurrency(offer.min_purchase)}
                            </p>
                          )}
                        </div>

                        <div>
                          {isCurrentlyApplied ? (
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!isEligible || applyingOfferCode === offer.code}
                              onClick={() => handleApplyOfferCode(offer.code)}
                              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer ${
                                isEligible
                                  ? "bg-[#1E3A5F] hover:bg-[#152843] text-white"
                                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
                              }`}
                            >
                              {applyingOfferCode === offer.code
                                ? "Applying..."
                                : isEligible
                                ? "Apply"
                                : "Not eligible"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#DDD6C8] px-6 sm:px-7 py-4 shrink-0 bg-[#F7F5F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
