# Backend Guide

This document explains the current backend implementation, including validation, services, auth, uploads, CMS data flow, and remaining technical debt.

## Backend Summary

The backend is implemented inside the Next.js App Router application. It uses:

- route handlers in `app/api/`
- shared Zod schemas and helpers in `lib/validation/`
- shared admin response helpers in `lib/api/`
- reusable services in `lib/services/`
- Supabase clients in `lib/supabase-*.ts`

The admin backend is now service-layer oriented. Route handlers are thin and focus on HTTP concerns; services own business logic and Supabase operations.

## Route Handler Layer

Route handlers are responsible for:

- accepting requests
- parsing JSON or multipart form data
- invoking shared validation
- delegating to services
- returning response helpers

Admin routes are wrapped in `withAdminRoute(...)`, which centralizes authentication, authorization, and error mapping.

Public route currently present:

- `POST /api/contact`

Admin routes currently present:

- CMS load/save
- message listing/detail/status updates
- project CRUD
- project section CRUD
- project image CRUD
- uploads

## Validation Architecture

Validation files:

- `lib/validation/schemas.ts`
- `lib/validation/helpers.ts`

The backend validates these payload families:

- contact form submissions
- project create/update payloads
- project section create/update payloads
- project image create/update payloads
- message status updates
- CMS sections/assets/social links/skills/contact channels
- upload form-data payloads

Validation behavior:

- trims and normalizes text inputs
- maps empty optional strings to `null` where appropriate
- validates project slugs
- validates message statuses
- validates CMS stable keys
- validates URLs or root-relative asset paths
- validates upload file type and size
- returns field-level errors for admin forms

## Service-Layer Structure

### `lib/services/admin.ts`

Owns admin business logic:

- project create/update/delete
- slug uniqueness checks
- project section create/update/delete
- project image create/update/delete
- message listing, detail lookup, status counts, and status updates
- dashboard stats
- upload handling
- CMS load/save operations
- storage cleanup helpers
- rollback helper for project relation delete failures

### `lib/services/contact.ts`

Owns persistence of sanitized public contact submissions into `contact_messages`.

### `lib/services/admin-auth.ts`

Owns server-side admin resolution and `withAdminRoute(...)`.

### `lib/services/admin-roles.ts`

Owns role extraction/normalization helpers for Supabase user metadata.

### `lib/services/errors.ts` and `lib/services/http.ts`

Provide service error primitives and HTTP/error mapping helpers.

## Reusable Admin API Pattern

Admin mutation routes generally follow this pattern:

1. `withAdminRoute("Context error label", async (...) => { ... })`
2. Parse request body with `readJsonBody(...)` or `request.formData()`.
3. Validate with `validateSchema(...)` and the appropriate Zod schema.
4. Return `apiValidationError(...)` if invalid.
5. Call a service function.
6. Return `apiSuccess(...)`.

This pattern keeps authentication, validation, error shape, and persistence consistent across admin endpoints.

## CMS Service Flow

### Load

`getCmsAdminData()` reads:

- `cms_sections`
- `cms_assets`
- `social_links`
- `skills`
- `contact_channels`

and returns a single admin data object.

### Save

`saveCmsAdminData(payload)`:

- upserts `cms_sections` by `section_key`
- upserts `cms_assets` by `asset_key`
- replaces `social_links`, `skills`, and `contact_channels` rows by comparing current IDs to submitted IDs
- reloads and returns saved CMS data

This provides a simple full-payload save model for admin workspaces.

## Upload Architecture

Endpoint:

- `POST /api/admin/upload`

Storage bucket:

- `portfolio-images`

Accepted upload categories:

- `featured`
- `project`
- `profile`
- `resume`
- `cms`

Accepted files:

- images
- PDFs

Limit:

- 10 MB

Upload service behavior:

- creates a path based on upload type and timestamped file name
- uploads to Supabase Storage
- returns a public URL
- removes the object if public URL resolution fails after upload

Cleanup behavior:

- project image deletion attempts storage cleanup
- project deletion attempts storage cleanup for featured and gallery images
- cleanup is best effort and does not fail successful database deletes

## Authentication and Authorization

Admin authentication uses Supabase Auth sessions.

Admin authorization checks the configured role from Supabase user metadata:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

`ADMIN_ROLE` controls the required role and defaults to `admin`.

Admin pages are protected by middleware, but admin APIs still enforce authorization through `withAdminRoute(...)` to protect direct API access.

## Supabase Integration Patterns

Supabase client separation:

- `lib/supabase-server.ts` - public/server reads with anon key.
- `lib/supabase-client.ts` - browser auth client.
- `lib/supabase-auth.ts` - cookie-aware server auth client.
- `lib/supabase-admin.ts` - privileged service-role client for server-only writes/storage.

The service-role client must only be used in trusted server code.

## Completed Backend Improvements

- shared validation for admin and contact payloads
- typed validation errors
- shared admin response envelope
- central admin auth wrapper
- service-layer extraction for admin operations
- CMS load/save API and service implementation
- message status counts and expanded status workflow
- safer project delete cleanup and relation rollback behavior
- upload validation and storage cleanup safeguards

## Current Technical Debt

- public contact response shape differs from admin API envelope
- in-memory rate limiting is not horizontally scalable
- admin list endpoints do not have pagination/search/filtering
- no checked-in RLS/storage policy SQL
- high-risk multi-step mutations are not database transactions or RPCs
- no audit log for admin writes
- no automated service/route tests
- no operational monitoring/structured logging implementation
- service-role env var uses a `NEXT_PUBLIC_` prefix and should be renamed

## Future Backend Roadmap

- add pagination, search, and filters for admin lists
- add tests for validation, services, and route handlers
- add checked-in Supabase RLS/storage policy migrations
- add audit/event logging for admin operations
- move heavier or high-risk workflows to transactional SQL/RPC paths where appropriate
- replace in-memory contact rate limiting with Redis, Vercel KV, or another shared store
- rename service-role env var to `SUPABASE_SERVICE_ROLE_KEY`
- add monitoring for API failures, contact submission failures, and storage cleanup warnings
