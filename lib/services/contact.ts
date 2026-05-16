import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ContactFormInput } from "@/lib/contact/types";
import { ServiceError } from "./errors";

interface CreateContactMessageInput {
  form: ContactFormInput;
  ipAddress: string;
  userAgent: string;
}

export async function createContactMessage({
  form,
  ipAddress,
  userAgent,
}: CreateContactMessageInput) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("contact_messages").insert({
    full_name: form.full_name,
    email: form.email,
    subject: form.subject,
    message: form.message,
    status: "new",
    ip_address: ipAddress,
    user_agent: userAgent.slice(0, 500),
  });

  if (error) {
    throw new ServiceError("Failed to send message. Please try again.");
  }

  return { success: true as const };
}
