"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getProducts, getCategories } from "@/lib/products";

function HomeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync Search & Category from Multi-Tier Header URL Params
  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category_id") || "";

  // Page-level filter state (Price range, sort, pagination)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Load products when any filter or page changes
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const data = await getProducts(params);
      setProducts(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, minPrice, maxPrice, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleResetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    router.replace("/");
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(selectedCategory) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    sort !== "newest";

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            {user ? `Welcome back, ${user.first_name || "Customer"}` : "Welcome to E-Commerce Store"}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Discover Quality Products & Exclusive Deals
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Browse our full catalog, search products globally in the header, filter by price or category strip above.
          </p>
        </div>
      </div>

      {/* Filter Toolbar (Price Range, Sort By, Reset Filters) */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        {/* Price Range Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Price Range ($)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) >= 0) {
                  setMinPrice(val);
                  setPage(1);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
            <span className="text-slate-600 text-xs">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) >= 0) {
                  setMaxPrice(val);
                  setPage(1);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Sort By
          </label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        <div>
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 transition cursor-pointer disabled:cursor-not-allowed"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Product Catalog
          </h2>
          <span className="text-xs text-slate-400">
            {totalCount} {totalCount === 1 ? "item" : "items"} found
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-4"
              >
                <div className="h-44 bg-slate-800 rounded-xl w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6 space-y-3">
            <svg
              className="w-12 h-12 text-slate-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-slate-300 font-semibold text-base">No products match your criteria</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Try adjusting your search terms, price range, or category filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isAvailable = (product.stock_quantity ?? 0) > 0;
              return (
                <div
                  key={product.id}
                  className="group bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden mb-3 border border-slate-800/80">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                          No Image
                        </div>
                      )}

                      {/* Category Badge */}
                      {product.category?.name && (
                        <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-800">
                          {product.category.name}
                        </span>
                      )}

                      {/* Stock / Status Badge */}
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${isAvailable
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                      >
                        {isAvailable ? `In Stock (${product.stock_quantity})` : "Out of Stock"}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-slate-100 text-base line-clamp-1 group-hover:text-indigo-400 transition">
                      {product.name}
                    </h3>

                    {/* Product Description */}
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Footer / Price & Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Price</span>
                      <span className="text-base font-bold text-white">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              Previous
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <RouteGuard type="customer" adminRedirect="/admin">
      <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading shop...</div>}>
        <HomeContent />
      </Suspense>
    </RouteGuard>
  );
}
