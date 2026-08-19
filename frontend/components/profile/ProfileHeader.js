"use client";

export default function ProfileHeader({ user, onOpenEditProfile, onOpenChangePassword }) {
  const isSuperAdmin = user?.role === "ADMIN";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* User Identity Info */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-2xl sm:text-3xl shadow-lg shadow-indigo-600/10 shrink-0">
            {(user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-slate-400 text-sm font-medium">{user?.email}</p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {user?.is_verified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ✓ EMAIL VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  UNVERIFIED EMAIL
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isSuperAdmin
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                }`}
              >
                Role: {isSuperAdmin ? "Admin" : "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Account Status / Role Indicator */}
        <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto">
          <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold block mb-1">
            Account Status
          </span>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              isSuperAdmin
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isSuperAdmin ? "bg-amber-400" : "bg-emerald-400"
              }`}
            ></span>
            {isSuperAdmin ? "Administrator" : "Active User"}
          </div>
        </div>
      </div>

      {/* Profile Action Buttons */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onOpenEditProfile}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <span>✏️</span> Edit Profile
        </button>
        <button
          type="button"
          onClick={onOpenChangePassword}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <span>🔑</span> Change Password
        </button>
      </div>
    </div>
  );
}
