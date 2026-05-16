# Architecture

This document describes the current architecture of the portfolio application, including the evolved admin CMS/dashboard, backend service layer, Supabase integration, validation model, upload flow, and the intentional boundary between the dynamic admin system and the mostly static public frontend.

## System Overview

The repository is a single Next.js 14 App Router application with four major responsibilities:

1. **Public portfolio website** - renders the visitor-facing homepage, about page, projects, project details, and contact page.
2. **Authenticated admin dashboard** - provides project, message, CMS content, asset, and metadata management.
3. **Internal backend APIs** - expose public contact submission and protected admin mutation/read endpoints.
4. **Supabase backend integration** - provides authentication, database persistence, and object storage.

The current architecture is intentionally layered:

```text
UI pages/components
  -> route handlers
    -> validation helpers and schemas
      -> service-layer functions
        -> Supabase clients
          -> database/storage/auth
```

## Current System Boundary

The admin CMS is now dynamic. Admin content records, reusable assets, links, skills, and contact channels are loaded from and saved to Supabase through protected admin APIs.

The public frontend has not yet been fully converted to dynamic CMS rendering. Existing public pages intentionally preserve their current static/server-rendered behavior while dynamic CMS data is prepared in the dashboard. Project data is already Supabase-backed on public project routes, but generic CMS sections and assets are not the primary source of public page rendering yet.

Future frontend integration should read `published` CMS records by stable keys, then fall back to existing hardcoded/static content when records are missing. This enables safe incremental migration by section.

## Frontend Architecture

### Public Site

Public routes:

- `/`
- `/about`
- `/projects`
- `/projects/[slug]`
- `/contact`

Responsibilities:

- render the public portfolio experience
- fetch public project records for project lists and details
- render project sections and image galleries
- submit contact form data to `POST /api/contact`
- preserve stable SEO and static fallback content while CMS integration evolves

Public rendering is mostly server-component oriented. Client-side interactivity is used where needed, such as the contact form and theme behavior.

### Admin Dashboard

Admin page routes:

- `/admin/login`
- `/admin/dashboard`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`
- `/admin/messages`
- `/admin/content`
- `/admin/content/homepage`
- `/admin/content/about`
- `/admin/content/projects`
- `/admin/content/resume`
- `/admin/content/social`
- `/admin/content/skills`
- `/admin/content/contact`
- `/admin/content/assets`
- `/admin/content/sections`

The dashboard uses a persistent topbar/sidebar layout. The sidebar groups the primary workflows as Dashboard, Projects, Content CMS, Messages, and a public-site link.

Admin pages rely heavily on client components because they manage:

- local form state
- previews
- collection editing
- upload controls
- optimistic or immediate UI updates after API calls
- browser-side Supabase login/logout

### Page-Oriented CMS Structure

The CMS is organized around portfolio editing workflows rather than database tables. The `/admin/content` overview links to page/content workspaces:

- **Homepage** - hero and notice sections.
- **About** - intro, education, experience, and focus sections.
- **Projects** - bridge to the specialized project management workflow.
- **Resume / CV** - current resume asset metadata and upload behavior.
- **Social Links** - ordered social/media links.
- **Skills** - skill taxonomy and featured/active flags.
- **Contact Info** - structured contact channels.
- **Assets** - profile image and reusable assets.
- **Reusable Sections** - future keyed content sections not tied to one page yet.

This gives editors a page-based mental model while preserving a reusable backend content model.

### Preview Architecture

CMS preview behavior is implemented in the admin UI, not by changing public page rendering yet.

Current preview patterns:

- section editors render adjacent preview cards
- homepage and about pages preview meaningful page-level layout fragments
- asset editors show file metadata and image previews where applicable
- collection editors preview ordered links, skills, and contact-channel rows

The preview system is intentionally an admin review aid. It is not yet a full public-page live preview pipeline.

## Backend Architecture

The backend lives inside the Next.js application through route handlers and shared libraries.

### Public Backend

Current public endpoint:

- `POST /api/contact`

Responsibilities:

- check JSON request body expectations
- validate contact input
- sanitize user-provided text
- apply in-memory IP-based rate limiting
- persist sanitized messages to `contact_messages`

The public contact route still uses its own response envelope and is not fully aligned with the admin API response contract.

### Admin Backend

Admin endpoints live under `app/api/admin/` and are protected by role-based authorization.

Responsibilities:

- authenticate and authorize every request
- parse JSON or multipart form data
- validate payloads with shared Zod schemas
- delegate business operations to services
- return standard admin API response envelopes

### Route Handler Layer

Route handlers are intentionally thin. They usually:

1. wrap the handler with `withAdminRoute(...)` for admin APIs
2. parse request input
3. validate payloads with `validateSchema(...)`
4. call a service-layer function
5. return `apiSuccess(...)`, `apiValidationError(...)`, or another shared response helper

### Validation Layer

Files:

- `lib/validation/schemas.ts`
- `lib/validation/helpers.ts`

Validated payload families:

- contact form submissions
- projects
- project sections
- project images
- message status updates
- CMS sections/assets/social links/skills/contact channels
- uploads

Validation decisions:

- Zod schemas are the source of truth for payload shape and normalization.
- Field-level errors are returned to admin clients for maintainable forms.
- URL-like fields accept full URLs or root-relative paths when appropriate so static/public assets and Supabase Storage URLs can both be used.
- Uploads accept images and PDFs up to 10 MB.

### API Response Layer

Files:

- `lib/api/responses.ts`
- `lib/api/client.ts`
- `lib/services/http.ts`

Admin response envelope:

```json
{
  "success": true,
  "data": {}
}
```

Admin error envelope:

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

The admin client helper parses this envelope and converts backend errors into usable UI messages.

### Service Layer

Files:

- `lib/services/admin.ts`
- `lib/services/contact.ts`
- `lib/services/admin-auth.ts`
- `lib/services/admin-roles.ts`
- `lib/services/errors.ts`
- `lib/services/http.ts`

The service layer owns business logic and Supabase operations.

Current admin service responsibilities:

- project create/update/delete
- project section create/update/delete
- project image create/update/delete
- dashboard stats
- contact message listing, detail lookup, status counts, and status updates
- upload handling for project/profile/resume/CMS files
- CMS data loading and saving
- replacement-style saves for repeatable CMS collections
- best-effort storage cleanup for deleted project assets
- compensating rollback when project relation deletion succeeds but parent deletion fails

### Authentication and Authorization

Authentication is provided by Supabase Auth.

Authorization is role-based and enforced in two places:

- `middleware.ts` protects admin pages.
- `lib/services/admin-auth.ts` protects admin API routes and server-side admin checks.

The current role sources are:

- `app_metadata.roles`
- `app_metadata.role`
- `user_metadata.roles`
- `user_metadata.role`

The required role is `ADMIN_ROLE`, falling back to `admin`.

Admin API routes re-check authorization even though middleware protects pages. This prevents direct API access by non-admin users.

## Supabase Integration Architecture

Supabase clients are separated by responsibility.

### Public/Server Reads

`lib/supabase-server.ts`

- creates a server-side Supabase client using anon credentials
- used by public/server-rendered data reads

### Browser Auth

`lib/supabase-client.ts`

- creates the browser client
- used by login/logout and client-side auth interactions

### Session-Aware Server Auth

`lib/supabase-auth.ts`

- creates a cookie-aware Supabase server client
- used to resolve the current authenticated user on the server

### Privileged Admin Operations

`lib/supabase-admin.ts`

- creates a service-role Supabase client
- used for admin service-layer writes and storage operations
- must remain server-only

## Database Architecture

### Existing Project and Contact Tables

- `projects` - top-level project records.
- `project_sections` - ordered structured project detail sections.
- `project_images` - ordered project gallery image records.
- `contact_messages` - public contact submissions with admin-managed workflow status.

### CMS Tables

- `cms_sections` - stable-keyed editable sections with `title`, `eyebrow`, `body`, JSON `content`, `status`, and `order_index`.
- `cms_assets` - stable-keyed image/document/link assets with file metadata and active flag.
- `social_links` - ordered external profile links.
- `skills` - ordered skill/category records with featured and active flags.
- `contact_channels` - ordered structured contact methods.

### Message Status System

The contact message workflow currently supports:

- `new`
- `delivered`
- `read`
- `replied`
- `archived`

The admin messages UI can filter by status and update a selected message's status.

### Migration Structure

SQL migrations live under `supabase/migrations` and are currently applied manually.

Current migrations:

- `202605160001_cms_foundation.sql` - adds CMS tables, indexes, updated-at triggers, and seed records.
- `202605160002_message_status_expansion.sql` - expands `contact_messages.status` workflow values and adds a status/created index.

The migrations are additive with respect to public rendering. The CMS foundation does not automatically switch public pages to dynamic CMS content.

## Upload and Storage Architecture

Supabase Storage bucket:

- `portfolio-images`

Upload endpoint:

- `POST /api/admin/upload`

Accepted upload types:

- `featured`
- `project`
- `profile`
- `resume`
- `cms`

Accepted file formats:

- images
- PDFs

Maximum size:

- 10 MB

Upload flow:

1. Admin UI submits multipart form data.
2. Route validates the file, upload type, and optional project ID.
3. Service builds a bucket path using the upload type and timestamped file name.
4. Service uploads to `portfolio-images` with an appropriate content type.
5. Service returns a public URL.
6. Admin UI stores that URL in a project image, project featured image, or CMS asset record.

Cleanup behavior:

- deleting project images attempts to remove the referenced Supabase Storage object
- deleting projects attempts cleanup for featured image and gallery image URLs
- cleanup is best-effort and logs warnings rather than failing an otherwise successful database delete
- cleanup only handles URLs that can be mapped back to the configured public Supabase Storage bucket

## CMS Data Flow

### Load Flow

1. CMS workspace mounts in the admin dashboard.
2. `useCmsAdminData` calls `GET /api/admin/cms`.
3. The API route uses `withAdminRoute(...)`.
4. The service reads `cms_sections`, `cms_assets`, `social_links`, `skills`, and `contact_channels`.
5. Data is returned to the workspace for editing and preview.

### Save Flow

1. Admin edits section fields, asset metadata, or repeatable collection rows.
2. The workspace sends the full CMS payload to `PUT /api/admin/cms`.
3. The route validates the payload with `cmsPayloadSchema`.
4. The service upserts stable-keyed `cms_sections` and `cms_assets`.
5. The service replaces repeatable rows for `social_links`, `skills`, and `contact_channels` by comparing submitted IDs to current IDs.
6. The service reloads and returns the saved CMS data.

This model keeps stable content records addressable by key while allowing list-style records to be added, edited, reordered, or removed.

## State Management

There is no global client-side state library.

Current state pattern:

- server components fetch initial data when appropriate
- client components own local editing state with React hooks
- client components call internal APIs with `fetch`
- API responses update local UI state
- CMS workspaces centralize CMS fetch/save/update helpers in `useCmsAdminData`

This is appropriate for the current application size.

## Scalability Considerations

Strengths already in place:

- route handlers are thin
- validation is centralized
- admin authorization is consistently applied to API routes
- business logic is reusable through services
- CMS tables are generic and stable-keyed rather than page-table-specific
- upload and delete flows have cleanup safeguards

Known limitations:

- in-memory contact rate limiting does not scale across multiple instances
- admin list endpoints do not yet support pagination/search/filtering
- high-risk multi-step database operations are not true database transactions
- RLS and storage policies are not versioned in the repository
- no audit log exists for admin actions
- no automated tests or monitoring are currently present
- service-role env var naming should become server-only

## Roadmap

### Frontend Dynamic Integration

- Read `published` CMS sections by stable keys on public pages.
- Use current static content as fallback when CMS records are missing or drafts.
- Integrate `cms_assets` for profile image and resume links.
- Integrate `social_links`, `skills`, and `contact_channels` into public components.
- Add preview/draft strategies only after public published rendering is stable.

### CMS Evolution

- Add richer content schemas for JSON `content` fields as public usage grows.
- Add validation for page-specific structured content where needed.
- Add revision history, draft/publish workflows, or scheduled publishing if editing complexity increases.
- Add per-section preview routes if public-preview requirements become more advanced.

### Admin Improvements

- Add pagination/search/filtering for messages and projects.
- Add audit logging for content and project mutations.
- Improve upload browsing and asset reuse.
- Add more granular permissions if multiple admin roles are introduced.

### Backend and Operations

- Rename the service-role env var to a server-only name.
- Add checked-in RLS and storage policy SQL.
- Add integration/unit tests for validation, services, and route handlers.
- Add CI checks for type checking and linting.
- Add structured logging and monitoring for admin errors, contact failures, and storage cleanup issues.
