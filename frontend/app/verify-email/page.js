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
    <div className="max-w-md mx-auto my-12 p-8 sm:p-10 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl text-center">
      {status === "verifying" && (
        <div className="space-y-4 py-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
          <p className="text-slate-400 text-xs">Please wait while we validate your token.</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-emerald-300">Email Verified</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              Log In Now
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
            ✕
          </div>
          <h2 className="text-2xl font-bold text-red-300">Verification Failed</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl transition border border-slate-700 text-xs"
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
    <Suspense fallback={<div className="text-center py-16 text-slate-400">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
