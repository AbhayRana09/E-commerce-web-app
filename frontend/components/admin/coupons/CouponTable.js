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
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl overflow-hidden shadow-xs">
      {loading ? (
        <div className="py-20 text-center text-stone-500 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading coupons...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] text-stone-400 flex items-center justify-center mx-auto text-xl border border-[#D8D4CE] shadow-xs">
            🏷️
          </div>
          <p className="text-xs text-stone-600">No coupons found.</p>
          <button
            onClick={onCreateFirst}
            className="text-xs text-[#1E3A5F] hover:underline font-semibold cursor-pointer"
          >
            + Create your first coupon
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#ECE8DF] text-stone-500 border-b border-[#DDD6C8] uppercase tracking-wider font-semibold text-xs">
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
            <tbody className="divide-y divide-[#DDD6C8] text-[#2C2A29]">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-[#FFFFFF] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-44 px-3 py-1.5 rounded-xl font-mono font-bold text-xs bg-[#FFFFFF] text-[#1E3A5F] border border-[#D8D4CE] tracking-wider uppercase text-center truncate block shadow-xs select-all"
                        title={coupon.code}
                      >
                        {coupon.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-700 font-mono">
                      {coupon.discount_type === "PERCENTAGE"
                        ? `${coupon.discount_value}% OFF`
                        : `$${coupon.discount_value.toFixed(2)} FLAT`}
                    </span>
                    {coupon.description && (
                      <p className="text-xs text-stone-600 truncate max-w-xs mt-0.5">
                        {coupon.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#2C2A29]">
                    {coupon.min_order_amount > 0
                      ? `$${coupon.min_order_amount.toFixed(2)}`
                      : "None ($0)"}
                  </td>
                  <td className="px-6 py-4 text-stone-700 font-mono text-xs">
                    {coupon.starts_at ? formatDate(coupon.starts_at) : "—"}
                  </td>
                  <td className="px-6 py-4 text-stone-700 font-mono text-xs">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleStatus(coupon)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition ${
                        coupon.is_active
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : "bg-[#FFFFFF] text-stone-600 border-[#D8D4CE] hover:bg-[#ECE8DF]"
                      }`}
                      title="Click to toggle coupon active status"
                    >
                      {coupon.is_active ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(coupon)}
                      className="text-[#1E3A5F] hover:text-[#152843] font-semibold px-2 py-1 rounded hover:bg-[#FFFFFF] transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(coupon)}
                      className="text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition cursor-pointer"
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
