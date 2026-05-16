import { NextResponse } from "next/server";
import type {
  ValidationErrorResult,
  ValidationFieldErrors,
} from "@/lib/validation/helpers";
import { ServiceError } from "@/lib/services/errors";

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "invalid_request"
  | "validation_error"
  | "conflict"
  | "not_found"
  | "internal_error"
  | "bad_request";

export interface ApiSuccessResponse<TData> {
  success: true;
  data: TData;
}

export interface ApiErrorBody<TField extends string = string> {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: ValidationFieldErrors<TField>;
}

export interface ApiErrorResponse<TField extends string = string> {
  success: false;
  error: ApiErrorBody<TField>;
}

export type ApiRouteResponse<TData, TField extends string = string> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse<TField>;

export function apiSuccess<TData>(
  data: TData,
  status = 200
): NextResponse<ApiSuccessResponse<TData>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function apiError<TField extends string = string>(
  code: ApiErrorCode,
  message: string,
  status: number,
  fieldErrors?: ValidationFieldErrors<TField>
): NextResponse<ApiErrorResponse<TField>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    { status }
  );
}

export function apiInvalidRequest(
  message = "Invalid request body."
): NextResponse<ApiErrorResponse> {
  return apiError("invalid_request", message, 400);
}

export function apiValidationError<TField extends string = string>(
  validation: ValidationErrorResult<TField>
): NextResponse<ApiErrorResponse<TField>> {
  return apiError(
    "validation_error",
    validation.error,
    400,
    validation.fieldErrors
  );
}

export function apiErrorFromService(
  error: ServiceError
): NextResponse<ApiErrorResponse> {
  const code = getErrorCodeForStatus(error.status);
  return apiError(code, error.message, error.status);
}

function getErrorCodeForStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    default:
      return "internal_error";
  }
}
