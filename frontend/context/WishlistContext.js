"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { useCart } from "./CartContext";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
  clearWishlist,
} from "@/lib/wishlist";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user's wishlist from backend
  const loadWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      setProductIds([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getWishlist();
      setItems(data.items || []);
      setProductIds(data.product_ids || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      if (err.status !== 401) {
        showToast(err.message || "Failed to sync wishlist", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Fast O(1) membership check
  const isInWishlist = useCallback(
    (productId) => {
      return productIds.includes(Number(productId));
    },
    [productIds]
  );

  // Optimistic Toggle Wishlist (Add or Remove)
  const toggleItem = async (product) => {
    if (!user) {
      showToast("Please log in to save items to your wishlist.", "info");
      router.push("/login");
      return false;
    }

    const productId = Number(product.id);
    const wasInWishlist = isInWishlist(productId);

    // Optimistic UI state update
    if (wasInWishlist) {
      setProductIds((prev) => prev.filter((id) => id !== productId));
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    } else {
      setProductIds((prev) => [...prev, productId]);
      setItems((prev) => [
        {
          id: Date.now(),
          user_id: user.id,
          product_id: productId,
          created_at: new Date().toISOString(),
          product,
        },
        ...prev,
      ]);
    }

    try {
      const updated = await toggleWishlist(productId);
      setItems(updated.items || []);
      setProductIds(updated.product_ids || []);
      showToast(
        wasInWishlist ? "Item removed from wishlist" : "Item saved to wishlist! ❤️",
        "success"
      );
      return true;
    } catch (err) {
      // Rollback on error
      loadWishlist();
      showToast(err.message || "Failed to update wishlist", "error");
      return false;
    }
  };

  // Remove specific item
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      const updated = await removeFromWishlist(productId);
      setItems(updated.items || []);
      setProductIds(updated.product_ids || []);
      showToast("Item removed from wishlist", "info");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to remove item", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atomic Move to Cart
  const moveItemToCart = async (productId) => {
    try {
      setLoading(true);
      const updatedWishlist = await moveWishlistItemToCart(productId);
      setItems(updatedWishlist.items || []);
      setProductIds(updatedWishlist.product_ids || []);
      
      // Refresh shopping cart state
      await refreshCart();
      showToast("Item moved to your cart! 🛍️", "success");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to move item to cart", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire wishlist
  const clearAll = async () => {
    try {
      setLoading(true);
      const updated = await clearWishlist();
      setItems(updated.items || []);
      setProductIds(updated.product_ids || []);
      showToast("Wishlist cleared", "info");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to clear wishlist", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const totalWishlistItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalWishlistItems,
        loading,
        isInWishlist,
        toggleItem,
        removeItem,
        moveItemToCart,
        clearAll,
        refreshWishlist: loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
