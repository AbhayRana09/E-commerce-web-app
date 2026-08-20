"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getCategories } from "@/lib/products";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/admin";
import { useToast } from "@/context/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  validateProfileImage,
  validateProductName,
  validateProductDescription,
} from "@/lib/validation";

export default function AdminProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Image upload mode: 'file' | 'url'
  const [imageInputMode, setImageInputMode] = useState("file");
  const fileInputRef = useRef(null);

  // Form State
  const initialForm = {
    name: "",
    category_id: "",
    price: "",
    stock_quantity: "",
    image_url: "",
    description: "",
    is_active: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [touched, setTouched] = useState({
    name: false,
    category_id: false,
    price: false,
    stock_quantity: false,
    description: false,
  });

  const loadData = useCallback(async () => {
    try {
      const [prodsData, catsData] = await Promise.all([
        getAdminProducts(),
        getCategories(),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
    } catch (err) {
      showToast(err.message || "Failed to load admin product data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time inline field validation errors
  const nameError = touched.name ? validateProductName(formData.name) : "";
  const categoryError =
    touched.category_id && !formData.category_id
      ? "Please select a category."
      : "";
  const priceError =
    touched.price && (!formData.price || Number(formData.price) <= 0)
      ? "Price must be greater than 0."
      : "";
  const stockError =
    touched.stock_quantity &&
    (formData.stock_quantity === "" || Number(formData.stock_quantity) < 0)
      ? "Stock quantity cannot be negative."
      : "";
  const descError = touched.description
    ? validateProductDescription(formData.description)
    : "";

  const hasValidationErrors =
    !!validateProductName(formData.name) ||
    !formData.category_id ||
    !formData.price ||
    Number(formData.price) <= 0 ||
    formData.stock_quantity === "" ||
    Number(formData.stock_quantity) < 0 ||
    !!validateProductDescription(formData.description);

  const openCreateModal = () => {
    setEditingProduct(null);
    setImageInputMode("file");
    setFormData({
      ...initialForm,
      category_id: categories[0]?.id || "",
    });
    setTouched({
      name: false,
      category_id: false,
      price: false,
      stock_quantity: false,
      description: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setImageInputMode(
      p.image_url?.startsWith("data:") ? "file" : p.image_url ? "url" : "file"
    );
    setFormData({
      name: p.name,
      category_id: p.category_id,
      price: p.price,
      stock_quantity: p.stock_quantity,
      image_url: p.image_url || "",
      description: p.description,
      is_active: p.is_active,
    });
    setTouched({
      name: false,
      category_id: false,
      price: false,
      stock_quantity: false,
      description: false,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      showToast(validationError, "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Data = loadEvent.target?.result;
      if (typeof base64Data === "string") {
        setFormData((prev) => ({ ...prev, image_url: base64Data }));
        showToast("Image selected successfully", "success");
      }
    };
    reader.onerror = () => {
      showToast("Failed to read image file", "error");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      category_id: true,
      price: true,
      stock_quantity: true,
      description: true,
    });

    if (hasValidationErrors) {
      showToast("Please fill all required fields correctly.", "error");
      return;
    }

    if (editingProduct) {
      setShowSaveConfirm(true);
    } else {
      await executeProductSave();
    }
  };

  const executeProductSave = async () => {
    const payload = {
      name: formData.name.trim(),
      category_id: Number(formData.category_id),
      price: Number(formData.price),
      stock_quantity: Number(formData.stock_quantity) || 0,
      image_url: formData.image_url.trim() || null,
      description: formData.description.trim(),
      is_active: formData.is_active,
    };

    try {
      setSubmitting(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showToast(`Product "${payload.name}" updated successfully!`, "success");
      } else {
        await createProduct(payload);
        showToast(`Product "${payload.name}" created successfully!`, "success");
      }
      setShowSaveConfirm(false);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      showToast(
        `Product marked as ${!product.is_active ? "Active" : "Inactive"}`,
        "success"
      );
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleConfirmedDelete = async () => {
    if (!productToDelete) return;
    try {
      setSubmitting(true);
      await deleteProduct(productToDelete.id);
      showToast(
        `Product "${productToDelete.name}" deactivated/removed`,
        "success"
      );
      setProductToDelete(null);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || p.category_id === Number(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Products Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Add, update, or remove products in your store catalog.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={categories.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Product
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center justify-between">
          <span>⚠️ You need to create at least one category before adding products.</span>
          <a href="/admin/categories" className="font-semibold underline ml-2">
            Create Category &rarr;
          </a>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-56 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="all">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">
            No products found matching criteria.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer"
          >
            Add a new product &rarr;
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/60 rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-800/30 transition duration-150"
                >
                  {/* Thumbnail & Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="max-w-xs">
                        <p className="font-semibold text-slate-100 line-clamp-1 break-words">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="bg-slate-800 text-indigo-300 font-medium px-2.5 py-1 rounded-full text-[11px] border border-slate-700/60 inline-block max-w-[140px] truncate">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 font-semibold text-slate-100">
                    ${Number(product.price).toFixed(2)}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        product.stock_quantity > 10
                          ? "text-slate-200"
                          : product.stock_quantity > 0
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {product.stock_quantity} units
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-4 py-3 w-28 shrink-0">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`w-24 inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer shrink-0 ${
                        product.is_active
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {product.is_active ? "● Active" : "○ Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700/60 transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setProductToDelete(product)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-red-500/30 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{editingProduct ? "✏️" : "📦"}</span>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {editingProduct
                    ? `Update pricing, stock, description, and image for "${editingProduct.name}".`
                    : "Fill in product specifications to publish an item in your catalog."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-base p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
              {/* Product Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.name.length >= 120
                        ? "text-red-400 font-bold"
                        : formData.name.length >= 100
                        ? "text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {formData.name.length}/120
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={120}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setTouched((prev) => ({ ...prev, name: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                    nameError
                      ? "border-red-500/80 bg-red-950/10 focus:border-red-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-red-400 font-medium mt-1">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData({ ...formData, category_id: e.target.value });
                      setTouched((prev) => ({ ...prev, category_id: true }));
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, category_id: true }))
                    }
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none transition cursor-pointer ${
                      categoryError
                        ? "border-red-500/80 bg-red-950/10 focus:border-red-500"
                        : "border-slate-800 focus:border-indigo-500"
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {categoryError && (
                    <p className="text-xs text-red-400 font-medium mt-1">
                      {categoryError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Price ($ USD) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      setTouched((prev) => ({ ...prev, price: true }));
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, price: true }))
                    }
                    placeholder="99.99"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                      priceError
                        ? "border-red-500/80 bg-red-950/10 focus:border-red-500"
                        : "border-slate-800 focus:border-indigo-500"
                    }`}
                  />
                  {priceError && (
                    <p className="text-xs text-red-400 font-medium mt-1">
                      {priceError}
                    </p>
                  )}
                </div>
              </div>

              {/* Stock & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Stock Quantity <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
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
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                      stockError
                        ? "border-red-500/80 bg-red-950/10 focus:border-red-500"
                        : "border-slate-800 focus:border-indigo-500"
                    }`}
                  />
                  {stockError && (
                    <p className="text-xs text-red-400 font-medium mt-1">
                      {stockError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Store Visibility
                  </label>
                  <label className="flex items-center gap-2.5 mt-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-200 font-medium">
                      Publish to Store (Active)
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Selector: File Picker + URL options */}
              <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Product Image
                  </label>
                  {/* Mode switcher tab buttons */}
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("file")}
                      className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                        imageInputMode === "file"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      📁 File Picker
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                        imageInputMode === "url"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
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
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/80 rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition text-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">
                        Click to browse or drop an image file
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        PNG, JPG, WEBP or GIF (Max 5MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                )}

                {/* Live Image Preview with Remove / Change control */}
                {formData.image_url && (
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700 bg-slate-950 shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {formData.image_url.startsWith("data:")
                            ? "Local Image File Selected"
                            : "Web Image Linked"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[260px] sm:max-w-xs">
                          {formData.image_url.startsWith("data:")
                            ? "Embedded base64 format"
                            : formData.image_url}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-400 hover:text-red-300 text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-red-500/10 border border-red-500/20 transition cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.description.length >= 2000
                        ? "text-red-400 font-bold"
                        : formData.description.length >= 1800
                        ? "text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {formData.description.length}/2000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={formData.description}
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
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none ${
                    descError
                      ? "border-red-500/80 bg-red-950/10 focus:border-red-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                {descError && (
                  <p className="text-xs text-red-400 font-medium mt-1">
                    {descError}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
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
      )}

      {/* Confirmation Dialog for Save Changes */}
      <ConfirmDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title="Save Product Changes?"
        message={`Are you sure you want to update product "${formData.name}"? Price: $${Number(formData.price || 0).toFixed(2)}, Stock: ${formData.stock_quantity} units.`}
        actionType="save"
        onConfirm={executeProductSave}
      />

      {/* Confirmation Dialog for Delete Product */}
      <ConfirmDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
        title={`Deactivate Product "${productToDelete?.name}"?`}
        message="Are you sure you want to remove this product? It will be deactivated and hidden from the customer storefront."
        actionType="delete"
        onConfirm={handleConfirmedDelete}
      />
    </div>
  );
}
