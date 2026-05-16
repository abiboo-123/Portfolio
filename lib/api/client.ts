import type {
  ApiErrorResponse,
  ApiRouteResponse,
  ApiSuccessResponse,
} from "./responses";

function getErrorMessage(
  payload: unknown,
  fallbackMessage: string
): string {
  if (!payload || typeof payload !== "object") {
    return fallbackMessage;
  }

  if (
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return fallbackMessage;
}

export async function parseAdminApiResponse<TData>(
  response: Response,
  fallbackMessage: string
): Promise<TData> {
  const payload = (await response.json().catch(() => null)) as
    | ApiRouteResponse<TData>
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, fallbackMessage));
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    payload.success === true &&
    "data" in payload
  ) {
    return (payload as ApiSuccessResponse<TData>).data;
  }

  throw new Error(fallbackMessage);
}
