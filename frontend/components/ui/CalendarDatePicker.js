"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CalendarDatePicker({
  label,
  value, // String in "YYYY-MM-DD"
  onChange, // Callback returning "YYYY-MM-DD" string
  minDate, // String in "YYYY-MM-DD" or Date object
  error,
  required = false,
  placeholder = "Select date",
}) {
  // Convert "YYYY-MM-DD" string safely to Date without timezone shifts
  const parseDateString = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const selectedDate = parseDateString(value);
  const minDateObj = typeof minDate === "string" ? parseDateString(minDate) : minDate;

  const handleDateChange = (date) => {
    if (!date) {
      onChange("");
      return;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
  };

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block text-slate-300 font-semibold text-xs sm:text-sm mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          minDate={minDateObj}
          dateFormat="MMM dd, yyyy"
          placeholderText={placeholder}
          className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition cursor-pointer ${
            error
              ? "border-red-500/80 focus:border-red-500 ring-1 ring-red-500/30"
              : "border-slate-800 focus:border-indigo-500"
          }`}
          wrapperClassName="w-full"
          popperPlacement="bottom-start"
        />

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
