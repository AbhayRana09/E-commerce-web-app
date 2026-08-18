"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-10 py-4">
      {/* Hero Banner Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-xl">
        <div className="max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            Welcome to E-Commerce Store
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Quality products for your everyday needs
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Browse our catalog across electronics, apparel, home goods, and accessories.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={user ? "/profile" : "/register"}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md transition"
            >
              {user ? "View Account" : "Get Started"}
            </Link>
            {!user && (
              <Link
                href="/login"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-5 py-2.5 rounded-xl transition border border-slate-700"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Featured Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Categories</h2>
            <p className="text-xs text-slate-400">Explore main departments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition group cursor-pointer shadow-md">
            <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
              Electronics
            </h3>
            <p className="text-xs text-slate-400 mt-1">Gadgets & Audio</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition group cursor-pointer shadow-md">
            <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
              Apparel
            </h3>
            <p className="text-xs text-slate-400 mt-1">Clothing & Wear</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition group cursor-pointer shadow-md">
            <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
              Home & Living
            </h3>
            <p className="text-xs text-slate-400 mt-1">Home Essentials</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition group cursor-pointer shadow-md">
            <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
              Accessories
            </h3>
            <p className="text-xs text-slate-400 mt-1">Bags, Watches & More</p>
          </div>
        </div>
      </div>
    </div>
  );
}



