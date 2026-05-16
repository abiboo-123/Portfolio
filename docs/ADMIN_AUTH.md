# Admin Authentication and Authorization

This document explains the current admin auth flow and the role model used by the backend.

## Overview

The admin system now distinguishes between:

- authentication
- authorization

This means a user must:

1. have a valid Supabase session
2. have the configured admin role

## Authentication Flow

### Login

1. The admin login page calls Supabase Auth using email/password.
2. Supabase returns a session.
3. Session cookies are stored by Supabase.
4. Later page and API requests use those cookies for identity resolution.

### Server-Side Session Checks

Server-side auth uses:

- `lib/supabase-auth.ts`

This creates a cookie-aware Supabase server client for:

- API route auth checks
- server-side admin page checks

## Authorization Flow

Authorization is implemented in:

- `lib/services/admin-auth.ts`
- `middleware.ts`

### API Routes

Admin API routes use:

- `withAdminRoute(...)`

That wrapper:

- resolves the current Supabase user
- verifies the admin role
- provides a typed auth context to the route handler
- centralizes unauthorized and forbidden error handling

### Admin Pages

`middleware.ts` protects `/admin/*` pages by:

- redirecting unauthenticated users to `/admin/login`
- redirecting authenticated admins away from `/admin/login`
- redirecting authenticated non-admin users away from `/admin/*`

## Role Sources

The current implementation checks these fields:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

The accepted role name is:

- `ADMIN_ROLE`
- or `admin` if not configured

## Recommended Role Placement

Preferred:

- `app_metadata.role = "admin"`

Also supported:

- `app_metadata.roles = ["admin"]`

Compatibility fallback:

- `user_metadata.role`
- `user_metadata.roles`

## Example Admin Metadata

```json
{
  "role": "admin"
}
```

Or:

```json
{
  "roles": ["admin"]
}
```

## Current Limitations

- no separate permissions model beyond role membership
- no dedicated `admins` table or permission registry
- no audit trail for role changes
- middleware and service layer currently duplicate role normalization logic

## Recommended Future Improvements

- move role normalization into one shared helper used by both middleware and services
- add richer permissions if multiple admin capabilities are introduced
- add audit logging for privileged actions
