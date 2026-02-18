/**
 * Contact form input shape (client → API).
 */
export interface ContactFormInput {
  full_name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Field-level validation errors for the contact form.
 */
export interface ContactFormFieldErrors {
  full_name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * Successful API response.
 */
export interface ContactApiSuccess {
  success: true;
}

/**
 * Error API response with optional field-level errors.
 */
export interface ContactApiError {
  success: false;
  error: string;
  fieldErrors?: ContactFormFieldErrors;
}

export type ContactApiResponse = ContactApiSuccess | ContactApiError;
