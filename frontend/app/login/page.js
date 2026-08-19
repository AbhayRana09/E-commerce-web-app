"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import {
  validateEmail,
  validatePasswordPresence,
  autoFocusFirstError,
} from "@/lib/validation";

import RouteGuard from "@/components/RouteGuard";
import { PasswordToggleButton } from "@/components/ui/EyeIcons";

function LoginContent() {

  const { login } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resending, setResending] = useState(false);


  // Ref-based submission lock for double-submit prevention
  const isSubmittingRef = useRef(false);

  // Field refs for auto-focus on error
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const fieldRefs = {
    email: emailRef,
    password: passwordRef,
  };

  // Real-time error calculations
  const errors = {
    email: validateEmail(formData.email),
    password: validatePasswordPresence(formData.password),
  };

  const isFormValid = !errors.email && !errors.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };


  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Handle Login attempt
  const executeLogin = useCallback(
    async (emailToUse, passwordToUse) => {
      const email = (emailToUse || formData.email).trim().toLowerCase();
      const password = passwordToUse || formData.password;

      try {
        const loggedInUser = await login(email, password);
        showToast("Logged in successfully!", "success");
        if (loggedInUser?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        return true;
      } catch (err) {
        const msg = err.message || "Login failed. Please check your credentials.";
        showToast(msg, "error");
        if (msg.toLowerCase().includes("verify your email") || msg.toLowerCase().includes("unverified")) {
          setIsUnverified(true);
        }
        return false;
      }
    },
    [formData.email, formData.password, login, router, showToast]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    setTouched({ email: true, password: true });

    if (!isFormValid) {
      const domRefs = {
        email: fieldRefs.email.current,
        password: fieldRefs.password.current,
      };
      autoFocusFirstError(errors, domRefs);
      return;
    }


    isSubmittingRef.current = true;
    setLoading(true);
    setIsUnverified(false);

    try {
      await executeLogin(formData.email, formData.password);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResendVerification = async () => {
    const email = formData.email.trim().toLowerCase();
    if (!email || errors.email) {
      showToast("Please enter a valid email address first.", "error");
      fieldRefs.email.current?.focus();
      return;
    }
    setResending(true);
    try {
      const res = await api.post("/api/auth/resend-verification", { email });
      showToast(res.message || "Verification link sent to your email.", "success");
    } catch (err) {
      showToast(err.message || "Failed to resend verification email.", "error");
    } finally {
      setResending(false);
    }
  };

  // Cross-tab storage listener and live polling when unverified
  useEffect(() => {
    if (!isUnverified) return;

    // 1. Cross-tab synchronization via localStorage events
    const handleStorage = (event) => {
      if (event.key === "email_verified" || event.key === "token") {
        showToast("Email verification detected in another tab! Attempting login...", "success");
        setIsUnverified(false);
        if (formData.password) {
          executeLogin();
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    // 2. Periodic live polling to check if user verified in another browser/device
    const interval = setInterval(async () => {
      if (!formData.email || errors.email) return;
      try {
        // Test resend endpoint: if user is already verified, backend returns 200 with "already verified" message
        const res = await api.post("/api/auth/resend-verification", {
          email: formData.email.trim().toLowerCase(),
        });
        if (res.message && res.message.toLowerCase().includes("already verified")) {
          clearInterval(interval);
          setIsUnverified(false);
          showToast("Account verified! Logging you in...", "success");
          if (formData.password) {
            executeLogin();
          }
        }
      } catch {
        // Keep polling silently
      }
    }, 4000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [isUnverified, formData.email, formData.password, errors.email, executeLogin, showToast]);


  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Log In</h1>
        <p className="text-slate-400 text-sm">
          Enter your email and password to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {/* Email Address */}
        <div>
          <label
            htmlFor="login_email"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            id="login_email"
            ref={emailRef}
            type="email"
            name="email"
            suppressHydrationWarning
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
            placeholder="Email Address"
            autoComplete="email"
            className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition ${touched.email && errors.email
                ? "border-red-500 focus:border-red-500 bg-red-950/10"
                : touched.email && !errors.email && formData.email
                  ? "border-emerald-500/80 focus:border-emerald-500"
                  : "border-slate-800 focus:border-indigo-500"
              }`}
          />
          <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
            {touched.email && errors.email ? errors.email : "\u00A0"}
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login_password"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="login_password"
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              name="password"
              suppressHydrationWarning
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              placeholder="Password"
              autoComplete="current-password"
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition pr-16 ${touched.password && errors.password
                  ? "border-red-500 focus:border-red-500 bg-red-950/10"
                  : "border-slate-800 focus:border-indigo-500"
                }`}
            />

            <PasswordToggleButton
              show={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
              ariaLabel={showPassword ? "Hide password" : "Show password"}
            />
          </div>
          <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
            {touched.password && errors.password ? errors.password : "\u00A0"}
          </div>


          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer mt-2"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Simple Shadcn UI Dialog Modal for Unverified Accounts */}
      {isUnverified && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Verify Your Email
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Please check your inbox and verify your email address before logging in.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition text-xs cursor-pointer disabled:opacity-50"
              >
                {resending ? "Sending Email..." : "Resend Verification Email"}
              </button>

              <button
                type="button"
                onClick={() => setIsUnverified(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-xl transition text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      <div className="text-center mt-8 pt-6 border-t border-slate-800 text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <RouteGuard type="guest">
      <LoginContent />
    </RouteGuard>
  );
}


