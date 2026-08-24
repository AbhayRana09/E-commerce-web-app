"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    let cleanMessage = "An alert occurred";
    if (typeof message === "string") {
      cleanMessage = message;
    } else if (message instanceof Error) {
      cleanMessage = message.message;
    } else if (Array.isArray(message)) {
      cleanMessage = message
        .map((item) => (typeof item === "object" ? item?.msg || item?.message || JSON.stringify(item) : String(item)))
        .join(" | ");
    } else if (message && typeof message === "object") {
      cleanMessage = message.message || message.msg || message.detail || JSON.stringify(message);
    } else if (message != null) {
      cleanMessage = String(message);
    }

    const id = Date.now() + Math.random();

    setToasts((prev) => {
      // 1. Deduplication: Prevent identical active toasts from stacking up
      if (prev.some((t) => t.message === cleanMessage && t.type === type)) {
        return prev;
      }
      // 2. Max 3 Toasts limit (keep last 2 + new one)
      const capped = prev.length >= 3 ? prev.slice(-2) : prev;
      return [...capped, { id, message: cleanMessage, type }];
    });

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Top-Right Toast Notification Container with dynamic content-fitting width */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col items-end gap-2.5 max-w-[92vw] sm:max-w-md pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-fit max-w-full inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-top-3 min-w-0 ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-300 text-rose-950 shadow-rose-950/10"
                : toast.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-950/10"
                : "bg-sky-50 border-sky-300 text-sky-950 shadow-sky-950/10"
            }`}
          >
            {/* Type Icon */}
            <div className="shrink-0">
              {toast.type === "error" ? (
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              ) : toast.type === "success" ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-sky-100 text-[#1E3A5F] flex items-center justify-center border border-sky-300">
                  <Info className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="text-xs sm:text-sm font-semibold leading-snug break-words [overflow-wrap:anywhere]">
              {toast.message}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className={`p-0.5 ml-1 rounded-lg transition cursor-pointer shrink-0 ${
                toast.type === "error"
                  ? "text-rose-600 hover:text-rose-950 hover:bg-rose-100"
                  : toast.type === "success"
                  ? "text-emerald-600 hover:text-emerald-950 hover:bg-emerald-100"
                  : "text-sky-600 hover:text-sky-950 hover:bg-sky-100"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
