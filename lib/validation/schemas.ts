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

const requiredUrl = (label: string) =>
  requiredText(label, 2000).refine(
    (value) => isValidAssetReference(value),
    `${label} must be a valid URL or root-relative path.`
  );

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

const messageStatusSchema = z.enum([
  "new",
  "delivered",
  "read",
  "replied",
  "archived",
]);

const cmsSectionStatusSchema = z.enum(["draft", "published", "archived"]);
const cmsAssetTypeSchema = z.enum(["image", "document", "link"]);

const uploadFileSchema = z.custom<File>(
  (value): value is File => typeof File !== "undefined" && value instanceof File,
  {
    message: "No file provided.",
  }
);

const jsonRecordSchema = z.record(z.string(), z.unknown()).default({});

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
  image_url: requiredUrl("Image URL"),
  caption: optionalNullableText("Caption", 500),
  order_index: nonNegativeOrderIndex.nullish().transform((value) => value ?? null),
});

export const projectImageUpdateSchema = z
  .object({
    image_url: requiredUrl("Image URL").optional(),
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

export const cmsSectionPayloadSchema = z.object({
  section_key: requiredText("Section key", 120).regex(
    /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/,
    "Section key must use lowercase letters, numbers, dots, underscores, or hyphens."
  ),
  title: optionalNullableText("Title", 300),
  eyebrow: optionalNullableText("Eyebrow", 300),
  body: optionalNullableText("Body", 20000),
  content: jsonRecordSchema,
  status: cmsSectionStatusSchema.default("draft"),
  order_index: nonNegativeOrderIndex.default(0),
});

export const cmsAssetPayloadSchema = z.object({
  asset_key: requiredText("Asset key", 120).regex(
    /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/,
    "Asset key must use lowercase letters, numbers, dots, underscores, or hyphens."
  ),
  title: requiredText("Title", 300),
  asset_type: cmsAssetTypeSchema,
  file_url: requiredUrl("File URL"),
  file_name: optionalNullableText("File name", 500),
  file_type: optionalNullableText("File type", 200),
  alt_text: optionalNullableText("Alt text", 500),
  metadata: jsonRecordSchema,
  is_active: z.boolean().default(true),
});

export const socialLinkPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  platform: requiredText("Platform", 120),
  label: requiredText("Label", 120),
  url: requiredUrl("URL"),
  icon: optionalNullableText("Icon", 120),
  order_index: nonNegativeOrderIndex.default(0),
  is_active: z.boolean().default(true),
});

export const skillPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredText("Skill", 120),
  category: requiredText("Category", 120),
  proficiency: optionalNullableText("Proficiency", 120),
  order_index: nonNegativeOrderIndex.default(0),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const contactChannelPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  channel_type: requiredText("Channel type", 80),
  label: requiredText("Label", 120),
  value: requiredText("Value", 500),
  url: optionalNullableUrl("URL"),
  order_index: nonNegativeOrderIndex.default(0),
  is_active: z.boolean().default(true),
});

export const cmsPayloadSchema = z.object({
  sections: z.array(cmsSectionPayloadSchema).max(50),
  assets: z.array(cmsAssetPayloadSchema).max(50),
  socialLinks: z.array(socialLinkPayloadSchema).max(50),
  skills: z.array(skillPayloadSchema).max(100),
  contactChannels: z.array(contactChannelPayloadSchema).max(50),
});

export const uploadPayloadSchema = z.object({
  file: uploadFileSchema
    .refine(
      (file) => file.type.startsWith("image/") || file.type === "application/pdf",
      "File must be an image or PDF."
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB."
    ),
  type: z.enum(["featured", "project", "profile", "resume", "cms"]),
  projectId: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : ""))
    .transform((value) => (value.length > 0 ? value : null)),
});

export type ContactFormSchemaInput = z.infer<typeof contactFormSchema>;
export type ContactFormField = Extract<keyof ContactFormSchemaInput, string>;
export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
export type ProjectPayloadField = Extract<keyof ProjectPayload, string>;
export type ProjectSectionCreatePayload = z.infer<typeof projectSectionCreateSchema>;
export type ProjectSectionUpdatePayload = z.infer<typeof projectSectionUpdateSchema>;
export type ProjectSectionField = Extract<keyof ProjectSectionCreatePayload | keyof ProjectSectionUpdatePayload, string>;
export type ProjectImageCreatePayload = z.infer<typeof projectImageCreateSchema>;
export type ProjectImageUpdatePayload = z.infer<typeof projectImageUpdateSchema>;
export type ProjectImageField = Extract<keyof ProjectImageCreatePayload | keyof ProjectImageUpdatePayload, string>;
export type MessageStatusUpdatePayload = z.infer<typeof messageStatusUpdateSchema>;
export type MessageStatusField = Extract<keyof MessageStatusUpdatePayload, string>;
export type CmsPayload = z.infer<typeof cmsPayloadSchema>;
export type CmsPayloadField = Extract<keyof CmsPayload, string>;
export type UploadPayload = z.infer<typeof uploadPayloadSchema>;
export type UploadField = Extract<keyof UploadPayload, string>;
