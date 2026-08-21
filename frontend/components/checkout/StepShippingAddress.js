"use client";

export default function StepShippingAddress({
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  loadingAddresses,
  onOpenAddModal,
  onOpenEditModal,
  user,
  onContinue,
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Select Shipping Address</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose an existing delivery destination or add a new verified address.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Address</span>
        </button>
      </div>

      {loadingAddresses ? (
        <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading saved addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-16 text-center bg-slate-950/60 rounded-3xl border border-slate-800/80 p-8 space-y-4">
          <p className="text-sm text-slate-400">You don&apos;t have any saved delivery addresses yet.</p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            + Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={`p-5 rounded-3xl border transition cursor-pointer relative flex flex-col justify-between min-w-0 overflow-hidden ${
                  isSelected
                    ? "bg-indigo-950/30 border-indigo-500 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500/50"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-200 truncate">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {addr.is_default && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                          DEFAULT
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => onOpenEditModal(addr, e)}
                        className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
                        title="Edit this address"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {addr.street} <br />
                    {addr.city}, {addr.state} {addr.postal_code} <br />
                    {addr.country}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center gap-2.5 min-w-0">
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={isSelected}
                    onChange={() => onSelectAddress(addr.id)}
                    className="text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {isSelected ? "Deliver to this address" : "Select this address"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-5 border-t border-slate-800">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedAddressId}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold px-7 py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Continue to Order Review</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
