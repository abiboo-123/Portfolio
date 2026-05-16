# Architecture

This document describes the current application architecture after the backend refactors to shared validation, service-layer business logic, typed admin API responses, and role-based authorization.

## System Overview

The project is a single Next.js 14 App Router application that combines:

- a public portfolio website
- an authenticated and authorized admin CMS
- internal API routes for backend operations
- Supabase for auth, database, and storage

The application follows a lightweight full-stack architecture:

- pages and components render the UI
- route handlers expose backend endpoints
- shared validation enforces input contracts
- service-layer modules implement business logic
- Supabase provides persistence, session identity, and file storage

## Frontend Responsibilities

The frontend is split into two main surfaces.

### Public Site

The public site is responsible for:

- rendering the homepage, about page, projects list, project detail pages, and contact page
- fetching public project data through server-rendered pages
- rendering structured project content and image galleries
- submitting the contact form to the public backend route
- handling responsive layout and theme behavior

Public pages are mostly server components and rely on server-side Supabase reads.

### Admin Interface

The admin interface is responsible for:

- rendering login, dashboard, message, and project management screens
- collecting form input for projects, sections, images, uploads, and message updates
- sending authenticated requests to internal admin API routes
- updating local UI state after successful API responses

The admin UI uses client components because it depends on:

- local form state
- event handlers
- file uploads
- browser-side auth login/logout
- incremental UI updates after CRUD actions

## Backend Responsibilities

The backend lives inside the same Next.js application and is centered around route handlers plus a shared service layer.

### Public Backend

The public backend currently consists of:

- `POST /api/contact`

Responsibilities:

- parse and validate contact form input
- sanitize user-provided strings
- rate-limit repeated submissions
- persist contact messages through the contact service

### Admin Backend

The admin backend consists of routes under `app/api/admin/`.

Responsibilities:

- enforce authentication and role-based authorization
- validate admin payloads with shared Zod schemas
- delegate business logic to reusable services
- return typed, standardized API responses
- coordinate storage uploads and mutation flows

### Middleware

`middleware.ts` provides page-level access control for `/admin/*`.

Responsibilities:

- redirect unauthenticated users away from protected admin pages
- redirect authenticated admins away from `/admin/login`
- reject authenticated non-admin users from the admin page area

The middleware is intentionally focused on route-level access control, while API routes enforce server-side authorization again through the admin auth wrapper.

## Routing Architecture

### Public Routes

- `/`
- `/about`
- `/projects`
- `/projects/[slug]`
- `/contact`

### Admin Page Routes

- `/admin/login`
- `/admin/dashboard`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`
- `/admin/messages`

### API Routes

Public:

- `POST /api/contact`

Admin:

- `GET /api/admin/messages`
- `PUT /api/admin/messages/[id]`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/[id]`
- `DELETE /api/admin/projects/[id]`
- `POST /api/admin/projects/[id]/sections`
- `PUT /api/admin/projects/[id]/sections/[sectionId]`
- `DELETE /api/admin/projects/[id]/sections/[sectionId]`
- `POST /api/admin/projects/[id]/images`
- `PUT /api/admin/projects/[id]/images/[imageId]`
- `DELETE /api/admin/projects/[id]/images/[imageId]`
- `POST /api/admin/upload`

## Backend Layering

The backend is now organized by responsibility.

### Route Handler Layer

Files: `app/api/**`

Responsibilities:

- receive HTTP requests
- parse JSON or form data
- run shared validation
- call shared services
- return standardized HTTP responses

Admin route handlers are intentionally thin.

### Validation Layer

Files:

- `lib/validation/schemas.ts`
- `lib/validation/helpers.ts`

Responsibilities:

- define shared Zod schemas
- validate all admin payloads through `safeParse`
- transform and normalize payload values
- return typed field-level validation errors

Validated areas include:

- projects
- project sections
- project images
- message status updates
- uploads
- contact submissions

### API Response Layer

Files:

- `lib/api/responses.ts`
- `lib/services/http.ts`

Responsibilities:

- provide shared success and error response helpers
- standardize admin API envelopes
- format validation failures
- map service errors to stable HTTP responses

Current admin response contract:

- success: `{ success: true, data: ... }`
- error: `{ success: false, error: { code, message, fieldErrors? } }`

### Service Layer

Files:

- `lib/services/admin.ts`
- `lib/services/contact.ts`
- `lib/services/admin-auth.ts`
- `lib/services/errors.ts`

Responsibilities:

- encapsulate database and storage operations
- centralize admin auth and authorization logic
- keep route handlers free of direct business logic
- implement reusable CRUD functions
- own safer multi-step cleanup and rollback behavior

### Supabase Integration Layer

Files:

- `lib/supabase-server.ts`
- `lib/supabase-auth.ts`
- `lib/supabase-client.ts`
- `lib/supabase-admin.ts`

Responsibilities:

- public/server data reads
- browser-side auth interactions
- session-aware server auth checks
- privileged service-role writes

## Authentication and Authorization Flow

### Admin Login Flow

1. The admin login page uses `lib/supabase-client.ts`.
2. The browser signs in with Supabase Auth using email and password.
3. Supabase sets the session cookie.
4. Middleware recognizes the session on later admin page requests.

### Admin Authorization Flow

Admin access is role-based.

Current implementation:

- page-level checks happen in `middleware.ts`
- API-level checks happen in `lib/services/admin-auth.ts`

Authorization sources checked on the Supabase user:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

The expected role name is:

- `process.env.ADMIN_ROLE`
- or `admin` if `ADMIN_ROLE` is unset

If a user is authenticated but lacks the admin role:

- admin pages are blocked by middleware
- admin APIs return `403 forbidden`

## Validation Architecture

All admin payload validation now runs through shared Zod schemas.

### Why It Was Refactored

The earlier backend used repeated manual payload checks across many route files. That created duplication and inconsistent error behavior.

### Current Pattern

1. Route reads body or form data
2. Route calls `validateSchema(...)`
3. Shared Zod schema performs normalization and validation
4. Route returns `apiValidationError(...)` if parsing fails
5. Service receives already-validated data

### Benefits

- one source of truth for payload contracts
- reusable validation across routes
- typed validation errors
- thinner route handlers
- easier future extension

## Service-Layer Architecture

The service layer is the main backend improvement in the current codebase.

### Admin Services

`lib/services/admin.ts` currently owns:

- project CRUD
- section CRUD
- image CRUD
- message listing and status updates
- Supabase Storage uploads
- multi-step delete cleanup and rollback helpers

### Auth Services

`lib/services/admin-auth.ts` owns:

- authenticated admin resolution
- role extraction from Supabase user metadata
- admin route wrapping through `withAdminRoute(...)`

### Contact Service

`lib/services/contact.ts` owns:

- persistence of contact messages

## API Route Architecture

Admin routes now follow a shared pattern:

1. wrap the handler in `withAdminRoute(...)`
2. parse request input
3. validate with shared Zod schemas
4. delegate to service-layer logic
5. return `apiSuccess(...)` or a shared error response

This gives the admin API layer:

- consistent auth behavior
- consistent response envelopes
- reusable validation
- centralized persistence logic

The public contact route is partially aligned with this model but still uses its own response shape.

## Supabase Integration Architecture

Supabase is used in four distinct ways.

### Public and Server Reads

`lib/supabase-server.ts`

- used by server-rendered pages
- uses anon credentials
- does not persist session state

### Browser Auth

`lib/supabase-client.ts`

- used by client components
- supports browser-side admin login/logout

### Session-Aware Server Auth

`lib/supabase-auth.ts`

- creates a server client with cookie support
- used to read the authenticated Supabase user on the server

### Privileged Admin Writes

`lib/supabase-admin.ts`

- uses the service-role key
- powers service-layer database writes and storage operations
- must remain server-only

## Database Responsibilities

Current tables and responsibilities:

- `projects`
  Stores top-level project records displayed publicly and managed in admin

- `project_sections`
  Stores structured deep-dive content sections for each project

- `project_images`
  Stores gallery image records associated with a project

- `contact_messages`
  Stores contact form submissions and their admin-managed status

Current database usage patterns:

- public pages read project content directly
- admin APIs mutate project and message data through the service layer
- no checked-in SQL migrations currently exist in the repo

## Image Upload and Storage Flow

The upload flow now spans validation, service logic, and cleanup behavior.

### Upload Path

1. Admin client submits multipart form data to `POST /api/admin/upload`
2. Route validates the payload with `uploadPayloadSchema`
3. Service uploads the file to the `portfolio-images` bucket
4. Service returns the public URL
5. The admin UI uses that URL in project or gallery records

### Delete/Cleanup Behavior

Project and image deletion now include cleanup improvements:

- project image URLs are inspected for removable Supabase storage paths
- storage cleanup is attempted after successful deletes
- delete flows use compensating rollback when a parent delete fails after child deletes succeed
- storage cleanup is best-effort and logs warnings instead of breaking successful DB deletes

## State Management

There is no global client-side state library.

Current pattern:

- server components fetch initial data where appropriate
- client components hold local UI state with React hooks
- client components call internal APIs with `fetch`
- responses are used to update local component state

This is still simple and appropriate for the current application size.

## Major Backend Improvements Completed

The current backend is meaningfully improved from the original implementation.

Completed improvements:

- shared Zod schema validation for admin payloads
- reusable validation helpers with typed field errors
- service-layer CRUD extraction
- standardized admin API response helpers
- centralized admin auth wrapper
- role-based authorization for admin routes
- safer multi-step delete and cleanup behavior for projects and images
- clearer separation of route, validation, service, and Supabase layers

## Remaining Weaknesses

- no checked-in SQL migrations or schema versioning
- no documented or enforced row-level security strategy in-repo
- contact API still uses a different response contract than admin APIs
- in-memory rate limiting is not horizontally scalable
- compensating cleanup exists, but true database transactions are not in use
- middleware and admin auth service duplicate some role normalization logic
- no pagination for admin list endpoints
- no automated tests or CI enforcement
- service-role env naming still uses a `NEXT_PUBLIC_` prefix

## Recommended Future Improvements

- add Supabase migrations and operational setup scripts
- rename the service-role env var to a server-only name
- move contact responses onto the shared API response contract
- add Redis or Vercel KV backed rate limiting
- add pagination, filtering, and search for admin endpoints
- move high-risk multi-step operations to SQL/RPC transactional flows where appropriate
- document and enforce RLS policies
- add integration and end-to-end tests for admin APIs
- add structured logging and monitoring
