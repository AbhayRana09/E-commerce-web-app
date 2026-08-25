"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import CalendarDatePicker from "@/components/ui/CalendarDatePicker";

export default function CouponFormModal({
  open,
  editingCoupon,
  formData,
  setFormData,
  touched,
  setTouched,
  errors,
  submitting,
  onSubmit,
  onClose,
  getTodayISO,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-2xl sm:max-w-3xl w-[95vw] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden cursor-default"
      >
        <div className="flex items-center justify-between border-b border-[#DDD6C8] px-6 sm:px-8 py-5 shrink-0 bg-[#F7F5F0]">
          <h2 className="text-lg sm:text-xl font-bold text-[#2C2A29]">
            {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-[#2C2A29] transition p-1.5 rounded-xl hover:bg-[#ECE8DF] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs sm:text-sm">
          <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-4">
          {/* Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-stone-700 font-semibold">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  (formData.code || "").length >= 20
                    ? "text-red-600 font-bold"
                    : (formData.code || "").length >= 15
                    ? "text-amber-600"
                    : "text-stone-400"
                }`}
              >
                {(formData.code || "").length}/20
              </span>
            </div>
            <input
              type="text"
              maxLength={20}
              placeholder="e.g. SUMMER25"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                setTouched((prev) => ({ ...prev, code: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
              className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] font-mono uppercase focus:outline-none transition shadow-xs ${
                touched.code && errors.code
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : "border-[#D8D4CE] focus:border-[#1E3A5F]"
              }`}
            />
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-red-500 font-medium">
                {touched.code && errors.code ? errors.code : ""}
              </span>
              <span className="text-[11px] text-stone-400">Max 20 characters</span>
            </div>
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-4 py-2.5 text-[#2C2A29] focus:outline-none focus:border-[#1E3A5F] cursor-pointer shadow-xs"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Discount Value <span className="text-red-500">*</span> ({formData.discount_type === "PERCENTAGE" ? "%" : "$"})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={formData.discount_type === "PERCENTAGE" ? "10" : "20.00"}
                value={formData.discount_value}
                onChange={(e) => {
                  setFormData({ ...formData, discount_value: e.target.value });
                  setTouched((prev) => ({ ...prev, discount_value: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, discount_value: true }))}
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] font-mono focus:outline-none transition shadow-xs ${
                  touched.discount_value && errors.discount_value
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              />
              {touched.discount_value && errors.discount_value && (
                <p className="text-xs text-red-500 mt-1">{errors.discount_value}</p>
              )}
            </div>
          </div>

          {/* Min Order Subtotal */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Min Order Subtotal ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.min_order_amount}
              onChange={(e) => {
                setFormData({ ...formData, min_order_amount: e.target.value });
                setTouched((prev) => ({ ...prev, min_order_amount: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, min_order_amount: true }))}
              className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] font-mono focus:outline-none transition shadow-xs ${
                touched.min_order_amount && errors.min_order_amount
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : "border-[#D8D4CE] focus:border-[#1E3A5F]"
              }`}
            />
            {touched.min_order_amount && errors.min_order_amount && (
              <p className="text-xs text-red-500 mt-1">{errors.min_order_amount}</p>
            )}
          </div>

          {/* Start Date & Expiry Date (Interactive Calendar Dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalendarDatePicker
              label="Start Date"
              required={true}
              value={formData.starts_at}
              onChange={(dateStr) => {
                setFormData((prev) => ({
                  ...prev,
                  starts_at: dateStr,
                  // If expiry date is before new start date, reset expiry
                  expires_at: prev.expires_at && prev.expires_at < dateStr ? "" : prev.expires_at,
                }));
                setTouched((prev) => ({ ...prev, starts_at: true }));
              }}
              error={touched.starts_at ? errors.starts_at : null}
              placeholder="Select start date"
            />

            <CalendarDatePicker
              label="Expiry Date"
              required={true}
              value={formData.expires_at}
              minDate={formData.starts_at || (getTodayISO ? getTodayISO() : "")}
              onChange={(dateStr) => {
                setFormData((prev) => ({ ...prev, expires_at: dateStr }));
                setTouched((prev) => ({ ...prev, expires_at: true }));
              }}
              error={touched.expires_at ? errors.expires_at : null}
              placeholder="Select expiry date"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. 10% discount on orders above $50"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-4 py-2.5 text-[#2C2A29] placeholder-stone-400 focus:outline-none focus:border-[#1E3A5F] shadow-xs"
            />
          </div>

          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-[#DDD6C8] shrink-0 bg-[#F7F5F0]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer border border-[#D8D4CE] shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              {submitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
