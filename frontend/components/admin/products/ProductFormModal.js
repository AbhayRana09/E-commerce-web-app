"use client";

import { useEffect } from "react";
import { X, ImagePlus } from "lucide-react";

export default function ProductFormModal({
  open,
  onClose,
  onOpenChange,
  editingProduct,
  formData,
  setFormData,
  touched,
  setTouched,
  categories = [],
  nameError,
  categoryError,
  priceError,
  stockError,
  descError,
  errors = {},
  imageInputMode,
  setImageInputMode,
  fileInputRef,
  handleFileChange,
  removeImage,
  submitting,
  onSubmit,
}) {
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const finalNameError = nameError || (touched?.name ? errors?.name : "");
  const finalCategoryError = categoryError || (touched?.category_id ? errors?.category_id : "");
  const finalPriceError = priceError || (touched?.price ? errors?.price : "");
  const finalStockError = stockError || (touched?.stock_quantity ? errors?.stock_quantity : "");
  const finalDescError = descError || (touched?.description ? errors?.description : "");

  const handleRemoveImage = removeImage || (() => {
    setFormData((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef?.current) fileInputRef.current.value = "";
  });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DDD6C8] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#2C2A29] tracking-tight flex items-center gap-2">
              <span>{editingProduct ? "✏️" : "📦"}</span>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              {editingProduct
                ? `Update pricing, stock, description, and image for "${editingProduct.name}".`
                : "Fill in product specifications to publish an item in your catalog."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-stone-400 hover:text-[#2C2A29] p-2 rounded-xl hover:bg-[#ECE8DF] transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {/* Product Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Product Name <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  (formData.name || "").length >= 120
                    ? "text-red-600 font-bold"
                    : (formData.name || "").length >= 100
                    ? "text-amber-600"
                    : "text-stone-400"
                }`}
              >
                {(formData.name || "").length}/120
              </span>
            </div>
            <input
              type="text"
              maxLength={120}
              value={formData.name || ""}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setTouched((prev) => ({ ...prev, name: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-sm text-[#2C2A29] placeholder-stone-400 focus:outline-none transition shadow-xs ${
                finalNameError
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : "border-[#D8D4CE] focus:border-[#1E3A5F]"
              }`}
            />
            {finalNameError && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {finalNameError}
              </p>
            )}
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id || ""}
                onChange={(e) => {
                  setFormData({ ...formData, category_id: e.target.value });
                  setTouched((prev) => ({ ...prev, category_id: true }));
                }}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, category_id: true }))
                }
                className={`w-full bg-[#FFFFFF] border rounded-xl px-3.5 py-2.5 text-sm text-[#2C2A29] focus:outline-none transition cursor-pointer shadow-xs ${
                  finalCategoryError
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              >
                <option value="" disabled>-- Select a category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {finalCategoryError && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {finalCategoryError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Price ($ USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price || ""}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  setTouched((prev) => ({ ...prev, price: true }));
                }}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, price: true }))
                }
                placeholder="99.99"
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-sm text-[#2C2A29] placeholder-stone-400 focus:outline-none transition shadow-xs ${
                  finalPriceError
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              />
              {finalPriceError && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {finalPriceError}
                </p>
              )}
            </div>
          </div>

          {/* Stock & Active Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity ?? ""}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    stock_quantity: e.target.value,
                  });
                  setTouched((prev) => ({ ...prev, stock_quantity: true }));
                }}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, stock_quantity: true }))
                }
                placeholder="50"
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-sm text-[#2C2A29] placeholder-stone-400 focus:outline-none transition shadow-xs ${
                  finalStockError
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              />
              {finalStockError && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {finalStockError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Store Visibility
              </label>
              <label className="flex items-center gap-2.5 mt-2 bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-4 py-2.5 cursor-pointer hover:border-stone-400 transition shadow-xs">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[#1E3A5F] rounded bg-[#FFFFFF] border-[#D8D4CE] focus:ring-[#1E3A5F] cursor-pointer"
                />
                <span className="text-xs text-[#2C2A29] font-medium select-none">
                  Publish to Store (Active)
                </span>
              </label>
            </div>
          </div>

          {/* Image Selector: File Picker + URL options */}
          <div className="space-y-3 p-4 bg-[#FFFFFF] rounded-2xl border border-[#D8D4CE] shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Product Image
              </label>
              {/* Mode switcher tab buttons */}
              <div className="flex items-center bg-[#ECE8DF] p-0.5 rounded-lg border border-[#DDD6C8] text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputMode("file")}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                    imageInputMode === "file"
                      ? "bg-[#1E3A5F] text-white shadow-xs"
                      : "text-stone-600 hover:text-[#2C2A29]"
                  }`}
                >
                  📁 File Picker
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                    imageInputMode === "url"
                      ? "bg-[#1E3A5F] text-white shadow-xs"
                      : "text-stone-600 hover:text-[#2C2A29]"
                  }`}
                >
                  🔗 Web URL
                </button>
              </div>
            </div>

            {imageInputMode === "file" ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  id="product-file-picker"
                />
                <label
                  htmlFor="product-file-picker"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#D8D4CE] hover:border-[#1E3A5F] rounded-xl cursor-pointer bg-[#F7F5F0] hover:bg-[#ECE8DF] transition text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center mb-2 group-hover:scale-110 transition border border-[#1E3A5F]/20">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-[#2C2A29]">
                    Click to browse or drop an image file
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    PNG, JPG, WEBP or GIF (Max 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={formData.image_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#FFFFFF] border border-[#D8D4CE] focus:border-[#1E3A5F] rounded-xl px-4 py-2.5 text-sm text-[#2C2A29] placeholder-stone-400 focus:outline-none transition shadow-xs"
                />
              </div>
            )}

            {/* Live Image Preview with Remove / Change control */}
            {formData.image_url && (
              <div className="flex items-center justify-between p-3 bg-[#F7F5F0] rounded-xl border border-[#DDD6C8]">
                <div className="flex items-center gap-3">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-[#DDD6C8] bg-[#ECE8DF] shrink-0"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#2C2A29]">
                      {formData.image_url.startsWith("data:")
                        ? "Local Image File Selected"
                        : "Web Image Linked"}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate max-w-[260px] sm:max-w-xs">
                      {formData.image_url.startsWith("data:")
                        ? "Embedded base64 format"
                        : formData.image_url}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-600 hover:text-red-700 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 border border-red-200 transition cursor-pointer shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Description <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  (formData.description || "").length >= 2000
                    ? "text-red-600 font-bold"
                    : (formData.description || "").length >= 1800
                    ? "text-amber-600"
                    : "text-stone-400"
                }`}
              >
                {(formData.description || "").length}/2000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={2000}
              value={formData.description || ""}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  description: e.target.value,
                });
                setTouched((prev) => ({ ...prev, description: true }));
              }}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, description: true }))
              }
              placeholder="Detailed product features, specifications, package contents, and warranty info..."
              className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-sm text-[#2C2A29] placeholder-stone-400 focus:outline-none transition resize-none shadow-xs ${
                finalDescError
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : "border-[#D8D4CE] focus:border-[#1E3A5F]"
              }`}
            />
            {finalDescError && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {finalDescError}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD6C8]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-[#2C2A29] hover:bg-[#ECE8DF] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting
                ? "Saving..."
                : editingProduct
                ? "Save Changes"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
