"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/lib/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user's persistent cart from backend
  const loadCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to load shopping cart:", err);
      // Suppress 401 errors during logout transitions
      if (err.status !== 401) {
        showToast(err.message || "Failed to sync cart", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Add Item to Cart
  const addItem = async (productId, quantity = 1) => {
    if (!user) {
      showToast("Please log in to add items to your shopping cart.", "info");
      router.push("/login");
      return false;
    }

    try {
      setLoading(true);
      const updatedCart = await addToCart(productId, quantity);
      setCart(updatedCart);
      showToast("Item added to cart successfully!", "success");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to add item to cart", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update Item Quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return await removeItem(itemId);
    }

    try {
      setLoading(true);
      const updatedCart = await updateCartItem(itemId, quantity);
      setCart(updatedCart);
      return true;
    } catch (err) {
      showToast(err.message || "Failed to update quantity", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove Item from Cart
  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
      showToast("Item removed from cart", "info");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to remove item", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearAll = async () => {
    try {
      setLoading(true);
      const updatedCart = await clearCart();
      setCart(updatedCart);
      showToast("Cart cleared", "info");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to clear cart", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.items || [];
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = cart?.subtotal || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalItems,
        totalQuantity,
        subtotal,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearAll,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
