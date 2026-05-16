-- CMS foundation for editable portfolio content.
-- This migration is intentionally additive and does not change public rendering.

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  eyebrow text,
  body text,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  order_index integer not null default 0 check (order_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  title text not null,
  asset_type text not null check (asset_type in ('image', 'document', 'link')),
  file_url text not null,
  file_name text,
  file_type text,
  alt_text text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  icon text,
  order_index integer not null default 0 check (order_index >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  proficiency text,
  order_index integer not null default 0 check (order_index >= 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_channels (
  id uuid primary key default gen_random_uuid(),
  channel_type text not null,
  label text not null,
  value text not null,
  url text,
  order_index integer not null default 0 check (order_index >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cms_sections_status_order_idx on public.cms_sections (status, order_index);
create index if not exists cms_assets_active_type_idx on public.cms_assets (is_active, asset_type);
create index if not exists social_links_active_order_idx on public.social_links (is_active, order_index);
create index if not exists skills_active_category_order_idx on public.skills (is_active, category, order_index);
create index if not exists contact_channels_active_order_idx on public.contact_channels (is_active, order_index);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'cms_sections_set_updated_at') then
    create trigger cms_sections_set_updated_at
      before update on public.cms_sections
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'cms_assets_set_updated_at') then
    create trigger cms_assets_set_updated_at
      before update on public.cms_assets
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'social_links_set_updated_at') then
    create trigger social_links_set_updated_at
      before update on public.social_links
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'skills_set_updated_at') then
    create trigger skills_set_updated_at
      before update on public.skills
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'contact_channels_set_updated_at') then
    create trigger contact_channels_set_updated_at
      before update on public.contact_channels
      for each row execute function public.set_updated_at();
  end if;
end $$;

insert into public.cms_sections (section_key, title, eyebrow, body, content, status, order_index)
values
  ('homepage.hero', 'Hi, I''m Habib Mohamed Gouda.', 'Back-End Developer · AI-Focused CS Student', 'I build scalable backend systems and real-time applications using Node.js, TypeScript, and modern web technologies.', '{"secondaryBody":"My goal is to combine backend engineering with AI-driven solutions to build high-performance, scalable intelligent applications.","primaryCtaLabel":"View Projects","primaryCtaHref":"/projects","secondaryCtaLabel":"Download CV","contactCtaLabel":"Contact Me","contactCtaHref":"/contact"}'::jsonb, 'draft', 10),
  ('homepage.notice', 'Portfolio update notice', null, 'This portfolio is actively being updated — more projects and detailed case studies are coming soon.', '{}'::jsonb, 'draft', 20),
  ('about.intro', 'About', null, 'I''m a back-end developer and Computer Science & Artificial Intelligence student based in Ingolstadt, Germany. I enjoy designing and building scalable systems that combine reliable infrastructure with intelligent behavior.', '{}'::jsonb, 'draft', 30),
  ('about.education', 'Education', null, null, '{"items":[{"title":"Technische Hochschule Ingolstadt","subtitle":"B.Sc. Computer Science & Artificial Intelligence","details":["Algorithms for AI","Software Engineering","Web Technologies","Data Structures"]},{"title":"Fayoum University","subtitle":"B.Sc. (Years 1–2 completed)","details":["Foundational Computer Science curriculum with a strong focus on mathematics, programming, and problem solving."]}]}'::jsonb, 'draft', 40),
  ('about.experience', 'Professional Experience', null, null, '{"items":[{"title":"Back-End Developer – QoneQ Startup (Remote)","details":["Built and optimized 6 backend microservices.","Implemented WebSocket-based real-time communication for interactive features.","Integrated Firebase Cloud Messaging for reliable push notifications.","Used Swagger and Postman to design, document, and test APIs.","Focused on scalability, modular architecture, and clean service boundaries."]}]}'::jsonb, 'draft', 50),
  ('about.focus', 'Backend & AI Focus', null, 'I enjoy working at the intersection of backend systems, data infrastructure, and applied AI.', '{"secondaryBody":"My current interests include event-driven architectures, real-time applications, and ways to bring AI models closer to production backends through efficient inference pipelines and thoughtful system design."}'::jsonb, 'draft', 60)
on conflict (section_key) do nothing;

insert into public.cms_assets (asset_key, title, asset_type, file_url, file_name, file_type, alt_text, metadata, is_active)
values
  ('profile.image', 'Profile image', 'image', '/profile.jpg', 'profile.jpg', 'image/jpeg', 'Portrait of Habib Mohamed Gouda', '{}'::jsonb, true),
  ('resume.current', 'Current CV / Resume', 'document', 'https://drive.google.com/file/d/1BnEf5oWKXHDRSoB6aJ_fsal_rJiH26jD/view?usp=sharing', 'Habib Mohamed Gouda CV', 'application/pdf', null, '{}'::jsonb, true)
on conflict (asset_key) do nothing;

insert into public.social_links (platform, label, url, icon, order_index, is_active)
values
  ('LinkedIn', 'LinkedIn', 'https://www.linkedin.com/in/habib-mohamed-gouda/', 'linkedin', 10, true),
  ('GitHub', 'GitHub', 'https://github.com/abiboo-123', 'github', 20, true)
on conflict do nothing;

insert into public.contact_channels (channel_type, label, value, url, order_index, is_active)
values
  ('email', 'Email', 'habib.attia.gouda@gmail.com', 'mailto:habib.attia.gouda@gmail.com', 10, true),
  ('location', 'Location', '85055 Ingolstadt, Germany', null, 20, true)
on conflict do nothing;
