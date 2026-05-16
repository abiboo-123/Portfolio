import { NextRequest, NextResponse } from "next/server";
import { sanitizeContactInput } from "@/lib/contact/sanitize";
import { isRateLimited } from "@/lib/rate-limit";
import type { ContactApiResponse } from "@/lib/contact/types";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  contactFormSchema,
  type ContactFormField,
} from "@/lib/validation/schemas";
import { createContactMessage } from "@/lib/services/contact";
import { ServiceError } from "@/lib/services/errors";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  if (realIp) return realIp.trim();
  return "unknown";
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

  const rawBody = await readJsonBody(request);
  if (rawBody === null) {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const validation = validateSchema<typeof contactFormSchema, ContactFormField>(
    contactFormSchema,
    rawBody,
    "Validation failed. Please check the form."
  );

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: validation.error,
        fieldErrors: validation.fieldErrors,
      },
      { status: 400 }
    );
  }

  const sanitized = sanitizeContactInput(validation.data);
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const result = await createContactMessage({
      form: sanitized,
      ipAddress: ip,
      userAgent,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    if (err instanceof ServiceError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
