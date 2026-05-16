# CMS Guide

This document explains the current CMS/dashboard implementation and how it relates to the public frontend.

## Current Boundary

The admin CMS is dynamic and backed by Supabase. Admins can load, edit, upload, preview, and save CMS-managed records.

The public frontend intentionally still preserves mostly static rendering for generic page content. Project routes already read project data from Supabase, but the newer CMS section, asset, social-link, skill, and contact-channel records are not yet fully enabled as public rendering sources.

Future public integration should be incremental: read `published` CMS records by stable key and fall back to current static content when no suitable record exists.

## Content Model

The CMS uses reusable primitives rather than one table per page section.

### `cms_sections`

Stores stable-keyed editable content blocks.

Important fields:

- `section_key` - unique stable key such as `homepage.hero` or `about.focus`.
- `title` - optional section heading.
- `eyebrow` - optional small heading/label.
- `body` - optional main rich/plain body text.
- `content` - JSON object for structured fields such as CTA labels, CTA links, or repeated content items.
- `status` - `draft`, `published`, or `archived`.
- `order_index` - ordering within admin/page groupings.

Seeded section keys include:

- `homepage.hero`
- `homepage.notice`
- `about.intro`
- `about.education`
- `about.experience`
- `about.focus`

### `cms_assets`

Stores stable-keyed reusable assets.

Important fields:

- `asset_key` - unique stable key such as `profile.image` or `resume.current`.
- `asset_type` - `image`, `document`, or `link`.
- `file_url` - public URL or root-relative path.
- `file_name`, `file_type`, `alt_text`, `metadata`, and `is_active`.

### `social_links`

Stores ordered social/media links with platform, label, URL, optional icon, active flag, and order index.

### `skills`

Stores ordered skill records with category, optional proficiency, featured flag, active flag, and order index.

### `contact_channels`

Stores structured contact methods such as email, location, or future phone/profile channels.

## Admin Navigation

The admin sidebar exposes the main dashboard areas:

- Dashboard
- Projects
- Content CMS
- Messages
- View Public Site

The Content CMS overview is a page/content-area launcher. It points to focused workspaces:

- `/admin/content/homepage`
- `/admin/content/about`
- `/admin/content/projects`
- `/admin/content/resume`
- `/admin/content/social`
- `/admin/content/skills`
- `/admin/content/contact`
- `/admin/content/assets`
- `/admin/content/sections`

## Workspace Responsibilities

### Homepage

Edits homepage-specific sections:

- hero title, eyebrow, body, secondary body, and CTA metadata
- homepage notice copy

### About

Edits about-page sections:

- intro
- education
- experience
- backend/AI focus

Structured education and experience items currently live in the JSON `content` field.

### Projects

Acts as a CMS bridge to the specialized project CRUD workflow at `/admin/projects`. Projects remain a dedicated content type because they have their own sections, images, slugs, statuses, and public detail pages.

### Resume / CV

Edits the `resume.current` asset and supports upload through the shared admin upload endpoint.

### Social Links

Manages repeatable ordered `social_links` rows. Editors can add, update, reorder by changing `order_index`, activate/deactivate, or remove rows.

### Skills

Manages repeatable ordered `skills` rows with categories, featured flags, and active flags.

### Contact Info

Manages repeatable ordered `contact_channels` rows for structured contact details.

### Assets

Manages profile image and reusable CMS assets. Uploads update the asset URL in local admin state; saving the workspace persists the CMS asset record.

### Reusable Sections

Provides a place for keyed content sections that do not yet have a dedicated page workspace or public integration.

## Editor and Preview Pattern

CMS workspaces use shared editor/preview components:

- section editors update `title`, `eyebrow`, `body`, `status`, `order_index`, and known JSON content fields
- asset editors update asset metadata and support uploads
- repeatable list cards manage social links, skills, and contact channels
- preview cards show a local representation of the edited content before saving

These previews are admin-side review aids. They do not yet represent a full public live-preview system.

## CMS API Data Flow

### Load

1. A CMS workspace mounts.
2. `useCmsAdminData` requests `GET /api/admin/cms`.
3. The route requires an authorized admin.
4. The service loads sections, assets, social links, skills, and contact channels.
5. The workspace stores the response in local React state.

### Edit

Editors update local state first. Changes are not persisted until the workspace save action runs.

### Upload

1. An asset editor sends a file to `POST /api/admin/upload`.
2. The upload route validates the file and type.
3. The service stores it in the `portfolio-images` bucket.
4. The returned URL is applied to the local asset state.
5. The admin must save the CMS workspace to persist the asset metadata.

### Save

1. The workspace sends the full CMS payload to `PUT /api/admin/cms`.
2. The route validates with `cmsPayloadSchema`.
3. The service upserts stable-keyed sections and assets.
4. The service replaces repeatable collection rows by comparing submitted IDs with current IDs.
5. Saved data is reloaded and returned.

## Implementation Decisions

- Stable keys (`section_key`, `asset_key`) make public integration predictable.
- Generic sections avoid schema churn for every small page copy change.
- JSON `content` allows structured content without immediately requiring specialized tables.
- Page-oriented workspaces make the UI easier to understand than editing raw tables.
- Public rendering remains deliberately conservative until published CMS reads and fallbacks are implemented.

## Future CMS Roadmap

- Wire public pages to read `published` CMS records with static fallbacks.
- Add stricter structured schemas for JSON `content` fields once public rendering depends on them.
- Add revision history or audit trails for content changes.
- Improve asset reuse and browsing.
- Add draft/published preview capabilities if needed.
- Add tests for CMS validation, API routes, and service saves.
