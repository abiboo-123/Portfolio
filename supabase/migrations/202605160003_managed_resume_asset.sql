-- Move the seeded resume asset away from temporary external-link behavior.
-- Real uploaded resume files are stored in Supabase Storage and persisted to cms_assets.file_url.

update public.cms_assets
set
  file_url = '/documents/resume.pdf',
  file_name = 'Managed resume upload pending',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('managed_upload_required', true),
  updated_at = now()
where asset_key = 'resume.current'
  and file_url = 'https://drive.google.com/file/d/1BnEf5oWKXHDRSoB6aJ_fsal_rJiH26jD/view?usp=sharing';
