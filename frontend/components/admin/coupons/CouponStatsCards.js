"use client";

export default function CouponStatsCards({ totalCoupons, activeCount }) {
  const inactiveCount = totalCoupons - activeCount;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <span className="text-xs text-slate-400 block font-medium">Total Coupons</span>
        <span className="text-2xl font-extrabold text-white mt-1 block font-mono">
          {totalCoupons}
        </span>
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <span className="text-xs text-slate-400 block font-medium">Active Coupons</span>
        <span className="text-2xl font-extrabold text-emerald-400 mt-1 block font-mono">
          {activeCount}
        </span>
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <span className="text-xs text-slate-400 block font-medium">Inactive</span>
        <span className="text-2xl font-extrabold text-slate-400 mt-1 block font-mono">
          {inactiveCount}
        </span>
      </div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <span className="text-xs text-slate-400 block font-medium">Checkout Availability</span>
        <span className="text-xs font-bold text-indigo-400 mt-2 block">
          {activeCount > 0 ? "LIVE IN CHECKOUT" : "NO ACTIVE OFFERS"}
        </span>
      </div>
    </div>
  );
}
