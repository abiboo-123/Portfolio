import { getValidationFieldErrors } from "@/lib/validation/helpers";
import { contactFormSchema } from "@/lib/validation/schemas";
import type { ContactFormFieldErrors, ContactFormInput } from "./types";

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function validateContactForm(
  input: ContactFormInput
): ContactFormFieldErrors {
  const result = contactFormSchema.safeParse(input);

  if (result.success) {
    return {};
  }

  return getValidationFieldErrors<keyof ContactFormInput>(result.error);
}

export function hasValidationErrors(errors: ContactFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
