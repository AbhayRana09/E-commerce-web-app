"use client";

export default function AddressCard({ address, onEdit, onDelete, onSetDefault, onUnsetDefault }) {
  return (
    <div
      className={`relative bg-[#FFFFFF] border rounded-2xl p-5 shadow-xs transition flex flex-col justify-between ${
        address.is_default ? "border-[#1E3A5F] ring-1 ring-[#1E3A5F]" : "border-[#D8D4CE]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-[#2C2A29] font-semibold text-sm break-words [overflow-wrap:anywhere] min-w-0">
            {address.street}
          </h3>
          {address.is_default && (
            <span className="bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 text-[#1E3A5F] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              Default
            </span>
          )}
        </div>
        <p className="text-stone-600 text-xs leading-relaxed break-words [overflow-wrap:anywhere]">
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-stone-600 text-xs break-words [overflow-wrap:anywhere]">{address.country}</p>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#DDD6C8] text-xs">
        {!address.is_default ? (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-[#1E3A5F] hover:text-[#152843] font-medium transition cursor-pointer"
          >
            Set as Default
          </button>
        ) : (
          <button
            onClick={() => onUnsetDefault(address.id)}
            className="text-amber-700 hover:text-amber-800 font-medium transition cursor-pointer"
          >
            Remove from Default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="text-stone-700 hover:text-[#2C2A29] font-medium transition cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="text-red-600 hover:text-red-700 font-medium transition cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
