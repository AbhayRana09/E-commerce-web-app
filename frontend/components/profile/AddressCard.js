"use client";

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  return (
    <div
      className={`relative bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition flex flex-col justify-between ${
        address.is_default ? "border-indigo-500/80 bg-indigo-950/10" : "border-slate-800"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-sm truncate">
            {address.street}
          </h3>
          {address.is_default && (
            <span className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Default
            </span>
          )}
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-slate-400 text-xs">{address.country}</p>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
          >
            Set as Default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="text-slate-300 hover:text-white font-medium transition cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
