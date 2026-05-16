import { z } from "zod";
import {
  apiInvalidRequest,
  apiSuccess,
  apiValidationError,
} from "@/lib/api/responses";
import { readJsonBody, validateSchema } from "@/lib/validation/helpers";
import {
  uploadPayloadSchema,
  type UploadField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import {
  cleanupUploadedPortfolioAsset,
  uploadPortfolioAsset,
} from "@/lib/services/admin";

const cleanupUploadPayloadSchema = z.object({
  url: z.string().url("Uploaded asset URL must be a valid URL."),
});

type CleanupUploadField = Extract<keyof z.infer<typeof cleanupUploadPayloadSchema>, string>;

export const POST = withAdminRoute("Upload error:", async (request) => {
  const formData = await request.formData();
  const validation = validateSchema<typeof uploadPayloadSchema, UploadField>(
    uploadPayloadSchema,
    {
      file: formData.get("file"),
      type: formData.get("type"),
      projectId: formData.get("projectId"),
      assetKey: formData.get("assetKey"),
    },
    "Validation failed."
  );

  if (!validation.success) {
    return apiValidationError(validation);
  }

  const result = await uploadPortfolioAsset(validation.data);
  return apiSuccess(result, 201);
});

export const DELETE = withAdminRoute("Upload cleanup error:", async (request) => {
  const body = await readJsonBody(request);
  if (body === null) {
    return apiInvalidRequest();
  }

  const validation = validateSchema<
    typeof cleanupUploadPayloadSchema,
    CleanupUploadField
  >(cleanupUploadPayloadSchema, body, "Validation failed.");

  if (!validation.success) {
    return apiValidationError(validation);
  }

  const result = await cleanupUploadedPortfolioAsset(validation.data.url);
  return apiSuccess(result);
});
