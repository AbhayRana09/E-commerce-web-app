"use client";

import { useState, useRef } from "react";
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
import { PasswordToggleButton } from "@/components/ui/EyeIcons";

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
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const fieldRefs = {
    first_name: firstNameRef,
    last_name: lastNameRef,
    email: emailRef,
    password: passwordRef,
    confirmPassword: confirmPasswordRef,
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
    <div className="max-w-2xl mx-auto my-4 sm:my-8 p-6 sm:p-8 bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl shadow-xs">
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2A29] tracking-tight">Register</h1>
        <p className="text-stone-600 text-sm">
          Create your account with secure credential validation.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-2 text-sm">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="first_name"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="first_name"
              ref={firstNameRef}
              type="text"
              maxLength={30}
              name="first_name"
              suppressHydrationWarning
              value={formData.first_name}
              onChange={handleChange}
              onBlur={() => handleBlur("first_name")}
              placeholder="First Name"
              autoComplete="given-name"
              className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-3 text-[#2C2A29] text-sm placeholder-stone-400 focus:outline-none transition shadow-xs ${
                touched.first_name && errors.first_name
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : touched.first_name && !errors.first_name && formData.first_name
                  ? "border-emerald-500/80 focus:border-emerald-500"
                  : "border-[#D8D4CE] focus:border-[#1E3A5F]"
              }`}
            />
            <div className="h-5 mt-1 text-xs text-red-500 font-medium leading-5">
              {touched.first_name && errors.first_name ? errors.first_name : "\u00A0"}
            </div>
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="last_name"
              ref={lastNameRef}
              type="text"
              maxLength={30}
              name="last_name"
              suppressHydrationWarning
              value={formData.last_name}
              onChange={handleChange}
              onBlur={() => handleBlur("last_name")}
              placeholder="Last Name"
              autoComplete="family-name"
              className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-3 text-[#2C2A29] text-sm placeholder-stone-400 focus:outline-none transition shadow-xs ${
                touched.last_name && errors.last_name
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : touched.last_name && !errors.last_name && formData.last_name
                  ? "border-emerald-500/80 focus:border-emerald-500"
                  : "border-[#D8D4CE] focus:border-[#1E3A5F]"
              }`}
            />
            <div className="h-5 mt-1 text-xs text-red-500 font-medium leading-5">
              {touched.last_name && errors.last_name ? errors.last_name : "\u00A0"}
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            ref={emailRef}
            type="email"
            name="email"
            suppressHydrationWarning
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
            placeholder="Email Address"
            autoComplete="email"
            className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-3 text-[#2C2A29] text-sm placeholder-stone-400 focus:outline-none transition shadow-xs ${
              touched.email && errors.email
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : touched.email && !errors.email && formData.email
                ? "border-emerald-500/80 focus:border-emerald-500"
                : "border-[#D8D4CE] focus:border-[#1E3A5F]"
            }`}
          />
          <div className="h-5 mt-1 text-xs text-red-500 font-medium leading-5">
            {touched.email && errors.email ? errors.email : "\u00A0"}
          </div>
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                name="password"
                suppressHydrationWarning
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                placeholder="Password"
                autoComplete="new-password"
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-3 text-[#2C2A29] text-sm placeholder-stone-400 focus:outline-none transition pr-16 shadow-xs ${
                  touched.password && errors.password
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              />
              <PasswordToggleButton
                show={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
                ariaLabel={showPassword ? "Hide password" : "Show password"}
              />
            </div>
            <div className="h-5 mt-1 text-xs text-red-500 font-medium leading-5">
              {touched.password && errors.password ? errors.password : "\u00A0"}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                suppressHydrationWarning
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Confirm Password"
                autoComplete="new-password"
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-3 text-[#2C2A29] text-sm placeholder-stone-400 focus:outline-none transition pr-16 shadow-xs ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
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
                <span className="text-red-500 block">{errors.confirmPassword}</span>
              ) : formData.confirmPassword && !errors.confirmPassword ? (
                <span className="text-emerald-700 block">✓ Passwords match</span>
              ) : (
                "\u00A0"
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition shadow-xs cursor-pointer mt-2"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Simple Dialog Modal for Registration Verification Link */}
      {registeredSuccess && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#2C2A29] tracking-tight">
                Verification Email Sent
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                A verification link has been sent to{" "}
                <strong className="text-[#2C2A29] font-medium">{formData.email.trim().toLowerCase()}</strong>. Please check your inbox.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="block w-full bg-[#1E3A5F] hover:bg-[#152843] text-white font-medium py-2.5 rounded-xl transition text-xs shadow-xs"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-8 pt-6 border-t border-[#DDD6C8] text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="text-[#1E3A5F] hover:text-[#152843] font-semibold transition">
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
