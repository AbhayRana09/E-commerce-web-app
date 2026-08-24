"use client";

export default function CalendarDatePicker({
  label,
  value, // String in "YYYY-MM-DD"
  onChange, // Callback returning "YYYY-MM-DD" string
  minDate, // String in "YYYY-MM-DD"
  error,
  required = false,
  placeholder = "Select date",
}) {
  const minDateStr =
    minDate instanceof Date
      ? minDate.toISOString().split("T")[0]
      : minDate || undefined;

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block text-stone-700 font-semibold text-xs sm:text-sm mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <input
          type="date"
          value={value || ""}
          min={minDateStr}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2C2A29] focus:outline-none transition cursor-pointer scheme-light shadow-xs ${
            error
              ? "border-red-500 focus:border-red-500 bg-red-50"
              : "border-[#D8D4CE] focus:border-[#1E3A5F]"
          }`}
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
