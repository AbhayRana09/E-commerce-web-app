"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/CartContext";
import RouteGuard from "@/components/RouteGuard";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem, loading: cartLoading } = useCart();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-slate-900/60 p-8 rounded-2xl border border-slate-800 backdrop-blur-md">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Product Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "The product you requested could not be found."}</p>
          <Link
            href="/products"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Return to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-200 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-200 transition">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image View */}
          <div className="relative aspect-square rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                No Image Available
              </div>
            )}
            {product.category?.name && (
              <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-800">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Product Info & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Availability Badge */}
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span>Out of Stock</span>
                  </span>
                ) : product.stock_quantity <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Only {product.stock_quantity} left in stock!</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>In Stock</span>
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                {product.name}
              </h1>

              {/* Price Tag */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-100">${product.price.toFixed(2)}</span>
                <span className="text-xs text-slate-500 font-mono">Taxes included</span>
              </div>

              {/* Description */}
              <div className="border-t border-b border-slate-800/80 py-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-2">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-slate-400">Quantity</label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-semibold text-slate-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                      }
                      className="px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    />
                  </svg>
                  {cartLoading
                    ? "Adding to Cart..."
                    : isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

                <button
                  onClick={() => router.back()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold py-3 px-4 rounded-xl transition cursor-pointer"
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
    <RouteGuard type="customer" adminRedirect="/admin/products">
      <ProductDetailContent />
    </RouteGuard>
  );
}
