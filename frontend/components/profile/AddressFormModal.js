"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AddressFormModal({
  open,
  onOpenChange,
  editingAddrId,
  newAddr,
  setNewAddr,
  touched,
  setTouched,
  errors,
  selectedCountryCode,
  setSelectedCountryCode,
  selectedStateCode,
  setSelectedStateCode,
  allCountries,
  availableStates,
  availableCities,
  onSubmit,
  onCancel,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-5xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-[#F7F5F0] border border-[#DDD6C8] shadow-2xl">
        <DialogHeader className="border-b border-[#DDD6C8] px-6 sm:px-8 py-5 shrink-0 flex flex-row items-center justify-between text-left">
          <div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#2C2A29] tracking-tight">
              {editingAddrId ? "Edit Shipping Address" : "Add Shipping Address"}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600 mt-0.5">
              Enter your full delivery details below
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-[#2C2A29] text-sm p-1.5 rounded-full hover:bg-[#ECE8DF] transition cursor-pointer"
          >
            ✕
          </button>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden text-sm">
          <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-4">
          {/* Street Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-stone-700 text-xs font-semibold uppercase tracking-wider">
                Street Address <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  (newAddr.street || "").length >= 80
                    ? "text-red-600 font-bold"
                    : (newAddr.street || "").length >= 65
                    ? "text-amber-600"
                    : "text-stone-400"
                }`}
              >
                {(newAddr.street || "").length}/80
              </span>
            </div>
            <input
              type="text"
              maxLength={80}
              suppressHydrationWarning
              value={newAddr.street}
              onChange={(e) => {
                setNewAddr({ ...newAddr, street: e.target.value });
                setTouched((prev) => ({ ...prev, street: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, street: true }))}
              placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
              className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] text-sm focus:outline-none transition shadow-xs ${
                touched.street && errors.street
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : touched.street && !errors.street
                  ? "border-emerald-500/80 focus:border-emerald-500"
                  : "border-[#D8D4CE] focus:border-[#1E3A5F]"
              }`}
            />
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-red-500 font-medium">
                {touched.street && errors.street ? errors.street : ""}
              </span>
              <span className="text-[11px] text-stone-400">Max 80 characters</span>
            </div>
          </div>

          {/* Country & State Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Country Select */}
            <div>
              <label className="block text-stone-700 text-xs font-semibold uppercase tracking-wider mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCountryCode}
                onChange={(e) => {
                  const countryCode = e.target.value;
                  const countryObj = allCountries.find((c) => c.isoCode === countryCode);
                  setSelectedCountryCode(countryCode);
                  setSelectedStateCode("");
                  setNewAddr((prev) => ({
                    ...prev,
                    country: countryObj ? countryObj.name : "",
                    state: "",
                    city: "",
                  }));
                  setTouched((prev) => ({ ...prev, country: true, state: true, city: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, country: true }))}
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] text-sm focus:outline-none transition cursor-pointer shadow-xs ${
                  touched.country && errors.country
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : touched.country && !errors.country && selectedCountryCode
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              >
                <option value="">Select Country</option>
                {allCountries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="h-5 mt-1 text-xs text-red-500 font-medium leading-5">
                {touched.country && errors.country ? errors.country : "\u00A0"}
              </div>
            </div>

            {/* State Select */}
            <div>
              <label className="block text-stone-700 text-xs font-semibold uppercase tracking-wider mb-1">
                State / Region <span className="text-red-500">*</span>
              </label>
              <select
                disabled={!selectedCountryCode}
                value={selectedStateCode}
                onChange={(e) => {
                  const stateCode = e.target.value;
                  const stateObj = availableStates.find((s) => s.isoCode === stateCode);
                  setSelectedStateCode(stateCode);
                  setNewAddr((prev) => ({
                    ...prev,
                    state: stateObj ? stateObj.name : "",
                    city: "",
                  }));
                  setTouched((prev) => ({ ...prev, state: true, city: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, state: true }))}
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] text-sm focus:outline-none transition cursor-pointer disabled:opacity-40 shadow-xs ${
                  touched.state && errors.state
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : touched.state && !errors.state && selectedStateCode
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              >
                <option value="">
                  {!selectedCountryCode ? "Select Country First" : "Select State / Region"}
                </option>
                {availableStates.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="h-5 mt-1 text-xs text-red-500 font-medium leading-5">
                {touched.state && errors.state ? errors.state : "\u00A0"}
              </div>
            </div>
          </div>

          {/* City & Postal Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* City Select */}
            <div>
              <label className="block text-stone-700 text-xs font-semibold uppercase tracking-wider mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <select
                disabled={!selectedStateCode}
                value={newAddr.city}
                onChange={(e) => {
                  setNewAddr({ ...newAddr, city: e.target.value });
                  setTouched((prev) => ({ ...prev, city: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] text-sm focus:outline-none transition cursor-pointer disabled:opacity-40 shadow-xs ${
                  touched.city && errors.city
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : touched.city && !errors.city && newAddr.city
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              >
                <option value="">
                  {!selectedStateCode ? "Select State First" : "Select City"}
                </option>
                {availableCities.length > 0 ? (
                  availableCities.map((ct) => (
                    <option key={ct.name} value={ct.name}>
                      {ct.name}
                    </option>
                  ))
                ) : selectedStateCode ? (
                  <option value={newAddr.state || "Capital Region"}>
                    {newAddr.state || "Capital Region"}
                  </option>
                ) : null}
              </select>
              <div className="h-5 mt-1 text-xs text-red-500 font-medium leading-5">
                {touched.city && errors.city ? errors.city : "\u00A0"}
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-stone-700 text-xs font-semibold uppercase tracking-wider">
                  Zip / Postal Code <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    (newAddr.postal_code || "").length >= 10
                      ? "text-red-600 font-bold"
                      : (newAddr.postal_code || "").length >= 8
                      ? "text-amber-600"
                      : "text-stone-400"
                  }`}
                >
                  {(newAddr.postal_code || "").length}/10
                </span>
              </div>
              <input
                type="text"
                maxLength={10}
                suppressHydrationWarning
                value={newAddr.postal_code}
                onChange={(e) => {
                  setNewAddr({ ...newAddr, postal_code: e.target.value.toUpperCase() });
                  setTouched((prev) => ({ ...prev, postal_code: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, postal_code: true }))}
                placeholder="e.g. 10001 or SW1A 1AA"
                className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-[#2C2A29] text-sm focus:outline-none transition font-mono shadow-xs ${
                  touched.postal_code && errors.postal_code
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : touched.postal_code && !errors.postal_code && newAddr.postal_code
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-[#D8D4CE] focus:border-[#1E3A5F]"
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-red-500 font-medium">
                  {touched.postal_code && errors.postal_code ? errors.postal_code : ""}
                </span>
                <span className="text-[11px] text-stone-400">Max 10 characters</span>
              </div>
            </div>
          </div>

            {/* Set Default Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="is_default"
                checked={newAddr.is_default}
                onChange={(e) => setNewAddr({ ...newAddr, is_default: e.target.checked })}
                className="w-4 h-4 rounded bg-[#FFFFFF] border-[#D8D4CE] text-[#1E3A5F] focus:ring-[#1E3A5F] cursor-pointer"
              />
              <label htmlFor="is_default" className="text-stone-700 text-xs cursor-pointer select-none">
                Set as default shipping address
              </label>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-[#DDD6C8] shrink-0 bg-[#F7F5F0]">
            <button
              type="button"
              onClick={onCancel}
              className="text-stone-600 hover:text-[#2C2A29] text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer hover:bg-[#ECE8DF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1E3A5F] hover:bg-[#152843] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              {editingAddrId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
