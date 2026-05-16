import { NextRequest } from "next/server";
import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  projectImageCreateSchema,
  type ProjectImageField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import { createProjectImage } from "@/lib/services/admin";

export const POST = withAdminRoute(
  "Create image error:",
  async (request, { params }: { params: { id: string } }) => {
    const body = await readJsonBody(request);
    if (body === null) {
      return apiInvalidRequest();
    }

    const validation = validateSchema<
      typeof projectImageCreateSchema,
      ProjectImageField
    >(projectImageCreateSchema, body);

    if (!validation.success) {
      return apiValidationError(validation);
    }

    const image = await createProjectImage(params.id, validation.data);
    return apiSuccess(image, 201);
  }
);
