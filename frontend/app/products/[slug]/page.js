"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import RouteGuard from "@/components/RouteGuard";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem, loading: cartLoading } = useCart();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addItem(product.id, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 text-xs font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-[#ECE8DF] p-8 rounded-3xl border border-[#DDD6C8] shadow-xs space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#2C2A29]">Product Not Found</h2>
          <p className="text-stone-600 text-xs">{error || "The requested item is no longer available."}</p>
          <Link
            href="/"
            className="inline-block bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="w-full max-w-[1700px] mx-auto py-6">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-[#2C2A29] transition">
            Home
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={`/?category_id=${product.category.id}`}
                className="hover:text-[#2C2A29] transition"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-stone-800 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Card */}
        <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 min-w-0">
          {/* Product Image View */}
          <div className="relative aspect-square rounded-2xl bg-[#FFFFFF] overflow-hidden border border-[#D8D4CE] shadow-xs min-w-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                No Image Available
              </div>
            )}
            {product.category?.name && (
              <span className="absolute top-4 left-4 bg-[#FFFFFF]/95 backdrop-blur-md text-[#1E3A5F] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D8D4CE] shadow-xs">
                {product.category.name}
              </span>
            )}

            {/* Heart Wishlist overlay button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
                isInWishlist(product.id)
                  ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
                  : "bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-stone-600 hover:text-rose-500 border border-[#D8D4CE]"
              }`}
              title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label="Toggle Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  isInWishlist(product.id) ? "fill-current" : ""
                }`}
              />
            </button>
          </div>

          {/* Product Info & Actions */}
          <div className="flex flex-col justify-between space-y-6 min-w-0 w-full overflow-hidden">
            <div className="space-y-4 min-w-0">
              {/* Availability Badge */}
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Out of Stock</span>
                  </span>
                ) : product.stock_quantity <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Only {product.stock_quantity} left in stock!</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>In Stock</span>
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2A29] tracking-tight break-words [overflow-wrap:anywhere] min-w-0">
                {product.name}
              </h1>

              {/* Price Tag */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#2C2A29] font-mono">${product.price.toFixed(2)}</span>
                <span className="text-xs text-stone-500 font-mono">Taxes included</span>
              </div>

              {/* Description (Collapsible Read More / Show Less) */}
              <div className="border-t border-b border-[#DDD6C8] py-4 min-w-0">
                <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Description
                </h3>

                <div className="relative">
                  <p
                    className={`text-stone-600 text-sm leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] min-w-0 transition-all duration-200 ${
                      !isDescriptionExpanded && (product.description || "").length > 220
                        ? "line-clamp-4 max-h-24 overflow-hidden"
                        : ""
                    }`}
                  >
                    {product.description}
                  </p>

                  {!isDescriptionExpanded && (product.description || "").length > 220 && (
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#ECE8DF] via-[#ECE8DF]/80 to-transparent pointer-events-none"
                    />
                  )}
                </div>

                {(product.description || "").length > 220 && (
                  <div className="mt-2.5 flex items-center justify-start">
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                      className="text-xs font-semibold text-[#1E3A5F] hover:text-[#152843] flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{isDescriptionExpanded ? "Show Less" : "Read More"}</span>
                      {isDescriptionExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-2">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-stone-600">Quantity</label>
                  <div className="flex items-center bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-stone-600 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-semibold text-[#2C2A29]">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                      }
                      className="px-3 py-1.5 text-stone-600 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartLoading}
                  className="flex-1 bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 disabled:hover:bg-[#1E3A5F] text-white text-sm font-semibold py-3 px-6 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {cartLoading
                      ? "Adding to Cart..."
                      : isOutOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`border font-semibold text-sm py-3 px-4 rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-2 ${
                    isInWishlist(product.id)
                      ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
                      : "bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border-[#D8D4CE]"
                  }`}
                  title={isInWishlist(product.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart
                    className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current text-rose-500" : "text-stone-500"}`}
                  />
                  <span className="hidden sm:inline">
                    {isInWishlist(product.id) ? "Saved" : "Wishlist"}
                  </span>
                </button>

                <button
                  onClick={() => router.back()}
                  className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] font-semibold text-sm py-3 px-5 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <RouteGuard type="customer" adminRedirect="/admin">
      <ProductDetailContent />
    </RouteGuard>
  );
}
