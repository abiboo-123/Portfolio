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
import { deleteProject, updateProject } from "@/lib/services/admin";

export const PUT = withAdminRoute(
  "Update project error:",
  async (request, { params }: { params: { id: string } }) => {
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

    const project = await updateProject(params.id, validation.data);
    return apiSuccess(project);
  }
);

export const DELETE = withAdminRoute(
  "Delete project error:",
  async (_request, { params }: { params: { id: string } }) => {
    const result = await deleteProject(params.id);
    return apiSuccess(result);
  }
);
