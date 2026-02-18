import type { ContactFormInput, ContactFormFieldErrors } from "./types";

/** RFC 5322–style email regex (practical subset). */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const MIN_FULL_NAME_LENGTH = 2;
const MIN_MESSAGE_LENGTH = 10;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/**
 * Validates contact form input and returns field-level errors.
 * Returns an empty object when valid.
 */
export function validateContactForm(
  input: ContactFormInput
): ContactFormFieldErrors {
  const errors: ContactFormFieldErrors = {};
  const name = (input.full_name ?? "").trim();
  const email = (input.email ?? "").trim();
  const message = (input.message ?? "").trim();

  if (name.length < MIN_FULL_NAME_LENGTH) {
    errors.full_name =
      name.length === 0
        ? "Full name is required."
        : `Full name must be at least ${MIN_FULL_NAME_LENGTH} characters.`;
  }

  if (email.length === 0) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (message.length < MIN_MESSAGE_LENGTH) {
    errors.message =
      message.length === 0
        ? "Message is required."
        : `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`;
  }

  return errors;
}

export function hasValidationErrors(
  errors: ContactFormFieldErrors
): boolean {
  return Object.keys(errors).length > 0;
}
