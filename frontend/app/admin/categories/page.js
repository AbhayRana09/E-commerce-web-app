"use client";

import { useEffect, useState, useCallback } from "react";
import { getCategories } from "@/lib/products";
import { createCategory, updateCategory, deleteCategory } from "@/lib/admin";
import { useToast } from "@/context/ToastContext";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || "" });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showToast(`Category "${formData.name}" updated successfully!`, "success");
      } else {
        await createCategory(formData);
        showToast(`Category "${formData.name}" created successfully!`, "success");
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      setSubmitting(true);
      await deleteCategory(id);
      showToast(`Category "${name}" deleted successfully!`, "success");
      setDeleteConfirmId(null);
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
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-100 text-base">{cat.name}</h3>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50">
                    /{cat.slug}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
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
                  onClick={() => setDeleteConfirmId(cat.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>

              {/* Delete confirmation inline */}
              {deleteConfirmId === cat.id && (
                <div className="mt-3 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs space-y-2">
                  <p className="text-red-300 font-medium">Are you sure? This cannot be undone.</p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 text-slate-300 hover:bg-slate-800 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={submitting}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md transition"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Electronics, Fashion, Home Decor"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-xl transition shadow-md shadow-indigo-600/20"
                >
                  {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
