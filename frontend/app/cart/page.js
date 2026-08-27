"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

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
      <div className="py-16 text-center max-w-lg mx-auto space-y-5 bg-[#ECE8DF] p-8 rounded-3xl border border-[#DDD6C8] shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] text-[#1E3A5F] flex items-center justify-center mx-auto border border-[#D8D4CE]">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#2C2A29] tracking-tight">Login to View Your Cart</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Please log in to your account to view your saved items, synchronize inventory, and proceed with secure checkout.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold px-5 py-2.5 rounded-xl transition border border-[#D8D4CE] shadow-xs"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-[#ECE8DF] p-8 rounded-3xl border border-[#DDD6C8] shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-[#FFFFFF] text-stone-400 border border-[#D8D4CE] flex items-center justify-center mx-auto shadow-xs">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#2C2A29]">Your Cart is Empty</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Explore our store catalog and add high-tech devices, apparel, and footwear to your cart.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mt-2 bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD6C8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2A29] tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Review your items, adjust quantities, and proceed to checkout ({totalItems} item{totalItems === 1 ? "" : "s"}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold text-[#2C2A29] hover:text-black transition flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#ECE8DF] border border-[#D8D4CE] shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <button
            onClick={clearAll}
            disabled={loading || items.length === 0}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-40 transition px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-rose-50 border border-[#D8D4CE] cursor-pointer shadow-xs"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Cart Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const maxStock = product?.stock_quantity ?? 999;
            const isAtMaxStock = item.quantity >= maxStock;

            return (
              <div
                key={item.id}
                className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs transition hover:border-[#1E3A5F]"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-20 h-20 rounded-xl bg-[#FFFFFF] border border-[#D8D4CE] overflow-hidden shrink-0 flex items-center justify-center">
                    {product?.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-stone-400">No Image</span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    {product?.category?.name && (
                      <span className="text-[10px] font-semibold text-[#1E3A5F] uppercase tracking-wider block">
                        {product.category.name}
                      </span>
                    )}
                    <Link
                      href={`/products/${product?.slug}`}
                      className="font-bold text-sm text-[#2C2A29] hover:text-[#1E3A5F] transition line-clamp-1 break-words [overflow-wrap:anywhere]"
                      title={product?.name}
                    >
                      {product?.name}
                    </Link>
                    <p className="text-xs text-stone-600 font-semibold">
                      ${Number(product?.price || 0).toFixed(2)} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#DDD6C8]">
                  {/* Quantity Control */}
                  <div className="flex items-center bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={loading}
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition disabled:opacity-40 cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-[#2C2A29] font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={loading || isAtMaxStock}
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={isAtMaxStock ? "Max stock reached" : "Increase quantity"}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Total</span>
                    <span className="font-extrabold text-sm text-[#2C2A29] font-mono">
                      ${(item.quantity * (product?.price || 0)).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={loading}
                    className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Column: Order Summary Card */}
        <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs sticky top-24">
          <h2 className="text-base font-bold text-[#2C2A29] tracking-tight pb-3 border-b border-[#DDD6C8]">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span>Items Subtotal</span>
              <span className="font-mono font-semibold text-[#2C2A29]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <div className="flex items-center gap-1.5">
                <span>Shipping</span>
                {shippingCost === 0 && (
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300">
                    FREE
                  </span>
                )}
              </div>
              <span className="font-mono font-semibold text-[#2C2A29]">
                {shippingCost === 0 ? "$0.00" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-700">
              <span>Estimated Tax (8%)</span>
              <span className="font-mono font-semibold text-[#2C2A29]">
                ${estimatedTax.toFixed(2)}
              </span>
            </div>

            {shippingCost > 0 && (
              <p className="text-[11px] text-[#1E3A5F] bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D8D4CE]">
                💡 Add ${(100 - subtotal).toFixed(2)} more for <strong>FREE Shipping</strong>!
              </p>
            )}

            <div className="pt-3 border-t border-[#DDD6C8] flex items-center justify-between">
              <span className="text-sm font-bold text-[#2C2A29]">Estimated Total</span>
              <span className="text-xl font-extrabold text-[#2C2A29] font-mono">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            disabled={items.length === 0 || loading}
            className="w-full bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
