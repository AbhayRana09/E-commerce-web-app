"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import {
  validateEmail,
  autoFocusFirstError,
} from "@/lib/validation";

import RouteGuard from "@/components/RouteGuard";

function ForgotPasswordContent() {

  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Ref-based submission lock
  const isSubmittingRef = useRef(false);
  const emailRef = useRef(null);

  const emailError = validateEmail(email);
  const isFormValid = !emailError;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    setTouched(true);

    if (!isFormValid) {
      autoFocusFirstError({ email: emailError }, { email: emailRef.current });
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await api.post("/api/auth/forgot-password", { email: cleanEmail });
      showToast(
        res.message || "If an account exists, a reset link has been sent.",
        "success"
      );
      setSubmitted(true);
    } catch (err) {
      showToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Forgot Password
        </h1>
        <p className="text-slate-400 text-sm">
          Enter your email address to receive password reset instructions.
        </p>
      </div>


      <form onSubmit={handleSubmit} noValidate className="space-y-4">

          <div>
            <label
              htmlFor="forgot_email"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="forgot_email"
              ref={emailRef}
              type="email"
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Email Address"
              autoComplete="email"
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                touched && emailError
                  ? "border-red-500 focus:border-red-500 bg-red-950/10"
                  : touched && !emailError && email
                  ? "border-emerald-500/80 focus:border-emerald-500"
                  : "border-slate-800 focus:border-indigo-500"
              }`}
            />

            <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
              {touched && emailError ? emailError : "\u00A0"}
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer mt-2"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>


      {/* Minimal Shadcn UI Style Dialog Modal for Password Reset Link Sent */}
      {submitted && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Reset Link Sent
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account matches <strong className="text-white font-medium">{email.trim().toLowerCase()}</strong>, a password reset link has been sent to your inbox.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/login"
                className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition text-xs"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-8 pt-6 border-t border-slate-800 text-sm text-slate-400">

        Remembered your password?{" "}
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <RouteGuard type="guest">
      <ForgotPasswordContent />
    </RouteGuard>
  );
}


