"use client";

import { formatDate } from "@/lib/formatters";

export default function CouponTable({
  coupons = [],
  loading = false,
  onToggleStatus,
  onEdit,
  onDelete,
  onCreateFirst,
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading coupons...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-slate-600 flex items-center justify-center mx-auto text-xl border border-slate-800">
            🏷️
          </div>
          <p className="text-xs text-slate-400">No coupons found.</p>
          <button
            onClick={onCreateFirst}
            className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            + Create your first coupon
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-mono font-bold text-white flex items-center gap-2">
                    <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-400 font-mono">
                      {coupon.discount_type === "PERCENTAGE"
                        ? `${coupon.discount_value}% OFF`
                        : `$${coupon.discount_value.toFixed(2)} FLAT`}
                    </span>
                    {coupon.description && (
                      <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                        {coupon.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {coupon.min_order_amount > 0
                      ? `$${coupon.min_order_amount.toFixed(2)}`
                      : "None ($0)"}
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                    {coupon.starts_at ? formatDate(coupon.starts_at) : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleStatus(coupon)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition ${
                        coupon.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                      title="Click to toggle coupon active status"
                    >
                      {coupon.is_active ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(coupon)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded hover:bg-indigo-500/10 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(coupon)}
                      className="text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
