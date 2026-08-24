"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import RouteGuard from "@/components/RouteGuard";
import { Country, State, City } from "country-state-city";

import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import AddressCard from "@/components/profile/AddressCard";
import AddressFormModal from "@/components/profile/AddressFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function ProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);

  // Profile & Password Modals State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Address Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    actionType: "",
    targetId: null,
  });

  // Cascading Country -> State -> City codes
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [newAddr, setNewAddr] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_default: false,
  });

  // Form touched & validation state
  const [touched, setTouched] = useState({
    street: false,
    country: false,
    state: false,
    city: false,
    postal_code: false,
  });

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await api.get("/api/addresses");
      setAddresses(data);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setLoadingAddr(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchAddresses();
    }
  }, [user, authLoading, router, fetchAddresses]);

  // Memoized country, state, and city datasets
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const availableStates = useMemo(() => {
    return selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  }, [selectedCountryCode]);

  const availableCities = useMemo(() => {
    if (!selectedCountryCode || !selectedStateCode) return [];
    return City.getCitiesOfState(selectedCountryCode, selectedStateCode);
  }, [selectedCountryCode, selectedStateCode]);

  // Real-time inline field validations
  const errors = useMemo(() => {
    const errs = {};
    if (!newAddr.street || newAddr.street.trim().length < 5) {
      errs.street = "Street address must be at least 5 characters.";
    } else if (newAddr.street.trim().length > 80) {
      errs.street = "Street address cannot exceed 80 characters.";
    }

    if (!newAddr.country) {
      errs.country = "Please select a country.";
    }

    if (!newAddr.state) {
      errs.state = "Please select a state / region.";
    }

    if (!newAddr.city) {
      errs.city = "Please select a city.";
    }

    if (!newAddr.postal_code || !newAddr.postal_code.trim()) {
      errs.postal_code = "Zip / Postal Code is required.";
    } else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(newAddr.postal_code.trim())) {
      errs.postal_code = "Enter a valid postal / ZIP code (3-10 characters).";
    }

    return errs;
  }, [newAddr]);

  const handleOpenAddModal = () => {
    setEditingAddrId(null);
    setSelectedCountryCode("");
    setSelectedStateCode("");
    setNewAddr({
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_default: false,
    });
    setTouched({
      street: false,
      country: false,
      state: false,
      city: false,
      postal_code: false,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddrId(addr.id);

    const countryObj = allCountries.find((c) => c.name.toLowerCase() === (addr.country || "").toLowerCase());
    const countryCode = countryObj ? countryObj.isoCode : "";
    setSelectedCountryCode(countryCode);

    let stateCode = "";
    if (countryCode) {
      const statesInCountry = State.getStatesOfCountry(countryCode);
      const stateObj = statesInCountry.find((s) => s.name.toLowerCase() === (addr.state || "").toLowerCase());
      stateCode = stateObj ? stateObj.isoCode : "";
    }
    setSelectedStateCode(stateCode);

    setNewAddr({
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: addr.country || "",
      is_default: addr.is_default || false,
    });
    setTouched({
      street: false,
      country: false,
      state: false,
      city: false,
      postal_code: false,
    });
    setShowAddModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    setTouched({
      street: true,
      country: true,
      state: true,
      city: true,
      postal_code: true,
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setConfirmModal({
      open: true,
      title: editingAddrId ? "Update Shipping Address" : "Save Shipping Address",
      message: editingAddrId
        ? "Are you sure you want to update this shipping address?"
        : "Are you sure you want to save this new shipping address?",
      actionType: "save",
      targetId: editingAddrId,
    });
  };

  const executeSaveAddress = async () => {
    try {
      const payload = {
        ...newAddr,
        street: newAddr.street.trim(),
        city: newAddr.city.trim(),
        state: newAddr.state.trim(),
        postal_code: newAddr.postal_code.trim(),
        country: newAddr.country.trim(),
      };

      if (editingAddrId) {
        await api.put(`/api/addresses/${editingAddrId}`, payload);
        showToast("Address updated successfully!", "success");
      } else {
        await api.post("/api/addresses", payload);
        showToast("Address added successfully!", "success");
      }
      setShowAddModal(false);
      setEditingAddrId(null);
      fetchAddresses();
    } catch (err) {
      showToast(err.message || "Failed to save address.", "error");
    }
  };

  const handleCancelAddress = () => {
    const hasData =
      newAddr.street.trim() ||
      newAddr.country.trim() ||
      newAddr.state.trim() ||
      newAddr.city.trim() ||
      newAddr.postal_code.trim();

    if (hasData) {
      setConfirmModal({
        open: true,
        title: "Discard Unsaved Changes",
        message: "Are you sure you want to cancel? Any unsaved address changes will be lost.",
        actionType: "cancel",
        targetId: null,
      });
    } else {
      setShowAddModal(false);
    }
  };

  const promptSetDefault = (addressId) => {
    setConfirmModal({
      open: true,
      title: "Set Default Shipping Address",
      message: "Are you sure you want to set this as your default delivery address?",
      actionType: "default",
      targetId: addressId,
    });
  };

  const promptUnsetDefault = (addressId) => {
    setConfirmModal({
      open: true,
      title: "Remove Default Status",
      message: "Are you sure you want to remove default status from this address?",
      actionType: "unsetDefault",
      targetId: addressId,
    });
  };

  const promptDeleteAddress = (addressId) => {
    setConfirmModal({
      open: true,
      title: "Remove Shipping Address",
      message: "Are you sure you want to delete this address? This action cannot be undone.",
      actionType: "delete",
      targetId: addressId,
    });
  };

  const handleExecuteConfirmAction = async () => {
    const { actionType, targetId } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, open: false }));

    try {
      if (actionType === "default" && targetId) {
        await api.patch(`/api/addresses/${targetId}/default`);
        showToast("Default address updated.", "success");
        fetchAddresses();
      } else if (actionType === "unsetDefault" && targetId) {
        await api.patch(`/api/addresses/${targetId}/unset-default`);
        showToast("Default status removed from address.", "success");
        fetchAddresses();
      } else if (actionType === "delete" && targetId) {
        await api.delete(`/api/addresses/${targetId}`);
        showToast("Address removed.", "success");
        fetchAddresses();
      } else if (actionType === "save") {
        await executeSaveAddress();
      } else if (actionType === "cancel") {
        setShowAddModal(false);
      }
    } catch (err) {
      showToast(err.message || "Action failed.", "error");
    }
  };

  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "addresses" ? "addresses" : "profile";

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400 space-y-3">
        <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* Profile Section Tabs */}
      <div className="flex items-center gap-2 bg-[#ECE8DF] p-1.5 rounded-2xl border border-[#DDD6C8] w-fit shadow-xs">
        <button
          type="button"
          onClick={() => router.push("/profile?tab=profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#1E3A5F] text-white shadow-xs"
              : "text-stone-600 hover:text-[#2C2A29] hover:bg-[#DDD6C8]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Account Overview</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/profile?tab=addresses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "addresses"
              ? "bg-[#1E3A5F] text-white shadow-xs"
              : "text-stone-600 hover:text-[#2C2A29] hover:bg-[#DDD6C8]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Saved Addresses {addresses.length > 0 ? `(${addresses.length})` : ""}</span>
        </button>
      </div>

      {activeTab === "profile" ? (
        <>
          {/* User Info Header with Action Buttons */}
          <ProfileHeader
            user={user}
            onOpenEditProfile={() => setShowEditProfileModal(true)}
            onOpenChangePassword={() => setShowChangePasswordModal(true)}
          />

          {/* Edit Profile Modal Dialog */}
          <EditProfileModal
            open={showEditProfileModal}
            onOpenChange={setShowEditProfileModal}
          />

          {/* Change Password Modal Dialog */}
          <ChangePasswordModal
            open={showChangePasswordModal}
            onOpenChange={setShowChangePasswordModal}
          />
        </>
      ) : (
        <>
          {/* Address Book Section */}
          <div id="addresses-section" className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#DDD6C8] pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2C2A29] tracking-tight">
                  Saved Shipping Addresses
                </h2>
                <p className="text-stone-600 text-xs mt-0.5">
                  Manage your delivery addresses for quick checkout.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="bg-[#1E3A5F] hover:bg-[#152843] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>+ Add Address</span>
              </button>
            </div>

            {/* Address Cards Grid */}
            {loadingAddr ? (
              <div className="py-12 text-center text-stone-500 space-y-2">
                <div className="w-6 h-6 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs">Loading addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#DDD6C8] rounded-2xl bg-[#FFFFFF] p-6 space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#ECE8DF] border border-[#DDD6C8] flex items-center justify-center mx-auto text-stone-400 text-xl">
                  📍
                </div>
                <div>
                  <h3 className="text-[#2C2A29] font-semibold text-sm">No addresses saved yet</h3>
                  <p className="text-stone-600 text-xs mt-1">
                    Add your primary delivery address to speed up checkout.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-block bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Add First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={handleOpenEditModal}
                    onDelete={promptDeleteAddress}
                    onSetDefault={promptSetDefault}
                    onUnsetDefault={promptUnsetDefault}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Address Form Modal */}
          <AddressFormModal
            open={showAddModal}
            onOpenChange={setShowAddModal}
            editingAddrId={editingAddrId}
            newAddr={newAddr}
            setNewAddr={setNewAddr}
            touched={touched}
            setTouched={setTouched}
            errors={errors}
            selectedCountryCode={selectedCountryCode}
            setSelectedCountryCode={setSelectedCountryCode}
            selectedStateCode={selectedStateCode}
            setSelectedStateCode={setSelectedStateCode}
            allCountries={allCountries}
            availableStates={availableStates}
            availableCities={availableCities}
            onSubmit={handleSaveAddress}
            onCancel={handleCancelAddress}
          />

          {/* Confirmation Modal */}
          <ConfirmDialog
            open={confirmModal.open}
            onOpenChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
            title={confirmModal.title}
            message={confirmModal.message}
            actionType={confirmModal.actionType}
            onConfirm={handleExecuteConfirmAction}
          />
        </>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RouteGuard type="private">
      <Suspense fallback={<div className="py-20 text-center text-stone-400">Loading profile...</div>}>
        <ProfileContent />
      </Suspense>
    </RouteGuard>
  );
}
