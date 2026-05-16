# Supabase Guide

This document describes how the application currently uses Supabase for authentication, database storage, and object storage.

## Responsibilities

Supabase provides:

- Auth users and sessions
- admin role metadata source
- relational database tables
- public object storage for portfolio uploads

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_ROLE=admin
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by browser/public/server clients.
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` is currently read by the server-side admin client. Despite the prefix, treat it as a server-only secret.
- `ADMIN_ROLE` defaults to `admin` when unset.

## Supabase Clients

### `lib/supabase-server.ts`

Used for public/server reads with anon credentials.

### `lib/supabase-client.ts`

Used by browser components for Supabase Auth login/logout.

### `lib/supabase-auth.ts`

Used for cookie-aware server auth checks.

### `lib/supabase-admin.ts`

Used by services for privileged database writes and storage operations.

## Database Tables

### Portfolio Tables

- `projects` - top-level projects with slug, descriptions, tech stack, links, featured image, featured flag, and status.
- `project_sections` - ordered detail sections associated with projects.
- `project_images` - ordered gallery image records associated with projects.

### Contact Table

- `contact_messages` - public contact submissions with sender data, message content, request metadata, status, and timestamps.

Supported status values:

- `new`
- `delivered`
- `read`
- `replied`
- `archived`

### CMS Tables

- `cms_sections` - stable-keyed sections with text fields, JSON `content`, status, ordering, and timestamps.
- `cms_assets` - stable-keyed image/document/link assets with file metadata and active flag.
- `social_links` - ordered social/profile links.
- `skills` - ordered skills with category, optional proficiency, featured flag, and active flag.
- `contact_channels` - ordered structured contact methods.

## Migrations

Migration files live in `supabase/migrations` and must currently be applied manually.

### `202605160001_cms_foundation.sql`

Adds:

- `cms_sections`
- `cms_assets`
- `social_links`
- `skills`
- `contact_channels`
- CMS-related indexes
- shared `set_updated_at()` trigger function
- update triggers for CMS tables
- seed records for initial homepage/about sections, profile/resume assets, social links, and contact channels

This migration is intentionally additive and does not switch public rendering to CMS content.

### `202605160002_message_status_expansion.sql`

Updates `contact_messages.status` constraints to allow:

- `new`
- `delivered`
- `read`
- `replied`
- `archived`

Also adds an index on `(status, created_at desc)`.

## Storage

Required bucket:

- `portfolio-images`

Current responsibilities:

- featured project images
- project gallery images
- profile image uploads
- resume/PDF uploads
- future CMS asset uploads

Current upload endpoint:

- `POST /api/admin/upload`

Upload categories:

- `featured`
- `project`
- `profile`
- `resume`
- `cms`

The service returns public URLs and stores those URLs in project or CMS records. Delete flows only clean up objects when a stored public URL can be mapped back to the `portfolio-images` bucket.

## Authentication and Admin Roles

Admin users are Supabase Auth users. Authorization is based on metadata roles.

Checked metadata locations:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

Preferred metadata:

```json
{
  "role": "admin"
}
```

Role arrays are also supported:

```json
{
  "roles": ["admin"]
}
```

Prefer storing roles in `app_metadata` for stronger server-side control.

## RLS and Policy Status

The repository currently does not include complete RLS policy SQL or storage policy SQL.

Because admin operations use the service-role client, service-layer admin mutations do not depend on browser-side write permissions. Public reads and storage access still need to be configured appropriately in Supabase for the deployed environment.

Future work should add explicit policy migrations/documentation for:

- public project reads
- public published CMS reads after frontend CMS integration
- contact message inserts
- admin-only table writes if service-role usage is reduced
- public storage object reads
- admin upload/storage writes

## Operational Checklist

Before using the admin CMS in a new Supabase project:

1. Create or migrate base `projects`, `project_sections`, `project_images`, and `contact_messages` tables.
2. Apply all files under `supabase/migrations`.
3. Create the `portfolio-images` bucket.
4. Configure public read behavior for stored assets as required by the application.
5. Create a Supabase Auth user.
6. Add admin role metadata to that user.
7. Set all environment variables in local and hosted environments.
8. Verify CMS load/save, upload, project CRUD, and message status updates.

## Future Supabase Improvements

- Add base table migrations if they are not already managed elsewhere.
- Add RLS and storage policy SQL to the repository.
- Rename service-role env var to a server-only name.
- Add backup/restore and incident-response notes.
- Add public `published` CMS query guidance when frontend integration is implemented.
