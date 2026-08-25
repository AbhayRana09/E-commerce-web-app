"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { validateFirstName, validateLastName } from "@/lib/validation";
import api from "@/lib/api";

export default function EditProfileModal({ open, onOpenChange }) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
  });

  const [touched, setTouched] = useState({
    first_name: false,
    last_name: false,
  });

  const [loading, setLoading] = useState(false);

  // Adjust state during render when modal opens (official React pattern)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
      setTouched({
        first_name: false,
        last_name: false,
      });
    }
  }

  const errors = {
    first_name: validateFirstName(formData.first_name),
    last_name: validateLastName(formData.last_name),
  };

  const isFormValid = !errors.first_name && !errors.last_name;
  const hasChanges =
    user &&
    (formData.first_name.trim() !== (user.first_name || "") ||
      formData.last_name.trim() !== (user.last_name || ""));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setTouched({ first_name: true, last_name: true });

    if (!isFormValid) {
      showToast("Please correct the highlighted fields.", "error");
      return;
    }

    if (!hasChanges) {
      onOpenChange(false);
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await api.put("/api/auth/profile", {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      });

      updateUser(updatedUser);
      showToast("Profile information updated successfully!", "success");
      onOpenChange(false);
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg w-[95vw] p-6 sm:p-8 bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-[#DDD6C8] pb-4 flex flex-row items-center justify-between text-left">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-[#2C2A29] tracking-tight flex items-center gap-2">
                <span>✏️</span> Edit Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600 mt-0.5">
                Update your account name and personal details below.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-stone-400 hover:text-[#2C2A29] text-sm p-1.5 rounded-full hover:bg-[#ECE8DF] transition cursor-pointer"
            >
              ✕
            </button>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} noValidate className="space-y-4 pt-2">
            {/* First Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="modal_first_name"
                  className="block text-xs font-semibold text-stone-700 uppercase tracking-wider"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    formData.first_name.length >= 30
                      ? "text-red-600 font-bold"
                      : formData.first_name.length >= 25
                      ? "text-amber-600"
                      : "text-stone-400"
                  }`}
                >
                  {formData.first_name.length}/30
                </span>
              </div>
              <input
                id="modal_first_name"
                type="text"
                maxLength={30}
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={() => handleBlur("first_name")}
                placeholder="e.g. Alex"
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] text-sm placeholder-stone-400 focus:outline-none transition shadow-xs ${
                  touched.first_name && errors.first_name
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : touched.first_name && !errors.first_name && formData.first_name
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-red-500 font-medium">
                  {touched.first_name && errors.first_name ? errors.first_name : ""}
                </span>
                <span className="text-[11px] text-stone-400">Max 30 characters</span>
              </div>
            </div>

            {/* Last Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="modal_last_name"
                  className="block text-xs font-semibold text-stone-700 uppercase tracking-wider"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    formData.last_name.length >= 30
                      ? "text-red-600 font-bold"
                      : formData.last_name.length >= 25
                      ? "text-amber-600"
                      : "text-stone-400"
                  }`}
                >
                  {formData.last_name.length}/30
                </span>
              </div>
              <input
                id="modal_last_name"
                type="text"
                maxLength={30}
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={() => handleBlur("last_name")}
                placeholder="e.g. Morgan"
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] text-sm placeholder-stone-400 focus:outline-none transition shadow-xs ${
                  touched.last_name && errors.last_name
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : touched.last_name && !errors.last_name && formData.last_name
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-red-500 font-medium">
                  {touched.last_name && errors.last_name ? errors.last_name : ""}
                </span>
                <span className="text-[11px] text-stone-400">Max 30 characters</span>
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-[#ECE8DF]/60 border border-[#DDD6C8] rounded-xl px-4 py-2.5 text-stone-500 text-sm cursor-not-allowed select-none"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Email address cannot be modified as it is tied to your login identity.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#DDD6C8] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer border border-[#D8D4CE] shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !hasChanges}
                className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-40 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
