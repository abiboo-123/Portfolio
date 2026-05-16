import { NextRequest } from "next/server";
import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  projectSectionCreateSchema,
  type ProjectSectionField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import { createProjectSection } from "@/lib/services/admin";

export const POST = withAdminRoute(
  "Create section error:",
  async (request, { params }: { params: { id: string } }) => {
    const body = await readJsonBody(request);
    if (body === null) {
      return apiInvalidRequest();
    }

    const validation = validateSchema<
      typeof projectSectionCreateSchema,
      ProjectSectionField
    >(projectSectionCreateSchema, body);

    if (!validation.success) {
      return apiValidationError(validation);
    }

    const section = await createProjectSection(params.id, validation.data);
    return apiSuccess(section, 201);
  }
);
