"use client";

import { Eye, EyeOff } from "lucide-react";

export function EyeIcon({ className = "w-4 h-4" }) {
  return <Eye className={className} />;
}

export function EyeOffIcon({ className = "w-4 h-4" }) {
  return <EyeOff className={className} />;
}

export function PasswordToggleButton({ show, onToggle, ariaLabel = "Toggle password visibility" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      title={show ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#2C2A29] transition-colors p-1.5 rounded-lg hover:bg-[#ECE8DF] cursor-pointer flex items-center justify-center select-none"
    >
      {show ? <EyeOff className="w-4 h-4 text-[#2C2A29]" /> : <Eye className="w-4 h-4 text-stone-400" />}
    </button>
  );
}
