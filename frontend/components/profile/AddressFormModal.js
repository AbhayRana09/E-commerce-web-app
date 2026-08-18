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
      <DialogContent className="max-w-4xl sm:max-w-5xl w-[95vw] max-h-[90vh] p-6 sm:p-8 overflow-y-auto">
        <DialogHeader className="border-b border-slate-800 pb-3 mb-4 flex flex-row items-center justify-between text-left">
          <div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {editingAddrId ? "Edit Shipping Address" : "Add Shipping Address"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              Enter your full delivery details below
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-2 text-sm">
          {/* Street Address */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
              Street Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              suppressHydrationWarning
              value={newAddr.street}
              onChange={(e) => {
                setNewAddr({ ...newAddr, street: e.target.value });
                setTouched((prev) => ({ ...prev, street: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, street: true }))}
              placeholder="Street Address"
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition ${
                touched.street && errors.street
                  ? "border-red-500 focus:border-red-500 bg-red-950/10"
                  : touched.street && !errors.street
                  ? "border-emerald-500/80 focus:border-emerald-500"
                  : "border-slate-800 focus:border-indigo-500"
              }`}
            />
            <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
              {touched.street && errors.street ? errors.street : "\u00A0"}
            </div>
          </div>

          {/* Country & State Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Country Select */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Country <span className="text-red-400">*</span>
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
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition cursor-pointer ${
                  touched.country && errors.country
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.country && !errors.country && selectedCountryCode
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              >
                <option value="">Select Country</option>
                {allCountries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
                {touched.country && errors.country ? errors.country : "\u00A0"}
              </div>
            </div>

            {/* State Select */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                State / Region <span className="text-red-400">*</span>
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
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition cursor-pointer disabled:opacity-40 ${
                  touched.state && errors.state
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.state && !errors.state && selectedStateCode
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-slate-800 focus:border-indigo-500"
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
              <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
                {touched.state && errors.state ? errors.state : "\u00A0"}
              </div>
            </div>
          </div>

          {/* City & Postal Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* City Select */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                City <span className="text-red-400">*</span>
              </label>
              <select
                disabled={!selectedStateCode}
                value={newAddr.city}
                onChange={(e) => {
                  setNewAddr({ ...newAddr, city: e.target.value });
                  setTouched((prev) => ({ ...prev, city: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition cursor-pointer disabled:opacity-40 ${
                  touched.city && errors.city
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.city && !errors.city && newAddr.city
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-slate-800 focus:border-indigo-500"
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
              <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
                {touched.city && errors.city ? errors.city : "\u00A0"}
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Zip / Postal Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                suppressHydrationWarning
                value={newAddr.postal_code}
                onChange={(e) => {
                  setNewAddr({ ...newAddr, postal_code: e.target.value });
                  setTouched((prev) => ({ ...prev, postal_code: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, postal_code: true }))}
                placeholder="Zip / Postal Code"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition ${
                  touched.postal_code && errors.postal_code
                    ? "border-red-500 focus:border-red-500 bg-red-950/10"
                    : touched.postal_code && !errors.postal_code && newAddr.postal_code
                    ? "border-emerald-500/80 focus:border-emerald-500"
                    : "border-slate-800 focus:border-indigo-500"
                }`}
              />
              <div className="h-5 mt-1 text-xs text-red-400 font-medium leading-5">
                {touched.postal_code && errors.postal_code ? errors.postal_code : "\u00A0"}
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
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="is_default" className="text-slate-300 text-xs cursor-pointer select-none">
              Set as default shipping address
            </label>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {editingAddrId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
