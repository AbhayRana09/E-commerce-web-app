"use client";

import { useState, useEffect, useRef, Suspense } from "react";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import {
  validatePassword,
  validateConfirmPassword,
  autoFocusFirstError,
} from "@/lib/validation";
import RouteGuard from "@/components/RouteGuard";
import { PasswordToggleButton } from "@/components/ui/EyeIcons";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  // Ref lock for double-submits
  const isSubmittingRef = useRef(false);

  // Field refs for auto-focus
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const fieldRefs = {
    newPassword: newPasswordRef,
    confirmPassword: confirmPasswordRef,
  };

  // Real-time error calculations
  const errors = {
    newPassword: validatePassword(formData.newPassword),
    confirmPassword: validateConfirmPassword(
      formData.confirmPassword,
      formData.newPassword
    ),
  };

  const isFormValid = !errors.newPassword && !errors.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };


  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    setTouched({ newPassword: true, confirmPassword: true });

    if (!token) {
      showToast("Missing password reset token in URL.", "error");
      return;
    }

    if (!isFormValid) {
      const domRefs = {
        newPassword: fieldRefs.newPassword.current,
        confirmPassword: fieldRefs.confirmPassword.current,
      };
      autoFocusFirstError(errors, domRefs);
      return;
    }


    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const res = await api.post("/api/auth/reset-password", {
        token,
        new_password: formData.newPassword,
      });
      showToast(res.message || "Password reset successfully!", "success");
      setResetCompleted(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      showToast(err.message || "Failed to reset password. The link may be expired.", "error");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Missing token gate
  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 sm:p-10 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Invalid Reset Link</h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          No password reset token was detected in your request URL. Please request a new password reset link.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // Password requirements checklist
  const pwd = formData.newPassword;
  const pwdChecks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Reset Password
        </h1>
        <p className="text-slate-400 text-sm">
          Enter and confirm your new secure password.
        </p>
      </div>


      {resetCompleted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-white">Password Updated</h2>
          <p className="text-slate-300 text-sm">
            Your password has been successfully reset. Redirecting to login...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* New Password */}
          <div>
            <label
              htmlFor="new_password"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="new_password"
                ref={newPasswordRef}
                type={showPassword ? "text" : "password"}
                name="newPassword"
                suppressHydrationWarning
                value={formData.newPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("newPassword")}
                placeholder="New Password"
                autoComplete="new-password"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition pr-16 ${
                  touched.newPassword && errors.newPassword
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.newPassword && !errors.newPassword && formData.newPassword
                    ? "border-emerald-500/80 focus:border-emerald-500"
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
              {touched.newPassword && errors.newPassword ? errors.newPassword : "\u00A0"}
            </div>
          </div>


          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm_new_password"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Confirm New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm_new_password"
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                suppressHydrationWarning
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Confirm New Password"
                autoComplete="new-password"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition pr-16 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />

              <PasswordToggleButton
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
                ariaLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              />
            </div>
            <div className="h-5 mt-1 text-xs font-medium leading-5">
              {touched.confirmPassword && errors.confirmPassword ? (
                <span className="text-red-400 block">{errors.confirmPassword}</span>
              ) : formData.confirmPassword && !errors.confirmPassword ? (
                <span className="text-emerald-400 block">✓ Passwords match</span>
              ) : (
                "\u00A0"
              )}
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer mt-2"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <div className="text-center mt-8 pt-6 border-t border-slate-800 text-sm text-slate-400">
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

export default function ResetPasswordPage() {
  return (
    <RouteGuard type="guest">
      <Suspense fallback={<div className="text-center py-16 text-slate-400">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </RouteGuard>
  );
}

