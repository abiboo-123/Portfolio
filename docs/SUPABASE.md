# Supabase Guide

This document describes how the current application uses Supabase.

## Supabase Responsibilities

Supabase currently provides:

- authentication
- user session handling
- role metadata source for admin authorization
- database storage
- object storage for images

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_ROLE=admin
```

## Current Supabase Clients

### `lib/supabase-server.ts`

Used for:

- public/server data reads

### `lib/supabase-client.ts`

Used for:

- browser-side auth login/logout

### `lib/supabase-auth.ts`

Used for:

- server-side session-aware auth lookups

### `lib/supabase-admin.ts`

Used for:

- privileged writes
- storage operations
- service-layer admin mutations

## Required Database Tables

The current backend expects:

- `projects`
- `project_sections`
- `project_images`
- `contact_messages`
- `cms_sections`
- `cms_assets`
- `social_links`
- `skills`
- `contact_channels`

## Required Storage

The backend expects a public bucket named:

- `portfolio-images`

Current storage usage:

- featured project images
- project gallery images
- upload endpoint writes
- delete flows attempt best-effort storage cleanup

## Admin Role Model

Admin authorization is driven from Supabase user metadata/claims.

The backend checks:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

The required role name is:

- `ADMIN_ROLE`
- or `admin` if the env var is unset

## Current Operational Gaps

- SQL migrations now exist under `supabase/migrations`; apply them manually in Supabase before using new CMS tables
- no checked-in RLS policy definitions
- no checked-in storage policy definitions
- service-role env naming should be improved

## Recommended Future Supabase Improvements

- add SQL migrations to the repository
- add policy documentation and policy SQL
- rename the service-role env var to a server-only name
- document any bucket policy assumptions explicitly
