"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      setShowConfirmModal(false);
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

  const handleFormSubmit = (e) => {
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

    // Open confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmedProfileUpdate = async () => {
    setShowConfirmModal(false);
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
        <DialogContent className="max-w-lg w-[95vw] p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between text-left">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>✏️</span> Edit Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Update your account name and personal details below.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white text-sm p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} noValidate className="space-y-4 pt-2">
            {/* First Name */}
            <div>
              <label
                htmlFor="modal_first_name"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                id="modal_first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={() => handleBlur("first_name")}
                placeholder="First Name"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                  touched.first_name && errors.first_name
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.first_name && !errors.first_name && formData.first_name
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              <div className="h-4 mt-1 text-xs text-red-400 font-medium">
                {touched.first_name && errors.first_name ? errors.first_name : ""}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="modal_last_name"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                id="modal_last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={() => handleBlur("last_name")}
                placeholder="Last Name"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                  touched.last_name && errors.last_name
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.last_name && !errors.last_name && formData.last_name
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              <div className="h-4 mt-1 text-xs text-red-400 font-medium">
                {touched.last_name && errors.last_name ? errors.last_name : ""}
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed select-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Email address cannot be modified as it is tied to your login identity.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !hasChanges}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Confirm Profile Changes"
        message="Are you sure you want to update your profile information?"
        actionType="save"
        onConfirm={handleConfirmedProfileUpdate}
      />
    </>
  );
}
