"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/products";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch categories on mount
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

  // Fetch products when filters/page/sort change
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Explore Catalog
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Browse our latest products, filters, and exclusive deals. ({totalCount} items found)
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5"
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
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md h-fit">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-200 text-sm uppercase tracking-wider">Filters</h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Sort By</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Skeleton Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-4"
                  >
                    <div className="h-48 bg-slate-800 rounded-xl w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <svg
                  className="w-12 h-12 text-slate-600 mx-auto mb-3"
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
                <h3 className="text-slate-300 font-semibold text-lg">No Products Found</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria or resetting filters to find what you are looking for.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden mb-4 border border-slate-800/80">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            No Image
                          </div>
                        )}
                        {product.category?.name && (
                          <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-indigo-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-800">
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      {/* Product Title */}
                      <h3 className="font-semibold text-slate-100 text-base line-clamp-1 group-hover:text-indigo-400 transition">
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
                        <span className="text-xs text-slate-500 block font-mono">Price</span>
                        <span className="text-lg font-bold text-slate-100">
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
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || loading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800 transition cursor-pointer"
                >
                  Previous
                </button>

                <span className="text-xs text-slate-400 font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || loading}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
