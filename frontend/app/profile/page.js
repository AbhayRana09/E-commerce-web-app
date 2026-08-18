"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import RouteGuard from "@/components/RouteGuard";
import { Country, State, City } from "country-state-city";

import ProfileHeader from "@/components/profile/ProfileHeader";
import AddressCard from "@/components/profile/AddressCard";
import AddressFormModal from "@/components/profile/AddressFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function ProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);

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
      setLoadingAddr(true);
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
    } else if (newAddr.street.trim().length > 120) {
      errs.street = "Street address cannot exceed 120 characters.";
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

    if (!newAddr.postal_code || newAddr.postal_code.trim().length < 3) {
      errs.postal_code = "Zip / Postal Code must be at least 3 characters.";
    } else if (newAddr.postal_code.trim().length > 12) {
      errs.postal_code = "Zip / Postal Code cannot exceed 12 characters.";
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

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* User Info Header */}
      <ProfileHeader user={user} />

      {/* Address Book Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Saved Shipping Addresses
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Manage your delivery addresses for quick checkout.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Add Address</span>
          </button>
        </div>

        {/* Address Cards Grid */}
        {loadingAddr ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-950/40 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 text-xl">
              📍
            </div>
            <div>
              <h3 className="text-slate-200 font-semibold text-sm">No addresses saved yet</h3>
              <p className="text-slate-400 text-xs mt-1">
                Add your primary delivery address to speed up checkout.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
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
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RouteGuard type="private">
      <ProfileContent />
    </RouteGuard>
  );
}
