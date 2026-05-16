# Admin Authentication and Authorization

This document explains the current admin authentication and authorization architecture.

## Overview

Admin access requires two checks:

1. **Authentication** - the user has a valid Supabase Auth session.
2. **Authorization** - the authenticated user has the configured admin role.

Both page access and API access are protected. API routes enforce authorization even when middleware has already protected the admin page shell.

## Login Flow

1. The user visits `/admin/login`.
2. The login page uses the browser Supabase client.
3. Supabase Auth signs in with email/password.
4. Supabase stores session cookies.
5. Later admin page and API requests use those cookies to resolve the user.

## Page Protection

`middleware.ts` protects `/admin/*` routes.

Current behavior:

- unauthenticated users are redirected to `/admin/login`
- authenticated admins are redirected away from `/admin/login`
- authenticated non-admin users are blocked from protected admin pages

Middleware is for page-level access control and user experience. It is not the only security boundary.

## API Protection

Admin API routes use `withAdminRoute(...)` from `lib/services/admin-auth.ts`.

The wrapper:

- resolves the current Supabase user from the server request context
- extracts supported role metadata
- checks the configured admin role
- passes an auth context to the route handler
- maps unauthenticated requests to `401`
- maps authenticated non-admin requests to `403`
- maps service errors to standard admin API errors

## Role Sources

The current implementation checks these Supabase user metadata fields:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

The expected role name is:

- `ADMIN_ROLE`, if configured
- otherwise `admin`

## Recommended Role Placement

Preferred:

```json
{
  "role": "admin"
}
```

stored in `app_metadata`.

Also supported:

```json
{
  "roles": ["admin"]
}
```

Compatibility fallbacks in `user_metadata` are supported, but `app_metadata` is preferred because it is normally controlled by trusted server/admin processes rather than by the end user.

## Authorization Scope

The current system has a single admin capability level. A user with the configured admin role can access all current dashboard functions:

- dashboard stats
- project management
- CMS content and asset management
- message management
- uploads

There is no separate per-feature permission model yet.

## Security Notes

- Admin APIs must continue to use `withAdminRoute(...)`.
- Service-role Supabase operations must remain server-only.
- Client components should never receive or log service-role secrets.
- Adding new admin routes should include validation and service-layer delegation, not direct unguarded Supabase writes.

## Current Limitations

- one role controls all admin capabilities
- no dedicated `admins` table
- no audit log for admin actions
- no role-change audit trail
- no session/device management UI

## Future Improvements

- add more granular permissions if multiple admin roles are needed
- add audit logging for privileged mutations
- add an admin activity page
- document operational procedures for granting and revoking access
- consider moving admin membership to a dedicated database table if metadata-only roles become insufficient
