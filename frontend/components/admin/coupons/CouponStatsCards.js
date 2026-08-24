"use client";

export default function CouponStatsCards({ totalCoupons, activeCount }) {
  const inactiveCount = totalCoupons - activeCount;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-stone-600 block font-medium">Total Coupons</span>
        <span className="text-2xl font-extrabold text-[#2C2A29] mt-1 block font-mono">
          {totalCoupons}
        </span>
      </div>
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-stone-600 block font-medium">Active Coupons</span>
        <span className="text-2xl font-extrabold text-emerald-700 mt-1 block font-mono">
          {activeCount}
        </span>
      </div>
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-stone-600 block font-medium">Inactive</span>
        <span className="text-2xl font-extrabold text-stone-600 mt-1 block font-mono">
          {inactiveCount}
        </span>
      </div>
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-4 shadow-xs">
        <span className="text-xs text-stone-600 block font-medium">Checkout Availability</span>
        <span className="text-xs font-bold text-[#1E3A5F] mt-2 block">
          {activeCount > 0 ? "LIVE IN CHECKOUT" : "NO ACTIVE OFFERS"}
        </span>
      </div>
    </div>
  );
}
