import { NextRequest } from "next/server";
import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  projectImageUpdateSchema,
  type ProjectImageField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import {
  deleteProjectImage,
  updateProjectImage,
} from "@/lib/services/admin";

export const PUT = withAdminRoute(
  "Update image error:",
  async (
    request,
    { params }: { params: { id: string; imageId: string } }
  ) => {
    const body = await readJsonBody(request);
    if (body === null) {
      return apiInvalidRequest();
    }

    const validation = validateSchema<
      typeof projectImageUpdateSchema,
      ProjectImageField
    >(projectImageUpdateSchema, body);

    if (!validation.success) {
      return apiValidationError(validation);
    }

    const image = await updateProjectImage(
      params.id,
      params.imageId,
      validation.data
    );
    return apiSuccess(image);
  }
);

export const DELETE = withAdminRoute(
  "Delete image error:",
  async (_request, { params }: { params: { id: string; imageId: string } }) => {
    const result = await deleteProjectImage(params.id, params.imageId);
    return apiSuccess(result);
  }
);
