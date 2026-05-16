import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/responses";
import { withAdminRoute } from "@/lib/services/admin-auth";
import { listContactMessages } from "@/lib/services/admin";

export const GET = withAdminRoute("Fetch messages error:", async (request) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const messages = await listContactMessages(status);
    return apiSuccess(messages);
  }
);
