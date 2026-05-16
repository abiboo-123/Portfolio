import { z, type ZodError, type ZodTypeAny } from "zod";

export type ValidationFieldErrors<TField extends string = string> = Partial<
  Record<TField, string>
>;

export interface ValidationErrorResult<TField extends string = string> {
  success: false;
  error: string;
  fieldErrors: ValidationFieldErrors<TField>;
}

export interface ValidationSuccessResult<TData> {
  success: true;
  data: TData;
}

export type SchemaValidationResult<TData, TField extends string = string> =
  | ValidationSuccessResult<TData>
  | ValidationErrorResult<TField>;

export function getValidationFieldErrors<TField extends string = string>(
  error: ZodError
): ValidationFieldErrors<TField> {
  const { fieldErrors } = error.flatten();

  return Object.fromEntries(
    Object.entries(fieldErrors)
      .flatMap(([field, messages]) => {
        if (!Array.isArray(messages) || messages.length === 0) {
          return [];
        }

        const firstMessage = messages.find(
          (message): message is string => typeof message === "string"
        );

        return firstMessage ? [[field, firstMessage]] : [];
      })
  ) as ValidationFieldErrors<TField>;
}

export function validateSchema<
  TSchema extends ZodTypeAny,
  TField extends string = string
>(
  schema: TSchema,
  payload: unknown,
  errorMessage = "Validation failed."
): SchemaValidationResult<z.output<TSchema>, TField> {
  const result = schema.safeParse(payload);

  if (!result.success) {
    return {
      success: false,
      error: errorMessage,
      fieldErrors: getValidationFieldErrors<TField>(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
