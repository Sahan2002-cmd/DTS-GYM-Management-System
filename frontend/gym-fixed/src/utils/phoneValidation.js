// ============================================================
//  phoneValidation.js — Reusable phone validation helpers
//  Phone must be exactly 10 digits (Sri Lanka standard)
//  Place in: src/utils/phoneValidation.js
// ============================================================

/**
 * Returns true if the phone number is exactly 10 digits
 * Strips spaces/dashes before checking
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // optional field
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  return /^\d{10}$/.test(digits);
};

/**
 * Formats phone input: only allows digits, max 10
 */
export const formatPhoneInput = (value) => {
  return value.replace(/\D/g, '').slice(0, 10);
};

/**
 * Returns an error string or empty string
 */
export const phoneError = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  if (digits.length > 0 && digits.length < 10) return 'Phone number must be 10 digits';
  if (digits.length > 10) return 'Phone number cannot exceed 10 digits';
  if (!/^\d+$/.test(digits)) return 'Phone number must contain only digits';
  return '';
};