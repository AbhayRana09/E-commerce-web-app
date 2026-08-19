"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getCategories } from "@/lib/products";

function NavbarContent() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  const isAdminRoute = pathname?.startsWith("/admin");
  const isSuperAdmin = user?.role === "ADMIN";

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
    router.replace(`/?${params.toString()}`);
  };

  const handleCategorySelect = (catId) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (catId) {
      params.set("category_id", catId);
    } else {
      params.delete("category_id");
    }
    params.set("page", "1");
    router.replace(`/?${params.toString()}`);
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
    <nav className="bg-slate-900/95 text-white border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      {/* Tier 1: Primary Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo / Section Header */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdminRoute || isSuperAdmin ? (
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-300 transition hidden sm:inline">
                Admin Portal
              </span>
            </Link>
          ) : (
            <Link href="/" className="text-lg sm:text-xl font-extrabold tracking-tight text-white hover:text-indigo-300 transition flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-600/30">
                E
              </span>
              <span className="hidden sm:inline">E-Commerce Store</span>
            </Link>
          )}
        </div>

        {/* Global Product Search Bar in Navbar Tier 1 (Only for Customers & Guests) */}
        {!isAdminRoute && !isSuperAdmin && (
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products by name, tag, or keyword..."
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner"
              />
              <svg
                className="w-4 h-4 text-indigo-400 absolute left-3 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {currentSearch && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links & User Menu */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {!isAdminRoute && !isSuperAdmin && (
            <Link
              href="/"
              className={`text-xs sm:text-sm font-semibold transition px-2.5 sm:px-3 py-1.5 rounded-xl ${
                pathname === "/"
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
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
                    ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 text-amber-200"
                    : "bg-slate-800/80 border-slate-700/60 hover:border-indigo-500/50 text-slate-200"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                    isSuperAdmin || isAdminRoute
                      ? "bg-gradient-to-tr from-amber-500 to-orange-600 text-white"
                      : "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white"
                  }`}
                >
                  {isSuperAdmin || isAdminRoute ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ) : (
                    user.first_name?.[0] || "A"
                  )}
                </div>

                <span className="text-xs font-semibold text-white hidden sm:inline">
                  {isSuperAdmin || isAdminRoute ? "Admin" : "My Account"}
                </span>

                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-white" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 mb-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white truncate">
                        {user.first_name} {user.last_name || ""}
                      </p>
                      {isSuperAdmin && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Admin Dashboard Link */}
                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition"
                    >
                      <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}

                  {/* My Profile Link */}
                  <Link
                    href="/profile?tab=profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>

                  {/* Addresses / Saved Addresses Link */}
                  <Link
                    href="/profile?tab=addresses"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Addresses / Saved Addresses
                  </Link>

                  <div className="my-1 border-t border-slate-800/80"></div>

                  {/* Log Out */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      showToast("Logged out successfully!", "success");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer text-left"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white text-xs sm:text-sm font-medium px-3 py-1.5 transition rounded-xl hover:bg-slate-800/60"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tier 2: Secondary Category Sub-Navbar Strip (Only for Customers & Guests) */}
      {!isAdminRoute && !isSuperAdmin && categories.length > 0 && (
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleCategorySelect("")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                currentCategory === ""
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  currentCategory === cat.id
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-600/30"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="bg-slate-900 h-16 border-b border-slate-800"></nav>}>
      <NavbarContent />
    </Suspense>
  );
}


