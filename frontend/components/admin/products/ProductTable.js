"use client";

import { formatCurrency } from "@/lib/formatters";
import { Star, MessageSquare } from "lucide-react";

export default function ProductTable({
  products = [],
  loading = false,
  onToggleActive,
  onToggleStatus,
  onEdit,
  onEditProduct,
  onDelete,
  onDeleteProduct,
  onViewReviews,
  onAddFirst,
}) {
  const handleToggle = onToggleActive || onToggleStatus;
  const handleEdit = onEdit || onEditProduct;
  const handleDelete = onDelete || onDeleteProduct;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-[#ECE8DF] rounded-2xl border border-[#DDD6C8] shadow-xs">
        <p className="text-stone-600 text-sm">
          No products found matching criteria.
        </p>
        {onAddFirst && (
          <button
            onClick={onAddFirst}
            className="mt-3 text-[#1E3A5F] hover:text-[#152843] text-xs font-semibold cursor-pointer"
          >
            Add a new product &rarr;
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#ECE8DF] rounded-2xl border border-[#DDD6C8] shadow-xs">
      <table className="w-full text-left text-xs text-[#2C2A29]">
        <thead className="bg-[#ECE8DF] text-stone-500 uppercase text-[10px] font-semibold border-b border-[#DDD6C8] tracking-wider">
          <tr>
            <th className="px-4 py-3.5">Product</th>
            <th className="px-4 py-3.5">Category</th>
            <th className="px-4 py-3.5">Price</th>
            <th className="px-4 py-3.5">Stock</th>
            <th className="px-4 py-3.5">Rating & Reviews</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDD6C8]">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-[#FFFFFF] transition duration-150"
            >
              {/* Thumbnail & Title */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#D8D4CE] overflow-hidden shrink-0 shadow-xs">
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
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="max-w-xs min-w-0">
                    <p className="font-semibold text-[#2C2A29] line-clamp-1 break-words [overflow-wrap:anywhere]">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-stone-500 font-mono truncate">
                      /{product.slug}
                    </p>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <span className="bg-[#FFFFFF] text-[#1E3A5F] font-medium px-2.5 py-1 rounded-full text-[11px] border border-[#D8D4CE] inline-block max-w-[140px] truncate shadow-xs">
                  {product.category?.name || "Uncategorized"}
                </span>
              </td>

              {/* Price */}
              <td className="px-4 py-3 font-semibold text-[#2C2A29] font-mono">
                {formatCurrency(product.price)}
              </td>

              {/* Stock */}
              <td className="px-4 py-3">
                <span
                  className={`font-semibold ${
                    product.stock_quantity > 10
                      ? "text-stone-800"
                      : product.stock_quantity > 0
                      ? "text-amber-700"
                      : "text-red-700"
                  }`}
                >
                  {product.stock_quantity} units
                </span>
              </td>

              {/* Rating & Reviews Column */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewReviews && onViewReviews(product)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-xs ${
                    product.reviews_count > 0
                      ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                      : "bg-[#FFFFFF] hover:bg-stone-100 border-[#D8D4CE] text-stone-500"
                  }`}
                  title="View and moderate reviews for this product"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      product.reviews_count > 0
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }`}
                  />
                  <span>
                    {product.reviews_count > 0
                      ? `${product.average_rating?.toFixed(1) || "0.0"} (${product.reviews_count})`
                      : "0 reviews"}
                  </span>
                  <MessageSquare className="w-3 h-3 text-stone-400 ml-0.5" />
                </button>
              </td>

              {/* Status Toggle */}
              <td className="px-4 py-3 w-28 shrink-0">
                <button
                  onClick={() => handleToggle && handleToggle(product)}
                  className={`w-24 inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer shrink-0 ${
                    product.is_active
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      : "bg-[#FFFFFF] text-stone-500 border-[#D8D4CE] hover:bg-[#ECE8DF]"
                  }`}
                >
                  {product.is_active ? "● Active" : "○ Inactive"}
                </button>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit && handleEdit(product)}
                    className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#D8D4CE] transition cursor-pointer shadow-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete && handleDelete(product)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-red-200 transition cursor-pointer"
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
