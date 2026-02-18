import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { validateContactForm, hasValidationErrors } from "@/lib/contact/validation";
import { sanitizeContactInput } from "@/lib/contact/sanitize";
import { isRateLimited } from "@/lib/rate-limit";
import type { ContactFormInput, ContactApiResponse } from "@/lib/contact/types";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  if (realIp) return realIp.trim();
  return "unknown";
}

async function getRequestBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function parseBody(body: unknown): ContactFormInput | null {
  if (body === null || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  return {
    full_name: typeof o.full_name === "string" ? o.full_name : "",
    email: typeof o.email === "string" ? o.email : "",
    subject: typeof o.subject === "string" ? o.subject : "",
    message: typeof o.message === "string" ? o.message : "",
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ContactApiResponse>> {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  if (request.headers.get("content-type")?.toLowerCase().includes("application/json") === false) {
    return NextResponse.json(
      { success: false, error: "Content-Type must be application/json." },
      { status: 400 }
    );
  }

  const rawBody = await getRequestBody(request);
  const parsed = parseBody(rawBody);
  if (!parsed) {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const fieldErrors = validateContactForm(parsed);
  if (hasValidationErrors(fieldErrors)) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed. Please check the form.",
        fieldErrors,
      },
      { status: 400 }
    );
  }

  const sanitized = sanitizeContactInput(parsed);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contact_messages").insert({
      full_name: sanitized.full_name,
      email: sanitized.email,
      subject: sanitized.subject,
      message: sanitized.message,
      status: "new",
      ip_address: ip,
      user_agent: userAgent.slice(0, 500),
    });

    if (error) {
      console.error("[contact] Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
