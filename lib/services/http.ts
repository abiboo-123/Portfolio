import { ServiceError } from "./errors";
import { apiError, apiErrorFromService } from "@/lib/api/responses";

export function handleServiceError(error: unknown, logLabel: string) {
  console.error(logLabel, error);

  if (error instanceof ServiceError) {
    return apiErrorFromService(error);
  }

  return apiError("internal_error", "Internal server error", 500);
}
