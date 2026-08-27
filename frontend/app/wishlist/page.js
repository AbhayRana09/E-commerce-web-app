"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import RouteGuard from "@/components/RouteGuard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Heart,
  ShoppingCart,
  ArrowRight,
  X,
} from "lucide-react";

function WishlistContent() {
  const { user } = useAuth();
  const { items, totalWishlistItems, loading, removeItem, moveItemToCart, clearAll } = useWishlist();
  const { showToast } = useToast();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [movingAll, setMovingAll] = useState(false);

  if (!user) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-5 bg-[#ECE8DF] p-8 rounded-3xl border border-[#DDD6C8] shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] text-[#1E3A5F] flex items-center justify-center mx-auto border border-[#D8D4CE]">
          <Heart className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#2C2A29] tracking-tight">Login to View Your Wishlist</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Please log in to your account to view your saved items, track availability, and easily move them to your cart.
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

  const handleMoveToCart = async (productId) => {
    setMovingId(productId);
    try {
      await moveItemToCart(productId);
    } finally {
      setMovingId(null);
    }
  };

  const handleMoveAllToCart = async () => {
    if (items.length === 0) return;
    setMovingAll(true);
    let successCount = 0;
    try {
      for (const item of items) {
        if (item.product?.is_active && (item.product?.stock_quantity ?? 0) > 0) {
          const res = await moveItemToCart(item.product.id);
          if (res) successCount++;
        }
      }
      if (successCount > 0) {
        showToast(`Moved ${successCount} item(s) to your cart! 🛍️`, "success");
      }
    } finally {
      setMovingAll(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2A29] tracking-tight">
              My Saved Wishlist
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Keep track of products you love and quickly transfer them to your cart when ready.
          </p>
        </div>

        {totalWishlistItems > 0 && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleMoveAllToCart}
              disabled={movingAll || loading}
              className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{movingAll ? "Moving All..." : "Move All to Cart"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-rose-700 hover:text-rose-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#D8D4CE] transition cursor-pointer shadow-xs"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && items.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-500">Loading your saved items...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-12 sm:p-16 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#FFFFFF] border border-[#D8D4CE] flex items-center justify-center mx-auto text-3xl shadow-xs">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#2C2A29]">
              Your wishlist is currently empty
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              Explore our catalogue and click the heart icon on any product to save it for later.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl transition shadow-xs"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const stock = product.stock_quantity ?? 0;
            const isAvailable = stock > 0;
            const isMoving = movingId === product.id;

            return (
              <div
                key={item.id}
                className="group bg-[#ECE8DF] border border-[#DDD6C8] hover:border-[#1E3A5F] rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md shadow-xs"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-square rounded-xl bg-[#FFFFFF] overflow-hidden mb-3 border border-[#D8D4CE]">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                        No Image
                      </div>
                    )}

                    {/* Category Pill */}
                    {product.category?.name && (
                      <span className="absolute top-2 left-2 z-10 bg-[#FFFFFF]/95 backdrop-blur-md text-[#1E3A5F] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#D8D4CE] shadow-xs">
                        {product.category.name}
                      </span>
                    )}

                    {/* Remove Quick Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-[#FFFFFF]/95 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-[#D8D4CE] flex items-center justify-center transition cursor-pointer shadow-xs"
                      title="Remove from wishlist"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Stock Status Badge */}
                    {!isAvailable ? (
                      <span className="absolute bottom-2 left-2 z-10 bg-rose-50/95 backdrop-blur-md text-rose-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-200 shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>Out of Stock</span>
                      </span>
                    ) : stock <= 5 ? (
                      <span className="absolute bottom-2 left-2 z-10 bg-amber-50/95 backdrop-blur-md text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>Low in Stock ({stock})</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-bold text-[#2C2A29] text-base line-clamp-1 hover:text-[#1E3A5F] transition break-words [overflow-wrap:anywhere]"
                  >
                    {product.name}
                  </Link>

                  {/* Description */}
                  <p className="text-stone-600 text-xs mt-1 line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {product.description}
                  </p>
                </div>

                {/* Price & Move to Cart Button */}
                <div className="mt-4 pt-3 border-t border-[#DDD6C8] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-stone-500">Price</span>
                    <span className="text-lg font-bold text-[#2C2A29] font-mono">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product.id)}
                      disabled={!isAvailable || isMoving}
                      className="flex-1 bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-40 disabled:hover:bg-[#1E3A5F] text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>
                        {isMoving
                          ? "Moving..."
                          : !isAvailable
                          ? "Out of Stock"
                          : "Move to Cart"}
                      </span>
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#D8D4CE] transition shadow-xs"
                      title="View Details"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Wishlist Confirmation Dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear Wishlist"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
        actionType="delete"
        onConfirm={async () => {
          await clearAll();
          setShowClearConfirm(false);
        }}
      />
    </div>
  );
}

export default function WishlistPage() {
  return (
    <RouteGuard type="customer" adminRedirect="/admin">
      <WishlistContent />
    </RouteGuard>
  );
}
