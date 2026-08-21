"use client";

import { formatCurrency } from "@/lib/formatters";

export default function ProductTable({
  products = [],
  loading = false,
  onToggleActive,
  onEdit,
  onDelete,
  onAddFirst,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
        <p className="text-slate-400 text-sm">
          No products found matching criteria.
        </p>
        <button
          onClick={onAddFirst}
          className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer"
        >
          Add a new product &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-slate-900/60 rounded-2xl border border-slate-800">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 tracking-wider">
          <tr>
            <th className="px-4 py-3.5">Product</th>
            <th className="px-4 py-3.5">Category</th>
            <th className="px-4 py-3.5">Price</th>
            <th className="px-4 py-3.5">Stock</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-slate-800/30 transition duration-150"
            >
              {/* Thumbnail & Title */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="max-w-xs">
                    <p className="font-semibold text-slate-100 line-clamp-1 break-words">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      /{product.slug}
                    </p>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <span className="bg-slate-800 text-indigo-300 font-medium px-2.5 py-1 rounded-full text-[11px] border border-slate-700/60 inline-block max-w-[140px] truncate">
                  {product.category?.name || "Uncategorized"}
                </span>
              </td>

              {/* Price */}
              <td className="px-4 py-3 font-semibold text-slate-100">
                {formatCurrency(product.price)}
              </td>

              {/* Stock */}
              <td className="px-4 py-3">
                <span
                  className={`font-semibold ${
                    product.stock_quantity > 10
                      ? "text-slate-200"
                      : product.stock_quantity > 0
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {product.stock_quantity} units
                </span>
              </td>

              {/* Status Toggle */}
              <td className="px-4 py-3 w-28 shrink-0">
                <button
                  onClick={() => onToggleActive(product)}
                  className={`w-24 inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer shrink-0 ${
                    product.is_active
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {product.is_active ? "● Active" : "○ Inactive"}
                </button>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700/60 transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-red-500/30 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
