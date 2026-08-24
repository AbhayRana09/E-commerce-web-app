"use client";

export default function ProfileHeader({ user, onOpenEditProfile, onOpenChangePassword }) {
  const isSuperAdmin = user?.role === "ADMIN";

  return (
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 min-w-0">
        {/* User Identity Info */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0 flex-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 flex items-center justify-center text-[#1E3A5F] font-bold text-2xl sm:text-3xl shadow-xs shrink-0">
            {(user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#2C2A29] tracking-tight break-words [overflow-wrap:anywhere]">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-stone-600 text-sm font-medium truncate max-w-full">{user?.email}</p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {user?.is_verified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  ✓ EMAIL VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  UNVERIFIED EMAIL
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  isSuperAdmin
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-[#1E3A5F]/10 border-[#1E3A5F]/20 text-[#1E3A5F]"
                }`}
              >
                Role: {isSuperAdmin ? "Admin" : "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Account Status / Role Indicator */}
        <div className="text-left sm:text-right border-t sm:border-t-0 border-[#DDD6C8] pt-3 sm:pt-0 w-full sm:w-auto shrink-0">
          <span className="text-stone-500 text-[11px] uppercase tracking-wider font-semibold block mb-1">
            Account Status
          </span>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              isSuperAdmin
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-[#FFFFFF] border-[#D8D4CE] text-[#2C2A29] shadow-xs"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isSuperAdmin ? "bg-amber-600" : "bg-emerald-600"
              }`}
            ></span>
            {isSuperAdmin ? "Administrator" : "Active User"}
          </div>
        </div>
      </div>

      {/* Profile Action Buttons */}
      <div className="pt-4 border-t border-[#DDD6C8] flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onOpenEditProfile}
          className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#152843] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <span>✏️</span> Edit Profile
        </button>
        <button
          type="button"
          onClick={onOpenChangePassword}
          className="flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
        >
          <span>🔑</span> Change Password
        </button>
      </div>
    </div>
  );
}
