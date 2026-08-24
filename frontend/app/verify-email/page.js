"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();

  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [message, setMessage] = useState(token ? "" : "No verification token provided in the URL.");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      showToast("No verification token found in URL.", "error");
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    async function verify() {
      try {
        const res = await api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus("success");
        const msg = res.message || "Email verified successfully!";
        setMessage(msg);
        showToast(msg, "success");

        // Broadcast to other open tabs (e.g. Login tab)
        try {
          localStorage.setItem("email_verified", Date.now().toString());
        } catch {
          // ignore storage error if any
        }
      } catch (err) {
        setStatus("error");
        const msg = err.message || "Email verification failed or link expired.";
        setMessage(msg);
        showToast(msg, "error");
      }
    }

    verify();
  }, [token, showToast]);

  return (
    <div className="max-w-md mx-auto my-12 p-8 sm:p-10 bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl shadow-xs text-center">
      {status === "verifying" && (
        <div className="space-y-4 py-4">
          <div className="w-10 h-10 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <h2 className="text-xl font-bold text-[#2C2A29]">Verifying your email...</h2>
          <p className="text-stone-600 text-xs">Please wait while we validate your token.</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-emerald-800">Email Verified</h2>
          <p className="text-stone-700 text-sm leading-relaxed">{message}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block bg-[#1E3A5F] hover:bg-[#152843] text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-xs"
            >
              Log In Now
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto text-xl font-bold">
            ✕
          </div>
          <h2 className="text-2xl font-bold text-red-800">Verification Failed</h2>
          <p className="text-stone-700 text-sm leading-relaxed">{message}</p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-block bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] font-semibold px-5 py-2.5 rounded-xl transition border border-[#D8D4CE] text-xs shadow-xs"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-stone-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
