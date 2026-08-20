"use client";

import { useEffect, useState, useCallback } from "react";
import { getCategories } from "@/lib/products";
import { createCategory, updateCategory, deleteCategory } from "@/lib/admin";
import { useToast } from "@/context/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { validateCategoryName, validateCategoryDescription } from "@/lib/validation";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [touched, setTouched] = useState({ name: false, description: false });

  // Confirmation dialogs
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      showToast(err.message || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const nameError = touched.name ? validateCategoryName(formData.name) : "";
  const descError = touched.description ? validateCategoryDescription(formData.description) : "";

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setTouched({ name: false, description: false });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || "" });
    setTouched({ name: false, description: false });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true });

    const errName = validateCategoryName(formData.name);
    const errDesc = validateCategoryDescription(formData.description);
    if (errName || errDesc) {
      showToast(errName || errDesc, "error");
      return;
    }

    if (editingCategory) {
      // Check if anything actually changed
      const isUnchanged =
        formData.name.trim() === editingCategory.name &&
        (formData.description || "").trim() === (editingCategory.description || "").trim();

      if (isUnchanged) {
        setIsModalOpen(false);
        return;
      }
    }

    // Prompt confirmation modal for both create and edit
    setShowSaveConfirm(true);
  };

  const executeSave = async () => {
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() ? formData.description.trim() : null,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showToast(`Category "${payload.name}" updated successfully!`, "success");
      } else {
        await createCategory(payload);
        showToast(`Category "${payload.name}" created successfully!`, "success");
      }

      setShowSaveConfirm(false);
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmedDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setSubmitting(true);
      await deleteCategory(categoryToDelete.id);
      showToast(`Category "${categoryToDelete.name}" deleted successfully!`, "success");
      setCategoryToDelete(null);
      loadCategories();
    } catch (err) {
      showToast(err.message || "Failed to delete category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Categories Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Organize products into clear, searchable catalog departments.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">No categories found.</p>
          <button
            onClick={openCreateModal}
            className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer"
          >
            Create your first category &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className="font-semibold text-slate-100 text-base break-words line-clamp-1"
                    title={cat.name}
                  >
                    {cat.name}
                  </h3>
                  <span
                    className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50 shrink-0 max-w-[130px] truncate"
                    title={`/${cat.slug}`}
                  >
                    /{cat.slug}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-2.5 line-clamp-3 leading-relaxed break-words">
                  {cat.description || "No description provided."}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700/60 transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit Category (Wider max-w-2xl layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{editingCategory ? "✏️" : "📁"}</span>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {editingCategory
                    ? `Update catalog specifications and description for "${editingCategory.name}".`
                    : "Create a new department to group and catalog store products."}
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
              {/* Category Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.name.length >= 50
                        ? "text-red-400 font-bold"
                        : formData.name.length >= 40
                        ? "text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {formData.name.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setTouched((prev) => ({ ...prev, name: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="e.g. Consumer Electronics, Smart Home, Fashion & Apparel"
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                    nameError
                      ? "border-red-500/80 bg-red-950/10 focus:border-red-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-red-400 font-medium">
                    {nameError || ""}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Max 50 characters (Industry Standard)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Description <span className="text-slate-500 normal-case">(Optional)</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.description.length >= 300
                        ? "text-red-400 font-bold"
                        : formData.description.length >= 250
                        ? "text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {formData.description.length}/300
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={300}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setTouched((prev) => ({ ...prev, description: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                  placeholder="Brief summary explaining which items belong to this category..."
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none ${
                    descError
                      ? "border-red-500/80 bg-red-950/10 focus:border-red-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-red-400 font-medium">
                    {descError || ""}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Max 300 characters
                  </span>
                </div>
              </div>

              {/* Actions */}
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
                  disabled={submitting || !!nameError || !!descError}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Create / Save Category Changes */}
      <ConfirmDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title={editingCategory ? "Save Category Changes?" : "Create New Category?"}
        message={
          editingCategory
            ? `Are you sure you want to update category "${formData.name.trim()}"? These modifications will reflect immediately across your store catalog.`
            : `Are you sure you want to create category "${formData.name.trim()}"? It will become available immediately for catalog organization.`
        }
        actionType="save"
        onConfirm={executeSave}
      />

      {/* Confirmation Dialog for Delete Category */}
      <ConfirmDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        title={`Delete Category "${categoryToDelete?.name}"?`}
        message="Are you sure you want to delete this category? This action cannot be undone and will affect products catalog grouping."
        actionType="delete"
        onConfirm={handleConfirmedDelete}
      />
    </div>
  );
}
