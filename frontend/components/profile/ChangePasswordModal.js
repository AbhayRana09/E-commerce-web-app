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
import { PasswordToggleButton } from "@/components/ui/EyeIcons";
import { useToast } from "@/context/ToastContext";
import { validatePassword, validateConfirmPassword } from "@/lib/validation";
import api from "@/lib/api";

export default function ChangePasswordModal({ open, onOpenChange }) {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [touched, setTouched] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClose = () => {
    setFormData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setTouched({
      old_password: false,
      new_password: false,
      confirm_password: false,
    });
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowConfirmModal(false);
    onOpenChange(false);
  };

  const isSamePassword =
    Boolean(formData.old_password && formData.new_password && formData.old_password === formData.new_password);

  const errors = {
    old_password: !formData.old_password ? "Current password is required." : "",
    new_password: !formData.new_password
      ? "New password is required."
      : isSamePassword
      ? "New password cannot be the same as your current password."
      : validatePassword(formData.new_password),
    confirm_password: !formData.confirm_password
      ? "Confirm password is required."
      : validateConfirmPassword(
          formData.confirm_password,
          formData.new_password
        ),
  };

  const isFormValid =
    !errors.old_password && !errors.new_password && !errors.confirm_password;

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
    setTouched({
      old_password: true,
      new_password: true,
      confirm_password: true,
    });

    if (formData.old_password && formData.new_password && formData.old_password === formData.new_password) {
      showToast("New password cannot be the same as your current password.", "error");
      return;
    }

    if (!isFormValid) {
      showToast("Please fill in all required fields and satisfy password requirements.", "error");
      return;
    }

    // Trigger confirmation dialog
    setShowConfirmModal(true);
  };

  const handleConfirmedPasswordChange = async () => {
    setShowConfirmModal(false);
    try {
      setLoading(true);
      await api.post("/api/auth/change-password", {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });

      showToast("Password changed successfully!", "success");
      handleClose();
    } catch (err) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else onOpenChange(true); }}>
        <DialogContent className="max-w-lg w-[95vw] p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between text-left">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>🔑</span> Change Password
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Enter your current password and choose a secure new one.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-white text-sm p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} noValidate className="space-y-4 pt-2">
            {/* Current Password */}
            <div>
              <label
                htmlFor="modal_current_password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Current Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="modal_current_password"
                  type={showOldPassword ? "text" : "password"}
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("old_password")}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 pr-14 text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                    touched.old_password && errors.old_password
                      ? "border-red-500 focus:border-red-500 bg-red-950/10"
                      : touched.old_password && !errors.old_password && formData.old_password
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                <PasswordToggleButton
                  show={showOldPassword}
                  onToggle={() => setShowOldPassword((prev) => !prev)}
                  ariaLabel={showOldPassword ? "Hide current password" : "Show current password"}
                />
              </div>
              <div className="h-4 mt-1 text-xs text-red-400 font-medium">
                {touched.old_password && errors.old_password ? errors.old_password : ""}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="modal_new_password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="modal_new_password"
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("new_password")}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 pr-14 text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                    touched.new_password && errors.new_password
                      ? "border-red-500 focus:border-red-500 bg-red-950/10"
                      : touched.new_password && !errors.new_password && formData.new_password
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                <PasswordToggleButton
                  show={showNewPassword}
                  onToggle={() => setShowNewPassword((prev) => !prev)}
                  ariaLabel={showNewPassword ? "Hide new password" : "Show new password"}
                />
              </div>
              <div className="h-4 mt-1 text-xs text-red-400 font-medium">
                {touched.new_password && errors.new_password ? errors.new_password : ""}
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="modal_confirm_password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Confirm New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="modal_confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirm_password")}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 pr-14 text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                    touched.confirm_password && errors.confirm_password
                      ? "border-red-500 focus:border-red-500 bg-red-950/10"
                      : touched.confirm_password && !errors.confirm_password && formData.confirm_password
                      ? "border-emerald-500/80 focus:border-emerald-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                <PasswordToggleButton
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  ariaLabel={showConfirmPassword ? "Hide confirm new password" : "Show confirm new password"}
                />
              </div>
              <div className="h-4 mt-1 text-xs text-red-400 font-medium">
                {touched.confirm_password && errors.confirm_password
                  ? errors.confirm_password
                  : ""}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will need to use your new password next time you log in."
        actionType="save"
        onConfirm={handleConfirmedPasswordChange}
      />
    </>
  );
}
