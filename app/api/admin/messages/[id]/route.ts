import { NextRequest } from "next/server";
import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  messageStatusUpdateSchema,
  type MessageStatusField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import { updateContactMessageStatus } from "@/lib/services/admin";

export const PUT = withAdminRoute(
  "Update message error:",
  async (request, { params }: { params: { id: string } }) => {
    const body = await readJsonBody(request);
    if (body === null) {
      return apiInvalidRequest();
    }

    const validation = validateSchema<
      typeof messageStatusUpdateSchema,
      MessageStatusField
    >(messageStatusUpdateSchema, body, "Validation failed.");

    if (!validation.success) {
      return apiValidationError(validation);
    }

    const message = await updateContactMessageStatus(params.id, validation.data);
    return apiSuccess(message);
  }
);
