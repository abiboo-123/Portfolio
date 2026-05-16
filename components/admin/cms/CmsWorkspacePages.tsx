"use client";

import Link from "next/link";
import { CmsPageShell } from "./CmsPageShell";
import { AssetEditor, RepeatableListCard, SectionEditor, SectionPreview } from "./CmsEditors";
import { cmsAreas, contentSectionLabels, type EditableSection } from "./cms-data";
import { useCmsAdminData } from "./useCmsAdminData";

const heroContentFields = [
  { field: "secondaryBody", label: "Secondary paragraph", multiline: true },
  { field: "primaryCtaLabel", label: "Primary CTA label" },
  { field: "primaryCtaHref", label: "Primary CTA href" },
  { field: "secondaryCtaLabel", label: "Resume CTA label" },
  { field: "contactCtaLabel", label: "Contact CTA label" },
  { field: "contactCtaHref", label: "Contact CTA href" },
];

const focusContentFields = [
  { field: "secondaryBody", label: "Secondary paragraph", multiline: true },
];

export function CmsOverviewPage() {
  return (
    <CmsPageShell
      title="Content Management"
      description="Choose a page or content area to edit. CMS records are organized by real portfolio workflows instead of one large centralized editor."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cmsAreas.map((area) => (
          <Link
            key={area.href}
            href={area.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft transition-colors hover:border-accent hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{area.icon}</span>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {area.label}
              </h2>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {area.description}
            </p>
          </Link>
        ))}
      </div>
    </CmsPageShell>
  );
}

export function HomepageCmsPage() {
  const cms = useCmsAdminData();
  const hero = cms.helpers.getSection("homepage.hero");
  const notice = cms.helpers.getSection("homepage.notice");

  return (
    <CmsPageShell
      title="Homepage Content"
      description="Edit homepage-specific content with a visual preview. Public homepage rendering remains unchanged until future dynamic integration."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("Homepage content saved.")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.8fr)]">
        <div className="space-y-4">
          {hero && (
            <SectionEditor
              section={hero}
              contentFields={heroContentFields}
              onChange={(updates) => cms.updateSection(hero.section_key, updates)}
              onContentChange={(field, value) => cms.updateSectionContent(hero.section_key, field, value)}
            />
          )}
          {notice && (
            <SectionEditor
              section={notice}
              onChange={(updates) => cms.updateSection(notice.section_key, updates)}
            />
          )}
        </div>
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <SectionPreview title="Homepage preview" eyebrow="Visual preview">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {hero?.eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {hero?.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{hero?.body}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {String(hero?.content.secondaryBody ?? "")}
            </p>
            {notice?.body && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                🚧 {notice.body}
              </p>
            )}
          </SectionPreview>
        </div>
      </div>
    </CmsPageShell>
  );
}

export function AboutCmsPage() {
  const cms = useCmsAdminData();
  const aboutSections = cms.cmsData.sections.filter((section) => section.section_key.startsWith("about."));

  return (
    <CmsPageShell
      title="About Page Content"
      description="Manage about-page sections independently from homepage and reusable content."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("About content saved.")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.8fr)]">
        <div className="space-y-4">
          {aboutSections.map((section) => (
            <SectionEditor
              key={section.section_key}
              section={section}
              contentFields={section.section_key === "about.focus" ? focusContentFields : []}
              onChange={(updates) => cms.updateSection(section.section_key, updates)}
              onContentChange={(field, value) => cms.updateSectionContent(section.section_key, field, value)}
            />
          ))}
        </div>
        <AboutPreview sections={aboutSections} />
      </div>
    </CmsPageShell>
  );
}

function AboutPreview({ sections }: { sections: EditableSection[] }) {
  const intro = sections.find((section) => section.section_key === "about.intro");
  const focus = sections.find((section) => section.section_key === "about.focus");

  return (
    <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <SectionPreview title="About preview" eyebrow="Visual preview">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {intro?.title ?? "About"}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{intro?.body}</p>
        <div className="mt-4 grid gap-3">
          {sections
            .filter((section) => section.section_key !== "about.intro")
            .map((section) => (
              <div key={section.section_key} className="rounded-lg bg-white p-3 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {section.title || contentSectionLabels[section.section_key]}
                </p>
                {section.body && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{section.body}</p>
                )}
              </div>
            ))}
        </div>
        {typeof focus?.content.secondaryBody === "string" && focus.content.secondaryBody.length > 0 && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            {focus.content.secondaryBody}
          </p>
        )}
      </SectionPreview>
    </div>
  );
}

export function ResumeCmsPage() {
  const cms = useCmsAdminData();
  const resume = cms.helpers.getAsset("resume.current");

  return (
    <CmsPageShell
      title="Resume / CV"
      description="Manage the current resume file and downloadable CV metadata separately from other assets."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("Resume asset saved.")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        {resume && (
          <AssetEditor
            asset={resume}
            uploading={cms.uploadingKey === resume.asset_key}
            onChange={(updates) => cms.updateAsset(resume.asset_key, updates)}
            onUpload={(file) => cms.uploadAsset(resume.asset_key, file)}
          />
        )}
        <SectionPreview title="Resume preview" eyebrow="Download asset">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{resume?.title}</p>
          <p className="mt-2 break-all text-xs text-slate-600 dark:text-slate-400">{resume?.file_url}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            File: {resume?.file_name || "Not set"} · Type: {resume?.file_type || "Unknown"}
          </p>
        </SectionPreview>
      </div>
    </CmsPageShell>
  );
}

export function AssetsCmsPage() {
  const cms = useCmsAdminData();

  return (
    <CmsPageShell
      title="Assets & Profile Images"
      description="Manage profile images and reusable CMS assets. Resume files have a dedicated Resume / CV area."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("Assets saved.")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="space-y-4">
          {cms.cmsData.assets.map((asset) => (
            <AssetEditor
              key={asset.asset_key}
              asset={asset}
              uploading={cms.uploadingKey === asset.asset_key}
              onChange={(updates) => cms.updateAsset(asset.asset_key, updates)}
              onUpload={(file) => cms.uploadAsset(asset.asset_key, file)}
            />
          ))}
        </div>
        <SectionPreview title="Profile / asset preview" eyebrow="Visual preview">
          {cms.helpers.getAsset("profile.image")?.file_url ? (
            <img
              src={cms.helpers.getAsset("profile.image")?.file_url}
              alt={cms.helpers.getAsset("profile.image")?.alt_text || "Profile preview"}
              className="h-40 w-40 rounded-full object-cover"
            />
          ) : (
            <p className="text-sm text-slate-500">No profile image configured.</p>
          )}
        </SectionPreview>
      </div>
    </CmsPageShell>
  );
}

export function SocialLinksCmsPage() {
  const cms = useCmsAdminData();

  return (
    <CmsPageShell
      title="Social Links"
      description="Manage ordered social/media links as an independent content collection."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("Social links saved.")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <RepeatableListCard title="Social / Media Links" description="Ordered links for future footer, contact, and hero integrations." onAdd={cms.addSocialLink}>
          {cms.cmsData.socialLinks.map((link, index) => (
            <div key={link.id ?? index} className="grid gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700 md:grid-cols-5">
              {(["platform", "label", "url", "icon"] as const).map((field) => (
                <input
                  key={field}
                  value={link[field] ?? ""}
                  onChange={(event) => cms.updateSocialLink(index, { [field]: event.target.value })}
                  placeholder={field}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                />
              ))}
              <button type="button" onClick={() => cms.removeSocialLink(index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                Remove
              </button>
            </div>
          ))}
        </RepeatableListCard>
        <SectionPreview title="Social links preview" eyebrow="Collection preview">
          <div className="flex flex-wrap gap-2">
            {cms.cmsData.socialLinks.map((link, index) => (
              <span key={link.id ?? index} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {link.label || link.platform}
              </span>
            ))}
          </div>
        </SectionPreview>
      </div>
    </CmsPageShell>
  );
}

export function SkillsCmsPage() {
  const cms = useCmsAdminData();

  return (
    <CmsPageShell
      title="Skills / Technologies"
      description="Maintain a reusable skill taxonomy for future skills sections and project filtering."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("Skills saved.")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <RepeatableListCard title="Skills / Technologies" description="Group technologies by category and mark key items as featured." onAdd={cms.addSkill}>
          {cms.cmsData.skills.map((skill, index) => (
            <div key={skill.id ?? index} className="grid gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700 md:grid-cols-5">
              {(["name", "category", "proficiency"] as const).map((field) => (
                <input
                  key={field}
                  value={skill[field] ?? ""}
                  onChange={(event) => cms.updateSkill(index, { [field]: event.target.value })}
                  placeholder={field}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                />
              ))}
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={skill.is_featured} onChange={(event) => cms.updateSkill(index, { is_featured: event.target.checked })} />
                Featured
              </label>
              <button type="button" onClick={() => cms.removeSkill(index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                Remove
              </button>
            </div>
          ))}
        </RepeatableListCard>
        <SectionPreview title="Skills preview" eyebrow="Collection preview">
          <div className="flex flex-wrap gap-2">
            {cms.cmsData.skills.map((skill, index) => (
              <span key={skill.id ?? index} className={`rounded-full px-3 py-1 text-xs font-medium ${skill.is_featured ? "bg-accent text-white" : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                {skill.name} · {skill.category}
              </span>
            ))}
          </div>
        </SectionPreview>
      </div>
    </CmsPageShell>
  );
}

export function ContactInfoCmsPage() {
  const cms = useCmsAdminData();

  return (
    <CmsPageShell
      title="Contact Information"
      description="Manage structured contact channels independently from submitted contact-form messages."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("Contact information saved.")}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <RepeatableListCard title="Contact Channels" description="Structured contact details for future contact page and footer rendering." onAdd={cms.addContactChannel}>
          {cms.cmsData.contactChannels.map((channel, index) => (
            <div key={channel.id ?? index} className="grid gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700 md:grid-cols-5">
              {(["channel_type", "label", "value", "url"] as const).map((field) => (
                <input
                  key={field}
                  value={channel[field] ?? ""}
                  onChange={(event) => cms.updateContactChannel(index, { [field]: event.target.value })}
                  placeholder={field}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                />
              ))}
              <button type="button" onClick={() => cms.removeContactChannel(index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                Remove
              </button>
            </div>
          ))}
        </RepeatableListCard>
        <SectionPreview title="Contact preview" eyebrow="Collection preview">
          <dl className="space-y-2 text-sm">
            {cms.cmsData.contactChannels.map((channel, index) => (
              <div key={channel.id ?? index}>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{channel.label}</dt>
                <dd className="text-slate-900 dark:text-slate-100">{channel.value}</dd>
              </div>
            ))}
          </dl>
        </SectionPreview>
      </div>
    </CmsPageShell>
  );
}

export function ReusableSectionsCmsPage() {
  const cms = useCmsAdminData();
  const reusableSections = cms.cmsData.sections.filter(
    (section) => !section.section_key.startsWith("homepage.") && !section.section_key.startsWith("about.")
  );

  return (
    <CmsPageShell
      title="Reusable Sections"
      description="A future-ready workspace for keyed sections that do not belong to a dedicated page yet."
      loading={cms.loading}
      saving={cms.saving}
      error={cms.error}
      success={cms.success}
      onSave={() => cms.saveContent("Reusable sections saved.")}
    >
      {reusableSections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          No extra reusable sections exist yet. Add new stable section keys in the CMS schema/API when a new reusable area is ready.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.8fr)]">
          <div className="space-y-4">
            {reusableSections.map((section) => (
              <SectionEditor key={section.section_key} section={section} onChange={(updates) => cms.updateSection(section.section_key, updates)} />
            ))}
          </div>
          <SectionPreview title="Reusable preview" eyebrow="Section preview">
            {reusableSections.map((section) => (
              <div key={section.section_key} className="mb-3 rounded-lg bg-white p-3 dark:bg-slate-800">
                <p className="font-mono text-xs text-slate-500">{section.section_key}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{section.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{section.body}</p>
              </div>
            ))}
          </SectionPreview>
        </div>
      )}
    </CmsPageShell>
  );
}

export function CmsProjectsBridgePage() {
  return (
    <CmsPageShell
      title="Projects Content"
      description="Project management already has a dedicated CMS workflow with CRUD, preview, sections, and image management."
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Use the Projects workspace</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Projects remain managed through the existing project dashboard so their specialized editing and preview flow stays intact.
        </p>
        <Link href="/admin/projects" className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
          Open Projects
        </Link>
      </div>
    </CmsPageShell>
  );
}
