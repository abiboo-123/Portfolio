import { NextRequest } from "next/server";
import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  projectPayloadSchema,
  type ProjectPayloadField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import { createProject } from "@/lib/services/admin";

export const POST = withAdminRoute("Create project error:", async (request) => {
    const body = await readJsonBody(request);
    if (body === null) {
      return apiInvalidRequest();
    }

    const validation = validateSchema<
      typeof projectPayloadSchema,
      ProjectPayloadField
    >(projectPayloadSchema, body);

    if (!validation.success) {
      return apiValidationError(validation);
    }

    const project = await createProject(validation.data);
    return apiSuccess(project, 201);
  }
);
