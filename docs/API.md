# API Guide

This document describes the current HTTP contract for public and admin APIs.

## Response Conventions

### Public Contact Response

`POST /api/contact` currently uses a public-specific response shape.

Success:

```json
{
  "success": true
}
```

Error:

```json
{
  "success": false,
  "error": "Validation failed. Please check the form.",
  "fieldErrors": {
    "email": "Please enter a valid email address."
  }
}
```

This route has not yet been moved to the shared admin API envelope.

### Admin API Envelope

All admin API routes require authentication and the configured admin role.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Validation failed.",
    "fieldErrors": {
      "title": "Title is required."
    }
  }
}
```

## Public API

### `POST /api/contact`

Purpose: accept public contact form submissions.

Request body:

```json
{
  "full_name": "Jane Example",
  "email": "jane@example.com",
  "subject": "Project inquiry",
  "message": "I would like to discuss a backend project."
}
```

Behavior:

- expects JSON input
- validates with the shared contact Zod schema
- sanitizes strings before persistence
- rate-limits by client IP using in-memory storage
- stores data in `contact_messages`

Known limitation: in-memory rate limiting does not scale across multiple deployed instances.

## Admin API

Common behavior for every admin route:

- requires a valid Supabase session
- requires the configured admin role
- uses shared validation for request payloads where applicable
- delegates persistence or storage work to `lib/services/admin.ts`
- returns the standard admin response envelope

### CMS

#### `GET /api/admin/cms`

Returns all CMS admin data:

- `sections`
- `assets`
- `socialLinks`
- `skills`
- `contactChannels`

#### `PUT /api/admin/cms`

Saves the full CMS payload.

Payload shape:

```json
{
  "sections": [],
  "assets": [],
  "socialLinks": [],
  "skills": [],
  "contactChannels": []
}
```

Validation is handled by `cmsPayloadSchema`. Stable-keyed sections/assets are upserted. Repeatable collections are updated/inserted/deleted based on submitted IDs.

### Messages

#### `GET /api/admin/messages`

Returns messages and status counts.

Optional query:

- `status=all|new|delivered|read|replied|archived`

#### `GET /api/admin/messages/:id`

Returns one contact message by ID.

#### `PUT /api/admin/messages/:id`

Updates message status.

Request body:

```json
{
  "status": "read"
}
```

Allowed statuses:

- `new`
- `delivered`
- `read`
- `replied`
- `archived`

### Projects

#### `POST /api/admin/projects`

Creates a project.

Validated fields include title, slug, descriptions, role, architecture, tech stack, URLs, featured image, featured flag, and status.

#### `PUT /api/admin/projects/:id`

Updates a project with the same validated payload as create.

#### `DELETE /api/admin/projects/:id`

Deletes a project and its project sections/images. Storage cleanup is attempted for mapped Supabase Storage URLs after successful database deletion.

### Project Sections

#### `POST /api/admin/projects/:id/sections`

Creates a project section.

Allowed section types:

- `text`
- `code`
- `image`

#### `PUT /api/admin/projects/:id/sections/:sectionId`

Updates one or more section fields.

#### `DELETE /api/admin/projects/:id/sections/:sectionId`

Deletes a section for the given project.

### Project Images

#### `POST /api/admin/projects/:id/images`

Creates a gallery image record.

#### `PUT /api/admin/projects/:id/images/:imageId`

Updates image URL, caption, or order index.

#### `DELETE /api/admin/projects/:id/images/:imageId`

Deletes an image record and attempts best-effort storage cleanup for mapped Supabase Storage URLs.

### Uploads

#### `POST /api/admin/upload`

Accepts multipart form data.

Fields:

- `file` - required image or PDF file.
- `type` - one of `featured`, `project`, `profile`, `resume`, or `cms`.
- `projectId` - optional project ID used for project upload organization.

Validation:

- file must be an image or PDF
- file must be 10 MB or smaller

Returns:

```json
{
  "success": true,
  "data": {
    "url": "https://..."
  }
}
```

## Status Code Conventions

- `200` for successful reads, updates, and deletes.
- `201` for successful creates and uploads.
- `400` for invalid bodies or validation errors.
- `401` for unauthenticated admin requests.
- `403` for authenticated users without the admin role.
- `404` for service-layer not-found cases such as missing message detail.
- `429` for contact rate limiting.
- `500` for unexpected server failures.

## Future API Work

- Align the contact route with shared response helpers if desired.
- Add pagination/search/filtering to list endpoints.
- Add explicit query contracts for future public CMS reads.
- Add tests for route handlers and service error mapping.
