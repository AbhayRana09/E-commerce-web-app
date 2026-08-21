"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";

function CartContent() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    totalItems,
    subtotal,
    loading,
    updateQuantity,
    removeItem,
    clearAll,
  } = useCart();

  const shippingCost = subtotal > 100 || subtotal === 0 ? 0.0 : 9.99;
  const estimatedTax = subtotal * 0.08; // 8% sales tax estimate
  const grandTotal = subtotal + shippingCost + estimatedTax;

  if (!user) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-5 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Login to View Your Cart</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please log in to your account to view your saved items, synchronize inventory, and proceed with secure checkout.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-5 py-2.5 rounded-xl transition border border-slate-700"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-slate-900/40 p-8 rounded-3xl border border-slate-800">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Explore our store catalog and add high-tech devices, apparel, and footwear to your cart.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
        >
          Explore Catalog &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your items, adjust quantities, and proceed to checkout ({totalItems} item{totalItems === 1 ? "" : "s"}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-800/60"
          >
            &larr; Continue Shopping
          </Link>
          <button
            onClick={clearAll}
            disabled={loading || items.length === 0}
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition px-3 py-2 rounded-xl hover:bg-red-500/10 border border-red-500/20 disabled:opacity-40 cursor-pointer"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Main Grid: Items List & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const maxStock = product?.stock_quantity || 1;
            const isAtMaxStock = item.quantity >= maxStock;

            return (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700/80 transition"
              >
                {/* Product Thumbnail & Meta */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                    {product?.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {product?.category?.name && (
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                        {product.category.name}
                      </span>
                    )}
                    <Link
                      href={`/products/${product?.slug}`}
                      className="font-bold text-sm text-slate-100 hover:text-indigo-300 transition line-clamp-1 block"
                      title={product?.name}
                    >
                      {product?.name}
                    </Link>
                    <p className="text-xs text-slate-400 font-semibold">
                      ${Number(product?.price || 0).toFixed(2)} each
                    </p>
                    {isAtMaxStock && (
                      <p className="text-[10px] font-medium text-amber-400">
                        ⚠️ Maximum available stock reached ({maxStock})
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  {/* Quantity Control */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={loading}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition disabled:opacity-40 cursor-pointer"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-white font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={loading || isAtMaxStock}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={isAtMaxStock ? "Max stock reached" : "Increase quantity"}
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total</span>
                    <span className="font-extrabold text-sm text-white font-mono">
                      ${(item.quantity * (product?.price || 0)).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={loading}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Column: Order Summary Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl sticky top-24">
          <h2 className="text-base font-bold text-white tracking-tight pb-3 border-b border-slate-800">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Items Subtotal</span>
              <span className="font-mono font-semibold text-white">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5">
                <span>Shipping</span>
                {shippingCost === 0 && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    FREE
                  </span>
                )}
              </div>
              <span className="font-mono font-semibold text-white">
                {shippingCost === 0 ? "$0.00" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Estimated Tax (8%)</span>
              <span className="font-mono font-semibold text-white">
                ${estimatedTax.toFixed(2)}
              </span>
            </div>

            {shippingCost > 0 && (
              <p className="text-[11px] text-indigo-400 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                💡 Add ${(100 - subtotal).toFixed(2)} more for <strong>FREE Shipping</strong>!
              </p>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Estimated Total</span>
              <span className="text-xl font-extrabold text-white font-mono">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            disabled={items.length === 0 || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Proceed to Checkout</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <span>🔒</span> Secure 256-bit Encrypted Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <RouteGuard type="customer" adminRedirect="/admin">
      <CartContent />
    </RouteGuard>
  );
}
