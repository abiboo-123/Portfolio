import { NextRequest } from "next/server";
import { apiSuccess, apiValidationError } from "@/lib/api/responses";
import { validateSchema } from "@/lib/validation/helpers";
import {
  uploadPayloadSchema,
  type UploadField,
} from "@/lib/validation/schemas";
import { withAdminRoute } from "@/lib/services/admin-auth";
import { uploadPortfolioImage } from "@/lib/services/admin";

export const POST = withAdminRoute("Upload error:", async (request) => {
    const formData = await request.formData();
    const validation = validateSchema<typeof uploadPayloadSchema, UploadField>(
      uploadPayloadSchema,
      {
        file: formData.get("file"),
        type: formData.get("type"),
        projectId: formData.get("projectId"),
      },
      "Validation failed."
    );

    if (!validation.success) {
      return apiValidationError(validation);
    }

    const result = await uploadPortfolioImage(validation.data);
    return apiSuccess(result, 201);
  }
);
