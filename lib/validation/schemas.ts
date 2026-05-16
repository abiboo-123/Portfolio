import { z } from "zod";

const practicalEmailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const projectSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const assetPathRegex = /^\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/;

function isValidAssetReference(value: string): boolean {
  return z.string().url().safeParse(value).success || assetPathRegex.test(value);
}

const requiredText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be at most ${maxLength} characters.`);

const optionalNullableText = (label: string, maxLength: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .refine(
      (value) => value.length <= maxLength,
      `${label} must be at most ${maxLength} characters.`
    )
    .transform((value) => (value.length > 0 ? value : null));

const optionalNullableUrl = (label: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .refine(
      (value) => value.length === 0 || isValidAssetReference(value),
      `${label} must be a valid URL or root-relative path.`
    )
    .transform((value) => (value.length > 0 ? value : null));

const nonNegativeOrderIndex = z
  .number()
  .int("Order index must be an integer.")
  .min(0, "Order index cannot be negative.");

const projectStatusSchema = z.enum([
  "planned",
  "in_progress",
  "completed",
  "archived",
]);

const projectSectionTypeSchema = z.enum(["text", "code", "image"]);

const messageStatusSchema = z.enum(["new", "read", "replied", "archived"]);

const imageFileSchema = z.custom<File>(
  (value): value is File => typeof File !== "undefined" && value instanceof File,
  {
    message: "No file provided.",
  }
);

export const contactFormSchema = z.object({
  full_name: requiredText("Full name", 500).min(
    2,
    "Full name must be at least 2 characters."
  ),
  email: requiredText("Email", 500).refine(
    (value) => practicalEmailRegex.test(value),
    "Please enter a valid email address."
  ),
  subject: optionalNullableText("Subject", 500).transform((value) => value ?? ""),
  message: requiredText("Message", 10000).min(
    10,
    "Message must be at least 10 characters."
  ),
});

export const projectPayloadSchema = z.object({
  title: requiredText("Title", 200),
  slug: requiredText("Slug", 200).regex(
    projectSlugRegex,
    "Slug must use lowercase letters, numbers, and hyphens only."
  ),
  short_description: requiredText("Short description", 1000),
  full_description: requiredText("Full description", 10000),
  role: optionalNullableText("Role", 200),
  architecture: optionalNullableText("Architecture", 200),
  tech_stack: z
    .array(requiredText("Tech stack item", 100))
    .max(50, "Tech stack cannot exceed 50 items.")
    .default([]),
  github_url: optionalNullableUrl("GitHub URL"),
  live_url: optionalNullableUrl("Live URL"),
  featured_image: optionalNullableUrl("Featured image"),
  is_featured: z.boolean().default(false),
  status: projectStatusSchema.default("completed"),
});

export const projectSectionCreateSchema = z.object({
  section_type: projectSectionTypeSchema.default("text"),
  title: optionalNullableText("Title", 200),
  content: optionalNullableText("Content", 20000),
  order_index: nonNegativeOrderIndex.nullish().transform((value) => value ?? null),
});

export const projectSectionUpdateSchema = z
  .object({
    section_type: projectSectionTypeSchema.optional(),
    title: optionalNullableText("Title", 200).optional(),
    content: optionalNullableText("Content", 20000).optional(),
    order_index: nonNegativeOrderIndex.nullish().transform((value) =>
      value ?? null
    ).optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    "At least one section field must be provided."
  );

export const projectImageCreateSchema = z.object({
  image_url: requiredText("Image URL", 2000).refine(
    (value) => isValidAssetReference(value),
    "Image URL must be a valid URL or root-relative path."
  ),
  caption: optionalNullableText("Caption", 500),
  order_index: nonNegativeOrderIndex.nullish().transform((value) => value ?? null),
});

export const projectImageUpdateSchema = z
  .object({
    image_url: z
      .string()
      .trim()
      .min(1, "Image URL is required.")
      .max(2000, "Image URL must be at most 2000 characters.")
      .refine(
        (value) => isValidAssetReference(value),
        "Image URL must be a valid URL or root-relative path."
      )
      .optional(),
    caption: optionalNullableText("Caption", 500).optional(),
    order_index: nonNegativeOrderIndex.nullish().transform((value) =>
      value ?? null
    ).optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    "At least one image field must be provided."
  );

export const messageStatusUpdateSchema = z.object({
  status: messageStatusSchema,
});

export const uploadPayloadSchema = z.object({
  file: imageFileSchema
    .refine((file) => file.type.startsWith("image/"), "File must be an image.")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB."
    ),
  type: z.enum(["featured", "project"]),
  projectId: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .transform((value) => (value.length > 0 ? value : null)),
});

export type ContactFormSchemaInput = z.infer<typeof contactFormSchema>;
export type ContactFormField = keyof ContactFormSchemaInput;
export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
export type ProjectPayloadField = keyof ProjectPayload;
export type ProjectSectionCreatePayload = z.infer<typeof projectSectionCreateSchema>;
export type ProjectSectionUpdatePayload = z.infer<typeof projectSectionUpdateSchema>;
export type ProjectSectionField = keyof ProjectSectionCreatePayload | keyof ProjectSectionUpdatePayload;
export type ProjectImageCreatePayload = z.infer<typeof projectImageCreateSchema>;
export type ProjectImageUpdatePayload = z.infer<typeof projectImageUpdateSchema>;
export type ProjectImageField = keyof ProjectImageCreatePayload | keyof ProjectImageUpdatePayload;
export type MessageStatusUpdatePayload = z.infer<typeof messageStatusUpdateSchema>;
export type MessageStatusField = keyof MessageStatusUpdatePayload;
export type UploadPayload = z.infer<typeof uploadPayloadSchema>;
export type UploadField = keyof UploadPayload;
