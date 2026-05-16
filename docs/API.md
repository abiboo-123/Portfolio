# API Guide

This document describes the current backend HTTP contract.

## Public API

### `POST /api/contact`

Purpose:

- accept public contact submissions

Current behavior:

- validates JSON content type
- validates and sanitizes payload
- rate-limits by IP in memory
- stores the message in `contact_messages`

Current response shape:

- success: `{ success: true }`
- error: `{ success: false, error: string, fieldErrors?: Record<string, string> }`

Note:

- this route has not yet been migrated to the shared admin API response envelope

## Admin API

All admin routes:

- require authentication
- require the configured admin role
- use shared Zod validation when applicable
- return a shared API envelope

### Standard Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Standard Error Response

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

## Admin Routes

### Messages

- `GET /api/admin/messages`
- `PUT /api/admin/messages/:id`

### Projects

- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

### Project Sections

- `POST /api/admin/projects/:id/sections`
- `PUT /api/admin/projects/:id/sections/:sectionId`
- `DELETE /api/admin/projects/:id/sections/:sectionId`

### Project Images

- `POST /api/admin/projects/:id/images`
- `PUT /api/admin/projects/:id/images/:imageId`
- `DELETE /api/admin/projects/:id/images/:imageId`

### Uploads

- `POST /api/admin/upload`

## Status Code Conventions

Current admin route conventions:

- `200` for successful reads, updates, and deletes
- `201` for successful creates and uploads
- `400` for invalid request body or validation errors
- `401` for unauthenticated requests
- `403` for authenticated users without the admin role
- `500` for unexpected internal failures

## Validation

Validation is handled through:

- `lib/validation/schemas.ts`
- `lib/validation/helpers.ts`

Common validated payloads:

- project payloads
- section payloads
- image payloads
- message status updates
- upload payloads

## Notes for Future Work

- move the contact route onto the same response envelope
- add pagination parameters to admin list endpoints
- document any future query/filter/search contracts explicitly
