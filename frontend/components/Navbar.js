"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900/90 text-white border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-300 transition">
          E-Commerce Store
        </Link>


        {/* Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-slate-300 hover:text-white text-sm font-medium transition px-3 py-1.5 rounded-xl hover:bg-slate-800/60"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-slate-300 hover:text-white text-sm font-medium transition px-3 py-1.5 rounded-xl hover:bg-slate-800/60"
          >
            Products
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="text-slate-200 hover:text-white transition flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full hover:border-indigo-500/50"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  {user.first_name?.[0] || "U"}
                </span>
                <span className="text-sm font-medium">Hi, {user.first_name}</span>
              </Link>
              <button
                onClick={logout}
                className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white text-sm font-medium px-3.5 py-1.5 transition rounded-xl hover:bg-slate-800/60"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


