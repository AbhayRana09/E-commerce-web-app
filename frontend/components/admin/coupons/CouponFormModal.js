"use client";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl sm:max-w-3xl w-[95vw] shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4 text-xs sm:text-sm">
          {/* Code */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Coupon Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SUMMER25"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                setTouched((prev) => ({ ...prev, code: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white font-mono uppercase focus:outline-none transition ${
                touched.code && errors.code
                  ? "border-red-500/80 focus:border-red-500 ring-1 ring-red-500/30"
                  : "border-slate-800 focus:border-indigo-500"
              }`}
            />
            {touched.code && errors.code && (
              <p className="text-xs text-red-400 mt-1">{errors.code}</p>
            )}
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Discount Type <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Discount Value <span className="text-red-400">*</span> ({formData.discount_type === "PERCENTAGE" ? "%" : "$"})
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
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none transition ${
                  touched.discount_value && errors.discount_value
                    ? "border-red-500/80 focus:border-red-500 ring-1 ring-red-500/30"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              {touched.discount_value && errors.discount_value && (
                <p className="text-xs text-red-400 mt-1">{errors.discount_value}</p>
              )}
            </div>
          </div>

          {/* Min Order Subtotal */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Min Order Subtotal ($)</label>
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
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none transition ${
                touched.min_order_amount && errors.min_order_amount
                  ? "border-red-500/80 focus:border-red-500 ring-1 ring-red-500/30"
                  : "border-slate-800 focus:border-indigo-500"
              }`}
            />
            {touched.min_order_amount && errors.min_order_amount && (
              <p className="text-xs text-red-400 mt-1">{errors.min_order_amount}</p>
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
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. 10% discount on orders above $50"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {submitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
