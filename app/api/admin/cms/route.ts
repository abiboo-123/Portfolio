import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { withAdminRoute } from "@/lib/services/admin-auth";
import { getCmsAdminData, saveCmsAdminData } from "@/lib/services/admin";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import { cmsPayloadSchema, type CmsPayloadField } from "@/lib/validation/schemas";

export const GET = withAdminRoute("Fetch CMS content error:", async () => {
  const data = await getCmsAdminData();
  return apiSuccess(data);
});

export const PUT = withAdminRoute("Save CMS content error:", async (request) => {
  const body = await readJsonBody(request);
  if (body === null) {
    return apiInvalidRequest();
  }

  const validation = validateSchema<typeof cmsPayloadSchema, CmsPayloadField>(
    cmsPayloadSchema,
    body,
    "Validation failed."
  );

  if (!validation.success) {
    return apiValidationError(validation);
  }

  const data = await saveCmsAdminData(validation.data);
  return apiSuccess(data);
});
