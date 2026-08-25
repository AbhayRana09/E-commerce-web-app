"use client";

import { ArrowRight } from "lucide-react";

export default function StepShippingAddress({
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  loadingAddresses,
  onOpenAddModal,
  onEditAddress,
  user,
  onContinue,
}) {
  return (
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DDD6C8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2A29]">Select Shipping Address</h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Choose an existing delivery destination or add a new verified address.
          </p>
          <div className="mt-3.5">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#1E3A5F] border border-[#D8D4CE] text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer w-fit"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span>Add New Address</span>
            </button>
          </div>
        </div>

        {/* Fitted Continue Button in Header (replacing previous Add Address position) */}
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedAddressId}
          className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-40 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 self-start sm:self-center"
        >
          <span>Continue to Order Summary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {loadingAddresses ? (
        <div className="py-12 text-center text-stone-500 text-sm flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading saved addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFFFF] rounded-3xl border border-[#D8D4CE] p-8 space-y-4 shadow-xs">
          <p className="text-sm text-stone-600">You don&apos;t have any saved delivery addresses yet.</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="bg-[#1E3A5F] hover:bg-[#152843] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            + Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={`p-5 rounded-3xl border transition cursor-pointer relative flex flex-col justify-between min-w-0 overflow-hidden ${isSelected
                    ? "bg-[#FFFFFF] border-[#1E3A5F] shadow-xs ring-1 ring-[#1E3A5F]"
                    : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-stone-400"
                  }`}
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#2C2A29] truncate">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {addr.is_default && (
                        <span className="text-[10px] bg-[#1E3A5F]/10 text-[#1E3A5F] font-bold px-2 py-0.5 rounded-full border border-[#1E3A5F]/20">
                          DEFAULT
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAddress(addr);
                        }}
                        className="text-xs text-stone-600 hover:text-[#2C2A29] bg-[#ECE8DF] hover:bg-[#DDD6C8] px-2.5 py-1 rounded-lg border border-[#DDD6C8] transition cursor-pointer"
                        title="Edit this address"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {addr.street} <br />
                    {addr.city}, {addr.state} {addr.postal_code} <br />
                    {addr.country}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#DDD6C8] flex items-center gap-2.5 min-w-0">
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={isSelected}
                    onChange={() => onSelectAddress(addr.id)}
                    className="text-[#1E3A5F] focus:ring-0 w-4 h-4 cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-semibold text-[#2C2A29] truncate">
                    {isSelected ? "Deliver to this address" : "Select this address"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
