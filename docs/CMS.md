# CMS Architecture Notes

This project includes an admin-focused CMS foundation that is intentionally separate from the public frontend rendering path.

## Content Model

The CMS uses a small set of scalable content primitives:

- `cms_sections` stores stable keyed content blocks such as `homepage.hero`, `homepage.notice`, `about.intro`, `about.education`, `about.experience`, and `about.focus`.
- `cms_assets` stores managed profile, resume, document, image, and link assets by stable keys such as `profile.image` and `resume.current`.
- `social_links` stores ordered media/profile links.
- `skills` stores ordered technology and skill taxonomy records.
- `contact_channels` stores structured contact details.

These tables are designed to make future public sections editable without requiring a new table for every page section.

## Dashboard Workflow

The CMS admin UI is page/section oriented instead of one giant editor. The `/admin/content` route is an overview that links to focused workspaces:

- `/admin/content/homepage` for homepage hero and notice content
- `/admin/content/about` for about-page intro, education, experience, and focus content
- `/admin/content/projects` as the CMS bridge to the existing specialized `/admin/projects` workflow
- `/admin/content/resume` for the current CV/downloadable resume asset
- `/admin/content/social` for social/media profile links
- `/admin/content/skills` for skills and technology taxonomy records
- `/admin/content/contact` for structured contact information
- `/admin/content/assets` for profile images and reusable assets
- `/admin/content/sections` for future reusable keyed content sections

Each workspace uses shared CMS data-loading and save behavior, while editor and preview components are reused across pages. This keeps admin UX visual and content-oriented without duplicating the backend contract.

The dashboard saves through `GET /api/admin/cms` and `PUT /api/admin/cms`, which use shared validation and the existing admin authorization wrapper.

## Preview Pattern

Preview support is implemented as a reusable admin pattern:

- page workspaces combine form editors with sticky preview cards
- collection workspaces preview ordered links, skills, contact details, or assets
- future CMS areas can reuse the same section editor, asset editor, list card, and preview shell components

## Public Frontend Boundary

The public website is not switched to dynamic CMS rendering yet. Existing public behavior remains intact while the CMS records can be prepared and reviewed in the dashboard.

Future integration can read `published` records by stable keys, then fall back to the current hardcoded copy when records are missing. This enables incremental migration section-by-section rather than a risky rewrite.

## Migration Notes

The SQL files under `supabase/migrations` are additive and reviewable. They must be applied manually to Supabase; the application does not assume automatic migration execution.
