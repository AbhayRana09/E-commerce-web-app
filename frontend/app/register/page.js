"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  autoFocusFirstError,
} from "@/lib/validation";

import RouteGuard from "@/components/RouteGuard";

function RegisterContent() {

  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    first_name: false,
    last_name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Submission lock ref to prevent double-submits
  const isSubmittingRef = useRef(false);

  // Field DOM refs for auto-focus on error
  const fieldRefs = {
    first_name: useRef(null),
    last_name: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  // Real-time error calculations
  const errors = {
    first_name: validateFirstName(formData.first_name),
    last_name: validateLastName(formData.last_name),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
  };

  const isFormValid =
    !errors.first_name &&
    !errors.last_name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  // Cross-Field Dependency Revalidation:
  // When password changes and confirmPassword is touched, confirmPassword error is reactively re-evaluated via errors object above.

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

    // Prevent duplicate concurrent requests
    if (isSubmittingRef.current) return;

    // Mark all fields as touched
    const allTouched = {
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    if (!isFormValid) {
      const domRefs = {
        first_name: fieldRefs.first_name.current,
        last_name: fieldRefs.last_name.current,
        email: fieldRefs.email.current,
        password: fieldRefs.password.current,
        confirmPassword: fieldRefs.confirmPassword.current,
      };
      autoFocusFirstError(errors, domRefs);
      return;
    }


    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const res = await register(payload);
      const msg =
        res.message ||
        "Registration successful! Please check your email to verify your account.";
      showToast(msg, "success");
      setRegisteredSuccess(true);
    } catch (err) {
      showToast(err.message || "Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (

    <div className="max-w-2xl mx-auto my-4 sm:my-8 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Register</h1>
        <p className="text-slate-400 text-sm">
          Create your account with secure credential validation.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-2 text-sm">

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                id="first_name"
                ref={fieldRefs.first_name}
                type="text"
                name="first_name"
                suppressHydrationWarning
                value={formData.first_name}
                onChange={handleChange}
                onBlur={() => handleBlur("first_name")}
                placeholder="First Name"
                autoComplete="given-name"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition ${touched.first_name && errors.first_name
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.first_name && !errors.first_name && formData.first_name
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
              />
              <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
                {touched.first_name && errors.first_name ? errors.first_name : "\u00A0"}
              </div>
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                id="last_name"
                ref={fieldRefs.last_name}
                type="text"
                name="last_name"
                suppressHydrationWarning
                value={formData.last_name}
                onChange={handleChange}
                onBlur={() => handleBlur("last_name")}
                placeholder="Last Name"
                autoComplete="family-name"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition ${touched.last_name && errors.last_name
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.last_name && !errors.last_name && formData.last_name
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
              />
              <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
                {touched.last_name && errors.last_name ? errors.last_name : "\u00A0"}
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              ref={fieldRefs.email}
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

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  ref={fieldRefs.password}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  suppressHydrationWarning
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  placeholder="Password"
                  autoComplete="new-password"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition pr-16 ${touched.password && errors.password
                      ? "border-red-500 focus:border-red-500 bg-red-950/10"
                      : touched.password && !errors.password && formData.password
                        ? "border-emerald-500/80 focus:border-emerald-500"
                        : "border-slate-800 focus:border-indigo-500"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-2 py-1 cursor-pointer select-none font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
                {touched.password && errors.password ? errors.password : "\u00A0"}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  ref={fieldRefs.confirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  suppressHydrationWarning
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition pr-16 ${touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 bg-red-950/10"
                      : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                        ? "border-emerald-500/80 focus:border-emerald-500"
                        : "border-slate-800 focus:border-indigo-500"
                    }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-2 py-1 cursor-pointer select-none font-medium"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
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
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

      {/* Simple Shadcn UI Dialog Modal for Registration Verification Link */}
      {registeredSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Verification Email Sent
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A verification link has been sent to{" "}
                <strong className="text-white font-medium">{formData.email.trim().toLowerCase()}</strong>. Please check your inbox.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition text-xs"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      )}


      <div className="text-center mt-8 pt-6 border-t border-slate-800 text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
          Log In
        </Link>
      </div>
    </div>
  );
}


export default function RegisterPage() {
  return (
    <RouteGuard type="guest">
      <RegisterContent />
    </RouteGuard>
  );
}


