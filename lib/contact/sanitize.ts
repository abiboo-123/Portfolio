import type { ContactFormInput } from "./types";

/**
 * Sanitizes a string for safe storage: trim and strip control characters.
 * Does not escape HTML (handled by React by default when displaying).
 */
export function sanitizeString(value: string, maxLength: number = 2000): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  const withoutControlChars = trimmed.replace(/[\x00-\x1f\x7f]/g, "");
  return withoutControlChars.slice(0, maxLength);
}

const MAX_LENGTHS: Record<keyof ContactFormInput, number> = {
  full_name: 500,
  email: 500,
  subject: 500,
  message: 10000,
};

export function sanitizeContactInput(input: ContactFormInput): ContactFormInput {
  return {
    full_name: sanitizeString(input.full_name, MAX_LENGTHS.full_name),
    email: sanitizeString(input.email, MAX_LENGTHS.email),
    subject: sanitizeString(input.subject, MAX_LENGTHS.subject),
    message: sanitizeString(input.message, MAX_LENGTHS.message),
  };
}
