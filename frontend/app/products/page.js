"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-3">
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium">Redirecting to home catalog...</p>
    </div>
  );
}
