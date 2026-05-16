import { NextRequest } from "next/server";
import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  projectSectionUpdateSchema,
  type ProjectSectionField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import {
  deleteProjectSection,
  updateProjectSection,
} from "@/lib/services/admin";

export const PUT = withAdminRoute(
  "Update section error:",
  async (
    request,
    { params }: { params: { id: string; sectionId: string } }
  ) => {
    const body = await readJsonBody(request);
    if (body === null) {
      return apiInvalidRequest();
    }

    const validation = validateSchema<
      typeof projectSectionUpdateSchema,
      ProjectSectionField
    >(projectSectionUpdateSchema, body);

    if (!validation.success) {
      return apiValidationError(validation);
    }

    const section = await updateProjectSection(
      params.id,
      params.sectionId,
      validation.data
    );
    return apiSuccess(section);
  }
);

export const DELETE = withAdminRoute(
  "Delete section error:",
  async (_request, { params }: { params: { id: string; sectionId: string } }) => {
    const result = await deleteProjectSection(params.id, params.sectionId);
    return apiSuccess(result);
  }
);
