# Habib Mohamed Gouda Portfolio

A Next.js 14 portfolio application with a Supabase-backed content layer, authenticated admin CMS, structured backend validation, and a service-layer architecture for maintainable admin operations.

## Overview

This repository contains a single App Router application that serves:

- a public portfolio website
- an authenticated admin dashboard
- internal API routes for contact submissions and admin mutations
- a Supabase integration for auth, database access, and storage

The backend has been refactored around:

- shared Zod validation schemas
- typed API response helpers
- centralized admin auth and authorization
- reusable service-layer CRUD functions
- safer multi-step delete and upload cleanup behavior

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Zod
- Vercel Analytics

## Features

- Server-rendered public portfolio pages
- Dynamic project listing and project detail pages
- Supabase-backed admin dashboard and CMS flows
- Role-based admin authorization using Supabase user metadata/claims
- Shared backend validation with Zod
- Typed admin API success and error responses
- Contact form sanitization, validation, and rate limiting
- Service-layer admin CRUD logic
- Supabase Storage image upload flow with cleanup safeguards
- SEO metadata, `robots.ts`, and `sitemap.ts`

## Backend Highlights

The current backend architecture includes:

- `lib/validation/` for shared payload validation
- `lib/api/` for standardized API response formatting
- `lib/services/` for reusable business logic, auth guards, and error handling
- `app/api/admin/` for thin admin route handlers
- `app/api/contact/route.ts` for public contact submissions

Detailed backend documentation:

- [Architecture](./ARCHITECTURE.md)
- [Backend Guide](./docs/BACKEND.md)
- [API Guide](./docs/API.md)
- [Supabase Guide](./docs/SUPABASE.md)
- [Admin Auth Guide](./docs/ADMIN_AUTH.md)

## Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_ROLE=admin
```

### Environment Notes

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anonymous key used by browser auth and public/server reads
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`: current server-side privileged key used by service-layer admin writes and contact inserts
- `ADMIN_ROLE`: role name required for admin access; defaults to `admin`

Important:

- The service-role key must only be configured in trusted server environments
- The current variable name includes a `NEXT_PUBLIC_` prefix because that is how the code currently reads it
- Even with that name, it must never be exposed to browser code or public runtime output
- A future cleanup should rename it to a server-only variable such as `SUPABASE_SERVICE_ROLE_KEY`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Provision:

- `projects`
- `project_sections`
- `project_images`
- `contact_messages`
- `portfolio-images` storage bucket
- at least one Supabase Auth user with the configured admin role

See [docs/SUPABASE.md](./docs/SUPABASE.md) for the expected setup.

### 3. Configure environment variables

Add the required values to `.env.local`.

### 4. Add static assets

Place the profile image at:

```text
public/profile.jpg
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Type-check the project

```bash
npx tsc --noEmit
```

## Deployment

This project is well suited for Vercel with Supabase as the managed backend.

### Recommended Deployment Flow

1. Push the repository to GitHub
2. Import the project into Vercel
3. Configure all environment variables in Vercel
4. Configure Supabase tables, storage, and admin roles
5. Deploy

### Production Checklist

- set the real site domain in `app/layout.tsx`
- configure `ADMIN_ROLE`
- verify admin users have the required Supabase metadata role
- verify storage bucket access and cleanup expectations
- verify the service-role key is stored only in server-side hosting settings

## Project Structure

```text
.
|-- app/
|   |-- api/
|   |   |-- admin/
|   |   `-- contact/
|   |-- admin/
|   |-- about/
|   |-- contact/
|   |-- projects/
|   |-- globals.css
|   |-- layout.tsx
|   |-- page.tsx
|   |-- robots.ts
|   `-- sitemap.ts
|-- components/
|   |-- admin/
|   `-- ...
|-- docs/
|   |-- ADMIN_AUTH.md
|   |-- API.md
|   |-- BACKEND.md
|   `-- SUPABASE.md
|-- lib/
|   |-- api/
|   |-- contact/
|   |-- services/
|   |-- validation/
|   `-- ...
|-- public/
|-- types/
|-- middleware.ts
|-- ARCHITECTURE.md
|-- AI_CONTRACT.md
|-- next.config.mjs
|-- package.json
`-- README.md
```

### Important Directories

- `app/api/admin/`: thin admin route handlers
- `lib/services/`: backend business logic and admin auth wrappers
- `lib/validation/`: shared Zod schemas and validation helpers
- `lib/api/`: standardized admin API response helpers
- `middleware.ts`: page-level admin access control
- `docs/`: backend and operational documentation

## Admin Authentication and Authorization

Admin access is role-based, not just login-based.

The current implementation checks Supabase user metadata in this order:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

The configured admin role must match `ADMIN_ROLE`, or `admin` if unset.

More detail:

- [Admin Auth Guide](./docs/ADMIN_AUTH.md)

## API Summary

Public route:

- `POST /api/contact`

Admin routes:

- `GET /api/admin/messages`
- `PUT /api/admin/messages/:id`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`
- `POST /api/admin/projects/:id/sections`
- `PUT /api/admin/projects/:id/sections/:sectionId`
- `DELETE /api/admin/projects/:id/sections/:sectionId`
- `POST /api/admin/projects/:id/images`
- `PUT /api/admin/projects/:id/images/:imageId`
- `DELETE /api/admin/projects/:id/images/:imageId`
- `POST /api/admin/upload`

Admin routes use a standardized response envelope:

- success: `{ success: true, data: ... }`
- error: `{ success: false, error: { code, message, fieldErrors? } }`

See [docs/API.md](./docs/API.md) for details.

## Current Limitations

- No checked-in SQL migrations or schema management
- Contact route still uses its own response shape rather than the admin API envelope
- Rate limiting is in-memory and not suitable for horizontal scale
- Multi-step delete flows use compensating cleanup rather than database transactions
- Service-role env naming should be cleaned up
- No pagination for admin list endpoints
- No automated tests yet

## Recommended Next Improvements

- add Supabase SQL migrations and policy documentation
- move the contact route onto the shared API response contract
- replace in-memory rate limiting with Redis or Vercel KV
- add pagination, filtering, and search to admin endpoints
- use stronger transactional patterns via SQL/RPC where appropriate
- add observability, tests, and CI

## Troubleshooting

### Supabase data is missing

- verify environment variables
- confirm required tables and storage bucket exist
- verify you are pointing to the correct Supabase project

### Admin login works but admin APIs return forbidden

- verify the user has the required admin role in Supabase metadata
- verify `ADMIN_ROLE` matches the stored role

### Type-checking

```bash
npx tsc --noEmit
```

## License

This project is intended for personal portfolio use. Add a license if you plan to distribute or open source it.
