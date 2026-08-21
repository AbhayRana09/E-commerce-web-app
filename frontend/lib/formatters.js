/**
 * Centralized formatting helpers for standardizing currency, date, and badge rendering across the application.
 */

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `$${num.toFixed(2)}`;
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  const defaultOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  };
  return date.toLocaleDateString("en-US", defaultOptions);
}

export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
