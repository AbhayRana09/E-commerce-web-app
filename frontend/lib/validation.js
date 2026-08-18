/**
 * Shared Validation Rules & Regex Patterns
 */

// Shared Regex Patterns
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
export const WHITESPACE_ABUSE_REGEX = /^\s|\s$|\s{2,}/;

/**
 * Validates First Name
 * - Required
 * - No leading, trailing, or 2+ consecutive spaces
 * - Length: 2 - 50 characters
 * - Only alphabetic characters and single spaces
 */
export function validateFirstName(name) {
  if (!name || name.trim().length === 0) {
    return "First name is required.";
  }
  if (WHITESPACE_ABUSE_REGEX.test(name)) {
    return "No leading, trailing, or consecutive spaces allowed.";
  }
  if (!NAME_REGEX.test(name)) {
    return "First name can only contain letters.";
  }
  if (name.length < 2 || name.length > 50) {
    return "First name must be between 2 and 50 characters.";
  }
  return "";
}

/**
 * Validates Last Name
 * - Required
 * - No leading, trailing, or 2+ consecutive spaces
 * - Length: 1 - 50 characters
 * - Only alphabetic characters and single spaces
 */
export function validateLastName(name) {
  if (!name || name.trim().length === 0) {
    return "Last name is required.";
  }
  if (WHITESPACE_ABUSE_REGEX.test(name)) {
    return "No leading, trailing, or consecutive spaces allowed.";
  }
  if (!NAME_REGEX.test(name)) {
    return "Last name can only contain letters.";
  }
  if (name.length < 1 || name.length > 50) {
    return "Last name must be between 1 and 50 characters.";
  }
  return "";
}

/**
 * Validates Full Name
 * - Required
 * - Length: 3 - 100 characters
 * - Only letters and single spaces allowed
 * - No whitespace abuse
 */
export function validateFullName(name) {
  if (!name || name.trim().length === 0) {
    return "Full name is required.";
  }
  if (WHITESPACE_ABUSE_REGEX.test(name)) {
    return "No leading, trailing, or consecutive spaces allowed.";
  }
  if (!NAME_REGEX.test(name)) {
    return "Full name can only contain letters and single spaces.";
  }
  if (name.length < 3 || name.length > 100) {
    return "Full name must be between 3 and 100 characters.";
  }
  return "";
}

/**
 * Validates Email Address
 * - Required
 * - Must match valid email regex (trimmed and lowercase)
 */
export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return "Email address is required.";
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return "Please enter a valid email address (e.g. user@example.com).";
  }
  return "";
}

/**
 * Validates Password Complexity
 * - Required
 * - Minimum 8 characters
 * - At least 1 uppercase letter, 1 lowercase letter, 1 digit
 */
export function validatePassword(password) {
  if (!password || password.length === 0) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must include at least 1 lowercase letter (a-z).";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must include at least 1 uppercase letter (A-Z).";
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Password must include at least 1 number (0-9).";
  }
  return "";
}

/**
 * Validates Password Presence (for login / simple presence)
 */
export function validatePasswordPresence(password) {
  if (!password || password.length === 0) {
    return "Password is required.";
  }
  return "";
}

/**
 * Validates Confirm Password
 * - Required
 * - Must strictly match target password
 */
export function validateConfirmPassword(confirmPassword, targetPassword) {
  if (!confirmPassword || confirmPassword.length === 0) {
    return "Confirm password is required.";
  }
  if (confirmPassword !== targetPassword) {
    return "Passwords do not match.";
  }
  return "";
}

/**
 * Validates Profile Image MIME Type
 */
export function validateProfileImage(file) {
  if (!file) return "";
  if (!file.type || !file.type.startsWith("image/")) {
    return "Only image files (JPEG, PNG, WEBP, etc.) are allowed.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Image size cannot exceed 5MB.";
  }
  return "";
}

/**
 * Helper to auto-focus the first invalid input element in a form
 * @param {Record<string, string>} errors - Object containing field error strings
 * @param {Record<string, HTMLElement | null>} fieldRefs - Map of field name to DOM element
 */
export function autoFocusFirstError(errors, fieldRefs) {
  for (const [field, errorMsg] of Object.entries(errors)) {
    if (errorMsg && fieldRefs[field]) {
      const el = fieldRefs[field];
      if (typeof el?.focus === "function") {
        el.focus();
      }
      break;
    }
  }
}
