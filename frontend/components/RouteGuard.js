"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * RouteGuard Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {"private" | "guest"} props.type - "private" (requires auth) or "guest" (requires logged-out status)
 */
export default function RouteGuard({ children, type = "private" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (type === "private" && !user) {
      router.replace("/login");
    } else if (type === "guest" && user) {
      router.replace("/profile");
    }
  }, [user, loading, router, type]);

  // Show loading spinner while auth state is resolving
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Verifying session...</p>
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

  return <>{children}</>;
}
