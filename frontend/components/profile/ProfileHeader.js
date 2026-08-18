"use client";

export default function ProfileHeader({ user }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl sm:text-3xl shadow-lg shadow-indigo-600/10">
          {(user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            {user?.email_verified && (
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                ✓ Verified Account
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{user?.email}</p>
        </div>
      </div>

      <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0 w-full sm:w-auto">
        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold block mb-1">
          Account Status
        </span>
        <div className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Active Member
        </div>
      </div>
    </div>
  );
}
