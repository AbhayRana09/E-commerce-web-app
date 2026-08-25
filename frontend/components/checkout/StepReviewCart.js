"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";

export default function StepReviewCart({
  items = [],
  onBack,
  onContinue,
}) {
  return (
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DDD6C8]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
            title="Back to Delivery Address"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2A29]">Order Summary</h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Review the items in your order before proceeding to payment.
            </p>
          </div>
        </div>

        {/* Action Button in Header */}
        <div className="shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={onContinue}
            className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Continue to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shipment Items List */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Items in Order ({items.length})
          </span>
        </div>

        <div className="divide-y divide-[#DDD6C8] bg-[#FFFFFF] rounded-3xl border border-[#D8D4CE] p-4 sm:p-5 shadow-xs space-y-1">
          {items.map((item) => (
            <div key={item.id} className="py-4 first:pt-2 last:pb-2 flex items-start sm:items-center justify-between gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#ECE8DF] border border-[#DDD6C8] overflow-hidden shrink-0">
                  {item.product?.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-[#2C2A29] text-sm sm:text-base line-clamp-1">
                    {item.product?.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <span>Quantity: <strong className="text-[#2C2A29]">{item.quantity}</strong></span>
                    <span>•</span>
                    <span>${Number(item.product?.price || 0).toFixed(2)} each</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Eligible for FREE Shipping
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-extrabold text-[#2C2A29] font-mono text-base sm:text-lg block">
                  ${(item.quantity * (item.product?.price || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
