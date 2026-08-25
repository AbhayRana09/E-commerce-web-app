"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/context/ToastContext";
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  toggleAdminCouponStatus,
  deleteAdminCoupon,
} from "@/lib/coupons";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CouponStatsCards from "@/components/admin/coupons/CouponStatsCards";
import CouponTable from "@/components/admin/coupons/CouponTable";
import CouponFormModal from "@/components/admin/coupons/CouponFormModal";

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Confirmation dialogs
  const [couponToDelete, setCouponToDelete] = useState(null);

  const getTodayISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "PERCENTAGE",
    discount_value: "",
    min_order_amount: "0",
    starts_at: getTodayISO(),
    expires_at: "",
  });

  const [touched, setTouched] = useState({
    code: false,
    discount_value: false,
    min_order_amount: false,
    starts_at: false,
    expires_at: false,
  });

  // Real-time inline field validation errors
  const errors = useMemo(() => {
    const errs = {};

    if (!formData.code || !formData.code.trim()) {
      errs.code = "Coupon code is required.";
    } else if (formData.code.trim().length < 3) {
      errs.code = "Coupon code must be at least 3 characters.";
    } else if (formData.code.trim().length > 20) {
      errs.code = "Coupon code cannot exceed 20 characters.";
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code.trim())) {
      errs.code = "Coupon code can only contain letters, numbers, hyphens, and underscores.";
    }

    const val = Number(formData.discount_value);
    if (formData.discount_value === "" || isNaN(val) || val <= 0) {
      errs.discount_value = "Please enter a valid discount value greater than 0.";
    } else if (formData.discount_type === "PERCENTAGE" && val > 100) {
      errs.discount_value = "Percentage discount cannot exceed 100%.";
    }

    const minOrder = Number(formData.min_order_amount);
    if (formData.min_order_amount !== "" && (isNaN(minOrder) || minOrder < 0)) {
      errs.min_order_amount = "Minimum order amount cannot be negative.";
    }

    if (!formData.starts_at) {
      errs.starts_at = "Start date is required.";
    }

    if (!formData.expires_at) {
      errs.expires_at = "Expiry date is required.";
    } else if (formData.starts_at && formData.expires_at < formData.starts_at) {
      errs.expires_at = "Expiry date must be on or after start date.";
    }

    return errs;
  }, [formData]);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminCoupons(search);
      setCoupons(data || []);
    } catch (err) {
      showToast(err.message || "Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleOpenModal = (coupon = null) => {
    setTouched({
      code: false,
      discount_value: false,
      min_order_amount: false,
      starts_at: false,
      expires_at: false,
    });

    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type,
        discount_value: String(coupon.discount_value),
        min_order_amount: String(coupon.min_order_amount || 0),
        starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 10) : getTodayISO(),
        expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        description: "",
        discount_type: "PERCENTAGE",
        discount_value: "",
        min_order_amount: "0",
        starts_at: getTodayISO(),
        expires_at: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      code: true,
      discount_value: true,
      min_order_amount: true,
      starts_at: true,
      expires_at: true,
    });

    if (Object.keys(errors).length > 0) {
      showToast("Please complete all required fields.", "error");
      return;
    }

    await executeSaveCoupon();
  };

  const executeSaveCoupon = async () => {
    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount) || 0.0,
        starts_at: new Date(`${formData.starts_at}T00:00:00.000Z`).toISOString(),
        expires_at: new Date(`${formData.expires_at}T23:59:59.999Z`).toISOString(),
      };

      if (editingCoupon) {
        await updateAdminCoupon(editingCoupon.id, payload);
        showToast("Coupon updated successfully!", "success");
      } else {
        await createAdminCoupon(payload);
        showToast("Coupon created successfully!", "success");
      }

      handleCloseModal();
      loadCoupons();
    } catch (err) {
      showToast(err.message || "Failed to save coupon", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await toggleAdminCouponStatus(coupon.id);
      showToast(`Coupon '${coupon.code}' ${coupon.is_active ? "deactivated" : "activated"}`, "info");
      loadCoupons();
    } catch (err) {
      showToast(err.message || "Failed to update coupon status", "error");
    }
  };

  const handleDelete = (coupon) => {
    setCouponToDelete(coupon);
  };

  const handleConfirmedDelete = async () => {
    if (!couponToDelete) return;
    try {
      setSubmitting(true);
      await deleteAdminCoupon(couponToDelete.id);
      showToast(`Coupon '${couponToDelete.code}' deleted successfully`, "success");
      setCouponToDelete(null);
      loadCoupons();
    } catch (err) {
      showToast(err.message || "Failed to delete coupon", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = coupons.filter((c) => c.is_active).length;

  const filteredCoupons = useMemo(() => {
    if (!search.trim()) return coupons;
    const term = search.toLowerCase().trim();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
    );
  }, [coupons, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDD6C8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2A29] tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Create, manage, and schedule promotional coupon codes with calendar validity windows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Stats Cards */}
      <CouponStatsCards totalCoupons={coupons.length} activeCount={activeCount} />

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#ECE8DF] p-4 rounded-2xl border border-[#DDD6C8] shadow-xs">
        <div className="relative w-full sm:w-80">
          <svg
            className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2C2A29] placeholder-stone-400 focus:outline-none focus:border-[#1E3A5F] shadow-xs"
          />
        </div>
        <span className="text-xs text-stone-600">
          Showing {filteredCoupons.length} coupon{filteredCoupons.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      <CouponTable
        coupons={filteredCoupons}
        loading={loading}
        onToggleStatus={handleToggleStatus}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onCreateFirst={() => handleOpenModal()}
      />

      {/* Create / Edit Form Modal */}
      <CouponFormModal
        open={isModalOpen}
        editingCoupon={editingCoupon}
        formData={formData}
        setFormData={setFormData}
        touched={touched}
        setTouched={setTouched}
        errors={errors}
        submitting={submitting}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
        getTodayISO={getTodayISO}
      />

      {/* Delete Coupon Confirmation Dialog (Direct Page-Level) */}
      <ConfirmDialog
        open={!!couponToDelete}
        onOpenChange={(open) => !open && setCouponToDelete(null)}
        title="Delete Coupon"
        message={`Are you sure you want to permanently delete coupon '${couponToDelete?.code}'? This action cannot be undone.`}
        actionType="delete"
        onConfirm={handleConfirmedDelete}
      />
    </div>
  );
}
