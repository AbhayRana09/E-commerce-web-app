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
 * - Length: 2 - 30 characters
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
  if (name.length < 2 || name.length > 30) {
    return "First name must be between 2 and 30 characters.";
  }
  return "";
}

/**
 * Validates Last Name
 * - Required
 * - No leading, trailing, or 2+ consecutive spaces
 * - Length: 1 - 30 characters
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
  if (name.length < 1 || name.length > 30) {
    return "Last name must be between 1 and 30 characters.";
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
 * Validates Product / Profile Image MIME Type and Size (Max 5MB)
 */
export function validateProfileImage(file) {
  if (!file) return "";
  if (!file.type || !file.type.startsWith("image/")) {
    return "Only image files (JPEG, PNG, WEBP, GIF, etc.) are allowed.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Image size cannot exceed 5MB.";
  }
  return "";
}

export const validateProductImage = validateProfileImage;

/**
 * Validates Category Name
 * - Required
 * - Length: 2 - 30 characters
 */
export function validateCategoryName(name) {
  if (!name || name.trim().length === 0) {
    return "Category name is required.";
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return "Category name must be at least 2 characters.";
  }
  if (trimmed.length > 30) {
    return "Category name cannot exceed 30 characters.";
  }
  return "";
}

/**
 * Validates Category Description
 * - Optional
 * - Max length: 300 characters
 */
export function validateCategoryDescription(desc) {
  if (!desc) return "";
  if (desc.trim().length > 300) {
    return "Description cannot exceed 300 characters.";
  }
  return "";
}

/**
 * Validates Product Name
 * - Required
 * - Length: 2 - 120 characters
 */
export function validateProductName(name) {
  if (!name || name.trim().length === 0) {
    return "Product name is required.";
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return "Product name must be at least 2 characters.";
  }
  if (trimmed.length > 120) {
    return "Product name cannot exceed 120 characters.";
  }
  return "";
}

/**
 * Validates Product Description
 * - Required
 * - Length: 5 - 2000 characters
 */
export function validateProductDescription(desc) {
  if (!desc || desc.trim().length === 0) {
    return "Product description is required.";
  }
  const trimmed = desc.trim();
  if (trimmed.length < 5) {
    return "Product description must be at least 5 characters.";
  }
  if (trimmed.length > 2000) {
    return "Product description cannot exceed 2000 characters.";
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

