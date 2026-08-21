"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Country, State, City } from "country-state-city";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import RouteGuard from "@/components/RouteGuard";
import { getAddresses, createAddress, updateAddress } from "@/lib/address";
import { validateCoupon, getActiveOffers } from "@/lib/coupons";
import { createOrder, simulateOrderPayment } from "@/lib/orders";
import AddressFormModal from "@/components/profile/AddressFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import StepShippingAddress from "@/components/checkout/StepShippingAddress";
import StepReviewCart from "@/components/checkout/StepReviewCart";
import StepPaymentMethod from "@/components/checkout/StepPaymentMethod";
import CheckoutSummaryCard from "@/components/checkout/CheckoutSummaryCard";

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, items, subtotal, loading: cartLoading, refreshCart } = useCart();
  const { showToast } = useToast();

  // Wizard Step State: 1 = Address, 2 = Review, 3 = Payment
  const [currentStep, setCurrentStep] = useState(1);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address Form Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_default: false,
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [touched, setTouched] = useState({
    street: false,
    country: false,
    state: false,
    city: false,
    postal_code: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [showAddressSaveConfirm, setShowAddressSaveConfirm] = useState(false);

  // Coupon & Available Offers State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [applyingOfferCode, setApplyingOfferCode] = useState(null);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("MOCK_CARD");
  const [processingOrder, setProcessingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Memoized country, state, and city datasets
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const availableStates = useMemo(() => {
    if (!selectedCountryCode) return [];
    return State.getStatesOfCountry(selectedCountryCode);
  }, [selectedCountryCode]);

  const availableCities = useMemo(() => {
    if (!selectedCountryCode || !selectedStateCode) return [];
    return City.getCitiesOfState(selectedCountryCode, selectedStateCode);
  }, [selectedCountryCode, selectedStateCode]);

  // Inline address form errors
  const addressErrors = useMemo(() => {
    const errs = {};
    if (touched.street) {
      if (!newAddress.street || !newAddress.street.trim()) {
        errs.street = "Street address is required.";
      } else if (newAddress.street.trim().length < 5) {
        errs.street = "Street address must be at least 5 characters.";
      }
    }
    if (touched.country && (!newAddress.country || !newAddress.country.trim())) {
      errs.country = "Please select a valid country.";
    }
    if (touched.state && (!newAddress.state || !newAddress.state.trim())) {
      errs.state = "Please select or enter a valid state / province.";
    }
    if (touched.city && (!newAddress.city || !newAddress.city.trim())) {
      errs.city = "Please select or enter a valid city.";
    }
    if (touched.postal_code) {
      if (!newAddress.postal_code || !newAddress.postal_code.trim()) {
        errs.postal_code = "Postal code is required.";
      } else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(newAddress.postal_code.trim())) {
        errs.postal_code = "Enter a valid postal / ZIP code (3-10 alphanumeric characters).";
      }
    }
    return errs;
  }, [newAddress, touched]);

  // Load Saved Addresses
  const loadAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const data = await getAddresses();
      setAddresses(data || []);
      if (data && data.length > 0) {
        const defaultAddr = data.find((a) => a.is_default);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0].id);
      }
    } catch (err) {
      showToast(err.message || "Failed to load addresses", "error");
    } finally {
      setLoadingAddresses(false);
    }
  }, [showToast]);

  // Load Available Offers
  const loadOffers = useCallback(async () => {
    try {
      setLoadingOffers(true);
      const offers = await getActiveOffers();
      setAvailableOffers(offers || []);
    } catch (err) {
      // Non-blocking error for promo offers
      console.warn("Could not load promotional offers:", err);
    } finally {
      setLoadingOffers(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
    loadOffers();
  }, [loadAddresses, loadOffers]);

  // Open Add Address Modal
  const handleOpenAddModal = () => {
    setEditingAddrId(null);
    setNewAddress({
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_default: addresses.length === 0,
    });
    setSelectedCountryCode("");
    setSelectedStateCode("");
    setTouched({
      street: false,
      country: false,
      state: false,
      city: false,
      postal_code: false,
    });
    setIsAddressModalOpen(true);
  };

  // Open Edit Address Modal
  const handleOpenEditModal = (addr, e) => {
    e.stopPropagation();
    setEditingAddrId(addr.id);

    const countryObj = allCountries.find(
      (c) => c.name.toLowerCase() === (addr.country || "").toLowerCase()
    );
    const countryCode = countryObj ? countryObj.isoCode : "";
    setSelectedCountryCode(countryCode);

    let stateCode = "";
    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode);
      const stateObj = states.find(
        (s) => s.name.toLowerCase() === (addr.state || "").toLowerCase()
      );
      stateCode = stateObj ? stateObj.isoCode : "";
      setSelectedStateCode(stateCode);
    } else {
      setSelectedStateCode("");
    }

    setNewAddress({
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
    setIsAddressModalOpen(true);
  };

  // Handle Save (Create / Update) Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setTouched({
      street: true,
      country: true,
      state: true,
      city: true,
      postal_code: true,
    });

    if (Object.keys(addressErrors).length > 0) {
      showToast("Please complete all required address fields.", "error");
      return;
    }

    if (editingAddrId) {
      setShowAddressSaveConfirm(true);
    } else {
      await executeSaveAddress();
    }
  };

  const executeSaveAddress = async () => {
    try {
      setSavingAddress(true);
      if (editingAddrId) {
        await updateAddress(editingAddrId, newAddress);
        showToast("Address updated successfully!", "success");
      } else {
        const created = await createAddress(newAddress);
        showToast("Shipping address saved successfully!", "success");
        setSelectedAddressId(created.id);
      }
      setShowAddressSaveConfirm(false);
      setIsAddressModalOpen(false);
      await loadAddresses();
    } catch (err) {
      showToast(err.message || "Failed to save address", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle Apply Coupon (Manual Form Input)
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) {
      showToast("Please enter a coupon code", "error");
      return;
    }

    try {
      setValidatingCoupon(true);
      const res = await validateCoupon(couponCodeInput.trim(), subtotal);
      setAppliedCoupon(res);
      showToast(res.message || `Coupon '${res.code}' applied!`, "success");
    } catch (err) {
      setAppliedCoupon(null);
      showToast(err.message || "Invalid or ineligible coupon code", "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Handle Direct One-Click Apply Offer from Offers Hub
  const handleApplyOfferCode = async (code) => {
    try {
      setApplyingOfferCode(code);
      const res = await validateCoupon(code, subtotal);
      setAppliedCoupon(res);
      setCouponCodeInput(code);
      showToast(`Offer '${code}' applied successfully!`, "success");
    } catch (err) {
      showToast(err.message || `Unable to apply offer '${code}'`, "error");
    } finally {
      setApplyingOfferCode(null);
    }
  };

  // Handle Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    showToast("Coupon removed", "info");
  };

  // Order Totals Computations
  const shippingCost = subtotal > 100 || subtotal === 0 ? 0.0 : 9.99;
  const discountAmount = appliedCoupon?.discount_amount ? Number(appliedCoupon.discount_amount) : 0.0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const estimatedTax = taxableAmount * 0.08;
  const finalTotal = Math.max(0, taxableAmount + shippingCost + estimatedTax);

  // Handle Order Placement & Payment Simulation
  const handlePlaceOrder = async (simulateSuccess = true) => {
    if (!selectedAddressId) {
      showToast("Please select a shipping address.", "error");
      setCurrentStep(1);
      return;
    }

    try {
      setProcessingOrder(true);
      setPaymentError(null);

      // Step A: Create the Order in database
      const orderPayload = {
        address_id: selectedAddressId,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod,
      };

      const createdOrder = await createOrder(orderPayload);

      // Step B: Process Payment
      if (paymentMethod !== "COD") {
        const paymentRes = await simulateOrderPayment(createdOrder.id, {
          payment_method: paymentMethod,
          simulate_success: simulateSuccess,
        });

        if (!paymentRes.success) {
          setPaymentError("Payment was declined or cancelled. You can retry with another payment method or choose Cash on Delivery.");
          showToast("Payment unsuccessful. Order remains pending.", "error");
          await refreshCart();
          return;
        }
      }

      // Refresh global cart state to empty
      await refreshCart();

      showToast("Order placed successfully! Redirecting...", "success");
      router.push(`/orders/confirmation?orderId=${createdOrder.id}`);
    } catch (err) {
      setPaymentError(err.message || "An error occurred while creating your order.");
      showToast(err.message || "Order placement failed", "error");
    } finally {
      setProcessingOrder(false);
    }
  };

  if (cartLoading && !cart) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="max-w-md mx-auto space-y-4 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-300">Loading your checkout details...</p>
        </div>
      </div>
    );
  }

  if (!cartLoading && (!cart || items.length === 0)) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-xl mx-auto space-y-5 bg-slate-900/60 p-10 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
          <div className="w-20 h-20 rounded-3xl bg-slate-950 text-slate-500 border border-slate-800 flex items-center justify-center mx-auto text-3xl">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            You don&apos;t have any items to checkout. Please add products to your shopping cart first.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-2xl transition shadow-lg shadow-indigo-600/25"
          >
            Explore Catalog &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Wizard Progress Stepper */}
      <CheckoutStepper
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        canNavigateToStep={() => Boolean(selectedAddressId)}
      />

      {/* Main Grid: Left Wizard Stage + Right Sticky Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Active Wizard Step */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: ADDRESS SELECTION */}
          {currentStep === 1 && (
            <StepShippingAddress
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              loadingAddresses={loadingAddresses}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              user={user}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {/* STEP 2: REVIEW & OFFERS */}
          {currentStep === 2 && (
            <StepReviewCart
              selectedAddress={selectedAddress}
              items={items}
              appliedCoupon={appliedCoupon}
              couponCodeInput={couponCodeInput}
              setCouponCodeInput={setCouponCodeInput}
              validatingCoupon={validatingCoupon}
              handleApplyCoupon={handleApplyCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
              availableOffers={availableOffers}
              loadingOffers={loadingOffers}
              subtotal={subtotal}
              handleApplyOfferCode={handleApplyOfferCode}
              applyingOfferCode={applyingOfferCode}
              onBack={() => setCurrentStep(1)}
              onProceedToPayment={() => setCurrentStep(3)}
            />
          )}

          {/* STEP 3: PAYMENT */}
          {currentStep === 3 && (
            <StepPaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentError={paymentError}
              finalTotal={finalTotal}
              processingOrder={processingOrder}
              onPlaceOrder={handlePlaceOrder}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* Right 1 Col: Fixed Summary Breakdown */}
        <CheckoutSummaryCard
          itemsCount={items.length}
          subtotal={subtotal}
          shippingCost={shippingCost}
          discountAmount={discountAmount}
          appliedCoupon={appliedCoupon}
          estimatedTax={estimatedTax}
          finalTotal={finalTotal}
        />
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        editingAddrId={editingAddrId}
        newAddr={newAddress}
        setNewAddr={setNewAddress}
        touched={touched}
        setTouched={setTouched}
        errors={addressErrors}
        selectedCountryCode={selectedCountryCode}
        setSelectedCountryCode={setSelectedCountryCode}
        selectedStateCode={selectedStateCode}
        setSelectedStateCode={setSelectedStateCode}
        allCountries={allCountries}
        availableStates={availableStates}
        availableCities={availableCities}
        onSubmit={handleSaveAddress}
        onCancel={() => setIsAddressModalOpen(false)}
      />

      {/* Address Edit Confirmation Dialog */}
      <ConfirmDialog
        open={showAddressSaveConfirm}
        onOpenChange={setShowAddressSaveConfirm}
        title="Save Address Changes"
        message="Are you sure you want to save the updated shipping address details?"
        actionType="save"
        onConfirm={executeSaveAddress}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RouteGuard type="customer" adminRedirect="/admin">
      <CheckoutContent />
    </RouteGuard>
  );
}
