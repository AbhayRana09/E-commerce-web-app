"use client";

import { createContext, useContext, useState, useCallback } from "react";

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
    setToasts((prev) => [...prev, { id, message: cleanMessage, type }]);

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
      {/* Top-Right Toast Notification Container - Highest z-index to show above all modals */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-x-0 ${
              toast.type === "error"
                ? "bg-red-950/90 border-red-500/40 text-red-200"
                : toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : "bg-slate-900/90 border-slate-700/60 text-slate-200"
            }`}
          >
            <div className="text-sm font-medium leading-snug flex-1">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 transition cursor-pointer p-0.5"
            >
              ✕
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
