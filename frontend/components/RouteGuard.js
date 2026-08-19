"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * RouteGuard Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {"private" | "guest" | "admin" | "customer"} props.type - "private" (requires auth), "guest" (requires logged-out status), "admin" (requires ADMIN role), or "customer" (redirects ADMIN to admin portal)
 * @param {string} props.adminRedirect - Custom redirect path for admin users on customer pages (default: "/admin")
 */
export default function RouteGuard({ children, type = "private", adminRedirect = "/admin" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (type === "private" && !user) {
      router.replace("/login");
    } else if (type === "guest" && user) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/");
    } else if (type === "admin") {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "ADMIN") {
        router.replace("/");
      }
    } else if (type === "customer") {
      if (user && user.role === "ADMIN") {
        router.replace(adminRedirect);
      }
    }
  }, [user, loading, router, type, adminRedirect]);

  // Show loading spinner while auth state is resolving
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Verifying session & permissions...</p>
      </div>
    );
  }

  // Prevent UI flash before redirect happens
  if (type === "private" && !user) {
    return null;
  }

  if (type === "guest" && user) {
    return null;
  }

  if (type === "admin" && (!user || user.role !== "ADMIN")) {
    return null;
  }

  if (type === "customer" && user?.role === "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
