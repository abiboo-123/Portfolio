# CMS Architecture Notes

This project now includes an admin-focused CMS foundation that is intentionally separate from the public frontend rendering path.

## Content Model

The CMS uses a small set of scalable content primitives:

- `cms_sections` stores stable keyed content blocks such as `homepage.hero`, `homepage.notice`, `about.intro`, `about.education`, `about.experience`, and `about.focus`.
- `cms_assets` stores managed profile, resume, document, image, and link assets by stable keys such as `profile.image` and `resume.current`.
- `social_links` stores ordered media/profile links.
- `skills` stores ordered technology and skill taxonomy records.
- `contact_channels` stores structured contact details.

These tables are designed to make future public sections editable without requiring a new table for every page section.

## Dashboard Workflow

The `/admin/content` dashboard route edits the CMS records through grouped forms:

- editable section copy and hero-specific CTA fields
- profile image and resume file management
- repeatable social links
- repeatable skills and technologies
- repeatable contact channels

The dashboard saves through `GET /api/admin/cms` and `PUT /api/admin/cms`, which use shared validation and the existing admin authorization wrapper.

## Public Frontend Boundary

The public website is not switched to dynamic CMS rendering yet. Existing public behavior remains intact while the CMS records can be prepared and reviewed in the dashboard.

Future integration can read `published` records by stable keys, then fall back to the current hardcoded copy when records are missing. This enables incremental migration section-by-section rather than a risky rewrite.

## Migration Notes

The SQL files under `supabase/migrations` are additive and reviewable. They must be applied manually to Supabase; the application does not assume automatic migration execution.
