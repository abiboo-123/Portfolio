# Habib Mohamed Gouda Portfolio

A Next.js 14 portfolio application with a public portfolio site, an authenticated admin dashboard, a Supabase-backed CMS foundation, structured validation, and service-layer backend operations.

## Current State

The repository currently contains two intentionally different surfaces:

- **Admin CMS/dashboard:** dynamic and Supabase-backed. Admins can manage projects, contact messages, editable CMS content groups, reusable assets, social links, skills, and contact channels.
- **Public frontend:** mostly preserves the existing static/server-rendered portfolio behavior. Project pages read project data from Supabase, but the newer page-oriented CMS records are not yet fully wired into public rendering. Future frontend integration is planned to happen incrementally with safe fallbacks.

This boundary is deliberate: the CMS can evolve and content can be prepared without forcing a risky public-site rendering rewrite.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, and Storage
- Zod validation
- Vercel Analytics

## Core Features

### Public Portfolio

- Server-rendered homepage, about page, projects list, project details, and contact page.
- Supabase-backed project listing and project detail pages.
- Structured project sections and project image galleries.
- Contact form validation, sanitization, in-memory rate limiting, and Supabase persistence.
- SEO support through metadata, `robots.ts`, and `sitemap.ts`.

### Admin Dashboard

- Supabase email/password login.
- Middleware-protected `/admin/*` pages.
- Role-based admin authorization using Supabase user metadata.
- Dashboard stats for projects, new messages, editable CMS sections, and draft CMS sections.
- Sidebar navigation for Dashboard, Projects, Content CMS, Messages, and public-site access.
- Project CRUD workflows with section and image management.
- Message inbox with status filtering and status updates.
- Page-oriented CMS workspaces for homepage, about, projects, resume, social links, skills, contact info, assets, and reusable sections.
- CMS preview cards and editor flows that let admins review changes before saving.

### Backend Systems

- Thin API route handlers under `app/api/`.
- Shared Zod schemas in `lib/validation/`.
- Standard admin API response envelopes in `lib/api/`.
- Reusable admin, contact, auth, and error services in `lib/services/`.
- Supabase client separation for browser auth, session-aware server auth, public/server reads, and privileged service-role operations.
- Upload validation for images and PDFs up to 10 MB.
- Best-effort Supabase Storage cleanup for deleted project images and featured images.

## Documentation Map

- [Architecture](./ARCHITECTURE.md) - full system architecture and boundaries.
- [CMS](./docs/CMS.md) - CMS content model, page-oriented dashboard, preview behavior, and frontend integration plan.
- [Backend](./docs/BACKEND.md) - validation, service layer, upload behavior, and backend roadmap.
- [API](./docs/API.md) - public and admin HTTP contracts.
- [Supabase](./docs/SUPABASE.md) - database tables, migrations, storage, auth metadata, and operations.
- [Admin Auth](./docs/ADMIN_AUTH.md) - authentication, authorization, role metadata, and limitations.
- [AI Contract](./AI_CONTRACT.md) - implementation guardrails for AI-assisted work.

## Environment Variables

Create `.env.local` in the repository root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_ROLE=admin
```

### Environment Notes

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anonymous key used by browser auth and public/server reads.
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`: current service-role key read by the server-side privileged Supabase client.
- `ADMIN_ROLE`: required admin role; defaults to `admin` when unset.

Important: the service-role key is named with a `NEXT_PUBLIC_` prefix because that is how the current code reads it. Treat it as server-only secret material and never expose it to browser code or public runtime output. A future cleanup should rename it to `SUPABASE_SERVICE_ROLE_KEY` or another server-only name.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Provision or verify the base portfolio tables, then apply the additive migrations in `supabase/migrations`:

```text
supabase/migrations/202605160001_cms_foundation.sql
supabase/migrations/202605160002_message_status_expansion.sql
```

The application expects these tables:

- `projects`
- `project_sections`
- `project_images`
- `contact_messages`
- `cms_sections`
- `cms_assets`
- `social_links`
- `skills`
- `contact_channels`

The application also expects a public Supabase Storage bucket named `portfolio-images`.

See [docs/SUPABASE.md](./docs/SUPABASE.md) for schema and storage details.

### 3. Configure an admin user

Create a Supabase Auth user and assign the configured admin role through user metadata. Preferred metadata:

```json
{
  "role": "admin"
}
```

The backend also supports role arrays such as `{ "roles": ["admin"] }` in `app_metadata` or `user_metadata`.

### 4. Add static assets

The current public frontend still expects the profile fallback image at:

```text
public/profile.jpg
```

### 5. Run locally

```bash
npm run dev
```

Open <http://localhost:3000> for the public site and <http://localhost:3000/admin/login> for the admin login.

### 6. Type-check

```bash
npx tsc --noEmit
```

## Project Structure

```text
.
|-- app/
|   |-- admin/                  # Protected dashboard pages and CMS workspaces
|   |-- api/                    # Public and admin route handlers
|   |-- about/                  # Public about page
|   |-- contact/                # Public contact page
|   |-- projects/               # Public project pages
|   |-- layout.tsx
|   |-- page.tsx
|   |-- robots.ts
|   `-- sitemap.ts
|-- components/
|   |-- admin/                  # Dashboard, project, and CMS UI components
|   `-- ...
|-- docs/                       # Backend, API, CMS, Supabase, and auth docs
|-- lib/
|   |-- api/                    # API response/client helpers
|   |-- contact/                # Contact form sanitization/types
|   |-- services/               # Admin/contact/auth service layer
|   |-- validation/             # Shared Zod schemas/helpers
|   `-- supabase-*.ts           # Supabase clients by runtime responsibility
|-- supabase/migrations/        # Additive SQL migrations
|-- types/                      # Shared TypeScript domain types
|-- middleware.ts               # Admin page auth gate
|-- ARCHITECTURE.md
|-- AI_CONTRACT.md
|-- package.json
`-- README.md
```

## Admin CMS Content Groups

The Content CMS overview links to focused workspaces rather than one large editor:

- Homepage: hero and homepage notice sections.
- About: intro, education, experience, and focus sections.
- Projects: bridge to the specialized project CRUD workflow.
- Resume / CV: current downloadable resume asset.
- Social Links: ordered external profile links.
- Skills: ordered technology/category taxonomy.
- Contact Info: structured contact channels.
- Assets: profile image and reusable CMS assets.
- Reusable Sections: keyed content sections for future expansion.

The CMS stores content in generic, stable-keyed records that can later power public frontend sections without creating a new table for every page block.

## API Overview

Public:

- `POST /api/contact`

Admin:

- `GET /api/admin/cms`
- `PUT /api/admin/cms`
- `GET /api/admin/messages`
- `GET /api/admin/messages/:id`
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

Admin API routes require a valid Supabase session and the configured admin role.

## Deployment Notes

This application is suitable for Vercel with Supabase as the managed backend.

Recommended deployment flow:

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Configure all environment variables in Vercel.
4. Apply Supabase migrations and verify base project/contact tables.
5. Configure the `portfolio-images` storage bucket.
6. Create or update at least one admin user with the required role.
7. Deploy and verify public pages, admin login, uploads, CMS save behavior, and message status updates.

## Current Limitations and Roadmap

Current limitations:

- The dynamic admin CMS is implemented, but public pages do not yet fully consume CMS section, asset, social, skill, or contact-channel data.
- Contact API responses still use a public-specific envelope instead of the shared admin API envelope.
- Contact rate limiting is in memory and is not horizontally scalable.
- RLS and storage policy SQL are not checked into the repository.
- Service-role environment variable naming should be changed to a server-only name.
- Automated tests and monitoring are not yet implemented.

Planned direction:

- Incrementally read published CMS records on public pages with static fallbacks.
- Add stronger migration and policy documentation.
- Add pagination/search/filtering to admin list endpoints.
- Add audit logging or activity history for admin changes.
- Add service/route tests and CI checks.
- Add operational monitoring and structured logging.
