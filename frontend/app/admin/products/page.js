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
import ProductFilters from "@/components/admin/products/ProductFilters";
import ProductTable from "@/components/admin/products/ProductTable";
import ProductFormModal from "@/components/admin/products/ProductFormModal";

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
      setLoading(true);
      const [prodsData, catsData] = await Promise.all([
        getAdminProducts(),
        getCategories(),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
    } catch (err) {
      showToast(err.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Validation
  const errors = {};
  if (touched.name) {
    const err = validateProductName(formData.name);
    if (err) errors.name = err;
  }
  if (touched.category_id && !formData.category_id) {
    errors.category_id = "Please select a category.";
  }
  if (touched.price) {
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = "Enter a valid positive price.";
    }
  }
  if (touched.stock_quantity) {
    if (
      formData.stock_quantity === "" ||
      isNaN(formData.stock_quantity) ||
      Number(formData.stock_quantity) < 0
    ) {
      errors.stock_quantity = "Enter a valid stock count (0 or more).";
    }
  }
  if (touched.description) {
    const err = validateProductDescription(formData.description);
    if (err) errors.description = err;
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      category_id: categories.length > 0 ? categories[0].id.toString() : "",
    });
    setTouched({
      name: false,
      category_id: false,
      price: false,
      stock_quantity: false,
      description: false,
    });
    setImageInputMode("file");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category_id: product.category_id?.toString() || product.category?.id?.toString() || "",
      price: product.price !== undefined ? product.price.toString() : "",
      stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity.toString() : "",
      image_url: product.image_url || "",
      description: product.description || "",
      is_active: product.is_active ?? true,
    });
    setTouched({
      name: false,
      category_id: false,
      price: false,
      stock_quantity: false,
      description: false,
    });
    setImageInputMode(product.image_url ? "url" : "file");
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const errorMsg = validateProfileImage(file);
    if (errorMsg) {
      showToast(errorMsg, "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image_url: reader.result }));
      showToast("Image loaded successfully!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleToggleStatus = async (product) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      category_id: true,
      price: true,
      stock_quantity: true,
      description: true,
    });

    if (
      validateProductName(formData.name) ||
      !formData.category_id ||
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0 ||
      formData.stock_quantity === "" ||
      isNaN(formData.stock_quantity) ||
      Number(formData.stock_quantity) < 0 ||
      validateProductDescription(formData.description)
    ) {
      showToast("Please fill all required fields correctly.", "error");
      return;
    }

    if (editingProduct) {
      setShowSaveConfirm(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        category_id: parseInt(formData.category_id, 10),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10),
        description: formData.description.trim(),
        image_url: formData.image_url?.trim() || null,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showToast("Product updated successfully!", "success");
      } else {
        await createProduct(payload);
        showToast("Product created successfully!", "success");
      }

      setShowSaveConfirm(false);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || "Failed to save product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    try {
      setSubmitting(true);
      await deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deleted successfully!`, "success");
      setProductToDelete(null);
      await loadData();
    } catch (err) {
      showToast(err.message || "Failed to delete product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      prod.category_id === parseInt(selectedCategory, 10);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2A29] tracking-tight">Products Management</h1>
          <p className="text-sm text-stone-600 mt-1">
            Create, update stock, manage visibility and curate items in your catalogue.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filter Controls */}
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Products Data Table */}
      <ProductTable
        loading={loading}
        products={filteredProducts}
        categories={categories}
        onToggleActive={handleToggleStatus}
        onToggleStatus={handleToggleStatus}
        onEdit={handleOpenEditModal}
        onEditProduct={handleOpenEditModal}
        onDelete={(p) => setProductToDelete(p)}
        onDeleteProduct={(p) => setProductToDelete(p)}
        onAddFirst={handleOpenAddModal}
      />

      {/* Create / Edit Modal */}
      <ProductFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenChange={setIsModalOpen}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        touched={touched}
        setTouched={setTouched}
        errors={errors}
        categories={categories}
        imageInputMode={imageInputMode}
        setImageInputMode={setImageInputMode}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        actionType="delete"
        submitting={submitting}
        onConfirm={executeDelete}
      />

      {/* Save Edit Confirmation Modal */}
      <ConfirmDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title="Save Changes"
        message={`Are you sure you want to save the changes for "${editingProduct?.name}"?`}
        actionType="save"
        submitting={submitting}
        onConfirm={executeSave}
      />
    </div>
  );
}
