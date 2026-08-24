"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getCategories } from "@/lib/products";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

function NavbarContent() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  const isAdminRoute = pathname?.startsWith("/admin");
  const isProfileRoute = pathname?.startsWith("/profile");
  const isSuperAdmin = user?.role === "ADMIN";
  const isHome = pathname === "/";

  const currentSearch = searchParams?.get("search") || "";
  const currentCategory = searchParams?.get("category_id") || "";

  // Load categories for secondary category sub-navbar
  useEffect(() => {
    async function loadCats() {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories in navbar:", err);
      }
    }
    loadCats();
  }, []);

  // Update URL search or category filters
  const handleSearchChange = (val) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (val && val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ""}`);
  };

  const handleCategorySelect = (catId) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (catId) {
      params.set("category_id", catId);
    } else {
      params.delete("category_id");
    }
    params.set("page", "1");
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ""}`);
  };

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav className="bg-[#F7F5F0]/95 text-[#2C2A29] border-b border-[#DDD6C8] sticky top-0 z-50 backdrop-blur-md shadow-xs">
      {/* Tier 1: Primary Header */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo / Section Header */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdminRoute || isSuperAdmin ? (
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-[#2C2A29] group-hover:text-[#1E3A5F] transition hidden sm:inline">
                Admin Portal
              </span>
            </Link>
          ) : (
            <Link href="/" className="text-lg sm:text-xl font-extrabold tracking-tight text-[#2C2A29] hover:text-[#1E3A5F] transition flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-black shadow-xs">
                E
              </span>
              <span className="hidden sm:inline">E-Commerce Store</span>
            </Link>
          )}
        </div>

        {/* Global Multi-Tier Search Bar (Only shown on customer pages) */}
        {!isAdminRoute && !isSuperAdmin && (
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by title, category, or tags..."
                defaultValue={currentSearch}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchChange(e.target.value);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value !== currentSearch) {
                    handleSearchChange(e.target.value);
                  }
                }}
                className="w-full bg-[#FFFFFF] border border-[#D8D4CE] focus:border-[#1E3A5F] rounded-xl px-4 py-2 pl-10 text-xs sm:text-sm text-[#2C2A29] placeholder:text-stone-400 focus:outline-none transition shadow-xs"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Navigation Links & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isAdminRoute && !isSuperAdmin && (
            <Link
              href="/"
              className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs"
            >
              Home
            </Link>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition text-left cursor-pointer select-none ${
                  isSuperAdmin || isAdminRoute
                    ? "bg-[#ECE8DF] border-[#D8D4CE] hover:border-[#1E3A5F] text-[#2C2A29]"
                    : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-[#1E3A5F] text-[#2C2A29]"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs bg-[#1E3A5F] text-white shadow-xs"
                >
                  {isSuperAdmin || isAdminRoute ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    user.first_name?.[0] || "U"
                  )}
                </div>

                <span className="text-xs font-semibold text-[#2C2A29] hidden sm:inline">
                  {isSuperAdmin || isAdminRoute ? "Admin" : "My Account"}
                </span>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-[#2C2A29]" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 rounded-xl bg-[#ECE8DF] border border-[#D8D4CE] mb-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#2C2A29] truncate">
                        {user.first_name} {user.last_name || ""}
                      </p>
                      {isSuperAdmin && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20 shrink-0">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Admin Dashboard Link */}
                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1E3A5F] hover:bg-[#ECE8DF] transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#1E3A5F]" />
                      Admin Dashboard
                    </Link>
                  )}

                  {/* My Profile Link */}
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition"
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    My Profile
                  </Link>

                  {/* My Wishlist Link */}
                  {!isSuperAdmin && !isAdminRoute && (
                    <Link
                      href="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition"
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      My Wishlist ({totalWishlistItems})
                    </Link>
                  )}

                  {/* My Orders Link (Only for Regular Users) */}
                  {!isSuperAdmin && !isAdminRoute && (
                    <Link
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-500" />
                      My Orders
                    </Link>
                  )}

                  <div className="my-1 border-t border-[#DDD6C8]"></div>

                  {/* Log Out */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      showToast("Logged out successfully!", "success");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs"
              >
                Register
              </Link>
            </div>
          )}

          {/* Wishlist & Shopping Cart Icons (Hidden on Admin & Profile Pages) */}
          {!isAdminRoute && !isSuperAdmin && !isProfileRoute && (
            <div className="flex items-center gap-2">
              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className={`relative p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer group shrink-0 ${
                  pathname === "/wishlist"
                    ? "bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-xs"
                    : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-[#1E3A5F] text-stone-700"
                }`}
                title={`Saved Wishlist (${totalWishlistItems} items)`}
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    pathname === "/wishlist"
                      ? "text-white fill-white"
                      : totalWishlistItems > 0
                      ? "text-rose-500 fill-rose-500"
                      : "text-[#2C2A29] group-hover:text-rose-500"
                  }`}
                />

                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[19px] h-[19px] flex items-center justify-center shadow-xs border border-[#F7F5F0] animate-in zoom-in-50 duration-200">
                    {totalWishlistItems > 99 ? "99+" : totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Icon */}
              <Link
                href="/cart"
                className={`relative p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer group shrink-0 ${
                  pathname === "/cart"
                    ? "bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-xs"
                    : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-[#1E3A5F] text-stone-700"
                }`}
                title={`Shopping Cart (${totalItems} items)`}
                aria-label="Shopping Cart"
              >
                <ShoppingCart
                  className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    pathname === "/cart" ? "text-white" : "text-[#2C2A29] group-hover:text-[#1E3A5F]"
                  }`}
                />

                {/* Floating Dynamic Item Badge on Top-Right Corner with Terracotta Accent */}
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C86D51] text-white font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[19px] h-[19px] flex items-center justify-center shadow-xs border border-[#F7F5F0] animate-in zoom-in-50 duration-200">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tier 2: Secondary Category Sub-Navbar Strip (Only for Customers & Guests) */}
      {!isAdminRoute && !isSuperAdmin && categories.length > 0 && (
        <div className="border-t border-[#DDD6C8] bg-[#ECE8DF]/90 px-4 sm:px-6 lg:px-8 py-2">
          <div className="w-full max-w-[1700px] mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleCategorySelect("")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                isHome && currentCategory === ""
                  ? "bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-xs"
                  : "bg-[#FFFFFF] border-[#D8D4CE] text-stone-700 hover:bg-[#ECE8DF] hover:text-[#2C2A29]"
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const isSelected = isHome && String(currentCategory) === String(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? "bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-xs"
                      : "bg-[#FFFFFF] border-[#D8D4CE] text-stone-700 hover:bg-[#ECE8DF] hover:text-[#2C2A29]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="bg-[#F7F5F0] h-16 border-b border-[#DDD6C8]"></nav>}>
      <NavbarContent />
    </Suspense>
  );
}
