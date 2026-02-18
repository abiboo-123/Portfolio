"use client";

import { useState, useCallback } from "react";
import type { ContactFormInput, ContactFormFieldErrors, ContactApiResponse } from "@/lib/contact/types";

const initialFormState: ContactFormInput = {
  full_name: "",
  email: "",
  subject: "",
  message: "",
};

const inputBaseClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-accent focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:bg-slate-600";
const inputErrorClass = "border-red-500 dark:border-red-500";

export function ContactForm() {
  const [form, setForm] = useState<ContactFormInput>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<ContactFormFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [globalError, setGlobalError] = useState<string>("");

  const updateField = useCallback(
    (field: keyof ContactFormInput, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
      if (status === "error" || status === "success") {
        setStatus("idle");
        setGlobalError("");
      }
    },
    [fieldErrors, status]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFieldErrors({});
      setGlobalError("");
      setStatus("loading");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: ContactApiResponse = await res.json().catch(() => ({
        success: false,
        error: "Invalid response from server.",
      }));

      if (!res.ok) {
        setStatus("error");
        setGlobalError(data.success === false ? data.error : "Something went wrong.");
        if (data.success === false && data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        return;
      }

      setStatus("success");
      setForm(initialFormState);
      setFieldErrors({});
    },
    [form]
  );

  return (
    <form className="mt-3 space-y-3" onSubmit={handleSubmit} noValidate>
      {status === "success" && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200"
          role="alert"
        >
          Thank you. Your message has been sent successfully.
        </div>
      )}
      {status === "error" && globalError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
          role="alert"
        >
          {globalError}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="contact-full_name"
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          Full Name
        </label>
        <input
          id="contact-full_name"
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={(e) => updateField("full_name", e.target.value)}
          className={`${inputBaseClass} ${fieldErrors.full_name ? inputErrorClass : ""}`}
          placeholder="Your full name"
          disabled={status === "loading"}
          autoComplete="name"
          aria-invalid={!!fieldErrors.full_name}
          aria-describedby={fieldErrors.full_name ? "contact-full_name-error" : undefined}
        />
        {fieldErrors.full_name && (
          <p id="contact-full_name-error" className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.full_name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-email"
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={`${inputBaseClass} ${fieldErrors.email ? inputErrorClass : ""}`}
          placeholder="you@example.com"
          disabled={status === "loading"}
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
        />
        {fieldErrors.email && (
          <p id="contact-email-error" className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-subject"
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          className={`${inputBaseClass} ${fieldErrors.subject ? inputErrorClass : ""}`}
          placeholder="e.g. Internship inquiry"
          disabled={status === "loading"}
          autoComplete="off"
          aria-invalid={!!fieldErrors.subject}
          aria-describedby={fieldErrors.subject ? "contact-subject-error" : undefined}
        />
        {fieldErrors.subject && (
          <p id="contact-subject-error" className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.subject}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={`${inputBaseClass} ${fieldErrors.message ? inputErrorClass : ""}`}
          placeholder="Tell me a bit about what you have in mind…"
          disabled={status === "loading"}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
        />
        {fieldErrors.message && (
          <p id="contact-message-error" className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white shadow-soft transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
