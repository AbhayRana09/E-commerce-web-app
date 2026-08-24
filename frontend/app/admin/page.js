"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats } from "@/lib/admin";
import { useAuth } from "@/context/AuthContext";
import { Package, Users, ShoppingBag, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    out_of_stock: 0,
    total_categories: 0,
    total_customers: 0,
    total_orders: 0,
    total_sales: 0,
    recent_orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Confirmed
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1E3A5F]/10 text-[#1E3A5F] border border-[#1E3A5F]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] animate-pulse"></span>
            Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Shipped
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Delivered
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECE8DF] text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-wider block mb-1">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2A29] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Welcome back, <span className="font-semibold text-[#2C2A29]">{user?.first_name || "Administrator"}</span>. Here is your real-time store summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/products"
            className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#D8D4CE] transition shadow-xs"
          >
            Review Orders
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl p-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="underline font-semibold ml-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-5 flex flex-col justify-between hover:border-[#1E3A5F] transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Total Products</span>
            <span className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center border border-[#1E3A5F]/20">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#2C2A29]">
              {loading ? "..." : stats.total_products}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              {loading ? "" : `${stats.active_products} active in store`}
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-5 flex flex-col justify-between hover:border-[#1E3A5F] transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Total Customers</span>
            <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#2C2A29]">
              {loading ? "..." : stats.total_customers}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">Verified consumer accounts</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-5 flex flex-col justify-between hover:border-[#1E3A5F] transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Total Orders</span>
            <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#2C2A29]">
              {loading ? "..." : stats.total_orders}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">All time processed</p>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-5 flex flex-col justify-between hover:border-[#1E3A5F] transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Total Sales</span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#2C2A29] font-mono">
              {loading ? "..." : `$${(stats.total_sales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Gross revenue</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#DDD6C8] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#2C2A29] tracking-tight">Recent Orders</h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Latest transactions and delivery fulfillment statuses
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#1E3A5F] hover:text-[#152843] transition flex items-center gap-1"
          >
            View All Orders ({stats.total_orders}) →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 space-y-2">
            <div className="w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading recent orders...</p>
          </div>
        ) : !stats.recent_orders || stats.recent_orders.length === 0 ? (
          <div className="py-12 text-center text-stone-500 space-y-2">
            <p className="text-sm font-semibold text-[#2C2A29]">No orders placed yet</p>
            <p className="text-xs text-stone-500">
              When customers complete purchases, transactions will be summarized here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2C2A29]">
              <thead className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-[#DDD6C8]">
                <tr>
                  <th className="pb-3 px-3">Order</th>
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Items</th>
                  <th className="pb-3 px-3">Total</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C8] text-xs">
                {stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFFFFF] transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#2C2A29]">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#2C2A29]">{order.customer_name}</div>
                      <div className="text-[11px] text-stone-500">{order.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-3 text-stone-600">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-stone-600">
                      {order.items_count} item{order.items_count === 1 ? "" : "s"}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#2C2A29] font-mono">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-semibold text-[#1E3A5F] hover:text-[#152843] transition"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
