"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import RouteGuard from "@/components/RouteGuard";
import { getProducts, getCategories } from "@/lib/products";
import {
  ArrowUpDown,
  X,
  Package,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function HomeContent() {
  const { user } = useAuth();
  const { items, addItem } = useCart();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync Search & Category from Multi-Tier Header URL Params
  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category_id") || "";

  // Page level filter states
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch categorized/filtered products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProducts({
        search: search.trim() || undefined,
        category_id: selectedCategory ? parseInt(selectedCategory, 10) : undefined,
        sort_by: sort,
        page,
        limit: 12,
      });

      setProducts(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalProducts(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load products. Please check your network.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    async function loadCats() {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCats();
  }, []);

  const handleResetFilters = () => {
    setSort("newest");
    setPage(1);
    router.push("/");
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(selectedCategory) ||
    sort !== "newest";

  return (
    <div className="space-y-8 py-4 w-full max-w-[1700px] mx-auto">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl bg-[#ECE8DF] border border-[#DDD6C8] p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#1E3A5F] bg-[#FFFFFF] border border-[#D8D4CE] rounded-full shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] animate-pulse"></span>
            {user ? `Welcome back, ${user.first_name || "Customer"}` : "Welcome to E-Commerce Store"}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2A29] tracking-tight leading-tight">
            Discover Quality Products & Exclusive Deals
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Browse our full catalog, search products globally in the header, or select a category above.
          </p>
        </div>
      </div>

      {/* Compact Filter Toolbar (Sort By & Reset Filters) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-3 sm:px-5 shadow-xs">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#2C2A29] flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-[#1E3A5F]" />
            <span>Sort By:</span>
          </label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-3 py-1.5 text-xs text-[#2C2A29] focus:outline-none focus:border-[#1E3A5F] transition cursor-pointer min-w-[175px] shadow-xs"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold py-1.5 px-3 rounded-xl border border-[#D8D4CE] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Reset Filters</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Product Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2C2A29] tracking-tight">
            {selectedCategory
              ? categories.find((c) => String(c.id) === String(selectedCategory))?.name || "Selected Category"
              : search
              ? `Search Results for "${search}"`
              : "All Available Products"}
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            {totalProducts} product{totalProducts === 1 ? "" : "s"} found
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-2xl p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square bg-[#DDD6C8] rounded-xl"></div>
                <div className="h-4 bg-[#DDD6C8] rounded-md w-3/4"></div>
                <div className="h-3 bg-[#DDD6C8] rounded-md w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-[#DDD6C8] rounded-md w-16"></div>
                  <div className="h-8 bg-[#DDD6C8] rounded-xl w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-red-700 font-semibold text-sm">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Try Reloading Products
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty Search Results */
          <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-[#2C2A29] font-semibold text-base">No products match your criteria</h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              Try adjusting your search terms or category filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const stock = product.stock_quantity ?? 0;
              const isAvailable = stock > 0;
              const cartItem = items.find((item) => item.product_id === product.id);
              const inCartQty = cartItem ? cartItem.quantity : 0;
              const isMaxStockReached = isAvailable && inCartQty >= stock;

              return (
                <div
                  key={product.id}
                  className="group bg-[#ECE8DF] border border-[#DDD6C8] hover:border-[#1E3A5F] rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 shadow-xs"
                >
                  <div>
                    {/* Product Image */}
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

                      {/* Category Badge */}
                      {product.category?.name && (
                        <span className="absolute top-2 left-2 z-10 bg-[#FFFFFF]/95 backdrop-blur-md text-[#1E3A5F] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#D8D4CE] shadow-xs">
                          {product.category.name}
                        </span>
                      )}

                      {/* Wishlist Heart Toggle Button (Top-Right) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer ${
                          isInWishlist(product.id)
                            ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
                            : "bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-stone-600 hover:text-rose-500 border border-[#D8D4CE]"
                        }`}
                        title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        aria-label="Toggle Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform active:scale-125 ${
                            isInWishlist(product.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      {/* Stock Badge */}
                      {!isAvailable ? (
                        <span className="absolute bottom-2 right-2 z-10 bg-rose-50/95 backdrop-blur-md text-rose-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-200 shadow-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>Out of Stock</span>
                        </span>
                      ) : stock <= 5 ? (
                        <span className="absolute bottom-2 right-2 z-10 bg-amber-50/95 backdrop-blur-md text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 shadow-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Low in Stock</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-[#2C2A29] text-base line-clamp-1 group-hover:text-[#1E3A5F] transition break-words [overflow-wrap:anywhere]">
                      {product.name}
                    </h3>

                    {/* Product Description */}
                    <p className="text-stone-600 text-xs mt-1 line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                      {product.description}
                    </p>
                  </div>

                  {/* Footer / Price & Actions */}
                  <div className="mt-4 pt-3 border-t border-[#DDD6C8] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-medium">Price</span>
                      <span className="text-base font-bold text-[#2C2A29] font-mono">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addItem(product.id, 1)}
                        disabled={!isAvailable || isMaxStockReached}
                        className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#1E3A5F]"
                        title={
                          !isAvailable
                            ? "Out of stock"
                            : isMaxStockReached
                            ? "Out of stock"
                            : "Add to cart"
                        }
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>

                      <Link
                        href={`/products/${product.slug}`}
                        className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] text-xs font-semibold px-2.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                        title="View full specifications"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#DDD6C8]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] disabled:opacity-40 text-[#2C2A29] text-xs font-semibold px-4 py-2 rounded-xl transition border border-[#D8D4CE] cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-stone-600 font-mono">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] disabled:opacity-40 text-[#2C2A29] text-xs font-semibold px-4 py-2 rounded-xl transition border border-[#D8D4CE] cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
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
      <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Loading store catalogue...</div>}>
        <HomeContent />
      </Suspense>
    </RouteGuard>
  );
}
