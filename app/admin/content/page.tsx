"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { parseAdminApiResponse } from "@/lib/api/client";
import type {
  CmsAdminData,
  CmsAsset,
  CmsSection,
  ContactChannel,
  Skill,
  SocialLink,
} from "@/types/cms";

type EditableSection = Pick<
  CmsSection,
  "section_key" | "title" | "eyebrow" | "body" | "content" | "status" | "order_index"
>;

type EditableAsset = Pick<
  CmsAsset,
  | "asset_key"
  | "title"
  | "asset_type"
  | "file_url"
  | "file_name"
  | "file_type"
  | "alt_text"
  | "metadata"
  | "is_active"
>;

type EditableSocialLink = Partial<Pick<SocialLink, "id">> &
  Pick<SocialLink, "platform" | "label" | "url" | "icon" | "order_index" | "is_active">;

type EditableSkill = Partial<Pick<Skill, "id">> &
  Pick<Skill, "name" | "category" | "proficiency" | "order_index" | "is_featured" | "is_active">;

type EditableContactChannel = Partial<Pick<ContactChannel, "id">> &
  Pick<ContactChannel, "channel_type" | "label" | "value" | "url" | "order_index" | "is_active">;

type EditableCmsData = {
  sections: EditableSection[];
  assets: EditableAsset[];
  socialLinks: EditableSocialLink[];
  skills: EditableSkill[];
  contactChannels: EditableContactChannel[];
};

const defaultSections: EditableSection[] = [
  {
    section_key: "homepage.hero",
    title: "Hi, I'm Habib Mohamed Gouda.",
    eyebrow: "Back-End Developer · AI-Focused CS Student",
    body: "I build scalable backend systems and real-time applications using Node.js, TypeScript, and modern web technologies.",
    content: {
      secondaryBody:
        "My goal is to combine backend engineering with AI-driven solutions to build high-performance, scalable intelligent applications.",
      primaryCtaLabel: "View Projects",
      primaryCtaHref: "/projects",
      secondaryCtaLabel: "Download CV",
      contactCtaLabel: "Contact Me",
      contactCtaHref: "/contact",
    },
    status: "draft",
    order_index: 10,
  },
  {
    section_key: "homepage.notice",
    title: "Portfolio update notice",
    eyebrow: "",
    body: "This portfolio is actively being updated — more projects and detailed case studies are coming soon.",
    content: {},
    status: "draft",
    order_index: 20,
  },
  {
    section_key: "about.intro",
    title: "About",
    eyebrow: "",
    body: "I'm a back-end developer and Computer Science & Artificial Intelligence student based in Ingolstadt, Germany.",
    content: {},
    status: "draft",
    order_index: 30,
  },
  {
    section_key: "about.focus",
    title: "Backend & AI Focus",
    eyebrow: "",
    body: "I enjoy working at the intersection of backend systems, data infrastructure, and applied AI.",
    content: {
      secondaryBody:
        "My current interests include event-driven architectures, real-time applications, and ways to bring AI models closer to production backends.",
    },
    status: "draft",
    order_index: 60,
  },
];

const defaultAssets: EditableAsset[] = [
  {
    asset_key: "profile.image",
    title: "Profile image",
    asset_type: "image",
    file_url: "/profile.jpg",
    file_name: "profile.jpg",
    file_type: "image/jpeg",
    alt_text: "Portrait of Habib Mohamed Gouda",
    metadata: {},
    is_active: true,
  },
  {
    asset_key: "resume.current",
    title: "Current CV / Resume",
    asset_type: "document",
    file_url:
      "https://drive.google.com/file/d/1BnEf5oWKXHDRSoB6aJ_fsal_rJiH26jD/view?usp=sharing",
    file_name: "Habib Mohamed Gouda CV",
    file_type: "application/pdf",
    alt_text: "",
    metadata: {},
    is_active: true,
  },
];

const emptyData: EditableCmsData = {
  sections: defaultSections,
  assets: defaultAssets,
  socialLinks: [],
  skills: [],
  contactChannels: [],
};

const contentSectionLabels: Record<string, string> = {
  "homepage.hero": "Homepage hero",
  "homepage.notice": "Homepage notice",
  "about.intro": "About intro",
  "about.education": "Education section",
  "about.experience": "Experience section",
  "about.focus": "Backend & AI focus",
};

function normalizeData(data: CmsAdminData): EditableCmsData {
  const sectionKeys = new Set(data.sections.map((section) => section.section_key));
  const assetKeys = new Set(data.assets.map((asset) => asset.asset_key));

  return {
    sections: [
      ...data.sections.map((section) => ({
        section_key: section.section_key,
        title: section.title ?? "",
        eyebrow: section.eyebrow ?? "",
        body: section.body ?? "",
        content: section.content ?? {},
        status: section.status,
        order_index: section.order_index,
      })),
      ...defaultSections.filter((section) => !sectionKeys.has(section.section_key)),
    ].sort((a, b) => a.order_index - b.order_index),
    assets: [
      ...data.assets.map((asset) => ({
        asset_key: asset.asset_key,
        title: asset.title,
        asset_type: asset.asset_type,
        file_url: asset.file_url,
        file_name: asset.file_name ?? "",
        file_type: asset.file_type ?? "",
        alt_text: asset.alt_text ?? "",
        metadata: asset.metadata ?? {},
        is_active: asset.is_active,
      })),
      ...defaultAssets.filter((asset) => !assetKeys.has(asset.asset_key)),
    ],
    socialLinks: data.socialLinks,
    skills: data.skills,
    contactChannels: data.contactChannels,
  };
}

function nextOrder<T extends { order_index: number }>(items: T[]) {
  return items.reduce((max, item) => Math.max(max, item.order_index), 0) + 10;
}

export default function AdminContentPage() {
  const [cmsData, setCmsData] = useState<EditableCmsData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const heroSection = useMemo(
    () => cmsData.sections.find((section) => section.section_key === "homepage.hero"),
    [cmsData.sections]
  );
  const profileAsset = useMemo(
    () => cmsData.assets.find((asset) => asset.asset_key === "profile.image"),
    [cmsData.assets]
  );
  const resumeAsset = useMemo(
    () => cmsData.assets.find((asset) => asset.asset_key === "resume.current"),
    [cmsData.assets]
  );

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cms");
      const data = await parseAdminApiResponse<CmsAdminData>(
        response,
        "Failed to load CMS content. Apply the CMS migration if this is the first run."
      );
      setCmsData(normalizeData(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CMS content");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsData),
      });
      const data = await parseAdminApiResponse<CmsAdminData>(
        response,
        "Failed to save CMS content"
      );
      setCmsData(normalizeData(data));
      setSuccess("Content saved successfully. Public pages are not wired to this CMS data yet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save CMS content");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (sectionKey: string, updates: Partial<EditableSection>) => {
    setCmsData((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.section_key === sectionKey ? { ...section, ...updates } : section
      ),
    }));
  };

  const updateSectionContent = (sectionKey: string, field: string, value: string) => {
    setCmsData((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.section_key === sectionKey
          ? { ...section, content: { ...section.content, [field]: value } }
          : section
      ),
    }));
  };

  const updateAsset = (assetKey: string, updates: Partial<EditableAsset>) => {
    setCmsData((current) => ({
      ...current,
      assets: current.assets.map((asset) =>
        asset.asset_key === assetKey ? { ...asset, ...updates } : asset
      ),
    }));
  };

  const uploadAsset = async (assetKey: string, file: File) => {
    const asset = cmsData.assets.find((item) => item.asset_key === assetKey);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", asset?.asset_type === "document" ? "resume" : "profile");

    setUploadingKey(assetKey);
    setError(null);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await parseAdminApiResponse<{ url: string }>(
        response,
        "Failed to upload asset"
      );
      updateAsset(assetKey, {
        file_url: result.url,
        file_name: file.name,
        file_type: file.type,
      });
      setSuccess("Asset uploaded. Save content to persist the managed asset record.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload asset");
    } finally {
      setUploadingKey(null);
    }
  };

  const addSocialLink = () => {
    setCmsData((current) => ({
      ...current,
      socialLinks: [
        ...current.socialLinks,
        {
          platform: "New platform",
          label: "New link",
          url: "https://example.com",
          icon: "",
          order_index: nextOrder(current.socialLinks),
          is_active: true,
        },
      ],
    }));
  };

  const addSkill = () => {
    setCmsData((current) => ({
      ...current,
      skills: [
        ...current.skills,
        {
          name: "New skill",
          category: "General",
          proficiency: "",
          order_index: nextOrder(current.skills),
          is_featured: false,
          is_active: true,
        },
      ],
    }));
  };

  const addContactChannel = () => {
    setCmsData((current) => ({
      ...current,
      contactChannels: [
        ...current.contactChannels,
        {
          channel_type: "email",
          label: "Email",
          value: "hello@example.com",
          url: "mailto:hello@example.com",
          order_index: nextOrder(current.contactChannels),
          is_active: true,
        },
      ],
    }));
  };

  if (loading) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">Loading CMS content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Content CMS
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Manage portfolio copy, reusable content sections, profile assets, resume files,
            social links, skills, and contact channels. Current public pages keep their
            existing hardcoded behavior until dynamic frontend integration is enabled.
          </p>
        </div>
        <button
          type="button"
          onClick={saveContent}
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent-light"
        >
          {saving ? "Saving..." : "Save CMS Content"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Editable Sections
          </h2>
          {cmsData.sections.map((section) => (
            <div
              key={section.section_key}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                    {contentSectionLabels[section.section_key] ?? section.section_key}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {section.section_key}
                  </p>
                </div>
                <select
                  value={section.status}
                  onChange={(event) => updateSection(section.section_key, { status: event.target.value as EditableSection["status"] })}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Title
                  <input
                    type="text"
                    value={section.title ?? ""}
                    onChange={(event) => updateSection(section.section_key, { title: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Eyebrow / label
                  <input
                    type="text"
                    value={section.eyebrow ?? ""}
                    onChange={(event) => updateSection(section.section_key, { eyebrow: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Body
                <textarea
                  value={section.body ?? ""}
                  onChange={(event) => updateSection(section.section_key, { body: event.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </label>

              {section.section_key === "homepage.hero" && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    ["secondaryBody", "Secondary paragraph"],
                    ["primaryCtaLabel", "Primary CTA label"],
                    ["primaryCtaHref", "Primary CTA href"],
                    ["secondaryCtaLabel", "Resume CTA label"],
                    ["contactCtaLabel", "Contact CTA label"],
                    ["contactCtaHref", "Contact CTA href"],
                  ].map(([field, label]) => (
                    <label key={field} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {label}
                      <input
                        type="text"
                        value={String(section.content[field] ?? "")}
                        onChange={(event) => updateSectionContent(section.section_key, field, event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Preview Snapshot
            </h2>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {heroSection?.eyebrow}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {heroSection?.title}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{heroSection?.body}</p>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {String(heroSection?.content.secondaryBody ?? "")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Managed Assets
            </h2>
            {[profileAsset, resumeAsset].filter(Boolean).map((asset) => (
              <div key={asset!.asset_key} className="mt-4 rounded-lg border border-slate-100 p-3 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{asset!.title}</p>
                <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">{asset!.file_url}</p>
                <input
                  type="file"
                  accept={asset!.asset_type === "document" ? "application/pdf" : "image/*"}
                  disabled={uploadingKey === asset!.asset_key}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      uploadAsset(asset!.asset_key, file);
                    }
                  }}
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-600 dark:bg-slate-700"
                />
                <label className="mt-3 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  URL
                  <input
                    type="text"
                    value={asset!.file_url}
                    onChange={(event) => updateAsset(asset!.asset_key, { file_url: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </label>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <RepeatableListCard
        title="Social / Media Links"
        description="Ordered links for future footer, contact, and hero integrations."
        onAdd={addSocialLink}
      >
        {cmsData.socialLinks.map((link, index) => (
          <div key={link.id ?? index} className="grid gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700 md:grid-cols-5">
            {(["platform", "label", "url", "icon"] as const).map((field) => (
              <input
                key={field}
                value={link[field] ?? ""}
                onChange={(event) =>
                  setCmsData((current) => ({
                    ...current,
                    socialLinks: current.socialLinks.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, [field]: event.target.value } : item
                    ),
                  }))
                }
                placeholder={field}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              />
            ))}
            <button
              type="button"
              onClick={() => setCmsData((current) => ({ ...current, socialLinks: current.socialLinks.filter((_, itemIndex) => itemIndex !== index) }))}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              Remove
            </button>
          </div>
        ))}
      </RepeatableListCard>

      <RepeatableListCard
        title="Skills / Technologies"
        description="Reusable taxonomy for future skills sections and project filtering."
        onAdd={addSkill}
      >
        {cmsData.skills.map((skill, index) => (
          <div key={skill.id ?? index} className="grid gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700 md:grid-cols-5">
            {(["name", "category", "proficiency"] as const).map((field) => (
              <input
                key={field}
                value={skill[field] ?? ""}
                onChange={(event) =>
                  setCmsData((current) => ({
                    ...current,
                    skills: current.skills.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, [field]: event.target.value } : item
                    ),
                  }))
                }
                placeholder={field}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              />
            ))}
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={skill.is_featured}
                onChange={(event) =>
                  setCmsData((current) => ({
                    ...current,
                    skills: current.skills.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, is_featured: event.target.checked } : item
                    ),
                  }))
                }
              />
              Featured
            </label>
            <button
              type="button"
              onClick={() => setCmsData((current) => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) }))}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              Remove
            </button>
          </div>
        ))}
      </RepeatableListCard>

      <RepeatableListCard
        title="Contact Channels"
        description="Structured contact details for future contact page and footer rendering."
        onAdd={addContactChannel}
      >
        {cmsData.contactChannels.map((channel, index) => (
          <div key={channel.id ?? index} className="grid gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700 md:grid-cols-5">
            {(["channel_type", "label", "value", "url"] as const).map((field) => (
              <input
                key={field}
                value={channel[field] ?? ""}
                onChange={(event) =>
                  setCmsData((current) => ({
                    ...current,
                    contactChannels: current.contactChannels.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, [field]: event.target.value } : item
                    ),
                  }))
                }
                placeholder={field}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
              />
            ))}
            <button
              type="button"
              onClick={() => setCmsData((current) => ({ ...current, contactChannels: current.contactChannels.filter((_, itemIndex) => itemIndex !== index) }))}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              Remove
            </button>
          </div>
        ))}
      </RepeatableListCard>
    </div>
  );
}

function RepeatableListCard({
  title,
  description,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Add item
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
