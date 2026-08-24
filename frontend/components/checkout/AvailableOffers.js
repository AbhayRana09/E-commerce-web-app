"use client";

import { useState } from "react";

export default function AvailableOffers({
  offers = [],
  loading = false,
  subtotal = 0,
  appliedCoupon = null,
  onApplyOffer,
  onRemoveOffer,
  applyingCode = null,
}) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-4 space-y-3 animate-pulse">
        <div className="h-4 bg-[#DDD6C8] rounded w-36"></div>
        <div className="h-20 bg-[#DDD6C8] rounded-xl"></div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="bg-[#ECE8DF] border border-dashed border-[#DDD6C8] rounded-2xl p-4 text-center">
        <span className="text-base">🏷️</span>
        <p className="text-xs text-stone-600 mt-1">No public promo offers available right now.</p>
        <p className="text-[11px] text-stone-500">If you have a private coupon code, enter it above.</p>
      </div>
    );
  }

  const eligibleOffers = offers.filter((o) => subtotal >= (o.min_order_amount || 0));
  const displayedOffers = showAll ? offers : offers.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#2C2A29] flex items-center gap-1.5">
            <span>🎁</span> Available Offers
          </span>
          <span className="text-[10px] font-bold bg-[#1E3A5F]/10 text-[#1E3A5F] px-2 py-0.5 rounded-full border border-[#1E3A5F]/20">
            {eligibleOffers.length} Eligible
          </span>
        </div>

        {offers.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] text-[#1E3A5F] hover:text-[#152843] font-semibold cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${offers.length})`}
          </button>
        )}
      </div>

      {/* Offers List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {displayedOffers.map((offer) => {
          const isApplied = appliedCoupon?.code === offer.code;
          const isEligible = subtotal >= (offer.min_order_amount || 0);
          const deficit = Math.max(0, (offer.min_order_amount || 0) - subtotal);
          const isApplying = applyingCode === offer.code;

          // Calculate dynamic savings
          let potentialSavings = 0;
          if (offer.discount_type === "PERCENTAGE") {
            potentialSavings = (subtotal * offer.discount_value) / 100;
          } else {
            potentialSavings = Math.min(subtotal, offer.discount_value);
          }
          potentialSavings = Math.round(potentialSavings * 100) / 100;

          return (
            <div
              key={offer.id || offer.code}
              className={`rounded-2xl p-3.5 border transition-all relative flex flex-col justify-between gap-2.5 ${
                isApplied
                  ? "bg-emerald-50 border-emerald-300 shadow-xs ring-1 ring-emerald-300"
                  : isEligible
                  ? "bg-[#FFFFFF] border-[#D8D4CE] hover:border-[#1E3A5F] shadow-xs"
                  : "bg-[#ECE8DF]/50 border-[#DDD6C8] opacity-60"
              }`}
            >
              {/* Header row: Code, Discount Badge & Apply Action */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-black uppercase px-2.5 py-0.5 rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20 shrink-0">
                    {offer.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md truncate ${
                      offer.discount_type === "PERCENTAGE"
                        ? "text-amber-800 bg-amber-50 border border-amber-200"
                        : "text-emerald-800 bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    {offer.discount_type === "PERCENTAGE"
                      ? `${offer.discount_value}% OFF`
                      : `$${Number(offer.discount_value).toFixed(2)} OFF`}
                  </span>
                </div>

                {isApplied ? (
                  <button
                    type="button"
                    onClick={() => onRemoveOffer()}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition cursor-pointer shrink-0"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isEligible || isApplying}
                    onClick={() => onApplyOffer(offer.code)}
                    className={`text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 shrink-0 ${
                      isEligible
                        ? "bg-[#1E3A5F] hover:bg-[#152843] text-white shadow-xs cursor-pointer active:scale-95"
                        : "bg-[#D8D4CE] text-stone-500 border border-[#D8D4CE] cursor-not-allowed"
                    }`}
                  >
                    {isApplying ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                )}
              </div>

              {/* Description & Terms */}
              <div className="text-[11px] text-stone-600 space-y-1">
                <p className="text-[#2C2A29] font-medium line-clamp-1">
                  {offer.description ||
                    (offer.discount_type === "PERCENTAGE"
                      ? `Save ${offer.discount_value}% on this order`
                      : `Save flat $${Number(offer.discount_value).toFixed(2)} on this order`)}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-stone-500">
                  {offer.min_order_amount > 0 && (
                    <span>
                      Min. Order: <strong className="text-[#2C2A29] font-mono">${Number(offer.min_order_amount).toFixed(2)}</strong>
                    </span>
                  )}
                  {offer.expires_at && (
                    <span>
                      Expires:{" "}
                      <span className="text-[#2C2A29]">
                        {new Date(offer.expires_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Savings or Deficit Pill */}
              <div className="pt-1.5 border-t border-[#DDD6C8] flex items-center justify-between text-[11px]">
                {isApplied ? (
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <span>✓</span> Applied &bull; Saved ${appliedCoupon.discount_amount.toFixed(2)}
                  </span>
                ) : isEligible ? (
                  <span className="text-emerald-800 font-medium">
                    Save <strong className="font-mono">${potentialSavings.toFixed(2)}</strong> with this offer!
                  </span>
                ) : (
                  <span className="text-amber-800 font-medium flex items-center gap-1 text-[10px]">
                    <span>🔒</span> Add ${deficit.toFixed(2)} more to unlock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
